-- Add results tracking columns to search_analytics
ALTER TABLE search_analytics 
ADD COLUMN IF NOT EXISTS results_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS zero_results_count INTEGER DEFAULT 0;

-- Create index for zero-result queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_search_analytics_zero_results 
ON search_analytics(zero_results_count DESC) 
WHERE zero_results_count > 0;

-- Create index for date-based queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_search_analytics_last_searched 
ON search_analytics(last_searched_at DESC);