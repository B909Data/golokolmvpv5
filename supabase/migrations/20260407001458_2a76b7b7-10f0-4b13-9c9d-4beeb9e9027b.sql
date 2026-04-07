ALTER TABLE public.lls_artist_submissions
  ADD COLUMN IF NOT EXISTS song_title text,
  ADD COLUMN IF NOT EXISTS mp3_url text,
  ADD COLUMN IF NOT EXISTS mp3_path text,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS rights_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS no_royalties_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_freeze_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_confirmed boolean NOT NULL DEFAULT false;