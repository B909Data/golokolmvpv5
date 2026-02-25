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

  // Determine if we're in test mode based on stripe key
  const isTestMode = stripeSecret.startsWith("sk_test_");
  const coupon50Id = isTestMode
    ? Deno.env.get("STRIPE_COUPON_50_TEST")
    : Deno.env.get("STRIPE_COUPON_50_LIVE");

  try {
    const { eventId, attendeeId, origin, qrToken, accessToken, promoCode } = await req.json();

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

    // 2b) Fetch attendee display_name for metadata
    const { data: attendee } = await supabase
      .from("attendees")
      .select("display_name")
      .eq("id", attendeeId)
      .single();

    const fanName = attendee?.display_name || "";

    const priceCents = event.fixed_price;

    // 3) Handle promo code if provided (backend-only validation)
    let promoKind: string | null = null;
    
    if (promoCode && promoCode.trim().length > 0) {
      // Call atomic validation function (service_role only)
      const { data: promoResult, error: promoErr } = await supabase.rpc(
        "validate_and_redeem_promo_code",
        { p_code: promoCode.trim() }
      );

      if (promoErr) {
        console.error("Promo validation error:", promoErr);
        return new Response(
          JSON.stringify({ error: "Failed to validate promo code" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // RPC returns array with single row
      const result = promoResult?.[0];
      
      if (!result?.valid) {
        return new Response(
          JSON.stringify({ error: result?.error_message || "Invalid promo code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      promoKind = result.promo_kind;
    }

    // 4) FREE CODE PATH - Skip Stripe entirely
    if (promoKind === "free") {
      // Update attendee to paid status immediately (free entry)
      const { error: updateErr } = await supabase
        .from("attendees")
        .update({
          payment_status: "paid",
          paid_amount: 0,
          paid_at: new Date().toISOString(),
        })
        .eq("id", attendeeId);

      if (updateErr) {
        console.error("Attendee update error:", updateErr);
        return new Response(
          JSON.stringify({ error: "Failed to grant free access" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Free promo redeemed for attendee:", attendeeId);

      // Return success with redirect to pass page using access token
      return new Response(
        JSON.stringify({
          free: true,
          redirectUrl: `${origin}/after-party/${eventId}/pass?token=${accessToken || qrToken}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5) PAID PATH - Create Stripe Checkout Session
    // Platform fee: 25% of fan pass price (artist receives 75%)
    const feeCents = Math.max(0, Math.round(priceCents * 0.25));

    const productName = event.artist_name
      ? `${event.artist_name} After Party`
      : event.title || "GoLokol After Party Entry";

    // Build checkout session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
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
      metadata: { 
        purchase_type: "fan_pass",
        event_id: eventId, 
        attendee_id: attendeeId,
        pass_token: qrToken,
        fan_name: fanName,
        artist_name: event.artist_name || "",
        promo_code: promoCode || null,
      },
      payment_intent_data: {
        metadata: { 
          purchase_type: "fan_pass",
          event_id: eventId, 
          attendee_id: attendeeId,
          pass_token: qrToken,
          fan_name: fanName,
          artist_name: event.artist_name || "",
        },
        application_fee_amount: feeCents,
        transfer_data: { destination: event.stripe_account_id },
      },
      success_url: `${origin}/after-party/${eventId}/pass?token=${accessToken || qrToken}`,
      cancel_url: `${origin}/after-party/${eventId}/rsvp?paid=0`,
    };

    // Apply 50% coupon if promo kind matches
    if (promoKind === "percent_50" && coupon50Id) {
      sessionConfig.discounts = [{ coupon: coupon50Id }];
      // Recalculate fee based on discounted amount (25% platform fee)
      const discountedPrice = Math.round(priceCents * 0.5);
      sessionConfig.payment_intent_data!.application_fee_amount = Math.max(
        0,
        Math.round(discountedPrice * 0.25)
      );
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("Checkout session created:", session.id, "for attendee:", attendeeId, "promo:", promoKind || "none");

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
