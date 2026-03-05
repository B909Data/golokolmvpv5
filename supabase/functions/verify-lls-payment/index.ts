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

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Retrieved session:", session.id, "status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if already processed
    const { data: existing } = await supabase
      .from("submissions")
      .select("id")
      .eq("stripe_session_id", session_id)
      .single();

    if (existing) {
      console.log("Submission already exists for session:", session_id);
      return new Response(JSON.stringify({ success: true, already_exists: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const metadata = session.metadata || {};

    const musicReleaseAgreed = metadata.music_release_agreed === "true";

    const { error: insertError } = await supabase.from("submissions").insert({
      artist_name: metadata.artist_name,
      contact_email: metadata.contact_email,
      song_title: metadata.song_title,
      spotify_url: metadata.spotify_url,
      youtube_url: metadata.youtube_url || null,
      notes: metadata.notes || null,
      stripe_session_id: session_id,
      music_release_agreed: musicReleaseAgreed,
      music_release_agreed_at: musicReleaseAgreed ? new Date().toISOString() : null,
    });

    if (insertError) {
      console.error("Error inserting submission:", insertError);
      throw new Error("Failed to save submission");
    }

    console.log("Submission saved for session:", session_id);

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
