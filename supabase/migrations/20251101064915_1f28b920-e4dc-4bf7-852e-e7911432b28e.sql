-- Create product_documents table
CREATE TABLE product_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_kb INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

-- Anyone can view active documents for active products
CREATE POLICY "Anyone can view active product documents"
  ON product_documents FOR SELECT
  USING (
    is_active = true 
    AND EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_documents.product_id 
      AND products.is_active = true
    )
  );

-- Admins can manage all documents
CREATE POLICY "Admins can manage product documents"
  ON product_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_product_documents_product_id ON product_documents(product_id);
CREATE INDEX idx_product_documents_active ON product_documents(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_product_documents_updated_at
  BEFORE UPDATE ON product_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-documents', 'product-documents', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view product documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-documents');

CREATE POLICY "Admins can upload product documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-documents' 
    AND (SELECT has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Admins can update product documents"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-documents' 
    AND (SELECT has_role(auth.uid(), 'admin'::app_role))
  );

CREATE POLICY "Admins can delete product documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-documents' 
    AND (SELECT has_role(auth.uid(), 'admin'::app_role))
  );