import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCheckinSmsRequest {
  phone: string;
  eventTitle: string;
  roomUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, eventTitle, roomUrl }: SendCheckinSmsRequest = await req.json();

    if (!phone || !eventTitle || !roomUrl) {
      console.error("Missing required fields:", { phone: !!phone, eventTitle: !!eventTitle, roomUrl: !!roomUrl });
      return new Response(
        JSON.stringify({ error: "phone, eventTitle, and roomUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    const messageBody = `GoLokol: You're in 🎉 Join the After Party for ${eventTitle}: ${roomUrl}`;
    
    console.log(`Sending check-in SMS to ${phone}`);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("To", phone);
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
      const result = await response.json();
      console.log("Check-in SMS sent successfully:", result.sid);
      return new Response(
        JSON.stringify({ success: true, messageSid: result.sid }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      const errorBody = await response.text();
      console.error("Failed to send SMS:", errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: errorBody }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("Error in send-checkin-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
