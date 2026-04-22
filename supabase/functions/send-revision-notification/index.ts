import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RevisionNotificationRequest {
  adminEmail: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  quotationNumber: string;
  quotationId: string;
  revisionMessage: string;
  currentQuote: {
    totalAmount: number;
    finalAmount: number;
    itemCount: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: RevisionNotificationRequest = await req.json();
    console.log("Sending revision notification to admin:", data.adminEmail);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Schneidervfd.com <noreply@schneidervfd.com>",
        reply_to: "sales@gravenautomation.com",
        to: [data.adminEmail],
        subject: `Customer Requested Quote Revision - ${data.quotationNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Revision Requested</h1>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">A customer has requested a revision for their quotation.</p>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-weight: 600; color: #92400e;">Action Required</p>
                </div>

                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Customer:</strong> ${data.customerName}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
                  <p style="margin: 5px 0;"><strong>Quotation:</strong> ${data.quotationNumber}</p>
                </div>

                <h2 style="font-size: 18px; color: #1f2937; margin-top: 25px; margin-bottom: 10px;">Current Quote Summary</h2>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Items:</strong> ${data.currentQuote.itemCount}</p>
                  <p style="margin: 5px 0;"><strong>Original Total:</strong> ₹${data.currentQuote.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p style="margin: 5px 0;"><strong>Quoted Amount:</strong> ₹${data.currentQuote.finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <h2 style="font-size: 18px; color: #1f2937; margin-top: 25px; margin-bottom: 10px;">Customer's Revision Request</h2>
                <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 0; white-space: pre-wrap;">${data.revisionMessage}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${(Deno.env.get("FRONTEND_URL") || 'https://schneidervfd.com').replace(/\/+$/, '')}/admin/rfq/${data.quotationId}"
                     style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Review & Revise Quote
                  </a>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #4b5563;">
                  <p style="margin-bottom: 15px; font-weight: 600;">Contact Information:</p>
                  <p style="margin: 5px 0;">
                    📧 Email: <a href="mailto:sales@gravenautomation.com" style="color: #667eea; text-decoration: none;">sales@gravenautomation.com</a>
                  </p>
                  <p style="margin: 5px 0;">
                    📞 Phone: <a href="tel:+917905350134" style="color: #667eea; text-decoration: none;">+91 7905350134</a> | 
                    <a href="tel:+919919089567" style="color: #667eea; text-decoration: none;">+91 9919089567</a>
                  </p>
                  <p style="margin: 5px 0;">
                    💬 WhatsApp: 
                    <a href="https://wa.me/917905350134" style="color: #25D366; text-decoration: none;">+91 7905350134</a> | 
                    <a href="https://wa.me/919919089567" style="color: #25D366; text-decoration: none;">+91 9919089567</a>
                  </p>
                  <p style="margin: 15px 0 5px 0; font-size: 12px; color: #6b7280;">
                    7/25, Tower F, 2nd Floor, Kirti Nagar Industrial Area, Delhi - India - 110015
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Revision notification sent successfully:", emailResult);

    // Log communication
    await supabase.from('customer_communications').insert({
      user_id: data.customerId,
      communication_type: 'email',
      channel: 'revision',
      subject: `Revision Requested for Quotation ${data.quotationNumber}`,
      message_preview: `Customer ${data.customerName} requested revision: ${data.revisionMessage}`,
      full_content: {
        recipient: data.adminEmail,
        quotation_number: data.quotationNumber,
        reason: data.revisionMessage
      },
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        quotation_id: data.quotationId,
        quotation_number: data.quotationNumber,
        revision_message: data.revisionMessage,
        resend_id: emailResult.id
      }
    });

    return new Response(JSON.stringify(emailResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-revision-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
