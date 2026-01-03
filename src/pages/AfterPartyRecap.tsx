import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const AfterPartyRecap = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const attendeeId = eventId ? localStorage.getItem(`afterparty-attendee-${eventId}`) : null;

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const { data: recap } = useQuery({
    queryKey: ["recap", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recaps")
        .select("id, content, created_at")
        .eq("event_id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const { data: attendeeCount = 0 } = useQuery({
    queryKey: ["attendee-count", eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("attendees")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId,
  });

  const { data: currentAttendee } = useQuery({
    queryKey: ["current-attendee", attendeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendees")
        .select("id, phone, display_name")
        .eq("id", attendeeId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!attendeeId,
  });

  const { data: attendanceHistory = 0 } = useQuery({
    queryKey: ["attendance-history", currentAttendee?.phone, currentAttendee?.display_name],
    queryFn: async () => {
      if (!currentAttendee) return 0;

      let query = supabase.from("attendees").select("*", { count: "exact", head: true });

      if (currentAttendee.phone) {
        query = query.eq("phone", currentAttendee.phone);
      } else if (currentAttendee.display_name) {
        query = query.eq("display_name", currentAttendee.display_name);
      } else {
        return 1;
      }

      const { count, error } = await query;
      if (error) return 1;
      return count || 1;
    },
    enabled: !!currentAttendee,
  });

  const statusBadge = attendanceHistory >= 2 ? "REPEAT SUPPORTER" : "FIRST SHOW";

  const { data: recentMessages = [] } = useQuery({
    queryKey: ["recap-messages", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("after_party_messages")
        .select("id, role, message, created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "EEEE, MMMM d · h:mm a");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  if (!event || !recap) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading recap...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          {event.title}
        </h1>
        <p className="text-muted-foreground mt-1">{formatDate(event.start_at)}</p>

        {/* Your Status Badge */}
        {attendeeId && currentAttendee && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-2">
              Your Status
            </p>
            <Badge variant="secondary" className="text-xs font-medium">
              {statusBadge}
            </Badge>
          </div>
        )}
      </header>

      {/* Recap Content */}
      <section className="px-6 py-6 border-t border-border/30">
        <h2 className="text-xl font-medium text-foreground mb-2">
          {recap.content}
        </h2>
        <p className="text-muted-foreground">
          {attendeeCount} {attendeeCount === 1 ? "attendee" : "attendees"}
        </p>
      </section>

      {/* Recent Messages */}
      {recentMessages.length > 0 && (
        <section className="px-6 py-6 border-t border-border/30">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-4">
            Recent Messages
          </h3>
          <div className="space-y-4">
            {recentMessages.map((msg) => (
              <div key={msg.id}>
                <div className="flex items-baseline gap-3">
                  <span className="text-sm font-medium text-primary capitalize">
                    {msg.role}
                  </span>
                  <span className="text-xs text-muted-foreground/40">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-foreground mt-1 leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AfterPartyRecap;
