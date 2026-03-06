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
    const { legal_name, artist_name, email, role, signature_name, agreement_text } = await req.json();

    if (!legal_name || !artist_name || !email || !signature_name || !agreement_text) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip_address =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    const user_agent = req.headers.get("user-agent") || "unknown";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabaseAdmin
      .from("lls_music_release_signatures")
      .insert({
        legal_name,
        artist_name,
        email,
        role: role || null,
        signature_name,
        agreement_version: "LLS_MUSIC_RELEASE_V1",
        agreement_text,
        release_confirmed: true,
        ip_address,
        user_agent,
      })
      .select("id, created_at")
      .single();

    if (error) throw error;

    // Send confirmation email via MailerLite transactional (best-effort)
    try {
      const mailerliteKey = Deno.env.get("MAILERLITE_API_KEY");
      if (mailerliteKey) {
        const signedDate = new Date(data.created_at).toLocaleString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "full",
          timeStyle: "short",
        });

        await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mailerliteKey}`,
          },
          body: JSON.stringify({
            email,
            fields: {
              name: legal_name,
              last_name: artist_name,
            },
            groups: [Deno.env.get("MAILERLITE_GROUP_ID_LLS")].filter(Boolean),
          }),
        });
      }
    } catch (emailErr) {
      console.error("Email notification error (non-fatal):", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id, created_at: data.created_at }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Sign music release error:", err);
    return new Response(JSON.stringify({ error: "Failed to save signature" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
