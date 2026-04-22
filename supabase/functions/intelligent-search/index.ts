import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ParsedQuery {
  brand: string | null;
  category: string | null;
  power: string | null;
  normalizedTerms: string[];
}

interface SearchResult {
  id: string;
  name: string;
  series: string;
  sku: string;
  brand: string | null;
  power_range: string | null;
  short_description: string | null;
  image_url: string | null;
  is_active: boolean;
  lifecycle_status: string | null;
  category_name: string | null;
  match_score: number;
  has_replacements?: boolean;
}

// Known brands for query parsing
const KNOWN_BRANDS = [
  'schneider electric', 'schneider', 'siemens', 'allen bradley', 'allen-bradley',
  'rockwell', 'mitsubishi electric', 'mitsubishi', 'abb', 'delta', 'yaskawa',
  'danfoss', 'omron', 'fuji', 'weg', 'lenze', 'sew', 'nord', 'vacon', 'hitachi'
];

// Category keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'VFD': ['vfd', 'variable frequency drive', 'inverter', 'ac drive', 'drive', 'frequency converter'],
  'PLC': ['plc', 'programmable logic controller', 'controller', 'logic controller', 'cpu'],
  'HMI': ['hmi', 'human machine interface', 'touch panel', 'operator panel', 'display'],
  'Servo': ['servo', 'servo drive', 'servo motor', 'servo amplifier', 'servo amp'],
};

// Normalize model number (remove spaces, dashes, lowercase)
function normalizeModelNumber(input: string): string {
  return input.toLowerCase().replace(/[\s\-_.]/g, '').replace(/[^\w]/g, '');
}

// Extract power rating from query
function extractPowerRating(query: string): { power: string | null; remaining: string } {
  const powerPattern = /(\d+(?:\.\d+)?)\s*(kw|w|hp|kva)\b/gi;
  const match = powerPattern.exec(query);
  
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    let normalizedPower: string;
    
    if (unit === 'w') normalizedPower = `${value / 1000}kW`;
    else if (unit === 'hp') normalizedPower = `${(value * 0.746).toFixed(2)}kW`;
    else normalizedPower = `${value}${unit.toUpperCase()}`;
    
    return { power: normalizedPower, remaining: query.replace(match[0], '').trim() };
  }
  
  return { power: null, remaining: query };
}

// Extract brand from query
function extractBrand(query: string): { brand: string | null; remaining: string } {
  const lowerQuery = query.toLowerCase();
  const sortedBrands = [...KNOWN_BRANDS].sort((a, b) => b.length - a.length);
  
  for (const brand of sortedBrands) {
    if (lowerQuery.includes(brand)) {
      const regex = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const remaining = query.replace(regex, '').trim().replace(/\s+/g, ' ');
      const capitalizedBrand = brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { brand: capitalizedBrand, remaining };
    }
  }
  return { brand: null, remaining: query };
}

// Extract category from query
function extractCategory(query: string): { category: string | null; remaining: string } {
  const lowerQuery = query.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords.sort((a, b) => b.length - a.length)) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(lowerQuery)) {
        return { category, remaining: query.replace(regex, '').trim().replace(/\s+/g, ' ') };
      }
    }
  }
  return { category: null, remaining: query };
}

// Parse the complete search query
function parseQuery(query: string): ParsedQuery {
  let remaining = query.toLowerCase().trim().replace(/\s+/g, ' ');
  
  const { brand, remaining: afterBrand } = extractBrand(remaining);
  remaining = afterBrand;
  
  const { category, remaining: afterCategory } = extractCategory(remaining);
  remaining = afterCategory;
  
  const { power, remaining: afterPower } = extractPowerRating(remaining);
  remaining = afterPower;
  
  const normalizedTerms = remaining.split(' ').filter(t => t.length >= 2);
  
  return { brand, category, power, normalizedTerms };
}

