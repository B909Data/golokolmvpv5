ALTER TABLE public.show_listings ADD COLUMN IF NOT EXISTS genre TEXT;
ALTER TABLE public.lls_artist_submissions ADD COLUMN IF NOT EXISTS youtube_url TEXT;
-- Allow artists to insert their own shows
ALTER TABLE public.show_listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artists can insert their own shows" ON public.show_listings;
CREATE POLICY "Artists can insert their own shows"
  ON public.show_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = artist_user_id);
DROP POLICY IF EXISTS "Anyone can read shows" ON public.show_listings;
CREATE POLICY "Anyone can read shows"
  ON public.show_listings
  FOR SELECT
  TO anon, authenticated
  USING (true);