-- Add threading support to support_messages table
ALTER TABLE public.support_messages 
ADD COLUMN parent_message_id UUID REFERENCES public.support_messages(id);

-- Create index for better performance on threaded queries
CREATE INDEX idx_support_messages_parent_id ON public.support_messages(parent_message_id);