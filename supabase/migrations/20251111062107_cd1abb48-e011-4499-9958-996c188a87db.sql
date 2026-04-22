-- Create google_shopping_performance table for tracking product performance metrics
CREATE TABLE IF NOT EXISTS public.google_shopping_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_product_id TEXT NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(merchant_product_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_google_shopping_performance_product 
  ON public.google_shopping_performance(merchant_product_id);

CREATE INDEX IF NOT EXISTS idx_google_shopping_performance_date 
  ON public.google_shopping_performance(date DESC);

-- Enable RLS
ALTER TABLE public.google_shopping_performance ENABLE ROW LEVEL SECURITY;

-- Admin users can view all performance data
CREATE POLICY "Admins can view all performance data"
  ON public.google_shopping_performance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_google_shopping_performance_updated_at
  BEFORE UPDATE ON public.google_shopping_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();