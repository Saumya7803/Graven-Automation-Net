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
    const { orderId, status } = await req.json();

    console.log('Notifying order status change:', { orderId, status });

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, customers(*)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Prepare notification based on status
    const notifications: Record<string, any> = {
      confirmed: {
        title: '✅ Order Confirmed!',
        body: `Your order #${order.order_number} has been confirmed and is being prepared.`,
        icon: '/icon-192.png',
        tag: `order-${orderId}`,
        data: { url: `/orders/${orderId}`, orderId, type: 'order-confirmed' }
      },
      shipped: {
        title: '🚚 Order Shipped!',
        body: `Your order #${order.order_number} is on its way to you!`,
        icon: '/icon-192.png',
        tag: `order-${orderId}`,
        data: { url: `/orders/${orderId}`, orderId, type: 'order-shipped' }
      },
      delivered: {
        title: '📦 Order Delivered!',
        body: `Your order #${order.order_number} has been delivered. Enjoy!`,
        icon: '/icon-192.png',
        tag: `order-${orderId}`,
        data: { url: `/orders/${orderId}`, orderId, type: 'order-delivered' }
      },
      cancelled: {
        title: '❌ Order Cancelled',
        body: `Your order #${order.order_number} has been cancelled.`,
        icon: '/icon-192.png',
        tag: `order-${orderId}`,
        data: { url: `/orders/${orderId}`, orderId, type: 'order-cancelled' }
      }
    };

    const notification = notifications[status];
    if (!notification) {
      console.log('No notification configured for status:', status);
      return new Response(
        JSON.stringify({ message: 'No notification for this status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send push notification
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: { userId: order.user_id, notification, notificationType: `order_${status}` }
    });

    if (error) {
      console.error('Error calling send-push-notification:', error);
    }

    // Email content based on status
    const emailSubjects: Record<string, string> = {
      confirmed: `✅ Order Confirmed - #${order.order_number}`,
      processing: `⚙️ Order Processing - #${order.order_number}`,
      shipped: `🚚 Order Shipped - #${order.order_number}`,
      delivered: `📦 Order Delivered - #${order.order_number}`,
      cancelled: `❌ Order Cancelled - #${order.order_number}`
    };

    const emailTitles: Record<string, string> = {
      confirmed: 'Your Order Has Been Confirmed!',
      processing: 'Your Order Is Being Prepared',
      shipped: 'Your Order Is On The Way!',
      delivered: 'Your Order Has Been Delivered!',
      cancelled: 'Order Cancelled'
    };

    const getEmailContent = (status: string): string => {
      const greeting = `<p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 0 0 16px 0;">Hi ${order.customers.full_name},</p>`;
      
      switch (status) {
        case 'confirmed':
          return `
            ${greeting}
            ${getAlertBox('<strong>Order Confirmed</strong> - Your order has been confirmed and is being prepared.', 'success')}
            <p style="color: ${branding.colors.textMuted}; font-size: 15px; margin: 20px 0;">
              <strong>Order Total:</strong> ₹${order.total_amount.toFixed(2)}
            </p>
            <p style="color: ${branding.colors.textMuted}; font-size: 15px;">We'll notify you once your order is shipped.</p>
          `;
        case 'processing':
          return `
            ${greeting}
            ${getAlertBox('⚙️ Your order is now being processed by our team.', 'info')}
            <p style="color: ${branding.colors.textMuted}; font-size: 15px;">We're working hard to get it ready for shipment!</p>
          `;
        case 'shipped':
          const trackingInfo = order.tracking_number ? `
            <div style="background: ${branding.colors.bgLight}; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px 0; color: ${branding.colors.textDark}; font-size: 15px;">📦 Tracking Information</h3>
              <p style="margin: 6px 0; color: ${branding.colors.textMuted}; font-size: 14px;"><strong>Tracking Number:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; color: ${branding.colors.primary};">${order.tracking_number}</code></p>
              ${order.carrier ? `<p style="margin: 6px 0; color: ${branding.colors.textMuted}; font-size: 14px;"><strong>Carrier:</strong> ${order.carrier.toUpperCase()}</p>` : ''}
              ${order.estimated_delivery_date ? `<p style="margin: 6px 0; color: ${branding.colors.textMuted}; font-size: 14px;"><strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>` : ''}
            </div>
          ` : '';
          return `
            ${greeting}
            ${getAlertBox('🚚 Exciting news! Your order has been shipped and is on its way to you.', 'success')}
            ${trackingInfo}
          `;
        case 'delivered':
          return `
            ${greeting}
            ${getAlertBox('📦 Your order has been successfully delivered!', 'success')}
            <p style="color: ${branding.colors.textMuted}; font-size: 15px;">We hope you enjoy your purchase! If you have any questions, please don't hesitate to contact us.</p>
          `;
        case 'cancelled':
          return `
            ${greeting}
            ${getAlertBox('Your order has been cancelled.', 'warning')}
            <p style="color: ${branding.colors.textMuted}; font-size: 15px;">If you have any questions about this cancellation, please contact our support team.</p>
          `;
        default:
          return greeting;
      }
    };

    const subject = emailSubjects[status];
    const emailContent = getEmailContent(status);

    if (subject && emailContent) {
      try {
        const fullContent = `
          ${emailContent}
          ${getEmailButton('View Order Details', `${branding.frontendUrl}/orders/${orderId}`)}
        `;

        const emailHtml = getEmailTemplate(fullContent, emailTitles[status] || 'Order Update');

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: branding.email.from,
            reply_to: branding.email.replyTo,
            to: [order.customers.email],
            subject,
            html: emailHtml
          })
        });

        const emailResult = await emailResponse.json();
        console.log('Email sent successfully:', emailResult);

        // Log communication
        await supabase.from('customer_communications').insert({
          customer_id: order.customer_id,
          user_id: order.user_id,
          communication_type: 'email',
          channel: 'order_status',
          subject: subject,
          message_preview: `Order ${order.order_number} - ${status}`,
          full_content: { html: emailContent, recipient: order.customers.email },
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: {
            order_id: orderId,
            order_number: order.order_number,
            status: status,
            resend_id: emailResult.id
          }
        });
      } catch (emailError: any) {
        console.error('Error sending email:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, push: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in notify-order-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
