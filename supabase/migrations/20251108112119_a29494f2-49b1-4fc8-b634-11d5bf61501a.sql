-- Create search alert configuration table
CREATE TABLE public.search_alert_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL DEFAULT 'zero_results',
  threshold_count INTEGER NOT NULL DEFAULT 5,
  time_window_hours INTEGER NOT NULL DEFAULT 24,
  is_enabled BOOLEAN DEFAULT true,
  notification_methods JSONB DEFAULT '["push", "email"]'::jsonb,
  recipient_emails TEXT[],
  check_frequency_minutes INTEGER DEFAULT 60,
  cooldown_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create search alert history table
CREATE TABLE public.search_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'zero_results',
  zero_results_count INTEGER NOT NULL,
  threshold_exceeded INTEGER NOT NULL,
  priority_score INTEGER NOT NULL DEFAULT 0,
  notification_sent_at TIMESTAMPTZ DEFAULT NOW(),
  notification_methods TEXT[],
  recipients TEXT[],
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_search_alert_history_query_time 
ON public.search_alert_history(search_query, notification_sent_at DESC);

CREATE INDEX idx_search_alert_history_acknowledged 
ON public.search_alert_history(acknowledged, created_at DESC);

-- Enable RLS
ALTER TABLE public.search_alert_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_alert_config
CREATE POLICY "Admins can manage alert config"
ON public.search_alert_config FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view alert config"
ON public.search_alert_config FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for search_alert_history
CREATE POLICY "Admins can view alert history"
ON public.search_alert_history FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can acknowledge alerts"
ON public.search_alert_history FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default configuration
INSERT INTO public.search_alert_config (
  alert_type, 
  threshold_count, 
  time_window_hours, 
  notification_methods,
  recipient_emails,
  check_frequency_minutes,
  cooldown_hours
) VALUES (
  'zero_results',
  5,
  24,
  '["push", "email"]'::jsonb,
  ARRAY['admin@schneidervfd.com'],
  60,
  24
);

-- Create trigger for updated_at
CREATE TRIGGER update_search_alert_config_updated_at
BEFORE UPDATE ON public.search_alert_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();