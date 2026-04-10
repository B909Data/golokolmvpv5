import { useEffect, useState } from "react";
import { DollarSign, Users, Ticket, ArrowRight, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { TabId } from "../ControlRoomTabs";

interface HomeTabProps {
  eventId: string;
  stripeStatus: "loading" | "not_connected" | "action_required" | "connected";
  fixedPrice: number | null;
  onSwitchTab: (tab: TabId) => void;
}

interface EarningsData {
  totalEarnings: number;
  passesSold: number;
  fansCheckedIn: number;
}

const HomeTab = ({ eventId, stripeStatus, fixedPrice, onSwitchTab }: HomeTabProps) => {
  const [data, setData] = useState<EarningsData>({
    totalEarnings: 0,
    passesSold: 0,
    fansCheckedIn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [helpExpanded, setHelpExpanded] = useState(false);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data: attendees, error } = await (supabase as any)
          .from("attendees")
          .select("paid_amount, paid_at, checked_in_at")
          .eq("event_id", eventId);

        if (error) throw error;

        const paid = attendees?.filter((a) => a.paid_at) || [];
        const checkedIn = attendees?.filter((a) => a.checked_in_at) || [];
        const total = paid.reduce((sum, a) => sum + (a.paid_amount || 0), 0);

        setData({
          totalEarnings: total,
          passesSold: paid.length,
          fansCheckedIn: checkedIn.length,
        });
      } catch (err) {
        console.error("Failed to fetch earnings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, [eventId]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  // Determine checklist items based on state
  const checklistItems = [];
  
  if (stripeStatus === "not_connected" || stripeStatus === "action_required") {
    checklistItems.push({
      label: stripeStatus === "not_connected" ? "Connect payouts" : "Complete payout setup",
      action: () => onSwitchTab("get-paid"),
      priority: true,
    });
  }

  if (!fixedPrice) {
    checklistItems.push({
      label: "Set your price",
      action: () => onSwitchTab("get-paid"),
      priority: stripeStatus === "connected",
    });
  }

  checklistItems.push({
    label: "Share your After Party",
    action: () => onSwitchTab("promote"),
    priority: stripeStatus === "connected" && !!fixedPrice,
  });

  checklistItems.push({
    label: "Enter the After Party",
    action: () => onSwitchTab("after-party"),
    priority: false,
  });

  // Only show top 3 relevant items
  const visibleChecklist = checklistItems.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Money Snapshot */}
      <div className="bg-primary/10 rounded-xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-sans uppercase tracking-wide">Earnings</span>
            </div>
            <p className="text-2xl font-bold text-primary font-sans">
              {loading ? "..." : formatCurrency(data.totalEarnings)}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Ticket className="w-4 h-4" />
              <span className="text-xs font-sans uppercase tracking-wide">Sold</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-sans">
              {loading ? "..." : data.passesSold}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-sans uppercase tracking-wide">Checked In</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-sans">
              {loading ? "..." : data.fansCheckedIn}
            </p>
          </div>
        </div>
      </div>

      {/* What To Do Next */}
      <div className="space-y-3">
        <h2 className="font-display text-lg text-primary uppercase tracking-tight">
          What to do next
        </h2>
        <div className="space-y-2">
          {visibleChecklist.map((item, i) => (
            <Button
              key={i}
              variant="outline"
              onClick={item.action}
              className={`w-full justify-between text-left h-auto py-3 px-4 ${
                item.priority
                  ? "border-primary bg-primary/5 hover:bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
            >
              <span className={`font-sans ${item.priority ? "text-primary font-medium" : "text-foreground"}`}>
                {item.label}
              </span>
              <ArrowRight className={`w-4 h-4 ${item.priority ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="border-t border-border pt-4">
        <button
          onClick={() => setHelpExpanded(!helpExpanded)}
          className="flex items-center justify-between w-full text-left py-2"
        >
          <span className="font-sans text-sm text-muted-foreground">Need help?</span>
          {helpExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        
        {helpExpanded && (
          <div className="space-y-3 pt-2">
            <a
              href="https://www.youtube.com/embed/PlNn4tpYHQA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-foreground">How to use the Control Room</p>
                <p className="font-sans text-xs text-muted-foreground">5 min video</p>
              </div>
            </a>
            <a
              href="https://www.youtube.com/embed/PlNn4tpYHQA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-foreground">How to promote your After Party</p>
                <p className="font-sans text-xs text-muted-foreground">Tips for getting fans in</p>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTab;
