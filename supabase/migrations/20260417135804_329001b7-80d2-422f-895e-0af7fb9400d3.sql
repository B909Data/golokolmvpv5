-- Re-tag existing submissions to the 4 active genres (Hip Hop, RnB, Alternative, Hardcore + Punk)
-- Specific: Destin / M.A.D. -> Alternative
UPDATE public.lls_artist_submissions SET genre_style = 'Alternative' WHERE id = '87fda874-8e23-450b-a0d5-78e064caea5b';

-- General mapping
UPDATE public.lls_artist_submissions SET genre_style = 'RnB' WHERE genre_style = 'R&B';
UPDATE public.lls_artist_submissions SET genre_style = 'Hip Hop' WHERE genre_style IN ('Hip-Hop','Hip Hop');
UPDATE public.lls_artist_submissions SET genre_style = 'Hardcore + Punk' WHERE genre_style IN ('Hardcore','Punk','Hip-Hop, Rock, Punk');

-- Anything not yet matching one of the 4 allowed values -> Alternative
UPDATE public.lls_artist_submissions
SET genre_style = 'Alternative'
WHERE genre_style IS NULL
   OR genre_style NOT IN ('Hip Hop','RnB','Alternative','Hardcore + Punk');

-- Mirror across the legacy submissions table
UPDATE public.submissions SET genre_style = 'RnB' WHERE genre_style = 'R&B';
UPDATE public.submissions SET genre_style = 'Hip Hop' WHERE genre_style IN ('Hip-Hop','Hip Hop');
UPDATE public.submissions SET genre_style = 'Hardcore + Punk' WHERE genre_style IN ('Hardcore','Punk','Hip-Hop, Rock, Punk');
UPDATE public.submissions
SET genre_style = 'Alternative'
WHERE genre_style IS NULL
   OR genre_style NOT IN ('Hip Hop','RnB','Alternative','Hardcore + Punk');