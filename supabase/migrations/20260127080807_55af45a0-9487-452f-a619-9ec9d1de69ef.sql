-- Create search_aliases table for intelligent search synonym/abbreviation support
CREATE TABLE public.search_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL,
  canonical_term TEXT NOT NULL,
  alias_type TEXT DEFAULT 'synonym' CHECK (alias_type IN ('synonym', 'abbreviation', 'model_variant')),
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for fast alias lookups
CREATE INDEX idx_search_aliases_alias ON public.search_aliases (LOWER(alias));
CREATE INDEX idx_search_aliases_canonical ON public.search_aliases (LOWER(canonical_term));
CREATE INDEX idx_search_aliases_category ON public.search_aliases (category_id);

-- Enable RLS
ALTER TABLE public.search_aliases ENABLE ROW LEVEL SECURITY;

-- Allow public read access (search needs to work for all users)
CREATE POLICY "Search aliases are publicly readable" 
ON public.search_aliases 
FOR SELECT 
USING (true);

-- Only authenticated users can manage aliases (admin use)
CREATE POLICY "Authenticated users can manage search aliases"
ON public.search_aliases
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Create updated_at trigger
CREATE TRIGGER update_search_aliases_updated_at
BEFORE UPDATE ON public.search_aliases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert common industrial automation aliases
INSERT INTO public.search_aliases (alias, canonical_term, alias_type) VALUES
-- VFD/Drive aliases
('VFD', 'variable frequency drive', 'abbreviation'),
('Inverter', 'variable frequency drive', 'synonym'),
('Drive', 'variable frequency drive', 'abbreviation'),
('AC Drive', 'variable frequency drive', 'synonym'),
('Frequency Converter', 'variable frequency drive', 'synonym'),
('Motor Drive', 'variable frequency drive', 'synonym'),
-- PLC aliases
('PLC', 'programmable logic controller', 'abbreviation'),
('Controller', 'programmable logic controller', 'synonym'),
('PLC CPU', 'programmable logic controller', 'synonym'),
('Logic Controller', 'programmable logic controller', 'synonym'),
-- HMI aliases
('HMI', 'human machine interface', 'abbreviation'),
('Touch Panel', 'human machine interface', 'synonym'),
('Operator Panel', 'human machine interface', 'synonym'),
('Display Panel', 'human machine interface', 'synonym'),
-- Servo aliases
('Servo Drive', 'servo amplifier', 'synonym'),
('Servo Amp', 'servo amplifier', 'abbreviation'),
('Servo Motor Drive', 'servo amplifier', 'synonym'),
-- Brand aliases
('Schneider', 'schneider electric', 'abbreviation'),
('SE', 'schneider electric', 'abbreviation'),
('AB', 'allen bradley', 'abbreviation'),
('A-B', 'allen bradley', 'abbreviation'),
('Rockwell', 'allen bradley', 'synonym'),
('Mitsu', 'mitsubishi electric', 'abbreviation'),
('Melsec', 'mitsubishi electric', 'synonym'),
-- Series aliases
('Altivar', 'atv', 'synonym'),
('ATV320', 'altivar 320', 'model_variant'),
('ATV 320', 'altivar 320', 'model_variant'),
('ATV630', 'altivar 630', 'model_variant'),
('ATV 630', 'altivar 630', 'model_variant');