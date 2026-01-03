import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendRecapSmsRequest {
  eventId: string;
  recapUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, recapUrl }: SendRecapSmsRequest = await req.json();

    if (!eventId || !recapUrl) {
      return new Response(
        JSON.stringify({ error: "eventId and recapUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Missing Twilio credentials");
      return new Response(
        JSON.stringify({ error: "Twilio configuration missing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch all attendees with phone numbers for this event
    const { data: attendees, error: attendeesError } = await supabase
      .from("attendees")
      .select("id, phone")
      .eq("event_id", eventId)
      .not("phone", "is", null);

    if (attendeesError) {
      console.error("Error fetching attendees:", attendeesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch attendees" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const attendeesWithPhones = attendees?.filter((a) => a.phone && a.phone.trim() !== "") || [];
    console.log(`Found ${attendeesWithPhones.length} attendees with phone numbers`);

    if (attendeesWithPhones.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sentCount: 0, message: "No attendees with phone numbers" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messageBody = `Thanks for coming — here's your After Party recap: ${recapUrl}`;
    let sentCount = 0;
    const errors: string[] = [];

    // Send SMS to each attendee
    for (const attendee of attendeesWithPhones) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append("To", attendee.phone!);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", messageBody);

        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        if (response.ok) {
          sentCount++;
          console.log(`SMS sent to attendee ${attendee.id}`);
        } else {
          const errorBody = await response.text();
          console.error(`Failed to send SMS to ${attendee.id}:`, errorBody);
          errors.push(`Failed to send to ${attendee.phone}`);
        }
      } catch (smsError) {
        console.error(`Error sending SMS to ${attendee.id}:`, smsError);
        errors.push(`Error sending to ${attendee.phone}`);
      }
    }

    console.log(`SMS sending complete: ${sentCount}/${attendeesWithPhones.length} sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount, 
        totalAttempted: attendeesWithPhones.length,
        errors: errors.length > 0 ? errors : undefined 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-recap-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
