-- Update LLS Guest Pass schema for reusable codes with expiration

-- 1) Remove max_claims and claims_count columns from lls_invite_codes
ALTER TABLE public.lls_invite_codes 
DROP COLUMN IF EXISTS max_claims,
DROP COLUMN IF EXISTS claims_count;

-- 2) Add expires_at column for time-based expiration
ALTER TABLE public.lls_invite_codes 
ADD COLUMN IF NOT EXISTS expires_at timestamptz NULL;

-- 3) Add index for expires_at lookups
CREATE INDEX IF NOT EXISTS idx_lls_invite_codes_expires_at
  ON public.lls_invite_codes(expires_at);

-- 4) Add unique constraint: one pass per email per event
CREATE UNIQUE INDEX IF NOT EXISTS lls_guest_unique_email_per_event
ON public.lls_guest_claims (event_id, lower(guest_email));