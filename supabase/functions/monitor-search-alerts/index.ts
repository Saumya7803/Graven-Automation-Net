import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertConfig {
  id: string;
  alert_type: string;
  threshold_count: number;
  time_window_hours: number;
  is_enabled: boolean;
  notification_methods: string[];
  recipient_emails: string[];
  check_frequency_minutes: number;
  cooldown_hours: number;
}

interface ZeroResultQuery {
  id: string;
  search_query: string;
  zero_results_count: number;
  search_count: number;
  last_searched_at: string;
}

interface AdminUser {
  user_id: string;
  push_subscriptions: any[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

    console.log('Starting search alerts monitoring...');

    // Get alert configuration
    const { data: configData, error: configError } = await supabase
      .from('search_alert_config')
      .select('*')
      .eq('alert_type', 'zero_results')
      .eq('is_enabled', true)
      .single();

    if (configError || !configData) {
      console.log('No active alert configuration found');
      return new Response(
        JSON.stringify({ message: 'No active alert configuration' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const config: AlertConfig = configData;
    console.log('Alert config:', { threshold: config.threshold_count, window: config.time_window_hours });

    // Calculate time threshold
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - config.time_window_hours);

    // Get queries exceeding threshold
    const { data: problemQueries, error: queriesError } = await supabase
      .from('search_analytics')
      .select('*')
      .gte('zero_results_count', config.threshold_count)
      .gte('last_searched_at', timeThreshold.toISOString())
      .order('zero_results_count', { ascending: false });

    if (queriesError) {
      throw new Error(`Error fetching queries: ${queriesError.message}`);
    }

    if (!problemQueries || problemQueries.length === 0) {
      console.log('No queries exceeding threshold');
      return new Response(
        JSON.stringify({ message: 'No alerts triggered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${problemQueries.length} queries exceeding threshold`);

    // Filter out queries already alerted within cooldown period
    const cooldownThreshold = new Date();
    cooldownThreshold.setHours(cooldownThreshold.getHours() - config.cooldown_hours);

    const newAlerts: ZeroResultQuery[] = [];
    
    for (const query of problemQueries) {
      const { data: recentAlert } = await supabase
        .from('search_alert_history')
        .select('*')
        .eq('search_query', query.search_query)
        .gte('notification_sent_at', cooldownThreshold.toISOString())
        .single();

      if (!recentAlert) {
        newAlerts.push(query);
      }
    }

    if (newAlerts.length === 0) {
      console.log('All queries already alerted within cooldown period');
      return new Response(
        JSON.stringify({ message: 'No new alerts (cooldown period)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`${newAlerts.length} new alerts to send`);

    // Calculate priority scores
    const alertsWithPriority = newAlerts.map(query => ({
      ...query,
      priority_score: (query.zero_results_count * 2) + query.search_count,
      priority_level: getPriorityLevel((query.zero_results_count * 2) + query.search_count)
    }));

    // Sort by priority
    alertsWithPriority.sort((a, b) => b.priority_score - a.priority_score);

    // Get top 10 for notification
    const topAlerts = alertsWithPriority.slice(0, 10);

    // Send push notifications if enabled
    if (config.notification_methods.includes('push')) {
      await sendPushNotifications(supabase, topAlerts, config);
    }

    // Send email if enabled
    if (config.notification_methods.includes('email') && config.recipient_emails?.length > 0) {
      await sendEmailAlert(resend, topAlerts, config);
    }

    // Log alerts to history
    const alertHistoryRecords = topAlerts.map(query => ({
      search_query: query.search_query,
      alert_type: 'zero_results',
      zero_results_count: query.zero_results_count,
      threshold_exceeded: query.zero_results_count - config.threshold_count,
      priority_score: query.priority_score,
      notification_methods: config.notification_methods,
      recipients: config.recipient_emails,
      acknowledged: false
    }));

    const { error: historyError } = await supabase
      .from('search_alert_history')
      .insert(alertHistoryRecords);

    if (historyError) {
      console.error('Error logging alert history:', historyError);
    }

    console.log(`Successfully sent ${topAlerts.length} alerts`);

    return new Response(
      JSON.stringify({ 
        message: 'Alerts sent successfully',
        alerts_count: topAlerts.length,
        top_query: topAlerts[0]?.search_query 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in monitor-search-alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

function getPriorityLevel(score: number): string {
  if (score >= 20) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

function getPriorityEmoji(level: string): string {
  switch (level) {
    case 'Critical': return '🔴';
    case 'High': return '🟠';
    case 'Medium': return '🟡';
    default: return '🟢';
  }
}

async function sendPushNotifications(
  supabase: any,
  alerts: any[],
  config: AlertConfig
) {
  console.log('Sending push notifications...');

  // Get all admin users
  const { data: adminUsers, error: adminError } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (adminError || !adminUsers || adminUsers.length === 0) {
    console.log('No admin users found');
    return;
  }

  const topAlert = alerts[0];
  const title = alerts.length === 1
    ? `🚨 Product Gap: "${topAlert.search_query}"`
    : `🚨 ${alerts.length} Product Gaps Detected`;
  
  const body = alerts.length === 1
    ? `${topAlert.zero_results_count} failed searches - ${topAlert.priority_level} priority`
    : `Top: "${topAlert.search_query}" (${topAlert.zero_results_count} attempts)`;

  // Send to each admin
  for (const admin of adminUsers) {
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: admin.user_id,
          notification: {
            title,
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: {
              type: 'zero_results_alert',
              url: '/admin/analytics/search?filter=zero-results',
              queries: alerts.slice(0, 5).map(a => a.search_query)
            }
          },
          notificationType: 'admin-announcement'
        }
      });
      console.log(`Sent push notification to admin: ${admin.user_id}`);
    } catch (error) {
      console.error(`Failed to send push to admin ${admin.user_id}:`, error);
    }
  }
}

async function sendEmailAlert(
  resend: any,
  alerts: any[],
  config: AlertConfig
) {
  console.log('Sending email alerts...');

  const topAlert = alerts[0];
  const subject = `🚨 Zero-Result Search Alert - ${alerts.length} ${alerts.length === 1 ? 'Query Needs' : 'Queries Need'} Attention`;

  const queriesTable = alerts.map((alert, index) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: left;">${index + 1}</td>
      <td style="padding: 12px; text-align: left; font-weight: 500;">${alert.search_query}</td>
      <td style="padding: 12px; text-align: center;">${alert.zero_results_count}</td>
      <td style="padding: 12px; text-align: center;">${getPriorityEmoji(alert.priority_level)} ${alert.priority_level}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Product Gap Alert</h1>
        </div>
        
        <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <p style="margin: 0; font-weight: 600; color: #991b1b;">HIGH PRIORITY - Product Catalog Gap Detected</p>
          </div>

          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px;">Summary Statistics</h3>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
              <li><strong>Total Zero-Result Queries:</strong> ${alerts.length}</li>
              <li><strong>Top Priority Query:</strong> "${topAlert.search_query}" (${topAlert.zero_results_count} attempts)</li>
              <li><strong>Time Window:</strong> Last ${config.time_window_hours} hours</li>
              <li><strong>Alert Threshold:</strong> ${config.threshold_count} failed searches</li>
            </ul>
          </div>

          <h3 style="color: #374151; margin: 0 0 16px 0; font-size: 18px;">Top Queries Requiring Attention</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">#</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Query</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Attempts</th>
                <th style="padding: 12px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb;">Priority</th>
              </tr>
            </thead>
            <tbody>
              ${queriesTable}
            </tbody>
          </table>

          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">✅ Recommended Actions</h4>
            <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
              <li>Add missing products to your catalog</li>
              <li>Review product descriptions and keywords</li>
              <li>Create content around these search terms</li>
              <li>Update SEO metadata to improve discoverability</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px 0;">
            <a href="${(Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, '')}/admin/analytics/search?filter=zero-results" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 12px;">
              View Full Report
            </a>
            <a href="${(Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, '')}/admin/settings?tab=alerts" 
               style="display: inline-block; background: #6b7280; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Alert Settings
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            This is an automated alert from your Search Analytics system.<br>
            Alerts are sent when queries exceed ${config.threshold_count} zero-result attempts within ${config.time_window_hours} hours.
          </p>
        </div>
      </body>
    </html>
  `;

  for (const email of config.recipient_emails) {
    try {
      await resend.emails.send({
        from: 'Schneidervfd.com <noreply@schneidervfd.com>',
        reply_to: 'sales@gravenautomation.com',
        to: [email],
        subject,
        html
      });
      console.log(`Email sent to: ${email}`);
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error);
    }
  }
}

serve(handler);