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
    const {
      artist_name,
      contact_email,
      instagram_handle,
      genre_style,
      city_market,
      physical_product,
      short_bio,
      how_heard,
      song_image_url,
      mp3_url,
      mp3_path,
      original_filename,
      music_release_agreed,
    } = await req.json();

    if (!artist_name || !contact_email || !genre_style || !city_market || !short_bio) {
      throw new Error("Missing required fields");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://golokol.app";

    const session = await stripe.checkout.sessions.create({
      customer_email: contact_email,
      line_items: [
        {
          price: "price_1SnmYZPKcGpNZUZRTzMmQjUo",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/lls-us/artists/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/lls-us/artists`,
      metadata: {
        type: "lls_submission",
        artist_name,
        contact_email,
        instagram_handle: instagram_handle || "",
        genre_style: Array.isArray(genre_style) ? genre_style.join(",") : genre_style,
        city_market,
        physical_product: physical_product || "",
        short_bio,
        how_heard: how_heard || "",
        song_image_url: song_image_url || "",
        mp3_url: mp3_url || "",
        mp3_path: mp3_path || "",
        original_filename: original_filename || "",
        music_release_agreed: music_release_agreed ? "true" : "false",
      },
    });

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
