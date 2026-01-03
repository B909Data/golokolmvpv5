-- Create submissions table for LLS
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  artist_name text NOT NULL,
  contact_email text NOT NULL,
  song_title text NOT NULL,
  spotify_url text NOT NULL,
  youtube_url text NULL,
  notes text NULL,
  status text NOT NULL DEFAULT 'Unreviewed',
  admin_notes text NULL,
  stripe_session_id text UNIQUE
);

-- Enable RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- No public policies - all access via service role in edge functions