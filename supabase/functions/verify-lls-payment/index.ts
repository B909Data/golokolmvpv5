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
    const { session_id } = await req.json();
    if (!session_id) throw new Error("Missing session_id");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    // Idempotency check
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("stripe_session_id", session_id)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ success: true, already_exists: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const meta = session.metadata || {};
    const genres = meta.genre_style ? meta.genre_style.split(",") : [];
    const musicReleaseAgreed = meta.music_release_agreed === "true";

    const { error: insertError } = await supabase.from("submissions").insert({
      artist_name: meta.artist_name,
      contact_email: meta.contact_email,
      instagram_handle: meta.instagram_handle || null,
      genre_style: meta.genre_style || null,
      city_market: meta.city_market || null,
      physical_product: meta.physical_product || null,
      short_bio: meta.short_bio || null,
      how_heard: meta.how_heard || null,
      song_image_url: meta.song_image_url || null,
      mp3_url: meta.mp3_url || null,
      mp3_path: meta.mp3_path || null,
      original_filename: meta.original_filename || null,
      stripe_session_id: session_id,
      payment_status: "paid",
      admin_status: "pending",
      music_release_agreed: musicReleaseAgreed,
      music_release_agreed_at: musicReleaseAgreed ? new Date().toISOString() : null,
    });

    if (insertError) throw new Error("Failed to save submission: " + insertError.message);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error verifying LLS payment:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
