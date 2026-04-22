-- Phase 1: Create cart_recovery_interactions table
CREATE TABLE IF NOT EXISTS public.cart_recovery_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abandoned_cart_id UUID REFERENCES public.abandoned_carts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('email_sent', 'email_opened', 'link_clicked', 'page_viewed', 'cart_recovered', 'checkout_abandoned', 'sms_sent', 'push_sent')),
  template_id UUID REFERENCES public.cart_recovery_templates(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_cart ON public.cart_recovery_interactions(abandoned_cart_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON public.cart_recovery_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.cart_recovery_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON public.cart_recovery_interactions(created_at DESC);

-- Add new columns to abandoned_carts for behavioral tracking
ALTER TABLE public.abandoned_carts 
  ADD COLUMN IF NOT EXISTS recovery_link_clicked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovery_link_click_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS visit_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_score NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_sequence TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS sequence_stage INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sequence_changed_at TIMESTAMPTZ;

-- Create cart_recovery_sequences table
CREATE TABLE IF NOT EXISTS public.cart_recovery_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_name TEXT UNIQUE NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL,
  priority INT DEFAULT 0,
  stages JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_sequences_active ON public.cart_recovery_sequences(is_active);
CREATE INDEX IF NOT EXISTS idx_sequences_priority ON public.cart_recovery_sequences(priority DESC);

-- RLS Policies for cart_recovery_interactions
ALTER TABLE public.cart_recovery_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all interactions"
  ON public.cart_recovery_interactions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own interactions"
  ON public.cart_recovery_interactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert interactions"
  ON public.cart_recovery_interactions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for cart_recovery_sequences
ALTER TABLE public.cart_recovery_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sequences"
  ON public.cart_recovery_sequences FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view sequences"
  ON public.cart_recovery_sequences FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(cart_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  score NUMERIC := 0;
  email_opens INT;
  link_clicks INT;
  page_visits INT;
  checkout_visits INT;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE interaction_type = 'email_opened'),
    COUNT(*) FILTER (WHERE interaction_type = 'link_clicked'),
    COUNT(*) FILTER (WHERE interaction_type = 'page_viewed'),
    COUNT(*) FILTER (WHERE interaction_type = 'checkout_abandoned')
  INTO email_opens, link_clicks, page_visits, checkout_visits
  FROM public.cart_recovery_interactions
  WHERE abandoned_cart_id = cart_id;

  score := (email_opens * 10) + 
           (link_clicks * 25) + 
           (page_visits * 35) + 
           (checkout_visits * 60);

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update engagement score
CREATE OR REPLACE FUNCTION public.update_cart_engagement_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.abandoned_carts
  SET engagement_score = public.calculate_engagement_score(NEW.abandoned_cart_id),
      updated_at = now()
  WHERE id = NEW.abandoned_cart_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_engagement_score
  AFTER INSERT ON public.cart_recovery_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cart_engagement_score();

-- Insert default sequences
INSERT INTO public.cart_recovery_sequences (sequence_name, description, trigger_conditions, priority, stages, is_active) VALUES
('standard', 'Default time-based sequence for all carts', '{"default": true}'::jsonb, 0, '[
  {"stage": 1, "hours": 1, "name": "Initial Reminder", "discount_min": 0, "discount_max": 10},
  {"stage": 2, "hours": 24, "name": "Second Reminder", "discount_min": 10, "discount_max": 15},
  {"stage": 3, "hours": 48, "name": "Urgency Reminder", "discount_min": 15, "discount_max": 20},
  {"stage": 4, "hours": 168, "name": "Final Chance", "discount_min": 20, "discount_max": 25}
]'::jsonb, true),

('engaged_visitor', 'For customers who clicked and visited multiple times', '{"min_clicks": 1, "min_visits": 1, "not_purchased": true}'::jsonb, 10, '[
  {"stage": 1, "hours": 2, "name": "Engagement Reward", "discount_min": 20, "discount_max": 20},
  {"stage": 2, "hours": 12, "name": "Limited Time Offer", "discount_min": 20, "discount_max": 25},
  {"stage": 3, "hours": 24, "name": "Urgent: Selling Fast", "discount_min": 25, "discount_max": 30},
  {"stage": 4, "hours": 48, "name": "Final Offer", "discount_min": 30, "discount_max": 35}
]'::jsonb, true),

('single_click', 'For customers who clicked once but never returned', '{"min_clicks": 1, "max_visits": 1, "hours_since_last": 12}'::jsonb, 8, '[
  {"stage": 1, "hours": 12, "name": "Decision Helper", "discount_min": 15, "discount_max": 15},
  {"stage": 2, "hours": 24, "name": "Easy Returns Offer", "discount_min": 20, "discount_max": 20},
  {"stage": 3, "hours": 48, "name": "One-Time Offer", "discount_min": 25, "discount_max": 25}
]'::jsonb, true),

('never_opened', 'For customers who never opened emails', '{"emails_sent_min": 2, "emails_opened": 0}'::jsonb, 7, '[
  {"stage": 1, "hours": 48, "name": "New Subject Line", "discount_min": 10, "discount_max": 15},
  {"stage": 2, "hours": 72, "name": "Different Approach", "discount_min": 15, "discount_max": 20},
  {"stage": 3, "hours": 120, "name": "FOMO Angle", "discount_min": 20, "discount_max": 25}
]'::jsonb, true),

('checkout_abandoner', 'For customers who recovered cart but abandoned at checkout', '{"cart_recovered": true, "checkout_abandoned": true}'::jsonb, 15, '[
  {"stage": 1, "hours": 0.5, "name": "Immediate Help", "discount_min": 5, "discount_max": 5},
  {"stage": 2, "hours": 2, "name": "Payment Help", "discount_min": 5, "discount_max": 10},
  {"stage": 3, "hours": 24, "name": "Free Shipping", "discount_min": 10, "discount_max": 15}
]'::jsonb, true),

('high_intent', 'For highly engaged visitors (3+ visits)', '{"min_visits": 3, "not_purchased": true}'::jsonb, 12, '[
  {"stage": 1, "hours": 1, "name": "VIP Treatment", "discount_min": 25, "discount_max": 30},
  {"stage": 2, "hours": 6, "name": "Personal Assistance", "discount_min": 30, "discount_max": 35},
  {"stage": 3, "hours": 24, "name": "Maximum Discount", "discount_min": 35, "discount_max": 40}
]'::jsonb, true)

ON CONFLICT (sequence_name) DO NOTHING;