

## Fix: LLS Card Link

The hero CTAs already point to the correct routes. However, the "Lokol Listening Sessions" card in the "How it works" section links to `/songs` — it should link to `/lls-us`.

### Change in `src/pages/Index.tsx`
- Line 103: Change `to="/songs"` → `to="/lls-us"`

