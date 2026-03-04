ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS mp3_path text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS original_filename text;