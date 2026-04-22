-- Create widget analytics table
CREATE TABLE public.widget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'tooltip_shown',
    'whatsapp_clicked', 
    'tooltip_dismissed_manual',
    'tooltip_dismissed_auto'
  )),
  session_id TEXT,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_widget_analytics_event_type ON public.widget_analytics(event_type);
CREATE INDEX idx_widget_analytics_created_at ON public.widget_analytics(created_at);
CREATE INDEX idx_widget_analytics_session ON public.widget_analytics(session_id);

-- Enable RLS
ALTER TABLE public.widget_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Allow anonymous widget tracking inserts"
ON public.widget_analytics FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to read all analytics
CREATE POLICY "Allow admins to read widget analytics"
ON public.widget_analytics FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));