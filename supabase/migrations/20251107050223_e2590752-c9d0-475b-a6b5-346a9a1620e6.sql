-- Add reminder tracking column to callback_requests table
ALTER TABLE callback_requests 
ADD COLUMN reminder_sent_at timestamp with time zone;

-- Create index for efficient querying of callbacks needing reminders
CREATE INDEX idx_callback_requests_scheduled_date_reminder 
ON callback_requests(scheduled_date_time, reminder_sent_at) 
WHERE status = 'scheduled';

-- Add comment for documentation
COMMENT ON COLUMN callback_requests.reminder_sent_at IS 'Timestamp when the 24-hour reminder email was sent to customer and admin';