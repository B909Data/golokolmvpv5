

# Plan: Add Checkout Session Metadata for Zapier Filtering

## Overview
Add distinct metadata fields to Stripe Checkout Sessions to differentiate between **fan pass purchases** and **artist setup purchases**. This enables Zapier to filter webhook events and only trigger confirmation emails for fan pass checkouts.

---

## Changes Required

### 1. Update `create-fan-checkout/index.ts` (Fan Pass Checkout)

Add the following metadata fields to the checkout session:

| Field | Value | Source |
|-------|-------|--------|
| `purchase_type` | `"fan_pass"` | Static |
| `event_id` | Event UUID | Already exists |
| `attendee_id` | Attendee UUID | Already exists |
| `pass_token` | QR token for pass link | From request body (`qrToken`) |
| `fan_name` | Display name (optional) | Fetch from attendee record |
| `artist_name` | Artist name | Already fetched from event |

**Implementation notes:**
- The `qrToken` is already passed from the frontend but not stored in metadata - will add it
- Need to fetch `display_name` from the attendee record (already have `attendeeId`)
- Add metadata to both `session.metadata` and `payment_intent_data.metadata` per project conventions

### 2. Update `create-afterparty-checkout/index.ts` (Artist Setup Checkout)

Add explicit `purchase_type` field to clarify this is not a fan pass:

| Field | Value |
|-------|-------|
| `purchase_type` | `"artist_setup"` |

The existing metadata (event_id, artist_name, plan, etc.) remains unchanged.

---

## Technical Details

### Fan Checkout Metadata Structure (after changes)
```javascript
metadata: {
  purchase_type: "fan_pass",
  event_id: eventId,
  attendee_id: attendeeId,
  pass_token: qrToken,
  fan_name: attendee.display_name || "",
  artist_name: event.artist_name || "",
  promo_code: promoCode || null,
}
```

### Artist Setup Metadata Structure (after changes)
```javascript
metadata: {
  purchase_type: "artist_setup",
  event_id: event.id,
  discount_code: validatedCode || "",
  confirmation_email: formData.confirmation_email || "",
  artist_name: formData.artist_name || "",
  event_title: formData.title || "",
  plan: formData.plan,
}
```

---

## Zapier Filter Configuration (for reference)
After implementation, the Zapier webhook filter step should check:
- `session.metadata.purchase_type == "fan_pass"` → Send confirmation email
- Otherwise → Skip

---

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/create-fan-checkout/index.ts` | Add `purchase_type`, `pass_token`, `fan_name`, `artist_name` to session metadata |
| `supabase/functions/create-afterparty-checkout/index.ts` | Add `purchase_type: "artist_setup"` to session metadata |

---

## No Database Changes Required
All metadata is passed through Stripe - no schema updates needed.

