import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckinRequest {
  event_id: string;
  token: string; // artist access token
  qr_token?: string; // for QR scan mode
  walk_in?: boolean; // for walk-in mode
  display_name?: string; // optional for walk-ins
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckinRequest = await req.json();
    const { event_id, token, qr_token, walk_in, display_name } = body;

    console.log("Check-in request:", { event_id, qr_token, walk_in, display_name });

    if (!event_id || !token) {
      return new Response(
        JSON.stringify({ error: "Missing event_id or token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate artist access token
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, title, artist_access_token, after_party_opens_at")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      console.error("Event not found:", eventError);
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (event.artist_access_token !== token) {
      console.error("Invalid artist token");
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    let attendee;
    let isFirstCheckin = false;

    // Check if this is the first check-in for this event (event-scoped)
    const { count: existingCheckins } = await supabaseAdmin
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event_id)
      .not("checked_in_at", "is", null);

    isFirstCheckin = (existingCheckins || 0) === 0;
    console.log("Existing check-ins for event:", existingCheckins, "isFirstCheckin:", isFirstCheckin);

    if (walk_in) {
      // Walk-in mode: create new attendee and check them in
      const newQrToken = crypto.randomUUID();

      const { data: newAttendee, error: insertError } = await supabaseAdmin
        .from("attendees")
        .insert({
          event_id,
          display_name: display_name || null,
          qr_token: newQrToken,
          checkin_method: "qr",
          checked_in_at: new Date().toISOString(),
        })
        .select("id, display_name, qr_token, checked_in_at")
        .single();

      if (insertError) {
        console.error("Failed to create walk-in attendee:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create attendee" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      attendee = newAttendee;
      console.log("Created walk-in attendee:", attendee.id);

    } else if (qr_token) {
      // QR scan mode: find attendee by qr_token and check them in
      const { data: existingAttendee, error: fetchError } = await supabaseAdmin
        .from("attendees")
        .select("id, display_name, qr_token, checked_in_at")
        .eq("event_id", event_id)
        .eq("qr_token", qr_token)
        .maybeSingle();

      if (fetchError || !existingAttendee) {
        console.error("Attendee not found:", fetchError);
        return new Response(
          JSON.stringify({ error: "Invalid QR code" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }

      // Check if already checked in
      if (existingAttendee.checked_in_at) {
        return new Response(
          JSON.stringify({
            success: true,
            already_checked_in: true,
            attendee: existingAttendee,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      // Update checked_in_at
      const { data: updatedAttendee, error: updateError } = await supabaseAdmin
        .from("attendees")
        .update({ checked_in_at: new Date().toISOString() })
        .eq("id", existingAttendee.id)
        .select("id, display_name, qr_token, checked_in_at")
        .single();

      if (updateError) {
        console.error("Failed to update check-in:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to check in" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      attendee = updatedAttendee;
      console.log("Checked in attendee via QR:", attendee.id);

    } else {
      return new Response(
        JSON.stringify({ error: "Must provide qr_token or walk_in=true" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // If this is the first check-in for this event, set after_party_opens_at
    if (isFirstCheckin && !event.after_party_opens_at) {
      const { error: openError } = await supabaseAdmin
        .from("events")
        .update({ after_party_opens_at: new Date().toISOString() })
        .eq("id", event_id);

      if (openError) {
        console.error("Failed to set after_party_opens_at:", openError);
        // Don't fail the request, just log
      } else {
        console.log("Set after_party_opens_at for event:", event_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        attendee,
        is_first_checkin: isFirstCheckin,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in artist-checkin-attendee:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
