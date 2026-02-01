import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Bookmark, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Section components
import StatusBar from "@/components/artist/StatusBar";
import PaymentsAndPricingSection from "@/components/PaymentsAndPricingSection";
import PromoteSection from "@/components/artist/PromoteSection";
import DoorSection from "@/components/artist/DoorSection";
import RoomControlsSection from "@/components/artist/RoomControlsSection";
import MoneyMadeSection from "@/components/artist/MoneyMadeSection";

interface EventData {
  id: string;
  title: string;
  artist_name: string | null;
  pinned_message: string | null;
  youtube_url: string | null;
  image_url: string | null;
  livestream_url: string | null;
  start_at: string;
  city: string | null;
  venue_name: string | null;
  merch_link: string | null;
  music_link: string | null;
  after_party_opens_at: string | null;
  after_party_expires_at: string | null;
  stripe_account_id: string | null;
  pricing_mode: string | null;
  fixed_price: number | null;
  min_price: number | null;
  pricing_locked_at: string | null;
}

interface Message {
  id: string;
  message: string | null;
  role: string;
  created_at: string;
  attendee_id: string;
}

type StripeStatus = "loading" | "not_connected" | "action_required" | "connected";

const ArtistEvent = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const isWelcome = searchParams.get("welcome") === "true";
  const stripeConnected = searchParams.get("stripe_connected") === "true";
  const stripeRefresh = searchParams.get("stripe_refresh") === "true";

  const [event, setEvent] = useState<EventData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("loading");

  // Fetch event with hybrid auth (token OR logged-in user)
  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const params = new URLSearchParams({ event_id: eventId });
      if (token) params.set("token", token);

      const { data, error } = await supabase.functions.invoke(
        `artist-get-event?${params.toString()}`,
        {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : undefined,
        }
      );

      if (error) throw error;
      if (data?.error === "Not authorized") {
        setAuthorized(false);
        return;
      }
      setEvent(data.event);
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  const fetchCheckedInCount = useCallback(async () => {
    if (!eventId) return;
    const { count } = await supabase
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .not("checked_in_at", "is", null);
    setCheckedInCount(count || 0);
  }, [eventId]);

  // Check Stripe status
  const checkStripeStatus = useCallback(async () => {
    if (!event?.stripe_account_id) {
      setStripeStatus("not_connected");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-stripe-account-status", {
        body: { event_id: eventId, token },
      });
      if (error) throw error;
      setStripeStatus(data.status || "action_required");
    } catch (err) {
      console.error("Stripe status check failed:", err);
      setStripeStatus("action_required");
    }
  }, [event?.stripe_account_id, eventId, token]);

  useEffect(() => {
    fetchEvent();
    fetchCheckedInCount();
  }, [fetchEvent, fetchCheckedInCount]);

  useEffect(() => {
    if (event) {
      checkStripeStatus();
    }
  }, [event, checkStripeStatus]);

  // Welcome toast
  useEffect(() => {
    if (isWelcome && event) {
      toast.success("Your After Party is live!", {
        description: "Bookmark this page and share the link with your fans.",
        duration: 5000,
      });
    }
  }, [isWelcome, event]);

  // Stripe callback handling
  useEffect(() => {
    if (stripeConnected && event) {
      toast.success("Stripe connected!", {
        description: "You can now set up paid access for your After Party.",
        duration: 5000,
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("stripe_connected");
      window.history.replaceState({}, "", newUrl.toString());
      checkStripeStatus();
    }
    if (stripeRefresh && event) {
      toast.info("Stripe onboarding incomplete", {
        description: "Click 'Connect payouts' to continue setup.",
        duration: 5000,
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("stripe_refresh");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [stripeConnected, stripeRefresh, event, checkStripeStatus]);

  const handleCheckin = () => {
    fetchCheckedInCount();
    fetchEvent();
  };

  const handleEventUpdate = () => {
    fetchEvent();
    checkStripeStatus();
  };

  const isExpired = event?.after_party_expires_at
    ? new Date(event.after_party_expires_at) <= new Date()
    : false;

  if (!token || !authorized) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Not authorized</h1>
            <p className="text-muted-foreground font-sans text-base">You do not have access to this page.</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground font-sans text-base">Loading...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const artistName = event?.artist_name || "Your";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Status Bar - Sticky */}
      <StatusBar
        artistName={artistName}
        expiresAt={event?.after_party_expires_at || null}
        checkedInCount={checkedInCount}
        stripeStatus={stripeStatus}
      />

      {/* Header */}
      <section className="pt-6 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Bookmark tip */}
          <div className="flex items-start gap-3 mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg">
            <Bookmark className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-sans text-foreground">
              <strong>Bookmark this page.</strong> This is your control room for promoting and managing your After Party.{" "}
              <Link to="/how-to-golokol" className="text-primary hover:underline">FAQ</Link>
            </p>
          </div>

          {/* Quick intro video - collapsed by default on mobile */}
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 text-sm font-sans mb-2">
              <ExternalLink className="w-4 h-4" />
              <span>Watch: How to use the Control Room (2 min)</span>
            </summary>
            <div className="aspect-video w-full rounded-lg overflow-hidden mt-2">
              <iframe
                src="https://www.youtube.com/embed/pKD4IptzlTg"
                title="How to use the Artist Control Room"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </details>
        </div>
      </section>

      {/* SECTION 1: STATUS - Handled by StatusBar above */}

      {/* SECTION 2: PAYMENTS & PRICING */}
      {event && eventId && token && (
        <section className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <PaymentsAndPricingSection
              eventId={eventId}
              token={token}
              stripeAccountId={event.stripe_account_id}
              fixedPrice={event.fixed_price}
              pricingLockedAt={event.pricing_locked_at}
              onUpdate={handleEventUpdate}
            />
          </div>
        </section>
      )}

      {/* SECTION 3: PROMOTE */}
      {eventId && event && (
        <section className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <PromoteSection
              eventId={eventId}
              artistName={artistName}
              fixedPrice={event.fixed_price}
            />
          </div>
        </section>
      )}

      {/* SECTION 4: DOOR (CHECK-IN) */}
      {eventId && token && (
        <section className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <DoorSection
              eventId={eventId}
              token={token}
              isExpired={isExpired}
              onCheckin={handleCheckin}
            />
          </div>
        </section>
      )}

      {/* SECTION 5: ROOM CONTROLS */}
      {eventId && token && event && (
        <section className="px-4 pb-4">
          <div className="max-w-4xl mx-auto">
            <RoomControlsSection
              eventId={eventId}
              token={token}
              pinnedMessage={event.pinned_message || ""}
              livestreamUrl={event.livestream_url || ""}
              merchLink={event.merch_link || ""}
              musicLink={event.music_link || ""}
              messages={messages}
              onUpdate={handleEventUpdate}
            />
          </div>
        </section>
      )}

      {/* SECTION 6: MONEY MADE */}
      {eventId && (
        <section className="px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <MoneyMadeSection eventId={eventId} />
          </div>
        </section>
      )}

      {/* Educational video section - optional deep dive */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <details className="group">
            <summary className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 text-sm font-sans">
              <ExternalLink className="w-4 h-4" />
              <span>Watch: How to promote your After Party (tips)</span>
            </summary>
            <div className="aspect-video w-full rounded-lg overflow-hidden mt-3 border border-primary/30">
              <iframe
                src="https://www.youtube.com/embed/6Q7AZCHm8OE?rel=0"
                title="How to Promote Your After Party"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </details>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistEvent;
