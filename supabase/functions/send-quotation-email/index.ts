import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getBranding, getEmailTemplate, getEmailButton, getAlertBox } from "../_shared/branding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quotationId } = await req.json();
    if (!quotationId) {
      return new Response(JSON.stringify({ error: "quotationId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    console.log("Fetching quotation data for ID:", quotationId);

    const branding = getBranding();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch quotation data
    const { data: quotation, error: quotationError } = await supabase
      .from("quotation_requests")
      .select("*")
      .eq("id", quotationId)
      .single();

    if (quotationError || !quotation) {
      throw new Error("Quotation not found");
    }

    // Fetch quotation items
    const { data: items, error: itemsError } = await supabase
      .from("quotation_request_items")
      .select("*")
      .eq("quotation_request_id", quotationId);

    if (itemsError) {
      throw new Error(`Error fetching items: ${itemsError.message}`);
    }

    if (!items || items.length === 0) {
      throw new Error("No items found for quotation");
    }

    console.log("Sending quotation email to:", quotation.customer_email);

    const quotationNumber = `QR-${String(quotation.id).slice(0, 8).toUpperCase()}`;

    // Check if this is an update
    const { data: revisions } = await supabase
      .from("quotation_revisions")
      .select("id")
      .eq("quotation_request_id", quotationId);

    const isUpdate = (revisions && revisions.length > 0);
    const hasSignificantDiscount = (quotation.discount_percentage ?? 0) >= 10 || (quotation.discount_amount ?? 0) >= 1000;

    const itemsHtml = items
      .map((item: any) => {
        const unitPrice = item.unit_price ?? 0;
        const discountPercentage = item.discount_percentage ?? 0;
        const finalPrice = item.final_price ?? 0;
        const hasPricing = unitPrice > 0;
        
        return `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textDark};">${item.product_name || 'N/A'}</td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; color: ${branding.colors.textMuted}; font-size: 13px;">${item.product_sku || 'N/A'}</td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; text-align: center; color: ${branding.colors.textDark};">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; text-align: right; color: ${branding.colors.textDark};">
              ${hasPricing ? `₹${unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '<em>Pending</em>'}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; text-align: right; color: ${branding.colors.success};">${discountPercentage}%</td>
            <td style="padding: 10px; border-bottom: 1px solid ${branding.colors.border}; text-align: right; color: ${branding.colors.textDark}; font-weight: 600;">
              ${hasPricing ? `₹${finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '<em>Pending</em>'}
            </td>
          </tr>
        `;
      })
      .join("");
    
    // Determine email type and content
    let subject = '';
    let headerText = '';
    let introAlert = '';
    
    if (isUpdate && hasSignificantDiscount) {
      subject = `🎉 Special Discount Applied - ${quotationNumber}`;
      headerText = 'Special Discount Applied!';
      introAlert = getAlertBox(`🎉 Great news! We've updated your quotation with a <strong>special discount of ${quotation.discount_percentage}%</strong>!`, 'success');
    } else if (isUpdate) {
      subject = `📝 Updated Quotation - ${quotationNumber}`;
      headerText = 'Your Quotation Has Been Updated';
      introAlert = getAlertBox('✨ We\'ve updated your quotation based on your requirements.', 'warning');
    } else {
      subject = `✅ Your Quotation is Ready - ${quotationNumber}`;
      headerText = 'Your Quotation is Ready';
      introAlert = '';
    }

    const content = `
      <p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 16px 0;">Dear ${quotation.customer_name},</p>
      
      ${introAlert || `<p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 20px 0;">Thank you for your quotation request. We're pleased to provide you with the following quote:</p>`}
      
      <div style="background: ${branding.colors.bgLight}; padding: 16px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 4px 0; color: ${branding.colors.textDark};"><strong>Quotation Number:</strong> ${quotationNumber}</p>
        ${quotation.expires_at ? `<p style="margin: 4px 0; color: ${branding.colors.textDark};"><strong>Valid Until:</strong> ${new Date(quotation.expires_at).toLocaleDateString()}</p>` : ""}
      </div>

      <h3 style="font-size: 16px; color: ${branding.colors.textDark}; margin: 28px 0 12px 0; font-weight: 600;">Quoted Items</h3>
      
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: ${branding.colors.bgLight};">
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid ${branding.colors.border}; font-size: 13px; color: ${branding.colors.textDark};">Product</th>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid ${branding.colors.border}; font-size: 13px; color: ${branding.colors.textDark};">SKU</th>
            <th style="padding: 10px; text-align: center; border-bottom: 2px solid ${branding.colors.border}; font-size: 13px; color: ${branding.colors.textDark};">Qty</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${branding.colors.border}; font-size: 13px; color: ${branding.colors.textDark};">Unit Price</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${branding.colors.border}; font-size: 13px; color: ${branding.colors.textDark};">Disc.</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid ${branding.colors.border}; font-size: 13px; color: ${branding.colors.textDark};">Final</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background: ${branding.colors.bgLight}; padding: 20px; border-radius: 6px; margin-top: 20px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 6px 0; color: ${branding.colors.textMuted};">Subtotal:</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: ${branding.colors.textDark};">₹${(quotation.total_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          ${(quotation.discount_percentage ?? 0) > 0 ? `
          <tr>
            <td style="padding: 6px 0; color: ${branding.colors.success};">Discount (${quotation.discount_percentage}%):</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: ${branding.colors.success};">-₹${(quotation.discount_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          ` : ""}
          <tr style="border-top: 2px solid ${branding.colors.border};">
            <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 700; color: ${branding.colors.textDark};">TOTAL:</td>
            <td style="padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: 700; color: ${branding.colors.primary};">₹${(quotation.final_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      ${quotation.quote_notes ? getAlertBox(`<strong>Notes from our team:</strong><br>${quotation.quote_notes}`, 'info') : ""}

      ${getEmailButton('View Quotation', `${branding.frontendUrl}/quotation/${quotationId}`)}

      ${quotation.is_final 
        ? getAlertBox('⚠️ <strong>Final Quotation:</strong> This quotation cannot be revised through the portal. For changes, please contact us directly.', 'warning')
        : `<p style="margin-top: 24px; font-size: 13px; color: ${branding.colors.textMuted};">If you have questions or would like to request a revision, please log in to your account.</p>`
      }
    `;

    const emailHtml = getEmailTemplate(content, headerText);

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
        subject: subject,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    // Log communication
    const messagePreview = `Your quotation is ready. Total: ₹${quotation.final_amount.toLocaleString('en-IN')}`;
    await supabase.from('customer_communications').insert({
      customer_id: quotation.customers?.id,
      user_id: quotation.user_id,
      communication_type: 'email',
      channel: 'quotation_status',
      subject: subject,
      message_preview: messagePreview,
      full_content: { recipient: quotation.customer_email },
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        quotation_id: quotationId,
        final_amount: quotation.final_amount,
        discount_percentage: quotation.discount_percentage,
        is_update: isUpdate,
        has_discount: hasSignificantDiscount,
        resend_id: emailResult.id
      }
    });

    return new Response(JSON.stringify(emailResult), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quotation-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
