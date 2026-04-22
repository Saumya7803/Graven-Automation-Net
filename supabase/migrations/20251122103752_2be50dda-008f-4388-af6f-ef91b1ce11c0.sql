-- Phase 2: Create authors table for E-E-A-T signals
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  title TEXT,
  expertise TEXT[],
  image_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Admins can manage authors
CREATE POLICY "Admins can manage authors"
ON public.authors
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view authors
CREATE POLICY "Anyone can view authors"
ON public.authors
FOR SELECT
USING (true);

-- Phase 2: Create case_studies table
CREATE TABLE public.case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT,
  client_logo_url TEXT,
  industry TEXT,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results JSONB DEFAULT '{}'::jsonb,
  testimonial TEXT,
  products_used UUID[],
  featured_image TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Admins can manage case studies
CREATE POLICY "Admins can manage case studies"
ON public.case_studies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view published case studies
CREATE POLICY "Anyone can view published case studies"
ON public.case_studies
FOR SELECT
USING (published = true);

-- Phase 6: Create seo_health_checks table for monitoring
CREATE TABLE public.seo_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type TEXT NOT NULL,
  page_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  issues JSONB DEFAULT '[]'::jsonb,
  score INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.seo_health_checks ENABLE ROW LEVEL SECURITY;

-- Admins can manage SEO health checks
CREATE POLICY "Admins can manage SEO health checks"
ON public.seo_health_checks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add author_id to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.authors(id);

-- Add author_id to knowledge_hub_pages
ALTER TABLE public.knowledge_hub_pages 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.authors(id);

-- Add video_url to products for Phase 4
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS video_duration TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_authors_name ON public.authors(name);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON public.case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON public.case_studies(published);
CREATE INDEX IF NOT EXISTS idx_seo_health_checks_type ON public.seo_health_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_seo_health_checks_checked_at ON public.seo_health_checks(checked_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();