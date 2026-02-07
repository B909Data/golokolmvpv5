import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Simple QR generator (pure JS) -> PNG data URL
import QRCode from "https://esm.sh/qrcode@1.5.4";

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

function requireStr(v: unknown, name: string) {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(`Missing ${name}`);
  return s;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return res(405, { error: "Method not allowed" });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const APP_BASE_URL = Deno.env.get("APP_BASE_URL") || "https://golokol.app";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return res(500, { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = await req.json();

    const eventId = requireStr(body.eventId, "eventId");
    const guestName = requireStr(body.guestName, "guestName");
    const guestEmail = requireStr(body.guestEmail, "guestEmail").toLowerCase();
    const artistName = requireStr(body.artistName, "artistName");
    const code = requireStr(body.code, "code").toUpperCase();

    // 1) Validate invite code row matches event + artist + code and is active/not expired
    const { data: invite, error: inviteErr } = await supabase
      .from("lls_invite_codes")
      .select("id, artist_name, code, is_active, expires_at")
      .eq("event_id", eventId)
      .eq("artist_name", artistName)
      .eq("code", code)
      .eq("is_active", true)
      .maybeSingle();

    if (inviteErr) return res(400, { error: "Invite lookup failed", details: inviteErr.message });
    if (!invite) return res(400, { error: "Invalid code for selected artist (or inactive)." });

    if (invite.expires_at) {
      const exp = new Date(invite.expires_at).getTime();
      if (Number.isFinite(exp) && exp <= Date.now()) {
        return res(400, { error: "This invite code has expired." });
      }
    }

    // 2) If the same email already claimed for this event, return the existing claim
    // (Matches your unique index: (event_id, lower(guest_email)))
    const { data: existing, error: existingErr } = await supabase
      .from("lls_guest_claims")
      .select("id, artist_name, qr_image_url")
      .eq("event_id", eventId)
      .eq("guest_email", guestEmail)
      .maybeSingle();

    if (existingErr) return res(400, { error: "Existing-claim lookup failed", details: existingErr.message });

    let claimId: string;
    let qrImageUrl: string | null = null;

    if (existing) {
      claimId = existing.id;
      qrImageUrl = existing.qr_image_url ?? null;
    } else {
      // 3) Insert new claim
      const qrToken = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");

      const { data: inserted, error: insertErr } = await supabase
        .from("lls_guest_claims")
        .insert({
          event_id: eventId,
          invite_code_id: invite.id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_role: "Fan", // no longer used in UI, but column is required in your schema
          artist_name: artistName,
          qr_token: qrToken,
        })
        .select("id, qr_token")
        .single();

      if (insertErr) {
        return res(400, { error: "Claim insert failed", details: insertErr.message });
      }

      claimId = inserted.id;

      // 4) Generate QR code (URL with token)
      const checkinUrl = `${APP_BASE_URL}/lls/${eventId}/checkin?token=${inserted.qr_token}`;

      // PNG data URL -> bytes
      const dataUrl = await QRCode.toDataURL(checkinUrl, { margin: 1, width: 512 });
      const base64 = dataUrl.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      // 5) Upload to Storage
      const path = `${eventId}/${claimId}.png`;
      const { error: uploadErr } = await supabase.storage
        .from("lls_qr")
        .upload(path, bytes, { contentType: "image/png", upsert: true });

      if (uploadErr) {
        return res(400, { error: "QR upload failed", details: uploadErr.message });
      }

      // 6) Get public URL and save it
      const { data: pub } = supabase.storage.from("lls_qr").getPublicUrl(path);
      qrImageUrl = pub.publicUrl;

      const { error: updErr } = await supabase
        .from("lls_guest_claims")
        .update({ qr_image_url: qrImageUrl })
        .eq("id", claimId);

      if (updErr) {
        return res(400, { error: "Failed to save QR URL", details: updErr.message });
      }
    }

    // 7) Return success
    return res(200, {
      claimId,
      artistName,
      qrImageUrl,
    });
  } catch (e) {
    return res(500, { error: "Unhandled error", details: String(e?.message ?? e) });
  }
});
