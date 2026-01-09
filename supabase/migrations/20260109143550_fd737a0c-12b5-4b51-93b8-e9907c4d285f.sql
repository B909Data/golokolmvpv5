-- Create discount codes table for After Party listings
CREATE TABLE public.afterparty_discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('50_percent', 'free')),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.afterparty_discount_codes ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT for code validation during checkout
CREATE POLICY "Anyone can view discount codes"
ON public.afterparty_discount_codes
FOR SELECT
USING (true);