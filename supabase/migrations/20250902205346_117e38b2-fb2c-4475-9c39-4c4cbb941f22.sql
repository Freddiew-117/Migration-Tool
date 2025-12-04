-- Fix critical security vulnerability in migration_acknowledgements table
-- Remove public access that was exposing sensitive user data

-- Drop the current insecure SELECT policy
DROP POLICY IF EXISTS "Users can view acknowledgements" ON public.migration_acknowledgements;

-- Create a secure SELECT policy that only allows:
-- 1. Authenticated users to view their own acknowledgements
-- 2. Super admins to view all (they already have a separate policy)
CREATE POLICY "Users can view their own acknowledgements only"
ON public.migration_acknowledgements
FOR SELECT
USING (
  (auth.uid() IS NOT NULL) AND (auth.uid() = user_id)
);