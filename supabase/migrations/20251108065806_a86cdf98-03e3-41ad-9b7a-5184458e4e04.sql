-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create scheduled_push_notifications table
CREATE TABLE scheduled_push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Notification content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '/icon-192.png',
  badge TEXT DEFAULT '/icon-192.png',
  action_url TEXT,
  
  -- Targeting
  target_type TEXT NOT NULL CHECK (target_type IN ('all', 'tier', 'specific')),
  target_value TEXT,
  notification_type TEXT DEFAULT 'admin-announcement',
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  
  -- Results
  total_targeted INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Index for efficient querying
CREATE INDEX idx_scheduled_notifications_status_time 
ON scheduled_push_notifications(status, scheduled_at) 
WHERE status = 'scheduled';

-- RLS policies
ALTER TABLE scheduled_push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage scheduled notifications"
ON scheduled_push_notifications
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE scheduled_push_notifications;

-- Create cron job to process scheduled notifications every minute
SELECT cron.schedule(
  'process-scheduled-push-notifications',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://izphkdvrexejctdabplp.supabase.co/functions/v1/process-scheduled-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cGhrZHZyZXhlamN0ZGFicGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNjQ0MjIsImV4cCI6MjA4NDg0MDQyMn0.jMqJaivin7DqkYSrj0KM0IagkrIDK1ZhLcCqMIMOe60"}'::jsonb,
    body := '{"trigger": "cron"}'::jsonb
  ) as request_id;
  $$
);
