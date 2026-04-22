-- Allow admins to delete quotation request items
CREATE POLICY "Admins can delete quotation request items"
ON quotation_request_items
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete quotation requests
CREATE POLICY "Admins can delete quotation requests"
ON quotation_requests
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
);