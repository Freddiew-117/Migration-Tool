-- Create a table to store authorized admin emails securely
CREATE TABLE IF NOT EXISTS public.authorized_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.authorized_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage authorized admins
CREATE POLICY "Only super admins can manage authorized admins"
ON public.authorized_admins
FOR ALL
USING (is_super_admin());

-- Insert the authorized admin email
INSERT INTO public.authorized_admins (email) 
VALUES ('johnny@elitweb3.com')
ON CONFLICT (email) DO NOTHING;

-- Create function to check if email is authorized
CREATE OR REPLACE FUNCTION public.is_authorized_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.authorized_admins 
    WHERE email = user_email
  );
$$;