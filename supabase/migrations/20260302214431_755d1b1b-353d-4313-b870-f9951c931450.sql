UPDATE storage.buckets
SET file_size_limit = 20971520,
    allowed_mime_types = '{"audio/mpeg"}'
WHERE id = 'submissions_audio';