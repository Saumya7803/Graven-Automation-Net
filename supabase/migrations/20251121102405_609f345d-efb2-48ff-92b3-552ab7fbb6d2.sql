-- Phase 5-12: Comprehensive SEO Expansion Tables (Fixed)

-- Knowledge Hub Pages (Phase 5)
CREATE TABLE IF NOT EXISTS public.knowledge_hub_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  related_products UUID[],
  downloadable_resources JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_knowledge_hub_slug ON public.knowledge_hub_pages(slug);
CREATE INDEX idx_knowledge_hub_category ON public.knowledge_hub_pages(category);
CREATE INDEX idx_knowledge_hub_active ON public.knowledge_hub_pages(is_active);

-- Technical Resources (Phase 5)
CREATE TABLE IF NOT EXISTS public.technical_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  thumbnail_url TEXT,
  related_page_slug TEXT,
  download_count INTEGER DEFAULT 0,
  file_size_kb INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_technical_resources_type ON public.technical_resources(resource_type);
CREATE INDEX idx_technical_resources_page ON public.technical_resources(related_page_slug);

-- Comparison Pages (Phase 6)
CREATE TABLE IF NOT EXISTS public.comparison_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],
  product_a_name TEXT NOT NULL,
  product_b_name TEXT NOT NULL,
  comparison_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  related_products UUID[],
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comparison_slug ON public.comparison_pages(slug);
CREATE INDEX idx_comparison_active ON public.comparison_pages(is_active);

-- Power Conversions (Phase 9)
CREATE TABLE IF NOT EXISTS public.power_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hp NUMERIC NOT NULL,
  kw_min NUMERIC NOT NULL,
  kw_max NUMERIC NOT NULL,
  common_applications TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_power_conversions_hp ON public.power_conversions(hp);

-- Insert common HP to kW conversions
INSERT INTO public.power_conversions (hp, kw_min, kw_max, common_applications) VALUES
(0.5, 0.37, 0.37, ARRAY['Small pumps', 'Conveyors']),
(1, 0.75, 0.75, ARRAY['Fans', 'Small pumps', 'Mixers']),
(2, 1.5, 1.5, ARRAY['Pumps', 'Compressors', 'Conveyors']),
(3, 2.2, 2.2, ARRAY['Industrial pumps', 'Fans', 'Compressors']),
(5, 3.7, 4.0, ARRAY['HVAC', 'Pumps', 'Conveyors']),
(7.5, 5.5, 5.5, ARRAY['Large pumps', 'Compressors', 'Industrial fans']),
(10, 7.5, 7.5, ARRAY['Industrial applications', 'HVAC systems']),
(15, 11, 11, ARRAY['Heavy industrial', 'Large HVAC']),
(20, 15, 15, ARRAY['Industrial processes', 'Large machinery']),
(25, 18.5, 18.5, ARRAY['Heavy industrial equipment']),
(30, 22, 22, ARRAY['Industrial processes', 'Large systems']),
(40, 30, 30, ARRAY['Heavy machinery', 'Industrial plants']),
(50, 37, 37, ARRAY['Large industrial systems']),
(60, 45, 45, ARRAY['Heavy industrial applications']),
(75, 55, 55, ARRAY['Large industrial drives']),
(100, 75, 75, ARRAY['Heavy industrial machinery']),
(125, 90, 90, ARRAY['Industrial plants']),
(150, 110, 110, ARRAY['Large industrial systems']),
(200, 150, 150, ARRAY['Heavy industrial processes']);

-- RLS Policies
ALTER TABLE public.knowledge_hub_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_conversions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active knowledge hub pages" ON public.knowledge_hub_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active technical resources" ON public.technical_resources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active comparison pages" ON public.comparison_pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view power conversions" ON public.power_conversions
  FOR SELECT USING (true);

-- Admin management
CREATE POLICY "Admins can manage knowledge hub pages" ON public.knowledge_hub_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage technical resources" ON public.technical_resources
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage comparison pages" ON public.comparison_pages
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage power conversions" ON public.power_conversions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_knowledge_hub_updated_at
  BEFORE UPDATE ON public.knowledge_hub_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comparison_updated_at
  BEFORE UPDATE ON public.comparison_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial knowledge hub content
