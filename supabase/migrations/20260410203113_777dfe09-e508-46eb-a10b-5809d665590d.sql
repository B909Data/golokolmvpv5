-- Fix RSVPs for LLS 3 artists that were incorrectly saved under LLS 2 event ID
UPDATE lls_guest_claims
SET event_id = '3a076338-5e05-4499-ac18-6b41f615c255'
WHERE event_id = '078ae183-c5ce-4f41-802c-91a2cf881d3e'
  AND artist_name IN ('D Money Sign', 'DESTIN', 'Lady Ty', 'Priscilla Manning', 'Yn3');
