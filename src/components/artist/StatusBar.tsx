import { Clock, Users, CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatusBarProps {
  artistName: string;
  expiresAt: string | null;
  checkedInCount: number;
  stripeStatus: "loading" | "not_connected" | "action_required" | "connected";
}

const StatusBar = ({ artistName, expiresAt, checkedInCount, stripeStatus }: StatusBarProps) => {
  // Determine event status
  const getEventStatus = () => {
    if (!expiresAt) return { label: "Upcoming", variant: "secondary" as const };
    const now = new Date();
    const expires = new Date(expiresAt);
    if (expires <= now) return { label: "Ended", variant: "ended" as const };
    return { label: "Live", variant: "checked" as const };
  };

  // Format countdown or end time
  const getTimeDisplay = () => {
    if (!expiresAt) return "Starts when first fan joins";
    const expires = new Date(expiresAt);
    const now = new Date();
    
    if (expires <= now) return "Party ended";
    
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  const eventStatus = getEventStatus();

  const stripeDisplay = {
    loading: { icon: Loader2, label: "Checking...", color: "text-muted-foreground" },
    not_connected: { icon: AlertCircle, label: "Payouts needed", color: "text-destructive" },
    action_required: { icon: AlertCircle, label: "Action needed", color: "text-yellow-400" },
    connected: { icon: CheckCircle2, label: "Payouts active", color: "text-green-400" },
  }[stripeStatus];

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-4xl mx-auto px-4 py-3">
        {/* Mobile: Stack vertically */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Left: Title + Status */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-display text-lg md:text-xl text-primary uppercase tracking-tight truncate">
              {artistName}'s After Party
            </h1>
            <Badge variant={eventStatus.variant} className="shrink-0">
              {eventStatus.label}
            </Badge>
          </div>

          {/* Right: Stats row */}
          <div className="flex items-center gap-4 text-sm">
            {/* Time */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-sans">{getTimeDisplay()}</span>
            </div>

            {/* Checked in */}
            <div className="flex items-center gap-1.5 text-primary">
              <Users className="w-4 h-4" />
              <span className="font-sans font-medium">{checkedInCount} in</span>
            </div>

            {/* Stripe status */}
            <div className={`flex items-center gap-1.5 ${stripeDisplay.color}`}>
              <stripeDisplay.icon className={`w-4 h-4 ${stripeStatus === "loading" ? "animate-spin" : ""}`} />
              <span className="font-sans hidden sm:inline">{stripeDisplay.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
