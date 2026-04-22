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
    const { notificationId, action, timestamp } = await req.json();
    if (!notificationId || !action || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: notificationId, action, timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Resolve user from notification log so service worker requests (anon key) can still be tracked.
    const { data: notificationLog } = await supabase
      .from('notification_logs')
      .select('id, user_id')
      .eq('id', notificationId)
      .maybeSingle();

    if (!notificationLog) {
      console.log('Notification not found:', notificationId);
      return new Response(
        JSON.stringify({ success: false, message: 'Notification not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record interaction
    const interactionData: any = {
      notification_log_id: notificationId,
      user_id: notificationLog.user_id,
      action_taken: action,
    };

    if (action === 'click') {
      interactionData.clicked_at = timestamp;
    } else if (action === 'dismiss') {
      interactionData.dismissed_at = timestamp;
    } else if (action === 'display') {
      interactionData.displayed_at = timestamp;
    }

    // Get device info from user agent
    const userAgent = req.headers.get('user-agent') || '';
    interactionData.device_type = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 'desktop';
    interactionData.browser = userAgent.split(' ').pop() || 'unknown';

    const { error: insertError } = await supabase
      .from('notification_interactions')
      .insert(interactionData);

    if (insertError) throw insertError;

    // Also update the notification_logs clicked_at if it's a click
    if (action === 'click') {
      await supabase
        .from('notification_logs')
        .update({ clicked_at: timestamp })
        .eq('id', notificationId);
    }

    console.log('Tracked interaction:', { notificationId, action, user: notificationLog.user_id });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error tracking interaction:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
