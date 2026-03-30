
CREATE TABLE public.lls_kiosk_agreement_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  retail_signup_id uuid REFERENCES public.lls_retail_signups(id) ON DELETE SET NULL,
  store_name text NOT NULL,
  contact_name text NOT NULL,
  city text NOT NULL,
  signature_name text NOT NULL,
  signer_title text,
  email text NOT NULL,
  agreement_text text NOT NULL,
  agreement_version text NOT NULL DEFAULT 'LLS_KIOSK_PLACEMENT_V1',
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lls_kiosk_agreement_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert kiosk signatures"
  ON public.lls_kiosk_agreement_signatures
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read kiosk signatures"
  ON public.lls_kiosk_agreement_signatures
  FOR SELECT TO public
  USING (auth.role() = 'service_role');
