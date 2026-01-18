import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, differenceInDays, addDays, isAfter } from "date-fns";
import { Send, MessageCircle, Home, Pin, ChevronLeft, Users, Download, Settings, ShoppingBag, Music, Mail, Clock } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";
import { toast } from "sonner";
import NoReentryOverlay from "@/components/NoReentryOverlay";

import badgeFrame from "@/assets/golokol-badge-frame.svg";

type PartnerInfo = {
  id: string;
  name: string;
  type: string;
} | null;

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
  curator_id: string | null;
  venue_id: string | null;
  curator_other_name: string | null;
  venue_other_name: string | null;
  curator: PartnerInfo;
  venue: PartnerInfo;
  artist_access_token: string | null;
  merch_link: string | null;
  music_link: string | null;
  admin_state: "active" | "paused" | "archived" | null;
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

type ViewMode = "welcome" | "chat" | "control";

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
  const artistToken = searchParams.get("artist_token"); // Artist mode
  
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [showNoReentryOverlay, setShowNoReentryOverlay] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<number>(0);
  const artistJoinedRef = useRef<boolean>(false); // Guard for artist join message

  // Determine if in artist mode or admin mode
  const isArtistMode = !!artistToken;
  const isPrivilegedMode = isArtistMode || isAdminMode;

  // Token resolution: URL token first, then localStorage
  const storedAttendeeId = eventId ? localStorage.getItem(`attendee_${eventId}`) : null;
  const storedQrToken = eventId ? localStorage.getItem(`attendee_qr_${eventId}`) : null;

  // For artist/admin mode, we skip attendee checks
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
    enabled: !!eventId && !isPrivilegedMode && (!!urlToken || !!storedAttendeeId),
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

  // Hard gate room access - for fans only (skip for artist/admin mode)
  useEffect(() => {
    if (!eventId || isPrivilegedMode) return;

    console.log("[AfterPartyRoom] Access check:", { 
      urlToken, 
      storedAttendeeId, 
      isCheckingIn, 
      attendeeData: attendeeData ? { id: attendeeData.id, checked_in_at: attendeeData.checked_in_at } : null,
      attendeeError: attendeeError?.message 
    });

    if (!urlToken && !storedAttendeeId) {
      console.log("[AfterPartyRoom] No token or stored ID, redirecting to join");
      navigate(`/after-party/${eventId}`, { replace: true });
      return;
    }

    if (!isCheckingIn && attendeeError) {
      console.log("[AfterPartyRoom] Attendee error:", attendeeError);
      setAccessError("Unable to verify access. Please try again.");
      return;
    }

    if (!isCheckingIn && !attendeeData) {
      console.log("[AfterPartyRoom] No attendee data found, redirecting to join");
      navigate(`/after-party/${eventId}`, { replace: true });
      return;
    }

    if (!isCheckingIn && attendeeData && !attendeeData.checked_in_at) {
      console.log("[AfterPartyRoom] Attendee not checked in, redirecting to pass");
      const token = attendeeData.qr_token || qrToken;
      if (token) {
        navigate(`/after-party/${eventId}/pass?token=${token}`, { replace: true });
      } else {
        navigate(`/after-party/${eventId}`, { replace: true });
      }
    }
  }, [urlToken, storedAttendeeId, attendeeData, attendeeError, eventId, qrToken, navigate, isCheckingIn, isPrivilegedMode]);

  // Set initial view mode based on role
  useEffect(() => {
    if (isPrivilegedMode) {
      setViewMode("chat"); // Artists and admins start on chat
    } else {
      setViewMode("welcome"); // Fans start on welcome
    }
  }, [isPrivilegedMode]);

  const { data: event, isLoading, error: eventError, refetch: refetchEvent } = useQuery({
    queryKey: ["event-room", eventId, artistToken, isAdminMode],
    queryFn: async (): Promise<EventData> => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          id, title, artist_name, status, start_at, city, 
          after_party_opens_at, pinned_message, livestream_url, image_url,
          curator_id, venue_id, curator_other_name, venue_other_name, artist_access_token,
          merch_link, music_link, admin_state,
          curator:partners!events_curator_id_fkey(id, name, type),
          venue:partners!events_venue_id_fkey(id, name, type)
        `)
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data as EventData;
    },
    enabled: !!eventId && (isPrivilegedMode || (!!attendeeId && !!attendeeData?.checked_in_at)),
  });

  // Validate artist token
  useEffect(() => {
    if (isArtistMode && event) {
      if (event.artist_access_token !== artistToken) {
        setAccessError("Invalid artist access token");
      }
    }
  }, [isArtistMode, event, artistToken]);

  // Realtime subscription for event updates (livestream, pinned message, etc.)
  useEffect(() => {
    if (!eventId) return;
    if (!isArtistMode && (!attendeeId || !attendeeData?.checked_in_at)) return;

    const channel = supabase
      .channel(`event-updates-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        () => {
          refetchEvent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, attendeeId, attendeeData?.checked_in_at, refetchEvent, isArtistMode]);

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
    enabled: !!eventId && (isArtistMode || (!!attendeeId && !!attendeeData?.checked_in_at)),
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
    enabled: !!eventId && (isArtistMode || (!!attendeeId && !!attendeeData?.checked_in_at)),
  });

  // Check if fan has already opted in (for end-state display)
  const { data: hasOptedIn = false } = useQuery({
    queryKey: ["fan-optin-check", eventId, attendeeId],
    queryFn: async () => {
      // We'll check by looking for any email_optin for this event from localStorage email
      // Since we don't have email stored, we check by emailSubmitted state in component
      // Actually, we can just check if there's any record - but we need the email
      // For now, return false and let the component's emailSubmitted state handle it
      return false;
    },
    enabled: false, // Disabled - we'll use component state instead
  });

  // Check if no-reentry overlay should be shown (for fans only, once per event per browser)
  useEffect(() => {
    if (isPrivilegedMode || !eventId) return;
    
    // Only show after attendee is confirmed checked in
    if (!attendeeData?.checked_in_at) {
      console.log("[AfterPartyRoom] No Re-entry overlay skipped - not checked in yet");
      return;
    }
    
    const seenKey = `afterPartyNoReentrySeen_${eventId}`;
    const alreadySeen = localStorage.getItem(seenKey);
    console.log("[AfterPartyRoom] No Re-entry overlay check:", { seenKey, alreadySeen, checked_in_at: attendeeData.checked_in_at });
    
    if (!alreadySeen) {
      console.log("[AfterPartyRoom] Showing No Re-entry overlay");
      setShowNoReentryOverlay(true);
    }
  }, [isPrivilegedMode, eventId, attendeeData?.checked_in_at]);

  // Post system message when artist joins (once per session) + send SMS
  useEffect(() => {
    if (!isArtistMode || !eventId || !event || artistJoinedRef.current) return;

    const postArtistJoinMessage = async () => {
      // Check if artist join message was already posted in this session
      const sessionKey = `artist_joined_${eventId}`;
      if (sessionStorage.getItem(sessionKey)) {
        artistJoinedRef.current = true;
        return;
      }

      try {
        const { data: existingArtist } = await supabase
          .from("attendees")
          .select("id")
          .eq("event_id", eventId)
          .eq("display_name", "__ARTIST_SYSTEM__")
          .maybeSingle();

        let artistAttendeeId: string;

        if (existingArtist) {
          artistAttendeeId = existingArtist.id;
        } else {
          const { data: newArtist, error: createError } = await supabase
            .from("attendees")
            .insert({
              event_id: eventId,
              display_name: "__ARTIST_SYSTEM__",
              qr_token: crypto.randomUUID(),
              checked_in_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Failed to create artist system attendee:", createError);
            return;
          }
          artistAttendeeId = newArtist.id;
        }

        const { error: msgError } = await supabase
          .from("after_party_messages")
          .insert({
            event_id: eventId,
            attendee_id: artistAttendeeId,
            role: "artist",
            message: "🎤 The artist just joined the chat",
          });

        if (msgError) {
          console.error("Failed to post artist join message:", msgError);
        } else {
          sessionStorage.setItem(sessionKey, "true");
          artistJoinedRef.current = true;
          refetchMessages();
          
          // Send SMS to all attendees with phone numbers
          try {
            const { data: smsResult, error: smsError } = await supabase.functions.invoke(
              "send-artist-entered-sms",
              {
                body: {
                  event_id: eventId,
                  token: artistToken,
                },
              }
            );
            if (smsError) {
              console.error("Failed to send artist-entered SMS:", smsError);
            } else {
              console.log("Artist-entered SMS result:", smsResult);
            }
          } catch (smsErr) {
            console.error("Error calling send-artist-entered-sms:", smsErr);
          }
        }
      } catch (err) {
        console.error("Error posting artist join message:", err);
      }
    };

    postArtistJoinMessage();
  }, [isArtistMode, eventId, event, refetchMessages, artistToken]);

  // Post system message when admin (GoLokol Moderator) joins (once per session)
  const adminJoinedRef = useRef<boolean>(false);
  useEffect(() => {
    if (!isAdminMode || !eventId || !event || adminJoinedRef.current) return;

    const postAdminJoinMessage = async () => {
      const sessionKey = `admin_joined_${eventId}`;
      if (sessionStorage.getItem(sessionKey)) {
        adminJoinedRef.current = true;
        return;
      }

      try {
        const { data: existingAdmin } = await supabase
          .from("attendees")
          .select("id")
          .eq("event_id", eventId)
          .eq("display_name", "__ADMIN_MODERATOR__")
          .maybeSingle();

        let adminAttendeeId: string;

        if (existingAdmin) {
          adminAttendeeId = existingAdmin.id;
        } else {
          const { data: newAdmin, error: createError } = await supabase
            .from("attendees")
            .insert({
              event_id: eventId,
              display_name: "__ADMIN_MODERATOR__",
              qr_token: crypto.randomUUID(),
              checked_in_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (createError) {
            console.error("Failed to create admin moderator attendee:", createError);
            return;
          }
          adminAttendeeId = newAdmin.id;
        }

        const { error: msgError } = await supabase
          .from("after_party_messages")
          .insert({
            event_id: eventId,
            attendee_id: adminAttendeeId,
            role: "fan", // Moderator messages shown as fan role to differentiate from artist
            message: "🛡️ GoLokol Moderator joined the chat",
          });

        if (msgError) {
          console.error("Failed to post admin join message:", msgError);
        } else {
          sessionStorage.setItem(sessionKey, "true");
          adminJoinedRef.current = true;
          refetchMessages();
        }
      } catch (err) {
        console.error("Error posting admin join message:", err);
      }
    };

    postAdminJoinMessage();
  }, [isAdminMode, eventId, event, refetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (viewMode === "chat") {
      scrollToBottom();
    }
  }, [messages, viewMode]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !eventId) return;

    // For artist/admin mode, we don't need attendeeId - we'll create/use a system attendee
    if (!isPrivilegedMode && !attendeeId) return;

    setIsSending(true);
    try {
      let senderAttendeeId = attendeeId;

      if (isArtistMode) {
        // Get or create artist attendee
        const { data: existingArtist } = await supabase
          .from("attendees")
          .select("id")
          .eq("event_id", eventId)
          .eq("display_name", "__ARTIST_SYSTEM__")
          .maybeSingle();

        if (existingArtist) {
          senderAttendeeId = existingArtist.id;
        } else {
          const { data: newArtist, error: createError } = await supabase
            .from("attendees")
            .insert({
              event_id: eventId,
              display_name: "__ARTIST_SYSTEM__",
              qr_token: crypto.randomUUID(),
              checked_in_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (createError) throw createError;
          senderAttendeeId = newArtist.id;
        }
      } else if (isAdminMode) {
        // Get or create admin moderator attendee
        const { data: existingAdmin } = await supabase
          .from("attendees")
          .select("id")
          .eq("event_id", eventId)
          .eq("display_name", "__ADMIN_MODERATOR__")
          .maybeSingle();

        if (existingAdmin) {
          senderAttendeeId = existingAdmin.id;
        } else {
          const { data: newAdmin, error: createError } = await supabase
            .from("attendees")
            .insert({
              event_id: eventId,
              display_name: "__ADMIN_MODERATOR__",
              qr_token: crypto.randomUUID(),
              checked_in_at: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (createError) throw createError;
          senderAttendeeId = newAdmin.id;
        }
      }

      const { error } = await supabase.from("after_party_messages").insert({
        event_id: eventId,
        attendee_id: senderAttendeeId,
        role: isArtistMode ? "artist" : "fan",
        message: messageText.trim(),
      });

      if (error) throw error;
      setMessageText("");
      refetchMessages();
    } catch (err: any) {
      console.error("Send message error:", err);
      toast.error("Failed to send message");
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

  // Calculate room closure time (24 hours from after_party_opens_at)
  const getRoomClosureInfo = () => {
    if (!event?.after_party_opens_at) return null;
    const openedAt = new Date(event.after_party_opens_at);
    const closesAt = addDays(openedAt, 1);
    const hoursRemaining = Math.max(0, Math.floor((closesAt.getTime() - Date.now()) / (1000 * 60 * 60)));
    
    if (hoursRemaining <= 0) return "Closing soon";
    if (hoursRemaining === 1) return "Closes in 1 hour";
    if (hoursRemaining < 24) return `Closes in ${hoursRemaining} hours`;
    return "Closes in 24 hours";
  };

  // Check if the After Party has expired (24 hours after opening)
  const isPartyExpired = (): boolean => {
    if (!event?.after_party_opens_at) return false;
    const openedAt = new Date(event.after_party_opens_at);
    const closesAt = addDays(openedAt, 1);
    return isAfter(new Date(), closesAt);
  };
  
  // Calculate expiration early (before event loads, using direct query if needed)
  // Party is expired if: status is 'ended' OR 24 hours have passed since after_party_opens_at
  const checkExpirationFromEvent = (eventData: EventData | null): boolean => {
    if (!eventData) return false;
    
    // Check if event status is explicitly 'ended'
    if (eventData.status === 'ended') return true;
    
    // Check if 24 hours have passed since party opened
    if (eventData.after_party_opens_at) {
      const openedAt = new Date(eventData.after_party_opens_at);
      const closesAt = addDays(openedAt, 1);
      return isAfter(new Date(), closesAt);
    }
    
    return false;
  };

  // Validate YouTube livestream URL - accepts all valid YouTube URL formats
  const getValidLivestreamId = () => {
    if (!event?.livestream_url) return null;
    
    // extractYouTubeId handles all formats including youtube.com/live/
    return extractYouTubeId(event.livestream_url);
  };

  // Navigate to artist control room
  const handleGoToControl = () => {
    if (eventId && artistToken) {
      navigate(`/artist/event/${eventId}?token=${artistToken}`);
    }
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

  // Fan access checks (not for artist or admin mode)
  if (!isPrivilegedMode) {
    // First check if party is expired - block fans immediately
    const partyExpired = checkExpirationFromEvent(event);
    if (partyExpired && !isLoading && event) {
      // Show expired overlay for fans trying to enter expired party
      return (
        <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
              <Clock size={28} className="text-muted-foreground" />
            </div>
            <h1 className="font-display font-bold text-foreground text-3xl leading-tight">
              The Party is over!<br />See you at the next.
            </h1>
            <p className="text-muted-foreground font-sans">
              This After Party has ended. Thanks for being here!
            </p>
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
  const isExpired = isPartyExpired();
  const isPaused = event.admin_state === "paused";
  const isArchived = event.admin_state === "archived";

  // Build attribution text from partner data
  const curatorName = event.curator?.name || event.curator_other_name || null;
  const venueName = event.venue?.name || event.venue_other_name || null;
  const attributionText = buildAttribution(artistName, curatorName, venueName);
  // Paused/Archived overlays block access for both fans and artists
  if (isPaused) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto">
            <Clock size={28} className="text-orange-400" />
          </div>
          <h1 className="font-display font-bold text-foreground text-xl leading-tight">
            We have paused this After Party due to actions against Terms of Service.
          </h1>
          <p className="text-muted-foreground font-sans">
            Artist or Band should contact GoLokol immediately at{" "}
            <a href="mailto:backstage@golokol.app" className="text-primary underline">
              backstage@golokol.app
            </a>{" "}
            to reinstate.
          </p>
        </div>
      </div>
    );
  }

  if (isArchived) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
            <Clock size={28} className="text-muted-foreground" />
          </div>
          <h1 className="font-display font-bold text-foreground text-xl leading-tight">
            This After Party has been closed.
          </h1>
          <p className="text-muted-foreground font-sans">
            We hope to see you at the next one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col">
      {/* No Re-Entry Overlay - shown once for fans on first entry */}
      {showNoReentryOverlay && eventId && (
        <NoReentryOverlay 
          eventId={eventId} 
          onEnter={() => setShowNoReentryOverlay(false)} 
        />
      )}
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
            {isExpired && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded font-sans">
                Ended
              </span>
            )}
            {isArtistMode && !isExpired && (
              <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-sans">
                Artist Mode
              </span>
            )}
            <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Users size={14} />
              <span className="text-sm font-sans font-medium">{attendeeCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* View Content - Keep both views mounted, toggle visibility with CSS */}
      {/* Welcome Dashboard - always mounted for fans to preserve livestream state */}
      {!isArtistMode && (
        <div className={viewMode === "welcome" ? "block" : "hidden"}>
          <WelcomeDashboard
            artistName={artistName}
            eventId={eventId || ""}
            eventTitle={event.title}
            livestreamId={livestreamId}
            roomClosureInfo={roomClosureInfo}
            flyerImageUrl={event.image_url}
            attributionText={attributionText}
            merchLink={event.merch_link}
            musicLink={event.music_link}
            isExpired={isExpired}
            afterPartyOpensAt={event.after_party_opens_at}
            onGoToChat={() => setViewMode("chat")}
          />
        </div>
      )}
      
      {/* Chat View - always mounted to preserve scroll position and input state */}
      <div className={viewMode === "chat" || isArtistMode ? "block" : "hidden"}>
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
          isArtistMode={isArtistMode}
          isExpired={isExpired}
          eventId={eventId || ""}
        />
      </div>

      {/* Persistent Bottom Toggle - Hide Artist Control when expired */}
      <ViewToggle 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        isArtistMode={isArtistMode}
        onGoToControl={handleGoToControl}
        isExpired={isExpired}
      />
    </div>
  );
};

// Helper to build attribution text
const buildAttribution = (
  artistName: string,
  curatorName: string | null,
  venueName: string | null
): string | null => {
  // If both curator and venue exist, show combined format
  if (curatorName && venueName) {
    return `This ${artistName} After Party is brought to you by ${curatorName} at ${venueName}.`;
  }
  // If only venue exists
  if (venueName) {
    return `This ${artistName} After Party is brought to you by ${venueName}.`;
  }
  // No attribution
  return null;
};

// Welcome Dashboard View
interface WelcomeDashboardProps {
  artistName: string;
  eventId: string;
  eventTitle: string;
  livestreamId: string | null;
  roomClosureInfo: string | null;
  flyerImageUrl: string | null;
  attributionText: string | null;
  merchLink: string | null;
  musicLink: string | null;
  isExpired?: boolean;
  afterPartyOpensAt: string | null;
  onGoToChat: () => void;
}

// Real-time countdown hook for fan view
const useRealTimeCountdown = (afterPartyOpensAt: string | null) => {
  const [countdown, setCountdown] = useState<string>("24:00:00");
  const [hasStarted, setHasStarted] = useState(false);
  const [isExpiredLocal, setIsExpiredLocal] = useState(false);

  useEffect(() => {
    if (!afterPartyOpensAt) {
      setCountdown("24:00:00");
      setHasStarted(false);
      setIsExpiredLocal(false);
      return;
    }

    setHasStarted(true);

    const calculateCountdown = () => {
      const openTime = new Date(afterPartyOpensAt).getTime();
      const endTime = openTime + 24 * 60 * 60 * 1000; // 24 hours after opening
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setCountdown("00:00:00");
        setIsExpiredLocal(true);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsExpiredLocal(false);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [afterPartyOpensAt]);

  return { countdown, hasStarted, isExpiredLocal };
};

const WelcomeDashboard = ({
  artistName,
  eventId,
  eventTitle,
  livestreamId,
  roomClosureInfo,
  flyerImageUrl,
  attributionText,
  merchLink,
  musicLink,
  isExpired = false,
  afterPartyOpensAt,
  onGoToChat,
}: WelcomeDashboardProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const { countdown, hasStarted, isExpiredLocal } = useRealTimeCountdown(afterPartyOpensAt);

  const handleEmailSubmit = async () => {
    if (!email.trim() || !eventId) return;
    
    setIsSubmittingEmail(true);
    try {
      const { error } = await supabase
        .from("email_optins")
        .insert({ event_id: eventId, email: email.trim() });
      
      if (error) {
        // Check for duplicate
        if (error.code === "23505") {
          toast.info("You're already signed up!");
          setEmailSubmitted(true);
        } else {
          throw error;
        }
      } else {
        toast.success("You're on the list!");
        setEmailSubmitted(true);
      }
    } catch (err: any) {
      console.error("Email opt-in error:", err);
      toast.error("Failed to sign up. Try again.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleDownloadBadge = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const canvasSize = 800;
      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // Load badge frame
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = reject;
        frameImg.src = badgeFrame;
      });

      // Draw badge frame as background
      ctx.drawImage(frameImg, 0, 0, canvasSize, canvasSize);

      // Load and draw flyer image if available
      if (flyerImageUrl) {
        const flyerImg = new Image();
        flyerImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          flyerImg.onload = () => resolve();
          flyerImg.onerror = reject;
          flyerImg.src = flyerImageUrl;
        });

        // Calculate flyer circle position (60% size, top: 42%)
        const flyerSize = canvasSize * 0.6;
        const flyerX = (canvasSize - flyerSize) / 2;
        const flyerY = canvasSize * 0.42 - flyerSize / 2;
        const flyerRadius = flyerSize / 2;
        const flyerCenterX = flyerX + flyerRadius;
        const flyerCenterY = flyerY + flyerRadius;

        // Draw circular flyer with border
        ctx.save();
        ctx.beginPath();
        ctx.arc(flyerCenterX, flyerCenterY, flyerRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw the flyer image to cover the circle
        const imgAspect = flyerImg.width / flyerImg.height;
        let drawWidth = flyerSize;
        let drawHeight = flyerSize;
        if (imgAspect > 1) {
          drawHeight = flyerSize;
          drawWidth = flyerSize * imgAspect;
        } else {
          drawWidth = flyerSize;
          drawHeight = flyerSize / imgAspect;
        }
        const drawX = flyerCenterX - drawWidth / 2;
        const drawY = flyerCenterY - drawHeight / 2;
        ctx.drawImage(flyerImg, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        // Draw black border around flyer circle
        ctx.beginPath();
        ctx.arc(flyerCenterX, flyerCenterY, flyerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 8;
        ctx.stroke();
      }

      // Convert canvas to blob and download
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to create badge image");
          setIsDownloading(false);
          return;
        }
        
        const safeTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        const fileName = `golokol-badge-${safeTitle}.png`;
        
        // On mobile, use Web Share API to trigger native "Save to Photos" behavior
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile && navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: "image/png" });
            const shareData = { files: [file] };
            
            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              toast.success("Badge saved to photos!");
              setIsDownloading(false);
              return;
            }
          } catch (shareError: any) {
            // User cancelled or share failed - fall through to standard download
            if (shareError.name === "AbortError") {
              setIsDownloading(false);
              return;
            }
            console.log("Share API failed, falling back to download:", shareError);
          }
        }
        
        // Desktop fallback: standard download
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Badge saved!");
        setIsDownloading(false);
      }, "image/png");
    } catch (error) {
      console.error("Failed to download badge:", error);
      toast.error("Failed to download badge");
      setIsDownloading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-4">
        {/* Partner Attribution - Subtle secondary text */}
        {attributionText && (
          <p className="text-muted-foreground text-sm font-sans text-center leading-relaxed">
            {attributionText}
          </p>
        )}

        {/* Section A: Livestream (Highest Priority) */}
        {livestreamId ? (
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
        ) : (
          <div className="bg-[#1A1A1A] border border-border/30 rounded-xl p-6 text-center">
            <p className="text-muted-foreground font-sans text-sm">
              No livestream scheduled
            </p>
          </div>
        )}

        {/* Section B: Gift Shop */}
        {(merchLink || musicLink) && (
          <div className="bg-[#1A1A1A] border border-primary/30 rounded-xl p-5">
            <h3 className="font-display font-bold text-foreground text-lg mb-4">
              {artistName} Gift Shop
            </h3>
            <div className="flex gap-3">
              {merchLink && (
                <a
                  href={merchLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans">
                    <ShoppingBag size={18} className="mr-2" />
                    Merch
                  </Button>
                </a>
              )}
              {musicLink && (
                <a
                  href={musicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans">
                    <Music size={18} className="mr-2" />
                    Music
                  </Button>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Section C: Email Opt-in */}
        <div className="bg-[#1A1A1A] border border-border/30 rounded-xl p-5" data-ph-mask>
          <div className="flex items-center gap-2 mb-3">
            <Mail size={16} className="text-primary" />
            <h3 className="font-sans font-medium text-foreground text-sm">
              Get notified about the next show & After Party
            </h3>
          </div>
          {emailSubmitted ? (
            <p className="text-primary font-sans text-sm">✓ You're on the list!</p>
          ) : (
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-[#0B0B0B] border-border/30 focus:border-primary font-sans"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleEmailSubmit();
                  }
                }}
              />
              <Button
                onClick={handleEmailSubmit}
                disabled={!email.trim() || isSubmittingEmail}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans shrink-0"
              >
                {isSubmittingEmail ? "..." : "Sign Up"}
              </Button>
            </div>
          )}
        </div>

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
            <div className="relative w-60 h-60 md:w-72 md:h-72">
              {/* Badge Frame - SVG behind the flyer */}
              <img 
                src={badgeFrame} 
                alt="Badge frame" 
                className="absolute inset-0 w-full h-full z-0 pointer-events-none"
              />
              
              {/* Flyer Image - In front of the badge frame */}
              {flyerImageUrl && (
                <div 
                  className="absolute overflow-hidden rounded-full z-20"
                  style={{
                    width: '60%',
                    height: '60%',
                    top: '42%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '4px solid #000',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                  }}
                >
                  <img 
                    src={flyerImageUrl} 
                    alt={eventTitle}
                    className="w-full h-full object-cover object-center"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              
              {/* Fallback if no flyer */}
              {!flyerImageUrl && (
                <div 
                  className="absolute overflow-hidden rounded-full bg-muted/20 flex items-center justify-center z-20"
                  style={{
                    width: '60%',
                    height: '60%',
                    top: '42%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '4px solid #000',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                  }}
                >
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

        {/* House Rules Card */}
        <div className="bg-[#1A1A1A] rounded-xl p-5">
          <h3 className="font-display font-bold text-foreground text-lg mb-3">
            House Rules
          </h3>
          
          {/* Real-time Countdown - Roboto Bold for numeric displays */}
          <div className="bg-black/50 rounded-lg p-3 mb-4 flex items-center justify-between border border-primary/20">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span className="text-muted-foreground font-sans text-sm">Time Left</span>
            </div>
            <span 
              className="text-primary text-xl font-bold" 
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}
            >
              {isExpiredLocal ? "After Party ended" : (hasStarted ? countdown : "24:00:00")}
            </span>
          </div>
          
          <ul className="space-y-2 text-muted-foreground font-sans text-sm">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>This room is final exit. Keep tab open to stay in.</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>This room is only for fans who were checked in tonight</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Be respectful to everyone in the room</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>No spam or self-promotion</span>
            </li>
          </ul>
        </div>


        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={onGoToChat}
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans font-medium py-6 text-base"
          >
            Go to Chat
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
  isArtistMode?: boolean;
  isExpired?: boolean;
  eventId?: string;
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
  isArtistMode = false,
  isExpired = false,
  eventId = "",
}: ChatViewProps) => {
  const [endStateEmail, setEndStateEmail] = useState("");
  const [isSubmittingEndEmail, setIsSubmittingEndEmail] = useState(false);
  const [endEmailSubmitted, setEndEmailSubmitted] = useState(false);

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
      <main className="flex-1 overflow-y-auto px-4 py-4" data-ph-mask>
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
              const isOwn = isArtistMode ? isArtist : msg.attendee_id === currentAttendeeId;
              const displayName = msg.attendees?.display_name;
              
              // Handle system display names
              const isAdmin = displayName === "__ADMIN_MODERATOR__";
              const cleanDisplayName = (displayName === "__ARTIST_SYSTEM__" || displayName === "__ADMIN_MODERATOR__") ? null : displayName;
              
              // Determine sender name - admin shows as "GoLokol Moderator"
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
                    {/* Sender Name */}
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

      {/* End State Overlay for Expired Parties */}
      {isExpired && (
        <div className="fixed inset-0 z-50 bg-[#0B0B0B]/95 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Artist or already opted-in fan - simple message */}
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
              /* Fan who hasn't opted in - full opt-in overlay */
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

      {/* Input Area - Text Only (hidden when expired) */}
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
      )}
    </div>
  );
};


// View Toggle Component
interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isArtistMode?: boolean;
  onGoToControl?: () => void;
  isExpired?: boolean;
}

const ViewToggle = ({ viewMode, setViewMode, isArtistMode = false, onGoToControl, isExpired = false }: ViewToggleProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B] border-t border-border/20 px-4 py-3 safe-area-pb">
      <div className="flex justify-center gap-2 max-w-xs mx-auto">
        {/* Fans see Welcome + Chat */}
        {!isArtistMode && (
          <>
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
          </>
        )}
        
        {/* Artists see Chat + Artist Control (hide control when expired) */}
        {isArtistMode && (
          <>
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
            {!isExpired && (
              <button
                onClick={onGoToControl}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
              >
                <Settings size={18} />
                <span>Artist Control</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AfterPartyRoom;
