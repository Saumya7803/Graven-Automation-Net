import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PerformanceDataRow {
  product_id: string;
  merchant_product_id: string;
  impressions: number;
  clicks: number;
  date: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📊 Fetching Google Shopping performance data...');

    // Get date range from request (default to yesterday)
    const { dateRange = 'yesterday' } = await req.json();
    
    let startDate: string;
    let endDate: string;
    const today = new Date();
    
    if (dateRange === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = endDate = yesterday.toISOString().split('T')[0];
    } else if (dateRange === 'last7days') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      startDate = sevenDaysAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    } else if (dateRange === 'last30days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
      endDate = today.toISOString().split('T')[0];
    } else {
      startDate = endDate = dateRange;
    }

    console.log(`📅 Date range: ${startDate} to ${endDate}`);

    // Get Google Merchant config and access token
    const { data: config, error: configError } = await supabaseClient
      .from('google_merchant_config')
      .select('*')
      .single();

    if (configError || !config?.is_connected) {
      throw new Error('Google Merchant Center not connected');
    }

    // Get access token
    const { data: tokenData, error: tokenError } = await supabaseClient.functions.invoke(
      'refresh-google-token'
    );

    if (tokenError) throw new Error('Failed to refresh access token');

    const accessToken = tokenData.accessToken;
    const merchantId = config.merchant_id;

    console.log(`🔐 Using merchant ID: ${merchantId}`);

    // Fetch products with Google sync status
    const { data: products, error: productsError } = await supabaseClient
      .from('google_product_status')
      .select('product_id, merchant_product_id')
      .not('merchant_product_id', 'is', null);

    if (productsError) throw productsError;

    console.log(`📦 Found ${products?.length || 0} synced products`);

    const performanceData: PerformanceDataRow[] = [];
    const errors: string[] = [];

    // Fetch performance data for each product
    for (const product of products || []) {
      try {
        const query = {
          query: `SELECT offer_id, date, impressions, clicks 
                  FROM MerchantPerformanceView 
                  WHERE date >= '${startDate}' AND date <= '${endDate}' 
                  AND offer_id = '${product.merchant_product_id}'`
        };

        const response = await fetch(
          `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/reports/search`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API error for product ${product.merchant_product_id}:`, errorText);
          errors.push(`Product ${product.merchant_product_id}: ${errorText}`);
          continue;
        }

        const result = await response.json();
        
        if (result.results && result.results.length > 0) {
          for (const row of result.results) {
            performanceData.push({
              product_id: product.product_id,
              merchant_product_id: product.merchant_product_id,
              impressions: parseInt(row.metrics?.impressions || '0'),
              clicks: parseInt(row.metrics?.clicks || '0'),
              date: row.segments?.date || startDate,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching data for product ${product.merchant_product_id}:`, error);
        errors.push(`Product ${product.merchant_product_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`✅ Fetched performance data for ${performanceData.length} product-date combinations`);

    // Insert or update performance data
    if (performanceData.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('google_shopping_performance')
        .upsert(performanceData, {
          onConflict: 'product_id,date',
          ignoreDuplicates: false,
        });

      if (insertError) {
        console.error('❌ Error inserting performance data:', insertError);
        throw insertError;
      }

      // Update cumulative totals in google_product_status
      for (const product of products || []) {
        const productData = performanceData.filter(d => d.product_id === product.product_id);
        const totalImpressions = productData.reduce((sum, d) => sum + d.impressions, 0);
        const totalClicks = productData.reduce((sum, d) => sum + d.clicks, 0);

        await supabaseClient
          .from('google_product_status')
          .update({
            impressions: totalImpressions,
            clicks: totalClicks,
          })
          .eq('product_id', product.product_id);
      }
    }

    // Log sync
    await supabaseClient
      .from('google_sync_log')
      .insert({
        sync_type: 'performance_fetch',
        products_synced: performanceData.length,
        errors_count: errors.length,
      });

    return new Response(
      JSON.stringify({
        success: true,
        recordsProcessed: performanceData.length,
        errors: errors,
        dateRange: { startDate, endDate },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in fetch-google-performance:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
