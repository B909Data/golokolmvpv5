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

    // Create Supabase client with service role for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Stripe idempotency: Check if this session was already processed
    // Look for an event that has after_party_enabled=true and was created from this session
    // We need to check the metadata to see if this session was already processed
    // Since events don't store stripe_session_id, we'll check by fetching the session first
    
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

    // Fetch the event to check current state
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("id, title, artist_name, start_at, city, venue_name, after_party_enabled, artist_access_token")
      .eq("id", eventId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Failed to fetch event: ${fetchError.message}`);
    }

    // Stripe idempotency: If already enabled, return success without side effects
    if (existingEvent.after_party_enabled) {
      console.log("Event already enabled, returning existing data (idempotent)");
      return new Response(JSON.stringify({ 
        success: true, 
        already_processed: true,
        event: {
          id: existingEvent.id,
          title: existingEvent.title,
          artist_name: existingEvent.artist_name,
          start_at: existingEvent.start_at,
          city: existingEvent.city,
          venue_name: existingEvent.venue_name,
          artist_access_token: existingEvent.artist_access_token,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Enabling after party for event:", eventId);

    // Artist access token stability: Only generate if null, never overwrite
    const artistAccessToken = existingEvent.artist_access_token || crypto.randomUUID();

    // Update event to enable after party and set artist token (if new)
    const updateData: Record<string, unknown> = { after_party_enabled: true };
    if (!existingEvent.artist_access_token) {
      updateData.artist_access_token = artistAccessToken;
    }

    const { data: event, error: updateError } = await supabaseAdmin
      .from("events")
      .update(updateData)
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
        artist_access_token: artistAccessToken,
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