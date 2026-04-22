-- Add is_quote_only field to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_quote_only BOOLEAN DEFAULT false;

-- Make price nullable for quote-only products
ALTER TABLE products 
ALTER COLUMN price DROP NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_quote_only ON products(is_quote_only);

-- Add comment for documentation
COMMENT ON COLUMN products.is_quote_only IS 'When true, product requires quotation and cannot be added to cart directly';