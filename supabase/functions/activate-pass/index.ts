import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Token required", code: "MISSING_TOKEN" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up attendee by access_token
    const { data: attendee, error: fetchErr } = await supabase
      .from("attendees")
      .select("id, event_id, display_name, qr_token, activated_at, access_token_expires_at, payment_status, purchase_email")
      .eq("access_token", accessToken)
      .maybeSingle();

    if (fetchErr) {
      console.error("Fetch error:", fetchErr);
      return new Response(
        JSON.stringify({ error: "Internal error", code: "FETCH_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!attendee) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired link.", code: "NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (attendee.access_token_expires_at && new Date(attendee.access_token_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This pass link has expired.", code: "EXPIRED" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already activated
    if (attendee.activated_at) {
      return new Response(
        JSON.stringify({ error: "This pass has already been activated.", code: "ALREADY_ACTIVATED" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Activate
    const { error: updateErr } = await supabase
      .from("attendees")
      .update({ activated_at: new Date().toISOString() })
      .eq("id", attendee.id);

    if (updateErr) {
      console.error("Update error:", updateErr);
      return new Response(
        JSON.stringify({ error: "Failed to activate pass", code: "UPDATE_ERROR" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Pass activated for attendee:", attendee.id);

    return new Response(
      JSON.stringify({
        activated: true,
        attendee: {
          id: attendee.id,
          event_id: attendee.event_id,
          display_name: attendee.display_name,
          qr_token: attendee.qr_token,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("activate-pass error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message, code: "INTERNAL" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
