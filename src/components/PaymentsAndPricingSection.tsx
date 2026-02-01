import { useState, useEffect } from "react";
import { DollarSign, CreditCard, Check, ExternalLink, Loader2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CollapsibleSection from "@/components/artist/CollapsibleSection";

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
      toast.success("Price saved");
      onUpdate();
    } catch (err: any) {
      console.error("Save pricing error:", err);
      toast.error(err.message || "Failed to save price");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const isLocked = !!pricingLockedAt;

  // Status badge for header
  const getStatusBadge = () => {
    if (stripeStatus === "loading") return null;
    if (stripeStatus === "connected") {
      return (
        <Badge variant="checked" className="ml-2">
          <Check className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (stripeStatus === "action_required") {
      return (
        <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Action Needed
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="ml-2">
        <AlertCircle className="w-3 h-3 mr-1" />
        Setup Required
      </Badge>
    );
  };

  return (
    <CollapsibleSection
      title="Payments & Pricing"
      icon={DollarSign}
      defaultOpen={true}
      variant="dark"
      badge={getStatusBadge()}
    >
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-sans">
          Fans pay you directly via Stripe.
        </p>

        {/* Loading State */}
        {stripeStatus === "loading" && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="font-sans text-sm text-foreground">Checking Stripe status...</span>
            </div>
          </div>
        )}

        {/* Not Connected */}
        {stripeStatus === "not_connected" && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-destructive" />
              <span className="font-sans font-medium text-destructive">Payouts Not Connected</span>
            </div>
            <p className="text-foreground text-sm font-sans">
              Fans can't pay until you connect Stripe.
            </p>
            <Button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Payouts
                </>
              )}
            </Button>
          </div>
        )}

        {/* Action Required */}
        {stripeStatus === "action_required" && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="font-sans font-medium text-yellow-400">Stripe Needs More Info</span>
            </div>
            <p className="text-foreground text-sm font-sans">
              Complete setup to enable payouts.
            </p>
            <Button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        )}

        {/* Connected */}
        {stripeStatus === "connected" && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              <span className="font-sans font-medium text-green-400">Payouts Active</span>
            </div>
            <p className="text-foreground text-sm font-sans mt-1">
              Fans can now pay to join your After Party.
            </p>
          </div>
        )}

        {/* Pricing Section */}
        {stripeStatus !== "loading" && (
          <div className="border-t border-primary/30 pt-4 space-y-3">
            <Label className="text-sm text-primary font-sans font-medium">After Party Price</Label>

            {stripeStatus === "not_connected" && (
              <p className="text-yellow-400 text-xs font-sans">
                Connect payouts first. You can still set pricing now.
              </p>
            )}

            {isLocked ? (
              <div className="bg-primary/20 border border-primary/40 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Lock className="w-4 h-4" />
                  <span className="font-sans text-sm font-medium">Price Locked</span>
                </div>
                <p className="text-primary/80 text-xs font-sans">
                  Locked after first purchase.
                </p>
                {fixedPrice && (
                  <p className="text-foreground text-sm font-sans">
                    After Party Pass: <strong>{formatPrice(fixedPrice)}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-sans">$</span>
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      placeholder="5.00"
                      className="pl-7 bg-black/50 border-primary/30 focus:border-primary"
                    />
                  </div>
                  <Button
                    onClick={handleSavePricing}
                    disabled={isSaving || !priceValue}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
                <p className="text-primary/60 text-xs font-sans">
                  Minimum $1.00. Price locks after first purchase.
                </p>
              </div>
            )}

            {fixedPrice && !isLocked && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-2">
                <p className="text-primary text-xs font-sans">
                  Current price: <strong>{formatPrice(fixedPrice)}</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default PaymentsAndPricingSection;
