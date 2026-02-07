import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, guestName, guestEmail, artistName, code } = await req.json();

    // Validate required fields
    if (!eventId || !guestName || !guestEmail || !artistName || !code) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize inputs
    const normalizedEmail = guestEmail.trim().toLowerCase();
    const normalizedCode = code.trim().toUpperCase();

    // Look up the invite code
    const { data: inviteCode, error: codeError } = await supabase
      .from("lls_invite_codes")
      .select("id, event_id, artist_name, is_active, expires_at")
      .eq("event_id", eventId)
      .eq("code", normalizedCode)
      .single();

    if (codeError || !inviteCode) {
      return new Response(
        JSON.stringify({ error: "Invalid invite code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate code is active
    if (!inviteCode.is_active) {
      return new Response(
        JSON.stringify({ error: "This invite code is no longer active" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code has expired
    if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "This invite code has expired" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate artist matches the code
    if (inviteCode.artist_name !== artistName) {
      return new Response(
        JSON.stringify({ error: "This code is not valid for the selected artist" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if guest already claimed a pass for this event
    const { data: existingClaim } = await supabase
      .from("lls_guest_claims")
      .select("id")
      .eq("event_id", eventId)
      .ilike("guest_email", normalizedEmail)
      .single();

    if (existingClaim) {
      return new Response(
        JSON.stringify({ error: "You have already claimed a pass for this event" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique QR token
    const qrToken = crypto.randomUUID();

    // Create the claim
    const { data: claim, error: claimError } = await supabase
      .from("lls_guest_claims")
      .insert({
        event_id: eventId,
        invite_code_id: inviteCode.id,
        guest_name: guestName.trim(),
        guest_email: normalizedEmail,
        guest_role: "guest", // Default role for invite code claims
        artist_name: artistName,
        qr_token: qrToken,
      })
      .select("id")
      .single();

    if (claimError) {
      console.error("Claim insert error:", claimError);
      return new Response(
        JSON.stringify({ error: "Failed to create pass. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ claimId: claim.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
