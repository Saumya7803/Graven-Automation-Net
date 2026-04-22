import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, notification, notificationType } = await req.json();

    if (!userId || !notificationType || !notification?.title || !notification?.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, notificationType, notification.title, notification.body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending push notification:', { userId, notificationType });

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active push subscriptions found for user:', userId);
      return new Response(
        JSON.stringify({ message: 'No active push subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Check if user wants this type of notification
    const prefKey = notificationType.replace(/-/g, '_');
    if (preferences && preferences[prefKey] === false) {
      console.log('User has disabled this notification type:', notificationType);
      return new Response(
        JSON.stringify({ message: 'User has disabled this notification type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Send to all user's devices
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        // Use Web Push protocol via web-push-deno
        const webPush = await import('https://deno.land/x/web_push@0.2.1/mod.ts');
        
        const vapidDetails = {
          subject: Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@yourapp.com',
          publicKey: Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
          privateKey: Deno.env.get('VAPID_PRIVATE_KEY') ?? '',
        };

        await webPush.sendNotification(
          pushSubscription,
          JSON.stringify(notification),
          {
            vapidDetails
          }
        );

        results.push({ device: subscription.device_name, status: 'sent' });

        // Log successful notification
        const { data: logEntry } = await supabase.from('notification_logs').insert({
          user_id: userId,
          notification_type: notificationType,
          title: notification.title,
          body: notification.body,
          data: notification.data,
          status: 'sent'
        }).select().single();

        // Update notification with log ID for tracking
        if (logEntry) {
          notification.data = {
            ...notification.data,
            notificationId: logEntry.id
          };
        }

        console.log('Notification sent to device:', subscription.device_name);

      } catch (error: any) {
        console.error('Error sending to device:', subscription.device_name, error);
        
        // If subscription is invalid (410 Gone), deactivate it
        if (error.statusCode === 410 || error.status === 410) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('id', subscription.id);
          
          console.log('Deactivated invalid subscription for device:', subscription.device_name);
        }

        results.push({ 
          device: subscription.device_name, 
          status: 'failed',
          error: error.message 
        });

        // Log failed notification
        await supabase.from('notification_logs').insert({
          user_id: userId,
          notification_type: notificationType,
          title: notification.title,
          body: notification.body,
          status: 'failed',
          error_message: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
