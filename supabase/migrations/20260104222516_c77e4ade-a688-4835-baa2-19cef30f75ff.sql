-- Create short link mapping table for SMS-friendly URLs
CREATE TABLE IF NOT EXISTS public.short_links (
  code TEXT PRIMARY KEY,
  target_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helpful for future cleanup / reporting
CREATE INDEX IF NOT EXISTS short_links_created_at_idx
ON public.short_links (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;

-- Public read so /q/:code can resolve links for anyone
CREATE POLICY "Anyone can view short links"
ON public.short_links
FOR SELECT
USING (true);