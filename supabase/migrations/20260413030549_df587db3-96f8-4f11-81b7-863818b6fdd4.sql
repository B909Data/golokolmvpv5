
CREATE TABLE public.suggestions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert suggestions"
ON public.suggestions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Service role can read suggestions"
ON public.suggestions
FOR SELECT
TO public
USING (auth.role() = 'service_role'::text);
