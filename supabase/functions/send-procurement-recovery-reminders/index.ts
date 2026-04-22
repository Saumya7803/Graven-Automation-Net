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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const branding = getBranding();
    const frontendUrl = branding.frontendUrl;

    // Get active reminders that are due for a message
    const { data: reminders, error: remindersError } = await supabase
      .from("procurement_list_reminders")
      .select("*")
      .eq("status", "active");

    if (remindersError) throw remindersError;

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ message: "No active reminders", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all templates
    const { data: templates, error: templatesError } = await supabase
      .from("procurement_recovery_templates")
      .select("*")
      .eq("is_active", true)
      .order("stage_number", { ascending: true });

    if (templatesError) throw templatesError;

    let sent = 0;
    let skipped = 0;

    for (const reminder of reminders) {
      const daysSinceActivity = Math.floor(
        (Date.now() - new Date(reminder.last_activity_at || reminder.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine which stage we should be at
      let targetStage = 0;
      if (daysSinceActivity >= 14 && !reminder.third_reminder_sent_at) {
        targetStage = 3;
      } else if (daysSinceActivity >= 7 && !reminder.second_reminder_sent_at) {
        targetStage = 2;
      } else if (daysSinceActivity >= 3 && !reminder.first_reminder_sent_at) {
        targetStage = 1;
      }

      if (targetStage === 0) {
        skipped++;
        continue;
      }

      // Find appropriate template
      const template = templates?.find(
        (t) => t.stage_number === targetStage && reminder.list_value >= (t.min_list_value || 0)
      );

      if (!template) {
        console.log(`No template found for stage ${targetStage}`);
        skipped++;
        continue;
      }

      // Get customer info
      const { data: customer } = await supabase
        .from("customers")
        .select("full_name, email")
        .eq("user_id", reminder.user_id)
        .single();

      if (!customer?.email) {
        console.log(`No customer email for user ${reminder.user_id}`);
        skipped++;
        continue;
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

      // Send email
      if (template.email_subject && template.email_html) {
        const subject = replacePlaceholders(template.email_subject, placeholderData);
        const html = replacePlaceholders(template.email_html, placeholderData);

        try {
          await resend.emails.send({
            from: branding.email.from,
            reply_to: branding.email.replyTo,
            to: [customer.email],
            subject,
            html,
          });

          console.log(`Sent email to ${customer.email} for reminder ${reminder.id}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${customer.email}:`, emailError);
        }
      }

      // Send push notification
      if (template.push_title && template.push_body) {
        const pushTitle = replacePlaceholders(template.push_title, placeholderData);
        const pushBody = replacePlaceholders(template.push_body, placeholderData);

        try {
          await supabase.functions.invoke("send-push-notification", {
            body: {
              userId: reminder.user_id,
              title: pushTitle,
              body: pushBody,
              data: { url: recoveryLink },
            },
          });
        } catch (pushError) {
          console.error(`Failed to send push notification:`, pushError);
        }
      }

      // Update reminder
      const updateData: Record<string, any> = {
        sequence_stage: targetStage,
        updated_at: new Date().toISOString(),
      };

      if (targetStage === 1) updateData.first_reminder_sent_at = new Date().toISOString();
      if (targetStage === 2) updateData.second_reminder_sent_at = new Date().toISOString();
      if (targetStage === 3) updateData.third_reminder_sent_at = new Date().toISOString();

      await supabase.from("procurement_list_reminders").update(updateData).eq("id", reminder.id);

      // Update template stats
      await supabase
        .from("procurement_recovery_templates")
        .update({ times_sent: (template.times_sent || 0) + 1 })
        .eq("id", template.id);

      // Log interaction
      await supabase.from("procurement_recovery_interactions").insert({
        reminder_id: reminder.id,
        user_id: reminder.user_id,
        interaction_type: "email_sent",
        template_id: template.id,
        metadata: { stage: targetStage },
      });

      sent++;
    }

    return new Response(
      JSON.stringify({ message: "Reminders processed", sent, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-procurement-recovery-reminders:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});