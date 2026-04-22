import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('💰 Calculating Google Shopping conversions...');

    const { orderId } = await req.json();

    if (!orderId) {
      throw new Error('orderId is required');
    }

    // Get order with UTM data
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Check if order came from Google Shopping
    const utmSource = (order as any).utm_source?.toLowerCase();
    if (!utmSource || !['google', 'google_shopping', 'googleshopping'].includes(utmSource)) {
      console.log('ℹ️ Order did not come from Google Shopping, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Not a Google Shopping order' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Order ${order.order_number} is from Google Shopping`);

    // Process each order item
    const orderDate = new Date(order.created_at).toISOString().split('T')[0];
    
    for (const item of order.order_items) {
      // Get or create performance record for today
      const { data: existing, error: fetchError } = await supabaseClient
        .from('google_shopping_performance')
        .select('*')
        .eq('product_id', item.product_id)
        .eq('date', orderDate)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching performance record:', fetchError);
        continue;
      }

      if (existing) {
        // Update existing record
        await supabaseClient
          .from('google_shopping_performance')
          .update({
            conversions: (existing.conversions || 0) + item.quantity,
            revenue: (existing.revenue || 0) + item.subtotal,
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        const { data: productStatus } = await supabaseClient
          .from('google_product_status')
          .select('merchant_product_id')
          .eq('product_id', item.product_id)
          .single();

        if (productStatus?.merchant_product_id) {
          await supabaseClient
            .from('google_shopping_performance')
            .insert({
              product_id: item.product_id,
              merchant_product_id: productStatus.merchant_product_id,
              date: orderDate,
              conversions: item.quantity,
              revenue: item.subtotal,
              impressions: 0,
              clicks: 0,
            });
        }
      }

      console.log(`✅ Updated conversions for product ${item.product_id}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        itemsProcessed: order.order_items.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in calculate-google-conversions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
