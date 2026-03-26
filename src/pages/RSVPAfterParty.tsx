import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AfterPartyCard from "@/components/AfterPartyCard";
import CheckoutFallbackBanner from "@/components/CheckoutFallbackBanner";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { CheckCircle } from "lucide-react";

const RSVPAfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isAtShowPayment = searchParams.get("source") === "merch";
  
  const [displayName, setDisplayName] = useState("");
  const [purchaseEmail, setPurchaseEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  
  // Use the shared checkout hook for popup fallback
  const { checkoutUrl, showFallback, openCheckout, dismissFallback } = useStripeCheckout();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at, city, venue_name, ticket_url, artist_name, genres, youtube_url, image_url, pricing_mode, fixed_price, min_price, stripe_account_id, status")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  // Check if Stripe is connected (artist has started monetization)
  const isStripeConnected = useMemo(() => {
    return !!event?.stripe_account_id;
  }, [event]);

  // Does the event have a price set?
  const hasPriceSet = useMemo(() => {
    return !!event?.fixed_price && event.fixed_price >= 100;
  }, [event]);

  // Paid event = stripe connected AND fixed_price >= 100
  const isPaidEvent = useMemo(() => {
    if (!event) return false;
    return isStripeConnected && hasPriceSet;
  }, [event, isStripeConnected, hasPriceSet]);

  // Blocked: price is set but Stripe not connected, OR Stripe connected but no price
  // In both cases, fan should NOT get a free pass
  const isPricingIncomplete = useMemo(() => {
    if (!event) return false;
    // Price set but no Stripe = artist hasn't connected payouts yet
    if (hasPriceSet && !isStripeConnected) return true;
    // Stripe connected but no price = artist hasn't set pricing yet
    if (isStripeConnected && !hasPriceSet) return true;
    return false;
  }, [event, hasPriceSet, isStripeConnected]);

  // Format price for display
  const displayPrice = useMemo(() => {
    if (!event || !isPaidEvent || !event.fixed_price) return null;
    return `$${(event.fixed_price / 100).toFixed(2)}`;
  }, [event, isPaidEvent]);

  // Logging: fan page load diagnostics
  useEffect(() => {
    if (!event) return;
    console.log("[FanRSVP] Page load:", {
      eventId: event.id,
      fixedPrice: event.fixed_price,
      stripeAccountId: event.stripe_account_id,
      hasPriceSet,
      isStripeConnected,
      isPaidEvent,
      isPricingIncomplete,
    });
  }, [event, hasPriceSet, isStripeConnected, isPaidEvent, isPricingIncomplete]);

  const handleRsvpClick = () => {
    // Block if Stripe connected but pricing not complete
    if (isPricingIncomplete) {
      toast({
        title: "Not available yet",
        description: "This artist hasn't finished setting up paid access.",
        variant: "destructive",
      });
      return;
    }

    setShowForm(true);
    // Scroll to form after state update
    setTimeout(() => {
      document.getElementById("rsvp-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventId || !event) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!purchaseEmail.trim() || !emailRegex.test(purchaseEmail.trim())) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate QR token and access token client-side
      const qrToken = crypto.randomUUID();
      const accessToken = crypto.randomUUID() + "-" + crypto.randomUUID();

      // Create attendee record
      const { data: attendee, error: insertError } = await supabase
        .from("attendees")
        .insert({
          event_id: eventId,
          display_name: displayName.trim() || null,
          checkin_method: "qr",
          qr_token: qrToken,
          payment_status: isPaidEvent ? "pending" : "free",
          purchase_email: purchaseEmail.trim(),
          access_token: accessToken,
        } as any)
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Store attendee ID and qr_token for later use
      localStorage.setItem(`attendee_${eventId}`, attendee.id);
      localStorage.setItem(`attendee_qr_${eventId}`, qrToken);

      // If paid event, redirect to Stripe checkout (or handle free promo)
      if (isPaidEvent) {
        console.log("[FanRSVP] Paid event — creating checkout session", { eventId, attendeeId: attendee.id, promoCode: promoCode.trim() || "none" });

        const { data, error } = await supabase.functions.invoke("create-fan-checkout", {
          body: {
            eventId,
            attendeeId: attendee.id,
            origin: window.location.origin,
            qrToken,
            accessToken,
            promoCode: promoCode.trim() || undefined,
          },
        });

        if (error || (!data?.url && !data?.free)) {
          console.error("[FanRSVP] Checkout error:", error, data);
          toast({
            title: data?.error ? "Promo code error" : "Payment setup failed",
            description: data?.error || "Could not create checkout session. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // FREE promo code path - immediate redirect to pass
        if (data.free && data.redirectUrl) {
          console.log("[FanRSVP] Free promo redeemed, redirecting to pass");
          navigate(data.redirectUrl.replace(window.location.origin, ""));
          return;
        }

        // Stripe checkout path - use the new hook
        console.log("[FanRSVP] Opening Stripe checkout");
        openCheckout(data.url);
      } else if (!hasPriceSet && !isStripeConnected) {
        // Truly free event (no price AND no Stripe) - navigate directly to pass page
        console.log("[FanRSVP] Free event (no price, no Stripe), navigating to pass");
        navigate(`/after-party/${eventId}/pass?token=${accessToken}`);
      } else {
        // Price set but Stripe not connected, or vice versa — should have been blocked earlier
        console.log("[FanRSVP] Configuration incomplete:", { hasPriceSet, isStripeConnected });
        toast({
          title: "Not available yet",
          description: "This After Party is not ready for paid passes yet.",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error("RSVP error:", error);
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "RSVP failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-sans">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-sans">Event not found.</p>
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
          {/* Hero / Intro Section */}
          <div className="text-center mb-10">
            {/* Primary Header - Two-color emphasis */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase mb-4">
              <span className="text-foreground">{event.artist_name || event.title} </span>
              <span className="text-primary">AFTER PARTY</span>
            </h1>
            
            {/* Subcaption */}
            <p className="text-muted-foreground text-lg font-sans mb-8">
              Find me on GoLokol after my next show.
            </p>
            
          {/* Value Bullets */}
            <div className="text-left space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-foreground font-sans">
                  Pay, download and save your access pass.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-foreground font-sans">
                  Show your pass at the show.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-foreground font-sans">
                  Get access to 24 hours of after show glow.
                </p>
              </div>
            </div>
          </div>

          {/* RSVP Card Section */}
          <div className="mb-8">
            <AfterPartyCard
              id={event.id}
              title={event.title}
              artistName={event.artist_name}
              startAt={event.start_at}
              city={event.city}
              genres={event.genres}
              youtubeUrl={event.youtube_url}
              imageUrl={event.image_url}
              showRsvpButton={!showForm}
              onRsvpClick={handleRsvpClick}
              ctaText={isPricingIncomplete 
                ? "Not Available Yet" 
                : isPaidEvent 
                  ? "Pay for Pass" 
                  : "Get Your Pass"
              }
              isBlocked={isPricingIncomplete}
              blockedMessage={isPricingIncomplete 
                ? hasPriceSet 
                  ? "This After Party is not ready for paid passes yet. The artist needs to connect payouts."
                  : "This artist hasn't finished setting up paid access."
                : undefined
              }
            />
          </div>

          {/* RSVP Form - Shows after clicking RSVP on card, never if blocked */}
          {showForm && !isPricingIncomplete && (
            <div id="rsvp-form" className="rounded-xl border-2 border-primary bg-background p-6">
              <h2 className="font-display text-xl text-primary mb-4 uppercase">
                {isPaidEvent ? "Complete your purchase" : "Put your name on the list"}
              </h2>
              
              {/* Price display for paid events */}
              {isPaidEvent && displayPrice && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-foreground font-sans text-lg font-semibold">
                    Price: {displayPrice}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="purchaseEmail" className="text-foreground font-sans">Email</Label>
                  <Input
                    id="purchaseEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={purchaseEmail}
                    onChange={(e) => setPurchaseEmail(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-foreground font-sans">Your Name (optional)</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                  />
                </div>

                {/* Promo code input for paid events */}
                {isPaidEvent && (
                  <div className="space-y-2">
                    <Label htmlFor="promoCode" className="text-foreground font-sans">Promo Code (optional)</Label>
                    <Input
                      id="promoCode"
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans uppercase"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isPaidEvent ? "Opening checkout..." : "Getting your pass...")
                    : (isPaidEvent 
                        ? (displayPrice ? `Pay ${displayPrice} to Join` : "Pay to Join")
                        : "Get My Pass")
                  }
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
      
      {/* Checkout Fallback Banner */}
      <CheckoutFallbackBanner
        checkoutUrl={checkoutUrl}
        isVisible={showFallback}
        onClose={dismissFallback}
      />
      
      <Footer />
    </div>
  );
};

export default RSVPAfterParty;
