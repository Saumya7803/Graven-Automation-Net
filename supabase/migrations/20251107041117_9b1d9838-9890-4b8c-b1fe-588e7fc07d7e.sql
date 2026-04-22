-- Create customer_questions table for managing customer inquiries
CREATE TABLE public.customer_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  question TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  location_page TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  responded_by UUID,
  responded_at TIMESTAMP WITH TIME ZONE,
  is_converted_to_faq BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own questions"
ON public.customer_questions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own questions"
ON public.customer_questions
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all questions"
ON public.customer_questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update questions"
ON public.customer_questions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete questions"
ON public.customer_questions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customer_questions_updated_at
BEFORE UPDATE ON public.customer_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_customer_questions_status ON public.customer_questions(status);
CREATE INDEX idx_customer_questions_category ON public.customer_questions(category);
CREATE INDEX idx_customer_questions_user_id ON public.customer_questions(user_id);
CREATE INDEX idx_customer_questions_created_at ON public.customer_questions(created_at DESC);