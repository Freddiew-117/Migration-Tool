-- Add source_code column to smart_contracts table
ALTER TABLE public.smart_contracts
ADD COLUMN source_code TEXT;