INSERT INTO public.knowledge_hub_pages (slug, title, meta_description, category, content, meta_keywords, faqs) VALUES
('what-is-vfd', 
 'What is VFD? Complete Guide to Variable Frequency Drives | 2024', 
 'Comprehensive guide to Variable Frequency Drives (VFD). Learn what is VFD, VFD full form, working principle, applications, and benefits. Expert explanation for engineers and buyers.',
 'basics',
 'Complete educational content about VFD basics...',
 ARRAY['vfd', 'what is vfd', 'vfd full form', 'variable frequency drive', 'vfd meaning', 'vfd full form in electrical'],
 '[{"question": "What is VFD full form?", "answer": "VFD full form is Variable Frequency Drive. It is an electronic device that controls the speed of AC motors by varying the frequency and voltage supplied to the motor."}, {"question": "What is VFD used for?", "answer": "VFDs are used to control motor speed for energy savings, process control, and equipment protection in pumps, fans, compressors, and conveyors."}]'::jsonb),
 
('vfd-working-principle',
 'VFD Working Principle - How Variable Frequency Drive Works',
 'Detailed explanation of VFD working principle with diagrams. Understand rectifier, DC bus, and inverter sections. Complete guide for electrical engineers.',
 'technical',
 'Technical explanation of VFD operation...',
 ARRAY['vfd working principle', 'vfd working', 'vfd drive working principle', 'how vfd works'],
 '[{"question": "How does VFD control motor speed?", "answer": "VFD controls motor speed by varying the frequency of AC power supplied to the motor. Lower frequency reduces speed, higher frequency increases speed."}, {"question": "What are the main parts of VFD?", "answer": "Main VFD parts include: Rectifier (AC to DC conversion), DC Bus (stores energy), Inverter (DC to variable AC conversion), and Control circuit."}]'::jsonb),
 
('types-of-vfd',
 'Types of VFD - All Variable Frequency Drive Technologies Explained',
 'Complete guide to all types of VFD including PWM, VSI, CSI, and DTC. Compare VFD technologies, advantages, disadvantages, and applications.',
 'technical',
 'Detailed comparison of VFD types...',
 ARRAY['types of vfd', 'vfd types', 'pwm vfd', 'vsi vfd'],
 '[{"question": "What are the main types of VFD?", "answer": "Main VFD types: 1) PWM VFD (most common), 2) Current Source Inverter (CSI), 3) Voltage Source Inverter (VSI), 4) Direct Torque Control (DTC)."}, {"question": "Which VFD type is best?", "answer": "PWM VFDs are most popular due to better efficiency, lower harmonics, and cost-effectiveness. Choose based on your specific application requirements."}]'::jsonb),
 
('vfd-applications',
 'VFD Applications - Complete Industry Guide 2024',
 'Comprehensive guide to VFD applications across industries. HVAC, pumps, compressors, conveyors, and more. Benefits and implementation examples.',
 'applications',
 'Industry-specific VFD applications...',
 ARRAY['vfd applications', 'vfd uses', 'where to use vfd'],
 '[{"question": "What are common VFD applications?", "answer": "Common VFD applications: Pumps (30%), Fans/HVAC (25%), Conveyors (15%), Compressors (15%), Mixers/Agitators (10%), Others (5%)."}, {"question": "Why use VFD in HVAC?", "answer": "VFDs in HVAC provide 20-50% energy savings, better temperature control, reduced mechanical stress, and quieter operation."}]'::jsonb),
 
('vfd-parameters',
 'VFD Parameters Guide - Complete Programming & Settings',
 'Complete VFD parameters guide. Learn essential VFD settings, parameter programming, commissioning steps. PDF download available.',
 'technical',
 'VFD parameter programming guide...',
 ARRAY['vfd parameters', 'vfd parameters pdf', 'vfd programming', 'vfd settings'],
 '[{"question": "What are the most important VFD parameters?", "answer": "Critical VFD parameters: Motor rated current, Motor rated voltage, Motor rated frequency, Acceleration/Deceleration time, Maximum frequency, V/F curve."}, {"question": "How to set VFD parameters?", "answer": "Set VFD parameters: 1) Enter motor nameplate data, 2) Set acceleration/deceleration times, 3) Configure I/O, 4) Set protection limits, 5) Test and fine-tune."}]'::jsonb);

