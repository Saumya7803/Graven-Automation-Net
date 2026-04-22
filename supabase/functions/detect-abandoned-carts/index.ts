import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.77.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting abandoned cart detection...');

    // Define abandonment threshold (1 hour)
    const abandonmentThreshold = new Date(Date.now() - 60 * 60 * 1000);

    // Find cart items that haven't been updated in over 1 hour
    const { data: staleCartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .lt('updated_at', abandonmentThreshold.toISOString())
      .order('user_id');

    if (cartError) {
      console.error('Error fetching cart items:', cartError);
      throw cartError;
    }

    if (!staleCartItems || staleCartItems.length === 0) {
      console.log('✅ No abandoned carts found');
      return new Response(
        JSON.stringify({ message: 'No abandoned carts found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group cart items by user
    const cartsByUser = staleCartItems.reduce((acc, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = [];
      }
      acc[item.user_id].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    console.log(`📊 Found ${Object.keys(cartsByUser).length} users with stale carts`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const [userId, items] of Object.entries(cartsByUser)) {
      const cartItems = items as any[];
      // Check if user has recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', cartItems[0].updated_at)
        .limit(1);

      if (recentOrders && recentOrders.length > 0) {
        console.log(`⏭️  Skipping user ${userId} - has recent orders`);
        skippedCount++;
        continue;
      }

      // Check if abandoned cart already exists for this user
      const { data: existingAbandoned } = await supabase
        .from('abandoned_carts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('abandoned_at', cartItems[0].updated_at)
        .limit(1);

      if (existingAbandoned && existingAbandoned.length > 0) {
        console.log(`⏭️  Skipping user ${userId} - already has active abandoned cart`);
        skippedCount++;
        continue;
      }

      // Calculate cart value
      const cartValue = cartItems.reduce((sum: number, item: any) => {
        return sum + (item.product?.price || 0) * item.quantity;
      }, 0);

      // Parse User-Agent for browser and device info
      const parseUserAgent = (ua: string = '') => {
        const uaLower = ua.toLowerCase();
        
        // Detect browser
        let browser = 'unknown';
        if (uaLower.includes('edg/')) browser = 'Edge';
        else if (uaLower.includes('chrome/') && !uaLower.includes('edg/')) browser = 'Chrome';
        else if (uaLower.includes('safari/') && !uaLower.includes('chrome/')) browser = 'Safari';
        else if (uaLower.includes('firefox/')) browser = 'Firefox';
        else if (uaLower.includes('opera/') || uaLower.includes('opr/')) browser = 'Opera';
        
        // Detect device type
        let deviceType = 'desktop';
        if (uaLower.includes('mobile')) deviceType = 'mobile';
        else if (uaLower.includes('tablet') || uaLower.includes('ipad')) deviceType = 'tablet';
        
        return { browser, deviceType };
      };

      const userAgent = req.headers.get('user-agent') || '';
      const { browser, deviceType } = parseUserAgent(userAgent);

      // Create abandoned cart record
      const { error: insertError } = await supabase
        .from('abandoned_carts')
        .insert({
          user_id: userId,
          cart_snapshot: { items: cartItems },
          cart_value: cartValue,
          abandonment_stage: 'cart',
          status: 'active',
          abandoned_at: cartItems[0].updated_at,
          device_type: deviceType,
          browser: browser,
        });

      if (insertError) {
        console.error(`❌ Error creating abandoned cart for user ${userId}:`, insertError);
      } else {
        console.log(`✅ Created abandoned cart for user ${userId} (value: ₹${cartValue})`);
        createdCount++;
      }
    }

    const summary = {
      message: 'Abandoned cart detection completed',
      totalStaleUsers: Object.keys(cartsByUser).length,
      created: createdCount,
      skipped: skippedCount,
      timestamp: new Date().toISOString(),
    };

    console.log('📈 Summary:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Error in abandoned cart detection:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
