import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AfterPartyCard from "@/components/AfterPartyCard";
import { Plus, Music, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ArtistEvent {
  id: string;
  title: string;
  artist_name: string | null;
  start_at: string;
  city: string | null;
  venue_name: string | null;
  status: string;
  genres: string[] | null;
  youtube_url: string | null;
  image_url: string | null;
  fixed_price: number | null;
}

const ArtistAfterParties = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pastOpen, setPastOpen] = useState(false);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/artist/login", { replace: true });
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/artist/login", { replace: true });
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch artist's events - ONLY events owned by this artist
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["artist-owned-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("id, title, artist_name, start_at, city, venue_name, status, genres, youtube_url, image_url, fixed_price")
        .eq("artist_user_id", user.id)
        .order("start_at", { ascending: false });

      if (error) {
        console.error("Error fetching artist events:", error);
        return [];
      }
      return data as ArtistEvent[];
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-24 px-4 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Sort: upcoming + live first (soonest first), ended last (most recent first)
  const upcomingAndLive = (events || [])
    .filter(e => e.status === "upcoming" || e.status === "live")
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  
  const pastEvents = (events || [])
    .filter(e => e.status === "ended")
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  const hasEvents = events && events.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-display text-3xl sm:text-4xl text-foreground">
              YOUR AFTER PARTIES
            </h1>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="shrink-0">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <p className="text-muted-foreground text-sm mb-8">
            Tap an After Party to open your Control Room.
          </p>

          {/* Create New Button */}
          <Link to="/create-afterparty" className="block mb-8">
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Create New After Party
            </Button>
          </Link>

          {/* Events List */}
          {eventsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your After Parties...</p>
            </div>
          ) : hasEvents ? (
            <div className="space-y-8">
              {/* Upcoming & Live Events */}
              {upcomingAndLive.length > 0 && (
                <section className="space-y-4">
                  {upcomingAndLive.map(event => (
                    <div key={event.id} className="relative">
                      {/* Status badge */}
                      {event.status === "live" && (
                        <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-primary text-primary-foreground text-xs font-sans font-medium rounded-full flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                          LIVE
                        </div>
                      )}
                      {event.status === "upcoming" && (
                        <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-muted text-muted-foreground text-xs font-sans font-medium rounded-full">
                          UPCOMING
                        </div>
                      )}
                      <AfterPartyCard
                        id={event.id}
                        title={event.title}
                        artistName={event.artist_name}
                        startAt={event.start_at}
                        city={event.city}
                        venueName={event.venue_name}
                        genres={event.genres}
                        youtubeUrl={event.youtube_url}
                        imageUrl={event.image_url}
                        showRsvpButton={true}
                        ctaText="Artist Controls"
                        onRsvpClick={() => navigate(`/artist/event/${event.id}`)}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* Past Events - Collapsible */}
              {pastEvents.length > 0 && (
                <Collapsible open={pastOpen} onOpenChange={setPastOpen}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between py-3 border-t border-border text-muted-foreground hover:text-foreground transition-colors">
                      <span className="font-display text-lg">
                        PAST AFTER PARTIES ({pastEvents.length})
                      </span>
                      {pastOpen ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    {pastEvents.map(event => (
                      <div key={event.id} className="relative opacity-75">
                        <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-muted text-muted-foreground text-xs font-sans font-medium rounded-full">
                          ENDED
                        </div>
                        <AfterPartyCard
                          id={event.id}
                          title={event.title}
                          artistName={event.artist_name}
                          startAt={event.start_at}
                          city={event.city}
                          venueName={event.venue_name}
                          genres={event.genres}
                          youtubeUrl={event.youtube_url}
                          imageUrl={event.image_url}
                          showRsvpButton={true}
                          ctaText="Artist Controls"
                          onRsvpClick={() => navigate(`/artist/event/${event.id}`)}
                        />
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          ) : (
            /* Empty state */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-4">
                NO AFTER PARTIES YET
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                You haven't created any After Parties yet. Create your first one to start connecting with fans after your shows.
              </p>
              <Link to="/create-afterparty">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create an After Party
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistAfterParties;
