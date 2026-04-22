import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  stock_quantity: number;
  gtin: string | null;
  brand: string;
  condition: string;
  google_product_category: string;
  image_url: string | null;
  series: string;
  power_range: string;
  is_active: boolean;
}

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const frontendUrl = (Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, '');

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching products for Google Shopping feed...');

    // Fetch all active products with their images
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    // Fetch product images
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('product_id, image_url, is_primary')
      .order('is_primary', { ascending: false });

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
    }

    // Create a map of product images
    const imageMap = new Map<string, string>();
    if (images) {
      images.forEach((img: any) => {
        if (!imageMap.has(img.product_id)) {
          imageMap.set(img.product_id, img.image_url);
        }
      });
    }

    console.log(`Found ${products?.length || 0} active products`);

    // Build RSS 2.0 XML Feed
    const now = new Date().toUTCString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VFD Products - Variable Frequency Drives</title>
    <link>${frontendUrl}</link>
    <description>Complete range of Variable Frequency Drives (VFDs) and industrial automation products</description>
    <lastBuildDate>${now}</lastBuildDate>
`;

    if (products && products.length > 0) {
      for (const product of products as Product[]) {
        // Get product image - prefer image_url, fallback to product_images table, or use placeholder
        const imageUrl = product.image_url || 
                        imageMap.get(product.id) || 
                        `${frontendUrl}/placeholder.svg`;

        // Ensure image URL is absolute
        const absoluteImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${frontendUrl}${imageUrl}`;

        // Product link
        const productLink = `${frontendUrl}/product/${product.id}`;

        // Format price with currency
        const priceFormatted = `${product.price} INR`;

        // Determine availability based on stock
        const availability = product.stock_quantity > 0 ? 'in stock' : 'out of stock';

        // Clean and truncate title (max 150 chars)
        const title = product.name.substring(0, 150);

        // Clean and truncate description (max 5000 chars)
        const description = (product.description || product.short_description || 'No description available')
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .substring(0, 5000);

        xml += `    <item>
      <g:id>${escapeXml(product.sku)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(absoluteImageUrl)}</g:image_link>
      <g:condition>${escapeXml(product.condition)}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${priceFormatted}</g:price>
      <g:brand>${escapeXml(product.brand)}</g:brand>
      <g:mpn>${escapeXml(product.sku)}</g:mpn>
`;

        // Add Google Product Category
        if (product.google_product_category) {
          xml += `      <g:google_product_category>${escapeXml(product.google_product_category)}</g:google_product_category>
`;
        }

        // Add product type (custom attribute)
        xml += `      <g:product_type>Industrial Equipment &gt; Variable Frequency Drives &gt; ${escapeXml(product.series)}</g:product_type>
`;

        // Add custom labels for filtering
        xml += `      <g:custom_label_0>${escapeXml(product.series)}</g:custom_label_0>
      <g:custom_label_1>${escapeXml(product.power_range)}</g:custom_label_1>
`;

        xml += `    </item>
`;
      }
    }

    xml += `  </channel>
</rss>`;

    console.log('Google Shopping feed generated successfully');

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating Google Shopping feed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
