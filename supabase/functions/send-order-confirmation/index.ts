import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { getBranding, getEmailTemplate, getEmailButton, getAlertBox } from "../_shared/branding.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId }: OrderConfirmationRequest = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const branding = getBranding();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        customer:customers(full_name, email, company_name),
        order_items:order_items(
          product_name,
          product_sku,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error("Order not found");
    }

    // Build order items HTML
    const itemsHtml = order.order_items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid ${branding.colors.border};">
            <strong style="color: ${branding.colors.textDark};">${item.product_name}</strong><br>
            <span style="color: ${branding.colors.textMuted}; font-size: 13px;">SKU: ${item.product_sku}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid ${branding.colors.border}; text-align: center; color: ${branding.colors.textDark};">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${branding.colors.border}; text-align: right; color: ${branding.colors.textDark};">₹${Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding: 12px; border-bottom: 1px solid ${branding.colors.border}; text-align: right; color: ${branding.colors.textDark}; font-weight: 600;">₹${Number(item.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `
      )
      .join("");

    const shippingAddress = order.shipping_address;
    const addressHtml = `
      ${shippingAddress.street}<br>
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br>
      ${shippingAddress.country}
    `;

    const content = `
      <p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 8px 0;">Order #${order.order_number}</p>
      
      ${getAlertBox('<strong>Order Confirmed</strong> - We\'ve received your order and will process it shortly.', 'success')}

      <h3 style="color: ${branding.colors.textDark}; font-size: 16px; margin: 28px 0 12px 0; font-weight: 600;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: ${branding.colors.bgLight};">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid ${branding.colors.border}; color: ${branding.colors.textDark}; font-size: 13px;">Product</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid ${branding.colors.border}; color: ${branding.colors.textDark}; font-size: 13px;">Qty</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid ${branding.colors.border}; color: ${branding.colors.textDark}; font-size: 13px;">Price</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid ${branding.colors.border}; color: ${branding.colors.textDark}; font-size: 13px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background-color: ${branding.colors.bgLight}; padding: 20px; margin: 24px 0; border-radius: 8px;">
        <table style="width: 100%;">
          <tr>
            <td style="padding: 6px 0; color: ${branding.colors.textMuted}; font-size: 14px;">Subtotal:</td>
            <td style="padding: 6px 0; text-align: right; color: ${branding.colors.textDark}; font-size: 14px;">₹${Number(order.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${branding.colors.textMuted}; font-size: 14px;">Tax (GST):</td>
            <td style="padding: 6px 0; text-align: right; color: ${branding.colors.textDark}; font-size: 14px;">₹${Number(order.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: ${branding.colors.textMuted}; font-size: 14px;">Shipping:</td>
            <td style="padding: 6px 0; text-align: right; color: ${branding.colors.textDark}; font-size: 14px;">₹${Number(order.shipping_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr style="border-top: 2px solid ${branding.colors.border};">
            <td style="padding: 12px 0 0 0; font-size: 18px; font-weight: 700; color: ${branding.colors.textDark};">Total:</td>
            <td style="padding: 12px 0 0 0; text-align: right; font-size: 18px; font-weight: 700; color: ${branding.colors.primary};">₹${Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: ${branding.colors.textDark}; font-size: 16px; margin: 28px 0 12px 0; font-weight: 600;">Shipping Address</h3>
      <div style="color: ${branding.colors.textMuted}; line-height: 1.8; font-size: 14px;">
        ${addressHtml}
      </div>

      ${getEmailButton('View Order Details', `${branding.frontendUrl}/orders/${orderId}`)}
    `;

    const emailHtml = getEmailTemplate(content, 'Thank You for Your Order!');

    // Send email using Resend API
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: branding.email.from,
        reply_to: branding.email.replyTo,
        to: [order.customer.email],
        subject: `Order Confirmation - ${order.order_number}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    console.log("Order confirmation email sent:", emailResult);

    // Log communication
    const messagePreview = `Order ${order.order_number} confirmed. Total: ₹${order.total_amount.toLocaleString('en-IN')}`;
    await supabase.from('customer_communications').insert({
      customer_id: order.customer_id,
      user_id: order.user_id,
      communication_type: 'email',
      channel: 'order_confirmation',
      subject: `Order Confirmation - ${order.order_number}`,
      message_preview: messagePreview,
      full_content: { recipient: order.customer.email },
      status: 'sent',
      sent_at: new Date().toISOString(),
      metadata: {
        order_id: orderId,
        order_number: order.order_number,
        total_amount: order.total_amount,
        resend_id: emailResult.id
      }
    });

    return new Response(JSON.stringify({ success: true, emailResult }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
