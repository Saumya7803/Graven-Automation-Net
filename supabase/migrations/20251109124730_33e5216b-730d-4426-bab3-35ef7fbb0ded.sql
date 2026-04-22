-- Enable admins to update quotation request items (especially for pricing)
CREATE POLICY "Admins can update quotation request items"
ON public.quotation_request_items
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));