import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Deno-native QR code generator - no canvas/DOM required
// This library returns a data:image/gif;base64,... string
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts";

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
      .select("id, artist_name, qr_image_url, qr_token")
      .eq("event_id", eventId)
      .eq("guest_email", guestEmail)
      .maybeSingle();

    if (existingErr) return res(400, { error: "Existing-claim lookup failed", details: existingErr.message });

    let claimId: string;
    let qrImageUrl: string | null = null;

    // Helper function to generate and upload QR code
    async function generateAndUploadQR(qrToken: string, id: string): Promise<string | null> {
      try {
        const checkinUrl = `${APP_BASE_URL}/lls/${eventId}/checkin?token=${qrToken}`;
        console.log("Generating QR for URL:", checkinUrl);
        
        // qrcode() returns a Promise that resolves to data:image/gif;base64,...
        const dataUrl = await qrcode(checkinUrl);
        console.log("QR dataUrl type:", typeof dataUrl, "length:", dataUrl?.length);
        
        if (typeof dataUrl !== "string" || !dataUrl.includes(",")) {
          console.error("Invalid dataUrl format:", dataUrl);
          return null;
        }
        
        const base64 = dataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        
        const path = `${eventId}/${id}.gif`;
        console.log("Uploading to path:", path);
        
        const { error: uploadErr } = await supabase.storage
          .from("lls_qr")
          .upload(path, bytes, { contentType: "image/gif", upsert: true });

        if (uploadErr) {
          console.error("QR upload failed:", uploadErr.message);
          return null;
        }

        const { data: pub } = supabase.storage.from("lls_qr").getPublicUrl(path);
        const publicUrl = pub.publicUrl;
        
        // Update the claim with the QR URL
        await supabase
          .from("lls_guest_claims")
          .update({ qr_image_url: publicUrl })
          .eq("id", id);
          
        console.log("QR generated successfully:", publicUrl);
        return publicUrl;
      } catch (qrErr) {
        console.error("QR generation error:", qrErr);
        return null;
      }
    }

    let passQrToken: string = "";

    if (existing) {
      claimId = existing.id;
      qrImageUrl = existing.qr_image_url ?? null;
      passQrToken = existing.qr_token ?? "";
      
      // If QR was never generated, generate it now
      if (!qrImageUrl && existing.qr_token) {
        qrImageUrl = await generateAndUploadQR(existing.qr_token, claimId);
      }
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
          guest_role: "Fan",
          artist_name: artistName,
          qr_token: qrToken,
        })
        .select("id, qr_token")
        .single();

      if (insertErr) {
        return res(400, { error: "Claim insert failed", details: insertErr.message });
      }

      claimId = inserted.id;
      passQrToken = qrToken;

      // 4) Generate and upload QR code
      qrImageUrl = await generateAndUploadQR(inserted.qr_token, claimId);
      
      if (!qrImageUrl) {
        return res(500, { error: "QR generation failed", details: "Could not generate QR code" });
      }
    }

    // 5) Send to MailerLite (non-blocking — never fail the pass flow)
    try {
      const mlApiKey = Deno.env.get("MAILERLITE_API_KEY");
      const mlGroupId = Deno.env.get("MAILERLITE_GROUP_ID_LLS");
      if (mlApiKey && mlGroupId) {
        const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${mlApiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            email: guestEmail,
            fields: {
              name: guestName,
              lls_artistname: artistName,
              lls_token: passQrToken,
            },
            groups: [mlGroupId],
            status: "active",
          }),
        });
        if (!mlRes.ok) {
          const mlErr = await mlRes.text();
          console.error("MailerLite error (non-fatal):", mlRes.status, mlErr);
        } else {
          console.log("MailerLite subscriber added for", guestEmail);
        }
      } else {
        console.warn("MailerLite secrets not set, skipping subscriber sync");
      }
    } catch (mlErr) {
      console.error("MailerLite call failed (non-fatal):", mlErr);
    }

    // 6) Return success
    return res(200, {
      claimId,
      artistName,
      qrImageUrl,
    });
  } catch (e) {
    console.error("Unhandled error:", e);
    return res(500, { error: "Unhandled error", details: String(e?.message ?? e) });
  }
});
