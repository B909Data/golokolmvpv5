

## Problem

The form submission fails because the insert call uses `.select("id").single()` to retrieve the inserted row's ID, but the `lls_retail_signups` table has **no SELECT RLS policy** — only INSERT is allowed. The `.select()` after insert triggers a read, which gets blocked by RLS, causing the entire operation to error.

## Solution

Remove `.select("id").single()` from the insert call. Instead, generate the ID client-side (using `crypto.randomUUID()`) and include it in the insert payload. This way we have the ID to pass to the terms page without needing to read back from the table.

### File: `src/pages/LLSUsRetail.tsx`

1. Generate a UUID before the insert: `const signupId = crypto.randomUUID();`
2. Add `id: signupId` to the insert payload
3. Remove `.select("id").single()` from the chain — just use `.insert({...})`
4. Use `signupId` in the navigate state instead of `inserted?.id`
5. Change `const { data: inserted, error }` to just `const { error }`

This avoids any SELECT operation and works within the existing INSERT-only RLS policy. No database or migration changes needed.

