import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MailerLiteRequest {
  email: string;
  artist_control_url: string;
  after_party_share_url: string;
  name?: string;
  event_title?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, artist_control_url, after_party_share_url, name, event_title }: MailerLiteRequest = await req.json();
    
    console.log("MailerLite request for:", email);

    if (!email || !artist_control_url || !after_party_share_url) {
      throw new Error("Missing required fields: email, artist_control_url, after_party_share_url");
    }

    const apiKey = Deno.env.get("MAILERLITE_API_KEY");
    const groupId = Deno.env.get("MAILERLITE_GROUP_ID_AFTER_PARTY_CREATED");

    if (!apiKey || !groupId) {
      throw new Error("MailerLite configuration missing");
    }

    // Step 1: Upsert subscriber with custom fields
    const subscriberPayload: Record<string, unknown> = {
      email,
      fields: {
        artist_control_url,
        after_party_share_url,
      },
    };

    // Add optional fields if provided
    if (name) {
      subscriberPayload.fields = {
        ...subscriberPayload.fields as object,
        name,
      };
    }
    if (event_title) {
      subscriberPayload.fields = {
        ...subscriberPayload.fields as object,
        event_title,
      };
    }

    console.log("Upserting subscriber:", email);

    const upsertResponse = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(subscriberPayload),
    });

    const upsertData = await upsertResponse.json();
    
    if (!upsertResponse.ok) {
      console.error("MailerLite upsert error:", upsertData);
      throw new Error(`MailerLite upsert failed: ${JSON.stringify(upsertData)}`);
    }

    const subscriberId = upsertData.data?.id;
    console.log("Subscriber upserted, ID:", subscriberId);

    if (!subscriberId) {
      throw new Error("No subscriber ID returned from MailerLite");
    }

    // Step 2: Add subscriber to group (triggers automation)
    console.log("Adding subscriber to group:", groupId);

    const groupResponse = await fetch(
      `https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${groupId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
      }
    );

    const groupData = await groupResponse.json();

    if (!groupResponse.ok) {
      console.error("MailerLite group add error:", groupData);
      throw new Error(`MailerLite group add failed: ${JSON.stringify(groupData)}`);
    }

    console.log("Subscriber added to group successfully");

    return new Response(JSON.stringify({ success: true, subscriber_id: subscriberId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-mailerlite-afterparty-created:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
