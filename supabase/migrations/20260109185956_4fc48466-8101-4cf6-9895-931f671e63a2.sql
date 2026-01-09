-- Add partner discount code fields to existing table
ALTER TABLE public.afterparty_discount_codes
ADD COLUMN partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
ADD COLUMN month_scope TEXT, -- Format: '2026-01'
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Index for efficient queries on partner + month
CREATE INDEX idx_discount_codes_partner_month ON public.afterparty_discount_codes(partner_id, month_scope);

-- Comment explaining the monthly caps
COMMENT ON COLUMN public.afterparty_discount_codes.partner_id IS 'If set, this code belongs to a partner pool. Curators: 20/month, Venues: 50/month';
COMMENT ON COLUMN public.afterparty_discount_codes.month_scope IS 'Month this code was allocated for, format YYYY-MM';
COMMENT ON COLUMN public.afterparty_discount_codes.expires_at IS 'Optional expiration timestamp';