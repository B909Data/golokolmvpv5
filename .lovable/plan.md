## Goal

Consolidate the genre vocabulary so that Admin's submission tags match the canonical labels used everywhere else for display:

- `RnB` → `R&B`
- `Hardcore + Punk` → `Hardcore`

The canonical roster becomes: **Hip Hop, R&B, Alternative, Hardcore, Indie, Jazz**.

(Note: Display pages already render "Hip-Hop" — that label is unchanged in this task; only R&B and Hardcore are being consolidated as requested.)

## Why

Today the Admin form writes `RnB` and `Hardcore + Punk` into `lls_artist_submissions.genre_style`, while display pages (Discover, Index, LLSStorePage, LokolListensGenre) canonicalize on `R&B` and `Hardcore`. Display code has alias maps to paper over the mismatch, and the DB has both variants coexisting (`R&B` x4 + `RnB` x2; `Hardcore` x4 + `Hardcore + Punk` x1). New submissions should write the canonical labels directly.

## Changes

### 1. `src/pages/AdminLLS.tsx`
Update `GENRE_OPTIONS`:
```ts
const GENRE_OPTIONS = ["Hip Hop", "R&B", "Alternative", "Hardcore", "Indie", "Jazz"];
```

### 2. `src/pages/ArtistSubmit.tsx`
Same update so artist self-submissions also use canonical labels:
```ts
const GENRE_OPTIONS = ["Hip Hop", "R&B", "Alternative", "Hardcore + Punk", "Indie", "Jazz"];
```
becomes:
```ts
const GENRE_OPTIONS = ["Hip Hop", "R&B", "Alternative", "Hardcore", "Indie", "Jazz"];
```

### 3. Backfill existing rows (DB migration)
Normalize already-stored values so legacy entries surface under the consolidated label. Single SQL update:
```sql
UPDATE lls_artist_submissions
SET genre_style = regexp_replace(
  regexp_replace(genre_style, '(^|,\s*)RnB(\s*,|$)', '\1R&B\2', 'g'),
  '(^|,\s*)Hardcore \+ Punk(\s*,|$)', '\1Hardcore\2', 'g'
);
```
This converts `RnB` → `R&B` and `Hardcore + Punk` → `Hardcore`, including inside comma-separated multi-genre values like `Jazz, RnB`.

### 4. Clean up alias maps in display pages (optional but consistent)
Once the source data is canonical, the legacy aliases can go. Keeping them is harmless (defensive), so the safe choice is to **leave them in** — they will simply never match. I recommend leaving the alias entries (`"RnB": "rnb"`, `"Hardcore + Punk": "hardcore"`) untouched to avoid any risk if old cached state exists in the wild. No edits to `Index.tsx`, `LLSStorePage.tsx`, `Discover.tsx`, `LokolListensGenre.tsx`.

## Out of scope
- "Hip Hop" vs "Hip-Hop" wording — display layer handles the alias, and you didn't ask to change it.
- Any UI styling.

## Summary of files touched
- `src/pages/AdminLLS.tsx` — genre option list
- `src/pages/ArtistSubmit.tsx` — genre option list
- New DB migration — backfill `genre_style` values