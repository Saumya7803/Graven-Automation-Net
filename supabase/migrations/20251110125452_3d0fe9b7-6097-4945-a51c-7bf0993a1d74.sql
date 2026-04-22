-- Add Google Shopping required fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS gtin text,
ADD COLUMN IF NOT EXISTS brand text DEFAULT 'Schneider Electric',
ADD COLUMN IF NOT EXISTS condition text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS google_product_category text DEFAULT 'Hardware > Power & Electrical Supplies > Power Controllers & Transformers',
ADD COLUMN IF NOT EXISTS image_url text;

-- Add comment to explain the new columns
COMMENT ON COLUMN public.products.gtin IS 'Global Trade Item Number (barcode) for Google Shopping';
COMMENT ON COLUMN public.products.brand IS 'Product brand name';
COMMENT ON COLUMN public.products.condition IS 'Product condition: new, refurbished, or used';
COMMENT ON COLUMN public.products.google_product_category IS 'Google product taxonomy category';
COMMENT ON COLUMN public.products.image_url IS 'Main product image URL for Google Shopping feed';