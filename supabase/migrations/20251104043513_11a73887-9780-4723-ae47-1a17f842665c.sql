-- Update RLS policies for quotation_requests to require authentication

-- Drop the existing policy that allows guest users
DROP POLICY IF EXISTS "Anyone can insert quotation requests (guest users)" ON quotation_requests;

-- Drop the old authenticated user policy if it exists
DROP POLICY IF EXISTS "Users can insert quotation requests" ON quotation_requests;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can insert quotation requests"
  ON quotation_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());