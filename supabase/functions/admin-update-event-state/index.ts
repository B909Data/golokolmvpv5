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

    const { event_id, admin_state } = await req.json();

    if (!event_id || !admin_state) {
      return new Response(JSON.stringify({ error: "Missing event_id or admin_state" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!["active", "paused", "archived"].includes(admin_state)) {
      return new Response(JSON.stringify({ error: "Invalid admin_state. Must be active, paused, or archived" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabase
      .from("events")
      .update({ admin_state })
      .eq("id", event_id);

    if (error) {
      console.error("Error updating event state:", error);
      throw new Error("Failed to update event state");
    }

    console.log(`Event ${event_id} state updated to ${admin_state}`);

    return new Response(JSON.stringify({ success: true, admin_state }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-update-event-state:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
