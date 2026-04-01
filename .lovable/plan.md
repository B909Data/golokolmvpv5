

# Fix Duplicate Submissions in Music Release & Curated Song Flow

## Problems Found

1. **Music Release Signature (`/lls-music-release`)**: No `submittingRef` guard — only uses React state (`submitting`), which has a race window allowing double-clicks to create duplicate signature rows. The edge function (`sign-music-release`) also has zero server-side duplicate detection.

2. **Curated Song Submission (`/songs/submit-curated`)**: Client-side has a solid `submittingRef` guard, but no server-side duplicate check — if a user refreshes after submission and resubmits, a second row is created.

## Plan

### 1. Harden `sign-music-release` edge function (server-side dedup)
- Before inserting, query `lls_music_release_signatures` for an existing row matching `email + artist_name + agreement_version`
- If a match exists, return `{ success: true }` with the existing record (idempotent) instead of inserting a duplicate
- This makes the endpoint safe to call multiple times

### 2. Add `submittingRef` guard to `LLSMusicRelease.tsx`
- Add a `useRef(false)` guard identical to the one in `SubmitCurated`
- Check it at the top of `handleSubmit`, set it before the async call, reset in `finally`

### 3. Add server-side dedup to curated submission insert
- In `SubmitCurated.tsx`, before inserting, query submissions for an existing row with the same `contact_email + song_title + payment_status='curated'`
- If found, treat as success (show toast, reset form) without inserting again

### Files Changed
- `supabase/functions/sign-music-release/index.ts` — add duplicate check query
- `src/pages/LLSMusicRelease.tsx` — add `submittingRef`
- `src/pages/SubmitCurated.tsx` — add server-side dedup check before insert

