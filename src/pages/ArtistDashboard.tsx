import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, Plus, Music, LogOut, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { User } from "@supabase/supabase-js";

interface ArtistEvent {
  id: string;
  title: string;
  artist_name: string | null;
  start_at: string;
  city: string | null;
  status: string;
}

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch artist's events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["artist-events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("events")
        .select("id, title, artist_name, start_at, city, status")
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

  const upcomingEvents = events?.filter(e => e.status === "upcoming") || [];
  const liveEvents = events?.filter(e => e.status === "live") || [];
  const pastEvents = events?.filter(e => e.status === "ended") || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-2">
                MY AFTER PARTIES
              </h1>
              <p className="text-muted-foreground text-sm">
                Signed in as {user?.email}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

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
              <p className="text-muted-foreground">Loading your events...</p>
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-6">
              {/* Live Events */}
              {liveEvents.length > 0 && (
                <section>
                  <h2 className="font-display text-lg text-primary mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    LIVE NOW
                  </h2>
                  <div className="space-y-3">
                    {liveEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <section>
                  <h2 className="font-display text-lg text-foreground mb-3">
                    UPCOMING
                  </h2>
                  <div className="space-y-3">
                    {upcomingEvents.map(event => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </section>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <section>
                  <h2 className="font-display text-lg text-muted-foreground mb-3">
                    PAST
                  </h2>
                  <div className="space-y-3">
                    {pastEvents.map(event => (
                      <EventCard key={event.id} event={event} isPast />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-4">
                NO AFTER PARTIES YET
              </h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                Create your first After Party to start connecting with fans after your shows.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, isPast = false }: { event: ArtistEvent; isPast?: boolean }) => {
  const formattedDate = (() => {
    try {
      return format(new Date(event.start_at), "MMM d, yyyy • h:mm a");
    } catch {
      return event.start_at;
    }
  })();

  return (
    <Link 
      to={`/artist/event/${event.id}`}
      className={`block rounded-xl border-2 p-4 transition-colors ${
        isPast 
          ? "border-muted bg-muted/30 hover:border-muted-foreground/50" 
          : "border-border bg-card hover:border-primary"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`font-display text-lg truncate ${isPast ? "text-muted-foreground" : "text-foreground"}`}>
            {event.artist_name || event.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
            {event.city && (
              <>
                <span>•</span>
                <span className="truncate">{event.city}</span>
              </>
            )}
          </div>
        </div>
        <ChevronRight className={`h-5 w-5 flex-shrink-0 ml-2 ${isPast ? "text-muted-foreground" : "text-primary"}`} />
      </div>
    </Link>
  );
};

export default ArtistDashboard;
