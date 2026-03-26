

## Plan: Conditional Value Bullets on RSVP Page

Replace the static value bullets in `src/pages/RSVPAfterParty.tsx` (lines ~259-286) with conditional rendering based on the existing `isAtShowPayment` flag.

### Change

**File:** `src/pages/RSVPAfterParty.tsx`

Wrap the value bullets `<div>` in a ternary on `isAtShowPayment`:

- **At-show (`source=merch`)**: "Pay and get immediate access." / "Enter the party room now." / "Get 24 hours of exclusive access."
- **Pre-show (default)**: Keep existing bullets unchanged.

Same markup structure, icons, and styling — only the text content differs. No new dependencies or files needed.

