-- Create enums
CREATE TYPE public.event_type AS ENUM ('lls', 'after_party');
CREATE TYPE public.event_status AS ENUM ('upcoming', 'live', 'ended');
CREATE TYPE public.checkin_method AS ENUM ('qr');
CREATE TYPE public.message_role AS ENUM ('fan', 'artist');
CREATE TYPE public.badge_type AS ENUM ('first_show', 'repeat_show');

-- Create events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type event_type NOT NULL,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  ends_at timestamptz NULL,
  after_party_opens_at timestamptz NULL,
  status event_status NOT NULL DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now()
);

-- Create attendees table
CREATE TABLE public.attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  phone text NULL,
  display_name text NULL,
  checkin_method checkin_method NOT NULL DEFAULT 'qr',
  created_at timestamptz DEFAULT now()
);

-- Create after_party_messages table
CREATE TABLE public.after_party_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_id uuid NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
  role message_role NOT NULL DEFAULT 'fan',
  created_at timestamptz DEFAULT now()
);

-- Create recaps table
CREATE TABLE public.recaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid UNIQUE NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  content text NULL,
  generated_at timestamptz NULL,
  share_token text NULL,
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid NOT NULL REFERENCES public.attendees(id) ON DELETE CASCADE,
  artist_id uuid NULL,
  badge badge_type NOT NULL,
  count int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.after_party_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for events: SELECT for anon/auth
CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

-- RLS policies for attendees: INSERT + SELECT for anon/auth
CREATE POLICY "Anyone can view attendees"
ON public.attendees
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can create attendees"
ON public.attendees
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS policies for recaps: SELECT for anon/auth
CREATE POLICY "Anyone can view recaps"
ON public.recaps
FOR SELECT
TO anon, authenticated
USING (true);

-- No policies for after_party_messages and badges (locked down)