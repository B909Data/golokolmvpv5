ALTER TABLE public.submissions
  ADD COLUMN music_release_agreed boolean NOT NULL DEFAULT false,
  ADD COLUMN music_release_agreed_at timestamptz;