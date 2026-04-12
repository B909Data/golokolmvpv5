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

    const body = await req.json();
    const { id, status, admin_notes, submission_type, admin_status, rejection_reason } = body;

    if (!id) {
      throw new Error("Missing submission id");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle lls_artist_submissions updates (admin_status / rejection_reason)
    if (submission_type === "lls_artist") {
      const updateData: Record<string, string | null> = {};
      if (admin_status !== undefined) updateData.admin_status = admin_status;
      if (rejection_reason !== undefined) updateData.rejection_reason = rejection_reason;

      const { error } = await supabase
        .from("lls_artist_submissions")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating lls_artist_submission:", error);
        throw new Error("Failed to update submission");
      }

      console.log("Updated lls_artist_submissions:", id, updateData);
    } else {
      const updateData: Record<string, string> = {};
      if (status !== undefined) updateData.status = status;
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

      const table = submission_type === "curated" ? "curated_submissions" : "general_submissions";

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating submission:", error);
        throw new Error("Failed to update submission");
      }

      console.log("Updated submission in", table, ":", id, updateData);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-update-submission:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});