-- Create Google Merchant Center configuration table
CREATE TABLE IF NOT EXISTS public.google_merchant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id TEXT NOT NULL,
  is_connected BOOLEAN DEFAULT false,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'disconnected' CHECK (sync_status IN ('active', 'error', 'disconnected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Google product status tracking table
CREATE TABLE IF NOT EXISTS public.google_product_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  merchant_product_id TEXT,
  approval_status TEXT DEFAULT 'not_synced' CHECK (approval_status IN ('approved', 'pending', 'disapproved', 'not_synced')),
  item_level_issues JSONB DEFAULT '[]'::jsonb,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_error TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(product_id)
);

-- Create Google sync log table
CREATE TABLE IF NOT EXISTS public.google_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'incremental', 'single_product')),
  products_synced INTEGER DEFAULT 0,
  products_approved INTEGER DEFAULT 0,
  products_disapproved INTEGER DEFAULT 0,
  products_pending INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  sync_duration_ms INTEGER,
  initiated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_merchant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_product_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_merchant_config
CREATE POLICY "Admins can manage merchant config"
  ON public.google_merchant_config
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for google_product_status
CREATE POLICY "Admins can manage product status"
  ON public.google_product_status
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view product status"
  ON public.google_product_status
  FOR SELECT
  USING (true);

-- RLS Policies for google_sync_log
CREATE POLICY "Admins can view sync logs"
  ON public.google_sync_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sync logs"
  ON public.google_sync_log
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_google_product_status_product_id ON public.google_product_status(product_id);
CREATE INDEX idx_google_product_status_approval_status ON public.google_product_status(approval_status);
CREATE INDEX idx_google_sync_log_created_at ON public.google_sync_log(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_google_merchant_config_updated_at
  BEFORE UPDATE ON public.google_merchant_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_product_status_updated_at
  BEFORE UPDATE ON public.google_product_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();