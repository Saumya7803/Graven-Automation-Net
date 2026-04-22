-- Create webhook configurations table
CREATE TABLE public.webhook_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  events JSONB DEFAULT '["rfq.created", "rfq.updated", "order.created", "order.updated"]'::jsonb,
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook deliveries tracking table
CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_configuration_id UUID REFERENCES public.webhook_configurations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  http_status_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create API keys table
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_preview TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  permissions JSONB DEFAULT '["read:rfqs", "read:orders", "write:rfqs"]'::jsonb,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies for webhook_configurations
CREATE POLICY "Admins can manage webhook configurations"
ON public.webhook_configurations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view webhook configurations"
ON public.webhook_configurations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for webhook_deliveries
CREATE POLICY "Admins can manage webhook deliveries"
ON public.webhook_deliveries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view webhook deliveries"
ON public.webhook_deliveries
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for api_keys
CREATE POLICY "Admins can manage API keys"
ON public.api_keys
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view API keys"
ON public.api_keys
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_configuration_id);
CREATE INDEX idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at DESC);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Create trigger function to call webhook on RFQ changes
CREATE OR REPLACE FUNCTION public.notify_rfq_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the webhook edge function asynchronously
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/webhook-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'event_type', CASE 
        WHEN TG_OP = 'INSERT' THEN 'rfq.created'
        WHEN TG_OP = 'UPDATE' THEN 'rfq.updated'
      END,
      'resource_type', 'rfq',
      'resource_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger function to call webhook on Order changes
CREATE OR REPLACE FUNCTION public.notify_order_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the webhook edge function asynchronously
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/webhook-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'event_type', CASE 
        WHEN TG_OP = 'INSERT' THEN 'order.created'
        WHEN TG_OP = 'UPDATE' THEN 'order.updated'
      END,
      'resource_type', 'order',
      'resource_id', NEW.id
    )
  );
  RETURN NEW;
END;
$$;

-- Create triggers for RFQ
CREATE TRIGGER on_rfq_created
  AFTER INSERT ON public.quotation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_rfq_webhook();

CREATE TRIGGER on_rfq_updated
  AFTER UPDATE ON public.quotation_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_rfq_webhook();

-- Create triggers for Orders
CREATE TRIGGER on_order_created
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_webhook();

CREATE TRIGGER on_order_updated
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION public.notify_order_webhook();

-- Add updated_at trigger for webhook_configurations
CREATE TRIGGER update_webhook_configurations_updated_at
  BEFORE UPDATE ON public.webhook_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();