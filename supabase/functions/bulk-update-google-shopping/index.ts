import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductUpdate {
  sku: string;
  gtin?: string;
  brand?: string;
  condition?: string;
  google_product_category?: string;
  image_url?: string;
}

interface UpdateResult {
  sku: string;
  status: 'success' | 'failed';
  error?: string;
}

// Validate GTIN format (8, 12, 13, or 14 digits)
function validateGTIN(gtin: string): { valid: boolean; error?: string } {
  if (!gtin) return { valid: true }; // Optional field
  
  const cleanGTIN = gtin.replace(/\s/g, '');
  const validLengths = [8, 12, 13, 14];
  
  if (!/^\d+$/.test(cleanGTIN)) {
    return { valid: false, error: 'GTIN must contain only digits' };
  }
  
  if (!validLengths.includes(cleanGTIN.length)) {
    return { valid: false, error: 'GTIN must be 8, 12, 13, or 14 digits' };
  }
  
  return { valid: true };
}

// Validate image URL format
function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true }; // Optional field
  
  try {
    new URL(url);
    if (!url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return { valid: false, error: 'Image URL must end with a valid image extension (.jpg, .png, etc.)' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Validate condition
function validateCondition(condition: string): { valid: boolean; error?: string } {
  if (!condition) return { valid: true }; // Optional field
  
  const validConditions = ['new', 'refurbished', 'used'];
  if (!validConditions.includes(condition.toLowerCase())) {
    return { valid: false, error: 'Condition must be "new", "refurbished", or "used"' };
  }
  
  return { valid: true };
}

// Validate brand
function validateBrand(brand: string): { valid: boolean; error?: string } {
  if (!brand) return { valid: true }; // Optional field
  
  if (brand.length > 70) {
    return { valid: false, error: 'Brand must be 70 characters or less' };
  }
  
  return { valid: true };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { updates } = await req.json() as { updates: ProductUpdate[] };

    if (!updates || !Array.isArray(updates)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: updates array required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${updates.length} product updates...`);

    const results: UpdateResult[] = [];
    const BATCH_SIZE = 100;

    // Process in batches
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      const batch = updates.slice(i, i + BATCH_SIZE);
      
      for (const update of batch) {
        try {
          // Validate fields
          const gtinValidation = validateGTIN(update.gtin || '');
          if (!gtinValidation.valid) {
            results.push({ sku: update.sku, status: 'failed', error: gtinValidation.error });
            continue;
          }

          const imageValidation = validateImageUrl(update.image_url || '');
          if (!imageValidation.valid) {
            results.push({ sku: update.sku, status: 'failed', error: imageValidation.error });
            continue;
          }

          const conditionValidation = validateCondition(update.condition || '');
          if (!conditionValidation.valid) {
            results.push({ sku: update.sku, status: 'failed', error: conditionValidation.error });
            continue;
          }

          const brandValidation = validateBrand(update.brand || '');
          if (!brandValidation.valid) {
            results.push({ sku: update.sku, status: 'failed', error: brandValidation.error });
            continue;
          }

          // Build update object (only include fields that are provided)
          const updateData: any = {};
          if (update.gtin !== undefined) updateData.gtin = update.gtin;
          if (update.brand !== undefined) updateData.brand = update.brand;
          if (update.condition !== undefined) updateData.condition = update.condition;
          if (update.google_product_category !== undefined) updateData.google_product_category = update.google_product_category;
          if (update.image_url !== undefined) updateData.image_url = update.image_url;
          updateData.updated_at = new Date().toISOString();

          // Update product
          const { error } = await supabaseClient
            .from('products')
            .update(updateData)
            .eq('sku', update.sku);

          if (error) {
            console.error(`Failed to update ${update.sku}:`, error);
            results.push({ sku: update.sku, status: 'failed', error: error.message });
          } else {
            console.log(`✓ Updated ${update.sku}`);
            results.push({ sku: update.sku, status: 'success' });
          }
        } catch (error) {
          console.error(`Error processing ${update.sku}:`, error);
          results.push({ 
            sku: update.sku, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    console.log(`✅ Completed: ${successCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: successCount,
        failed: failedCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in bulk-update-google-shopping:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
