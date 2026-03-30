

## Problem

The store logo upload fails with **"mime type image/png is not supported"** because the code uploads to the `submissions_audio` bucket, which restricts MIME types to audio formats only.

## Solution

Switch the upload destination from `submissions_audio` to the existing **`partner_flyers`** bucket, which is public and accepts image files. This requires a one-line change in `src/pages/LLSUsRetail.tsx` — update both the `.upload()` and `.getPublicUrl()` calls to use `partner_flyers` instead of `submissions_audio`.

### File: `src/pages/LLSUsRetail.tsx`
- Change `supabase.storage.from("submissions_audio")` to `supabase.storage.from("partner_flyers")` in both the upload and getPublicUrl calls
- Keep the same path prefix (`lls-retail-logos/...`) for organization

No database changes needed. No new buckets needed.

