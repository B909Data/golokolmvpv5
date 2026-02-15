

# Remove Invite Code from LLS Guest Pass Form

## What's Changing

The LLS Guest Pass form will no longer require an invite code. Anyone can claim a pass by simply selecting an artist from the dropdown. The artist selection will continue to drive the success page messaging, MailerLite sync, and tally tracking — no changes needed there.

## Changes Required

### 1. Frontend — `src/pages/LLSGuestPass.tsx`
- Remove the `code` state variable
- Remove the Invite Code input field from the form
- Remove "Invite Code" from the client-side validation
- Stop sending `code` in the payload to the edge function

### 2. Backend Function — `supabase/functions/lls-claim-pass/index.ts`
- Remove the `code` parameter requirement (no longer call `requireStr` for it)
- Remove the entire invite code validation step (the query to `lls_invite_codes`)
- Since `invite_code_id` is a required column in `lls_guest_claims`, the insert needs a value — we'll use a **sentinel/default invite code ID**. We have two options:
  - **Option A**: Make `invite_code_id` nullable via a migration, then insert `null`
  - **Option B**: Create a single "open access" row in `lls_invite_codes` for this event and hardcode that ID

  We'll go with **Option A** (make `invite_code_id` nullable) since it's cleaner and the invite code system is being bypassed entirely.

### 3. Database Migration
- `ALTER TABLE lls_guest_claims ALTER COLUMN invite_code_id DROP NOT NULL;`
- This allows new claims to be inserted without referencing an invite code

## Technical Details

### Frontend changes (LLSGuestPass.tsx)
- Delete `const [code, setCode] = useState("")`
- Remove `const trimmedCode = code.trim()` and its validation line
- Remove the Invite Code `<div>` block (lines 259-273)
- Update payload to not include `code`

### Edge function changes (lls-claim-pass/index.ts)
- Remove `const code = requireStr(body.code, "code")` line
- Remove the entire invite code lookup block (lines 50-68)
- Change the insert to use `invite_code_id: null` instead of `invite.id`

### What stays the same
- Artist dropdown selection still drives `artistName` in the claim record
- Success page still shows the selected artist name dynamically
- MailerLite still receives `lls_artistname` based on the dropdown selection
- Tally queries still group by `artist_name` — no change needed
- QR generation, check-in flow, and email confirmation are all unaffected

