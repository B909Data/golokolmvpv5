-- Add mp3_url column to submissions
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS mp3_url text;

-- Create submissions_audio storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions_audio', 'submissions_audio', true)
ON CONFLICT (id) DO NOTHING;

-- Remove old policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Public can read submission audio" ON storage.objects;

-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions_audio');

-- Anyone can read (public URLs allowed)
CREATE POLICY "Public can read submission audio"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'submissions_audio');