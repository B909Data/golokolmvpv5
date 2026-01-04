import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays, addDays } from "date-fns";
import { Send, MessageCircle, Home, Users, Pin } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";

type EventData = {
  id: string;
  title: string;
  artist_name: string | null;
  status: string;
  start_at: string;
  after_party_opens_at: string | null;
  pinned_message: string | null;
  livestream_url: string | null;
} | null;

type Message = {
  id: string;
  role: string;
  message: string | null;
  created_at: string | null;
  attendee_id: string;
};

type ViewMode = "welcome" | "chat";

const AfterPartyRoom = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get("admin") === "1";
  
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<number>(0);

  const attendeeId = eventId ? localStorage.getItem(`attendee_${eventId}`) : null;
  const qrToken = eventId ? localStorage.getItem(`attendee_qr_${eventId}`) : null;

  // Hard gate: Check if attendee exists AND is checked in
  const { data: attendeeData, isLoading: isCheckingIn, error: attendeeError } = useQuery({
    queryKey: ["attendee-checkin", attendeeId],
    queryFn: async () => {
      if (!attendeeId) return null;
      const { data, error } = await supabase
        .from("attendees")
        .select("id, checked_in_at, qr_token, display_name")
        .eq("id", attendeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!attendeeId,
  });

  // Hard gate room access
  useEffect(() => {
    if (!eventId) return;

    if (!attendeeId) {
      navigate(`/after-party/${eventId}/rsvp`, { replace: true });
      return;
    }

    if (!isCheckingIn && attendeeError) {
      setAccessError("Unable to verify access. Please try again.");
      return;
    }

    if (!isCheckingIn && !attendeeData) {
      navigate(`/after-party/${eventId}/rsvp`, { replace: true });
      return;
    }

    if (!isCheckingIn && attendeeData && !attendeeData.checked_in_at) {
      const token = attendeeData.qr_token || qrToken;
      if (token) {
        navigate(`/after-party/${eventId}/qr/${token}`, { replace: true });
      } else {
        navigate(`/after-party/${eventId}/rsvp`, { replace: true });
      }
    }
  }, [attendeeId, attendeeData, attendeeError, eventId, qrToken, navigate, isCheckingIn]);

  const { data: event, isLoading, error: eventError } = useQuery({
    queryKey: ["event-room", eventId],
    queryFn: async (): Promise<EventData> => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, artist_name, status, start_at, after_party_opens_at, pinned_message, livestream_url")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data as EventData;
    },
    enabled: !!eventId && !!attendeeId && !!attendeeData?.checked_in_at,
  });

  const { data: attendeeCount = 0 } = useQuery({
    queryKey: ["attendee-count", eventId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("attendees")
        .select("*", { count: "exact", head: true })
        .eq("event_id", eventId)
        .not("checked_in_at", "is", null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!eventId && !!attendeeId && !!attendeeData?.checked_in_at,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ["after-party-messages", eventId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("after_party_messages")
        .select("id, role, message, created_at, attendee_id")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId && !!attendeeId && !!attendeeData?.checked_in_at,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (viewMode === "chat") {
      scrollToBottom();
    }
  }, [messages, viewMode]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !eventId || !attendeeId) return;

    setIsSending(true);
    try {
      const { error } = await supabase.from("after_party_messages").insert({
        event_id: eventId,
        attendee_id: attendeeId,
        role: "fan",
        message: messageText.trim(),
      });

      if (error) throw error;
      setMessageText("");
      refetchMessages();
    } catch (err: any) {
      console.error("Send message error:", err);
    } finally {
      setIsSending(false);
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

  // Calculate room closure time (3 days from after_party_opens_at)
  const getRoomClosureInfo = () => {
    if (!event?.after_party_opens_at) return null;
    const openedAt = new Date(event.after_party_opens_at);
    const closesAt = addDays(openedAt, 3);
    const daysRemaining = differenceInDays(closesAt, new Date());
    
    if (daysRemaining <= 0) return "This room is closing soon";
    if (daysRemaining === 1) return "This room closes in 1 day";
    return `This room closes in ${daysRemaining} days`;
  };

  // Validate YouTube livestream URL
  const getValidLivestreamId = () => {
    if (!event?.livestream_url) return null;
    
    // Only accept YouTube watch URLs
    const url = event.livestream_url;
    if (!url.includes("youtube.com/watch") && !url.includes("youtu.be/")) {
      return null;
    }
    
    return extractYouTubeId(url);
  };

  // Error states
  if (accessError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{accessError}</p>
          <Button variant="outline" onClick={() => navigate(`/after-party/${eventId}/rsvp`)}>
            Go to RSVP
          </Button>
        </div>
      </div>
    );
  }

  if (!attendeeId || isCheckingIn || !attendeeData?.checked_in_at) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Checking access...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-destructive">Failed to load event.</p>
      </div>
    );
  }

  const artistName = event.artist_name || "Artist";
  const livestreamId = getValidLivestreamId();
  const roomClosureInfo = getRoomClosureInfo();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* View Content */}
      {viewMode === "welcome" ? (
        <WelcomeDashboard
          artistName={artistName}
          eventTitle={event.title}
          pinnedMessage={event.pinned_message}
          livestreamId={livestreamId}
          roomClosureInfo={roomClosureInfo}
          attendeeCount={attendeeCount}
        />
      ) : (
        <ChatView
          messages={messages}
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
          isSending={isSending}
          formatTime={formatTime}
          messagesEndRef={messagesEndRef}
          attendeeCount={attendeeCount}
          artistName={artistName}
          currentAttendeeId={attendeeId}
        />
      )}

      {/* Persistent Bottom Toggle */}
      <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
    </div>
  );
};

