
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES 
  ('station_submission_audio', 'station_submission_audio', true, '{audio/mpeg}', 10485760),
  ('station_submission_images', 'station_submission_images', true, '{image/jpeg,image/png,image/webp,image/gif}', 3145728);

CREATE POLICY "Public can upload station audio"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'station_submission_audio');

CREATE POLICY "Public can view station audio"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'station_submission_audio');

CREATE POLICY "Public can upload station images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'station_submission_images');

CREATE POLICY "Public can view station images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'station_submission_images');
