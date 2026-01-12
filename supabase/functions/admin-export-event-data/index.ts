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

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, artist_name, start_at")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("Error fetching event:", eventError);
      throw new Error("Event not found");
    }

    // Get all messages for this event with attendee info
    const { data: messages, error: messagesError } = await supabase
      .from("after_party_messages")
      .select(`
        id,
        message,
        role,
        created_at,
        attendee_id,
        attendees(display_name)
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw new Error("Failed to fetch messages");
    }

    // Get email opt-ins for this event
    const { data: emails, error: emailsError } = await supabase
      .from("email_optins")
      .select("email, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (emailsError) {
      console.error("Error fetching emails:", emailsError);
    }

    // Build CSV content
    const csvRows: string[] = [];
    
    // Header row
    csvRows.push("Event ID,Event Title,Timestamp,Content Type,Content,Sender Name,Sender Role");

    // Escape CSV values helper
    const escapeCsv = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    // Add messages
    for (const msg of messages || []) {
      // deno-lint-ignore no-explicit-any
      const attendeeData = (msg as any).attendees;
      const displayName = attendeeData?.display_name || null;
      let senderName = displayName || "Anonymous";
      let senderRole = msg.role;
      
      // Handle system display names
      if (displayName === "__ARTIST_SYSTEM__") {
        senderName = event.artist_name || "Artist";
        senderRole = "artist";
      } else if (displayName === "__ADMIN_MODERATOR__") {
        senderName = "GoLokol Moderator";
        senderRole = "moderator";
      }

      csvRows.push([
        escapeCsv(event.id),
        escapeCsv(event.title),
        escapeCsv(msg.created_at || ""),
        "message",
        escapeCsv(msg.message || ""),
        escapeCsv(senderName),
        escapeCsv(senderRole),
      ].join(","));
    }

    // Add email opt-ins
    for (const email of emails || []) {

      csvRows.push([
        escapeCsv(event.id),
        escapeCsv(event.title),
        escapeCsv(email.created_at || ""),
        "email_optin",
        escapeCsv(email.email),
        "",
        "fan",
      ].join(","));
    }

    const csvContent = csvRows.join("\n");

    console.log(`Exported ${messages?.length || 0} messages and ${emails?.length || 0} emails for event ${eventId}`);

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="afterparty-${eventId}.csv"`,
      },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-export-event-data:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
