import { useState, useEffect } from "react";
import { DollarSign, CreditCard, Check, ExternalLink, Loader2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentsAndPricingSectionProps {
  eventId: string;
  token: string;
  stripeAccountId: string | null;
  fixedPrice: number | null;
  pricingLockedAt: string | null;
  onUpdate: () => void;
}

type StripeStatus = "not_connected" | "action_required" | "connected" | "loading";

const PaymentsAndPricingSection = ({
  eventId,
  token,
  stripeAccountId,
  fixedPrice,
  pricingLockedAt,
  onUpdate,
}: PaymentsAndPricingSectionProps) => {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("loading");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priceValue, setPriceValue] = useState<string>(
    fixedPrice ? (fixedPrice / 100).toFixed(2) : ""
  );

  // Check Stripe account status when component mounts or stripeAccountId changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!stripeAccountId) {
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
        console.error("Failed to check Stripe status:", err);
        setStripeStatus("action_required");
      }
    };

    checkStatus();
  }, [eventId, token, stripeAccountId]);

  // Update local state when props change
  useEffect(() => {
    setPriceValue(fixedPrice ? (fixedPrice / 100).toFixed(2) : "");
  }, [fixedPrice]);

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-connect-link", {
        body: { event_id: eventId, token },
      });

      if (error) throw error;

      if (data.already_connected) {
        toast.info("Stripe account already connected");
        onUpdate();
        return;
      }

      if (data.url) {
        const newWindow = window.open(data.url, "_blank");
        if (!newWindow) {
          toast.error("Popup blocked. Please allow popups for this site.");
        } else {
          toast.success("Complete Stripe onboarding in the new tab");
        }
      }
    } catch (err: any) {
      console.error("Stripe connect error:", err);
      toast.error(err.message || "Failed to connect Stripe");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSavePricing = async () => {
    const numericValue = parseFloat(priceValue);
    if (isNaN(numericValue) || numericValue < 1) {
      toast.error("Minimum price is $1.00");
      return;
    }

    const priceInCents = Math.round(numericValue * 100);

    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke("artist-update-event", {
        body: {
          event_id: eventId,
          token,
          pricing_mode: "fixed",
          fixed_price: priceInCents,
          min_price: null,
        },
      });

      if (error) throw error;
      toast.success("Price saved successfully");
      onUpdate();
    } catch (err: any) {
      console.error("Save pricing error:", err);
      toast.error(err.message || "Failed to save price");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isLocked = !!pricingLockedAt;

  return (
    <section className="px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black border border-primary/30 rounded-xl p-6 space-y-6">
          {/* Section Header */}
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h3 className="font-display text-xl text-primary uppercase tracking-wide">
              Payments & Pricing
            </h3>
          </div>

          <p className="text-muted-foreground text-base font-sans">
            Monetize your After Party. Fans pay you directly via Stripe.
          </p>

          {/* Loading State */}
          {stripeStatus === "loading" && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="font-sans text-base text-foreground">Checking Stripe status...</span>
              </div>
            </div>
          )}

          {/* STATE 1: Not Connected */}
          {stripeStatus === "not_connected" && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-destructive" />
                <h4 className="font-display text-lg text-destructive uppercase tracking-wide">
                  Stripe Not Connected
                </h4>
              </div>

              <div className="space-y-2 text-foreground text-base font-sans leading-relaxed">
                <p>Fans can't enter your After Party until Stripe is connected.</p>
                <p className="text-muted-foreground">Connect Stripe to start earning directly from fans.</p>
              </div>

              <Button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect Stripe
                  </>
                )}
              </Button>
            </div>
          )}

          {/* STATE 2: Action Required */}
          {stripeStatus === "action_required" && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                  <h4 className="font-display text-lg text-yellow-400 uppercase tracking-wide">
                    Stripe Needs More Info
                  </h4>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Action Needed
                </Badge>
              </div>

              <div className="space-y-2 text-foreground text-base font-sans leading-relaxed">
                <p>Stripe requires additional information to enable payouts.</p>
                <p className="text-muted-foreground">Once completed, payments unlock automatically.</p>
              </div>

              <Button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                className="bg-yellow-500 text-black hover:bg-yellow-400 text-base"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Complete Stripe Setup
                  </>
                )}
              </Button>
            </div>
          )}

          {/* STATE 3: Connected */}
          {stripeStatus === "connected" && (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-green-400" />
                  <h4 className="font-display text-lg text-green-400 uppercase tracking-wide">
                    Payments Enabled
                  </h4>
                </div>
                <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Stripe Connected
                </Badge>
              </div>

              <p className="text-foreground text-base font-sans mt-3">
                Fans can now pay to join your After Party.
              </p>
            </div>
          )}

          {/* PRICING SECTION - Always show when not loading */}
          {stripeStatus !== "loading" && (
            <div className="border-t border-primary/30 pt-6 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <Label className="text-base text-primary font-sans font-medium">
                  After Party Price
                </Label>
              </div>

              {/* Info note when Stripe not connected */}
              {stripeStatus === "not_connected" && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm font-sans">
                    Connect Stripe above to accept payments. You can still set pricing now.
                  </p>
                </div>
              )}

              {/* Locked State */}
              {isLocked ? (
                <div className="bg-primary/20 border border-primary/40 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-primary">
                    <Lock className="w-5 h-5" />
                    <span className="font-sans text-base font-medium">Price Locked</span>
                  </div>
                  <p className="text-primary/80 text-sm font-sans">
                    Price locked after first fan purchase.
                  </p>
                  {fixedPrice && (
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-foreground text-sm font-sans">
                        After Party Pass — <strong>{formatPrice(fixedPrice)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Label className="text-sm text-primary/80 font-sans">
                    Set After Party Price (USD)
                  </Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-sans text-lg">$</span>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        placeholder="5.00"
                        className="pl-8 bg-black/50 border-2 border-primary/30 focus:border-primary text-foreground font-sans text-base py-5"
                      />
                    </div>
                    <Button
                      onClick={handleSavePricing}
                      disabled={isSaving || !priceValue}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-base py-5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                  <p className="text-primary/60 text-xs font-sans">
                    Minimum $1.00. Price locks after the first fan purchase.
                  </p>
                </div>
              )}

              {/* Current price display for Promote section reference */}
              {fixedPrice && !isLocked && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mt-4">
                  <p className="text-primary text-sm font-sans">
                    Current price shown to fans: <strong>{formatPrice(fixedPrice)}</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PaymentsAndPricingSection;
