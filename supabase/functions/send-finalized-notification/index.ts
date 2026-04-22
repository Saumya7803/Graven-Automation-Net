import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FinalizedNotificationRequest {
  adminEmail: string;
  customerName: string;
  customerEmail: string;
  customerId: string;
  quotationNumber: string;
  quotationId: string;
  finalAmount: number;
  itemCount: number;
}

const isValidFinalizedRequest = (data: Partial<FinalizedNotificationRequest>) => {
  return Boolean(
    data.adminEmail &&
      data.customerName &&
      data.customerEmail &&
      data.customerId &&
      data.quotationNumber &&
      data.quotationId &&
      typeof data.finalAmount === "number" &&
      typeof data.itemCount === "number"
  );
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: FinalizedNotificationRequest = await req.json();
    if (!isValidFinalizedRequest(data)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    console.log("Sending finalized notification to admin:", data.adminEmail);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Send email using Resend API
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
        subject: `Customer Finalized Quotation - ${data.quotationNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">✅ Quote Accepted!</h1>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; margin-bottom: 20px;">Great news! A customer has accepted their quotation and is ready to order.</p>
                
                <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-weight: 600; color: #065f46;">Customer is ready to place an order</p>
                </div>

                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Customer:</strong> ${data.customerName}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
                  <p style="margin: 5px 0;"><strong>Quotation:</strong> ${data.quotationNumber}</p>
                </div>

                <h2 style="font-size: 18px; color: #1f2937; margin-top: 25px; margin-bottom: 10px;">Quote Details</h2>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Items:</strong> ${data.itemCount}</p>
                  <p style="margin: 5px 0; font-size: 18px; color: #059669;"><strong>Final Amount:</strong> ₹${data.finalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${(Deno.env.get("FRONTEND_URL") || 'https://schneidervfd.com').replace(/\/+$/, '')}/admin/quotation/${data.quotationId}"
                     style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    View Quote Details
                  </a>
                </div>

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
                  <p>The customer can now proceed to checkout and complete their order.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const emailResult = await emailResponse.json();

    console.log("Finalized notification sent successfully:", emailResult);

    // Log communication to customer
    await supabase.from('customer_communications').insert({
      user_id: data.customerId,
      communication_type: 'email',
      channel: 'finalized',
      subject: `Customer Finalized Quotation - ${data.quotationNumber}`,
      message_preview: `Customer ${data.customerName} accepted quotation ${data.quotationNumber}`,
      full_content: {
        recipient: data.adminEmail,
        quotation_number: data.quotationNumber
      },
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        quotation_id: data.quotationId,
        quotation_number: data.quotationNumber,
        final_amount: data.finalAmount,
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
    console.error("Error in send-finalized-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
