import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AfterPartyCard from "@/components/AfterPartyCard";
import { CheckCircle } from "lucide-react";

const RSVPAfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pwywAmount, setPwywAmount] = useState("");

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at, city, venue_name, ticket_url, artist_name, genres, youtube_url, image_url, pricing_mode, fixed_price, min_price, stripe_account_id")
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

  // Explicit paid event detection - fully configured for payment
  const isPaidEvent = useMemo(() => {
    if (!event) return false;
    return (
      (event.pricing_mode === "fixed" || event.pricing_mode === "pwyw") &&
      !!event.stripe_account_id &&
      (event.pricing_mode === "fixed" ? !!event.fixed_price : !!event.min_price)
    );
  }, [event]);

  // Stripe connected but pricing not fully configured = blocked state
  const isPricingIncomplete = useMemo(() => {
    return isStripeConnected && !isPaidEvent;
  }, [isStripeConnected, isPaidEvent]);

  // Format price for display
  const displayPrice = useMemo(() => {
    if (!event || !isPaidEvent) return null;
    if (event.pricing_mode === "fixed" && event.fixed_price) {
      return `$${(event.fixed_price / 100).toFixed(2)}`;
    }
    if (event.pricing_mode === "pwyw" && event.min_price) {
      return `$${(event.min_price / 100).toFixed(2)}+`;
    }
    return null;
  }, [event, isPaidEvent]);

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
    // Set default PWYW amount if applicable
    if (event?.pricing_mode === "pwyw" && event.min_price) {
      setPwywAmount((event.min_price / 100).toFixed(2));
    }
    // Scroll to form after state update
    setTimeout(() => {
      document.getElementById("rsvp-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventId || !event) return;

    // Validate PWYW amount if applicable
    if (isPaidEvent && event.pricing_mode === "pwyw") {
      const amountCents = Math.round(parseFloat(pwywAmount) * 100);
      if (isNaN(amountCents) || amountCents <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid payment amount.",
          variant: "destructive",
        });
        return;
      }
      if (event.min_price && amountCents < event.min_price) {
        toast({
          title: "Amount too low",
          description: `Minimum amount is $${(event.min_price / 100).toFixed(2)}`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Generate QR token client-side
      const qrToken = crypto.randomUUID();

      // Create attendee record
      const { data: attendee, error: insertError } = await supabase
        .from("attendees")
        .insert({
          event_id: eventId,
          display_name: displayName.trim() || null,
          checkin_method: "qr",
          qr_token: qrToken,
          payment_status: isPaidEvent ? "pending" : "free",
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Store attendee ID and qr_token for later use
      localStorage.setItem(`attendee_${eventId}`, attendee.id);
      localStorage.setItem(`attendee_qr_${eventId}`, qrToken);

      // If paid event, redirect to Stripe checkout
      if (isPaidEvent) {
        const pwywAmountCents = event.pricing_mode === "pwyw" 
          ? Math.round(parseFloat(pwywAmount) * 100) 
          : undefined;

        const { data, error } = await supabase.functions.invoke("create-fan-checkout", {
          body: {
            eventId,
            attendeeId: attendee.id,
            origin: window.location.origin,
            qrToken,
            pwywAmountCents,
          },
        });

        if (error || !data?.url) {
          console.error("Checkout error:", error, data);
          toast({
            title: "Payment setup failed",
            description: data?.error || "Could not create checkout session. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Try to open in new tab, fallback to redirect
        const newWindow = window.open(data.url, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          // Popup blocked - show fallback link
          toast({
            title: "Popup blocked",
            description: "Click the link below to complete payment.",
          });
          // Store URL for manual navigation
          localStorage.setItem(`checkout_url_${eventId}`, data.url);
          window.location.href = data.url;
        }
      } else if (!isStripeConnected) {
        // Truly free event (no Stripe connected) - navigate directly to pass page
        navigate(`/after-party/${eventId}/pass?token=${qrToken}`);
      } else {
        // Should never reach here - Stripe connected but not paid means incomplete
        toast({
          title: "Configuration error",
          description: "This event's payment setup is incomplete.",
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
                  RSVP. download your access pass.
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
                ? "This artist hasn't enabled paid After Party access yet." 
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
                    {event?.pricing_mode === "fixed" ? `Price: ${displayPrice}` : `Minimum: ${displayPrice}`}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* PWYW amount input */}
                {isPaidEvent && event?.pricing_mode === "pwyw" && (
                  <div className="space-y-2">
                    <Label htmlFor="pwywAmount" className="text-foreground font-sans">
                      Your Amount (min ${event.min_price ? (event.min_price / 100).toFixed(2) : "1.00"})
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="pwywAmount"
                        type="number"
                        step="0.01"
                        min={event.min_price ? (event.min_price / 100).toFixed(2) : "1.00"}
                        placeholder={(event.min_price ? event.min_price / 100 : 1).toFixed(2)}
                        value={pwywAmount}
                        onChange={(e) => setPwywAmount(e.target.value)}
                        className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans pl-8"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans"
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isPaidEvent ? "Redirecting to payment..." : "Getting your pass...")
                    : (isPaidEvent 
                        ? (event?.pricing_mode === "fixed" && displayPrice 
                            ? `Pay ${displayPrice} to Join` 
                            : "Pay to Join")
                        : "Get My Pass")
                  }
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RSVPAfterParty;
