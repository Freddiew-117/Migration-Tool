-- Create enums for incubator applications
CREATE TYPE business_category AS ENUM (
  'fintech',
  'defi', 
  'nft',
  'gamefi',
  'infrastructure',
  'dao',
  'analytics',
  'trading',
  'lending',
  'insurance',
  'other'
);

CREATE TYPE application_status AS ENUM (
  'submitted',
  'under_review', 
  'approved',
  'rejected',
  'waitlisted'
);

-- Create incubator_applications table
CREATE TABLE public.incubator_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  founder_name text NOT NULL,
  project_name text NOT NULL,
  company_name text,
  business_category business_category NOT NULL,
  website_url text,
  stage text NOT NULL,
  description text NOT NULL,
  founder_background text,
  team_size integer,
  team_experience text,
  team_emails text,
  team_linkedin text,
  funding_raised bigint,
  funding_needed bigint,
  use_of_funds text,
  technology_stack text[],
  blockchain_networks text[],
  custom_networks text,
  smart_contracts_deployed boolean DEFAULT false,
  contact_email text NOT NULL,
  contact_phone text,
  linkedin_profile text,
  why_join text NOT NULL,
  goals text,
  timeline text,
  status application_status DEFAULT 'submitted',
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  pitch_deck_url text,
  business_plan_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.incubator_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage all applications" 
ON public.incubator_applications 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Users can insert applications" 
ON public.incubator_applications 
FOR INSERT 
WITH CHECK ((auth.uid() IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can view their own applications" 
ON public.incubator_applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications when submitted" 
ON public.incubator_applications 
FOR UPDATE 
USING ((auth.uid() = user_id) AND (status = 'submitted'));

-- Add trigger for updated_at
CREATE TRIGGER update_incubator_applications_updated_at
BEFORE UPDATE ON public.incubator_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();