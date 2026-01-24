import { useState, useEffect } from "react";
import { CreditCard, Check, ExternalLink, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaidAccessSectionProps {
  eventId: string;
  token: string;
  stripeAccountId: string | null;
  pricingMode: string | null;
  fixedPrice: number | null;
  minPrice: number | null;
  pricingLockedAt: string | null;
  onUpdate: () => void;
}

const PaidAccessSection = ({
  eventId,
  token,
  stripeAccountId,
  pricingMode,
  fixedPrice,
  minPrice,
  pricingLockedAt,
  onUpdate,
}: PaidAccessSectionProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"fixed" | "pwyw" | "">(pricingMode as "fixed" | "pwyw" | "" || "");
  const [priceValue, setPriceValue] = useState<string>(
    pricingMode === "fixed" && fixedPrice 
      ? (fixedPrice / 100).toFixed(2) 
      : pricingMode === "pwyw" && minPrice 
        ? (minPrice / 100).toFixed(2) 
        : ""
  );

  const isLocked = !!pricingLockedAt;
  const isConnected = !!stripeAccountId;

  // Update local state when props change
  useEffect(() => {
    setMode(pricingMode as "fixed" | "pwyw" | "" || "");
    setPriceValue(
      pricingMode === "fixed" && fixedPrice 
        ? (fixedPrice / 100).toFixed(2) 
        : pricingMode === "pwyw" && minPrice 
          ? (minPrice / 100).toFixed(2) 
          : ""
    );
  }, [pricingMode, fixedPrice, minPrice]);

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
        // Open Stripe Connect onboarding in new tab
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
    if (!mode) {
      toast.error("Please select a pricing mode");
      return;
    }

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
          pricing_mode: mode,
          fixed_price: mode === "fixed" ? priceInCents : null,
          min_price: mode === "pwyw" ? priceInCents : null,
        },
      });

      if (error) throw error;
      toast.success("Pricing saved");
      onUpdate();
    } catch (err: any) {
      console.error("Save pricing error:", err);
      toast.error(err.message || "Failed to save pricing");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="px-4 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black border border-primary/30 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-primary" />
            <h3 className="font-display text-xl text-primary uppercase tracking-wide">
              Paid Access (Optional)
            </h3>
          </div>

          <p className="text-muted-foreground text-base font-sans">
            Monetize your After Party. Fans pay you directly via Stripe — GoLokol never holds your funds.
          </p>

          {/* Stripe Connect Section */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-sans text-base text-foreground font-medium">Stripe Account</span>
              </div>
              {isConnected ? (
                <div className="flex items-center gap-2 text-green-500">
                  <Check className="w-5 h-5" />
                  <span className="font-sans text-base font-medium">Connected</span>
                </div>
              ) : null}
            </div>

            {isConnected ? (
              <p className="text-primary/70 text-sm font-sans">
                Your Stripe account is connected. Fan payments go directly to you.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-primary/70 text-sm font-sans">
                  Connect your Stripe account to receive payments. If you don't have one, you can create it during onboarding.
                </p>
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
                      Connect with Stripe
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Pricing Configuration - Only show if Stripe is connected */}
          {isConnected && (
            <div className="space-y-4 pt-2">
              <div className="border-t border-primary/20 pt-4">
                <Label className="text-base text-primary font-sans font-medium mb-3 block">
                  Pricing Mode
                </Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(val) => setMode(val as "fixed" | "pwyw")}
                  disabled={isLocked}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="fixed" id="fixed" className="border-primary text-primary" />
                    <Label htmlFor="fixed" className="text-foreground font-sans text-base cursor-pointer">
                      Fixed Price — one set price
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="pwyw" id="pwyw" className="border-primary text-primary" />
                    <Label htmlFor="pwyw" className="text-foreground font-sans text-base cursor-pointer">
                      Pay What You Want — minimum + optional tip
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {mode && (
                <div className="space-y-3">
                  <Label className="text-base text-primary font-sans font-medium">
                    {mode === "fixed" ? "Price" : "Minimum Price"} (USD)
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
                        disabled={isLocked}
                        placeholder="5.00"
                        className="pl-8 bg-black/50 border-2 border-primary/30 focus:border-primary text-foreground font-sans text-base py-5"
                      />
                    </div>
                    <Button
                      onClick={handleSavePricing}
                      disabled={isSaving || isLocked || !priceValue}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-base py-5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Pricing"
                      )}
                    </Button>
                  </div>
                  <p className="text-primary/60 text-sm font-sans">
                    Minimum $1.00. {mode === "pwyw" ? "Fans can pay more if they choose." : ""}
                  </p>
                </div>
              )}

              {isLocked && (
                <div className="bg-primary/20 border border-primary/40 rounded-lg p-3">
                  <p className="text-primary text-sm font-sans">
                    ⚠️ Pricing is locked because your After Party is live. Contact support to make changes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Entry Points Info */}
          {isConnected && mode && priceValue && (
            <div className="border-t border-primary/20 pt-4 space-y-3">
              <Label className="text-base text-primary font-sans font-medium">
                Paid Entry Points
              </Label>
              <div className="grid gap-3 text-sm font-sans text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Merch Table:</strong> Fans scan QR at your merch table → pay → join party.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Pre-Show Pass:</strong> Fans pay online → get QR pass → you scan at show → they join.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong className="text-foreground">Walk-Ins:</strong> Still free via the Walk-Ins QR in Check-In section.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PaidAccessSection;
