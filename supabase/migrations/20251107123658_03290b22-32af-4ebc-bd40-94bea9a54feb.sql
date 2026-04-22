-- Fix 1: Restrict callback_requests policies
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Users can insert their own callback requests" ON public.callback_requests;

-- Replace with secure policies
CREATE POLICY "Authenticated users can insert their callbacks"
ON public.callback_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can insert callbacks without user_id"
ON public.callback_requests
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Fix 2: Restrict customer_questions policies  
DROP POLICY IF EXISTS "Users can insert their own questions" ON public.customer_questions;

CREATE POLICY "Authenticated users can insert their questions"
ON public.customer_questions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can insert questions without user_id"
ON public.customer_questions
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Fix 3: Remove anonymous viewing policy from quotation_requests
DROP POLICY IF EXISTS "Anonymous users can view guest quotation requests" ON public.quotation_requests;

-- Fix 4: Restrict newsletter_subscribers enumeration
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscribers;

CREATE POLICY "Users can view only their subscription by user_id"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());