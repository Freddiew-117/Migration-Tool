-- Create migration_acknowledgements table
CREATE TABLE public.migration_acknowledgements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  acknowledgement_hash TEXT NOT NULL, -- Hash of the acknowledgement terms for verification
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
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.migration_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for migration_acknowledgements
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

-- RLS policies for migration_events
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

-- Add triggers for updated_at columns
CREATE TRIGGER update_migration_acknowledgements_updated_at
BEFORE UPDATE ON public.migration_acknowledgements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_migration_events_updated_at
BEFORE UPDATE ON public.migration_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_migration_acknowledgements_user_id ON public.migration_acknowledgements(user_id);
CREATE INDEX idx_migration_acknowledgements_wallet_address ON public.migration_acknowledgements(wallet_address);
CREATE INDEX idx_migration_events_acknowledgement_id ON public.migration_events(acknowledgement_id);
CREATE INDEX idx_migration_events_wallet_address ON public.migration_events(wallet_address);
CREATE INDEX idx_migration_events_transaction_hash ON public.migration_events(transaction_hash);