import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendRsvpSmsRequest {
  phone: string;
  eventTitle: string;
  qrUrl: string;
}

/**
 * Normalize phone number to E.164 format (+1XXXXXXXXXX)
 * Accepts: 10-digit US numbers OR +1XXXXXXXXXX
 */
function normalizePhoneNumber(rawPhone: string): { normalized: string | null; error: string | null } {
  console.log("[PHONE] Raw input:", rawPhone);
  
  // Strip all non-digits
  const digitsOnly = rawPhone.replace(/\D/g, "");
  console.log("[PHONE] Digits only:", digitsOnly);
  
  let normalized: string | null = null;
  
  if (digitsOnly.length === 10) {
    // 10-digit US number → prefix +1
    normalized = `+1${digitsOnly}`;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    // 11-digit starting with 1 → prefix +
    normalized = `+${digitsOnly}`;
  } else {
    console.error("[PHONE] Invalid phone length:", digitsOnly.length);
    return { normalized: null, error: `Invalid phone format. Got ${digitsOnly.length} digits, expected 10 or 11.` };
  }
  
  console.log("[PHONE] Normalized (E.164):", normalized);
  return { normalized, error: null };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log("[REQUEST] Raw body:", JSON.stringify(requestBody));
    
    const { phone, eventTitle, qrUrl }: SendRsvpSmsRequest = requestBody;

    if (!phone || !eventTitle || !qrUrl) {
      console.error("[VALIDATION] Missing required fields:", { 
        phone: !!phone, 
        eventTitle: !!eventTitle, 
        qrUrl: !!qrUrl 
      });
      return new Response(
        JSON.stringify({ ok: false, error: "phone, eventTitle, and qrUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Normalize phone number
    const { normalized: normalizedPhone, error: phoneError } = normalizePhoneNumber(phone);
    if (phoneError || !normalizedPhone) {
      console.error("[PHONE] Normalization failed:", phoneError);
      return new Response(
        JSON.stringify({ ok: false, error: phoneError || "Phone normalization failed" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");
    const twilioMessagingServiceSid = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID");

    console.log("[TWILIO] Config check:", {
      hasAccountSid: !!twilioAccountSid,
      hasAuthToken: !!twilioAuthToken,
      hasPhoneNumber: !!twilioPhoneNumber,
      hasMessagingServiceSid: !!twilioMessagingServiceSid
    });

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error("[TWILIO] Missing credentials");
      return new Response(
        JSON.stringify({ ok: false, error: "Twilio credentials missing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Determine sender (Phone Number or Messaging Service)
    let senderConfig: { From?: string; MessagingServiceSid?: string } = {};
    if (twilioMessagingServiceSid) {
      senderConfig.MessagingServiceSid = twilioMessagingServiceSid;
      console.log("[TWILIO] Using MessagingServiceSid:", twilioMessagingServiceSid);
    } else if (twilioPhoneNumber) {
      senderConfig.From = twilioPhoneNumber;
      console.log("[TWILIO] Using From number:", twilioPhoneNumber);
    } else {
      console.error("[TWILIO] No sender configured (need TWILIO_PHONE_NUMBER or TWILIO_MESSAGING_SERVICE_SID)");
      return new Response(
        JSON.stringify({ ok: false, error: "No Twilio sender configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const messageBody = `GoLokol: You're RSVP'd for ${eventTitle}. Show this QR at the door to unlock the After Party: ${qrUrl}`;
    
    console.log("[TWILIO] Sending SMS:", {
      to: normalizedPhone,
      sender: senderConfig,
      bodyLength: messageBody.length
    });

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("To", normalizedPhone);
    if (senderConfig.From) {
      formData.append("From", senderConfig.From);
    }
    if (senderConfig.MessagingServiceSid) {
      formData.append("MessagingServiceSid", senderConfig.MessagingServiceSid);
    }
    formData.append("Body", messageBody);

    try {
      const response = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseText = await response.text();
      console.log("[TWILIO] Response status:", response.status);
      console.log("[TWILIO] Response body:", responseText);

      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log("[TWILIO] SUCCESS - Message SID:", result.sid);
        return new Response(
          JSON.stringify({ ok: true, to: normalizedPhone, sid: result.sid }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        let errorMessage = responseText;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorJson.error_message || responseText;
          console.error("[TWILIO] ERROR object:", JSON.stringify(errorJson, null, 2));
        } catch {
          console.error("[TWILIO] ERROR raw:", responseText);
        }
        return new Response(
          JSON.stringify({ ok: false, error: errorMessage }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } catch (twilioError: any) {
      console.error("[TWILIO] EXCEPTION:", twilioError);
      console.error("[TWILIO] EXCEPTION message:", twilioError.message);
      console.error("[TWILIO] EXCEPTION stack:", twilioError.stack);
      return new Response(
        JSON.stringify({ ok: false, error: twilioError.message || "Twilio request failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("[HANDLER] Unhandled error:", error);
    console.error("[HANDLER] Error message:", error.message);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
