import { useState, useEffect } from "react";
import { DollarSign, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StripeConnectSection from "@/components/StripeConnectSection";
import FanPayGateSection from "@/components/FanPayGateSection";

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

export type StripeStatus = "not_connected" | "setup_in_progress" | "action_required" | "ready" | "loading";

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
  const [stripeStatus, setStripeStatus] = useState<StripeStatus>("loading");
  const [isConnecting, setIsConnecting] = useState(false);

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
        setStripeStatus(data.status || "setup_in_progress");
      } catch (err) {
        console.error("Failed to check Stripe status:", err);
        // Fallback: if we have an account ID, assume setup in progress
        setStripeStatus("setup_in_progress");
      }
    };

    checkStatus();
  }, [eventId, token, stripeAccountId]);

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

  const isLocked = !!pricingLockedAt;
  const canConfigurePricing = stripeStatus === "ready" || stripeStatus === "setup_in_progress" || stripeStatus === "action_required";

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
            Monetize your After Party. Fans pay you directly via Stripe.
          </p>

          {/* Stripe Connect Section */}
          <StripeConnectSection
            stripeStatus={stripeStatus}
            isConnecting={isConnecting}
            onConnect={handleConnectStripe}
          />

          {/* Fan Pay Gate Section - Only show when Stripe is connected (any state) */}
          {stripeAccountId && canConfigurePricing && (
            <FanPayGateSection
              eventId={eventId}
              token={token}
              stripeStatus={stripeStatus}
              pricingMode={pricingMode}
              fixedPrice={fixedPrice}
              minPrice={minPrice}
              isLocked={isLocked}
              onUpdate={onUpdate}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PaidAccessSection;
