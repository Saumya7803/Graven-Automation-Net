const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Fetch active products using REST API
    const productsResponse = await fetch(
      `${supabaseUrl}/rest/v1/products?is_active=eq.true&select=id,updated_at&order=updated_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!productsResponse.ok) {
      console.error('Error fetching products:', await productsResponse.text());
      throw new Error('Failed to fetch products');
    }

    const products = await productsResponse.json();

    // Fetch published blog posts using REST API
    const blogPostsResponse = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?status=eq.published&select=slug,updated_at,published_at&order=published_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!blogPostsResponse.ok) {
      console.error('Error fetching blog posts:', await blogPostsResponse.text());
      throw new Error('Failed to fetch blog posts');
    }

    const blogPosts = await blogPostsResponse.json();

    const baseUrl = (Deno.env.get('FRONTEND_URL') || 'https://schneidervfd.com').replace(/\/+$/, '');
    const currentDate = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: currentDate },
      { loc: '/shop', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
      { loc: '/contact', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
      { loc: '/about', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
      { loc: '/blog', priority: '0.6', changefreq: 'weekly', lastmod: currentDate },
    ];

    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      sitemap += `    <lastmod>${page.lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Product pages
    if (products && products.length > 0) {
      products.forEach((product: any) => {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : currentDate;
        
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/product/${product.id}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += `    <changefreq>weekly</changefreq>\n`;
        sitemap += `    <priority>0.8</priority>\n`;
        sitemap += '  </url>\n';
      });
    }

    // Blog post pages
    if (blogPosts && blogPosts.length > 0) {
      blogPosts.forEach((post: any) => {
        const lastmod = post.updated_at 
          ? new Date(post.updated_at).toISOString().split('T')[0]
          : post.published_at 
            ? new Date(post.published_at).toISOString().split('T')[0]
            : currentDate;
        
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += `    <changefreq>monthly</changefreq>\n`;
        sitemap += `    <priority>0.6</priority>\n`;
        sitemap += '  </url>\n';
      });
    }

    sitemap += '</urlset>';

    console.log(`Generated sitemap with ${products?.length || 0} products and ${blogPosts?.length || 0} blog posts`);

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
