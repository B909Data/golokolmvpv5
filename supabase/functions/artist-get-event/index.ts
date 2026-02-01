import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const url = new URL(req.url);
    const eventId = url.searchParams.get("event_id");
    const token = url.searchParams.get("token");

    if (!eventId) {
      throw new Error("Missing event_id");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch event first
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("*, after_party_expires_at")
      .eq("id", eventId)
      .single();

    if (fetchError || !event) {
      throw new Error("Event not found");
    }

    // Hybrid auth: check token OR authenticated user
    let isAuthorized = false;
    let userId: string | null = null;

    // Check for authenticated user via Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
      
      if (!userError && user) {
        userId = user.id;
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
        console.log("Artist authorized via token for event:", eventId);
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Fetch messages for moderation
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("after_party_messages")
      .select("id, message, role, created_at, attendee_id")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }

    console.log("Artist fetched event:", eventId);

    return new Response(JSON.stringify({ 
      event: {
        id: event.id,
        title: event.title,
        artist_name: event.artist_name,
        pinned_message: event.pinned_message,
        youtube_url: event.youtube_url,
        image_url: event.image_url,
        livestream_url: event.livestream_url,
        start_at: event.start_at,
        city: event.city,
        venue_name: event.venue_name,
        merch_link: event.merch_link,
        music_link: event.music_link,
        after_party_opens_at: event.after_party_opens_at,
        after_party_expires_at: event.after_party_expires_at,
        // Paid access fields
        stripe_account_id: event.stripe_account_id,
        pricing_mode: event.pricing_mode,
        fixed_price: event.fixed_price,
        min_price: event.min_price,
        pricing_locked_at: event.pricing_locked_at,
        // Ownership info
        artist_user_id: event.artist_user_id,
      },
      messages: messages || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in artist-get-event:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
