-- Add artist access columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS artist_access_token text UNIQUE,
ADD COLUMN IF NOT EXISTS pinned_message text,
ADD COLUMN IF NOT EXISTS livestream_url text;