-- Create LLS Guest Pass tables for invite codes and guest claims

-- 1) lls_invite_codes
CREATE TABLE IF NOT EXISTS public.lls_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  artist_name text NOT NULL,
  curator_name text NULL,
  code text NOT NULL,
  max_claims integer NOT NULL DEFAULT 1 CHECK (max_claims >= 1),
  claims_count integer NOT NULL DEFAULT 0 CHECK (claims_count >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Per-event uniqueness (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lls_invite_codes_event_code_unique'
  ) THEN
    ALTER TABLE public.lls_invite_codes
    ADD CONSTRAINT lls_invite_codes_event_code_unique UNIQUE (event_id, code);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_lls_invite_codes_event_id ON public.lls_invite_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_lls_invite_codes_code ON public.lls_invite_codes(code);

ALTER TABLE public.lls_invite_codes ENABLE ROW LEVEL SECURITY;

-- 2) lls_guest_claims
CREATE TABLE IF NOT EXISTS public.lls_guest_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  invite_code_id uuid NOT NULL REFERENCES public.lls_invite_codes(id) ON DELETE RESTRICT,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_role text NOT NULL CHECK (guest_role IN ('Fan', 'Friend', 'Industry', 'Other')),
  artist_name text NOT NULL,
  qr_token text NOT NULL UNIQUE,
  qr_image_url text NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  checkin_status text NOT NULL DEFAULT 'not_checked_in' CHECK (checkin_status IN ('not_checked_in', 'checked_in')),
  checked_in_at timestamptz NULL,
  checked_in_by text NULL
);

CREATE INDEX IF NOT EXISTS idx_lls_guest_claims_event_id ON public.lls_guest_claims(event_id);
CREATE INDEX IF NOT EXISTS idx_lls_guest_claims_artist_name ON public.lls_guest_claims(artist_name);
CREATE INDEX IF NOT EXISTS idx_lls_guest_claims_qr_token ON public.lls_guest_claims(qr_token);
CREATE INDEX IF NOT EXISTS idx_lls_guest_claims_guest_email ON public.lls_guest_claims(guest_email);

ALTER TABLE public.lls_guest_claims ENABLE ROW LEVEL SECURITY;

-- 3) Storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('lls_qr', 'lls_qr', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for QR codes
DROP POLICY IF EXISTS "Public can view LLS QR codes" ON storage.objects;
CREATE POLICY "Public can view LLS QR codes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'lls_qr');