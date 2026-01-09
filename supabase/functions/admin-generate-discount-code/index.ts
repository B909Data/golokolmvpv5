import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Monthly caps by partner type
const MONTHLY_CAPS: Record<string, number> = {
  curator: 20,
  venue: 50,
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
    const { key, discount_type, event_id, partner_id, month_scope, count = 1 } = await req.json();

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

    // Validate count
    if (count < 1 || count > 50) {
      return new Response(JSON.stringify({ error: "Count must be between 1 and 50" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // If partner_id is provided, enforce monthly caps
    if (partner_id && month_scope) {
      // Get partner type
      const { data: partner, error: partnerError } = await supabaseAdmin
        .from("partners")
        .select("type")
        .eq("id", partner_id)
        .single();

      if (partnerError || !partner) {
        return new Response(JSON.stringify({ error: "Partner not found" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        });
      }

      const monthlyCap = MONTHLY_CAPS[partner.type] || 20;

      // Count existing codes for this partner + month
      const { count: existingCount, error: countError } = await supabaseAdmin
        .from("afterparty_discount_codes")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", partner_id)
        .eq("month_scope", month_scope);

      if (countError) {
        throw new Error(`Failed to count existing codes: ${countError.message}`);
      }

      const currentCount = existingCount || 0;
      const availableSlots = monthlyCap - currentCount;

      if (availableSlots <= 0) {
        return new Response(JSON.stringify({ 
          error: `Monthly cap reached (${monthlyCap} codes for ${partner.type})`,
          current_count: currentCount,
          monthly_cap: monthlyCap
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      if (count > availableSlots) {
        return new Response(JSON.stringify({ 
          error: `Only ${availableSlots} codes remaining for this month`,
          available: availableSlots,
          monthly_cap: monthlyCap,
          current_count: currentCount
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    }

    // Calculate expires_at (end of month_scope if provided)
    let expires_at: string | null = null;
    if (month_scope) {
      const [year, month] = month_scope.split("-").map(Number);
      const nextMonth = new Date(year, month, 1); // First day of next month
      expires_at = nextMonth.toISOString();
    }

    // Generate codes
    const generatedCodes: { code: string; id: string }[] = [];
    
    for (let i = 0; i < count; i++) {
      let code = generateCode();
      let attempts = 0;
      
      // Ensure unique code
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
          partner_id: partner_id || null,
          month_scope: month_scope || null,
          expires_at: expires_at,
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        throw new Error(`Failed to create code: ${error.message}`);
      }

      generatedCodes.push({ code: data.code, id: data.id });
      console.log("Created discount code:", code, partner_id ? `for partner ${partner_id}` : "");
    }

    return new Response(JSON.stringify({ 
      codes: generatedCodes,
      count: generatedCodes.length
    }), {
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
