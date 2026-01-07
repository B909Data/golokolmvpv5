-- Create the after_party_flyers storage bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('after_party_flyers', 'after_party_flyers', true);