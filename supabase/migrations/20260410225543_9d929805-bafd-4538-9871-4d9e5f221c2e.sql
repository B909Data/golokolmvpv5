CREATE POLICY "Anyone can read retail signups by slug"
ON public.lls_retail_signups
FOR SELECT
TO anon, authenticated
USING (true);