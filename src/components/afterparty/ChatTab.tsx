import { useState, useRef, useEffect } from "react";
import { Send, Clock, ShoppingBag, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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

interface ChatTabProps {
  eventId: string;
  messages: Message[];
  artistName: string;
  currentAttendeeId: string;
  livestreamId: string | null;
  merchLink: string | null;
  musicLink: string | null;
  isArtistMode?: boolean;
  isExpired?: boolean;
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

// Helper to get initials from display name
const getInitials = (name: string | null, fallback: string = "F"): string => {
  if (!name) return fallback;
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formatTime = (dateString: string | null): string => {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "h:mm a");
  } catch {
    return "";
  }
};

const ChatTab = ({
  eventId,
  messages,
  artistName,
  currentAttendeeId,
  livestreamId,
  merchLink,
  musicLink,
  isArtistMode = false,
  isExpired = false,
  onSendMessage,
  isSending,
}: ChatTabProps) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [endStateEmail, setEndStateEmail] = useState("");
  const [isSubmittingEndEmail, setIsSubmittingEndEmail] = useState(false);
  const [endEmailSubmitted, setEndEmailSubmitted] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await onSendMessage(messageText.trim());
    setMessageText("");
  };

  const handleEndEmailSubmit = async () => {
    if (!endStateEmail.trim() || !eventId) return;
    
    setIsSubmittingEndEmail(true);
    try {
      const { error } = await supabase
        .from("email_optins")
        .insert({ event_id: eventId, email: endStateEmail.trim() });
      
      if (error) {
        if (error.code === "23505") {
          toast.info("You're already signed up!");
          setEndEmailSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast.success("You're on the list!");
        setEndEmailSubmitted(true);
      }
    } catch (err: any) {
      console.error("Email opt-in error:", err);
      toast.error("Failed to sign up. Try again.");
    } finally {
      setIsSubmittingEndEmail(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-36 max-w-[640px] mx-auto w-full">
      {/* Livestream Player at Top */}
      {livestreamId && (
        <div className="px-4 pt-4">
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
        </div>
      )}

      {/* Gift Shop Links (compact, below livestream) */}
      {(merchLink || musicLink) && (
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            {merchLink && (
              <a href={merchLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full border-primary/30 text-foreground hover:bg-primary/10 font-sans text-sm">
                  <ShoppingBag size={14} className="mr-1.5" />
                  Merch
                </Button>
              </a>
            )}
            {musicLink && (
              <a href={musicLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full border-primary/30 text-foreground hover:bg-primary/10 font-sans text-sm">
                  <Music size={14} className="mr-1.5" />
                  Music
                </Button>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center py-12">
            <div>
              <p className="text-muted-foreground font-sans text-base">
                Be the first to say something!
              </p>
              <p className="text-muted-foreground/60 font-sans text-sm mt-1">
                Messages appear here in real-time.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.attendee_id === currentAttendeeId;
              const isArtist = msg.role === "artist";
              const rawDisplayName = msg.attendees?.display_name || null;
              const isAdmin = rawDisplayName === "__ADMIN_MODERATOR__";
              const cleanDisplayName = rawDisplayName?.startsWith("__") ? null : rawDisplayName;
              
              let senderName: string;
              if (isAdmin) {
                senderName = "GoLokol Moderator";
              } else if (isArtist) {
                senderName = artistName;
              } else if (isOwn) {
                senderName = "You";
              } else {
                senderName = cleanDisplayName || "Fan";
              }
              
              const initials = isAdmin ? "GL" : isArtist ? getInitials(artistName, "A") : isOwn ? "ME" : getInitials(cleanDisplayName, "FN");
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isAdmin
                        ? "bg-blue-500 text-white"
                        : isArtist 
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
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                      <span className={`text-xs font-sans ${
                        isAdmin ? "text-blue-400 font-medium" : isArtist ? "text-primary font-medium" : "text-muted-foreground"
                      }`}>
                        {senderName}
                      </span>
                      <span className="text-xs text-muted-foreground/40 font-sans">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    
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

      {/* End State Overlay for Expired Parties */}
      {isExpired && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0B]/95 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            {(isArtistMode || endEmailSubmitted) ? (
              <>
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                  <Clock size={28} className="text-muted-foreground" />
                </div>
                <h1 className="font-display font-bold text-foreground text-2xl">
                  This After Party has ended.
                </h1>
                <p className="text-muted-foreground font-sans">
                  Thanks for being here!
                </p>
              </>
            ) : (
              <>
                <h1 className="font-display font-bold text-foreground text-3xl leading-tight">
                  The Party is over!<br />See you at the next.
                </h1>
                <h2 className="font-display text-primary text-xl">
                  Get notified of the next one?
                </h2>
                <ul className="text-foreground font-sans text-left space-y-2 max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>New Show</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>New badge status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span>New Fans</span>
                  </li>
                </ul>
                <div className="space-y-3 pt-2">
                  <Input
                    type="email"
                    value={endStateEmail}
                    onChange={(e) => setEndStateEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-[#1A1A1A] border-border/30 focus:border-primary font-sans text-center"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleEndEmailSubmit();
                      }
                    }}
                  />
                  <Button
                    onClick={handleEndEmailSubmit}
                    disabled={!endStateEmail.trim() || isSubmittingEndEmail}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans py-6 text-base"
                  >
                    {isSubmittingEndEmail ? "..." : "Let me know"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input Area */}
      {!isExpired && (
        <div className="fixed bottom-20 left-0 right-0 bg-[#0B0B0B]/95 backdrop-blur-sm border-t border-border/20 px-4 py-3">
          <div className="flex items-center gap-3 max-w-[640px] mx-auto">
            <Input
              placeholder={isArtistMode ? "Message your fans..." : "Type a message..."}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isSending}
              className="flex-1 bg-[#1A1A1A] border-transparent focus:border-primary focus-visible:ring-primary/50 placeholder:text-muted-foreground/40 font-sans text-[16px] py-6"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || isSending}
              size="icon"
              className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12"
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTab;
