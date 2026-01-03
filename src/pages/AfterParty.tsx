import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
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

const AfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [joinedAttendeeId, setJoinedAttendeeId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleJoinAfterParty = async () => {
    if (!eventId) return;
    setIsJoining(true);
    setJoinError(null);

    const { data, error } = await supabase
      .from("attendees")
      .insert({ event_id: eventId, checkin_method: "qr" })
      .select("id")
      .single();

    setIsJoining(false);

    if (error) {
      setJoinError(error.message);
    } else if (data) {
      setJoinedAttendeeId(data.id);
    }
  };

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
    enabled: !!eventId,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !eventId || !joinedAttendeeId) return;

    setIsSending(true);
    const { error } = await supabase.from("after_party_messages").insert({
      event_id: eventId,
      attendee_id: joinedAttendeeId,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p>Event not found</p>
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col p-8 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {attendeeCount} {attendeeCount === 1 ? "person" : "people"} here
          </p>
        </div>

        {/* Join Section */}
        {!joinedAttendeeId ? (
          <div className="text-center mb-6">
            {joinError && (
              <p className="text-destructive mb-2">{joinError}</p>
            )}
            <Button onClick={handleJoinAfterParty} disabled={isJoining}>
              {isJoining ? "Joining..." : "Join After Party"}
            </Button>
          </div>
        ) : (
          <p className="text-center font-medium mb-6">You're in.</p>
        )}

        {/* Messages Section */}
        <div className="flex-1 border rounded-lg p-4 mb-4 min-h-[300px] max-h-[400px] overflow-y-auto bg-card">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-primary">{msg.role}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                  </div>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Composer */}
        {joinedAttendeeId && (
          <div className="flex gap-2">
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
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AfterParty;
