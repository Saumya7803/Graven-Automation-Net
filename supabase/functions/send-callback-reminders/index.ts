import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

interface CallbackRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name: string | null;
  scheduled_date_time: string;
  preferred_time_slot: string;
  reason: string | null;
  message: string | null;
  priority: string;
  location_page: string | null;
  admin_notes: string | null;
  created_at: string;
}

function formatScheduledDateTime(dateTime: string) {
  const dt = new Date(dateTime);
  return {
    date: dt.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: dt.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    dayOfWeek: dt.toLocaleDateString('en-IN', { weekday: 'long' })
  };
}

function formatTimeSlot(slot: string): string {
  const slots: Record<string, string> = {
    'morning': 'Morning (9 AM - 12 PM)',
    'afternoon': 'Afternoon (12 PM - 3 PM)',
    'evening': 'Evening (3 PM - 6 PM)',
    'any': 'Any Time'
  };
  return slots[slot] || slot;
}

function formatReason(reason: string | null): string {
  if (!reason) return 'General Inquiry';
  const reasons: Record<string, string> = {
    'product_inquiry': 'Product Inquiry',
    'technical_support': 'Technical Support',
    'pricing': 'Pricing Information',
    'installation': 'Installation Assistance',
    'general': 'General Inquiry'
  };
  return reasons[reason] || reason;
}

function getPriorityBadgeColor(priority: string): string {
  const colors: Record<string, string> = {
    'urgent': '#dc2626',
    'high': '#ea580c',
    'normal': '#0891b2',
    'low': '#65a30d'
  };
  return colors[priority] || '#6b7280';
}

