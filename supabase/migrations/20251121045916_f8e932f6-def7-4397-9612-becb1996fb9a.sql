-- Phase 1: Series Pages Tables
CREATE TABLE IF NOT EXISTS public.series_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_slug TEXT UNIQUE NOT NULL,
  series_name TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],
  hero_title TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  content TEXT NOT NULL,
  power_range_min TEXT,
  power_range_max TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.series_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_slug TEXT NOT NULL REFERENCES public.series_pages(series_slug) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 2: Product FAQs Table
CREATE TABLE IF NOT EXISTS public.product_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 3: Commercial Content Table
CREATE TABLE IF NOT EXISTS public.commercial_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  meta_keywords TEXT[],
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Phase 4: Enhance product_categories table
ALTER TABLE public.product_categories 
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
  ADD COLUMN IF NOT EXISTS benefits TEXT[],
  ADD COLUMN IF NOT EXISTS applications TEXT[],
  ADD COLUMN IF NOT EXISTS featured_product_ids UUID[];

-- Enable RLS
ALTER TABLE public.series_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for series_pages
CREATE POLICY "Anyone can view active series pages"
  ON public.series_pages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage series pages"
  ON public.series_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for series_faqs
CREATE POLICY "Anyone can view series FAQs"
  ON public.series_faqs FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage series FAQs"
  ON public.series_faqs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for product_faqs
CREATE POLICY "Anyone can view product FAQs"
  ON public.product_faqs FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product FAQs"
  ON public.product_faqs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for commercial_content
CREATE POLICY "Anyone can view active commercial content"
  ON public.commercial_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage commercial content"
  ON public.commercial_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert initial series pages content
INSERT INTO public.series_pages (series_slug, series_name, title, meta_description, meta_keywords, hero_title, hero_description, content, power_range_min, power_range_max) VALUES
('atv320', 'ATV320', 'Schneider ATV320 VFD Drives | 0.18-15 kW | Best Prices India', 'Buy Schneider ATV320 Variable Frequency Drives in India. Power range 0.18kW to 15kW. Best prices, genuine products, fast delivery. Authorized Schneider Electric dealer Delhi.', ARRAY['atv320', 'schneider atv320', 'atv320 vfd', 'atv320 price india', 'altivar 320', 'atv320 22kw', 'atv320 15kw'], 'Schneider ATV320 Variable Frequency Drives', 'Compact, easy-to-use VFD for simple machines. Power range: 0.18 kW to 15 kW. Perfect for pumps, fans, conveyors, and basic automation applications.', 'The Schneider Electric ATV320 series represents the perfect balance between performance and simplicity for basic machine control applications. Designed for ease of use, the ATV320 is ideal for simple machines in industries such as HVAC, water treatment, material handling, and light manufacturing.\n\n## Key Features of ATV320\n\n- **Compact Design**: Space-saving footprint perfect for panel mounting\n- **Easy Setup**: Intuitive keypad with plain language menu\n- **Wide Power Range**: 0.18 kW to 15 kW (0.25 HP to 20 HP)\n- **Multiple Control Modes**: V/F, sensorless vector control\n- **Built-in Safety**: STO (Safe Torque Off) function\n- **Energy Savings**: Automatic energy optimization\n\n## Technical Specifications\n\n- Input Voltage: 200-240V single phase, 200-240V / 380-500V three phase\n- Output Frequency: 0.1 to 500 Hz\n- Overload: 150% for 60 seconds\n- Protection: IP20 (standard), IP21, IP54, IP55 (with kit)\n- Communication: Modbus RTU, CANopen (optional)\n- Display: 7-segment LED + plain text menu\n\n## Applications\n\n### HVAC Systems\nIdeal for controlling fans, blowers, and HVAC equipment in commercial buildings.\n\n### Water & Wastewater\nPerfect for pumps, mixers, and aerators in water treatment plants.\n\n### Material Handling\nConveyors, lifts, and transport systems in warehouses and distribution centers.\n\n### Light Manufacturing\nSimple machines, packaging equipment, and light industrial applications.\n\n## Why Choose ATV320?\n\n1. **Ease of Use**: Quick commissioning with smart commissioning wizard\n2. **Reliability**: Proven technology from Schneider Electric\n3. **Cost-Effective**: Best value for simple applications\n4. **Energy Efficient**: Reduce energy consumption by up to 30%\n5. **Support**: Local technical support and service in India\n\n## Available Models\n\nBrowse our complete range of ATV320 drives below, available in various power ratings and voltage configurations.', '0.18 kW', '15 kW'),

