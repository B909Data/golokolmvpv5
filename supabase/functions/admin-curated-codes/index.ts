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
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    const adminKey = Deno.env.get("ADMIN_KEY");

    if (!key || key !== adminKey) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // GET = list codes
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("lls_curated_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ codes: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST = generate or delete
    if (req.method === "POST") {
      const body = await req.json();
      const action = body.action;

      if (action === "generate") {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let random = "";
        for (let i = 0; i < 6; i++) {
          random += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const code = `LLS-${random}`;

        const { data, error } = await supabaseAdmin
          .from("lls_curated_codes")
          .insert({ code })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ code: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (action === "delete") {
        const { id } = body;
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabaseAdmin
          .from("lls_curated_codes")
          .delete()
          .eq("id", id);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("admin-curated-codes error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
