-- Add document URL columns to orders table
ALTER TABLE public.orders
ADD COLUMN tax_invoice_url TEXT,
ADD COLUMN eway_bill_url TEXT;

-- Create storage bucket for order documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-documents', 'order-documents', false);

-- RLS policies for order-documents bucket

-- Admins can upload documents
CREATE POLICY "Admins can upload order documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'order-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can view all order documents
CREATE POLICY "Admins can view all order documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Users can view documents for their own orders
CREATE POLICY "Users can view their order documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-documents' AND
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.user_id = auth.uid()
    AND orders.id::text = (storage.foldername(name))[1]
  )
);

-- Admins can delete order documents
CREATE POLICY "Admins can delete order documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'order-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Admins can update order documents
CREATE POLICY "Admins can update order documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'order-documents' AND
  has_role(auth.uid(), 'admin'::app_role)
);