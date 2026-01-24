-- 1) Add fields to events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS after_party_started_at timestamptz,
ADD COLUMN IF NOT EXISTS after_party_expires_at timestamptz;

COMMENT ON COLUMN public.events.after_party_started_at IS 'Timestamp when first fan joins the after party (starts 24h window)';
COMMENT ON COLUMN public.events.after_party_expires_at IS 'Timestamp when after party expires (started_at + 24h)';

-- 2) Trigger function: on first attendee insert, set started/expires if null
CREATE OR REPLACE FUNCTION public.set_after_party_window_on_first_fan()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  started_at timestamptz;
BEGIN
  -- Only set the window if it hasn't started yet
  UPDATE public.events e
  SET
    after_party_started_at = COALESCE(e.after_party_started_at, now()),
    after_party_expires_at = COALESCE(e.after_party_expires_at, now() + interval '24 hours')
  WHERE e.id = NEW.event_id
    AND e.after_party_started_at IS NULL
  RETURNING e.after_party_started_at INTO started_at;

  RETURN NEW;
END;
$$;

-- 3) Attach trigger to attendees inserts
DROP TRIGGER IF EXISTS trg_set_after_party_window_on_first_fan ON public.attendees;

CREATE TRIGGER trg_set_after_party_window_on_first_fan
AFTER INSERT ON public.attendees
FOR EACH ROW
EXECUTE FUNCTION public.set_after_party_window_on_first_fan();