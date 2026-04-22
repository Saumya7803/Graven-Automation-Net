import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getBranding } from "../_shared/branding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function replacePlaceholders(template: string, data: Record<string, any>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), String(value || ""));
  }
  return result;
}

function formatProductList(products: any[]): string {
  if (!products || products.length === 0) return "";
  
  let html = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
  html += '<thead><tr style="background-color: #f8f9fa;"><th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product</th><th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th></tr></thead><tbody>';
  
  for (const product of products) {
    html += `<tr style="border-bottom: 1px solid #dee2e6;">
      <td style="padding: 10px;">
        <div style="display: flex; align-items: center;">
          ${product.product_image ? `<img src="${product.product_image}" alt="${product.product_name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : ""}
          <div>
            <strong>${product.product_name}</strong>
            ${product.product_sku ? `<br><small style="color: #666;">SKU: ${product.product_sku}</small>` : ""}
          </div>
        </div>
      </td>
      <td style="padding: 10px; text-align: right;">₹${product.product_price?.toLocaleString("en-IN") || "Quote"}</td>
    </tr>`;
  }
  
  html += "</tbody></table>";
  return html;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reminderId, templateId, customSubject, customMessage } = await req.json();

    if (!reminderId) {
      return new Response(
        JSON.stringify({ error: "Missing reminderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const branding = getBranding();
    const frontendUrl = branding.frontendUrl;

    // Get reminder
    const { data: reminder, error: reminderError } = await supabase
      .from("procurement_list_reminders")
      .select("*")
      .eq("id", reminderId)
      .single();

    if (reminderError || !reminder) {
      return new Response(
        JSON.stringify({ error: "Reminder not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get customer info
    const { data: customer } = await supabase
      .from("customers")
      .select("full_name, email")
      .eq("user_id", reminder.user_id)
      .single();

    if (!customer?.email) {
      return new Response(
        JSON.stringify({ error: "Customer email not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get template if provided
    let template = null;
    if (templateId) {
      const { data } = await supabase
        .from("procurement_recovery_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      template = data;
    }

    const recoveryLink = `${frontendUrl}/procurement-recovery/${reminder.recovery_token}`;
    const productList = formatProductList(reminder.list_snapshot || []);

    const placeholderData = {
      customer_name: customer.full_name || "Valued Customer",
      company_name: branding.companyName,
      item_count: reminder.item_count,
      list_value: reminder.list_value?.toLocaleString("en-IN"),
      recovery_link: recoveryLink,
      product_list: productList,
    };

    // Determine subject and body
    let subject = customSubject || template?.email_subject || "Your Procurement List at Schneidervfd.com";
    let html = customMessage || template?.email_html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${branding.colors.primary};">Your Procurement List</h2>
        <p>Hi {{customer_name}},</p>
        <p>You have {{item_count}} products saved in your procurement list.</p>
        {{product_list}}
        <div style="margin: 20px 0;">
          <a href="{{recovery_link}}" style="background-color: ${branding.colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Your List</a>
        </div>
      </div>
    `;

    subject = replacePlaceholders(subject, placeholderData);
    html = replacePlaceholders(html, placeholderData);

    // Send email
    const emailResponse = await resend.emails.send({
      from: branding.email.from,
      reply_to: branding.email.replyTo,
      to: [customer.email],
      subject,
      html,
    });

    console.log("Manual recovery email sent:", emailResponse);

    // Log interaction
    await supabase.from("procurement_recovery_interactions").insert({
      reminder_id: reminderId,
      user_id: reminder.user_id,
      interaction_type: "manual_email_sent",
      template_id: templateId || null,
      metadata: { manual: true, sent_to: customer.email },
    });

    // Update template stats if used
    if (templateId && template) {
      await supabase
        .from("procurement_recovery_templates")
        .update({ times_sent: (template.times_sent || 0) + 1 })
        .eq("id", templateId);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending manual recovery email:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});