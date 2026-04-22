import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DocumentNotificationRequest {
  orderId: string;
  documentTypes: ('tax_invoice' | 'eway_bill')[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, documentTypes }: DocumentNotificationRequest = await req.json();

    if (!orderId || !documentTypes || documentTypes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order ID and document types are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details with customer information
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(full_name, email, company_name)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    if (!order.customer?.email) {
      throw new Error("Customer email not found");
    }

    // Build document list HTML
    const documentNames = {
      tax_invoice: "Tax Invoice",
      eway_bill: "E-way Bill"
    };

    const documentsHtml = documentTypes
      .map(type => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #10b981; font-size: 18px; margin-right: 8px;">✓</span>
            <strong>${documentNames[type]}</strong>
          </td>
        </tr>
      `)
      .join("");

    const documentList = documentTypes.map(type => documentNames[type]).join(" and ");

    // Build order page URL
    const frontendUrl = (Deno.env.get("FRONTEND_URL") || "https://schneidervfd.com").replace(/\/+$/, '');
    const orderPageUrl = `${frontendUrl}/orders/${orderId}`;

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Schneidervfd.com <noreply@schneidervfd.com>",
        reply_to: "sales@gravenautomation.com",
        to: [order.customer.email],
        subject: `📄 Order Documents Available - ${order.order_number}`,
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #111827; margin: 0 0 10px 0;">📄 Your Order Documents are Ready!</h1>
                <p style="color: #6b7280; margin: 0;">Order #${order.order_number}</p>
              </div>

              <!-- Success Banner -->
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #065f46; font-size: 16px;">
                  <strong>Documents Available</strong> - Your ${documentList} ${documentTypes.length > 1 ? 'are' : 'is'} now ready for download.
                </p>
              </div>

              <!-- Available Documents -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #111827; font-size: 18px; margin-bottom: 16px;">Available Documents</h2>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                  <tbody>
                    ${documentsHtml}
                  </tbody>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${orderPageUrl}" style="display: inline-block; background-color: #009530; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View & Download Documents
                </a>
              </div>

              <!-- Order Information -->
              <div style="background-color: #f9fafb; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                <h3 style="color: #111827; font-size: 16px; margin-top: 0; margin-bottom: 12px;">Order Information</h3>
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Order Number:</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600;">${order.order_number}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Status:</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600; text-transform: capitalize;">${order.status}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Total Amount:</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600;">₹${Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                </table>
              </div>

              <!-- Instructions -->
              <div style="margin-bottom: 30px; padding: 16px; background-color: #eff6ff; border-radius: 8px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  💡 <strong>How to access your documents:</strong><br>
                  Click the button above to visit your order page where you can view and download all available documents.
                </p>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #4b5563; font-size: 14px;">
                <p style="margin-bottom: 15px; font-weight: 600;">For any questions about your order, contact us:</p>
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
                <p style="margin-top: 20px; text-align: center; font-size: 12px;">&copy; ${new Date().getFullYear()} Schneidervfd.com. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(`Failed to send email: ${emailResult.message || 'Unknown error'}`);
    }

    console.log("Order documents notification email sent:", emailResult);

    // Log communication
    const messagePreview = `${documentList} available for order ${order.order_number}`;
    await supabase.from('customer_communications').insert({
      customer_id: order.customer_id,
      user_id: order.user_id,
      communication_type: 'email',
      channel: 'order_documents',
      subject: `📄 Order Documents Available - ${order.order_number}`,
      message_preview: messagePreview,
      full_content: {
        recipient: order.customer.email,
        document_types: documentTypes
      },
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        order_id: orderId,
        order_number: order.order_number,
        document_types: documentTypes,
        resend_id: emailResult.id
      }
    });

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-documents-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
