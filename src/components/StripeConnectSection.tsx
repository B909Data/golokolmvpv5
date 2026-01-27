import { CreditCard, Check, ExternalLink, Loader2, AlertCircle, Clock } from "lucide-react";
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

  // STATE 1: Before Stripe is connected
  if (stripeStatus === "not_connected") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-primary" />
          <h4 className="font-display text-lg text-primary uppercase tracking-wide">
            Get Paid by Fans
          </h4>
        </div>

        <p className="text-foreground text-base font-sans leading-relaxed">
          GoLokol uses Stripe to send you payouts from fans who join your After Parties.
        </p>

        <div className="space-y-2">
          <p className="text-primary/90 text-sm font-sans font-medium">What happens next:</p>
          <ul className="space-y-2 text-foreground/80 text-sm font-sans">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>If you already have a Stripe account, you'll sign in and connect it.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>If you don't, Stripe will guide you through creating one (about 5-10 minutes).</span>
            </li>
          </ul>
        </div>

        <p className="text-foreground/70 text-sm font-sans">
          You can finish setup now or come back later. Payouts begin once Stripe verification is complete.
        </p>

        <div className="space-y-3 pt-2">
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
                Continue to Stripe
              </>
            )}
          </Button>
          <p className="text-primary/50 text-xs font-sans">
            Stripe handles payments and payouts securely. GoLokol never stores your banking details.
          </p>
        </div>
      </div>
    );
  }

  // STATE 2: Stripe connected but setup incomplete
  if (stripeStatus === "incomplete") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <h4 className="font-display text-lg text-primary uppercase tracking-wide">
              Stripe Account
            </h4>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Setup in progress
          </Badge>
        </div>

        <p className="text-foreground text-base font-sans leading-relaxed">
          Your Stripe account is connected, but payments are paused until Stripe finishes verification.
        </p>

        <p className="text-foreground/70 text-sm font-sans">
          This is normal for new accounts. Stripe may ask for identity or payout details before enabling payments.
        </p>

        <div className="space-y-3 pt-2">
          <Button
            onClick={onConnect}
            disabled={isConnecting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5 mr-2" />
                Finish Stripe Setup
              </>
            )}
          </Button>
          <p className="text-primary/50 text-xs font-sans">
            You can continue setting up your After Party while this is completed.
          </p>
        </div>
      </div>
    );
  }

  // STATE 3: Stripe fully connected and verified
  if (stripeStatus === "verified") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <h4 className="font-display text-lg text-primary uppercase tracking-wide">
              Stripe Account
            </h4>
          </div>
          <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        </div>

        <p className="text-foreground text-base font-sans leading-relaxed">
          Your Stripe account is verified and ready.
        </p>

        <p className="text-foreground/70 text-sm font-sans">
          Fans can now pay to join your After Parties, and payouts will be sent to your Stripe account automatically.
        </p>
      </div>
    );
  }

  // STATE 4: Stripe requires additional action
  if (stripeStatus === "action_required") {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <h4 className="font-display text-lg text-yellow-400 uppercase tracking-wide">
              Action Required by Stripe
            </h4>
          </div>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Action needed
          </Badge>
        </div>

        <p className="text-foreground text-base font-sans leading-relaxed">
          Stripe needs additional information before enabling payments.
        </p>

        <p className="text-foreground/70 text-sm font-sans">
          This is a Stripe requirement (not GoLokol). Once completed, payments will unlock automatically.
        </p>

        <div className="pt-2">
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
                Review Stripe Requirements
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default StripeConnectSection;
