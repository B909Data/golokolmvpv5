

# Stripe Connect Fan Payments - Final Implementation Plan

## Summary
Implement platform-led destination charges for After Party fan payments using Stripe Connect, incorporating all 3 approved tweaks.

---

## Tweaks Incorporated

| Tweak | Implementation |
|-------|----------------|
| 1. Store `stripe_checkout_session_id` | Add column to `attendees` table, store `session.id` in webhook |
| 2. Explicit paid event check | `pricing_mode IN ('fixed','pwyw') AND stripe_account_id IS NOT NULL AND (fixed_price OR min_price)` |
| 3. Failed payment status | Handle 'failed' state for cancelled/incomplete payments |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Database migration | Create | Add `stripe_checkout_session_id` column to attendees |
| `supabase/functions/create-fan-checkout/index.ts` | Create | Platform-led Stripe Checkout with destination charges |
| `supabase/functions/stripe-webhook/index.ts` | Create | Handle webhook events including failures |
| `supabase/config.toml` | Modify | Add function configs with `verify_jwt = false` |
| `src/pages/RSVPAfterParty.tsx` | Modify | Add paid access flow with explicit validation |

---

## Step 1: Database Migration

Add `stripe_checkout_session_id` column to attendees table for debugging and refund lookup:

```sql
ALTER TABLE public.attendees 
ADD COLUMN stripe_checkout_session_id text;
```

---

## Step 2: Create Fan Checkout Edge Function

**File**: `supabase/functions/create-fan-checkout/index.ts`

**Key features**:
- Explicit paid event validation (Tweak #2)
- Dual metadata placement (session + payment_intent)
- 10% platform fee calculation
- Destination charge to artist's connected account

**Validation logic** (Tweak #2):
```typescript
// Explicit paid event check
const isPaidEvent = 
  (event.pricing_mode === 'fixed' || event.pricing_mode === 'pwyw') &&
  !!event.stripe_account_id &&
  (event.pricing_mode === 'fixed' ? !!event.fixed_price : !!event.min_price);

if (!isPaidEvent) {
  return new Response("Paid access not properly configured", { status: 400 });
}
```

**Full implementation**:
- Receives `eventId`, `attendeeId`, `origin`, `qrToken`, `pwywAmountCents`
- Fetches event with pricing config
- Validates artist has connected Stripe AND price is set
- Creates Checkout Session with destination charge
- Returns checkout URL

---

## Step 3: Create Webhook Handler Edge Function

**File**: `supabase/functions/stripe-webhook/index.ts`

**Events handled**:
- `checkout.session.completed` → Mark as 'paid'
- `checkout.session.expired` → Mark as 'failed' (Tweak #3)

**Updated attendee fields** (Tweak #1):
```typescript
await supabase.from("attendees").update({
  payment_status: "paid",
  stripe_payment_intent_id: session.payment_intent,
  stripe_checkout_session_id: session.id,  // Tweak #1
  paid_amount: session.amount_total,
  paid_at: new Date().toISOString(),
}).eq("id", attendeeId);
```

**Failed state handling** (Tweak #3):
```typescript
if (event.type === "checkout.session.expired") {
  const session = event.data.object;
  const { attendee_id } = session.metadata || {};
  
  if (attendee_id) {
    // Only update if still pending (don't overwrite paid)
    await supabase.from("attendees")
      .update({ payment_status: "failed" })
      .eq("id", attendee_id)
      .eq("payment_status", "pending");
  }
}
```

**Idempotency**: Skip update if already 'paid'

---

## Step 4: Update Config.toml

Add webhook event for expired sessions:

```toml
[functions.stripe-webhook]
verify_jwt = false

[functions.create-fan-checkout]
verify_jwt = false
```

---

## Step 5: Update RSVPAfterParty.tsx

**Expand event query**:
```typescript
.select("id, title, start_at, city, venue_name, ticket_url, artist_name, genres, youtube_url, image_url, pricing_mode, fixed_price, min_price, stripe_account_id")
```

**Explicit paid event detection** (Tweak #2):
```typescript
const isPaidEvent = 
  (event.pricing_mode === 'fixed' || event.pricing_mode === 'pwyw') &&
  !!event.stripe_account_id &&
  (event.pricing_mode === 'fixed' ? !!event.fixed_price : !!event.min_price);
```

**UI changes for paid events**:
- Show price (format cents to dollars)
- For PWYW: Add amount input with minimum validation
- Button text: "Pay $X to Join" (fixed) or "Pay to Join" (pwyw)
- Handle Stripe redirect with popup + fallback link

**Free events**: Unchanged existing flow

---

## Stripe Dashboard Setup

After deployment:

1. **Webhook endpoint**: `https://qtduseiexmhssdkzjwbn.supabase.co/functions/v1/stripe-webhook`
2. **Events to listen**:
   - `checkout.session.completed`
   - `checkout.session.expired` (for failed state)
3. Copy signing secret → Add as `STRIPE_WEBHOOK_SECRET`

---

## Payment Status Values

| Status | Meaning |
|--------|---------|
| `free` | Free access (no payment required) |
| `pending` | Checkout started, awaiting completion |
| `paid` | Payment successful, access granted |
| `failed` | Checkout expired/cancelled/failed |

---

## Technical Notes

- **No stripeAccount header**: All charges on platform account
- **Platform fee**: 10% application fee to GoLokol
- **Artist payout**: Remaining amount transferred to connected account
- **Stripe fees**: Deducted from total charge (affects margin)
- **Idempotency**: Webhook can fire multiple times safely
- **Funds held**: If artist hasn't completed onboarding, Stripe holds until ready

---

## Required Secret

You must add `STRIPE_WEBHOOK_SECRET` to Lovable secrets after configuring the webhook in Stripe Dashboard.

