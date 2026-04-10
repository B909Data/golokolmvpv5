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

    const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");

    // Get group ID for "GoLokol Atlanta Signups"
    const groupsRes = await fetch("https://api.mailerlite.com/api/v2/groups", {
      headers: {
        "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const groups = await groupsRes.json();
    const group = groups.find((g: any) => g.name === "GoLokol Atlanta Signups");

    if (!group) {
      throw new Error("MailerLite group not found");
    }

    // Add subscriber to group
    const subRes = await fetch(
      `https://api.mailerlite.com/api/v2/groups/${group.id}/subscribers`,
      {
        method: "POST",
        headers: {
          "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: artist_name,
          resubscribe: true,
          autoresponders: true,
        }),
      }
    );

    if (!subRes.ok) {
      throw new Error("Failed to add subscriber to MailerLite");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("MailerLite error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
