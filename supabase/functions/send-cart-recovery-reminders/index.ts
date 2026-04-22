import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getBranding } from "../_shared/branding.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

function calculateCustomerTier(totalSpent: number, totalOrders: number, createdAt: string): 'vip' | 'regular' | 'new' {
  if (totalSpent >= 100000 || totalOrders >= 10) return 'vip';
  if (totalSpent >= 20000 || totalOrders >= 5) return 'regular';
  
  const accountAge = Date.now() - new Date(createdAt).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  if (accountAge < thirtyDaysInMs) return 'new';
  
  return 'regular';
}

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
  const branding = getBranding();
  if (!cartSnapshot || !cartSnapshot.items || !Array.isArray(cartSnapshot.items)) {
    return '<p>Your cart items are waiting for you!</p>';
  }
  
  let html = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">`;
  html += `<thead><tr style="border-bottom: 2px solid ${branding.colors.border}; background: ${branding.colors.bgLight};">`;
  html += `<th style="text-align: left; padding: 12px; color: ${branding.colors.textDark}; font-size: 13px;">Product</th>`;
  html += `<th style="text-align: center; padding: 12px; color: ${branding.colors.textDark}; font-size: 13px;">Qty</th>`;
  html += `<th style="text-align: right; padding: 12px; color: ${branding.colors.textDark}; font-size: 13px;">Price</th>`;
  html += `<th style="text-align: right; padding: 12px; color: ${branding.colors.textDark}; font-size: 13px;">Subtotal</th>`;
  html += '</tr></thead><tbody>';
  
  cartSnapshot.items.forEach((item: any) => {
    const product = item.product || {};
    const name = product.name || product.short_description || 'Product';
    const quantity = item.quantity || 1;
    const price = parseFloat(product.price || '0');
    const subtotal = price * quantity;
    
    html += `<tr style="border-bottom: 1px solid ${branding.colors.border};">`;
    html += `<td style="padding: 12px; color: ${branding.colors.textDark};">${name}</td>`;
    html += `<td style="text-align: center; padding: 12px; color: ${branding.colors.textDark};">${quantity}</td>`;
    html += `<td style="text-align: right; padding: 12px; color: ${branding.colors.textDark};">₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
    html += `<td style="text-align: right; padding: 12px; color: ${branding.colors.textDark}; font-weight: 600;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>`;
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
    const branding = getBranding();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📧 Starting behavioral cart recovery process...');

    const now = new Date();
    const { data: abandonedCarts, error: cartsError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('status', 'active')
      .lt('expires_at', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

    if (cartsError) throw cartsError;

    if (!abandonedCarts || abandonedCarts.length === 0) {
      console.log('✅ No active abandoned carts to process');
      return new Response(
        JSON.stringify({ message: 'No abandoned carts to process', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Processing ${abandonedCarts.length} abandoned carts with behavioral sequences`);

    let sent = 0;
    let skipped = 0;

    for (const cart of abandonedCarts) {
      try {
        const hoursSinceAbandonment = (Date.now() - new Date(cart.abandoned_at).getTime()) / (1000 * 60 * 60);
        
        const { data: interactions } = await supabase
          .from('cart_recovery_interactions')
          .select('*')
          .eq('abandoned_cart_id', cart.id)
          .order('created_at', { ascending: false });

        const { data: sequence } = await supabase
          .from('cart_recovery_sequences')
          .select('*')
          .eq('sequence_name', cart.current_sequence || 'standard')
          .single();

        if (!sequence || !sequence.stages) {
          console.log(`⚠️ No sequence found for cart ${cart.id}, skipping`);
          continue;
        }

        const stages = sequence.stages as any[];
        const currentStage = cart.sequence_stage || 0;
        
        if (currentStage >= stages.length) {
          console.log(`✅ Cart ${cart.id} completed all stages in sequence ${cart.current_sequence}`);
          continue;
        }

        const nextStage = stages[currentStage];
        const stageHours = nextStage.hours;
        
        if (hoursSinceAbandonment < stageHours) {
          continue;
        }

        const stageToReminderField: Record<number, string> = {
          0: 'first_reminder_sent_at',
          1: 'second_reminder_sent_at',
          2: 'third_reminder_sent_at',
          3: 'final_reminder_sent_at'
        };

        const reminderField = stageToReminderField[currentStage];
        if (reminderField && cart[reminderField]) {
          continue;
        }

        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', cart.user_id)
          .single();

        if (!customer) {
          console.log(`⚠️ Customer not found for cart ${cart.id}`);
          skipped++;
          continue;
        }

        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount')
          .eq('user_id', cart.user_id);

        const totalSpent = orders?.reduce((sum, order) => sum + parseFloat(String(order.total_amount) || '0'), 0) || 0;
        const totalOrders = orders?.length || 0;
        const customerTier = calculateCustomerTier(totalSpent, totalOrders, customer.created_at);

        const engagementScore = cart.engagement_score || 0;
        let discountBonus = 0;
        
        if (engagementScore > 100) {
          discountBonus = 5;
        } else if (engagementScore > 50) {
          discountBonus = 3;
        }

        const minDiscount = nextStage.discount_min || 0;
        const maxDiscount = nextStage.discount_max || minDiscount;
        const baseDiscount = minDiscount + Math.floor(Math.random() * (maxDiscount - minDiscount + 1));
        const finalDiscount = Math.min(baseDiscount + discountBonus, 40);

        const { data: templates } = await supabase
          .from('cart_recovery_templates')
          .select('*')
          .eq('is_active', true)
          .eq('stage_number', currentStage + 1)
          .contains('target_tiers', [customerTier])
          .lte('min_cart_value', cart.cart_value)
          .or(`max_cart_value.is.null,max_cart_value.gte.${cart.cart_value}`)
          .order('times_sent', { ascending: true })
          .limit(1);

        const template = templates?.[0];
        if (!template) {
          console.log(`⚠️ No template found for stage ${currentStage + 1}, cart ${cart.id}, sequence ${cart.current_sequence}`);
          skipped++;
          continue;
        }

        console.log(`📧 Sending ${cart.current_sequence} sequence stage ${currentStage + 1} (${nextStage.name}) to ${customer.email}`);

        let discountCode = '';
        if (template.discount_type) {
          discountCode = generateDiscountCode(template.discount_code_prefix || 'CART', cart.user_id);
        }

        const recoveryLink = `${branding.frontendUrl}/cart-recovery/${cart.recovery_token}`;

        const placeholderData = {
          customer_name: customer.full_name || 'Valued Customer',
          cart_value: `₹${parseFloat(String(cart.cart_value)).toLocaleString('en-IN')}`,
          cart_total: `₹${parseFloat(String(cart.cart_value)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          cart_items: formatCartItems(cart.cart_snapshot),
          recovery_link: recoveryLink,
          discount_code: discountCode,
          discount_amount: finalDiscount.toString(),
          hours_since_abandonment: stageHours.toString(),
          items_count: (cart.cart_snapshot as any).items?.length?.toString() || '0',
          sequence_name: nextStage.name || 'Reminder',
          engagement_level: engagementScore > 50 ? 'high' : 'standard',
        };

        if (template.template_type === 'email' || template.template_type === 'both') {
          const emailHtml = replacePlaceholders(template.email_html || '', placeholderData);
          const emailSubject = replacePlaceholders(template.email_subject || '', placeholderData);

          const { error: emailError } = await resend.emails.send({
            from: branding.email.from,
            to: customer.email,
            subject: emailSubject,
            html: emailHtml,
          });

          if (emailError) {
            console.error(`❌ Failed to send email to ${customer.email}:`, emailError);
            continue;
          }

          await supabase.from('cart_recovery_interactions').insert({
            abandoned_cart_id: cart.id,
            user_id: cart.user_id,
            interaction_type: 'email_sent',
            template_id: template.id,
            metadata: { stage: currentStage, sequence: cart.current_sequence }
          });
        }

        if (template.template_type === 'push' || template.template_type === 'both') {
          const pushTitle = replacePlaceholders(template.push_title || '', placeholderData);
          const pushBody = replacePlaceholders(template.push_body || '', placeholderData);

          const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
            body: {
              userId: cart.user_id,
              notification: {
                title: pushTitle,
                body: pushBody,
                icon: template.push_icon,
                badge: template.push_badge,
                data: { url: recoveryLink, abandonedCartId: cart.id },
              },
              notificationType: 'cart_recovery',
            },
          });

          if (pushError) {
            console.error(`❌ Failed to send push notification:`, pushError);
          } else {
            await supabase.from('cart_recovery_interactions').insert({
              abandoned_cart_id: cart.id,
              user_id: cart.user_id,
              interaction_type: 'push_sent',
              template_id: template.id,
              metadata: { stage: currentStage, sequence: cart.current_sequence }
            });
          }
        }

        const updateData: any = {
          updated_at: new Date().toISOString(),
          discount_code: discountCode || undefined,
          sequence_stage: currentStage + 1,
        };

        const stageNameMap: Record<number, string> = {
          0: 'first_reminder_sent_at',
          1: 'second_reminder_sent_at',
          2: 'third_reminder_sent_at',
          3: 'final_reminder_sent_at'
        };
        const legacyField = stageNameMap[currentStage];
        if (legacyField) updateData[legacyField] = new Date().toISOString();

        await supabase.from('abandoned_carts').update(updateData).eq('id', cart.id);

        await supabase.from('cart_recovery_templates').update({
          times_sent: template.times_sent + 1,
        }).eq('id', template.id);

        sent++;

      } catch (error) {
        console.error(`❌ Error processing cart ${cart.id}:`, error);
        skipped++;
      }
    }

    const summary = {
      message: 'Behavioral cart recovery reminders sent',
      totalProcessed: abandonedCarts.length,
      sent,
      skipped,
      timestamp: new Date().toISOString(),
    };

    console.log('📈 Summary:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Error in cart recovery reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
