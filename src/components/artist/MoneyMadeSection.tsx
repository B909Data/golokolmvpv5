import { useEffect, useState } from "react";
import { DollarSign, Users, Ticket, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CollapsibleSection from "./CollapsibleSection";

interface MoneyMadeSectionProps {
  eventId: string;
}

interface EarningsData {
  totalEarnings: number;
  passesSold: number;
  fansCheckedIn: number;
}

const MoneyMadeSection = ({ eventId }: MoneyMadeSectionProps) => {
  const [data, setData] = useState<EarningsData>({
    totalEarnings: 0,
    passesSold: 0,
    fansCheckedIn: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        // Fetch attendees with payment data
        const { data: attendees, error } = await supabase
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

  return (
    <CollapsibleSection
      title="Money Made"
      icon={TrendingUp}
      defaultOpen={true}
      variant="dark"
    >
      <div className="space-y-6">
        {/* Encouraging intro */}
        <p className="text-muted-foreground font-sans text-sm">
          You earned this. Here's what your After Party brought in.
        </p>

        {/* Primary metric - large display */}
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
          <p className="text-primary/70 font-sans text-sm uppercase tracking-wide mb-2">
            Your Earnings
          </p>
          <p
            className="text-4xl md:text-5xl font-bold text-primary"
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            {loading ? "..." : formatCurrency(data.totalEarnings)}
          </p>
          <p className="text-primary/60 font-sans text-xs mt-2">
            Direct to your Stripe account
          </p>
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ticket className="w-4 h-4 text-primary" />
              <span className="text-primary/70 font-sans text-xs uppercase">Passes Sold</span>
            </div>
            <p
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              {loading ? "..." : data.passesSold}
            </p>
          </div>

          <div className="bg-black/50 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-primary/70 font-sans text-xs uppercase">Fans Checked In</span>
            </div>
            <p
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "Roboto, sans-serif" }}
            >
              {loading ? "..." : data.fansCheckedIn}
            </p>
          </div>
        </div>

        {/* Positive reinforcement note */}
        {!loading && data.passesSold > 0 && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-green-400 font-sans text-sm text-center">
              🎉 Nice work! Your fans showed up for you.
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};

export default MoneyMadeSection;
