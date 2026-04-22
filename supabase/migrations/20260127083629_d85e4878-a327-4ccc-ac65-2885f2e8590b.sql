-- Product Lifecycle Intelligence System (PLIS) Migration
-- Add lifecycle status and tracking columns to products table

-- Add lifecycle_status column with proper enum values
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS lifecycle_status TEXT DEFAULT 'active' 
CHECK (lifecycle_status IN ('active', 'discontinued', 'obsolete'));

-- Add OEM discontinuation date tracking
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discontinued_at DATE;

-- Add internal sales notes field (hidden from public)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS lifecycle_notes TEXT;

-- Sync existing is_active data to lifecycle_status
UPDATE products 
SET lifecycle_status = CASE 
  WHEN is_active = true THEN 'active'
  WHEN is_active = false THEN 'discontinued'
  ELSE 'active'
END
WHERE lifecycle_status IS NULL OR lifecycle_status = 'active';

-- Create product_replacements table for mapping discontinued products to alternatives
CREATE TABLE IF NOT EXISTS product_replacements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  replacement_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  replacement_type TEXT NOT NULL CHECK (replacement_type IN (
    'oem_recommended',       -- Direct OEM replacement
    'same_brand_series',     -- Same brand, newer series
    'functional_equivalent', -- Cross-brand equivalent
    'compatible_alternative' -- Last resort alternative
  )),
  compatibility_notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_replacement_mapping UNIQUE(product_id, replacement_product_id),
  CONSTRAINT no_self_replacement CHECK (product_id != replacement_product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_replacements_product_id ON product_replacements(product_id);
CREATE INDEX IF NOT EXISTS idx_product_replacements_replacement_id ON product_replacements(replacement_product_id);
CREATE INDEX IF NOT EXISTS idx_products_lifecycle_status ON products(lifecycle_status);

-- Enable RLS on product_replacements
ALTER TABLE product_replacements ENABLE ROW LEVEL SECURITY;

-- Public read access for product replacements
CREATE POLICY "Public read access for replacements" 
ON product_replacements 
FOR SELECT 
USING (true);

-- Admin write access for product replacements
CREATE POLICY "Admin insert replacements" 
ON product_replacements 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admin update replacements" 
ON product_replacements 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admin delete replacements" 
ON product_replacements 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_replacements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_replacements_updated_at
  BEFORE UPDATE ON product_replacements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_replacements_updated_at();