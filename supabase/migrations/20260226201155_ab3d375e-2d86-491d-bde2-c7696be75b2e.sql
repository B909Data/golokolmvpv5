
-- Drop any existing policies on lls_curated_codes
DROP POLICY IF EXISTS "Public can read curated codes" ON public.lls_curated_codes;
DROP POLICY IF EXISTS "Anyone can view curated codes" ON public.lls_curated_codes;
DROP POLICY IF EXISTS "Authenticated can update curated codes" ON public.lls_curated_codes;

-- Enable RLS (should already be enabled)
ALTER TABLE public.lls_curated_codes ENABLE ROW LEVEL SECURITY;

-- No SELECT policy at all — codes are only accessed via service_role edge functions

-- Authenticated users can update codes (used by redeem edge function with user's JWT)
-- But practically, redemption also uses service_role, so we add no public policies.
-- All access goes through service_role in edge functions.
