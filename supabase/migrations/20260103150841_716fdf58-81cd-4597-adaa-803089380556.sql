-- Add message column to after_party_messages
ALTER TABLE public.after_party_messages ADD COLUMN message text;

-- Ensure RLS is enabled
ALTER TABLE public.after_party_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages
CREATE POLICY "Anyone can view messages"
ON public.after_party_messages
FOR SELECT
USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can insert messages"
ON public.after_party_messages
FOR INSERT
WITH CHECK (true);