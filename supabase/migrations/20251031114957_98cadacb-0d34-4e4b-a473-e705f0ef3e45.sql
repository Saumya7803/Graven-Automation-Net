-- Add pricing fields to quotation_requests
ALTER TABLE public.quotation_requests 
ADD COLUMN IF NOT EXISTS quoted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS quote_notes TEXT,
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id);

-- Add pricing fields to quotation_request_items
ALTER TABLE public.quotation_request_items
ADD COLUMN IF NOT EXISTS unit_price NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS final_price NUMERIC DEFAULT 0;

-- Create quotation_revisions table for tracking history
CREATE TABLE IF NOT EXISTS public.quotation_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_request_id UUID NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  final_amount NUMERIC NOT NULL DEFAULT 0,
  revised_by UUID REFERENCES auth.users(id),
  revision_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotation_revisions
ALTER TABLE public.quotation_revisions ENABLE ROW LEVEL SECURITY;

-- RLS policies for quotation_revisions
CREATE POLICY "Admins can manage all revisions"
ON public.quotation_revisions
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their quotation revisions"
ON public.quotation_revisions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quotation_requests
    WHERE id = quotation_revisions.quotation_request_id
    AND user_id = auth.uid()
  )
);

-- Update RLS policies for quotation_requests to allow status transitions
CREATE POLICY "Users can finalize their quotes"
ON public.quotation_requests
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status IN ('quoted', 'revised'))
WITH CHECK (status IN ('finalized', 'revision_requested'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quotation_revisions_quotation_id 
ON public.quotation_revisions(quotation_request_id);

CREATE INDEX IF NOT EXISTS idx_quotation_requests_status 
ON public.quotation_requests(status);