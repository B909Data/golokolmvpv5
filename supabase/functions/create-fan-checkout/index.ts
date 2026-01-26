import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  try {
    const { eventId, attendeeId, origin, qrToken, pwywAmountCents } = await req.json();

    if (!eventId || !attendeeId || !origin || !qrToken) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1) Fetch event pricing + connected account id
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, pricing_mode, fixed_price, min_price, stripe_account_id, artist_name, title")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      console.error("Event fetch error:", eventErr);
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Explicit paid event validation (Tweak #2)
    const isPaidEvent =
      (event.pricing_mode === "fixed" || event.pricing_mode === "pwyw") &&
      !!event.stripe_account_id &&
      (event.pricing_mode === "fixed" ? !!event.fixed_price : !!event.min_price);

    if (!isPaidEvent) {
      return new Response(
        JSON.stringify({ error: "Paid access not properly configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3) Decide price (already stored in cents)
    let priceCents: number;
    if (event.pricing_mode === "fixed") {
      priceCents = event.fixed_price!;
    } else if (event.pricing_mode === "pwyw") {
      // Pay-what-you-want: use provided amount but enforce minimum
      const provided = Number(pwywAmountCents);
      if (!Number.isFinite(provided) || provided <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid amount" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (event.min_price && provided < event.min_price) {
        return new Response(
          JSON.stringify({ error: `Amount must be at least $${(event.min_price / 100).toFixed(2)}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      priceCents = provided;
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid pricing mode" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Mark attendee pending (idempotent)
    await supabase
      .from("attendees")
      .update({ payment_status: "pending" })
      .eq("id", attendeeId);

    // 5) Platform fee (10%)
    const feeCents = Math.max(0, Math.round(priceCents * 0.10));

    // 6) Create Checkout Session (platform-led destination charge)
    const productName = event.artist_name
      ? `${event.artist_name} After Party`
      : event.title || "GoLokol After Party Entry";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: productName },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      // Dual metadata placement (Tweak #1 - reliability)
      metadata: { event_id: eventId, attendee_id: attendeeId },
      payment_intent_data: {
        metadata: { event_id: eventId, attendee_id: attendeeId },
        application_fee_amount: feeCents,
        transfer_data: { destination: event.stripe_account_id },
      },
      success_url: `${origin}/after-party/${eventId}/room?token=${qrToken}&paid=1`,
      cancel_url: `${origin}/after-party/${eventId}?paid=0`,
    });

    console.log("Checkout session created:", session.id, "for attendee:", attendeeId);

    return new Response(
      JSON.stringify({ url: session.url, id: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("create-fan-checkout error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
