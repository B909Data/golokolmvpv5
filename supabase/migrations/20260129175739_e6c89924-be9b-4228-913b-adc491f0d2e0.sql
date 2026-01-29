-- =========================================================
-- 1) Create promo_codes table
-- =========================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('percent_50', 'free')),
  is_active boolean NOT NULL DEFAULT true,
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Normalize codes to uppercase on insert/update (prevents duplicates like "abc" vs "ABC")
CREATE OR REPLACE FUNCTION public.normalize_promo_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.code := UPPER(TRIM(NEW.code));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_normalize_promo_code ON public.promo_codes;
CREATE TRIGGER trg_normalize_promo_code
BEFORE INSERT OR UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.normalize_promo_code();

-- Helpful index for fast lookup (especially if table grows)
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON public.promo_codes (code);

-- =========================================================
-- 2) Enable RLS + correct policies
-- =========================================================

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Service role full access ONLY (edge functions use service role key)
DROP POLICY IF EXISTS "Service role can manage promo codes" ON public.promo_codes;
CREATE POLICY "Service role can manage promo codes"
ON public.promo_codes
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Optional: Public can view active promo codes (ONLY for UI hints)
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes
FOR SELECT
USING (is_active = true);

-- =========================================================
-- 3) Atomic validation + redemption function
-- =========================================================

CREATE OR REPLACE FUNCTION public.validate_and_redeem_promo_code(p_code text)
RETURNS TABLE(
  valid boolean,
  promo_kind text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo_record RECORD;
  v_code text;
BEGIN
  IF p_code IS NULL OR LENGTH(TRIM(p_code)) = 0 THEN
    RETURN QUERY SELECT false, NULL::text, 'Promo code is required'::text;
    RETURN;
  END IF;

  v_code := UPPER(TRIM(p_code));

  -- Atomically select and lock the row
  SELECT * INTO v_promo_record
  FROM public.promo_codes
  WHERE code = v_code
  FOR UPDATE;

  IF v_promo_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::text, 'Invalid promo code'::text;
    RETURN;
  END IF;

  IF NOT v_promo_record.is_active THEN
    RETURN QUERY SELECT false, NULL::text, 'This promo code is no longer active'::text;
    RETURN;
  END IF;

  IF v_promo_record.starts_at IS NOT NULL AND now() < v_promo_record.starts_at THEN
    RETURN QUERY SELECT false, NULL::text, 'This promo code is not yet valid'::text;
    RETURN;
  END IF;

  IF v_promo_record.ends_at IS NOT NULL AND now() > v_promo_record.ends_at THEN
    RETURN QUERY SELECT false, NULL::text, 'This promo code has expired'::text;
    RETURN;
  END IF;

  IF v_promo_record.max_redemptions IS NOT NULL
     AND v_promo_record.redemption_count >= v_promo_record.max_redemptions THEN
    RETURN QUERY SELECT false, NULL::text, 'This promo code has reached its usage limit'::text;
    RETURN;
  END IF;

  -- Increment redemption count (still within same transaction + row lock)
  UPDATE public.promo_codes
  SET redemption_count = redemption_count + 1
  WHERE id = v_promo_record.id;

  RETURN QUERY SELECT true, v_promo_record.kind, NULL::text;
END;
$$;

-- CRITICAL: prevent clients from calling the SECURITY DEFINER RPC directly
REVOKE ALL ON FUNCTION public.validate_and_redeem_promo_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.validate_and_redeem_promo_code(text) FROM anon;
REVOKE ALL ON FUNCTION public.validate_and_redeem_promo_code(text) FROM authenticated;

-- Allow only service_role to execute (edge functions)
GRANT EXECUTE ON FUNCTION public.validate_and_redeem_promo_code(text) TO service_role;