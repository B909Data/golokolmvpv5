import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { key, action, id, name, active } = body;

    const ADMIN_KEY = Deno.env.get("ADMIN_KEY");
    if (!ADMIN_KEY || key !== ADMIN_KEY) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // CREATE city
    if (action === "create") {
      if (!name?.trim()) {
        return new Response(JSON.stringify({ error: "Name is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("cities")
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        const msg = error.code === "23505" ? "City already exists" : "Failed to create city";
        return new Response(JSON.stringify({ error: msg }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, city: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TOGGLE active status
    if (action === "toggle") {
      if (!id) {
        return new Response(JSON.stringify({ error: "City ID is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("cities")
        .update({ active })
        .eq("id", id);

      if (error) {
        console.error("Update error:", error);
        return new Response(JSON.stringify({ error: "Failed to update city" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // DELETE city
    if (action === "delete") {
      if (!id) {
        return new Response(JSON.stringify({ error: "City ID is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("cities")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        return new Response(JSON.stringify({ error: "Failed to delete city" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
