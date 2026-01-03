import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const VerifyQRPage = () => {
  const { eventId, qrToken } = useParams<{ eventId: string; qrToken: string }>();
  const [searchParams] = useSearchParams();
  const isAdmin = searchParams.get("admin") === "1";
  
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "unauthorized" | "invalid" | "already_checked_in" | "success"
  >("loading");
  const [attendeeName, setAttendeeName] = useState<string>("");

  // Check if user has admin access (either via ?admin=1 or role=artist)
  const attendeeId = eventId ? localStorage.getItem(`attendee_${eventId}`) : null;

  const { data: attendeeRole } = useQuery({
    queryKey: ["verify-attendee-role", attendeeId],
    queryFn: async () => {
      if (!attendeeId) return null;
      const { data } = await supabase
        .from("after_party_messages")
        .select("role")
        .eq("attendee_id", attendeeId)
        .limit(1)
        .maybeSingle();
      return data?.role || null;
    },
    enabled: !!attendeeId,
  });

  const isAuthorized = isAdmin || attendeeRole === "artist";

  useEffect(() => {
    const verifyAttendee = async () => {
      if (!eventId || !qrToken) {
        setVerificationStatus("invalid");
        return;
      }

      if (!isAuthorized) {
        setVerificationStatus("unauthorized");
        return;
      }

      try {
        // Fetch attendee by eventId + qr_token
        const { data: attendee, error } = await supabase
          .from("attendees")
          .select("id, display_name, phone, checked_in_at")
          .eq("event_id", eventId)
          .eq("qr_token", qrToken)
          .maybeSingle();

        if (error || !attendee) {
          setVerificationStatus("invalid");
          return;
        }

        setAttendeeName(attendee.display_name || "Guest");

        // Check if already checked in
        if (attendee.checked_in_at) {
          setVerificationStatus("already_checked_in");
          return;
        }

        // Update checked_in_at
        const { error: updateError } = await supabase
          .from("attendees")
          .update({ checked_in_at: new Date().toISOString() })
          .eq("id", attendee.id);

        if (updateError) {
          console.error("Failed to update check-in:", updateError);
          setVerificationStatus("invalid");
          return;
        }

        // Fetch event title for SMS
        const { data: event } = await supabase
          .from("events")
          .select("title")
          .eq("id", eventId)
          .single();

        // Send access granted SMS
        if (attendee.phone) {
          const roomUrl = `${window.location.origin}/after-party/${eventId}/room`;
          await supabase.functions.invoke("send-checkin-sms", {
            body: {
              phone: attendee.phone,
              eventTitle: event?.title || "After Party",
              roomUrl,
            },
          });
        }

        setVerificationStatus("success");
      } catch (err) {
        console.error("Verification error:", err);
        setVerificationStatus("invalid");
      }
    };

    // Wait for auth check to complete
    if (isAdmin || attendeeRole !== undefined) {
      verifyAttendee();
    }
  }, [eventId, qrToken, isAuthorized, isAdmin, attendeeRole]);

  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Verifying...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (verificationStatus === "unauthorized") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-24 px-4">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Not authorized</h1>
            <p className="text-muted-foreground">
              Only artists and staff can verify check-ins.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (verificationStatus === "invalid") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-24 px-4">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Invalid code</h1>
            <p className="text-muted-foreground">
              This QR code is invalid or has expired.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (verificationStatus === "already_checked_in") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-24 px-4">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Already checked in</h1>
            <p className="text-lg text-muted-foreground mb-2">{attendeeName}</p>
            <p className="text-sm text-muted-foreground">
              This attendee was already verified.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-24 pb-24 px-4">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Checked in: {attendeeName}</h1>
          <p className="text-muted-foreground">Access SMS sent.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyQRPage;
