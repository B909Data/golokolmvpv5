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
    const { 
      event_id, 
      token, 
      pinned_message, 
      youtube_url, 
      image_url, 
      livestream_url, 
      merch_link, 
      music_link,
      // Paid access fields
      stripe_account_id,
      pricing_mode,
      fixed_price,
      min_price,
    } = await req.json();

    if (!event_id) {
      throw new Error("Missing event_id");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch event first
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

    // Build update object with only provided fields
    const updateData: Record<string, string | number | null> = {};
    if (pinned_message !== undefined) updateData.pinned_message = pinned_message;
    if (youtube_url !== undefined) updateData.youtube_url = youtube_url;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (livestream_url !== undefined) updateData.livestream_url = livestream_url;
    if (merch_link !== undefined) updateData.merch_link = merch_link;
    if (music_link !== undefined) updateData.music_link = music_link;
    // Paid access fields
    if (stripe_account_id !== undefined) updateData.stripe_account_id = stripe_account_id;
    if (pricing_mode !== undefined) updateData.pricing_mode = pricing_mode;
    if (fixed_price !== undefined) updateData.fixed_price = fixed_price;
    if (min_price !== undefined) updateData.min_price = min_price;

    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update(updateData)
      .eq("id", event_id);

    if (updateError) {
      console.error("Error updating event:", updateError);
      throw new Error("Failed to update event");
    }

    console.log("Artist updated event:", event_id, updateData);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in artist-update-event:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
