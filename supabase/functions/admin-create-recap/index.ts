import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    const adminKey = Deno.env.get("ADMIN_KEY");

    if (!adminKey || key !== adminKey) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { event_id } = await req.json();

    if (!event_id) {
      throw new Error("Missing event_id");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if recap already exists
    const { data: existingRecap } = await supabase
      .from("recaps")
      .select("id")
      .eq("event_id", event_id)
      .single();

    if (existingRecap) {
      return new Response(JSON.stringify({ success: true, recap_id: existingRecap.id, exists: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate share token
    const shareToken = crypto.randomUUID();

    // Create new recap
    const { data: recap, error } = await supabase
      .from("recaps")
      .insert({
        event_id,
        share_token: shareToken,
        generated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating recap:", error);
      throw new Error("Failed to create recap");
    }

    console.log("Created recap for event:", event_id);

    return new Response(JSON.stringify({ success: true, recap_id: recap.id, exists: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-create-recap:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
