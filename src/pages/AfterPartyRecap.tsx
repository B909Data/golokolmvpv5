import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AfterPartyRecap = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const attendeeId = eventId ? localStorage.getItem(`afterparty-attendee-${eventId}`) : null;
  const isAdminMode = searchParams.get("admin") === "1";
  
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  // Redirect to lobby if no attendee_id (unless admin mode)
  useEffect(() => {
    if (!attendeeId && !isAdminMode && eventId) {
      navigate(`/after-party/${eventId}`, { replace: true });
    }
  }, [attendeeId, isAdminMode, eventId, navigate]);

  // Check if current attendee is an artist
  const { data: attendeeRole } = useQuery({
    queryKey: ["attendee-role", attendeeId, eventId],
    queryFn: async () => {
      if (!attendeeId || !eventId) return null;
      
      const { data, error } = await supabase
        .from("after_party_messages")
        .select("role")
        .eq("attendee_id", attendeeId)
        .eq("event_id", eventId)
        .eq("role", "artist")
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data?.role || null;
    },
    enabled: !!attendeeId && !!eventId,
  });

  const canSendSms = isAdminMode || attendeeRole === "artist";

  const handleSendSms = async () => {
    if (!eventId || isSending || hasSent) return;
    
    setIsSending(true);
    try {
      const recapUrl = `${window.location.origin}/after-party/${eventId}/recap`;
      
      const { data, error } = await supabase.functions.invoke("send-recap-sms", {
        body: { eventId, recapUrl },
      });

      if (error) throw error;

      toast.success(`Recap sent to ${data.sentCount} attendee${data.sentCount === 1 ? "" : "s"}`);
      setHasSent(true);
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      toast.error("Failed to send recap SMS");
    } finally {
      setIsSending(false);
    }
  };

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
      return format(new Date(dateString), "EEEE, MMMM d");
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
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-sans">Loading recap...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="font-display text-2xl sm:text-3xl text-foreground uppercase">
                {event.title}
              </h1>
              {isAdminMode && (
                <span className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded font-sans uppercase tracking-wide">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>
            <p className="text-muted-foreground font-sans">{formatDate(event.start_at)}</p>

            {/* Your Status Badge */}
            {attendeeId && currentAttendee && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-2 font-sans">
                  Your Status
                </p>
                <Badge className="bg-primary text-primary-foreground font-sans text-xs font-medium">
                  {statusBadge}
                </Badge>
              </div>
            )}
          </header>

          {/* Recap Content Panel */}
          <section className="rounded-xl border-2 border-primary bg-background p-6 mb-6">
            <h2 className="text-sm font-medium text-primary font-sans uppercase tracking-wide mb-3">
              Event Recap
            </h2>
            <p className="text-xl font-medium text-foreground font-sans mb-2">
              {recap.content}
            </p>
            <p className="text-muted-foreground font-sans">
              {attendeeCount} {attendeeCount === 1 ? "attendee" : "attendees"}
            </p>
          </section>

          {/* Admin SMS Button */}
          {canSendSms && (
            <section className="rounded-xl border-2 border-primary bg-background p-6 mb-6">
              <h2 className="text-sm font-medium text-primary font-sans uppercase tracking-wide mb-3">
                Admin Actions
              </h2>
              {hasSent ? (
                <p className="text-sm text-muted-foreground font-sans">Recap sent to attendees.</p>
              ) : (
                <Button
                  onClick={handleSendSms}
                  disabled={isSending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending..." : "Send Recap via SMS"}
                </Button>
              )}
            </section>
          )}

          {/* Recent Messages */}
          {recentMessages.length > 0 && (
            <section className="rounded-xl border-2 border-primary bg-background p-6">
              <h2 className="text-sm font-medium text-primary font-sans uppercase tracking-wide mb-4">
                Recent Messages
              </h2>
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div key={msg.id}>
                    <div className="flex items-baseline gap-3">
                      <span className="text-sm font-medium text-primary capitalize font-sans">
                        {msg.role}
                      </span>
                      <span className="text-xs text-muted-foreground/40 font-sans">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-foreground mt-1 leading-relaxed font-sans">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AfterPartyRecap;