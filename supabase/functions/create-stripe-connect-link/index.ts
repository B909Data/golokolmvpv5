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

    if (!event_id) {
      throw new Error("Missing event_id");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch event
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("id, artist_access_token, artist_user_id, stripe_account_id, artist_name, title")
      .eq("id", event_id)
      .single();

    if (fetchError || !event) {
      throw new Error("Event not found");
    }

    // Hybrid auth: check token OR authenticated user
    let isAuthorized = false;

    // Check for authenticated user via Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
      
      if (!userError && user) {
        // Check if this user owns the event
        if (event.artist_user_id === user.id) {
          isAuthorized = true;
          console.log("Artist authorized via auth (user_id match):", user.id);
        }
      }
    }

    // If not authorized via auth, check token (for unclaimed events)
    if (!isAuthorized && token) {
      if (event.artist_access_token === token) {
        isAuthorized = true;
        console.log("Artist authorized via token for event:", event_id);
      }
    }

    if (!isAuthorized) {
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
    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({ stripe_account_id: account.id })
      .eq("id", event_id);

    if (updateError) {
      console.error("Error saving stripe_account_id:", updateError);
      throw new Error("Failed to save Stripe account");
    }

    // Get origin for redirect URLs with safe fallback
    const rawOrigin = req.headers.get("origin");
    const rawReferer = req.headers.get("referer");

    let origin: string;
    if (rawOrigin) {
      origin = rawOrigin;
    } else if (rawReferer) {
      try {
        origin = new URL(rawReferer).origin;
      } catch {
        origin = "https://golokol.app";
      }
    } else {
      origin = "https://golokol.app";
    }

    // Build return URL - use token if available, otherwise just event ID
    const returnUrl = token 
      ? `${origin}/artist/event/${event_id}?token=${token}&stripe_connected=true`
      : `${origin}/artist/event/${event_id}?stripe_connected=true`;
    const refreshUrl = token
      ? `${origin}/artist/event/${event_id}?token=${token}&stripe_refresh=true`
      : `${origin}/artist/event/${event_id}?stripe_refresh=true`;

    // DEBUG: Log exact values at runtime
    console.log("DEBUG - Request origin header:", rawOrigin);
    console.log("DEBUG - Request referer header:", rawReferer);
    console.log("DEBUG - Resolved origin:", origin);
    console.log("DEBUG - return_url:", returnUrl);
    console.log("DEBUG - refresh_url:", refreshUrl);
    console.log("DEBUG - Is HTTPS:", origin.startsWith("https://"));

    // DEBUG: Log Stripe key mode without exposing the key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const keyMode = stripeKey.startsWith("sk_live_") ? "LIVE" : stripeKey.startsWith("sk_test_") ? "TEST" : "UNKNOWN";
    console.log("DEBUG - Stripe key mode:", keyMode);

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
