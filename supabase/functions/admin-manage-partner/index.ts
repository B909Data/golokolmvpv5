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
    const { key, action, id, name, type, active, city_id, file_base64, content_type, filename } = body;
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

    if (action === "create") {
      if (!name || !type) {
        return new Response(JSON.stringify({ error: "Name and type required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const insertData: Record<string, unknown> = { name, type };
      if (city_id) {
        insertData.city_id = city_id;
      }

      const { data, error } = await supabase
        .from("partners")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Create error:", error);
        return new Response(JSON.stringify({ error: "Failed to create partner" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, partner: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle") {
      if (!id || typeof active !== "boolean") {
        return new Response(JSON.stringify({ error: "ID and active status required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("partners")
        .update({ active })
        .eq("id", id);

      if (error) {
        console.error("Toggle error:", error);
        return new Response(JSON.stringify({ error: "Failed to update partner" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await supabase
        .from("partners")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        return new Response(JSON.stringify({ error: "Failed to delete partner" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "upload-flyer") {
      if (!id || !file_base64 || !content_type) {
        return new Response(JSON.stringify({ error: "ID, file_base64, and content_type required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Validate partner exists and is a curator
      const { data: partner, error: partnerErr } = await supabase
        .from("partners")
        .select("id, type")
        .eq("id", id)
        .single();

      if (partnerErr || !partner) {
        return new Response(JSON.stringify({ error: "Partner not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (partner.type !== "curator") {
        return new Response(JSON.stringify({ error: "Flyers are only for curators" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Decode base64 and upload to storage
      const extension = content_type === "image/png" ? "png" : "jpg";
      const storagePath = `${id}/flyer.${extension}`;

      const binaryData = Uint8Array.from(atob(file_base64), (c) => c.charCodeAt(0));

      const { error: uploadErr } = await supabase.storage
        .from("partner_flyers")
        .upload(storagePath, binaryData, {
          contentType: content_type,
          upsert: true,
        });

      if (uploadErr) {
        console.error("Upload error:", uploadErr);
        return new Response(JSON.stringify({ error: "Failed to upload flyer" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("partner_flyers")
        .getPublicUrl(storagePath);

      // Update partner record
      const { error: updateErr } = await supabase
        .from("partners")
        .update({
          flyer_image_url: urlData.publicUrl,
          flyer_updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateErr) {
        console.error("Update error:", updateErr);
        return new Response(JSON.stringify({ error: "Failed to update partner" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, flyer_url: urlData.publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove-flyer") {
      if (!id) {
        return new Response(JSON.stringify({ error: "ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Clear flyer URL from partner
      const { error: updateErr } = await supabase
        .from("partners")
        .update({
          flyer_image_url: null,
          flyer_updated_at: null,
        })
        .eq("id", id);

      if (updateErr) {
        console.error("Update error:", updateErr);
        return new Response(JSON.stringify({ error: "Failed to remove flyer" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Try to delete from storage (non-blocking)
      try {
        await supabase.storage
          .from("partner_flyers")
          .remove([`${id}/flyer.jpg`, `${id}/flyer.png`]);
      } catch (e) {
        console.warn("Storage delete failed:", e);
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
