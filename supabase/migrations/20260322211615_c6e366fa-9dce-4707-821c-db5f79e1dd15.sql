
-- Add session column to lls_votes (default to 'lls1' for existing rows)
ALTER TABLE public.lls_votes ADD COLUMN session text NOT NULL DEFAULT 'lls1';

-- Drop and recreate the view to include session
DROP VIEW IF EXISTS public.lls_vote_counts;
CREATE VIEW public.lls_vote_counts AS
SELECT session, artist_choice, count(*) AS total_votes
FROM public.lls_votes
GROUP BY session, artist_choice;