-- Insert comparison pages
INSERT INTO public.comparison_pages (slug, title, meta_description, product_a_name, product_b_name, comparison_data, faqs, meta_keywords) VALUES
('vfd-vs-soft-starter',
 'VFD vs Soft Starter - Complete Comparison Guide 2024',
 'Detailed VFD vs Soft Starter comparison. Understand differences, advantages, disadvantages, and when to use each. Expert buying guide with cost analysis.',
 'Variable Frequency Drive (VFD)',
 'Soft Starter',
 '{"features": [{"name": "Speed Control", "vfd": "Variable speed control (0-100%)", "soft_starter": "Only start/stop control"}, {"name": "Energy Savings", "vfd": "20-50% energy savings", "soft_starter": "No energy savings during operation"}, {"name": "Starting Current", "vfd": "Limits to 100-150% FLC", "soft_starter": "Limits to 300-400% FLC"}, {"name": "Cost", "vfd": "Higher initial cost", "soft_starter": "Lower initial cost"}, {"name": "Applications", "vfd": "Variable torque applications", "soft_starter": "Constant speed applications"}], "when_to_use": {"vfd": ["Pumps and fans", "Conveyor systems", "Variable process requirements", "Energy savings priority"], "soft_starter": ["Fixed speed applications", "Simple start/stop", "Budget constraints", "High starting torque"]}}'::jsonb,
 '[{"question": "What is the main difference between VFD and soft starter?", "answer": "VFD provides variable speed control throughout operation and offers energy savings. Soft starter only controls starting and stopping, running at fixed speed afterward."}, {"question": "Which is better VFD or soft starter?", "answer": "VFD is better for variable speed applications (pumps, fans) with energy savings. Soft starter is better for fixed speed applications where only smooth starting is needed."}, {"question": "Can soft starter control speed?", "answer": "No, soft starter cannot control speed during operation. It only provides smooth acceleration and deceleration during start and stop. Use VFD for speed control."}]'::jsonb,
 ARRAY['vfd vs soft starter', 'soft starter vs vfd', 'difference between vfd and soft starter', 'vfd or soft starter']),
 
('vsd-vs-vfd',
 'VSD vs VFD - Are They the Same? Complete Guide',
 'VSD vs VFD comparison. Understand the terminology, differences, and applications. Clear explanation for buyers and engineers.',
 'Variable Speed Drive (VSD)',
 'Variable Frequency Drive (VFD)',
 '{"explanation": "VSD and VFD are essentially the same technology with different names. VSD is a broader term that includes all types of adjustable speed drives, while VFD specifically refers to AC drives that vary frequency.", "terminology": {"vsd": "Generic term for any speed control system", "vfd": "Specific to AC frequency control", "asd": "Adjustable Speed Drive", "inverter": "Another term for VFD"}, "regional": "VFD is more common in North America, VSD in Europe and Asia"}'::jsonb,
 '[{"question": "Is VSD and VFD the same?", "answer": "Yes, VSD (Variable Speed Drive) and VFD (Variable Frequency Drive) are essentially the same. VSD is a broader term while VFD specifically refers to frequency control for AC motors."}, {"question": "What is VSD full form?", "answer": "VSD full form is Variable Speed Drive. It is a generic term for drives that control motor speed, including VFD, DC drives, and servo drives."}]'::jsonb,
 ARRAY['vsd vs vfd', 'vsd and vfd difference', 'vsd or vfd']);

-- Insert initial technical resources
INSERT INTO public.technical_resources (resource_type, title, description, related_page_slug) VALUES
('diagram', 'VFD Wiring Diagram - 3 Phase Motor Connection', 'Complete wiring diagram for connecting VFD to 3-phase motor with line choke and EMC filter', 'vfd-wiring-diagram'),
('diagram', 'VFD Circuit Diagram - Internal Components', 'Detailed circuit diagram showing rectifier, DC bus, and inverter sections', 'vfd-circuit-diagram'),
('guide', 'VFD Installation Checklist', 'Step-by-step installation guide with electrical safety requirements', 'vfd-installation-guide'),
('guide', 'VFD Parameters Quick Reference', 'Essential VFD parameters for quick commissioning', 'vfd-parameters');