import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { email, artist_name } = await req.json();
    const API_KEY = Deno.env.get("MAILERLITE_ARTIST_SIGNUP");
    const GROUP_ID = Deno.env.get("MAILERLITE_GROUP_ID_LLS");

    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        fields: {
          name: artist_name,
          golokol_artist_name: artist_name,
        },
        groups: GROUP_ID ? [GROUP_ID] : [],
        status: "active",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("MailerLite API error:", JSON.stringify(result));
      throw new Error(`MailerLite API error: ${JSON.stringify(result)}`);
    }

    console.log("MailerLite subscriber added:", email);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("MailerLite error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});