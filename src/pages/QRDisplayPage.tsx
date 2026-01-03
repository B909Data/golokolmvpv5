import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const QRDisplayPage = () => {
  const { eventId, qrToken } = useParams<{ eventId: string; qrToken: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["qr-attendee", eventId, qrToken],
    queryFn: async () => {
      if (!eventId || !qrToken) throw new Error("Missing parameters");

      // Fetch attendee by eventId + qr_token
      const { data: attendee, error: attendeeError } = await supabase
        .from("attendees")
        .select("id, display_name, event_id")
        .eq("event_id", eventId)
        .eq("qr_token", qrToken)
        .maybeSingle();

      if (attendeeError) throw attendeeError;
      if (!attendee) return null;

      // Fetch event details
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, title")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      return { attendee, event };
    },
    enabled: !!eventId && !!qrToken,
  });

  const verifyUrl = `${window.location.origin}/after-party/${eventId}/verify/${qrToken}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-24 pb-24 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">QR not found</h1>
            <p className="text-muted-foreground">This QR code is invalid or has expired.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-md mx-auto w-full text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {data.event.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {data.attendee.display_name}
          </p>

          <div className="bg-white p-6 rounded-lg inline-block mb-8">
            <QRCodeSVG
              value={verifyUrl}
              size={240}
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Show this QR to the artist or door staff to unlock the After Party.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QRDisplayPage;
