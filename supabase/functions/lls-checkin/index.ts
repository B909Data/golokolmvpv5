import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function res(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return res(405, { error: "Method not allowed" });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = await req.json();
    const eventId = String(body.eventId ?? "").trim();
    const token = String(body.token ?? "").trim();

    if (!eventId) return res(400, { error: "Missing eventId" });
    if (!token) return res(400, { error: "Missing token" });

    // 1) Look up the claim by event_id and qr_token
    const { data: claim, error: claimErr } = await supabase
      .from("lls_guest_claims")
      .select("id, guest_name, artist_name, checked_in_at, checkin_status")
      .eq("event_id", eventId)
      .eq("qr_token", token)
      .maybeSingle();

    if (claimErr) {
      return res(400, { error: "Claim lookup failed", details: claimErr.message });
    }

    if (!claim) {
      return res(404, { error: "Pass not found. Invalid or expired token." });
    }

    // 2) Check if already checked in
    if (claim.checked_in_at || claim.checkin_status === "checked_in") {
      return res(200, {
        alreadyCheckedIn: true,
        guestName: claim.guest_name,
        artistName: claim.artist_name,
        message: "Already checked in",
      });
    }

    // 3) Mark as checked in
    const { error: updateErr } = await supabase
      .from("lls_guest_claims")
      .update({
        checked_in_at: new Date().toISOString(),
        checkin_status: "checked_in",
      })
      .eq("id", claim.id);

    if (updateErr) {
      return res(400, { error: "Check-in failed", details: updateErr.message });
    }

    // 4) Return success
    return res(200, {
      success: true,
      guestName: claim.guest_name,
      artistName: claim.artist_name,
    });
  } catch (e) {
    console.error("Unhandled error:", e);
    return res(500, { error: "Unhandled error", details: String(e?.message ?? e) });
  }
});
