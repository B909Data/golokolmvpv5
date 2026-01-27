import { useState, useEffect } from "react";
import { DollarSign, Check, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StripeStatus } from "@/components/PaidAccessSection";

interface FanPayGateSectionProps {
  eventId: string;
  token: string;
  stripeStatus: StripeStatus;
  pricingMode: string | null;
  fixedPrice: number | null;
  minPrice: number | null;
  isLocked: boolean;
  onUpdate: () => void;
}

const FanPayGateSection = ({
  eventId,
  token,
  stripeStatus,
  pricingMode,
  fixedPrice,
  minPrice,
  isLocked,
  onUpdate,
}: FanPayGateSectionProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"fixed" | "pwyw" | "">(pricingMode as "fixed" | "pwyw" | "" || "");
  const [priceValue, setPriceValue] = useState<string>(
    pricingMode === "fixed" && fixedPrice 
      ? (fixedPrice / 100).toFixed(2) 
      : pricingMode === "pwyw" && minPrice 
        ? (minPrice / 100).toFixed(2) 
        : ""
  );

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
      toast.success("Fan pricing saved successfully");
      onUpdate();
    } catch (err: any) {
      console.error("Save pricing error:", err);
      toast.error(err.message || "Failed to save pricing");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isStripeVerified = stripeStatus === "connected";

  return (
    <div className="border-t border-primary/30 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        <Label className="text-base text-primary font-sans font-medium">
          Fan Pay Gate
        </Label>
      </div>

      {/* Info note when Stripe not fully verified */}
      {!isStripeVerified && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm font-sans">
            Complete Stripe verification to accept payments. You can still set pricing now.
          </p>
        </div>
      )}

      {/* Locked State - shows when pricing_locked_at is set */}
      {isLocked ? (
        <div className="bg-primary/20 border border-primary/40 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <Lock className="w-5 h-5" />
            <span className="font-sans text-base font-medium">Pricing Locked</span>
          </div>
          <p className="text-primary/80 text-sm font-sans">
            Pricing locked after first fan purchase. Contact support to make changes.
          </p>
          {pricingMode && (
            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-foreground text-sm font-sans">
                {pricingMode === "fixed" && fixedPrice ? (
                  <>Current price: <strong>{formatPrice(fixedPrice)}</strong></>
                ) : pricingMode === "pwyw" && minPrice ? (
                  <>Pay what you want (minimum <strong>{formatPrice(minPrice)}</strong>)</>
                ) : (
                  "No pricing set"
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Pricing Mode Toggle */}
          <RadioGroup
            value={mode}
            onValueChange={(val) => setMode(val as "fixed" | "pwyw")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="fixed" id="fixed" className="border-primary text-primary" />
              <Label htmlFor="fixed" className="text-foreground font-sans text-base cursor-pointer">
                Set price — one fixed price
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="pwyw" id="pwyw" className="border-primary text-primary" />
              <Label htmlFor="pwyw" className="text-foreground font-sans text-base cursor-pointer">
                Pay what you want — set a minimum
              </Label>
            </div>
          </RadioGroup>

          {/* Price Input - Shows when mode is selected */}
          {mode && (
            <div className="space-y-3 pt-2">
              <Label className="text-sm text-primary/80 font-sans">
                {mode === "fixed" ? "Price (USD)" : "Minimum Price (USD)"}
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
                Minimum $1.00. {mode === "pwyw" ? "Fans can pay more if they choose." : ""}
              </p>
            </div>
          )}
        </>
      )}

      {/* Entry Points Info - Shows when pricing is configured and Stripe is verified */}
      {isStripeVerified && mode && priceValue && (
        <div className="border-t border-primary/20 pt-4 space-y-3">
          <Label className="text-base text-primary font-sans font-medium">
            Paid Entry Points
          </Label>
          <div className="grid gap-3 text-sm font-sans text-muted-foreground">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>
                <strong className="text-foreground">Pre-Show Pass:</strong>{" "}
                {pricingMode === "fixed" && fixedPrice 
                  ? `After Party Pass — ${formatPrice(fixedPrice)}`
                  : pricingMode === "pwyw" && minPrice
                    ? `Pay what you want (minimum ${formatPrice(minPrice)})`
                    : "Fans pay online → get QR pass → you scan at show → they join."
                }
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Merch Table:</strong> Fans scan QR at your merch table → pay → join party.</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span><strong className="text-foreground">Walk-Ins:</strong> Still free via the Walk-Ins QR in Check-In section.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanPayGateSection;
