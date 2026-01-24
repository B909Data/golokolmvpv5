import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_id, token } = await req.json();

    if (!event_id || !token) {
      throw new Error("Missing event_id or token");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify artist token
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("id, artist_access_token, stripe_account_id, artist_name, title")
      .eq("id", event_id)
      .single();

    if (fetchError || !event) {
      throw new Error("Event not found");
    }

    if (event.artist_access_token !== token) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // If already connected, return connected status
    if (event.stripe_account_id) {
      return new Response(JSON.stringify({ 
        already_connected: true,
        account_id: event.stripe_account_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create a Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: event.artist_name || event.title,
      },
    });

    console.log("Created Stripe Connect account:", account.id);

    // Store the account ID immediately (onboarding will complete it)
    const { error: updateError } = await supabase
      .from("events")
      .update({ stripe_account_id: account.id })
      .eq("id", event_id);

    if (updateError) {
      console.error("Error saving stripe_account_id:", updateError);
      throw new Error("Failed to save Stripe account");
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://golokol.app";
    const returnUrl = `${origin}/artist/event/${event_id}?token=${token}&stripe_connected=true`;
    const refreshUrl = `${origin}/artist/event/${event_id}?token=${token}&stripe_refresh=true`;

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });

    console.log("Created Stripe Connect onboarding link for event:", event_id);

    return new Response(JSON.stringify({ 
      url: accountLink.url,
      account_id: account.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in create-stripe-connect-link:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
