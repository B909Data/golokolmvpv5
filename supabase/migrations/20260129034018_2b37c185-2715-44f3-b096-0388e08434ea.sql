-- Add plan and revenue_cap columns to events table for tiered pricing
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS plan text CHECK (plan IN ('emerge', 'touring')),
ADD COLUMN IF NOT EXISTS revenue_cap integer;