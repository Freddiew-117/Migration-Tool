-- Add fields to migration_events table to track Base network distributions
ALTER TABLE public.migration_events 
ADD COLUMN IF NOT EXISTS base_distribution_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS base_distribution_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
ADD COLUMN IF NOT EXISTS base_distribution_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS base_v2_token_address TEXT; -- V2 token address on Base network

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_migration_events_base_status ON public.migration_events(base_distribution_status);
CREATE INDEX IF NOT EXISTS idx_migration_events_base_tx_hash ON public.migration_events(base_distribution_tx_hash);

-- Add comment
COMMENT ON COLUMN public.migration_events.base_distribution_tx_hash IS 'Transaction hash of V2 token distribution on Base network';
COMMENT ON COLUMN public.migration_events.base_distribution_status IS 'Status of Base network distribution: pending, sent, or failed';
COMMENT ON COLUMN public.migration_events.base_v2_token_address IS 'Address of V2 token contract on Base network';

