-- Create partner_type enum
CREATE TYPE public.partner_type AS ENUM ('curator', 'venue');

-- Create partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.partner_type NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Public read access for active partners (for dropdowns)
CREATE POLICY "Anyone can view active partners"
  ON public.partners
  FOR SELECT
  USING (active = true);

-- Service role can manage all partners
CREATE POLICY "Service role can manage partners"
  ON public.partners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add partner reference columns to events
ALTER TABLE public.events
ADD COLUMN curator_id UUID REFERENCES public.partners(id),
ADD COLUMN venue_id UUID REFERENCES public.partners(id),
ADD COLUMN curator_other_name TEXT,
ADD COLUMN venue_other_name TEXT;

-- Create validation trigger to ensure type consistency
CREATE OR REPLACE FUNCTION public.validate_event_partner_types()
RETURNS TRIGGER AS $$
DECLARE
  curator_type public.partner_type;
  venue_type public.partner_type;
BEGIN
  -- Validate curator_id points to a curator
  IF NEW.curator_id IS NOT NULL THEN
    SELECT type INTO curator_type FROM public.partners WHERE id = NEW.curator_id;
    IF curator_type IS NULL OR curator_type != 'curator' THEN
      RAISE EXCEPTION 'curator_id must reference a partner with type curator';
    END IF;
  END IF;
  
  -- Validate venue_id points to a venue
  IF NEW.venue_id IS NOT NULL THEN
    SELECT type INTO venue_type FROM public.partners WHERE id = NEW.venue_id;
    IF venue_type IS NULL OR venue_type != 'venue' THEN
      RAISE EXCEPTION 'venue_id must reference a partner with type venue';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to events table
CREATE TRIGGER validate_event_partners
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_event_partner_types();

-- Create index for faster lookups
CREATE INDEX idx_partners_type_active ON public.partners(type, active);