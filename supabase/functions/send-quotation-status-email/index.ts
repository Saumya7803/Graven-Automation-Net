import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getBranding, getEmailTemplate, getEmailButton, getAlertBox } from '../_shared/branding.ts';

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

    const branding = getBranding();
    const { quotationId, status, previousStatus } = await req.json();

    console.log('Sending quotation status email:', { quotationId, status, previousStatus });

    const { data: quotation, error: quotationError } = await supabase
      .from('quotation_requests')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (quotationError) throw quotationError;

    let subject = '';
    let title = '';
    let contentBody = '';

    const greeting = `<p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 16px 0;">Hi ${quotation.customer_name},</p>`;

    switch (status) {
      case 'pending':
        subject = `⏳ Your Quotation Request is Pending`;
        title = 'Request Received';
        contentBody = `
          ${greeting}
          ${getAlertBox('Your quotation request has been received and is pending review.', 'info')}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">We'll notify you as soon as we begin the review process.</p>
          <div style="background: ${branding.colors.bgLight}; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 4px 0; color: ${branding.colors.textDark};"><strong>Submitted on:</strong> ${new Date(quotation.created_at).toLocaleDateString()}</p>
          </div>
        `;
        break;

      case 'reviewing':
        subject = `👀 We're Reviewing Your Quotation Request`;
        title = 'Under Review';
        contentBody = `
          ${greeting}
          ${getAlertBox('Our team is currently reviewing your quotation request.', 'info')}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">We'll get back to you with a detailed quotation soon.</p>
        `;
        break;

      case 'closed':
        subject = `📋 Quotation Request Closed`;
        title = 'Request Closed';
        contentBody = `
          ${greeting}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">Your quotation request has been closed.</p>
          ${quotation.admin_notes ? getAlertBox(`<strong>Note:</strong> ${quotation.admin_notes}`, 'info') : ''}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">If you have any questions or would like to submit a new request, please contact us.</p>
        `;
        break;

      case 'revision_requested':
        subject = `🔄 Quotation Revision Requested`;
        title = 'Revision Requested';
        contentBody = `
          ${greeting}
          ${getAlertBox('You\'ve requested a revision to your quotation. Our team will review it soon.', 'warning')}
        `;
        break;

      case 'revised':
        subject = `✏️ Your Quotation Has Been Revised`;
        title = 'Quotation Revised';
        contentBody = `
          ${greeting}
          ${getAlertBox('Based on your feedback, we\'ve revised your quotation.', 'success')}
          ${quotation.quote_notes ? `<p style="color: ${branding.colors.textMuted}; font-size: 15px;"><strong>Update Notes:</strong> ${quotation.quote_notes}</p>` : ''}
          ${quotation.final_amount ? `<p style="color: ${branding.colors.textDark}; font-size: 18px; font-weight: 600; margin: 20px 0;"><strong>Revised Amount:</strong> <span style="color: ${branding.colors.primary};">₹${quotation.final_amount.toLocaleString('en-IN')}</span></p>` : ''}
        `;
        break;

      case 'finalized':
        subject = `✅ Quotation Finalized`;
        title = 'Quotation Finalized';
        contentBody = `
          ${greeting}
          ${getAlertBox('🎉 Great news! Your quotation has been finalized and is ready for your approval.', 'success')}
          ${quotation.final_amount ? `<p style="color: ${branding.colors.textDark}; font-size: 20px; font-weight: 700; margin: 20px 0;"><strong>Final Amount:</strong> <span style="color: ${branding.colors.primary};">₹${quotation.final_amount.toLocaleString('en-IN')}</span></p>` : ''}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">You can now proceed to checkout from your quotations page.</p>
        `;
        break;

      case 'quoted':
        subject = `💰 Your Quotation is Ready`;
        title = 'Quotation Ready';
        contentBody = `
          ${greeting}
          ${getAlertBox('We\'ve prepared a detailed quotation based on your requirements.', 'success')}
          ${quotation.final_amount ? `<p style="color: ${branding.colors.textDark}; font-size: 20px; font-weight: 700; margin: 20px 0;"><strong>Quoted Amount:</strong> <span style="color: ${branding.colors.primary};">₹${quotation.final_amount.toLocaleString('en-IN')}</span></p>` : ''}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">Please review and let us know if you have any questions.</p>
        `;
        break;

      case 'converted_to_order':
        let orderNumber = '';
        if (quotation.order_id) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('order_number')
            .eq('id', quotation.order_id)
            .single();
          if (orderData) orderNumber = orderData.order_number;
        }
        
        subject = `🎉 Quotation Converted to Order`;
        title = 'Order Created!';
        contentBody = `
          ${greeting}
          ${getAlertBox('🎉 Excellent! Your quotation has been successfully converted to an order.', 'success')}
          ${orderNumber ? `<p style="color: ${branding.colors.textDark}; font-size: 18px; font-weight: 600; margin: 20px 0;"><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
          <p style="color: ${branding.colors.textMuted}; font-size: 15px;">You'll receive a separate order confirmation email shortly. Thank you for your business!</p>
        `;
        break;

      default:
        console.log('No email template for status:', status);
        return new Response(
          JSON.stringify({ message: 'No email template for this status', status }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const fullContent = `
      ${contentBody}
      ${getEmailButton('View Your Quotations', `${branding.frontendUrl}/my-quotations`)}
    `;

    const emailHtml = getEmailTemplate(fullContent, title);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: branding.email.from,
        reply_to: branding.email.replyTo,
        to: [quotation.customer_email],
        subject,
        html: emailHtml
      })
    });

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    // Log communication
    await supabase.from('customer_communications').insert({
      customer_id: quotation.customers?.id,
      user_id: quotation.user_id,
      communication_type: 'email',
      channel: 'quotation_status',
      subject: subject,
      message_preview: `Quotation status: ${status}`,
      full_content: { recipient: quotation.customer_email },
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        quotation_id: quotationId,
        status: status,
        previous_status: previousStatus,
        resend_id: emailResult.id
      }
    });

    return new Response(
      JSON.stringify({ success: true, result: emailResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-quotation-status-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
