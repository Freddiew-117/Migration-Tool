-- ============================================
-- Initial Database Schema for Migration Portal
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- ============================================
-- Core Tables
-- ============================================

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create web3_networks table for admin management
CREATE TABLE public.web3_networks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  chain_id INTEGER NOT NULL UNIQUE,
  chain_id_hex TEXT,
  chainlist_id INTEGER,
  rpc_url TEXT NOT NULL,
  rpc_urls JSONB,
  explorer_url TEXT,
  block_explorer_name TEXT,
  native_currency_name TEXT,
  native_currency_symbol TEXT,
  native_currency_decimals INTEGER,
  icon_url TEXT,
  faucets JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_testnet BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Create smart_contracts table for admin management
CREATE TABLE public.smart_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  network_id UUID NOT NULL REFERENCES public.web3_networks(id) ON DELETE CASCADE,
  abi JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- ============================================
-- Migration Tables
-- ============================================

-- Create migration_acknowledgements table
CREATE TABLE public.migration_acknowledgements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  acknowledgement_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create migration_events table
CREATE TABLE public.migration_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  acknowledgement_id UUID REFERENCES public.migration_acknowledgements(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  token_type TEXT NOT NULL, -- 'CIFI' or 'REFI'
  amount TEXT NOT NULL,
  old_contract_address TEXT NOT NULL,
  new_contract_address TEXT NOT NULL,
  transaction_hash TEXT,
  block_number INTEGER,
  gas_used TEXT,
  gas_price TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  -- Base network distribution fields
  base_distribution_tx_hash TEXT,
  base_distribution_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  base_distribution_sent_at TIMESTAMP WITH TIME ZONE,
  base_v2_token_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- Incubator Tables
-- ============================================

-- Create business category enum
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

-- Create application status enum
CREATE TYPE application_status AS ENUM (
  'submitted',
  'under_review', 
  'approved',
  'rejected',
  'waitlisted'
);

-- Create incubator_applications table
CREATE TABLE public.incubator_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  founder_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  company_name TEXT,
  business_category business_category NOT NULL,
  website_url TEXT,
  stage TEXT NOT NULL,
  description TEXT NOT NULL,
  founder_background TEXT,
  team_size INTEGER,
  team_experience TEXT,
  team_emails TEXT,
  team_linkedin TEXT,
  funding_raised BIGINT,
  funding_needed BIGINT,
  use_of_funds TEXT,
  technology_stack TEXT[],
  blockchain_networks TEXT[],
  custom_networks TEXT,
  smart_contracts_deployed BOOLEAN DEFAULT false,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  linkedin_profile TEXT,
  why_join TEXT NOT NULL,
  goals TEXT,
  timeline TEXT,
  status application_status DEFAULT 'submitted',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  pitch_deck_url TEXT,
  business_plan_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- Support Tables
-- ============================================

-- Create support_messages table
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  admin_id UUID REFERENCES auth.users(id),
  user_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- Feature Requests Table
-- ============================================

CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'implemented')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- Enable Row Level Security
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web3_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incubator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'super_admin'::app_role)
$$;

-- Function to handle new user signup
-- NOTE: Update the email in this function to assign super_admin to your email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign super_admin role to your email, regular user role to others
  -- TODO: Replace 'your-email@example.com' with your actual email
  IF NEW.email = 'your-email@example.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- Triggers
-- ============================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_web3_networks_updated_at
  BEFORE UPDATE ON public.web3_networks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_contracts_updated_at
  BEFORE UPDATE ON public.smart_contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_migration_acknowledgements_updated_at
  BEFORE UPDATE ON public.migration_acknowledgements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_migration_events_updated_at
  BEFORE UPDATE ON public.migration_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_incubator_applications_updated_at
  BEFORE UPDATE ON public.incubator_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_migration_acknowledgements_user_id ON public.migration_acknowledgements(user_id);
CREATE INDEX idx_migration_acknowledgements_wallet_address ON public.migration_acknowledgements(wallet_address);
CREATE INDEX idx_migration_events_acknowledgement_id ON public.migration_events(acknowledgement_id);
CREATE INDEX idx_migration_events_wallet_address ON public.migration_events(wallet_address);
CREATE INDEX idx_migration_events_transaction_hash ON public.migration_events(transaction_hash);
CREATE INDEX idx_migration_events_base_status ON public.migration_events(base_distribution_status);
CREATE INDEX idx_migration_events_base_tx_hash ON public.migration_events(base_distribution_tx_hash);
CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX idx_support_messages_status ON public.support_messages(status);
CREATE INDEX idx_support_messages_priority ON public.support_messages(priority);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);

-- ============================================
-- RLS Policies
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_super_admin());

-- User roles policies
CREATE POLICY "Super admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Web3 networks policies
CREATE POLICY "Super admins can manage all networks" 
ON public.web3_networks 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Authenticated users can view active networks" 
ON public.web3_networks 
FOR SELECT 
USING (auth.role() = 'authenticated' AND is_active = true);

-- Smart contracts policies
CREATE POLICY "Super admins can manage all contracts" 
ON public.smart_contracts 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Authenticated users can view active contracts" 
ON public.smart_contracts 
FOR SELECT 
USING (auth.role() = 'authenticated' AND is_active = true);

-- Migration acknowledgements policies
CREATE POLICY "Super admins can manage all acknowledgements" 
ON public.migration_acknowledgements 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Users can view their own acknowledgements" 
ON public.migration_acknowledgements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own acknowledgements" 
ON public.migration_acknowledgements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Migration events policies
CREATE POLICY "Super admins can manage all migration events" 
ON public.migration_events 
FOR ALL 
USING (is_super_admin());

CREATE POLICY "Users can view their own migration events" 
ON public.migration_events 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.migration_acknowledgements 
    WHERE id = migration_events.acknowledgement_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "System can insert migration events" 
ON public.migration_events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.migration_acknowledgements 
    WHERE id = migration_events.acknowledgement_id 
    AND user_id = auth.uid()
  )
);

-- Incubator applications policies
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

-- Support messages policies
CREATE POLICY "Users can insert support messages" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

CREATE POLICY "Users can view their own support messages" 
ON public.support_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all support messages" 
ON public.support_messages 
FOR ALL 
USING (is_super_admin());

-- Feature requests policies
CREATE POLICY "Users can insert feature requests" 
ON public.feature_requests 
FOR INSERT 
WITH CHECK ((auth.uid() IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can view their own feature requests" 
ON public.feature_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all feature requests" 
ON public.feature_requests 
FOR ALL 
USING (is_super_admin());

