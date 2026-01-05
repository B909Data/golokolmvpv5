import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Copy, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PUBLIC_BASE_URL = "https://golokol.app";

interface EventData {
  id: string;
  title: string;
  artist_name: string;
  start_at: string;
  city: string;
  venue_name: string;
  artist_access_token: string;
}

const CreateAfterpartySuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [event, setEvent] = useState<EventData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "verify-afterparty-payment",
          { body: { session_id: sessionId } }
        );

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        
        setEvent(data.event);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.message || "Failed to verify payment");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const publicRsvpUrl = event ? `${PUBLIC_BASE_URL}/after-party/${event.id}/rsvp` : "";
  const artistControlsUrl = event?.artist_access_token 
    ? `${PUBLIC_BASE_URL}/artist/event/${event.id}?token=${event.artist_access_token}` 
    : "";

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-sans">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="rounded-full bg-destructive/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">
              Verification Failed
            </h1>
            <p className="text-muted-foreground font-sans mb-6">{error}</p>
            <Link to="/create-afterparty">
              <Button variant="outline">Try Again</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6 border-2 border-primary">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl text-primary mb-2">
              You are Live
            </h1>
            <p className="text-muted-foreground font-sans">
              Your After Party is now listed and discoverable. Save these links.
            </p>
          </div>

          {event && (
            <div className="rounded-xl border-2 border-primary bg-background p-6 space-y-6">
              {/* Event Info */}
              <div>
                <h2 className="font-display text-2xl text-primary">{event.title}</h2>
                <p className="text-muted-foreground font-sans">
                  {event.artist_name} · {event.city}, {event.venue_name}
                </p>
              </div>

              <div className="space-y-6">
                {/* Share with Fans - Public RSVP Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary font-sans uppercase tracking-wide">
                    Share with Fans
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 rounded-md border-2 border-primary bg-background px-3 py-2 text-sm text-foreground font-sans flex items-center overflow-hidden">
                      <span className="truncate">{publicRsvpUrl}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(publicRsvpUrl, "Public RSVP link")}
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0">
                      <a href={publicRsvpUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Share this with fans to let them RSVP.
                  </p>
                </div>

                {/* Private - Artist Controls Link */}
                {artistControlsUrl && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary font-sans uppercase tracking-wide">
                      Private - Save This
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 rounded-md border-2 border-primary bg-background px-3 py-2 text-sm text-foreground font-sans flex items-center overflow-hidden">
                        <span className="truncate">{artistControlsUrl}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(artistControlsUrl, "Artist controls link")}
                        className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" asChild className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shrink-0">
                        <a href={artistControlsUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-sans">
                      Private link to manage your event, pin messages, and moderate chat.
                    </p>
                  </div>
                )}

              </div>

              {/* Support Line */}
              <div className="pt-4 border-t border-primary/30 text-center">
                <p className="text-xs text-muted-foreground font-sans">
                  Lost the link? Contact: support@golokol.app
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-primary/30">
                <Link to={`/after-party/${event.id}/room`} className="flex-1">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans">View Your After Party</Button>
                </Link>
                <Link to="/find-after-party" className="flex-1">
                  <Button variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-sans">
                    Browse All Events
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateAfterpartySuccess;