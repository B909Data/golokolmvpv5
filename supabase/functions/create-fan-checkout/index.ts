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
    const { eventId, attendeeId, origin, qrToken } = await req.json();

    if (!eventId || !attendeeId || !origin || !qrToken) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1) Fetch event pricing + connected account id
    const { data: event, error: eventErr } = await supabase
      .from("events")
      .select("id, fixed_price, stripe_account_id, artist_name, title")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      console.error("Event fetch error:", eventErr);
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2) Validate paid event configuration
    if (!event.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Stripe not connected for this event" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!event.fixed_price || event.fixed_price < 100) {
      return new Response(
        JSON.stringify({ error: "Price not configured for this event" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceCents = event.fixed_price;

    // 3) Mark attendee pending (idempotent)
    await supabase
      .from("attendees")
      .update({ payment_status: "pending" })
      .eq("id", attendeeId);

    // 4) Platform fee (10%)
    const feeCents = Math.max(0, Math.round(priceCents * 0.10));

    // 5) Create Checkout Session (platform-led destination charge)
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
      // Dual metadata placement for reliability
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
