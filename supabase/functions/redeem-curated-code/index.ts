import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Code is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to update the code
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabaseAdmin
      .from("lls_curated_codes")
      .update({
        is_used: true,
        used_by_email: email.trim().toLowerCase(),
        used_at: new Date().toISOString(),
      })
      .eq("code", code.toUpperCase().trim())
      .eq("is_used", false)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "This code has already been used." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, email: email.trim().toLowerCase() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("redeem-curated-code error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
