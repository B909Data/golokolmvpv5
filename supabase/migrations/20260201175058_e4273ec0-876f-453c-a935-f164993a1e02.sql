-- Phase 1 MVP6: Artist Magic Link Auth + Event Ownership + Fan-safe Public Read

-- Add ownership mapping column
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS artist_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_events_artist_user_id ON public.events(artist_user_id);

-- Ensure RLS is enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policy that allows anyone to view all events (too permissive)
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;

-- Artist policies (authenticated)
DROP POLICY IF EXISTS "Artists can update their own events" ON public.events;
DROP POLICY IF EXISTS "Artists can view their own events" ON public.events;

CREATE POLICY "Artists can view their own events"
ON public.events
FOR SELECT
TO authenticated
USING (artist_user_id = auth.uid());

CREATE POLICY "Artists can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (artist_user_id = auth.uid())
WITH CHECK (artist_user_id = auth.uid());

-- Fan/public policy (anon) — keep fan RSVP/pass pages working for live events
DROP POLICY IF EXISTS "Public can view live events" ON public.events;

CREATE POLICY "Public can view live events"
ON public.events
FOR SELECT
TO anon
USING (status = 'live');