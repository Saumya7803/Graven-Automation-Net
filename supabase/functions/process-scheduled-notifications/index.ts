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

    console.log('Processing scheduled notifications...');

    // Get notifications due to be sent
    const { data: scheduledNotifications, error: fetchError } = await supabase
      .from('scheduled_push_notifications')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      console.log('No scheduled notifications to process');
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No notifications due' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${scheduledNotifications.length} notifications to process`);

    const results = [];

    for (const scheduled of scheduledNotifications) {
      try {
        // Update status to 'sending'
        await supabase
          .from('scheduled_push_notifications')
          .update({ status: 'sending', updated_at: new Date().toISOString() })
          .eq('id', scheduled.id);

        // Prepare notification object
        const notification = {
          title: scheduled.title,
          body: scheduled.body,
          icon: scheduled.icon,
          badge: scheduled.badge,
          data: scheduled.action_url ? { url: scheduled.action_url } : undefined,
        };

        // Call send-bulk-push-notification
        const { data: sendResult, error: sendError } = await supabase.functions.invoke(
          'send-bulk-push-notification',
          {
            body: {
              notification,
              targetType: scheduled.target_type,
              targetValue: scheduled.target_value,
              notificationType: scheduled.notification_type,
            },
          }
        );

        if (sendError) throw sendError;

        // Update status to 'sent'
        await supabase
          .from('scheduled_push_notifications')
          .update({
            status: 'sent',
            total_targeted: sendResult.summary?.targeted || 0,
            total_sent: sendResult.summary?.sent || 0,
            total_failed: sendResult.summary?.failed || 0,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduled.id);

        results.push({ id: scheduled.id, success: true, summary: sendResult.summary });
        console.log(`Successfully sent scheduled notification ${scheduled.id}`);

      } catch (error: any) {
        console.error(`Failed to send scheduled notification ${scheduled.id}:`, error);

        await supabase
          .from('scheduled_push_notifications')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error',
            updated_at: new Date().toISOString(),
          })
          .eq('id', scheduled.id);

        results.push({ id: scheduled.id, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: scheduledNotifications.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in process-scheduled-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
