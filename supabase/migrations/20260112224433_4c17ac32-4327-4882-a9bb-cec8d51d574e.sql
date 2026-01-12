-- Add admin_state column for After Party state management (active, paused, archived)
ALTER TABLE public.events 
ADD COLUMN admin_state text NOT NULL DEFAULT 'active' 
CHECK (admin_state IN ('active', 'paused', 'archived'));