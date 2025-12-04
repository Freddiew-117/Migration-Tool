-- Create support messages table
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

-- Enable Row Level Security
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Users can insert their own messages (both authenticated and anonymous)
CREATE POLICY "Users can insert support messages" 
ON public.support_messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL) OR 
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Users can view their own messages
CREATE POLICY "Users can view their own support messages" 
ON public.support_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Super admins can manage all support messages
CREATE POLICY "Super admins can manage all support messages" 
ON public.support_messages 
FOR ALL 
USING (is_super_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_support_messages_user_id ON public.support_messages(user_id);
CREATE INDEX idx_support_messages_status ON public.support_messages(status);
CREATE INDEX idx_support_messages_priority ON public.support_messages(priority);
CREATE INDEX idx_support_messages_created_at ON public.support_messages(created_at DESC);