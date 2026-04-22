-- Create callback_requests table
CREATE TABLE public.callback_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  company_name TEXT,
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL CHECK (preferred_time_slot IN ('morning', 'afternoon', 'evening', 'any')),
  reason TEXT,
  message TEXT,
  location_page TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'no_answer')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_date_time TIMESTAMP WITH TIME ZONE,
  call_duration_minutes INTEGER,
  admin_notes TEXT,
  outcome TEXT CHECK (outcome IN ('interested', 'quote_sent', 'order_placed', 'not_interested', 'follow_up_needed')),
  follow_up_date DATE,
  contacted_at TIMESTAMP WITH TIME ZONE,
  contacted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.callback_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own callback requests"
  ON public.callback_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own callback requests"
  ON public.callback_requests
  FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all callback requests"
  ON public.callback_requests
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all callback requests"
  ON public.callback_requests
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete callback requests"
  ON public.callback_requests
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_callback_requests_status ON public.callback_requests(status);
CREATE INDEX idx_callback_requests_preferred_date ON public.callback_requests(preferred_date);
CREATE INDEX idx_callback_requests_created_at ON public.callback_requests(created_at DESC);
CREATE INDEX idx_callback_requests_assigned_to ON public.callback_requests(assigned_to);
CREATE INDEX idx_callback_requests_user_id ON public.callback_requests(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_callback_requests_updated_at
  BEFORE UPDATE ON public.callback_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();