-- Add qr_token and checked_in_at columns to attendees table
ALTER TABLE public.attendees 
ADD COLUMN IF NOT EXISTS qr_token text UNIQUE,
ADD COLUMN IF NOT EXISTS checked_in_at timestamptz NULL;