import { useState, useEffect } from "react";
import { CreditCard, Check, ExternalLink, Loader2, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GetPaidTabProps {
  eventId: string;
  token: string | null;
  stripeAccountId: string | null;
  fixedPrice: number | null;
  pricingLockedAt: string | null;
  onUpdate: () => void;
}

type StripeStatus = "not_connected" | "action_required" | "connected" | "loading";

const GetPaidTab = ({
  eventId,
  token,
  stripeAccountId,
  fixedPrice,
  pricingLockedAt,
  onUpdate,
}: GetPaidTabProps) => {
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
          body: { event_id: eventId, token: token || undefined },
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
        body: { event_id: eventId, token: token || undefined },
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
          token: token || undefined,
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

  return (
    <div className="space-y-6">
      {/* Intro */}
      <p className="text-muted-foreground text-sm font-sans">
        Do this once so fans can pay you directly.
      </p>

      {/* Loading State */}
      {stripeStatus === "loading" && (
        <div className="bg-primary/10 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="font-sans text-sm text-foreground">Checking payout status...</span>
          </div>
        </div>
      )}

      {/* Not Connected */}
      {stripeStatus === "not_connected" && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-sans font-medium text-foreground">Payouts not connected</p>
              <p className="font-sans text-sm text-muted-foreground">Fans can't pay until you connect.</p>
            </div>
          </div>
          <Button
            onClick={handleConnectStripe}
            disabled={isConnecting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
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
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-sans font-medium text-foreground">Needs more info</p>
              <p className="font-sans text-sm text-muted-foreground">Complete setup to enable payouts.</p>
            </div>
          </div>
          <Button
            onClick={handleConnectStripe}
            disabled={isConnecting}
            className="w-full bg-yellow-500 text-black hover:bg-yellow-400 h-12 text-base"
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
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-sans font-medium text-green-400">Payouts active</p>
              <p className="font-sans text-sm text-foreground">Fans can now pay to join your After Party.</p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      {stripeStatus !== "loading" && (
        <div className="bg-primary/10 rounded-xl p-6 space-y-4">
          <Label className="text-sm text-primary font-sans font-medium">After Party Price</Label>

          {stripeStatus === "not_connected" && (
            <p className="text-primary text-sm font-sans">
              Connect payouts first. You can still set pricing now.
            </p>
          )}

          {isLocked ? (
            <div className="bg-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Lock className="w-4 h-4" />
                <span className="font-sans text-sm font-medium">Price locked</span>
              </div>
              <p className="text-muted-foreground text-sm font-sans">
                Locked after first purchase.
              </p>
              {fixedPrice && (
                <p className="text-foreground text-lg font-sans font-bold">
                  {formatPrice(fixedPrice)}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
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
                    className="pl-8 h-12 text-lg bg-background border-border focus:border-primary"
                  />
                </div>
                <Button
                  onClick={handleSavePricing}
                  disabled={isSaving || !priceValue}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm font-sans">
                Minimum $1.00. Price locks after first purchase.
              </p>
            </div>
          )}

          {fixedPrice && !isLocked && (
            <div className="bg-primary/20 rounded-lg p-3">
              <p className="text-primary text-sm font-sans">
                Current price: <strong>{formatPrice(fixedPrice)}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GetPaidTab;