// Welcome Dashboard View
interface WelcomeDashboardProps {
  artistName: string;
  eventTitle: string;
  pinnedMessage: string | null;
  livestreamId: string | null;
  roomClosureInfo: string | null;
  attendeeCount: number;
}

const WelcomeDashboard = ({
  artistName,
  eventTitle,
  pinnedMessage,
  livestreamId,
  roomClosureInfo,
  attendeeCount,
}: WelcomeDashboardProps) => {
  return (
    <main className="flex-1 overflow-y-auto pb-24">
      {/* Header Section */}
      <header className="px-6 pt-10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
          {artistName}
        </h1>
        <p className="text-muted-foreground mt-1 font-sans">{eventTitle}</p>
        {roomClosureInfo && (
          <p className="text-muted-foreground/60 text-sm mt-3 font-sans">
            {roomClosureInfo}
          </p>
        )}
      </header>

      {/* Fan count indicator */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground/70">
          <Users size={16} />
          <span className="text-sm font-sans">
            {attendeeCount} {attendeeCount === 1 ? "fan" : "fans"} inside
          </span>
        </div>
      </div>

      {/* Pinned Message / Artist Message */}
      <section className="px-6 py-4">
        <div className="bg-muted/30 border border-border/40 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Pin size={14} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-primary font-sans">
              Artist Message
            </span>
          </div>
          <p className="text-foreground font-sans leading-relaxed">
            {pinnedMessage || "Welcome to the After Party. Glad you made it."}
          </p>
        </div>
      </section>

      {/* Livestream Area */}
      <section className="px-6 py-4">
        <div className="bg-muted/20 border border-border/30 rounded-lg overflow-hidden">
          {livestreamId ? (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${livestreamId}?rel=0&modestbranding=1`}
                title="Livestream"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <p className="text-muted-foreground/50 text-sm font-sans">
                No livestream right now
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

// Chat View
interface ChatViewProps {
  messages: Message[];
  messageText: string;
  setMessageText: (text: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
  formatTime: (dateString: string | null) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  attendeeCount: number;
  artistName: string;
  currentAttendeeId: string;
}

const ChatView = ({
  messages,
  messageText,
  setMessageText,
  handleSendMessage,
  isSending,
  formatTime,
  messagesEndRef,
  attendeeCount,
  artistName,
  currentAttendeeId,
}: ChatViewProps) => {
  return (
    <div className="flex-1 flex flex-col pb-36">
      {/* Chat Header */}
      <header className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Artist avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">
              {artistName.charAt(0).toUpperCase()}
            </span>
          </div>
          {/* Fan identicons */}
          <div className="flex -space-x-2">
            {[...Array(Math.min(attendeeCount, 4))].map((_, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-muted border-2 border-background"
                style={{
                  background: `hsl(${(i * 60) % 360}, 40%, 50%)`,
                }}
              />
            ))}
            {attendeeCount > 4 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{attendeeCount - 4}</span>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground/70 font-sans">
          {attendeeCount} {attendeeCount === 1 ? "fan" : "fans"} inside
        </p>
      </header>

      {/* Message Feed */}
      <main className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground/50 text-center font-sans">
              No messages yet. Start the conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg) => {
              const isArtist = msg.role === "artist";
              const isOwn = msg.attendee_id === currentAttendeeId;
              
              return (
                <div
                  key={msg.id}
                  className={`${isArtist ? "bg-primary/10 -mx-2 px-2 py-3 rounded-lg" : ""}`}
                >
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`text-sm font-sans ${
                        isArtist
                          ? "text-primary font-medium"
                          : isOwn
                          ? "text-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {isArtist ? artistName : isOwn ? "You" : "Fan"}
                    </span>
                    <span className="text-xs text-muted-foreground/40 font-sans">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-foreground mt-1 leading-relaxed font-sans">
                    {msg.message}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/30 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
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
            className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-primary/50 placeholder:text-muted-foreground/40 font-sans"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

// View Toggle Component
interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 px-4 py-3 safe-area-pb">
      <div className="flex justify-center gap-2 max-w-xs mx-auto">
        <button
          onClick={() => setViewMode("welcome")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-sans text-sm transition-colors ${
            viewMode === "welcome"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <Home size={18} />
          <span>Welcome</span>
        </button>
        <button
          onClick={() => setViewMode("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-sans text-sm transition-colors ${
            viewMode === "chat"
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <MessageCircle size={18} />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
};

export default AfterPartyRoom;
