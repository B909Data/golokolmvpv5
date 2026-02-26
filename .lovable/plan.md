

# Fix Curated Submission Flow (Parts A + B) and Email Template (Part C)

## Overview

Three changes: fix the redirect/auth flow, update header text, and update the magic link email template directly in the Supabase Dashboard.

---

## Part A: Redirect + OTP Expired Fix + localStorage

**File: `src/pages/SubmitCurated.tsx`**

### 1. Add `useSearchParams` and new step type
- Import `useSearchParams` from `react-router-dom`
- Expand step type to `"gate" | "form" | "expired"`
- Add `resendEmail` state for the expired link resend UI

### 2. Fix redirect URL
- Change line 120 from `window.location.href` to:
  `https://golokol.app/songs/submit-curated?step=form`

### 3. Switch sessionStorage to localStorage
- Replace all `sessionStorage.getItem("curated_code")` with `localStorage.getItem("lls_curated_code")`
- Replace all `sessionStorage.setItem("curated_code", ...)` with `localStorage.setItem("lls_curated_code", ...)`
- Replace all `sessionStorage.removeItem("curated_code")` with `localStorage.removeItem("lls_curated_code")`

### 4. Detect OTP expired on mount
- On mount, parse URL search params for `error_code=otp_expired` or `error=access_denied`
- Also check the hash fragment (Supabase sometimes puts errors there)
- If detected, set step to `"expired"` and pre-fill email from localStorage if available
- Store `gateEmail` in localStorage (key: `lls_curated_email`) during gate submit so it survives the redirect

### 5. Handle `?step=form` query param on mount
- If `step=form` in URL + active session exists: attempt code redemption from localStorage, then show form
- If `step=form` but no session: listen via `onAuthStateChange` for `SIGNED_IN` event

### 6. Add expired link UI (new step)
- Show message: "This link expired. Enter your email to resend a fresh link."
- Email input pre-filled from stored email
- "Resend link" button calls `supabase.auth.signInWithOtp()` with the same clean redirect URL
- No invite code re-entry (code is already in localStorage)
- After resend, show the "Check your email" confirmation

---

## Part B: Header Text Change

- Gate screen header: change from `CURATED SUBMISSION` to `LOKOL LISTENING SESSIONS` with subtitle span `INVITATION`
- Form screen header: change to `LOKOL LISTENING SESSIONS` with subtitle span `SUBMISSION`

---

## Part C: Magic Link Email Template (Manual Dashboard Update)

This cannot be done via code. You need to update it directly in the **Supabase Dashboard**:

**Go to: Authentication -> Email Templates -> Magic Link**

| Field | Value |
|-------|-------|
| Subject | `Special link to submit your music` |
| Sender name | `Lokol Listening Sessions` |

**Email body HTML** (replace the existing template):

```html
<h2>One-time curator invite link to Lokol Listening Sessions</h2>
<p>Click the button below to securely submit your music for the next LLS. We will confirm via text.</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Submit</a></p>
<p style="color:#888;font-size:13px;margin-top:24px;">If you didn't request this, you can safely ignore this email.</p>
```

Remove any "Sign in to your account" or "GoLokol MVP-6" text from the template.

---

## Summary of File Changes

| File | What changes |
|------|-------------|
| `src/pages/SubmitCurated.tsx` | Parts A + B: useSearchParams, localStorage, clean redirect URL, OTP expired UI, header text |

No config.toml changes. No new edge functions. Part C is a manual Supabase Dashboard update.

