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
    const { event_id, token, message_id } = await req.json();

    if (!event_id || !message_id) {
      throw new Error("Missing event_id or message_id");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch event
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("id, artist_access_token, artist_user_id")
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

    // Delete the message (only if it belongs to this event)
    const { error: deleteError } = await supabaseAdmin
      .from("after_party_messages")
      .delete()
      .eq("id", message_id)
      .eq("event_id", event_id);

    if (deleteError) {
      console.error("Error deleting message:", deleteError);
      throw new Error("Failed to delete message");
    }

    console.log("Artist deleted message:", message_id, "for event:", event_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in artist-delete-message:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
