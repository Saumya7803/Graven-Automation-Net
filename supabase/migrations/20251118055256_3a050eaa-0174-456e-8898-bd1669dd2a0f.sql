-- Create junction table for product-category mapping
CREATE TABLE IF NOT EXISTS public.product_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_category_mapping_product_id ON public.product_category_mapping(product_id);
CREATE INDEX IF NOT EXISTS idx_product_category_mapping_category_id ON public.product_category_mapping(category_id);

-- Migrate existing data from products.category_id to junction table
INSERT INTO public.product_category_mapping (product_id, category_id)
SELECT id, category_id 
FROM public.products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_id, category_id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.product_category_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view category mappings"
  ON public.product_category_mapping
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage category mappings"
  ON public.product_category_mapping
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add comment for documentation
COMMENT ON TABLE public.product_category_mapping IS 'Junction table allowing products to belong to multiple categories';