import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendArtistEnteredSmsRequest {
  event_id: string;
  token: string; // artist access token
}

/**
 * Normalize phone number to E.164 format (+1XXXXXXXXXX)
 */
function normalizePhoneNumber(rawPhone: string): string | null {
  const digitsOnly = rawPhone.replace(/\D/g, "");
  
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    return `+${digitsOnly}`;
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: SendArtistEnteredSmsRequest = await req.json();
    const { event_id, token } = body;

    console.log("[ARTIST-ENTERED-SMS] Request for event:", event_id);

    if (!event_id || !token) {
      return new Response(
        JSON.stringify({ error: "Missing event_id or token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate artist access token and get event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, title, artist_name, artist_access_token, artist_entered_sms_at")
      .eq("id", event_id)
      .single();

    if (eventError || !event) {
      console.error("[ARTIST-ENTERED-SMS] Event not found:", eventError);
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (event.artist_access_token !== token) {
      console.error("[ARTIST-ENTERED-SMS] Invalid artist token");
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Anti-spam cooldown: check if SMS was sent within last 30 minutes
    if (event.artist_entered_sms_at) {
      const lastSmsTime = new Date(event.artist_entered_sms_at).getTime();
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      
      if (lastSmsTime > thirtyMinutesAgo) {
        const minutesRemaining = Math.ceil((lastSmsTime + 30 * 60 * 1000 - Date.now()) / 60000);
        console.log("[ARTIST-ENTERED-SMS] Cooldown active, minutes remaining:", minutesRemaining);
        return new Response(
          JSON.stringify({ 
            ok: true, 
            skipped: true, 
            reason: "cooldown",
            minutesRemaining 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Get all attendees with phone numbers who have opted in for this event
    const { data: attendees, error: attendeesError } = await supabaseAdmin
      .from("attendees")
      .select("id, phone, sms_opt_in")
      .eq("event_id", event_id)
      .not("phone", "is", null)
      .eq("sms_opt_in", true);

    if (attendeesError) {
      console.error("[ARTIST-ENTERED-SMS] Failed to fetch attendees:", attendeesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch attendees" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const validAttendees = attendees?.filter(a => a.phone && a.phone.trim()) || [];
    console.log("[ARTIST-ENTERED-SMS] Found opt-in attendees with phones:", validAttendees.length);

    if (validAttendees.length === 0) {
      // Update timestamp anyway to prevent spam
      await supabaseAdmin
        .from("events")
        .update({ artist_entered_sms_at: new Date().toISOString() })
        .eq("id", event_id);

      return new Response(
        JSON.stringify({ ok: true, sent: 0, reason: "no_attendees_with_phone" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("[ARTIST-ENTERED-SMS] Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "SMS service not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const artistName = event.artist_name || event.title || "The artist";
    const messageBody = `${artistName} has entered the After Party!`;

    console.log("[ARTIST-ENTERED-SMS] Sending SMS to", validAttendees.length, "attendees");

    let sentCount = 0;
    let failedCount = 0;

    for (const attendee of validAttendees) {
      const normalizedPhone = normalizePhoneNumber(attendee.phone!);
      if (!normalizedPhone) {
        console.log("[ARTIST-ENTERED-SMS] Invalid phone format for attendee:", attendee.id);
        failedCount++;
        continue;
      }

      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append("To", normalizedPhone);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", messageBody);

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (response.ok) {
          sentCount++;
          console.log("[ARTIST-ENTERED-SMS] Sent to:", normalizedPhone);
        } else {
          const errorText = await response.text();
          console.error("[ARTIST-ENTERED-SMS] Failed for:", normalizedPhone, errorText);
          failedCount++;
        }
      } catch (err) {
        console.error("[ARTIST-ENTERED-SMS] Error sending to:", normalizedPhone, err);
        failedCount++;
      }
    }

    // Update the timestamp to prevent spam
    await supabaseAdmin
      .from("events")
      .update({ artist_entered_sms_at: new Date().toISOString() })
      .eq("id", event_id);

    console.log("[ARTIST-ENTERED-SMS] Complete. Sent:", sentCount, "Failed:", failedCount);

    return new Response(
      JSON.stringify({ ok: true, sent: sentCount, failed: failedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ARTIST-ENTERED-SMS] Error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
