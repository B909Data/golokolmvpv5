-- Add missing columns to events table for After Party creation flow
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS venue_name text,
  ADD COLUMN IF NOT EXISTS ticket_url text,
  ADD COLUMN IF NOT EXISTS genres text[],
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS artist_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text;

-- Add RLS policy for UPDATE on after_party_enabled (needed for verify-payment edge function using service role)
-- No public INSERT policy - edge function uses service role instead