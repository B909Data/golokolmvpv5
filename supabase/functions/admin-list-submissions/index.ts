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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch curated submissions
    const { data: curated, error: curatedError } = await supabase
      .from("curated_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (curatedError) {
      console.error("Error fetching curated submissions:", curatedError);
      throw new Error("Failed to fetch curated submissions");
    }

    // Fetch general submissions
    const { data: general, error: generalError } = await supabase
      .from("general_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (generalError) {
      console.error("Error fetching general submissions:", generalError);
      throw new Error("Failed to fetch general submissions");
    }

    // Tag each with source type and merge
    const taggedCurated = (curated || []).map((s: Record<string, unknown>) => ({ ...s, submission_type: "curated", payment_status: "curated" }));
    const taggedGeneral = (general || []).map((s: Record<string, unknown>) => ({ ...s, submission_type: "general" }));
    const all = [...taggedCurated, ...taggedGeneral].sort(
      (a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    );

    console.log("Fetched", taggedCurated.length, "curated and", taggedGeneral.length, "general submissions");

    return new Response(JSON.stringify({ submissions: all }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-list-submissions:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});