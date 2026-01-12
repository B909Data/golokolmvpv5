-- Create cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active cities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='cities' AND policyname='Anyone can view active cities'
  ) THEN
    CREATE POLICY "Anyone can view active cities"
      ON public.cities
      FOR SELECT
      USING (active = true);
  END IF;
END $$;

-- Add city_id to partners table
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_partners_city_id ON public.partners(city_id);

-- Insert initial cities (Atlanta and Athens)
INSERT INTO public.cities (name)
VALUES ('Atlanta'), ('Athens')
ON CONFLICT (name) DO NOTHING;