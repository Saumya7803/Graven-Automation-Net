-- Create procurement_list_reminders table
CREATE TABLE public.procurement_list_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  list_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  list_value NUMERIC NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  first_item_added_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  first_reminder_sent_at TIMESTAMPTZ,
  second_reminder_sent_at TIMESTAMPTZ,
  third_reminder_sent_at TIMESTAMPTZ,
  recovery_link_clicked_at TIMESTAMPTZ,
  recovery_link_click_count INTEGER DEFAULT 0,
  converted_at TIMESTAMPTZ,
  converted_to TEXT,
  converted_order_id UUID,
  converted_quotation_id UUID,
  recovery_token UUID DEFAULT gen_random_uuid(),
  discount_code TEXT,
  device_type TEXT,
  browser TEXT,
  engagement_score NUMERIC DEFAULT 0,
  sequence_stage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create procurement_recovery_templates table
CREATE TABLE public.procurement_recovery_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'email',
  stage_number INTEGER NOT NULL DEFAULT 1,
  target_tiers TEXT[] DEFAULT ARRAY['all'],
  min_list_value NUMERIC DEFAULT 0,
  max_list_value NUMERIC,
  send_after_days INTEGER NOT NULL DEFAULT 3,
  email_subject TEXT,
  email_html TEXT,
  push_title TEXT,
  push_body TEXT,
  push_icon TEXT DEFAULT '/icon-192.png',
  push_action_url TEXT,
  discount_type TEXT,
  discount_value NUMERIC DEFAULT 0,
  discount_code_prefix TEXT,
  is_active BOOLEAN DEFAULT true,
  times_sent INTEGER DEFAULT 0,
  times_opened INTEGER DEFAULT 0,
  times_clicked INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Create procurement_recovery_interactions table
CREATE TABLE public.procurement_recovery_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID REFERENCES public.procurement_list_reminders(id) ON DELETE CASCADE,
  user_id UUID,
  interaction_type TEXT NOT NULL,
  template_id UUID REFERENCES public.procurement_recovery_templates(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.procurement_list_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_recovery_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_recovery_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for procurement_list_reminders
CREATE POLICY "Admins can manage all procurement reminders"
ON public.procurement_list_reminders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own procurement reminders"
ON public.procurement_list_reminders FOR SELECT
USING (user_id = auth.uid());

-- RLS policies for procurement_recovery_templates
CREATE POLICY "Admins can manage procurement templates"
ON public.procurement_recovery_templates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active templates"
ON public.procurement_recovery_templates FOR SELECT
USING (is_active = true);

-- RLS policies for procurement_recovery_interactions
CREATE POLICY "Admins can manage all interactions"
ON public.procurement_recovery_interactions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own interactions"
ON public.procurement_recovery_interactions FOR SELECT
USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_procurement_reminders_user_id ON public.procurement_list_reminders(user_id);
CREATE INDEX idx_procurement_reminders_status ON public.procurement_list_reminders(status);
CREATE INDEX idx_procurement_reminders_recovery_token ON public.procurement_list_reminders(recovery_token);
CREATE INDEX idx_procurement_interactions_reminder_id ON public.procurement_recovery_interactions(reminder_id);

-- Insert default templates
INSERT INTO public.procurement_recovery_templates (name, template_type, stage_number, send_after_days, email_subject, email_html, push_title, push_body)
VALUES 
('Stage 1 - Gentle Reminder', 'both', 1, 3, 
 'Your saved products are waiting at {{company_name}}!',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #009530;">Your Procurement List Awaits!</h2><p>Hi {{customer_name}},</p><p>You have {{item_count}} products saved in your procurement list worth approximately ₹{{list_value}}.</p><p>Ready to move forward? Request a quote or add them to your cart with one click:</p>{{product_list}}<div style="margin: 20px 0;"><a href="{{recovery_link}}" style="background-color: #009530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Your List</a></div><p>Questions? Our team is here to help!</p></div>',
 'Your saved products are waiting!',
 'You have {{item_count}} products in your procurement list. Ready to request a quote?'),
('Stage 2 - Follow Up', 'both', 2, 7,
 'Don''t miss out on these products - {{company_name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #009530;">Still Interested?</h2><p>Hi {{customer_name}},</p><p>Your procurement list with {{item_count}} products is still waiting for you.</p><p>Need help with specifications or pricing? Our experts can assist!</p>{{product_list}}<div style="margin: 20px 0;"><a href="{{recovery_link}}" style="background-color: #009530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Your Request</a></div></div>',
 'Your procurement list needs attention',
 '{{item_count}} products waiting in your list. Get a quote today!'),
('Stage 3 - Final Reminder', 'both', 3, 14,
 'Last chance: Your saved products at {{company_name}}',
 '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h2 style="color: #009530;">Final Reminder</h2><p>Hi {{customer_name}},</p><p>This is a friendly reminder that you have {{item_count}} products saved in your procurement list.</p><p>Prices and availability may change - request a quote now to lock in current pricing!</p>{{product_list}}<div style="margin: 20px 0;"><a href="{{recovery_link}}" style="background-color: #009530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Request Quote Now</a></div></div>',
 'Final reminder: Your procurement list',
 'Don''t let your saved products expire. Request a quote now!');