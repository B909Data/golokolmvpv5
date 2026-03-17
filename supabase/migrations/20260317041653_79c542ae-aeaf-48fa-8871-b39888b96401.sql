
-- Table: lls_artist_submissions
CREATE TABLE public.lls_artist_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  genre_style TEXT NOT NULL,
  city_market TEXT NOT NULL,
  physical_product TEXT NOT NULL,
  how_heard TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lls_artist_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert artist submissions"
  ON public.lls_artist_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Table: lls_retail_signups
CREATE TABLE public.lls_retail_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL,
  city_location TEXT NOT NULL,
  store_type TEXT NOT NULL,
  has_listening_station TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lls_retail_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert retail signups"
  ON public.lls_retail_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
