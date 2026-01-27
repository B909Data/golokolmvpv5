import { CreditCard, Check, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StripeStatus } from "@/components/PaidAccessSection";

interface StripeConnectSectionProps {
  stripeStatus: StripeStatus;
  isConnecting: boolean;
  onConnect: () => void;
}

const StripeConnectSection = ({
  stripeStatus,
  isConnecting,
  onConnect,
}: StripeConnectSectionProps) => {
  // Loading state
  if (stripeStatus === "loading") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="font-sans text-base text-foreground">Checking Stripe status...</span>
        </div>
      </div>
    );
  }

  // STATE 1: Not Connected
  if (stripeStatus === "not_connected") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <h4 className="font-display text-lg text-primary uppercase tracking-wide">
            Connect Stripe to Accept Fan Payments
          </h4>
        </div>

        <div className="space-y-3 text-foreground text-base font-sans leading-relaxed">
          <p>GoLokol uses Stripe to send you fan payments.</p>
          <p>If you already have a Stripe account, we'll connect it.</p>
          <p>If not, Stripe will guide you through creating one.</p>
          <p className="text-foreground/80">This is required to accept paid After Party entries.</p>
        </div>

        <div className="pt-2">
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base w-full sm:w-auto"
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
      </div>
    );
  }

  // STATE 2: Connected, Action Required
  if (stripeStatus === "action_required") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h4 className="font-display text-lg text-primary uppercase tracking-wide">
              Stripe Needs a Bit More Info
            </h4>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Action Needed
          </Badge>
        </div>

        <div className="space-y-3 text-foreground text-base font-sans leading-relaxed">
          <p>Stripe requires additional information to enable payouts and transfers.</p>
          <p className="text-foreground/80">This is a Stripe requirement (not GoLokol).</p>
          <p>Once completed, payments unlock automatically.</p>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={onConnect}
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
          <p className="text-primary/50 text-xs font-sans">
            Takes about 2–5 minutes. You'll be redirected to Stripe.
          </p>
        </div>
      </div>
    );
  }

  // STATE 3: Connected & Enabled
  if (stripeStatus === "connected") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <h4 className="font-display text-lg text-primary uppercase tracking-wide">
              Payments Enabled
            </h4>
          </div>
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Stripe Connected
          </Badge>
        </div>

        <div className="space-y-2 text-foreground text-base font-sans leading-relaxed">
          <p>Your Stripe account is fully connected.</p>
          <p className="text-foreground/80">Fans can now pay to join your After Party.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default StripeConnectSection;
