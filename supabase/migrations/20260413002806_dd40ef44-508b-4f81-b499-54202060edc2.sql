-- Create storage policies for artist-profiles bucket

-- Allow authenticated users to upload their own profile images
CREATE POLICY "Artists can upload profile images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artist-profiles');

-- Allow public to read profile images
CREATE POLICY "Profile images are publicly readable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artist-profiles');

-- Allow artists to update their profile image
CREATE POLICY "Artists can update profile images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'artist-profiles');