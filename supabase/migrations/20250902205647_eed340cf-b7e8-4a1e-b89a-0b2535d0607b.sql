-- Allow anonymous feature requests with wallet connection
-- Make user_id nullable and add user_email for anonymous users
ALTER TABLE public.feature_requests 
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies for feature_requests
DROP POLICY IF EXISTS "Users can insert their own wallet-specific feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can view their own wallet-specific feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can update their own wallet-specific submitted feature re" ON public.feature_requests;

-- Create new RLS policies that support both authenticated and anonymous users
-- Anonymous users need wallet_address and user_email, authenticated users can use either

-- Insert policy: Allow authenticated users OR anonymous users with wallet + email
CREATE POLICY "Users can insert feature requests with wallet connection" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK (
  (wallet_address <> ''::text) AND 
  (user_email <> ''::text) AND
  (
    -- Authenticated user: must match their user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- Anonymous user: user_id must be null
    (auth.uid() IS NULL AND user_id IS NULL)
  )
);

-- Select policy: Users can view their own requests (by user_id or wallet_address)
CREATE POLICY "Users can view their own feature requests" 
ON public.feature_requests 
FOR SELECT 
USING (
  -- Authenticated users can see their own requests
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Anonymous users can see requests they made (match by wallet + email for security)
  (auth.uid() IS NULL AND user_id IS NULL AND wallet_address <> ''::text)
);

-- Update policy: Only authenticated users can update, and only their own submitted requests
CREATE POLICY "Authenticated users can update their own submitted requests" 
ON public.feature_requests 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() = user_id AND 
  status = 'submitted'::feature_request_status
);