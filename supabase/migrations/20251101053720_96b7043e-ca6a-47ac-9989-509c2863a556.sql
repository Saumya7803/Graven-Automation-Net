-- Fix quotation request submission for guest users
-- The issue is that guest users can INSERT quotation requests with user_id IS NULL,
-- but they cannot SELECT these rows which causes the EXISTS check in 
-- quotation_request_items INSERT policy to fail.

-- Allow anonymous/guest users to view quotation requests they created (user_id IS NULL)
-- This is needed for the RLS policy checks on quotation_request_items
CREATE POLICY "Anonymous users can view guest quotation requests"
ON public.quotation_requests
FOR SELECT
TO anon
USING (user_id IS NULL);