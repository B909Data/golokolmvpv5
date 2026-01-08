import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist_name, contact_email, song_title, spotify_url, youtube_url, notes } = await req.json();

    if (!artist_name || !contact_email || !song_title || !spotify_url) {
      throw new Error("Missing required fields");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://golokol.com";

    const session = await stripe.checkout.sessions.create({
      customer_email: contact_email,
      line_items: [
        {
          price: "price_1SnP1BPKcGpNZUZR1TgWOwJd",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/songs/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/songs`,
      metadata: {
        type: "lls_submission",
        artist_name,
        song_title,
        contact_email,
        spotify_url,
        youtube_url: youtube_url || "",
        notes: notes || "",
      },
    });

    console.log("LLS checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating LLS checkout:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