// Calculate match score for ranking
function calculateMatchScore(product: any, parsedQuery: ParsedQuery, expandedTerms: string[]): number {
  let score = 0;
  const searchableText = [
    product.name, product.series, product.sku, product.brand,
    product.power_range, product.short_description
  ].filter(Boolean).join(' ').toLowerCase();
  
  const normalizedModel = normalizeModelNumber(searchableText);
  
  // Exact model number match (highest priority)
  for (const term of parsedQuery.normalizedTerms) {
    const normalizedTerm = normalizeModelNumber(term);
    if (normalizedModel.includes(normalizedTerm)) {
      score += 100;
    }
  }
  
  // Brand match
  if (parsedQuery.brand && product.brand?.toLowerCase().includes(parsedQuery.brand.toLowerCase())) {
    score += 50;
  }
  
  // Power match
  if (parsedQuery.power && product.power_range?.toLowerCase().includes(parsedQuery.power.toLowerCase())) {
    score += 30;
  }
  
  // Category match
  if (parsedQuery.category) {
    const categoryLower = parsedQuery.category.toLowerCase();
    if (searchableText.includes(categoryLower)) {
      score += 20;
    }
  }
  
  // Expanded term matches (aliases)
  for (const term of expandedTerms) {
    if (searchableText.includes(term.toLowerCase())) {
      score += 10;
    }
  }
  
  // Boost active products
  if (product.is_active) {
    score += 5;
  }
  
  return score;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 20, includeDiscontinued = true } = await req.json();
    
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ products: [], parsedQuery: null, suggestions: { discontinued: [], replacements: [] } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the query
    const parsedQuery = parseQuery(query);
    
    // Fetch aliases for expanded search
    const { data: aliases } = await supabase
      .from("search_aliases")
      .select("alias, canonical_term")
      .eq("is_active", true);
    
    // Build expanded search terms from aliases
    const expandedTerms = new Set<string>();
    const allTerms = [
      ...parsedQuery.normalizedTerms,
      parsedQuery.brand?.toLowerCase(),
      parsedQuery.category?.toLowerCase()
    ].filter(Boolean) as string[];
    
    for (const term of allTerms) {
      expandedTerms.add(term);
      
      // Find matching aliases and add their canonical terms
      if (aliases) {
        for (const alias of aliases) {
          if (alias.alias.toLowerCase() === term || alias.canonical_term.toLowerCase() === term) {
            expandedTerms.add(alias.alias.toLowerCase());
            expandedTerms.add(alias.canonical_term.toLowerCase());
          }
        }
      }
    }

    // Fetch products (including discontinued if requested)
    // PLIS: Always include discontinued, optionally include obsolete
    let productQuery = supabase
      .from("products")
      .select(`
        id, name, series, sku, brand, power_range, short_description, 
        image_url, is_active, lifecycle_status,
        product_category_mapping(product_categories(name))
      `);
    
    if (!includeDiscontinued) {
      // Only active products
      productQuery = productQuery.eq("lifecycle_status", "active");
    } else {
      // Active + Discontinued (exclude obsolete by default)
      productQuery = productQuery.in("lifecycle_status", ["active", "discontinued"]);
    }
    
    const { data: products, error } = await productQuery;
    
    if (error) throw error;

    // Fetch replacement counts for discontinued products
    const { data: replacementCounts } = await supabase
      .from("product_replacements")
      .select("product_id");
    
    const productsWithReplacements = new Set(
      (replacementCounts || []).map((r: any) => r.product_id)
    );
    
    // Score and filter products
    const scoredProducts: (SearchResult & { match_score: number })[] = [];
    
    for (const product of products || []) {
      const score = calculateMatchScore(product, parsedQuery, Array.from(expandedTerms));
      
      if (score > 0) {
        const categoryMapping = product.product_category_mapping as any[];
        const categoryName = categoryMapping?.[0]?.product_categories?.name || null;
        const lifecycleStatus = product.lifecycle_status || (product.is_active ? 'active' : 'discontinued');
        
        scoredProducts.push({
          id: product.id,
          name: product.name,
          series: product.series,
          sku: product.sku,
          brand: product.brand,
          power_range: product.power_range,
          short_description: product.short_description,
          image_url: product.image_url,
          is_active: product.is_active,
          lifecycle_status: lifecycleStatus,
          category_name: categoryName,
          match_score: score,
          has_replacements: productsWithReplacements.has(product.id)
        });
      }
    }
    
    // Sort by score (descending) and limit
    scoredProducts.sort((a, b) => b.match_score - a.match_score);
    const topProducts = scoredProducts.slice(0, limit);
    
    // PLIS: Separate active and discontinued products based on lifecycle_status
    const activeProducts = topProducts.filter(p => p.lifecycle_status === 'active');
    const discontinuedProducts = topProducts.filter(p => 
      p.lifecycle_status === 'discontinued' || p.lifecycle_status === 'obsolete'
    );
    
    // Find replacements for discontinued products (same series, active)
    const replacements: SearchResult[] = [];
    for (const discontinued of discontinuedProducts.slice(0, 3)) {
      const replacement = activeProducts.find(
        p => p.series === discontinued.series && p.id !== discontinued.id
      );
      if (replacement && !replacements.find(r => r.id === replacement.id)) {
        replacements.push(replacement);
      }
    }

    return new Response(
      JSON.stringify({
        products: topProducts,
        parsedQuery: {
          brand: parsedQuery.brand,
          category: parsedQuery.category,
          power: parsedQuery.power,
          normalizedTerms: parsedQuery.normalizedTerms,
          expandedTerms: Array.from(expandedTerms)
        },
        suggestions: {
          discontinued: discontinuedProducts.slice(0, 3),
          replacements
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Intelligent search error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
