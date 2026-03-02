

# Fix: MP3 Upload Failures on Curated Submission

## Root Cause

The storage bucket `submissions_audio` has an RLS INSERT policy that requires **authenticated** users. If a user's magic-link session expires or isn't refreshed before they click "Submit," the upload (or the subsequent DB insert) fails silently. Some users are retrying multiple times (3 duplicate uploads seen), suggesting the upload succeeds but the DB insert fails -- or the session drops mid-flow.

## Changes

### 1. Add session guard before submission

In `src/pages/SubmitCurated.tsx`, before attempting the upload:
- Check `session` is non-null. If null, show a clear error: "Your session has expired. Please refresh and sign in again."
- Do NOT fall back to `"anonymous"` -- fail explicitly instead.

### 2. Add bucket-level constraints (database migration)

Set `file_size_limit` and `allowed_mime_types` on the `submissions_audio` bucket for server-side enforcement:

```sql
UPDATE storage.buckets
SET file_size_limit = 20971520,          -- 20 MB
    allowed_mime_types = '{"audio/mpeg"}'
WHERE id = 'submissions_audio';
```

### 3. Improve error UX for expired sessions

If the session check fails at submit time, show a toast with a "Refresh" action or automatically attempt `supabase.auth.refreshSession()` before giving up.

## Technical Details

**Files modified:**
- `src/pages/SubmitCurated.tsx` -- session guard + refresh attempt in `handleSubmit`

**Database migration:**
- Update `submissions_audio` bucket with size/type limits

**No new edge functions needed.** The existing upload flow is correct; it just needs a session validity check before proceeding.

