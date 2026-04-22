-- Create customer_communications table to track all customer interactions
CREATE TABLE public.customer_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('email', 'push', 'call', 'sms', 'note')),
  channel TEXT NOT NULL CHECK (channel IN ('order_status', 'quotation_status', 'cart_recovery', 'callback', 'campaign', 'manual', 'order_confirmation', 'cart_reminder', 'revision', 'finalized')),
  subject TEXT,
  message_preview TEXT,
  full_content JSONB,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'scheduled')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_customer_communications_user_id ON public.customer_communications(user_id);
CREATE INDEX idx_customer_communications_customer_id ON public.customer_communications(customer_id);
CREATE INDEX idx_customer_communications_created_at ON public.customer_communications(created_at DESC);
CREATE INDEX idx_customer_communications_type ON public.customer_communications(communication_type);
CREATE INDEX idx_customer_communications_channel ON public.customer_communications(channel);

-- Enable RLS
ALTER TABLE public.customer_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own communications"
  ON public.customer_communications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all communications"
  ON public.customer_communications
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System and admins can insert communications"
  ON public.customer_communications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update communications"
  ON public.customer_communications
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete communications"
  ON public.customer_communications
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));