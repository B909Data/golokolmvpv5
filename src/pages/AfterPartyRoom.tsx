import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Image, Smile, Film } from "lucide-react";

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
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      return format(new Date(event.start_at), "EEEE, MMMM d · h:mm a");
    } catch {
      return event.start_at;
    }
  })();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Flush Header */}
      <header className="px-6 pt-8 pb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          {event.title}
        </h1>
        <p className="text-muted-foreground mt-1">{formattedDate}</p>
        <p className="text-muted-foreground/60 text-sm mt-2">
          {attendeeCount} {attendeeCount === 1 ? "person" : "people"} here
        </p>
      </header>

      {/* Pinned / Stage Area */}
      <div className="px-6 py-4 border-b border-border/30">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-1">
          Pinned
        </p>
        <p className="text-sm text-muted-foreground">
          Welcome to the After Party. Be respectful. Artist note coming soon.
        </p>
      </div>

      {/* Message Stream */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        {messages.length === 0 ? (
          <p className="text-muted-foreground/50 text-center py-16">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="group">
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Composer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/30 px-4 py-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button
            type="button"
            className="p-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label="Add image"
          >
            <Image size={20} />
          </button>
          <button
            type="button"
            className="p-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label="Add GIF"
          >
            <Film size={20} />
          </button>
          <button
            type="button"
            className="p-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
          <Input
            placeholder="Type a message…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            size="sm"
            className="px-6"
          >
            {isSending ? "…" : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AfterPartyRoom;
