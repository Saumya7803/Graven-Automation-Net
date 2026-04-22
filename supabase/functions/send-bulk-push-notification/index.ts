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

    const { notification, targetType, targetValue, notificationType, scheduledAt } = await req.json();

    // If scheduledAt is provided, store in database instead of sending
    if (scheduledAt) {
      const scheduledTime = new Date(scheduledAt);
      const now = new Date();
      
      if (scheduledTime <= now) {
        return new Response(
          JSON.stringify({ error: 'Scheduled time must be in the future' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('scheduled_push_notifications')
        .insert({
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon-192.png',
          badge: notification.badge || '/icon-192.png',
          action_url: notification.data?.url,
          target_type: targetType,
          target_value: targetValue,
          notification_type: notificationType,
          scheduled_at: scheduledAt,
          status: 'scheduled'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({
          success: true,
          scheduled: true,
          scheduledNotification: data,
          message: `Notification scheduled for ${scheduledTime.toLocaleString()}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending bulk push notification:', { targetType, targetValue, notificationType });

    // Validate inputs
    if (!notification?.title || !notification?.body) {
      throw new Error('Notification title and body are required');
    }

    if (!['all', 'tier', 'specific'].includes(targetType)) {
      throw new Error('Invalid target type');
    }

    // Get target user IDs based on target type
    let targetUserIds: string[] = [];

    if (targetType === 'all') {
      // Get all users with active push subscriptions
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('user_id')
        .eq('is_active', true);

      if (error) throw error;

      // Deduplicate user IDs
      targetUserIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
      
      console.log(`Target: All users - Found ${targetUserIds.length} users with push enabled`);
    } else if (targetType === 'tier') {
      if (!targetValue) {
        throw new Error('Tier value is required for tier targeting');
      }

      // Get all customers
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('user_id, total_spent, total_orders, created_at');

      if (customerError) throw customerError;

      // Calculate tier for each customer and filter
      const tieredCustomers = customers?.filter(customer => {
        const tier = calculateCustomerTier(
          customer.total_spent || 0,
          customer.total_orders || 0,
          customer.created_at
        );
        return tier === targetValue;
      }) || [];

      const tierUserIds = tieredCustomers.map(c => c.user_id);

      // Get users with active push subscriptions from this tier
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('user_id')
        .in('user_id', tierUserIds)
        .eq('is_active', true);

      if (error) throw error;

      targetUserIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
      
      console.log(`Target: ${targetValue} tier - Found ${targetUserIds.length} users`);
    } else if (targetType === 'specific') {
      // For specific user targeting (future enhancement)
      if (!targetValue) {
        throw new Error('User ID is required for specific targeting');
      }
      targetUserIds = Array.isArray(targetValue) ? targetValue : [targetValue];
    }

    if (targetUserIds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          summary: { targeted: 0, sent: 0, failed: 0 },
          message: 'No users found with active push subscriptions for the selected target' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit to prevent abuse (max 1000 per request)
    if (targetUserIds.length > 1000) {
      targetUserIds = targetUserIds.slice(0, 1000);
      console.log('Limited to 1000 users per batch');
    }

    // Send notifications to each user
    const results = {
      sent: 0,
      failed: 0,
    };

    // Process in smaller batches to avoid timeouts
    const batchSize = 10;
    for (let i = 0; i < targetUserIds.length; i += batchSize) {
      const batch = targetUserIds.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (userId) => {
          try {
            const { error } = await supabase.functions.invoke('send-push-notification', {
              body: {
                userId,
                notification,
                notificationType: notificationType || 'admin-announcement',
              },
            });

            if (error) {
              console.error(`Failed to send to user ${userId}:`, error);
              results.failed++;
            } else {
              results.sent++;
            }
          } catch (error) {
            console.error(`Error sending to user ${userId}:`, error);
            results.failed++;
          }
        })
      );
    }

    console.log('Bulk notification complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          targeted: targetUserIds.length,
          sent: results.sent,
          failed: results.failed,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-bulk-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to calculate customer tier (copied from client-side utils)
function calculateCustomerTier(
  totalSpent: number,
  totalOrders: number,
  createdAt: string
): 'vip' | 'regular' | 'new' {
  if (totalSpent >= 100000 || totalOrders >= 10) {
    return 'vip';
  }
  
  if (totalSpent >= 20000 || totalOrders >= 5) {
    return 'regular';
  }
  
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  if (accountAge < thirtyDaysInMs) {
    return 'new';
  }
  
  return 'regular';
}
