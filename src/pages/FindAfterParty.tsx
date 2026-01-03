import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FindAfterParty = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["after-parties-enabled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("after_party_enabled", true)
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">
            Find an After Party
          </h1>

          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !events || events.length === 0 ? (
            <div className="text-muted-foreground">No upcoming after parties found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
                >
                  <h2 className="font-display text-xl text-foreground">{event.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.start_at), "MMM d, yyyy · h:mm a")}</span>
                  </div>
                  <Link to={`/after-party/${event.id}`} className="mt-auto pt-2">
                    <Button variant="secondary" size="sm" className="w-full">
                      View After Party
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindAfterParty;
