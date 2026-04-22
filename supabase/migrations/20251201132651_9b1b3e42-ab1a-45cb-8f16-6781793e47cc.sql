-- Make order-documents bucket public for direct URL access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'order-documents';

-- Allow public read access for order documents
CREATE POLICY "Anyone can view order documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'order-documents');