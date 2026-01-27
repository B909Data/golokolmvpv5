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
      .select("id, artist_access_token, stripe_account_id")
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

    // If no Stripe account connected, return not_connected status
    if (!event.stripe_account_id) {
      return new Response(JSON.stringify({ 
        status: "not_connected",
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        requirements: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Initialize Stripe and retrieve account status
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const account = await stripe.accounts.retrieve(event.stripe_account_id);

    // Determine status based on Stripe account state (order matters)
    let status: "not_connected" | "setup_in_progress" | "action_required" | "ready";
    
    // Check for disabled account first (action required)
    if (account.requirements?.disabled_reason) {
      status = "action_required";
    } else if (
      // Check if transfers capability is not active OR there are pending requirements
      account.capabilities?.transfers !== "active" ||
      (account.requirements?.currently_due && account.requirements.currently_due.length > 0)
    ) {
      status = "setup_in_progress";
    } else {
      // Transfers active and no pending requirements
      status = "ready";
    }

    console.log("Stripe account status check:", {
      account_id: event.stripe_account_id,
      status,
      transfers_capability: account.capabilities?.transfers,
      disabled_reason: account.requirements?.disabled_reason,
      currently_due: account.requirements?.currently_due?.length || 0,
    });

    return new Response(JSON.stringify({ 
      status,
      transfers_capability: account.capabilities?.transfers,
      disabled_reason: account.requirements?.disabled_reason || null,
      currently_due: account.requirements?.currently_due || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in check-stripe-account-status:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
