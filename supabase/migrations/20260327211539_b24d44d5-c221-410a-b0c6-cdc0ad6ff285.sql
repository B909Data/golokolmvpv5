
CREATE TABLE public.connect_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.connect_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert waitlist signups"
  ON public.connect_waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
