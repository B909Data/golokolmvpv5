
-- Create curated_submissions table
CREATE TABLE public.curated_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  artist_name text NOT NULL,
  contact_email text NOT NULL,
  song_title text NOT NULL,
  spotify_url text NOT NULL,
  phone text,
  instagram_handle text,
  genre_style text,
  city_market text,
  physical_product text,
  short_bio text,
  song_image_url text,
  how_heard text,
  mp3_url text,
  mp3_path text,
  original_filename text,
  music_release_agreed boolean NOT NULL DEFAULT false,
  music_release_agreed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'Unreviewed',
  admin_status text DEFAULT 'pending',
  admin_notes text
);

-- Create general_submissions table
CREATE TABLE public.general_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  artist_name text NOT NULL,
  contact_email text NOT NULL,
  song_title text NOT NULL,
  spotify_url text NOT NULL,
  youtube_url text,
  phone text,
  instagram_handle text,
  notes text,
  promo_code text,
  stripe_session_id text,
  payment_status text DEFAULT 'unpaid',
  music_release_agreed boolean NOT NULL DEFAULT false,
  music_release_agreed_at timestamp with time zone,
  status text NOT NULL DEFAULT 'Unreviewed',
  admin_status text DEFAULT 'pending',
  admin_notes text
);

-- Enable RLS
ALTER TABLE public.curated_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_submissions ENABLE ROW LEVEL SECURITY;

-- Curated submissions policies
CREATE POLICY "Anyone can insert curated submissions"
  ON public.curated_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read curated submissions"
  ON public.curated_submissions FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update curated submissions"
  ON public.curated_submissions FOR UPDATE
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete curated submissions"
  ON public.curated_submissions FOR DELETE
  TO public
  USING (auth.role() = 'service_role');

-- General submissions policies
CREATE POLICY "Anyone can insert general submissions"
  ON public.general_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read general submissions"
  ON public.general_submissions FOR SELECT
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can update general submissions"
  ON public.general_submissions FOR UPDATE
  TO public
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can delete general submissions"
  ON public.general_submissions FOR DELETE
  TO public
  USING (auth.role() = 'service_role');

-- Migrate existing curated submissions
INSERT INTO public.curated_submissions (id, created_at, artist_name, contact_email, song_title, spotify_url, phone, instagram_handle, genre_style, city_market, physical_product, short_bio, song_image_url, how_heard, mp3_url, mp3_path, original_filename, music_release_agreed, music_release_agreed_at, status, admin_status, admin_notes)
SELECT id, created_at, artist_name, contact_email, song_title, spotify_url, phone, instagram_handle, genre_style, city_market, physical_product, short_bio, song_image_url, how_heard, mp3_url, mp3_path, original_filename, music_release_agreed, music_release_agreed_at, status, admin_status, admin_notes
FROM public.submissions
WHERE payment_status = 'curated';

-- Migrate existing general submissions
INSERT INTO public.general_submissions (id, created_at, artist_name, contact_email, song_title, spotify_url, youtube_url, phone, instagram_handle, notes, promo_code, stripe_session_id, payment_status, music_release_agreed, music_release_agreed_at, status, admin_status, admin_notes)
SELECT id, created_at, artist_name, contact_email, song_title, spotify_url, youtube_url, phone, instagram_handle, notes, promo_code, stripe_session_id, payment_status, music_release_agreed, music_release_agreed_at, status, admin_status, admin_notes
FROM public.submissions
WHERE payment_status != 'curated' OR payment_status IS NULL;
