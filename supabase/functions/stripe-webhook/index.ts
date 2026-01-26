import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Check for webhook secret
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get signature header
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("Missing stripe-signature header");
    return new Response("Missing stripe-signature", { status: 400 });
  }

  // Get raw body for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new Response("Invalid signature", { status: 400 });
  }

  console.log("Received webhook event:", event.type, event.id);

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const meta = session.metadata || {};
    const eventId = meta.event_id;
    const attendeeId = meta.attendee_id;

    if (!eventId || !attendeeId) {
      console.warn("Missing metadata in session:", session.id);
      return new Response("ok", { status: 200 });
    }

    // Idempotency: if already paid, do nothing
    const { data: attendee, error: attendeeErr } = await supabase
      .from("attendees")
      .select("id, payment_status")
      .eq("id", attendeeId)
      .single();

    if (attendeeErr) {
      console.error("Error fetching attendee:", attendeeErr);
      return new Response("ok", { status: 200 });
    }

    if (attendee?.payment_status === "paid") {
      console.log("Attendee already marked as paid:", attendeeId);
      return new Response("ok", { status: 200 });
    }

    // Update attendee to paid (Tweak #1 - store session ID)
    const { error: updateErr } = await supabase
      .from("attendees")
      .update({
        payment_status: "paid",
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        stripe_checkout_session_id: session.id,
        paid_amount: session.amount_total ?? null,
        paid_at: new Date().toISOString(),
      })
      .eq("id", attendeeId);

    if (updateErr) {
      console.error("Error updating attendee:", updateErr);
    } else {
      console.log("Marked attendee as paid:", attendeeId, "session:", session.id);
    }

    // Lock pricing on first paid attendee (idempotent)
    const { error: lockErr } = await supabase
      .from("events")
      .update({ pricing_locked_at: new Date().toISOString() })
      .eq("id", eventId)
      .is("pricing_locked_at", null);

    if (lockErr) {
      console.error("Error locking pricing:", lockErr);
    }
  }

  // Handle checkout.session.expired (Tweak #3 - failed state)
  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    const meta = session.metadata || {};
    const attendeeId = meta.attendee_id;

    if (attendeeId) {
      // Only update if still pending (don't overwrite paid)
      const { error: updateErr } = await supabase
        .from("attendees")
        .update({ payment_status: "failed" })
        .eq("id", attendeeId)
        .eq("payment_status", "pending");

      if (updateErr) {
        console.error("Error marking attendee as failed:", updateErr);
      } else {
        console.log("Marked attendee payment as failed:", attendeeId);
      }
    }
  }

  return new Response("ok", { status: 200 });
});
