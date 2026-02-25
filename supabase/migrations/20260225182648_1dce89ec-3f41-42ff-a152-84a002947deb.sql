
-- Add columns for single-activation token and purchase email
ALTER TABLE public.attendees
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz,
  ADD COLUMN IF NOT EXISTS purchase_email text,
  ADD COLUMN IF NOT EXISTS access_token_expires_at timestamptz;

-- Unique index on access_token
CREATE UNIQUE INDEX IF NOT EXISTS attendees_access_token_unique ON public.attendees (access_token) WHERE access_token IS NOT NULL;
