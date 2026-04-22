-- Phase 1: SEO Management Database Architecture

-- Main SEO keywords table with smart categorization
CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL UNIQUE,
  search_volume INTEGER,
  keyword_difficulty INTEGER CHECK (keyword_difficulty BETWEEN 0 AND 100),
  keyword_type TEXT CHECK (keyword_type IN (
    'location', 'product_model', 'power_rating', 'industry', 
    'commercial', 'informational', 'near_me', 'international'
  )),
  
  -- Geographic data
  country TEXT DEFAULT 'India',
  state TEXT,
  city TEXT,
  
  -- Product data
  product_series TEXT,
  power_rating TEXT,
  
  -- Classification
  search_intent TEXT CHECK (search_intent IN ('informational', 'navigational', 'transactional', 'commercial')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  
  -- Target mapping
  target_url TEXT,
  target_page_type TEXT CHECK (target_page_type IN (
    'location_page', 'product_page', 'pricing_page', 'blog_post', 'international_page'
  )),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_seo_keywords_city ON seo_keywords(city) WHERE city IS NOT NULL;
CREATE INDEX idx_seo_keywords_type ON seo_keywords(keyword_type);
CREATE INDEX idx_seo_keywords_priority ON seo_keywords(priority DESC);

-- Location landing pages for cities/states/countries
CREATE TABLE seo_location_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Location info
  location_type TEXT NOT NULL CHECK (location_type IN ('city', 'state', 'country', 'industrial_area')),
  country TEXT NOT NULL DEFAULT 'India',
  state TEXT,
  city TEXT NOT NULL,
  area_name TEXT,
  
  -- SEO content
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT,
  
  h1_title TEXT NOT NULL,
  intro_content TEXT NOT NULL,
  
  -- Location-specific content
  local_industries JSONB DEFAULT '[]'::jsonb,
  service_areas JSONB DEFAULT '[]'::jsonb,
  delivery_info TEXT,
  local_stats TEXT,
  
  -- Contact & business info
  local_contact_number TEXT,
  local_address TEXT,
  google_maps_embed TEXT,
  
  -- Geographic coordinates for schema
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 3,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_location_pages_slug ON seo_location_pages(slug);
CREATE INDEX idx_location_pages_city ON seo_location_pages(city);
CREATE INDEX idx_location_pages_country ON seo_location_pages(country);
CREATE INDEX idx_location_pages_published ON seo_location_pages(is_published) WHERE is_published = true;

-- Product power variant pages
CREATE TABLE seo_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Power specifications
  power_rating TEXT NOT NULL,
  power_hp TEXT,
  power_range_min DECIMAL,
  power_range_max DECIMAL,
  power_unit TEXT,
  
  -- Location context
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  
  -- SEO content
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  
  -- Page content
  intro_text TEXT,
  applications_text TEXT,
  technical_content TEXT,
  
  -- Pricing
  display_price BOOLEAN DEFAULT false,
  price_context TEXT,
  
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON seo_product_variants(product_id);
CREATE INDEX idx_product_variants_city ON seo_product_variants(city);
CREATE INDEX idx_product_variants_slug ON seo_product_variants(slug);

-- International market pages
CREATE TABLE seo_international_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Country info
  country TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL,
  region TEXT,
  
  -- SEO content
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  
  -- Content sections
  intro_content TEXT,
  shipping_info TEXT,
  customs_info TEXT,
  delivery_time TEXT,
  
  -- Localization
  currency_code TEXT,
  currency_symbol TEXT,
  language_code TEXT DEFAULT 'en',
  
  -- Local presence
  has_local_office BOOLEAN DEFAULT false,
  local_contact TEXT,
  local_certifications JSONB DEFAULT '[]'::jsonb,
  
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_international_pages_country ON seo_international_pages(country);
CREATE INDEX idx_international_pages_region ON seo_international_pages(region);

-- Pricing pages for transparency
CREATE TABLE seo_pricing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  page_type TEXT NOT NULL CHECK (page_type IN ('master_list', 'series_specific', 'power_range', 'location_specific')),
  
  -- Target info
  product_series TEXT,
  power_range TEXT,
  city TEXT,
  
  -- SEO
  slug TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  h1_title TEXT NOT NULL,
  
  -- Content
  intro_text TEXT,
  pricing_table_data JSONB,
  special_offers TEXT,
  bulk_discount_info TEXT,
  
  -- Display options
  show_exact_prices BOOLEAN DEFAULT true,
  show_discount_info BOOLEAN DEFAULT true,
  
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pricing_pages_series ON seo_pricing_pages(product_series);
CREATE INDEX idx_pricing_pages_slug ON seo_pricing_pages(slug);

-- Keyword to content mapping
CREATE TABLE seo_keyword_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_id UUID REFERENCES seo_keywords(id) ON DELETE CASCADE,
  
  -- Target content
  target_type TEXT NOT NULL CHECK (target_type IN (
    'location_page', 'product_variant', 'pricing_page', 'international_page', 'blog_post', 'product_page'
  )),
  target_id UUID NOT NULL,
  
  -- Position in content
  position TEXT CHECK (position IN ('title', 'h1', 'h2', 'h3', 'meta_description', 'content_body', 'url')),
  is_primary_keyword BOOLEAN DEFAULT false,
  
  -- Performance tracking
  current_ranking INTEGER,
  last_checked TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_keyword_mappings_keyword ON seo_keyword_mappings(keyword_id);
CREATE INDEX idx_keyword_mappings_target ON seo_keyword_mappings(target_type, target_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_keywords_updated_at BEFORE UPDATE ON seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_seo_updated_at();

CREATE TRIGGER location_pages_updated_at BEFORE UPDATE ON seo_location_pages
  FOR EACH ROW EXECUTE FUNCTION update_seo_updated_at();

CREATE TRIGGER product_variants_updated_at BEFORE UPDATE ON seo_product_variants
  FOR EACH ROW EXECUTE FUNCTION update_seo_updated_at();

CREATE TRIGGER international_pages_updated_at BEFORE UPDATE ON seo_international_pages
  FOR EACH ROW EXECUTE FUNCTION update_seo_updated_at();

CREATE TRIGGER pricing_pages_updated_at BEFORE UPDATE ON seo_pricing_pages
  FOR EACH ROW EXECUTE FUNCTION update_seo_updated_at();

-- RLS Policies
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SEO keywords"
ON seo_keywords FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active keywords"
ON seo_keywords FOR SELECT
TO public
USING (is_active = true);

ALTER TABLE seo_location_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage location pages"
ON seo_location_pages FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published location pages"
ON seo_location_pages FOR SELECT
TO public
USING (is_published = true);

ALTER TABLE seo_product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage product variants"
ON seo_product_variants FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published variants"
ON seo_product_variants FOR SELECT
TO public
USING (is_published = true);

ALTER TABLE seo_international_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage international pages"
ON seo_international_pages FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published international pages"
ON seo_international_pages FOR SELECT
TO public
USING (is_published = true);

ALTER TABLE seo_pricing_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pricing pages"
ON seo_pricing_pages FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published pricing pages"
ON seo_pricing_pages FOR SELECT
TO public
USING (is_published = true);

ALTER TABLE seo_keyword_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage keyword mappings"
ON seo_keyword_mappings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));