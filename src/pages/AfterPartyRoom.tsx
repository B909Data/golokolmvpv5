import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

type EventData = {
  id: string;
  title: string;
  status: string;
  start_at: string;
  after_party_opens_at: string;
} | null;

type Message = {
  id: string;
  role: string;
  message: string | null;
  created_at: string | null;
};

const AfterPartyRoom = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user has joined - redirect to lobby if not
  const attendeeId = eventId ? localStorage.getItem(`afterparty-attendee-${eventId}`) : null;

  useEffect(() => {
    if (!attendeeId && eventId) {
      navigate(`/after-party/${eventId}`, { replace: true });
    }
  }, [attendeeId, eventId, navigate]);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async (): Promise<EventData> => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, status, start_at, after_party_opens_at")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data as EventData;
    },
    enabled: !!eventId && !!attendeeId,
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
    enabled: !!eventId && !!attendeeId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["after-party-messages", eventId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("after_party_messages")
        .select("id, role, message, created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId && !!attendeeId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !eventId || !attendeeId) return;

    setIsSending(true);
    const { error } = await supabase.from("after_party_messages").insert({
      event_id: eventId,
      attendee_id: attendeeId,
      role: "fan",
      message: messageText.trim(),
    });

    setIsSending(false);

    if (!error) {
      setMessageText("");
      refetchMessages();
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

  if (!attendeeId) {
    return null; // Will redirect
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-foreground">Event not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      return format(new Date(event.start_at), "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch {
      return event.start_at;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Room Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{event.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {attendeeCount} {attendeeCount === 1 ? "person" : "people"} here
          </p>
        </div>

        {/* Pinned / Agenda Area */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Pinned</p>
          <p className="text-sm text-foreground">
            Welcome to the After Party. Be respectful. Artist note coming soon.
          </p>
        </div>

        {/* Messages Area - takes remaining space */}
        <div className="flex-1 min-h-[40vh] max-h-[60vh] overflow-y-auto border border-border rounded-lg p-4 mb-4 bg-card">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-primary capitalize">{msg.role}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{msg.message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Composer - sticky at bottom */}
        <div className="sticky bottom-0 bg-background pt-2 pb-4 border-t border-border -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterPartyRoom;
