DROP POLICY "Authenticated users can upload audio" ON storage.objects;
CREATE POLICY "Anyone can upload audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submissions_audio');