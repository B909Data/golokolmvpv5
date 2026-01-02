import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("id, title, status, start_at, after_party_opens_at")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data as { id: string; title: string; status: string; start_at: string; after_party_opens_at: string } | null;
    },
    enabled: !!eventId,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-8">
        {isLoading ? (
          <p>Loading After Party…</p>
        ) : !event ? (
          <p>Event not found.</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold">After Party</h1>
            <p>{event.title}</p>
            <p>{event.status}</p>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AfterParty;
