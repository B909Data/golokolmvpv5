import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { addDays, isAfter } from "date-fns";
import { Clock } from "lucide-react";
import { extractYouTubeId } from "@/lib/youtube";
import { toast } from "sonner";
import NoReentryOverlay from "@/components/NoReentryOverlay";

// New refactored components
import WelcomeTab from "@/components/afterparty/WelcomeTab";
import ChatTab from "@/components/afterparty/ChatTab";
import RoomHeader from "@/components/afterparty/RoomHeader";
import ViewToggle from "@/components/afterparty/ViewToggle";

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
  after_party_expires_at: string | null;
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

type ViewMode = "welcome" | "chat";

const AfterPartyRoom = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminMode = searchParams.get("admin") === "1";
  const urlToken = searchParams.get("token");
  const artistToken = searchParams.get("artist_token");
  
  const [viewMode, setViewMode] = useState<ViewMode>("welcome");
  const [isSending, setIsSending] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [showNoReentryOverlay, setShowNoReentryOverlay] = useState(false);
  const artistJoinedRef = useRef<boolean>(false);
  const adminJoinedRef = useRef<boolean>(false);

  const isArtistMode = !!artistToken;
  const isPrivilegedMode = isArtistMode || isAdminMode;

  const storedAttendeeId = eventId ? localStorage.getItem(`attendee_${eventId}`) : null;
  const storedQrToken = eventId ? localStorage.getItem(`attendee_qr_${eventId}`) : null;

  // Attendee check-in query
  const { data: attendeeData, isLoading: isCheckingIn, error: attendeeError } = useQuery({
    queryKey: ["attendee-checkin", eventId, urlToken, storedAttendeeId],
    queryFn: async () => {
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

  // Store attendee info from URL token
  useEffect(() => {
    if (urlToken && eventId && attendeeData) {
      localStorage.setItem(`attendee_${eventId}`, attendeeData.id);
      localStorage.setItem(`attendee_qr_${eventId}`, attendeeData.qr_token || urlToken);
    }
  }, [urlToken, eventId, attendeeData]);

  const attendeeId = attendeeData?.id || storedAttendeeId;
  const qrToken = attendeeData?.qr_token || urlToken || storedQrToken;

  // Access gate for fans
  useEffect(() => {
    if (!eventId || isPrivilegedMode) return;

    if (!urlToken && !storedAttendeeId) {
      navigate(`/after-party/${eventId}`, { replace: true });
      return;
    }

    if (!isCheckingIn && attendeeError) {
      setAccessError("Unable to verify access. Please try again.");
      return;
    }

    if (!isCheckingIn && !attendeeData) {
      navigate(`/after-party/${eventId}`, { replace: true });
      return;
    }

    if (!isCheckingIn && attendeeData && !attendeeData.checked_in_at) {
      const token = attendeeData.qr_token || qrToken;
      if (token) {
        navigate(`/after-party/${eventId}/pass?token=${token}`, { replace: true });
      } else {
        navigate(`/after-party/${eventId}`, { replace: true });
      }
    }
  }, [urlToken, storedAttendeeId, attendeeData, attendeeError, eventId, qrToken, navigate, isCheckingIn, isPrivilegedMode]);

  // Set initial view mode
  useEffect(() => {
    if (isPrivilegedMode) {
      setViewMode("chat");
    } else {
      setViewMode("welcome");
    }
  }, [isPrivilegedMode]);

  // Event data query
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

  // Realtime subscription for event updates
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

  // Attendee count
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

  // Messages state and query
  const [messages, setMessages] = useState<Message[]>([]);
  
  const { refetch: refetchMessages } = useQuery({
    queryKey: ["after-party-messages", eventId],
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase
        .from("after_party_messages")
        .select("id, role, message, created_at, attendee_id, attendees(display_name)")
        .eq("event_id", eventId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      return data || [];
    },
    enabled: !!eventId && (isArtistMode || (!!attendeeId && !!attendeeData?.checked_in_at)),
  });

  // Realtime subscription for messages
  useEffect(() => {
    if (!eventId) return;
    if (!isArtistMode && (!attendeeId || !attendeeData?.checked_in_at)) return;

    const channel = supabase
      .channel(`after_party_messages_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'after_party_messages',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const newMsg = payload.new as { id: string; role: string; message: string | null; created_at: string | null; attendee_id: string; event_id: string };
          
          const { data: attendeeInfo } = await supabase
            .from("attendees")
            .select("display_name")
            .eq("id", newMsg.attendee_id)
            .maybeSingle();
          
          const fullMessage: Message = {
            id: newMsg.id,
            role: newMsg.role,
            message: newMsg.message,
            created_at: newMsg.created_at,
            attendee_id: newMsg.attendee_id,
            attendees: attendeeInfo ? { display_name: attendeeInfo.display_name } : null,
          };
          
          setMessages((prev) => {
            if (prev.some(m => m.id === fullMessage.id)) return prev;
            return [...prev, fullMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'after_party_messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setMessages((prev) => prev.filter(m => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, attendeeId, attendeeData?.checked_in_at, isArtistMode]);

  // No-reentry overlay check
  useEffect(() => {
    if (isPrivilegedMode || !eventId) return;
    if (!attendeeData?.checked_in_at) return;
    
    const seenKey = `afterPartyNoReentrySeen_${eventId}`;
    const alreadySeen = localStorage.getItem(seenKey);
    
    if (!alreadySeen) {
      setShowNoReentryOverlay(true);
    }
  }, [isPrivilegedMode, eventId, attendeeData?.checked_in_at]);

  // Artist join message + SMS
  useEffect(() => {
    if (!isArtistMode || !eventId || !event || artistJoinedRef.current) return;

    const postArtistJoinMessage = async () => {
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

          if (createError) return;
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

        if (!msgError) {
          sessionStorage.setItem(sessionKey, "true");
          artistJoinedRef.current = true;
          refetchMessages();
          
          try {
            await supabase.functions.invoke("send-artist-entered-sms", {
              body: { event_id: eventId, token: artistToken },
            });
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

  // Admin join message
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

          if (createError) return;
          adminAttendeeId = newAdmin.id;
        }

        const { error: msgError } = await supabase
          .from("after_party_messages")
          .insert({
            event_id: eventId,
            attendee_id: adminAttendeeId,
            role: "fan",
            message: "🛡️ GoLokol Moderator joined the chat",
          });

        if (!msgError) {
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

  // Send message handler
  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || !eventId) return;
    if (!isPrivilegedMode && !attendeeId) return;

    setIsSending(true);
    try {
      let senderAttendeeId = attendeeId;

      if (isArtistMode) {
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
      refetchMessages();
    } catch (err: any) {
      console.error("Send message error:", err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  // Check party expiration
  const isPartyExpired = (): boolean => {
    if (!event?.after_party_opens_at) return false;
    const openedAt = new Date(event.after_party_opens_at);
    const closesAt = addDays(openedAt, 1);
    return isAfter(new Date(), closesAt);
  };

  const checkExpirationFromEvent = (eventData: EventData | null): boolean => {
    if (!eventData) return false;
    if (eventData.status === 'ended') return true;
    if (eventData.after_party_opens_at) {
      const openedAt = new Date(eventData.after_party_opens_at);
      const closesAt = addDays(openedAt, 1);
      return isAfter(new Date(), closesAt);
    }
    return false;
  };

  const getValidLivestreamId = () => {
    if (!event?.livestream_url) return null;
    return extractYouTubeId(event.livestream_url);
  };

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

  // Fan access checks
  if (!isPrivilegedMode) {
    const partyExpired = checkExpirationFromEvent(event);
    if (partyExpired && !isLoading && event) {
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
  const isExpired = isPartyExpired();
  const isPaused = event.admin_state === "paused";
  const isArchived = event.admin_state === "archived";

  // Partner names for attribution
  const curatorName = event.curator?.name || event.curator_other_name || null;
  const venueName = event.venue?.name || event.venue_other_name || null;

  // Paused/Archived overlays
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
      {/* No Re-Entry Overlay */}
      {showNoReentryOverlay && eventId && (
        <NoReentryOverlay 
          eventId={eventId} 
          onEnter={() => setShowNoReentryOverlay(false)} 
        />
      )}

      {/* Sticky Header */}
      <RoomHeader
        eventTitle={event.title}
        city={event.city}
        startAt={event.start_at}
        attendeeCount={attendeeCount}
        isExpired={isExpired}
        isArtistMode={isArtistMode}
      />

      {/* Welcome Tab - for fans only, toggles visibility */}
      {!isArtistMode && (
        <div className={viewMode === "welcome" ? "block" : "hidden"}>
          <WelcomeTab
            artistName={artistName}
            eventTitle={event.title}
            pinnedMessage={event.pinned_message}
            curatorName={curatorName}
            venueName={venueName}
            onGoToChat={() => setViewMode("chat")}
          />
        </div>
      )}
      
      {/* Chat Tab - always available */}
      <div className={viewMode === "chat" || isArtistMode ? "block" : "hidden"}>
        <ChatTab
          eventId={eventId || ""}
          messages={messages}
          artistName={artistName}
          currentAttendeeId={attendeeId || ""}
          livestreamId={livestreamId}
          merchLink={event.merch_link}
          musicLink={event.music_link}
          isArtistMode={isArtistMode}
          isExpired={isExpired}
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </div>

      {/* Bottom Toggle */}
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

export default AfterPartyRoom;
