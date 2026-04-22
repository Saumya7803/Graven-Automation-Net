import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  quotationId: string;
  customerEmail: string;
  customerName: string;
  missingFields: string[];
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quotationId, customerEmail, customerName, missingFields, userId }: RequestBody = await req.json();

    console.log("📧 Sending profile completion reminder:", { quotationId, customerEmail, missingFields });

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch quotation details
    const { data: quotation, error: quotationError } = await supabase
      .from("quotation_requests")
      .select("id, created_at, status")
      .eq("id", quotationId)
      .single();

    if (quotationError || !quotation) {
      console.error("❌ Quotation not found:", quotationError);
      throw new Error("Quotation not found");
    }

    // Fetch customer record
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, user_id")
      .eq("email", customerEmail)
      .single();

    if (customerError) {
      console.error("⚠️ Customer not found:", customerError);
    }

    const frontendUrl = (Deno.env.get("FRONTEND_URL") || "https://schneidervfd.com").replace(/\/+$/, '');
    const profileUrl = `${frontendUrl}/profile?tab=profile`;

    // Build missing fields list HTML
    const missingFieldsHtml = missingFields
      .map(field => `<li style="margin: 8px 0; color: #f59e0b; font-size: 14px;">• ${field}</li>`)
      .join("");

    // Email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Profile Completion Required</h1>
                      <p style="margin: 8px 0 0 0; color: #e9d5ff; font-size: 14px;">Just a few more details needed</p>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
                        Dear <strong>${customerName}</strong>,
                      </p>
                      
                      <div style="background-color: #f3f4f6; border-left: 4px solid #8B5CF6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #4b5563; font-size: 14px;">
                          <strong>Regarding:</strong> Your Quotation Request
                        </p>
                      </div>
                      
                      <p style="margin: 16px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                        We're working on finalizing your quotation, but we need a few more details to generate a complete PDF with all legal and shipping information.
                      </p>
                      
                      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 20px; margin: 24px 0;">
                        <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">Missing Information:</h3>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                          ${missingFieldsHtml}
                        </ul>
                      </div>
                      
                      <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                        <h4 style="margin: 0 0 8px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Why This Matters:</h4>
                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                          Your quotation PDF requires these details to include proper tax calculations, legal compliance information, and accurate shipping details. Completing your profile ensures you receive a comprehensive, ready-to-use quotation document.
                        </p>
                      </div>
                      
                      <table role="presentation" style="width: 100%; margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${profileUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                              Complete My Profile Now
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 13px; text-align: center; font-style: italic;">
                        This will only take 2 minutes, and you'll be able to download your complete quotation PDF immediately after.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-align: center;">
                        Questions? Reply to this email or contact us at:
                      </p>
                      <p style="margin: 0; color: #8B5CF6; font-size: 13px; text-align: center; font-weight: 600;">
                        info@gravenautomation.com | +91 9919089567
                      </p>
                      <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} Graven Automation Private Limited. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "PowerFlow Automation Hub <noreply@lovable.app>",
      to: [customerEmail],
      subject: "🔔 Complete Your Profile - Required for Quotation PDF",
      html: emailHtml,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    // Log communication in customer_communications table
    if (customer?.id) {
      const { error: logError } = await supabase
        .from("customer_communications")
        .insert({
          customer_id: customer.id,
          user_id: customer.user_id,
          communication_type: "email",
          channel: "quotation_status",
          subject: "Complete Your Profile - Required for Quotation PDF",
          message_preview: `Please complete your profile (missing: ${missingFields.join(", ")}) to receive complete quotation PDF`,
          full_content: {
            recipient: customerEmail,
            missing_fields: missingFields,
            quotation_id: quotationId,
          },
          metadata: {
            quotation_id: quotationId,
            missing_fields_count: missingFields.length,
            missing_fields: missingFields,
          },
          sent_by: userId,
          status: "sent",
        });

      if (logError) {
        console.error("⚠️ Failed to log communication:", logError);
      } else {
        console.log("✅ Communication logged successfully");
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Error sending profile completion reminder:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
