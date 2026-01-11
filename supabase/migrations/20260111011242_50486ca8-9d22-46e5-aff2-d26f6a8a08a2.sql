-- Add merch and music link columns to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS merch_link text NULL,
ADD COLUMN IF NOT EXISTS music_link text NULL;

-- Create email_optins table for fan email capture
CREATE TABLE IF NOT EXISTS public.email_optins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prevent duplicates (case-insensitive) per event
CREATE UNIQUE INDEX IF NOT EXISTS email_optins_event_email_lower_uniq
  ON public.email_optins (event_id, lower(email));

-- Enable RLS
ALTER TABLE public.email_optins ENABLE ROW LEVEL SECURITY;

-- Anyone can insert email optins (fans submitting their email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='email_optins' AND policyname='Anyone can insert email optins'
  ) THEN
    CREATE POLICY "Anyone can insert email optins"
    ON public.email_optins
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;