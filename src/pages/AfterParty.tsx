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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-muted border border-border rounded-lg p-6 max-w-xl w-full font-mono text-sm">
          <h2 className="text-lg font-bold mb-4">Debug: AfterParty</h2>
          
          <div className="space-y-2">
            <p><strong>supabaseUrl (env):</strong> {import.meta.env.VITE_SUPABASE_URL ?? "undefined"}</p>
            <p><strong>supabaseUrl (client):</strong> {(supabase as any).supabaseUrl ?? "undefined"}</p>
            <p><strong>eventId:</strong> {eventId ?? <span className="text-destructive">Missing eventId</span>}</p>
            <p><strong>loading:</strong> {String(isLoading)}</p>
            <p><strong>error:</strong> {error ? <span className="text-destructive">{JSON.stringify(error, null, 2)}</span> : "null"}</p>
            <div>
              <strong>event:</strong>
              <pre className="mt-1 bg-background p-2 rounded overflow-auto max-h-48">
                {event ? JSON.stringify(event, null, 2) : "null"}
              </pre>
            </div>

            {joinedAttendeeId && (
              <p className="mt-4 text-green-600 font-bold">Joined ✅ attendee_id: {joinedAttendeeId}</p>
            )}

            {joinError && (
              <p className="mt-4 text-destructive"><strong>Join error:</strong> {joinError}</p>
            )}

            <Button 
              onClick={handleJoinAfterParty} 
              disabled={isJoining || !eventId}
              className="mt-4"
            >
              {isJoining ? "Joining..." : "Join After Party"}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterParty;
