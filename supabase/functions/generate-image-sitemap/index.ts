import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment variables are not configured");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const frontendUrl = (Deno.env.get("FRONTEND_URL") || "https://schneidervfd.com").replace(/\/+$/, '');

    // Fetch all active products with images
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        sku,
        series,
        power_range,
        updated_at,
        image_url,
        product_images (
          image_url,
          display_order
        )
      `)
      .eq("is_active", true);

    if (productsError) throw productsError;

    // Fetch blog posts with images
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, featured_image, updated_at")
      .eq("status", "published")
      .not("featured_image", "is", null);

    if (blogError) throw blogError;

    // Generate image sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // Add product images
    products?.forEach((product) => {
      const productUrl = `${frontendUrl}/product/${product.id}`;
      xml += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${product.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0]}</lastmod>`;

      // Add primary image
      if (product.image_url) {
        xml += `
    <image:image>
      <image:loc>${product.image_url}</image:loc>
      <image:title>${product.sku} ${product.name} - ${product.power_range} VFD</image:title>
      <image:caption>${product.series} Variable Frequency Drive ${product.power_range}</image:caption>
    </image:image>`;
      }

      // Add additional product images
      if (product.product_images && product.product_images.length > 0) {
        product.product_images.forEach((img: any) => {
          xml += `
    <image:image>
      <image:loc>${img.image_url}</image:loc>
      <image:title>${product.sku} ${product.name} - View ${img.display_order}</image:title>
      <image:caption>${product.series} VFD ${product.power_range}</image:caption>
    </image:image>`;
        });
      }

      xml += `
  </url>`;
    });

    // Add blog post images
    blogPosts?.forEach((post) => {
      const postUrl = `${frontendUrl}/blog/${post.slug}`;
      xml += `
  <url>
    <loc>${postUrl}</loc>
    <lastmod>${post.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0]}</lastmod>
    <image:image>
      <image:loc>${post.featured_image}</image:loc>
      <image:title>Featured image for blog post</image:title>
    </image:image>
  </url>`;
    });

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating image sitemap:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
