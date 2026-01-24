-- Add pricing configuration to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS pricing_mode text CHECK (pricing_mode IN ('fixed', 'pwyw')),
ADD COLUMN IF NOT EXISTS fixed_price integer CHECK (fixed_price IS NULL OR fixed_price >= 100),
ADD COLUMN IF NOT EXISTS min_price integer CHECK (min_price IS NULL OR min_price >= 100),
ADD COLUMN IF NOT EXISTS pricing_locked_at timestamp with time zone;

-- Add constraint to ensure pricing fields match mode
ALTER TABLE public.events
ADD CONSTRAINT events_pricing_fields_match_mode
CHECK (
  pricing_mode IS NULL OR
  (
    pricing_mode = 'fixed'
    AND fixed_price IS NOT NULL
    AND min_price IS NULL
  ) OR
  (
    pricing_mode = 'pwyw'
    AND min_price IS NOT NULL
    AND fixed_price IS NULL
  )
);

-- Add payment tracking to attendees table
ALTER TABLE public.attendees
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'free' CHECK (payment_status IN ('pending', 'paid', 'free')),
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS paid_amount integer,
ADD COLUMN IF NOT EXISTS paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sms_opt_in boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.events.pricing_mode IS 'fixed = single price, pwyw = pay-what-you-want with minimum';
COMMENT ON COLUMN public.events.fixed_price IS 'Price in cents when pricing_mode is fixed';
COMMENT ON COLUMN public.events.min_price IS 'Minimum price in cents when pricing_mode is pwyw';
COMMENT ON COLUMN public.attendees.payment_status IS 'free = walk-in/free RSVP, pending = payment started, paid = payment complete';