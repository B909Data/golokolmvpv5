import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[AFTERPARTY-UPLOAD-FLYER] ${step}${detailsStr}`);
};

interface UploadRequest {
  event_id: string;
  file_base64: string;
  content_type: string;
  filename: string;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { event_id, file_base64, content_type, filename }: UploadRequest = await req.json();

    // Validate required fields
    if (!event_id || !file_base64 || !content_type) {
      throw new Error("Missing required fields: event_id, file_base64, content_type");
    }

    logStep("Received request", { event_id, content_type, filename });

    // Validate content type
    if (!ALLOWED_TYPES.includes(content_type)) {
      throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`);
    }

    // Decode base64 and check file size
    const binaryString = atob(file_base64);
    const fileSize = binaryString.length;

    logStep("File size check", { fileSize, maxSize: MAX_FILE_SIZE });

    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is 3MB, got ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // Convert base64 to Uint8Array
    const bytes = new Uint8Array(fileSize);
    for (let i = 0; i < fileSize; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Determine file extension
    const ext = content_type === "image/png" ? "png" : "jpg";
    const storagePath = `${event_id}/flyer.${ext}`;

    logStep("Uploading to storage", { storagePath });

    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Upload to storage (upsert to allow replacing)
    const { error: uploadError } = await supabaseAdmin.storage
      .from("after_party_flyers")
      .upload(storagePath, bytes, {
        contentType: content_type,
        upsert: true,
      });

    if (uploadError) {
      logStep("Upload error", { error: uploadError.message });
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    logStep("Upload successful");

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("after_party_flyers")
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;
    logStep("Generated public URL", { publicUrl });

    // Update event with image_url
    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({ image_url: publicUrl })
      .eq("id", event_id);

    if (updateError) {
      logStep("Update event error", { error: updateError.message });
      throw new Error(`Failed to update event: ${updateError.message}`);
    }

    logStep("Event updated with image_url");

    return new Response(
      JSON.stringify({ public_url: publicUrl }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message });
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
