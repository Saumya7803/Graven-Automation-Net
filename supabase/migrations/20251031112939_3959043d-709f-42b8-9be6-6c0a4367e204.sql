-- Create quotation_request_items table for multiple products per RFQ
CREATE TABLE public.quotation_request_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_request_id UUID NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotation_request_items
ALTER TABLE public.quotation_request_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotation_request_items
CREATE POLICY "Users can view items for their own quotation requests"
ON public.quotation_request_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.quotation_requests
    WHERE quotation_requests.id = quotation_request_items.quotation_request_id
    AND quotation_requests.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all quotation request items"
ON public.quotation_request_items
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert items for their own quotation requests"
ON public.quotation_request_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotation_requests
    WHERE quotation_requests.id = quotation_request_items.quotation_request_id
    AND quotation_requests.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can insert items for guest quotation requests"
ON public.quotation_request_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quotation_requests
    WHERE quotation_requests.id = quotation_request_items.quotation_request_id
    AND quotation_requests.user_id IS NULL
  )
);

-- Add attachment_url column to quotation_requests
ALTER TABLE public.quotation_requests 
ADD COLUMN attachment_url TEXT;

-- Create storage bucket for RFQ attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('rfq-attachments', 'rfq-attachments', false);

-- Storage policies for RFQ attachments
CREATE POLICY "Users can upload their own RFQ attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'rfq-attachments' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR auth.uid() IS NULL)
);

CREATE POLICY "Users can view their own RFQ attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'rfq-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all RFQ attachments"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'rfq-attachments' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete RFQ attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'rfq-attachments' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create index for better query performance
CREATE INDEX idx_quotation_request_items_quotation_id 
ON public.quotation_request_items(quotation_request_id);

CREATE INDEX idx_quotation_request_items_product_id 
ON public.quotation_request_items(product_id);