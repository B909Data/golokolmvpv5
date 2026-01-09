import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { key, discount_type, event_id } = await req.json();

    // Validate admin key
    const adminKey = Deno.env.get("ADMIN_KEY");
    if (!key || key !== adminKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    // Validate discount type
    if (!discount_type || !["50_percent", "free"].includes(discount_type)) {
      return new Response(JSON.stringify({ error: "Invalid discount type" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from("afterparty_discount_codes")
        .select("id")
        .eq("code", code)
        .single();
      
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    // Insert the code
    const { data, error } = await supabaseAdmin
      .from("afterparty_discount_codes")
      .insert({
        code,
        discount_type,
        event_id: event_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      throw new Error(`Failed to create code: ${error.message}`);
    }

    console.log("Created discount code:", code);

    return new Response(JSON.stringify({ code: data.code, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
