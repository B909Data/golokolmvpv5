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

    // Fetch all after_party events with RSVP counts
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .eq("type", "after_party")
      .order("start_at", { ascending: false });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw new Error("Failed to fetch events");
    }

    // Get RSVP counts for each event
    const eventIds = events?.map((e) => e.id) || [];
    const { data: attendeeCounts, error: countError } = await supabase
      .from("attendees")
      .select("event_id")
      .in("event_id", eventIds);

    if (countError) {
      console.error("Error fetching attendee counts:", countError);
    }

    // Count RSVPs per event
    const rsvpCounts: Record<string, number> = {};
    attendeeCounts?.forEach((a) => {
      rsvpCounts[a.event_id] = (rsvpCounts[a.event_id] || 0) + 1;
    });

    // Attach RSVP counts to events
    const eventsWithCounts = events?.map((event) => ({
      ...event,
      rsvp_count: rsvpCounts[event.id] || 0,
    }));

    console.log("Fetched", eventsWithCounts?.length || 0, "events");

    return new Response(JSON.stringify({ events: eventsWithCounts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in admin-list-events:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
