

## Problem

Two related bugs in the curated submission flow:

1. **"This code has already been used" error**: The code gets redeemed successfully during `initFlow` or `onAuthStateChange`, but then the *other* handler also fires and tries to redeem it again. The second attempt fails because the code is already marked as used, triggering the error toast and resetting to the gate screen.

2. **Cross-browser localStorage loss**: If the magic link opens in a different browser/tab (common on mobile), `localStorage` doesn't have the pending code, so there's nothing to redeem and the fallback logic fails.

## Root Cause

- The redirect URL (`?step=form`) does not carry the code, so it's only available via `localStorage` which is fragile.
- There's no guard preventing `redeemCode` from being called twice (once by `initFlow`, once by `onAuthStateChange`).
- The `onAuthStateChange` handler has no `else` branch — when the code is already redeemed and cleared from localStorage, it does nothing, leaving the user on the gate screen.

## Fix — Single file: `src/pages/SubmitCurated.tsx`

### 1. Include the code in the magic link redirect URL
Change the `signInWithOtp` call to embed the code in the redirect:
```
emailRedirectTo: `${origin}/songs/submit-curated?step=form&code=${encodeURIComponent(code)}`
```

### 2. Read code from URL params as a fallback
In `initFlow`, when `localStorage` has no pending code, check `searchParams.get("code")` as a fallback source.

### 3. Add a redemption guard
Add a `useRef` (e.g. `redeemingRef`) to prevent concurrent/duplicate calls to `redeemCode`. If already redeeming, skip.

### 4. Add else branch to `onAuthStateChange`
When `SIGNED_IN` fires but there's no pending code (already redeemed or missing), set `contact_email` from session and transition to `step = "form"` directly instead of doing nothing.

### 5. Also apply to the resend flow
The expired-link resend should also include the code in the redirect URL (read from localStorage or URL param).

## Summary

These changes ensure the code survives the redirect (via URL param), is only redeemed once (via ref guard), and the form always appears after successful authentication (via the else branch).

