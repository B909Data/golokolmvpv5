CREATE TABLE public.lls_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  artist_choice text NOT NULL,
  notify boolean NOT NULL DEFAULT false,
  CONSTRAINT lls_votes_email_unique UNIQUE (email)
);

ALTER TABLE public.lls_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert votes"
ON public.lls_votes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);