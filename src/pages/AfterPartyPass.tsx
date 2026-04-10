import { useRef, useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Copy, Share2, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { QRCodeCanvas } from "qrcode.react";

type ActivationState =
  | { status: "loading" }
  | { status: "activated"; attendeeId: string; eventId: string; displayName: string | null; qrToken: string | null }
  | { status: "already_activated" }
  | { status: "expired" }
  | { status: "invalid" }
  | { status: "error"; message: string }
  | { status: "legacy"; attendeeId: string; qrToken: string }; // fallback for old qr_token links

const AfterPartyPass = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const accessToken = searchParams.get("token");
  
  // Legacy support: check for old qr_token-based links stored in localStorage
  const storedQrToken = eventId ? localStorage.getItem(`attendee_qr_${eventId}`) : null;

  const [activation, setActivation] = useState<ActivationState>({ status: "loading" });

  // Activate pass via edge function (access_token flow)
  useEffect(() => {
    if (!accessToken) {
      // No access token in URL — check for legacy qr_token
      if (storedQrToken && eventId) {
        setActivation({ status: "legacy", attendeeId: "", qrToken: storedQrToken });
      } else {
        setActivation({ status: "invalid" });
      }
      return;
    }

    let cancelled = false;

    const activate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("activate-pass", {
          body: { accessToken },
        });

        if (cancelled) return;

        if (error) {
          // Try to parse the error body
          const body = typeof error === "object" && "message" in error ? error.message : "";
          if (body.includes("ALREADY_ACTIVATED") || data?.code === "ALREADY_ACTIVATED") {
            setActivation({ status: "already_activated" });
          } else if (body.includes("EXPIRED") || data?.code === "EXPIRED") {
            setActivation({ status: "expired" });
          } else if (body.includes("NOT_FOUND") || data?.code === "NOT_FOUND") {
            setActivation({ status: "invalid" });
          } else {
            setActivation({ status: "error", message: data?.error || "Failed to activate pass" });
          }
          return;
        }

        if (data?.code === "ALREADY_ACTIVATED") {
          setActivation({ status: "already_activated" });
          return;
        }
        if (data?.code === "EXPIRED") {
          setActivation({ status: "expired" });
          return;
        }
        if (data?.code === "NOT_FOUND") {
          setActivation({ status: "invalid" });
          return;
        }

        if (data?.activated && data.attendee) {
          const a = data.attendee;
          // Store for room access
          if (a.event_id) {
            localStorage.setItem(`attendee_${a.event_id}`, a.id);
            if (a.qr_token) localStorage.setItem(`attendee_qr_${a.event_id}`, a.qr_token);
          }
          setActivation({
            status: "activated",
            attendeeId: a.id,
            eventId: a.event_id,
            displayName: a.display_name,
            qrToken: a.qr_token,
          });
        } else {
          setActivation({ status: "error", message: "Unexpected response" });
        }
      } catch (err) {
        if (!cancelled) {
          setActivation({ status: "error", message: "Network error. Please try again." });
        }
      }
    };

    activate();
    return () => { cancelled = true; };
  }, [accessToken, storedQrToken, eventId]);

  // For legacy flow, fetch attendee by qr_token
  const { data: legacyAttendee } = useQuery({
    queryKey: ["attendee-pass-legacy", eventId, storedQrToken],
    queryFn: async () => {
      if (!eventId || !storedQrToken) return null;
      const { data, error } = await (supabase as any)
        .from("attendees")
        .select("id, display_name, qr_token")
        .eq("event_id", eventId)
        .eq("qr_token", storedQrToken)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: activation.status === "legacy" && !!eventId && !!storedQrToken,
  });

  // Resolve effective attendee data
  const effectiveEventId = activation.status === "activated" ? activation.eventId : eventId;
  const effectiveQrToken = activation.status === "activated"
    ? activation.qrToken
    : activation.status === "legacy"
      ? storedQrToken
      : null;
  const effectiveDisplayName = activation.status === "activated"
    ? activation.displayName
    : legacyAttendee?.display_name || null;

  // Fetch event details
  const { data: event } = useQuery({
    queryKey: ["event-pass", effectiveEventId],
    queryFn: async () => {
      if (!effectiveEventId) throw new Error("No event ID");
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id, title, artist_name, ticket_url, start_at, city, venue_name")
        .eq("id", effectiveEventId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveEventId && (activation.status === "activated" || activation.status === "legacy"),
  });

  const verifyUrl = effectiveQrToken
    ? `${window.location.origin}/after-party/${effectiveEventId}/verify/${effectiveQrToken}`
    : "";
  const passUrl = window.location.href;

  const handleSavePass = async () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast({ title: "Failed to create pass image", variant: "destructive" });
        return;
      }
      const safeTitle = event?.title?.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "afterparty";
      const fileName = `golokol-pass-${safeTitle}.png`;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile && navigator.share && navigator.canShare) {
        try {
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file] });
            toast({ title: "Pass saved to photos!" });
            return;
          }
        } catch (err: any) {
          if (err.name === "AbortError") return;
        }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: "Pass saved", description: "Your QR pass has been downloaded." });
    }, "image/png");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(passUrl);
      toast({ title: "Link copied", description: "Bookmark this link to access your pass anytime." });
    } catch {
      toast({ title: "Failed to copy", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event?.title || "After Party",
      text: `RSVP for ${event?.title || "this After Party"}!`,
      url: `${window.location.origin}/after-party/${effectiveEventId}/rsvp`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast({ title: "Link copied", description: "Share this link with your friends!" });
    } catch {
      toast({ title: "Failed to copy", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  // --- RENDER STATES ---

  // Loading
  if (activation.status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-sans">Activating your pass...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Invalid token
  if (activation.status === "invalid") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-muted-foreground font-sans mb-4">Invalid or expired link.</p>
            {eventId && (
              <Button variant="outline" onClick={() => window.location.href = `/after-party/${eventId}/rsvp`}>
                RSVP for this event
              </Button>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Already activated
  if (activation.status === "already_activated") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Already Activated</h2>
            <p className="text-muted-foreground font-sans mb-4">
              This pass has already been activated. Each pass link can only be used once.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Expired
  if (activation.status === "expired") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Link Expired</h2>
            <p className="text-muted-foreground font-sans mb-4">This pass link has expired.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error
  if (activation.status === "error") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-destructive font-sans mb-4">{activation.message}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Legacy flow waiting for attendee data
  if (activation.status === "legacy" && !legacyAttendee) {
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

  // Show pass (activated or legacy)
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Your Pass</h1>
            <p className="text-muted-foreground font-sans">{event?.artist_name || event?.title}</p>
          </div>

          <div className="bg-card border-2 border-primary rounded-xl p-6 mb-6" data-ph-mask>
            <div className="flex flex-col items-center">
              {effectiveDisplayName && (
                <p className="text-foreground font-sans text-lg mb-4">{effectiveDisplayName}</p>
              )}
              {verifyUrl && (
                <div ref={qrRef} className="bg-white p-4 rounded-lg mb-4">
                  <QRCodeCanvas value={verifyUrl} size={200} level="H" includeMargin={false} />
                </div>
              )}
              <p className="text-muted-foreground font-sans text-sm text-center">
                Show this to band at merch table to get checked in
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="default" className="w-full" onClick={handleSavePass}>
              <Download className="h-4 w-4 mr-2" />Save Pass
            </Button>
            <Button variant="secondary" className="w-full" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />Copy Pass Link
            </Button>
            <p className="text-xs text-muted-foreground font-sans text-center">
              Bookmark this page to access your pass anytime.
            </p>
          </div>

          <div className="my-8 border-t border-border" />

          <div className="space-y-3">
            {event?.ticket_url && (
              <a href={event.ticket_url} target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="outline" className="w-full">
                  <Ticket className="h-4 w-4 mr-2" />Buy Ticket
                </Button>
              </a>
            )}
            <Button variant="outline" className="w-full" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />Share with a friend
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterPartyPass;
