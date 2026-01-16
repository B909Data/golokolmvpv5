-- Add column to track when the last artist-entered SMS was sent for anti-spam
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS artist_entered_sms_at timestamp with time zone DEFAULT NULL;