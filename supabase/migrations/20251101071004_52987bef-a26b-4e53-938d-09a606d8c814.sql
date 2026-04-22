-- Create user_favorites table for wishlist functionality
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS for user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.user_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.user_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all favorites"
  ON public.user_favorites
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create user_comparisons table for product comparison
CREATE TABLE IF NOT EXISTS public.user_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id),
  UNIQUE(session_id, product_id)
);

-- Enable RLS for user_comparisons
ALTER TABLE public.user_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_comparisons
CREATE POLICY "Users can view their own comparisons"
  ON public.user_comparisons
  FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can add to comparison"
  ON public.user_comparisons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can remove from comparison"
  ON public.user_comparisons
  FOR DELETE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Admins can view all comparisons"
  ON public.user_comparisons
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add key_features JSONB column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS key_features JSONB DEFAULT '[]'::jsonb;