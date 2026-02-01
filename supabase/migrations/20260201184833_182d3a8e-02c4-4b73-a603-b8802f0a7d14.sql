-- Fix RLS: Allow public to view upcoming AND live events
-- Keep ended events private by default

-- Public/anon: can view upcoming + live
DROP POLICY IF EXISTS "Public can view live events" ON public.events;
DROP POLICY IF EXISTS "Public can view upcoming and live events" ON public.events;

CREATE POLICY "Public can view upcoming and live events"
ON public.events
FOR SELECT
TO anon
USING (status IN ('upcoming', 'live'));

-- Authenticated: can view public events + their own events
DROP POLICY IF EXISTS "Authenticated can view public events" ON public.events;
DROP POLICY IF EXISTS "Artists can view their own events" ON public.events;

CREATE POLICY "Authenticated can view public events and own events"
ON public.events
FOR SELECT
TO authenticated
USING (
  artist_user_id = auth.uid()
  OR status IN ('upcoming', 'live')
);