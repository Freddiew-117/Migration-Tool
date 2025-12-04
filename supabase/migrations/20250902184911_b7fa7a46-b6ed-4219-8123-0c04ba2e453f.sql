-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own acknowledgements" ON public.migration_acknowledgements;

-- Create new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Allow anonymous and authenticated users to insert acknowledgements" 
ON public.migration_acknowledgements 
FOR INSERT 
WITH CHECK (
  -- Allow anonymous users (user_id IS NULL)
  (auth.uid() IS NULL AND user_id IS NULL) OR
  -- Allow authenticated users to insert their own acknowledgements
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Update the SELECT policy to also allow viewing acknowledgements by wallet address for anonymous users
DROP POLICY IF EXISTS "Users can view their own acknowledgements" ON public.migration_acknowledgements;

CREATE POLICY "Users can view acknowledgements" 
ON public.migration_acknowledgements 
FOR SELECT 
USING (
  -- Authenticated users can view their own acknowledgements
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Allow viewing by wallet address for migration history (needed for the migration portal)
  (wallet_address IS NOT NULL)
);