('atv310', 'ATV310', 'Schneider ATV310 VFD Drives | 0.18-15 kW | India', 'Schneider ATV310 Variable Speed Drives for simple machines. Power: 0.18kW-15kW. Compact, reliable, easy to use. Buy online with best prices in India.', ARRAY['atv310', 'atv310 schneider', 'atv310hu15n4e', 'altivar 310', 'atv310 vfd'], 'Schneider ATV310 Variable Speed Drives', 'Simple, compact VFD for basic applications. Power range: 0.18 kW to 15 kW. Ideal for simple machines in OEM and industrial markets.', 'The ATV310 is designed for simple machines requiring basic speed control. Its compact size and easy setup make it perfect for OEM applications and simple industrial machines.\n\n## Key Features\n\n- Ultra-compact design\n- Simple installation and commissioning\n- Robust and reliable operation\n- Energy savings up to 30%\n- Built-in EMC filter\n- Multiple I/O options\n\n## Technical Details\n\n- Power Range: 0.18 kW to 15 kW\n- Voltage: 200-240V 1ph/3ph, 380-500V 3ph\n- Frequency: 0-500 Hz\n- Control: V/F, sensorless vector\n- Display: 7-segment LED\n\n## Applications\n\n- Simple conveyors\n- Basic pumps and fans\n- Mixers and agitators\n- Light packaging machines\n- Simple automation', '0.18 kW', '15 kW'),

('atv630', 'ATV630', 'Schneider ATV630 VFD | 0.75-500 kW | High Performance Drives India', 'Schneider ATV630 Process Drives for demanding applications. 0.75kW to 500kW. Advanced control, high performance. Best prices in India.', ARRAY['atv630', 'atv630 schneider', 'atv630 160kw', 'altivar 630', 'atv630 vfd'], 'Schneider ATV630 Process Drives', 'High-performance drives for demanding process applications. Power: 0.75 kW to 500 kW. Advanced control and connectivity.', 'The ATV630 Process Drive delivers high performance for demanding industrial applications requiring precise control and advanced features.\n\n## Key Features\n\n- Real sensorless vector control\n- Advanced process PID\n- Embedded Ethernet & safety functions\n- Pump & fan optimization\n- Energy monitoring\n- Hot-swappable keypad\n\n## Technical Specifications\n\n- Power: 0.75 kW to 500 kW\n- Voltage: 380-500V three-phase\n- Frequency: 0.1-500 Hz\n- Control: Real vector, V/F\n- Overload: 150% for 60s, 110% continuous\n\n## Applications\n\n- Water/wastewater treatment\n- Chemical & petrochemical\n- Oil & gas\n- Mining\n- HVAC large systems', '0.75 kW', '500 kW'),

('atv650', 'ATV650', 'Schneider ATV650 Machine Drives | 0.75-1500 kW | India', 'ATV650 Machine Drives for demanding OEM applications. 0.75kW-1500kW. High dynamics, precise motion control. Authorized dealer India.', ARRAY['atv650', 'schneider atv650', 'altivar 650', 'atv650 vfd'], 'Schneider ATV650 Machine Drives', 'High-dynamic drives for demanding machine applications. Power: 0.75 kW to 1500 kW. Superior motion control.', 'ATV650 Machine Drive offers exceptional performance for demanding machine applications requiring fast response and precise control.\n\n## Key Features\n\n- High dynamic performance\n- Advanced motion control\n- Flexible safety functions (SIL3/PLe)\n- Multi-axis synchronization\n- Predictive maintenance\n- EtherCAT communication\n\n## Technical Specifications\n\n- Power: 0.75 kW to 1500 kW\n- Voltage: 380-500V / 525-690V\n- Control: Advanced vector control\n- Overload: 200% for 3s\n- Response time: Ultra-fast\n\n## Applications\n\n- Textile machines\n- Printing & converting\n- Material handling\n- Metal forming\n- Woodworking machines', '0.75 kW', '1500 kW'),

('atv1200', 'ATV1200', 'Schneider ATV1200 Drives | High Power 75-1500 kW | India', 'ATV1200 high-power drives for heavy industrial applications. 75kW-1500kW. Robust, reliable performance. Best prices India.', ARRAY['atv1200', 'schneider atv1200', 'altivar 1200'], 'Schneider ATV1200 High Power Drives', 'Heavy-duty drives for demanding industrial applications. Power: 75 kW to 1500 kW. Built for reliability.', 'The ATV1200 is engineered for heavy industrial applications requiring high power and robust performance in harsh environments.\n\n## Key Features\n\n- Heavy-duty construction\n- Wide power range\n- Multiple cooling options\n- Advanced protection\n- Long service life\n- Easy maintenance\n\n## Technical Specifications\n\n- Power: 75 kW to 1500 kW\n- Voltage: 380-500V / 525-690V\n- Robust design for harsh conditions\n- IP54 standard (IP55 optional)\n\n## Applications\n\n- Mining & minerals\n- Cement & aggregates\n- Power generation\n- Marine & offshore\n- Heavy manufacturing', '75 kW', '1500 kW'),

