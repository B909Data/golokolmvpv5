import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays, addDays } from "date-fns";
import { Send, MessageCircle, Home, Pin, ChevronLeft, Users, Download } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import badgeFrame from "@/assets/golokol-badge-frame.svg";

type EventData = {
  id: string;
  title: string;
  artist_name: string | null;
  status: string;
  start_at: string;
  city: string | null;
  after_party_opens_at: string | null;
  pinned_message: string | null;
  livestream_url: string | null;
  image_url: string | null;
} | null;

type Message = {
  id: string;
  role: string;
  message: string | null;
  created_at: string | null;
  attendee_id: string;
  attendees: {
    display_name: string | null;
  } | null;
};

type ViewMode = "welcome" | "chat";

// Helper to get initials from display name or fallback
const getInitials = (name: string | null, fallback: string = "F"): string => {
  if (!name) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const AfterPartyRoom = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get("admin") === "1";
  const urlToken = searchParams.get("token");
  
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<number>(0);

  // Token resolution: URL token first, then localStorage
  const storedAttendeeId = eventId ? localStorage.getItem(`attendee_${eventId}`) : null;
  const storedQrToken = eventId ? localStorage.getItem(`attendee_qr_${eventId}`) : null;

  // Resolve attendee by URL token or stored attendeeId
  const { data: attendeeData, isLoading: isCheckingIn, error: attendeeError } = useQuery({
    queryKey: ["attendee-checkin", eventId, urlToken, storedAttendeeId],
    queryFn: async () => {
      // If URL token, resolve by qr_token
      if (urlToken) {
        const { data, error } = await supabase
          .from("attendees")
          .select("id, checked_in_at, qr_token, display_name")
          .eq("event_id", eventId)
          .eq("qr_token", urlToken)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      
      // Otherwise use stored attendeeId
      if (storedAttendeeId) {
        const { data, error } = await supabase
          .from("attendees")
          .select("id, checked_in_at, qr_token, display_name")
          .eq("id", storedAttendeeId)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
      
      return null;
    },
    enabled: !!eventId && (!!urlToken || !!storedAttendeeId),
  });

  // Store attendee info from URL token if found
  useEffect(() => {
    if (urlToken && eventId && attendeeData) {
      localStorage.setItem(`attendee_${eventId}`, attendeeData.id);
      localStorage.setItem(`attendee_qr_${eventId}`, attendeeData.qr_token || urlToken);
    }
  }, [urlToken, eventId, attendeeData]);

  const attendeeId = attendeeData?.id || storedAttendeeId;
  const qrToken = attendeeData?.qr_token || urlToken || storedQrToken;

  // Hard gate room access
  useEffect(() => {
    if (!eventId) return;

    if (!urlToken && !storedAttendeeId) {
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
        navigate(`/after-party/${eventId}/pass?token=${token}`, { replace: true });
      } else {
        navigate(`/after-party/${eventId}/rsvp`, { replace: true });
      }
    }
  }, [urlToken, storedAttendeeId, attendeeData, attendeeError, eventId, qrToken, navigate, isCheckingIn]);

  const { data: event, isLoading, error: eventError } = useQuery({
    queryKey: ["event-room", eventId],
    queryFn: async (): Promise<EventData> => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, artist_name, status, start_at, city, after_party_opens_at, pinned_message, livestream_url, image_url")
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
        .select("id, role, message, created_at, attendee_id, attendees(display_name)")
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

  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
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
    
    if (daysRemaining <= 0) return "Closing soon";
    if (daysRemaining === 1) return "Closes in 1 day";
    return `Closes in ${daysRemaining} days`;
  };

  // Validate YouTube livestream URL
  const getValidLivestreamId = () => {
    if (!event?.livestream_url) return null;
    
    const url = event.livestream_url;
    if (!url.includes("youtube.com/watch") && !url.includes("youtu.be/")) {
      return null;
    }
    
    return extractYouTubeId(url);
  };

  // Error states
  if (accessError) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-destructive mb-4 font-sans">{accessError}</p>
          <Button 
            onClick={() => navigate(`/after-party/${eventId}/rsvp`)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to RSVP
          </Button>
        </div>
      </div>
    );
  }

  if (!urlToken && !storedAttendeeId) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4 font-sans">You need to RSVP or be checked in to access this After Party.</p>
          <Button 
            onClick={() => navigate(`/after-party/${eventId}/rsvp`)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to RSVP
          </Button>
        </div>
      </div>
    );
  }

  if (isCheckingIn || !attendeeData?.checked_in_at) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <p className="text-muted-foreground font-sans">Checking access...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <p className="text-muted-foreground font-sans">Loading...</p>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <p className="text-destructive font-sans">Failed to load event.</p>
      </div>
    );
  }

  const artistName = event.artist_name || "Artist";
  const livestreamId = getValidLivestreamId();
  const roomClosureInfo = getRoomClosureInfo();
  const eventSubtitle = [event.city, formatEventDate(event.start_at)].filter(Boolean).join(" • ");

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-sm border-b border-border/20">
        <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-foreground text-lg truncate">
              {event.title}
            </h1>
            {eventSubtitle && (
              <p className="text-muted-foreground text-sm font-sans truncate">
                {eventSubtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3">
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Users size={14} />
              <span className="text-sm font-sans font-medium">{attendeeCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* View Content */}
      {viewMode === "welcome" ? (
        <WelcomeDashboard
          artistName={artistName}
          eventTitle={event.title}
          pinnedMessage={event.pinned_message}
          livestreamId={livestreamId}
          roomClosureInfo={roomClosureInfo}
          flyerImageUrl={event.image_url}
          onGoToChat={() => setViewMode("chat")}
          onBackToEvent={() => navigate(`/after-party/${eventId}/rsvp`)}
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
          artistName={artistName}
          currentAttendeeId={attendeeId || ""}
          pinnedMessage={event.pinned_message}
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
  flyerImageUrl: string | null;
  onGoToChat: () => void;
  onBackToEvent: () => void;
}

const WelcomeDashboard = ({
  artistName,
  eventTitle,
  pinnedMessage,
  livestreamId,
  roomClosureInfo,
  flyerImageUrl,
  onGoToChat,
  onBackToEvent,
}: WelcomeDashboardProps) => {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadBadge = async () => {
    if (!badgeRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement("a");
      const safeTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      link.download = `golokol-badge-${safeTitle}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast.success("Badge saved to photos!");
    } catch (error) {
      console.error("Failed to download badge:", error);
      toast.error("Failed to download badge");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-4">
        {/* Pinned Message Card - Top Priority */}
        {pinnedMessage && (
          <div className="bg-[#1A1A1A] border border-primary/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary/20 p-1.5 rounded">
                <Pin size={14} className="text-primary" />
              </div>
              <span className="text-xs uppercase tracking-widest text-primary font-sans font-medium">
                Pinned
              </span>
            </div>
            <p className="text-foreground font-sans leading-relaxed">
              {pinnedMessage}
            </p>
          </div>
        )}

        {/* Badge Section - Prominent Reward */}
        <div className="bg-[#0B0B0B] border-2 border-primary/40 rounded-xl p-6 shadow-[0_0_20px_rgba(255,229,0,0.15)]">
          <div className="text-center mb-4">
            <h3 className="font-display font-bold text-foreground text-lg">
              Your 1st {artistName} After Party Badge
            </h3>
            <p className="text-muted-foreground text-sm font-sans mt-1">
              Collect and share them.
            </p>
          </div>
          
          {/* Badge Visual */}
          <div className="flex justify-center mb-4">
            <div 
              ref={badgeRef}
              className="relative w-60 h-60 md:w-72 md:h-72"
            >
              {/* Badge Frame - SVG overlay */}
              <img 
                src={badgeFrame} 
                alt="Badge frame" 
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              />
              
              {/* Flyer Image - Centered behind frame */}
              {flyerImageUrl && (
                <div className="absolute inset-[15%] rounded-full overflow-hidden">
                  <img 
                    src={flyerImageUrl} 
                    alt={eventTitle}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              
              {/* Fallback if no flyer */}
              {!flyerImageUrl && (
                <div className="absolute inset-[15%] rounded-full bg-[#1A1A1A] flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-sans">No Flyer</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Download Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleDownloadBadge}
              disabled={isDownloading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium px-6 py-3"
            >
              <Download size={18} className="mr-2" />
              {isDownloading ? "Saving..." : "Download Badge"}
            </Button>
            <p className="text-muted-foreground text-xs font-sans">
              Save to your photos to share later.
            </p>
          </div>
        </div>

        {/* Hero Card - Yellow */}
        <div className="bg-primary rounded-xl p-6">
          <h2 className="font-display font-bold text-primary-foreground text-2xl uppercase tracking-tight">
            After Party
          </h2>
          <p className="text-primary-foreground/80 font-sans mt-2">
            This room is only for fans who were checked in tonight.
          </p>
        </div>

        {/* House Rules Card */}
        <div className="bg-[#1A1A1A] rounded-xl p-5">
          <h3 className="font-display font-bold text-foreground text-lg mb-3">
            House Rules
          </h3>
          <ul className="space-y-2 text-muted-foreground font-sans text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Be respectful to everyone in the room</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>No spam or self-promotion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{roomClosureInfo || "This room stays open for 3 days"}</span>
            </li>
          </ul>
        </div>

        {/* Livestream Area */}
        {livestreamId && (
          <div className="bg-[#1A1A1A] rounded-xl overflow-hidden">
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${livestreamId}?rel=0&modestbranding=1`}
                title="Livestream"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={onGoToChat}
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans font-medium py-6 text-base"
          >
            Go to Chat
          </Button>
          <Button
            onClick={onBackToEvent}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10 font-sans py-6 text-base"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back to Event
          </Button>
        </div>
      </div>
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
  artistName: string;
  currentAttendeeId: string;
  pinnedMessage: string | null;
}

const ChatView = ({
  messages,
  messageText,
  setMessageText,
  handleSendMessage,
  isSending,
  formatTime,
  messagesEndRef,
  artistName,
  currentAttendeeId,
  pinnedMessage,
}: ChatViewProps) => {
  return (
    <div className="flex-1 flex flex-col pb-36 max-w-[640px] mx-auto w-full">
      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="sticky top-[65px] z-40 bg-[#0B0B0B] px-4 py-2">
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-start gap-3">
            <div className="bg-primary/20 p-1 rounded shrink-0 mt-0.5">
              <Pin size={12} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-primary font-sans font-medium uppercase tracking-wide">Pinned</span>
              <p className="text-foreground font-sans text-sm mt-0.5 line-clamp-2">
                {pinnedMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={24} className="text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-sans">
                No messages yet
              </p>
              <p className="text-muted-foreground/60 font-sans text-sm mt-1">
                Start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isArtist = msg.role === "artist";
              const isOwn = msg.attendee_id === currentAttendeeId;
              const displayName = msg.attendees?.display_name;
              const senderName = isArtist ? artistName : isOwn ? "You" : (displayName || "Fan");
              const initials = isArtist ? getInitials(artistName, "A") : isOwn ? "ME" : getInitials(displayName, "FN");
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isArtist 
                        ? "bg-primary text-primary-foreground" 
                        : isOwn 
                        ? "bg-[#2A2A2A] text-muted-foreground" 
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <span className="text-xs font-sans font-medium">{initials}</span>
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 max-w-[75%] ${isOwn ? "flex flex-col items-end" : ""}`}>
                    {/* Sender Name */}
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <span className={`text-xs font-sans ${
                        isArtist ? "text-primary font-medium" : "text-muted-foreground"
                      }`}>
                        {senderName}
                      </span>
                      <span className="text-xs text-muted-foreground/40 font-sans">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl font-sans text-[16px] leading-relaxed ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-tr-md"
                          : isArtist
                          ? "bg-primary/20 text-foreground border border-primary/30 rounded-tl-md"
                          : "bg-[#1A1A1A] text-foreground rounded-tl-md"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area - Text Only */}
      <div className="fixed bottom-20 left-0 right-0 bg-[#0B0B0B]/95 backdrop-blur-sm border-t border-border/20 px-4 py-3">
        <div className="flex items-center gap-3 max-w-[640px] mx-auto">
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
            className="flex-1 bg-[#1A1A1A] border-transparent focus:border-primary focus-visible:ring-primary/50 placeholder:text-muted-foreground/40 font-sans text-[16px] py-6"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            size="icon"
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12"
          >
            <Send size={20} />
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B] border-t border-border/20 px-4 py-3 safe-area-pb">
      <div className="flex justify-center gap-2 max-w-xs mx-auto">
        <button
          onClick={() => setViewMode("welcome")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all ${
            viewMode === "welcome"
              ? "bg-primary text-primary-foreground"
              : "bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
          }`}
        >
          <Home size={18} />
          <span>Welcome</span>
        </button>
        <button
          onClick={() => setViewMode("chat")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all ${
            viewMode === "chat"
              ? "bg-primary text-primary-foreground"
              : "bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
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
