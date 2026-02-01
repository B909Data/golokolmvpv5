import { useEffect, useState, useCallback, useLayoutEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Components
import StatusBar from "@/components/artist/StatusBar";
import ControlRoomTabs, { TabId } from "@/components/artist/ControlRoomTabs";
import HomeTab from "@/components/artist/tabs/HomeTab";
import GetPaidTab from "@/components/artist/tabs/GetPaidTab";
import PromoteTab from "@/components/artist/tabs/PromoteTab";
import CheckInTab from "@/components/artist/tabs/CheckInTab";
import AfterPartyTab from "@/components/artist/tabs/AfterPartyTab";

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
  const [activeTab, setActiveTab] = useState<TabId>("home");

  // Helps avoid tab body being partially hidden under the sticky header stack
  // after a tab switch (some browsers adjust scroll/focus subtly on tap).
  const headerStackRef = useRef<HTMLDivElement | null>(null);
  const tabBodyTopRef = useRef<HTMLDivElement | null>(null);
  const [tabBodyScrollMarginTop, setTabBodyScrollMarginTop] = useState(0);

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

  useLayoutEffect(() => {
    const compute = () => {
      const nav = document.querySelector("nav");
      const navH = nav?.getBoundingClientRect().height ?? 0;
      const headerH = headerStackRef.current?.getBoundingClientRect().height ?? 0;
      // A little extra breathing room so the first card isn't tight to the tabs.
      setTabBodyScrollMarginTop(Math.ceil(navH + headerH + 12));
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Ensure the tab content starts fully below the sticky header stack.
    requestAnimationFrame(() => {
      tabBodyTopRef.current?.scrollIntoView({ block: "start" });
    });
  };

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

      {/*
        Navbar is fixed, so reserve its height in normal flow.
        This prevents the Control Room header (StatusBar + Tabs) and tab content
        from rendering underneath the browser/nav frame (esp. iOS Safari).
      */}
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-top))]" />

      {/* Control Room header stack (sticky as one unit) */}
      <div
        ref={headerStackRef}
        className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-40"
      >
        <StatusBar
          artistName={artistName}
          expiresAt={event?.after_party_expires_at || null}
          checkedInCount={checkedInCount}
          stripeStatus={stripeStatus}
        />

        <ControlRoomTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Scroll anchor for tab content; scroll-margins keep it below sticky header */}
      <div
        ref={tabBodyTopRef}
        aria-hidden
        style={{ scrollMarginTop: `${tabBodyScrollMarginTop}px` }}
      />

      {/* Bookmark tip - only on Home tab */}
      {activeTab === "home" && (
        <section className="px-4 pt-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <Bookmark className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-foreground">
                <strong>Bookmark this page.</strong> This is your control room.{" "}
                <Link to="/how-to-golokol" className="text-primary hover:underline">FAQ</Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tab Content */}
      <section className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {activeTab === "home" && eventId && (
            <HomeTab
              eventId={eventId}
              stripeStatus={stripeStatus}
              fixedPrice={event?.fixed_price || null}
              onSwitchTab={handleTabChange}
            />
          )}

          {activeTab === "get-paid" && eventId && token && event && (
            <GetPaidTab
              eventId={eventId}
              token={token}
              stripeAccountId={event.stripe_account_id}
              fixedPrice={event.fixed_price}
              pricingLockedAt={event.pricing_locked_at}
              onUpdate={handleEventUpdate}
            />
          )}

          {activeTab === "promote" && eventId && event && (
            <PromoteTab
              eventId={eventId}
              artistName={artistName}
              fixedPrice={event.fixed_price}
            />
          )}

          {activeTab === "check-in" && eventId && token && (
            <CheckInTab
              eventId={eventId}
              token={token}
              isExpired={isExpired}
              onCheckin={handleCheckin}
            />
          )}

          {activeTab === "after-party" && eventId && token && event && (
            <AfterPartyTab
              eventId={eventId}
              token={token}
              pinnedMessage={event.pinned_message || ""}
              livestreamUrl={event.livestream_url || ""}
              merchLink={event.merch_link || ""}
              musicLink={event.music_link || ""}
              messages={messages}
              onUpdate={handleEventUpdate}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistEvent;
