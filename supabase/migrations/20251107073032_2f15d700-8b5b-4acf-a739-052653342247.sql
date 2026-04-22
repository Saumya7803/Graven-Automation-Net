-- Make preferred_date and preferred_time_slot nullable for immediate callbacks
ALTER TABLE callback_requests 
ALTER COLUMN preferred_date DROP NOT NULL;

ALTER TABLE callback_requests 
ALTER COLUMN preferred_time_slot DROP NOT NULL;

-- Set default priority to urgent for immediate callbacks
ALTER TABLE callback_requests 
ALTER COLUMN priority SET DEFAULT 'urgent';

-- Update existing pending callbacks to urgent
UPDATE callback_requests 
SET priority = 'urgent' 
WHERE status = 'pending' AND priority = 'normal';