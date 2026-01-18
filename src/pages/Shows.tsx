import { Link } from "react-router-dom";
import { Music, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AfterPartyCard from "@/components/AfterPartyCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Event {
  id: string;
  title: string;
  artist_name: string | null;
  start_at: string;
  city: string | null;
  venue_name: string | null;
  genres: string[] | null;
  youtube_url: string | null;
  image_url: string | null;
}

const Shows = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["shows-after-parties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, artist_name, start_at, city, venue_name, genres, youtube_url, image_url")
        .eq("type", "after_party")
        .eq("after_party_enabled", true)
        .eq("admin_state", "active")
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
              UPCOMING <span className="text-primary">LOKOL</span> AFTER PARTIES
            </h1>
            <p className="text-muted-foreground text-lg">Discover live music and after show antics online.</p>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Music className="h-10 w-10 text-primary" />
              </div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <AfterPartyCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  artistName={event.artist_name}
                  startAt={event.start_at}
                  city={event.city}
                  venueName={event.venue_name}
                  genres={event.genres}
                  youtubeUrl={event.youtube_url}
                  imageUrl={event.image_url}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Music className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl text-foreground mb-4">NO UPCOMING SHOWS</h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                Check back soon for upcoming events!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/create-afterparty">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Create an Afterparty
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shows;