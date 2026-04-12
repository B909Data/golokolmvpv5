-- Allow authenticated users to insert their own submissions
CREATE POLICY "Artists can insert own submissions"
ON lls_artist_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = artist_user_id);

-- Allow authenticated users to read their own submissions
CREATE POLICY "Artists can read own submissions"
ON lls_artist_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = artist_user_id);

-- Allow authenticated users to upload audio to station_submission_audio bucket
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'station_submission_audio');

-- Allow authenticated users to upload images to station_submission_images bucket
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'station_submission_images');