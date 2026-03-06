

## Plan: Add "Jointdexter" to LLS 2 Artist Roster

### Changes

1. **Frontend — `src/pages/LLSGuestPass.tsx`**
   - Insert `"Jointdexter"` into the `ARTISTS` array between `"Izan Da Man"` and `"Steven the Human"` (alphabetical order).

2. **Database — `lls_invite_codes` table**
   - Insert a new row for the LLS 2 event (`078ae183-c5ce-4f41-802c-91a2cf881d3e`) with `artist_name = 'Jointdexter'`, `code = 'LLS2-JOINTDEXTER'`, `is_active = true`.

