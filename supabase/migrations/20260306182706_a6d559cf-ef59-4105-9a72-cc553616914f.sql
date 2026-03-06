CREATE TABLE public.lls_music_release_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  legal_name text NOT NULL,
  artist_name text NOT NULL,
  email text NOT NULL,
  role text,
  signature_name text NOT NULL,
  agreement_version text NOT NULL DEFAULT 'LLS_MUSIC_RELEASE_V1',
  agreement_text text NOT NULL,
  release_confirmed boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  event_id uuid REFERENCES public.events(id),
  submission_id uuid
);

ALTER TABLE public.lls_music_release_signatures ENABLE ROW LEVEL SECURITY;

-- Public can insert signatures (no auth required)
CREATE POLICY "Anyone can insert signatures"
ON public.lls_music_release_signatures
FOR INSERT
WITH CHECK (true);

-- Only service role can read signatures (admin via edge function)
CREATE POLICY "Service role can read signatures"
ON public.lls_music_release_signatures
FOR SELECT
USING (auth.role() = 'service_role');
