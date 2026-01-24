-- Add stripe_account_id to events for Stripe Connect
ALTER TABLE public.events
ADD COLUMN stripe_account_id text;

-- Ensure it looks like a Stripe account ID when set
ALTER TABLE public.events
ADD CONSTRAINT events_stripe_account_format_check
CHECK (stripe_account_id IS NULL OR stripe_account_id LIKE 'acct_%');