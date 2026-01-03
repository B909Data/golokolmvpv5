import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    console.log("Verifying payment for session:", session_id);

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the Checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Session status:", session.payment_status);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const eventId = session.metadata?.event_id;
    if (!eventId) {
      throw new Error("No event_id in session metadata");
    }

    console.log("Enabling after party for event:", eventId);

    // Create Supabase client with service role for secure update
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate artist access token
    const artistAccessToken = crypto.randomUUID();

    // Update event to enable after party and set artist token
    const { data: event, error: updateError } = await supabaseAdmin
      .from("events")
      .update({ 
        after_party_enabled: true,
        artist_access_token: artistAccessToken,
      })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to enable after party: ${updateError.message}`);
    }

    console.log("After party enabled for event:", event.id);

    return new Response(JSON.stringify({ 
      success: true, 
      event: {
        id: event.id,
        title: event.title,
        artist_name: event.artist_name,
        start_at: event.start_at,
        city: event.city,
        venue_name: event.venue_name,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in verify-afterparty-payment:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
