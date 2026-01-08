import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AfterPartyFormData {
  artist_name: string;
  contact_email: string;
  title: string;
  start_at: string;
  city: string;
  venue_name: string;
  ticket_url?: string;
  genres: string[];
  youtube_url?: string;
  image_url?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: AfterPartyFormData = await req.json();
    console.log("Received form data:", formData);

    // Validate required fields
    if (!formData.artist_name || !formData.contact_email || 
        !formData.title || !formData.start_at || !formData.city || !formData.venue_name || 
        !formData.genres || formData.genres.length === 0) {
      throw new Error("Missing required fields");
    }

    if (formData.genres.length > 2) {
      throw new Error("Maximum 2 genres allowed");
    }

    // Create Supabase client with service role for secure insert
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Insert event with after_party_enabled = false (pending payment)
    const { data: event, error: insertError } = await supabaseAdmin
      .from("events")
      .insert({
        title: formData.title,
        artist_name: formData.artist_name,
        contact_email: formData.contact_email,
        start_at: formData.start_at,
        city: formData.city,
        venue_name: formData.venue_name,
        ticket_url: formData.ticket_url || null,
        genres: formData.genres,
        youtube_url: formData.youtube_url || null,
        image_url: formData.image_url || null,
        type: "after_party",
        status: "upcoming",
        after_party_enabled: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error(`Failed to create event: ${insertError.message}`);
    }

    console.log("Created event:", event.id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Checkout session with live price ID ($11.99 USD flat)
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1SnP1UPKcGpNZUZR6ecFGpwY",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/create-afterparty/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/create-afterparty?canceled=true`,
      metadata: {
        event_id: event.id,
      },
      customer_email: formData.contact_email,
    });

    console.log("Created Stripe session:", session.id);

    return new Response(JSON.stringify({ url: session.url, event_id: event.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in create-afterparty-checkout:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
