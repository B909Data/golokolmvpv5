import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

type EventData = {
  id: string;
  title: string;
  status: string;
  start_at: string;
  after_party_opens_at: string;
} | null;

const AfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [joinedAttendeeId, setJoinedAttendeeId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

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

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async (): Promise<EventData> => {
      try {
        const { data, error } = await (supabase as any)
          .from("events")
          .select("id, title, status, start_at, after_party_opens_at")
          .eq("id", eventId)
          .maybeSingle();

        if (error) {
          console.error("Supabase fetch error:", error);
          throw error;
        }
        return data as EventData;
      } catch (err) {
        console.error("Query error:", err);
        throw err;
      }
    },
    enabled: !!eventId,
    retry: false,
  });

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="mt-2 text-muted-foreground">{event.status}</p>

          {joinedAttendeeId ? (
            <p className="mt-6 font-medium">You're in.</p>
          ) : (
            <>
              {joinError && (
                <p className="mt-4 text-destructive">{joinError}</p>
              )}
              <Button
                onClick={handleJoinAfterParty}
                disabled={isJoining}
                className="mt-6"
              >
                {isJoining ? "Joining..." : "Join After Party"}
              </Button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterParty;
