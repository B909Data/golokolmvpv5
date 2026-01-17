import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

type EventData = {
  id: string;
  title: string;
  status: string;
  start_at: string;
  after_party_opens_at: string;
} | null;

// Light US phone validation
const isValidUSPhone = (phone: string): boolean => {
  if (!phone.trim()) return true;
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith("1"));
};

const AfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");

  // Check if already joined
  const existingAttendeeId = eventId ? localStorage.getItem(`afterparty-attendee-${eventId}`) : null;

  // If already joined, redirect to room
  useEffect(() => {
    if (existingAttendeeId && eventId) {
      navigate(`/after-party/${eventId}/room`, { replace: true });
    }
  }, [existingAttendeeId, eventId, navigate]);

  const handleJoinAfterParty = async () => {
    if (!eventId) return;
    
    const trimmedName = displayName.trim();
    
    if (!trimmedName) {
      setJoinError("Display name is required");
      return;
    }

    // Validate phone if provided
    if (phone.trim() && !isValidUSPhone(phone)) {
      setJoinError("Please enter a valid US phone number (10 digits).");
      return;
    }
    
    setIsJoining(true);
    setJoinError(null);

    // Generate QR token for consistency with other flows
    const qrToken = crypto.randomUUID();

    console.log("[AfterParty Join] Starting join:", { eventId, displayName: trimmedName, hasPhone: !!phone.trim() });

    const { data, error } = await supabase
      .from("attendees")
      .insert({ 
        event_id: eventId, 
        checkin_method: "qr",
        display_name: trimmedName,
        phone: phone.trim() || null,
        qr_token: qrToken,
        checked_in_at: new Date().toISOString(), // Mark as checked in immediately (they're at the venue)
      })
      .select("id, qr_token")
      .single();

    setIsJoining(false);

    if (error) {
      console.error("[AfterParty Join] Insert failed:", error);
      setJoinError(error.message);
    } else if (data) {
      console.log("[AfterParty Join] Success - attendee created:", { id: data.id, qr_token: data.qr_token });
      
      // Store attendee info in localStorage (consistent with other flows)
      localStorage.setItem(`afterparty-attendee-${eventId}`, data.id);
      localStorage.setItem(`attendee_${eventId}`, data.id);
      localStorage.setItem(`attendee_qr_${eventId}`, data.qr_token);
      
      // Navigate to room with token - NoReentryOverlay will show on first visit
      console.log("[AfterParty Join] Navigating to room with token");
      navigate(`/after-party/${eventId}/room?token=${data.qr_token}`);
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

  const isFormValid = displayName.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{event.title}</h1>
            <p className="text-muted-foreground mb-2">{formattedDate}</p>
            <p className="text-muted-foreground">
              {attendeeCount} {attendeeCount === 1 ? "person" : "people"} here
            </p>
          </div>

          <div className="space-y-4 text-left mb-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isJoining}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-bold">
                Phone number (optional) — get a text when the artist enters
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isJoining}
              />
              <p className="text-foreground font-semibold text-sm">
                We ONLY use this to alert you when the artist enters the After Party.
                <br />
                Your number is not shared with the artist or any third parties.
              </p>
              <p className="text-muted-foreground text-xs">
                Msg & data rates may apply.
              </p>
            </div>
          </div>

          {joinError && (
            <p className="text-destructive mb-4 text-sm">{joinError}</p>
          )}

          <Button
            size="lg"
            onClick={handleJoinAfterParty}
            disabled={isJoining || !isFormValid}
            className="px-8 py-6 text-lg w-full"
          >
            {isJoining ? "Joining..." : "Join Party"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterParty;
