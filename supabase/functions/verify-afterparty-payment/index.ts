import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to send MailerLite notification (non-blocking)
async function sendMailerLiteNotification(
  eventId: string,
  email: string,
  artistAccessToken: string,
  artistName?: string,
  eventTitle?: string
): Promise<void> {
  try {
    const baseUrl = "https://golokol.app";
    const artistControlUrl = `${baseUrl}/artist/event/${eventId}?token=${artistAccessToken}`;
    const afterPartyShareUrl = `${baseUrl}/after-party/${eventId}/rsvp`;

    const apiKey = Deno.env.get("MAILERLITE_API_KEY");
    const groupId = Deno.env.get("MAILERLITE_GROUP_ID_AFTER_PARTY_CREATED");

    if (!apiKey || !groupId) {
      console.log("MailerLite not configured, skipping notification");
      return;
    }

    // Upsert subscriber
    const subscriberPayload: Record<string, unknown> = {
      email,
      fields: {
        artist_control_url: artistControlUrl,
        after_party_share_url: afterPartyShareUrl,
      },
    };

    if (artistName) {
      subscriberPayload.fields = { ...subscriberPayload.fields as object, name: artistName };
    }
    if (eventTitle) {
      subscriberPayload.fields = { ...subscriberPayload.fields as object, event_title: eventTitle };
    }

    console.log("Sending MailerLite notification to:", email);

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
      return;
    }

    const subscriberId = upsertData.data?.id;
    if (!subscriberId) {
      console.error("No subscriber ID returned");
      return;
    }

    // Add to group
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

    if (groupResponse.ok) {
      console.log("MailerLite notification sent successfully");
    } else {
      const groupError = await groupResponse.json();
      console.error("MailerLite group add error:", groupError);
    }
  } catch (err) {
    console.error("MailerLite notification error (non-blocking):", err);
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, artist_user_id } = await req.json();
    console.log("Verifying payment for session:", session_id);

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    // Create Supabase client with service role for secure operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Stripe idempotency: Check if this session was already processed
    // Look for an event that has after_party_enabled=true and was created from this session
    // We need to check the metadata to see if this session was already processed
    // Since events don't store stripe_session_id, we'll check by fetching the session first
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the Checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("Session status:", session.payment_status);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const eventId = session.metadata?.event_id;
    if (!eventId) {
      throw new Error("No event_id in session metadata");
    }

    // Fetch the event to check current state
    const { data: existingEvent, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("id, title, artist_name, start_at, city, venue_name, after_party_enabled, artist_access_token, artist_user_id")
      .eq("id", eventId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Failed to fetch event: ${fetchError.message}`);
    }

    // Stripe idempotency: If already enabled, return success without side effects
    if (existingEvent.after_party_enabled) {
      console.log("Event already enabled, returning existing data (idempotent)");
      return new Response(JSON.stringify({ 
        success: true, 
        already_processed: true,
        event: {
          id: existingEvent.id,
          title: existingEvent.title,
          artist_name: existingEvent.artist_name,
          start_at: existingEvent.start_at,
          city: existingEvent.city,
          venue_name: existingEvent.venue_name,
          artist_access_token: existingEvent.artist_access_token,
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Enabling after party for event:", eventId);

    // Artist access token stability: Only generate if null, never overwrite
    const artistAccessToken = existingEvent.artist_access_token || crypto.randomUUID();

    // Update event to enable after party and set artist token (if new)
    const updateData: Record<string, unknown> = { after_party_enabled: true, payment_status: "paid" };
    if (!existingEvent.artist_access_token) {
      updateData.artist_access_token = artistAccessToken;
    }
    // Assign artist_user_id if provided and not already set (Phase 1 ownership)
    if (artist_user_id && !existingEvent.artist_user_id) {
      updateData.artist_user_id = artist_user_id;
      console.log("Assigning artist_user_id:", artist_user_id);
    }

    const { data: event, error: updateError } = await supabaseAdmin
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error(`Failed to enable after party: ${updateError.message}`);
    }

    // Mark discount code as used atomically if one was applied
    const discountCode = session.metadata?.discount_code;
    if (discountCode) {
      const customerEmail = session.customer_email || session.customer_details?.email;
      
      // Atomic update: only mark as used if still unused (prevents double-use)
      const { data: updatedCode, error: codeUpdateError } = await supabaseAdmin
        .from("afterparty_discount_codes")
        .update({ 
          used_at: new Date().toISOString(), 
          used_by_email: customerEmail,
          event_id: eventId
        })
        .eq("code", discountCode.toUpperCase())
        .is("used_at", null)
        .select()
        .single();
      
      if (updatedCode) {
        console.log("Marked discount code as used:", discountCode, "for event:", eventId);
      } else if (codeUpdateError) {
        // Code was already used - this is expected for idempotent calls
        console.log("Discount code already marked as used:", discountCode);
      }
    }

    console.log("After party enabled for event:", event.id);

    // Send MailerLite notification if confirmation email was provided
    const confirmationEmail = session.metadata?.confirmation_email;
    let emailSent = false;
    if (confirmationEmail) {
      const artistName = session.metadata?.artist_name;
      const eventTitle = session.metadata?.event_title;
      
      // Fire and forget - don't block the response
      sendMailerLiteNotification(
        event.id,
        confirmationEmail,
        artistAccessToken,
        artistName || undefined,
        eventTitle || undefined
      ).catch(err => console.error("MailerLite error (non-blocking):", err));
      
      emailSent = true;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      email_sent: emailSent,
      event: {
        id: event.id,
        title: event.title,
        artist_name: event.artist_name,
        start_at: event.start_at,
        city: event.city,
        venue_name: event.venue_name,
        artist_access_token: artistAccessToken,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in verify-afterparty-payment:", error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});