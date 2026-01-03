import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RSVPConfirmed = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("id, title, ticket_url")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Event not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-md mx-auto w-full text-center">
          <div className="mb-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              You're RSVP'd!
            </h1>
            <p className="text-muted-foreground">
              Check your texts for your QR + link.
            </p>
          </div>

          <div className="space-y-4">
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="default" className="w-full">
                  Buy Ticket
                </Button>
              </a>
            )}

            <Link to={`/after-party/${eventId}`} className="block">
              <Button variant="secondary" className="w-full">
                View Event
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RSVPConfirmed;
