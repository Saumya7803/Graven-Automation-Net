-- Create notification interactions table for tracking
CREATE TABLE notification_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_log_id UUID REFERENCES notification_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Interaction timestamps
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  displayed_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- Context
  device_type TEXT,
  browser TEXT,
  action_taken TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_interactions_log_id ON notification_interactions(notification_log_id);
CREATE INDEX idx_notification_interactions_user_id ON notification_interactions(user_id);
CREATE INDEX idx_notification_interactions_dates ON notification_interactions(delivered_at, clicked_at);

-- Enable RLS
ALTER TABLE notification_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
ON notification_interactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own interactions"
ON notification_interactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all interactions"
ON notification_interactions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create analytics view
CREATE OR REPLACE VIEW notification_analytics AS
SELECT 
  nl.notification_type,
  nl.title,
  nl.sent_at::date as sent_date,
  COUNT(DISTINCT nl.id) as total_sent,
  COUNT(DISTINCT CASE WHEN nl.status = 'sent' THEN nl.id END) as total_delivered,
  COUNT(DISTINCT CASE WHEN ni.displayed_at IS NOT NULL THEN ni.id END) as total_displayed,
  COUNT(DISTINCT CASE WHEN ni.clicked_at IS NOT NULL THEN ni.id END) as total_clicked,
  COUNT(DISTINCT CASE WHEN ni.dismissed_at IS NOT NULL THEN ni.id END) as total_dismissed,
  
  -- Calculate rates
  ROUND(
    (COUNT(DISTINCT CASE WHEN ni.displayed_at IS NOT NULL THEN ni.id END)::decimal / 
     NULLIF(COUNT(DISTINCT CASE WHEN nl.status = 'sent' THEN nl.id END), 0) * 100), 2
  ) as open_rate,
  
  ROUND(
    (COUNT(DISTINCT CASE WHEN ni.clicked_at IS NOT NULL THEN ni.id END)::decimal / 
     NULLIF(COUNT(DISTINCT CASE WHEN nl.status = 'sent' THEN nl.id END), 0) * 100), 2
  ) as click_through_rate,
  
  -- Average time to click (in seconds)
  AVG(EXTRACT(EPOCH FROM (ni.clicked_at - ni.delivered_at))) as avg_time_to_click_seconds
  
FROM notification_logs nl
LEFT JOIN notification_interactions ni ON nl.id = ni.notification_log_id
WHERE nl.sent_at >= NOW() - INTERVAL '90 days'
GROUP BY nl.notification_type, nl.title, nl.sent_at::date;

-- Function to get engagement by hour of day
CREATE OR REPLACE FUNCTION get_engagement_by_hour()
RETURNS TABLE (
  hour_of_day INTEGER,
  total_sent BIGINT,
  total_clicked BIGINT,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(HOUR FROM nl.sent_at)::INTEGER as hour_of_day,
    COUNT(DISTINCT nl.id) as total_sent,
    COUNT(DISTINCT CASE WHEN ni.clicked_at IS NOT NULL THEN ni.id END) as total_clicked,
    ROUND(
      (COUNT(DISTINCT CASE WHEN ni.clicked_at IS NOT NULL THEN ni.id END)::decimal / 
       NULLIF(COUNT(DISTINCT nl.id), 0) * 100), 2
    ) as click_rate
  FROM notification_logs nl
  LEFT JOIN notification_interactions ni ON nl.id = ni.notification_log_id
  WHERE nl.sent_at >= NOW() - INTERVAL '30 days'
  GROUP BY hour_of_day
  ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;