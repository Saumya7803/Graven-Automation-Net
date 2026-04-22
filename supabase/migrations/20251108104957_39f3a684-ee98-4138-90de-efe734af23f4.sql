-- Create search analytics table to track popular searches
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL UNIQUE,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON public.search_analytics(search_query);
CREATE INDEX IF NOT EXISTS idx_search_analytics_count ON public.search_analytics(search_count DESC);

-- Enable RLS
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can view search analytics (for displaying popular searches)
CREATE POLICY "Anyone can view search analytics"
  ON public.search_analytics FOR SELECT
  USING (true);

-- Anyone can insert/update search analytics (via edge function or direct)
CREATE POLICY "Anyone can track searches"
  ON public.search_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update search counts"
  ON public.search_analytics FOR UPDATE
  USING (true);