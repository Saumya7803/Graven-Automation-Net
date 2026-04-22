-- Create model_master table for storing master catalog of all model numbers
CREATE TABLE public.model_master (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_number TEXT NOT NULL UNIQUE,
    category_slug TEXT NOT NULL,
    brand_slug TEXT NOT NULL,
    series_slug TEXT NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT,
    lifecycle_status TEXT DEFAULT 'Active' CHECK (lifecycle_status IN ('Active', 'Discontinued', 'Obsolete')),
    discontinued_at TIMESTAMP WITH TIME ZONE,
    specifications JSONB DEFAULT '{}',
    key_features JSONB DEFAULT '[]',
    power_range TEXT,
    replacement_models TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_model_master_lookup ON public.model_master(category_slug, brand_slug, series_slug);
CREATE INDEX idx_model_master_status ON public.model_master(lifecycle_status);
CREATE INDEX idx_model_master_search ON public.model_master USING gin(to_tsvector('english', name || ' ' || model_number));
CREATE INDEX idx_model_master_brand ON public.model_master(brand_slug);
CREATE INDEX idx_model_master_active ON public.model_master(is_active);

-- Enable RLS
ALTER TABLE public.model_master ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active models
CREATE POLICY "Anyone can view active models" ON public.model_master
    FOR SELECT USING (is_active = true);

-- Policy: Admins can manage all models (CRUD)
CREATE POLICY "Admins can manage models" ON public.model_master
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_model_master_updated_at
    BEFORE UPDATE ON public.model_master
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();