('atv340', 'ATV340', 'Schneider ATV340 Drives | 0.18-15 kW | Universal Applications India', 'ATV340 universal drives for versatile applications. 0.18kW-15kW. Smart features, easy integration. Buy online India.', ARRAY['atv340', 'schneider atv340', 'altivar 340'], 'Schneider ATV340 Universal Drives', 'Smart drives for versatile applications. Power: 0.18 kW to 15 kW. IoT-ready with mobile commissioning.', 'ATV340 represents the new generation of smart drives with IoT connectivity and mobile commissioning capabilities.\n\n## Key Features\n\n- Mobile commissioning via smartphone\n- IoT-ready with cloud connectivity\n- Smart motor control\n- Energy dashboard\n- Predictive maintenance alerts\n- Compact design\n\n## Technical Specifications\n\n- Power: 0.18 kW to 15 kW\n- Voltage: 200-240V / 380-500V\n- Smartphone app commissioning\n- Built-in Bluetooth\n- Ethernet connectivity\n\n## Applications\n\n- Smart buildings\n- Modern factories\n- OEM machines\n- General automation\n- IoT applications', '0.18 kW', '15 kW');

-- Insert FAQs for ATV320
INSERT INTO public.series_faqs (series_slug, question, answer, display_order) VALUES
('atv320', 'What is the price of ATV320 in India?', 'ATV320 prices in India range from ₹8,000 for 0.75kW models to ₹45,000 for 15kW models. Exact prices depend on power rating, voltage, and features. Request a quote for current pricing.', 1),
('atv320', 'What is the difference between ATV320 and ATV310?', 'ATV320 offers more features including better display, more I/O options, and advanced control modes. ATV310 is simpler and more cost-effective for basic applications. Both cover 0.18-15kW power range.', 2),
('atv320', 'Can ATV320 work with single-phase input?', 'Yes, ATV320 models up to 3kW are available in single-phase 200-240V input configuration. Higher power ratings require three-phase input.', 3),
('atv320', 'What communication protocols does ATV320 support?', 'ATV320 supports Modbus RTU as standard. CANopen and other protocols are available as optional communication cards.', 4),
('atv320', 'Is ATV320 suitable for pump applications?', 'Yes, ATV320 is excellent for pump applications up to 15kW. It includes energy optimization features and can significantly reduce power consumption in variable flow applications.', 5);

-- Insert commercial content pages
INSERT INTO public.commercial_content (page_slug, title, meta_description, meta_keywords, content_blocks) VALUES
('buy-schneider-vfd-india', 'Buy Schneider Electric VFD Drives in India | Authorized Dealer Delhi', 'Buy authentic Schneider Electric Variable Frequency Drives in India. Authorized dealer. All series: ATV320, ATV310, ATV630, ATV650. Best prices, fast delivery, technical support.', ARRAY['buy schneider vfd', 'schneider vfd india', 'vfd dealer delhi', 'authorized schneider dealer'], 
'[
  {"type": "hero", "content": "Buy Authentic Schneider Electric VFDs in India"},
  {"type": "trust_badges", "content": "Authorized Dealer | 1000+ Installations | 24/7 Support"},
  {"type": "why_buy", "content": "Why buy from us"},
  {"type": "series_overview", "content": "Complete product range"},
  {"type": "price_guide", "content": "Transparent pricing"},
  {"type": "delivery", "content": "Pan-India delivery"},
  {"type": "testimonials", "content": "Customer reviews"},
  {"type": "faq", "content": "Frequently asked questions"},
  {"type": "cta", "content": "Request quotation"}
]'::jsonb),

('schneider-vfd-price-india', 'Schneider VFD Price List India 2024 | All Series Price Guide', 'Complete Schneider VFD price list for India. ATV320, ATV310, ATV630, ATV650, ATV1200 prices. Get instant quotes. Authorized dealer with best prices.', ARRAY['schneider vfd price', 'vfd price list india', 'atv320 price', 'schneider drive price'],
'[
  {"type": "hero", "content": "Schneider VFD Price List India 2024"},
  {"type": "price_table", "content": "Dynamic pricing by series and power"},
  {"type": "price_factors", "content": "What affects VFD pricing"},
  {"type": "bulk_discounts", "content": "Volume pricing available"},
  {"type": "financing", "content": "Flexible payment options"},
  {"type": "quotation_form", "content": "Get detailed quote"}
]'::jsonb);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_series_pages_slug ON public.series_pages(series_slug);
CREATE INDEX IF NOT EXISTS idx_series_faqs_slug ON public.series_faqs(series_slug);
CREATE INDEX IF NOT EXISTS idx_product_faqs_product ON public.product_faqs(product_id);
CREATE INDEX IF NOT EXISTS idx_commercial_content_slug ON public.commercial_content(page_slug);

-- Trigger for updated_at
CREATE TRIGGER update_series_pages_updated_at
  BEFORE UPDATE ON public.series_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commercial_content_updated_at
  BEFORE UPDATE ON public.commercial_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();