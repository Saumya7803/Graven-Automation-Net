import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

function generateDiscountCode(prefix: string, userId: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomSuffix}`;
}

function formatCartItems(cartSnapshot: any): string {
  if (!cartSnapshot || !cartSnapshot.items || !Array.isArray(cartSnapshot.items)) {
    return '<p>Your cart items are waiting for you!</p>';
  }
  
  let html = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
  html += '<thead><tr style="border-bottom: 2px solid #ddd;">';
  html += '<th style="text-align: left; padding: 10px;">Product</th>';
  html += '<th style="text-align: center; padding: 10px;">Qty</th>';
  html += '<th style="text-align: right; padding: 10px;">Price</th>';
  html += '<th style="text-align: right; padding: 10px;">Subtotal</th>';
  html += '</tr></thead><tbody>';
  
  cartSnapshot.items.forEach((item: any) => {
    const product = item.product || {};
    const name = product.name || product.short_description || 'Product';
    const quantity = item.quantity || 1;
    const price = parseFloat(product.price || '0');
    const subtotal = price * quantity;
    
    html += '<tr style="border-bottom: 1px solid #eee;">';
    html += `<td style="padding: 10px;">${name}</td>`;
    html += `<td style="text-align: center; padding: 10px;">${quantity}</td>`;
    html += `<td style="text-align: right; padding: 10px;">₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: right; padding: 10px;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please add RESEND_API_KEY secret.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Using Resend API key: ${resendApiKey.substring(0, 10)}...`);

    const { cartIds } = await req.json();
    
    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'cartIds array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`📧 Manually sending recovery emails for ${cartIds.length} cart(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const cartId of cartIds) {
      try {
        // Fetch cart details
        const { data: cart, error: cartError } = await supabase
          .from('abandoned_carts')
          .select('*')
          .eq('id', cartId)
          .single();

        if (cartError || !cart) {
          results.failed++;
          results.errors.push(`Cart ${cartId}: Not found`);
          continue;
        }

        // Only send to active carts
        if (cart.status !== 'active') {
          results.failed++;
          results.errors.push(`Cart ${cartId}: Status is ${cart.status}, not active`);
          continue;
        }

        // Fetch customer details
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('full_name, email, company_name, created_at')
          .eq('user_id', cart.user_id)
          .single();

        if (customerError || !customer?.email) {
          results.failed++;
          results.errors.push(`Cart ${cartId}: Customer email not found`);
          continue;
        }

        // Fetch a suitable template (prefer stage-specific, fallback to any active email template)
        const { data: templates } = await supabase
          .from('cart_recovery_templates')
          .select('*')
          .eq('is_active', true)
          .in('template_type', ['email', 'both'])
          .order('stage_number', { ascending: true });

        const template = templates?.find(t => t.stage_number === 1) || templates?.[0];

        if (!template) {
          results.failed++;
          results.errors.push(`Cart ${cartId}: No active email template found`);
          continue;
        }

        // Generate discount code if template has discount
        let discountCode = cart.discount_code;
        if (template.discount_type && template.discount_value && !discountCode) {
          discountCode = generateDiscountCode(template.discount_code_prefix || 'SAVE', cart.user_id);
        }

        // Prepare template data
        const recoveryLink = `${(Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, '')}/cart-recovery/${cart.recovery_token}`;
        const templateData = {
          customer_name: customer.full_name || 'Valued Customer',
          customer_email: customer.email,
          cart_value: `₹${Number(cart.cart_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          cart_total: `₹${Number(cart.cart_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          cart_items: formatCartItems(cart.cart_snapshot),
          cart_items_count: (cart.cart_snapshot as any)?.items?.length?.toString() || '0',
          recovery_link: recoveryLink,
          discount_code: discountCode || '',
          discount_value: template.discount_value?.toString() || '',
          company_name: customer.company_name || '',
        };

        // Send email
        const emailSubject = replacePlaceholders(template.email_subject || 'Your Cart is Waiting', templateData);
        const emailBody = replacePlaceholders(template.email_html || '', templateData);

        console.log(`📧 Attempting to send email to ${customer.email}...`);
        console.log(`📧 From: Schneidervfd.com <noreply@schneidervfd.com>`);
        console.log(`📧 Subject: ${emailSubject}`);

        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Schneidervfd.com <noreply@schneidervfd.com>',
          to: customer.email,
          subject: emailSubject,
          html: emailBody,
        });

        // Check for Resend API errors
        if (emailError) {
          console.error(`❌ Resend API error for ${customer.email}:`, emailError);
          results.failed++;
          results.errors.push(`Cart ${cartId}: Resend error - ${emailError.message || JSON.stringify(emailError)}`);
          continue;
        }

        console.log(`✅ Resend confirmed email sent. Email ID: ${emailData?.id}`);

        // Update cart with sent timestamp and discount code
        await supabase
          .from('abandoned_carts')
          .update({
            first_reminder_sent_at: cart.first_reminder_sent_at || new Date().toISOString(),
            discount_code: discountCode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cartId);

        results.sent++;
        console.log(`✅ Sent recovery email for cart ${cartId} to ${customer.email}`);
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.errors.push(`Cart ${cartId}: ${errorMessage}`);
        console.error(`❌ Failed to send email for cart ${cartId}:`, error);
      }
    }

    console.log(`📊 Manual recovery summary: ${results.sent} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-manual-cart-recovery:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
