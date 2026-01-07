import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const PUBLIC_BASE_URL = "https://golokol.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    const eventId = url.searchParams.get("event_id");

    // Validate admin key
    const adminKey = Deno.env.get("ADMIN_KEY");
    if (!key || key !== adminKey) {
      console.log("[admin-get-artist-control-link] Unauthorized: invalid key");
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    if (!eventId) {
      console.log("[admin-get-artist-control-link] Missing event_id");
      return new Response(
        JSON.stringify({ error: "Missing event_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`[admin-get-artist-control-link] Fetching event: ${eventId}`);

    // Fetch the event
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("id, artist_access_token, title, artist_name")
      .eq("id", eventId)
      .single();

    if (fetchError || !event) {
      console.error("[admin-get-artist-control-link] Event not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    let artistAccessToken = event.artist_access_token;

    // If no token exists, generate one (admin recovery scenario)
    if (!artistAccessToken) {
      console.log("[admin-get-artist-control-link] No token found, generating new one");
      artistAccessToken = crypto.randomUUID();

      const { error: updateError } = await supabaseAdmin
        .from("events")
        .update({ artist_access_token: artistAccessToken })
        .eq("id", eventId);

      if (updateError) {
        console.error("[admin-get-artist-control-link] Failed to update token:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to generate token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      console.log("[admin-get-artist-control-link] New token generated and saved");
    }

    const artistControlUrl = `${PUBLIC_BASE_URL}/artist/event/${eventId}?token=${artistAccessToken}`;

    console.log(`[admin-get-artist-control-link] Success for event: ${event.title}`);

    return new Response(
      JSON.stringify({
        artist_control_url: artistControlUrl,
        event_id: eventId,
        title: event.title,
        artist_name: event.artist_name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[admin-get-artist-control-link] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
