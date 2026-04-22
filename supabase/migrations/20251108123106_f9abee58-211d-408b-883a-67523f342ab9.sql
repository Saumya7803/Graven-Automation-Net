-- Create abandoned_carts table for tracking cart abandonments
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_snapshot JSONB NOT NULL, -- Complete cart state at abandonment
  cart_value NUMERIC(10,2) NOT NULL,
  abandonment_stage TEXT NOT NULL CHECK (abandonment_stage IN ('cart', 'checkout_started', 'checkout_info_entered', 'payment_failed')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovered', 'expired', 'converted')),
  recovery_method TEXT CHECK (recovery_method IN ('email', 'push', 'both', 'manual', null)),
  
  -- Tracking fields
  abandoned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  recovered_at TIMESTAMP WITH TIME ZONE,
  converted_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Multi-stage reminder tracking
  first_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  second_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  third_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  final_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Analytics fields
  device_type TEXT,
  browser TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  recovery_token UUID UNIQUE DEFAULT gen_random_uuid(),
  discount_code TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_recovery_templates table
CREATE TABLE IF NOT EXISTS public.cart_recovery_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('email', 'push', 'both')),
  stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 4),
  
  -- Targeting
  target_tiers TEXT[] DEFAULT ARRAY['all'],
  min_cart_value NUMERIC(10,2) DEFAULT 0,
  max_cart_value NUMERIC(10,2),
  
  -- Timing
  send_after_hours INTEGER NOT NULL,
  
  -- Email content
  email_subject TEXT,
  email_html TEXT,
  
  -- Push notification content
  push_title TEXT,
  push_body TEXT,
  push_icon TEXT DEFAULT '/icon-192.png',
  push_badge TEXT DEFAULT '/icon-192.png',
  push_action_url TEXT,
  
  -- Discount/Incentive
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'none')),
  discount_value NUMERIC(10,2) DEFAULT 0,
  discount_code_prefix TEXT,
  
  -- A/B Testing
  variant TEXT DEFAULT 'A',
  is_active BOOLEAN DEFAULT true,
  
  -- Analytics
  times_sent INTEGER DEFAULT 0,
  times_opened INTEGER DEFAULT 0,
  times_clicked INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_abandoned_carts_user_id ON public.abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_status ON public.abandoned_carts(status);
CREATE INDEX idx_abandoned_carts_abandoned_at ON public.abandoned_carts(abandoned_at);
CREATE INDEX idx_abandoned_carts_expires_at ON public.abandoned_carts(expires_at);
CREATE INDEX idx_abandoned_carts_recovery_token ON public.abandoned_carts(recovery_token);
CREATE INDEX idx_cart_recovery_templates_active ON public.cart_recovery_templates(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_recovery_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for abandoned_carts
CREATE POLICY "Users can view their own abandoned carts"
  ON public.abandoned_carts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all abandoned carts"
  ON public.abandoned_carts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all abandoned carts"
  ON public.abandoned_carts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for cart_recovery_templates
CREATE POLICY "Admins can manage recovery templates"
  ON public.cart_recovery_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view recovery templates"
  ON public.cart_recovery_templates FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_abandoned_carts_updated_at
  BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_recovery_templates_updated_at
  BEFORE UPDATE ON public.cart_recovery_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default recovery templates
INSERT INTO public.cart_recovery_templates (
  name, template_type, stage_number, send_after_hours,
  email_subject, email_html, push_title, push_body,
  discount_type, discount_value, target_tiers
) VALUES
(
  'First Reminder - Gentle Nudge',
  'both',
  1,
  1,
  'You left something behind! 🛒',
  '<h1>Hi {{customer_name}},</h1><p>We noticed you left some items in your cart. Complete your purchase now!</p><div>{{cart_items}}</div><p><strong>Total: {{cart_total}}</strong></p><a href="{{recovery_link}}">Complete Your Purchase</a>',
  'You left items in your cart',
  'Complete your purchase now and get your items delivered soon!',
  'none',
  0,
  ARRAY['all']
),
(
  'Second Reminder - Small Discount',
  'both',
  2,
  24,
  'Still thinking? Here''s 10% off! 💰',
  '<h1>Hi {{customer_name}},</h1><p>Your cart is waiting! Use code <strong>{{discount_code}}</strong> for 10% off.</p><div>{{cart_items}}</div><p><strong>Total: {{cart_total}}</strong></p><a href="{{recovery_link}}">Claim Your Discount</a>',
  '10% off your cart!',
  'Use your exclusive discount code before it expires.',
  'percentage',
  10,
  ARRAY['all']
),
(
  'Third Reminder - Strong Incentive',
  'both',
  3,
  48,
  'Last chance: 15% off + Free Shipping! 🚚',
  '<h1>Hi {{customer_name}},</h1><p>This is your last chance! Get 15% off + FREE shipping with code <strong>{{discount_code}}</strong></p><div>{{cart_items}}</div><p><strong>Total: {{cart_total}}</strong></p><a href="{{recovery_link}}">Get My Discount</a>',
  'Final offer: 15% off + Free Shipping',
  'Don''t miss out on this exclusive deal!',
  'percentage',
  15,
  ARRAY['all']
),
(
  'VIP Final Reminder',
  'both',
  4,
  168,
  'Exclusive VIP Offer: 20% Off Just for You! 👑',
  '<h1>Hi {{customer_name}},</h1><p>As a valued customer, we''re offering you an exclusive 20% discount. Use code <strong>{{discount_code}}</strong></p><div>{{cart_items}}</div><p><strong>Total: {{cart_total}}</strong></p><a href="{{recovery_link}}">Claim VIP Discount</a>',
  'VIP Exclusive: 20% off',
  'A special offer just for our valued customers.',
  'percentage',
  20,
  ARRAY['vip', 'regular']
);