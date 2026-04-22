import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  gtin: string | null;
  brand: string | null;
  condition: string | null;
  google_product_category: string | null;
  is_quote_only?: boolean;
}

interface GoogleProduct {
  batchId: number;
  merchantId: string;
  method: string;
  product: {
    id: string;
    title: string;
    description: string;
    link: string;
    imageLink: string;
    price: { value: string; currency: string };
    availability: string;
    condition: string;
    gtin?: string;
    mpn: string;
    brand: string;
    googleProductCategory: string;
    contentLanguage: string;
    targetCountry: string;
    channel: string;
  };
}

function isProductEligible(product: Product): { eligible: boolean; reason?: string } {
  if (product.is_quote_only) return { eligible: false, reason: 'Quote-only product' };
  if (!product.sku) return { eligible: false, reason: 'Missing SKU (MPN)' };
  if (!product.image_url) return { eligible: false, reason: 'Missing image URL' };
  if (!product.google_product_category) return { eligible: false, reason: 'Missing Google product category' };
  if (!product.brand) return { eligible: false, reason: 'Missing brand' };
  if (!product.condition) return { eligible: false, reason: 'Missing condition' };
  if (!product.price || product.price <= 0) return { eligible: false, reason: 'Invalid price' };
  return { eligible: true };
}

async function getAccessToken(supabaseClient: any): Promise<string> {
  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/refresh-google-token`,
    {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const { accessToken } = await response.json();
  return accessToken;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { syncMode = 'full', productIds } = await req.json();

    console.log(`Starting ${syncMode} sync...`);

    // Get merchant config
    const { data: config, error: configError } = await supabaseClient
      .from('google_merchant_config')
      .select('*')
      .single();

    if (configError || !config || !config.is_connected) {
      throw new Error('Google Merchant not connected');
    }

    // Get access token
    const accessToken = await getAccessToken(supabaseClient);

    // Fetch products to sync
    let query = supabaseClient
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (syncMode === 'selected' && productIds) {
      query = query.in('id', productIds);
    } else if (syncMode === 'delta' && config.last_sync_at) {
      query = query.gte('updated_at', config.last_sync_at);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) throw productsError;

    console.log(`Found ${products?.length || 0} products to process`);

    // Filter eligible products
    const eligibleProducts: Product[] = [];
    const ineligibleProducts: { product: Product; reason: string }[] = [];

    for (const product of products || []) {
      const { eligible, reason } = isProductEligible(product);
      if (eligible) {
        eligibleProducts.push(product);
      } else {
        ineligibleProducts.push({ product, reason: reason! });
      }
    }

    console.log(`${eligibleProducts.length} eligible, ${ineligibleProducts.length} ineligible`);

    // Process in batches of 1000
    const BATCH_SIZE = 1000;
    const results: any[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < eligibleProducts.length; i += BATCH_SIZE) {
      const batch = eligibleProducts.slice(i, i + BATCH_SIZE);
      
      const entries: GoogleProduct[] = batch.map((product, index) => ({
        batchId: i + index,
        merchantId: config.merchant_id,
        method: 'insert',
        product: {
          id: product.sku,
          title: product.name,
          description: product.description || product.name,
          link: `${Deno.env.get('FRONTEND_URL')}/products/${product.id}`,
          imageLink: product.image_url!,
          price: {
            value: product.price.toString(),
            currency: 'INR',
          },
          availability: product.stock_quantity > 0 ? 'in stock' : 'out of stock',
          condition: product.condition!,
          ...(product.gtin && { gtin: product.gtin }),
          mpn: product.sku,
          brand: product.brand!,
          googleProductCategory: product.google_product_category!,
          contentLanguage: 'en',
          targetCountry: 'IN',
          channel: 'online',
        },
      }));

      // Send batch to Google
      const response = await fetch(
        `https://shoppingcontent.googleapis.com/content/v2.1/${config.merchant_id}/products/batch`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ entries }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error);
        failureCount += batch.length;
        continue;
      }

      const batchResult = await response.json();
      results.push(batchResult);

      // Update product status in database
      for (const entry of batchResult.entries || []) {
        const product = batch[entry.batchId - i];
        
        if (entry.product) {
          successCount++;
          
          await supabaseClient
            .from('google_product_status')
            .upsert({
              product_id: product.id,
              merchant_product_id: entry.product.id,
              approval_status: 'pending',
              last_synced_at: new Date().toISOString(),
              sync_error: null,
            });
        } else if (entry.errors) {
          failureCount++;
          
          await supabaseClient
            .from('google_product_status')
            .upsert({
              product_id: product.id,
              merchant_product_id: product.sku,
              approval_status: 'error',
              last_synced_at: new Date().toISOString(),
              sync_error: JSON.stringify(entry.errors),
              item_level_issues: entry.errors,
            });
        }
      }

      console.log(`Batch ${i / BATCH_SIZE + 1} completed: ${successCount} success, ${failureCount} failed`);
    }

    // Update last sync timestamp
    await supabaseClient
      .from('google_merchant_config')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: 'synced',
      })
      .eq('id', config.id);

    // Log sync operation
    await supabaseClient
      .from('google_sync_log')
      .insert({
        sync_type: syncMode,
        products_synced: successCount,
        errors_count: failureCount + ineligibleProducts.length,
        products_approved: 0,
        products_pending: successCount,
        products_disapproved: 0,
        initiated_by: req.headers.get('x-user-id'),
      });

    console.log(`✅ Sync completed: ${successCount} synced, ${failureCount + ineligibleProducts.length} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        synced: successCount,
        failed: failureCount,
        ineligible: ineligibleProducts.length,
        ineligibleProducts: ineligibleProducts.map(p => ({
          sku: p.product.sku,
          name: p.product.name,
          reason: p.reason,
        })),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-products-to-google:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
