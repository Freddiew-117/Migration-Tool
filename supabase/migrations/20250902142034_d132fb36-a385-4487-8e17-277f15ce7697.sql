-- Create enums for feature requests
CREATE TYPE feature_request_category AS ENUM (
  'ui_ux',
  'performance', 
  'security',
  'integrations',
  'analytics',
  'other'
);

CREATE TYPE feature_request_priority AS ENUM (
  'low',
  'medium',
  'high', 
  'critical'
);

CREATE TYPE feature_request_status AS ENUM (
  'submitted',
  'under_review',
  'in_development', 
  'completed',
  'rejected'
);

-- Create feature_requests table
CREATE TABLE public.feature_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users,
  title text NOT NULL,
  description text NOT NULL,
  category feature_request_category NOT NULL,
  priority feature_request_priority NOT NULL DEFAULT 'medium',
  status feature_request_status NOT NULL DEFAULT 'submitted',
  use_case text,
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users,
  reviewed_at timestamp with time zone,
  user_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage all feature requests" 
ON public.feature_requests 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Users can insert their own feature requests" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feature requests" 
ON public.feature_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own submitted feature requests" 
ON public.feature_requests 
FOR UPDATE 
USING ((auth.uid() = user_id) AND (status = 'submitted'));

-- Add trigger for updated_at
CREATE TRIGGER update_feature_requests_updated_at
BEFORE UPDATE ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to populate user email
CREATE OR REPLACE FUNCTION public.populate_feature_request_user_email()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT email INTO NEW.user_email 
  FROM auth.users 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER populate_feature_request_user_email_trigger
BEFORE INSERT ON public.feature_requests
FOR EACH ROW
EXECUTE FUNCTION public.populate_feature_request_user_email();