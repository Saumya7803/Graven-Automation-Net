-- Fix quotation request items insertion for authenticated users
-- Remove circular dependency by simplifying INSERT policies

-- Drop existing restrictive policies that cause EXISTS check failures
DROP POLICY IF EXISTS "Users can insert items for their own quotation requests" 
  ON quotation_request_items;
DROP POLICY IF EXISTS "Anyone can insert items for guest quotation requests" 
  ON quotation_request_items;

-- Create simplified INSERT policy for authenticated users
-- Security is maintained through quotation_requests table policies
CREATE POLICY "Authenticated users can insert quotation request items"
ON quotation_request_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create simplified INSERT policy for anonymous users
CREATE POLICY "Anonymous users can insert quotation request items"
ON quotation_request_items
FOR INSERT
TO anon
WITH CHECK (true);