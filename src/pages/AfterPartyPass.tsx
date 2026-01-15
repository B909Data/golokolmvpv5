import { useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Copy, Share2, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QRCodeCanvas } from "qrcode.react";

const AfterPartyPass = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  // Get token from URL first, then fallback to localStorage
  const urlToken = searchParams.get("token");
  const storedToken = eventId ? localStorage.getItem(`attendee_qr_${eventId}`) : null;
  const qrToken = urlToken || storedToken;

  // Fetch attendee by qr_token
  const { data: attendee, isLoading: isLoadingAttendee } = useQuery({
    queryKey: ["attendee-pass", eventId, qrToken],
    queryFn: async () => {
      if (!eventId || !qrToken) return null;
      const { data, error } = await supabase
        .from("attendees")
        .select("id, display_name, qr_token")
        .eq("event_id", eventId)
        .eq("qr_token", qrToken)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId && !!qrToken,
  });

  // Fetch event details
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event-pass", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("id, title, artist_name, ticket_url, start_at, city, venue_name")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Store token in localStorage if we got it from URL
  if (urlToken && eventId && attendee) {
    localStorage.setItem(`attendee_${eventId}`, attendee.id);
    localStorage.setItem(`attendee_qr_${eventId}`, urlToken);
  }

  const verifyUrl = `${window.location.origin}/after-party/${eventId}/verify/${qrToken}`;
  const passUrl = `${window.location.origin}/after-party/${eventId}/pass?token=${qrToken}`;

  const handleSavePass = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `golokol-pass-${event?.title || "afterparty"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast({
      title: "Pass saved",
      description: "Your QR pass has been downloaded.",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(passUrl);
      toast({
        title: "Link copied",
        description: "Bookmark this link to access your pass anytime.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event?.title || "After Party",
      text: `RSVP for ${event?.title || "this After Party"}!`,
      url: `${window.location.origin}/after-party/${eventId}/rsvp`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link copied",
        description: "Share this link with your friends!",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingAttendee || isLoadingEvent;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-sans">Loading your pass...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!attendee || !qrToken) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-muted-foreground font-sans mb-4">Pass not found.</p>
            <Button variant="outline" onClick={() => window.location.href = `/after-party/${eventId}/rsvp`}>
              RSVP for this event
            </Button>
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
        <div className="max-w-md mx-auto w-full">
          {/* Pass Header */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Your Pass
            </h1>
            <p className="text-muted-foreground font-sans">
              {event?.artist_name || event?.title}
            </p>
          </div>

          {/* QR Code Card */}
          <div className="bg-card border-2 border-primary rounded-xl p-6 mb-6" data-ph-mask>
            <div className="flex flex-col items-center">
              {/* Attendee Name */}
              {attendee.display_name && (
                <p className="text-foreground font-sans text-lg mb-4">
                  {attendee.display_name}
                </p>
              )}

              {/* QR Code */}
              <div ref={qrRef} className="bg-white p-4 rounded-lg mb-4">
                <QRCodeCanvas
                  value={verifyUrl}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Event Info */}
              <p className="text-muted-foreground font-sans text-sm text-center">
                Show this to band at merch table to get checked in
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="default"
              className="w-full"
              onClick={handleSavePass}
            >
              <Download className="h-4 w-4 mr-2" />
              Save Pass
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={handleCopyLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Pass Link
            </Button>

            <p className="text-xs text-muted-foreground font-sans text-center">
              Bookmark this page to access your pass anytime.
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-border" />

          {/* Share & Ticket Section */}
          <div className="space-y-3">
            {event?.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full">
                  <Ticket className="h-4 w-4 mr-2" />
                  Buy Ticket
                </Button>
              </a>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share with a friend
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterPartyPass;
