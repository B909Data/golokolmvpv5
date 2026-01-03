-- Allow anyone to insert recaps
CREATE POLICY "Anyone can insert recaps"
ON public.recaps
FOR INSERT
WITH CHECK (true);