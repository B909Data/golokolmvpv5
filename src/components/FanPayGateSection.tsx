import { useState, useEffect } from "react";
import { DollarSign, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { StripeStatus } from "@/components/PaidAccessSection";

interface FanPayGateSectionProps {
  eventId: string;
  token: string;
  stripeStatus: StripeStatus;
  fixedPrice: number | null;
  isLocked: boolean;
  onUpdate: () => void;
}

const FanPayGateSection = ({
  eventId,
  token,
  stripeStatus,
  fixedPrice,
  isLocked,
  onUpdate,
}: FanPayGateSectionProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [priceValue, setPriceValue] = useState<string>(
    fixedPrice ? (fixedPrice / 100).toFixed(2) : ""
  );

  // Update local state when props change
  useEffect(() => {
    setPriceValue(fixedPrice ? (fixedPrice / 100).toFixed(2) : "");
  }, [fixedPrice]);

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

  const isStripeConnected = stripeStatus === "connected" || stripeStatus === "action_required";

  return (
    <div className="border-t border-primary/30 pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary" />
        <Label className="text-base text-primary font-sans font-medium">
          Fan Pay Gate
        </Label>
      </div>

      {/* Info note when Stripe not connected */}
      {!isStripeConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-yellow-400 text-sm font-sans">
            Connect Stripe to accept payments. You can still set pricing now.
          </p>
        </div>
      )}

      {/* Locked State - shows when pricing_locked_at is set */}
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
    </div>
  );
};

export default FanPayGateSection;
