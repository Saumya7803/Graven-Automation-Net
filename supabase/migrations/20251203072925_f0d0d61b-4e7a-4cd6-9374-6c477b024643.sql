-- Add shipping_cost column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;

COMMENT ON COLUMN products.shipping_cost IS 'Shipping cost per unit in INR';