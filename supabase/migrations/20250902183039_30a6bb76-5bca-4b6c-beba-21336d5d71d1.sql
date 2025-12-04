-- Add wallet_address column to feature_requests table
ALTER TABLE public.feature_requests 
ADD COLUMN wallet_address TEXT NOT NULL DEFAULT '';

-- Update existing records to have a placeholder wallet address
-- This ensures backward compatibility
UPDATE public.feature_requests 
SET wallet_address = 'legacy-request-' || id::text 
WHERE wallet_address = '';

-- Drop existing RLS policies that only check user_id
DROP POLICY IF EXISTS "Users can view their own feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can insert their own feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can update their own submitted feature requests" ON public.feature_requests;

-- Create new RLS policies that check BOTH user_id AND wallet_address
CREATE POLICY "Users can view their own wallet-specific feature requests" 
ON public.feature_requests 
FOR SELECT 
USING (auth.uid() = user_id AND wallet_address != '');

CREATE POLICY "Users can insert their own wallet-specific feature requests" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND wallet_address != '');

CREATE POLICY "Users can update their own wallet-specific submitted feature requests" 
ON public.feature_requests 
FOR UPDATE 
USING (auth.uid() = user_id AND wallet_address != '' AND status = 'submitted'::feature_request_status);

-- Super admins can still manage all feature requests (unchanged)
-- This policy should already exist from the existing setup