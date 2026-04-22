import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getBranding, getEmailTemplate, getAlertBox } from '../_shared/branding.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = "sales@gravenautomation.com";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const branding = getBranding();
    const { callbackId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: callback, error: fetchError } = await supabase
      .from('callback_requests')
      .select('*')
      .eq('id', callbackId)
      .single();

    if (fetchError || !callback) {
      throw new Error('Callback request not found');
    }

    const formatReason = (reason: string | null) => {
      if (!reason) return 'Not specified';
      return reason.replace(/_/g, ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    // Customer email content
    const customerContent = `
      <p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 16px 0;">
        Dear <strong>${callback.customer_name}</strong>,
      </p>

      ${getAlertBox('✅ <strong>Callback Confirmed!</strong> Our sales team will call you within 2-5 minutes.', 'success')}

      <div style="background: ${branding.colors.bgLight}; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="color: ${branding.colors.textDark}; font-size: 16px; margin: 0 0 16px 0;">📋 Your Request Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textMuted};"><strong>Name:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textDark};">${callback.customer_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textMuted};"><strong>Phone:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textDark};">${callback.customer_phone}</td>
          </tr>
          ${callback.company_name ? `
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textMuted};"><strong>Company:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textDark};">${callback.company_name}</td>
          </tr>
          ` : ''}
          ${callback.reason ? `
          <tr>
            <td style="padding: 10px 0; color: ${branding.colors.textMuted};"><strong>Reason:</strong></td>
            <td style="padding: 10px 0; color: ${branding.colors.textDark};">${formatReason(callback.reason)}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      ${getAlertBox('📞 <strong>Please keep your phone nearby.</strong> Our team will be calling shortly.', 'warning')}

      <p style="color: ${branding.colors.textMuted}; font-size: 14px; margin: 24px 0;">
        If you have any immediate questions, feel free to call us directly at 
        <a href="tel:${branding.contact.phone1.replace(/\s/g, '')}" style="color: ${branding.colors.primary}; text-decoration: none;">${branding.contact.phone1}</a>.
      </p>
    `;

    const customerEmailHtml = getEmailTemplate(customerContent, 'Callback Request Confirmed!');

    // Admin email content (urgent styling)
    const adminEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: #dc2626; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚨 URGENT - CALL NOW</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Customer expects call in 2-5 minutes</p>
        </div>
        
        <div style="padding: 24px;">
          <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 14px; margin-bottom: 24px;">
            <p style="color: #991b1b; margin: 0; font-weight: 600;">🔥 Call customer NOW within 2-5 minutes!</p>
          </div>

          <div style="background: ${branding.colors.bgLight}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <h2 style="color: ${branding.colors.textDark}; font-size: 16px; margin: 0 0 16px 0;">👤 Customer Information</h2>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 8px 0; color: ${branding.colors.textMuted};"><strong>Name:</strong></td>
                <td style="padding: 8px 0; color: ${branding.colors.textDark}; font-weight: 600;">${callback.customer_name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${branding.colors.textMuted};"><strong>Phone:</strong></td>
                <td style="padding: 8px 0;">
                  <a href="tel:${callback.customer_phone}" style="color: #dc2626; text-decoration: none; font-weight: 700; font-size: 18px;">
                    📞 ${callback.customer_phone}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: ${branding.colors.textMuted};"><strong>Email:</strong></td>
                <td style="padding: 8px 0;"><a href="mailto:${callback.customer_email}" style="color: ${branding.colors.primary};">${callback.customer_email}</a></td>
              </tr>
              ${callback.company_name ? `
              <tr>
                <td style="padding: 8px 0; color: ${branding.colors.textMuted};"><strong>Company:</strong></td>
                <td style="padding: 8px 0; color: ${branding.colors.textDark};">${callback.company_name}</td>
              </tr>
              ` : ''}
              ${callback.reason ? `
              <tr>
                <td style="padding: 8px 0; color: ${branding.colors.textMuted};"><strong>Reason:</strong></td>
                <td style="padding: 8px 0; color: ${branding.colors.textDark};">${formatReason(callback.reason)}</td>
              </tr>
              ` : ''}
              ${callback.message ? `
              <tr>
                <td style="padding: 8px 0; color: ${branding.colors.textMuted};"><strong>Message:</strong></td>
                <td style="padding: 8px 0; color: ${branding.colors.textDark};">${callback.message}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="tel:${callback.customer_phone}" style="display: inline-block; background: #dc2626; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 16px;">
              🔥 CALL NOW - ${callback.customer_phone}
            </a>
          </div>
        </div>

        <div style="background: ${branding.colors.bgLight}; padding: 16px; text-align: center;">
          <p style="color: ${branding.colors.textMuted}; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} ${branding.companyName}
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    // Send customer email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: branding.email.from,
        reply_to: branding.email.replyTo,
        to: [callback.customer_email],
        subject: "We'll Call You Within 2-5 Minutes! - Callback Confirmed",
        html: customerEmailHtml,
      }),
    });

    // Send admin email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: branding.email.from,
        reply_to: branding.email.replyTo,
        to: [ADMIN_EMAIL],
        subject: `🚨 URGENT: Immediate Callback - ${callback.customer_name}`,
        html: adminEmailHtml,
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-callback-notification function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
