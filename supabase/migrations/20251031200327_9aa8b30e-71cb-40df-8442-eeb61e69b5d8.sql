-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_title TEXT,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  project_type TEXT,
  location TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  company_name TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  unsubscribe_token UUID DEFAULT gen_random_uuid(),
  source TEXT DEFAULT 'homepage',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
  ON public.newsletter_subscribers FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON public.newsletter_subscribers FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscriptions"
  ON public.newsletter_subscribers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at on testimonials
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample testimonials
INSERT INTO public.testimonials (customer_name, customer_title, company_name, testimonial_text, rating, project_type, location, is_featured, is_active) VALUES
('Rajesh Kumar', 'Plant Manager', 'ABC Manufacturing Ltd.', 'The ATV630 drives transformed our production line efficiency. Energy savings of 40% in the first year alone. Exceptional technical support throughout installation.', 5, 'Manufacturing Automation', 'Mumbai, India', true, true),
('Priya Sharma', 'Facility Engineer', 'TechPark Industries', 'Outstanding reliability and performance. The team''s expertise in VFD integration made our HVAC upgrade seamless. Highly recommend for any industrial application!', 5, 'HVAC System', 'Bangalore, India', true, true),
('Amit Patel', 'Operations Director', 'WaterTech Solutions', 'Professional service from consultation to commissioning. The energy audit revealed 35% savings potential. We''ve achieved those savings within 8 months.', 5, 'Water Treatment', 'Ahmedabad, India', true, true),
('Sneha Reddy', 'Project Manager', 'AutoSystems Pvt Ltd', 'Excellent product quality and after-sales support. The Modbus integration with our existing SCADA was flawless. Zero downtime since installation.', 5, 'Process Automation', 'Hyderabad, India', true, true),
('Karthik Menon', 'Maintenance Head', 'Precision Tools Inc', 'Best investment we made this year. The preventive maintenance program they offer has eliminated unexpected breakdowns. Very responsive technical team.', 5, 'Manufacturing', 'Chennai, India', true, true),
('Deepa Iyer', 'Energy Manager', 'GreenTech Industries', 'Impressed with the comprehensive energy audit and ROI projections. Actual results exceeded expectations. Great partner for sustainability initiatives.', 5, 'Energy Optimization', 'Pune, India', true, true);