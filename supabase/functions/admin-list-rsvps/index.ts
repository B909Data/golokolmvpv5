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
    const eventId = url.searchParams.get("event_id");
    const adminKey = Deno.env.get("ADMIN_KEY");

    if (!adminKey || key !== adminKey) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabase
      .from("lls_guest_claims")
      .select("*")
      .order("claimed_at", { ascending: false });

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data: claims, error } = await query;

    if (error) {
      console.error("Error fetching claims:", error);
      throw new Error("Failed to fetch claims");
    }

    console.log("Fetched", claims?.length || 0, "claims");

    return new Response(JSON.stringify({ claims: claims || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-list-rsvps:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
