-- Add is_final column to quotation_requests
ALTER TABLE quotation_requests 
ADD COLUMN is_final BOOLEAN DEFAULT false;

-- Add comment explaining the column
COMMENT ON COLUMN quotation_requests.is_final IS 'When true, prevents customer from requesting revisions. Admin sets this for final quotations.';