function generateCustomerReminderEmail(callback: CallbackRequest): string {
  const { date, dayOfWeek } = formatScheduledDateTime(callback.scheduled_date_time);
  const requestId = callback.id.substring(0, 8).toUpperCase();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Callback Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">⏰</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Callback Reminder</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your scheduled call is tomorrow</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">
        Hi <strong>${callback.customer_name}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 30px 0;">
        This is a friendly reminder that your callback with <strong>Schneidervfd.com</strong> is scheduled for tomorrow.
      </p>

      <!-- Appointment Details -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📅 Appointment Details</h2>
        
        <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 15px; margin-bottom: 12px;">
          <div style="color: #e0e7ff; font-size: 13px; margin-bottom: 5px;">DATE</div>
          <div style="color: #ffffff; font-size: 18px; font-weight: 600;">${dayOfWeek}, ${date}</div>
        </div>
        
        <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 15px; margin-bottom: 12px;">
          <div style="color: #e0e7ff; font-size: 13px; margin-bottom: 5px;">TIME SLOT</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: 600;">${formatTimeSlot(callback.preferred_time_slot)}</div>
        </div>
        
        <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 15px; margin-bottom: 12px;">
          <div style="color: #e0e7ff; font-size: 13px; margin-bottom: 5px;">REQUEST ID</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: 500; font-family: monospace;">CB-${requestId}</div>
        </div>
        
        <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 15px;">
          <div style="color: #e0e7ff; font-size: 13px; margin-bottom: 5px;">REASON</div>
          <div style="color: #ffffff; font-size: 16px; font-weight: 500;">${formatReason(callback.reason)}</div>
        </div>
      </div>

      <!-- Preparation Tips -->
      <div style="background-color: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 To Make the Most of Your Call:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
          <li>Please keep your phone nearby during the scheduled time</li>
          <li>Have any questions or requirements ready</li>
          <li>If you need product information, we'll have it ready</li>
          <li>The call typically takes 15-20 minutes</li>
        </ul>
      </div>

      <!-- Reschedule Section -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Need to Reschedule?</h3>
        <p style="color: #78350f; margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
          Can't make it? No problem! Please let us know at least 2 hours before the scheduled time.
        </p>
        <div style="margin-top: 15px;">
          <p style="color: #78350f; margin: 5px 0; font-size: 14px;">
            📞 <strong>Call:</strong> <a href="tel:+917905350134" style="color: #92400e; text-decoration: none;">+91 7905350134</a> / <a href="tel:+919919089567" style="color: #92400e; text-decoration: none;">+91 9919089567</a>
          </p>
          <p style="color: #78350f; margin: 5px 0; font-size: 14px;">
            ✉️ <strong>Email:</strong> <a href="mailto:sales@gravenautomation.com" style="color: #92400e; text-decoration: none;">sales@gravenautomation.com</a>
          </p>
          <p style="color: #78350f; margin: 5px 0; font-size: 14px;">
            💬 <strong>WhatsApp:</strong> <a href="https://wa.me/917905350134" style="color: #92400e; text-decoration: none;">+91 7905350134</a>
          </p>
        </div>
      </div>

      <!-- Contact Info -->
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📞 Contact Information</h3>
        <p style="color: #4b5563; margin: 5px 0; font-size: 14px; line-height: 1.6;">
          <strong>Phone:</strong> +91 7905350134, +91 9919089567<br>
          <strong>Email:</strong> sales@gravenautomation.com<br>
          <strong>Address:</strong> Schneidervfd.com, 7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - 110015
        </p>
      </div>

      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 20px 0; text-align: center; font-weight: 600;">
        Looking forward to speaking with you! 🎯
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 30px; text-align: center;">
      <p style="color: #9ca3af; margin: 0; font-size: 14px; line-height: 1.6;">
        <strong style="color: #ffffff;">Schneidervfd.com</strong><br>
        Leading provider of Variable Frequency Drives<br>
        7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - 110015
      </p>
      <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 12px;">
        This is an automated reminder for your scheduled callback.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateAdminReminderEmail(callback: CallbackRequest): string {
  const { date, time, dayOfWeek } = formatScheduledDateTime(callback.scheduled_date_time);
  const requestId = callback.id.substring(0, 8).toUpperCase();
  const priorityColor = getPriorityBadgeColor(callback.priority);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Callback Reminder - Admin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px 20px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 10px;">📞</div>
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Upcoming Callback Tomorrow</h1>
      <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 15px;">⏰ In ~24 hours</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
        <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600;">
          ⚠️ You have a scheduled callback tomorrow. Please review the details and prepare for the call.
        </p>
      </div>

      <!-- Priority Badge -->
      <div style="text-align: center; margin-bottom: 25px;">
        <span style="display: inline-block; background-color: ${priorityColor}; color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600; text-transform: uppercase;">
          ${callback.priority} Priority
        </span>
      </div>

      <!-- Customer Quick Info Banner -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">👤 Customer Information</h2>
        <div style="color: #ffffff; font-size: 15px; line-height: 1.8;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${callback.customer_name}${callback.company_name ? ` (${callback.company_name})` : ''}</p>
          <p style="margin: 8px 0;">
            <strong>Phone:</strong> 
            <a href="tel:${callback.customer_phone}" style="color: #fef3c7; text-decoration: none; font-weight: 600;">
              ${callback.customer_phone} 📱
            </a>
          </p>
          <p style="margin: 8px 0;">
            <strong>Email:</strong> 
            <a href="mailto:${callback.customer_email}" style="color: #fef3c7; text-decoration: none;">
              ${callback.customer_email}
            </a>
          </p>
        </div>
      </div>

      <!-- Call Details -->
      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Call Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; width: 180px; vertical-align: top;"><strong>Scheduled Date & Time:</strong></td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${dayOfWeek}, ${date} at ${time}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Request ID:</strong></td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px; font-family: monospace;">CB-${requestId}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Original Request Date:</strong></td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px;">${new Date(callback.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; vertical-align: top;"><strong>Time Slot Preference:</strong></td>
            <td style="padding: 10px 0; color: #1f2937; font-size: 14px;">${formatTimeSlot(callback.preferred_time_slot)}</td>
          </tr>
        </table>
      </div>

      <!-- Request Context -->
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
        <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">💼 Request Context</h2>
        <p style="color: #1e3a8a; margin: 0 0 10px 0; font-size: 14px;">
          <strong>Reason:</strong> 
          <span style="background-color: #dbeafe; padding: 4px 12px; border-radius: 12px; display: inline-block; margin-left: 5px;">
            ${formatReason(callback.reason)}
          </span>
        </p>
        ${callback.message ? `
        <p style="color: #1e3a8a; margin: 10px 0 0 0; font-size: 14px;"><strong>Customer Message:</strong></p>
        <div style="background-color: #ffffff; border-left: 3px solid #3b82f6; padding: 12px; margin-top: 8px; border-radius: 4px;">
          <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.6; font-style: italic;">
            "${callback.message}"
          </p>
        </div>
        ` : ''}
        ${callback.location_page ? `
        <p style="color: #1e3a8a; margin: 10px 0 0 0; font-size: 14px;">
          <strong>Source:</strong> Location Page - ${callback.location_page}
        </p>
        ` : ''}
      </div>

      <!-- Preparation Checklist -->
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
        <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">✅ Before the Call:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #166534; line-height: 2;">
          <li>Review customer's request and message</li>
          <li>Prepare relevant product information</li>
          <li>Check product availability and pricing</li>
          <li>Have technical specs ready if needed</li>
          <li>Review previous interactions (if any)</li>
        </ul>
      </div>

      ${callback.admin_notes ? `
      <!-- Admin Notes -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
        <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📝 Previous Notes:</h3>
        <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">${callback.admin_notes}</p>
      </div>
      ` : ''}

      <!-- Quick Actions -->
      <div style="text-align: center; margin: 30px 0;">
        <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Quick Actions</h3>
        <div style="display: inline-block;">
          <a href="tel:${callback.customer_phone}" style="display: inline-block; background-color: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px; font-size: 14px;">
            📞 Call Customer Now
          </a>
          <a href="mailto:${callback.customer_email}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 5px; font-size: 14px;">
            ✉️ Send Email
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 20px; text-align: center;">
      <p style="color: #9ca3af; margin: 0; font-size: 13px;">
        This is an automated reminder from Schneidervfd.com Admin System
      </p>
      <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
        Please respond within 24 hours to maintain service quality
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`[Callback Reminders] Starting check at ${new Date().toISOString()}`);

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const isManualTrigger = body.manual === true;
    const specificCallbackIds = body.callbackIds as string[] | undefined;

    // Only send reminders for scheduled callbacks (not immediate ones)
    let query = supabase
      .from('callback_requests')
      .select('*')
      .eq('status', 'pending')
      .not('scheduled_date_time', 'is', null) // Skip immediate callbacks
      .not('preferred_date', 'is', null) // Additional check for scheduled callbacks
      .is('reminder_sent_at', null);

    // If specific callback IDs provided (manual send)
    if (specificCallbackIds && specificCallbackIds.length > 0) {
      query = query.in('id', specificCallbackIds);
    } else {
      // Find callbacks scheduled in next 24 hours (±1 hour buffer)
      const now = new Date();
      const minTime = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const maxTime = new Date(now.getTime() + 25 * 60 * 60 * 1000);
      
      query = query
        .gte('scheduled_date_time', minTime.toISOString())
        .lte('scheduled_date_time', maxTime.toISOString());
    }

    const { data: callbacks, error: queryError } = await query;

    if (queryError) {
      console.error('[Callback Reminders] Query error:', queryError);
      throw queryError;
    }

    console.log(`[Callback Reminders] Found ${callbacks?.length || 0} callbacks needing reminders`);

    if (!callbacks || callbacks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reminders_sent: 0,
          message: 'No callbacks need reminders at this time'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const results = [];
    const errors = [];

    // Process each callback
    for (const callback of callbacks) {
      console.log(`[Callback Reminders] Processing callback ${callback.id} for ${callback.customer_name}`);

      try {
        // Send customer reminder email
        const customerEmailHtml = generateCustomerReminderEmail(callback);
        const customerEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Schneidervfd.com <noreply@schneidervfd.com>",
            reply_to: "sales@gravenautomation.com",
            to: [callback.customer_email],
            subject: `⏰ Reminder: Your callback is scheduled for tomorrow - ${formatScheduledDateTime(callback.scheduled_date_time).date}`,
            html: customerEmailHtml
          }),
        });

        const customerResult = await customerEmailResponse.json();
        
        if (!customerEmailResponse.ok) {
          throw new Error(`Customer email failed: ${JSON.stringify(customerResult)}`);
        }

        console.log(`[Callback Reminders] Customer reminder sent: ${customerResult.id}`);

        // Send admin reminder email
        const adminEmailHtml = generateAdminReminderEmail(callback);
        const adminEmailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Schneidervfd.com <noreply@schneidervfd.com>",
            reply_to: callback.customer_email,
            to: ["sales@gravenautomation.com"],
            subject: `📞 Callback Reminder: ${callback.customer_name} scheduled for tomorrow at ${formatScheduledDateTime(callback.scheduled_date_time).time}`,
            html: adminEmailHtml
          }),
        });

        const adminResult = await adminEmailResponse.json();
        
        if (!adminEmailResponse.ok) {
          throw new Error(`Admin email failed: ${JSON.stringify(adminResult)}`);
        }

        console.log(`[Callback Reminders] Admin reminder sent: ${adminResult.id}`);

        // Update reminder_sent_at timestamp
        const { error: updateError } = await supabase
          .from('callback_requests')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', callback.id);

        if (updateError) {
          console.error(`[Callback Reminders] Failed to update reminder timestamp:`, updateError);
          throw updateError;
        }

        results.push({
          callback_id: callback.id,
          customer_name: callback.customer_name,
          scheduled_time: callback.scheduled_date_time,
          customer_email_sent: true,
          admin_email_sent: true,
          customer_email_id: customerResult.id,
          admin_email_id: adminResult.id
        });

      } catch (error: any) {
        console.error(`[Callback Reminders] Error processing callback ${callback.id}:`, error);
        errors.push({
          callback_id: callback.id,
          customer_name: callback.customer_name,
          error: error.message
        });
      }
    }

    console.log(`[Callback Reminders] Completed: ${results.length} sent, ${errors.length} failed`);

    return new Response(
      JSON.stringify({
        success: errors.length === 0,
        reminders_sent: results.length,
        callbacks_processed: results,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error: any) {
    console.error('[Callback Reminders] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
