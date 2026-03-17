

# Store Music Release Agreement Consent in Database

## Problem
Both submission forms (paid and curated) require artists to check the Music Release Agreement box, but this consent is only enforced client-side. No proof of agreement is persisted in the database.

## Solution
Add two columns to the `submissions` table and populate them from both submission flows.

### 1. Database Migration
Add to `public.submissions`:
- `music_release_agreed` (boolean, NOT NULL, DEFAULT false) — whether they checked the box
- `music_release_agreed_at` (timestamptz, nullable) — timestamp of when they agreed

### 2. Curated Flow (`SubmitCurated.tsx`)
Add to the insert payload:
```ts
music_release_agreed: true,
music_release_agreed_at: new Date().toISOString(),
```
(This code only runs after the `musicReleaseAgreed` check passes.)

### 3. Paid Flow (`create-lls-checkout` + `verify-lls-payment`)
- Pass `music_release_agreed: true` in the Stripe checkout metadata from `SubmitSong.tsx`
- In `verify-lls-payment`, read that metadata and store both fields when inserting the submission row

### 4. Admin Visibility (`AdminLLS.tsx`)
Add a column or indicator in the detail panel showing whether the artist agreed and when.

### Files Changed
- **Migration**: Add `music_release_agreed` + `music_release_agreed_at` columns
- **`src/pages/SubmitCurated.tsx`**: Include both fields in insert
- **`src/pages/SubmitSong.tsx`**: Pass agreement flag in checkout body
- **`supabase/functions/create-lls-checkout/index.ts`**: Store flag in Stripe metadata
- **`supabase/functions/verify-lls-payment/index.ts`**: Read metadata, insert fields
- **`src/pages/AdminLLS.tsx`**: Display agreement status in detail panel

