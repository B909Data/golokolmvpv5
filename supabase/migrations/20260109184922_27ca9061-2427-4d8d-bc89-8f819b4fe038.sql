-- Add flyer columns to partners table (for curators)
ALTER TABLE public.partners
ADD COLUMN flyer_image_url TEXT,
ADD COLUMN flyer_updated_at TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for partner flyers
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner_flyers', 'partner_flyers', true)
ON CONFLICT (id) DO NOTHING;

-- Only public read policy - admin uploads use service role (bypasses RLS)
CREATE POLICY "Partner flyers are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'partner_flyers');