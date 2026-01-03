import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Music } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GENRE_OPTIONS = [
  "Hip-Hop",
  "R&B",
  "Neo-Soul",
  "Soul",
  "Funk",
  "Jazz",
  "Blues",
  "Gospel",
  "Reggae",
  "Afrobeats",
  "Latin",
  "Pop",
  "Rock",
  "Indie",
  "Alternative",
  "Electronic",
  "House",
  "Techno",
  "Country",
  "Folk",
  "Punk",
  "Metal",
  "Classical",
  "Spoken-Word",
  "Poetry",
  "Comedy",
  "Other",
];

interface Event {
  id: string;
  title: string;
  start_at: string;
  city: string | null;
  venue_name: string | null;
  genres: string[] | null;
  youtube_url: string | null;
  image_url: string | null;
  artist_name: string | null;
}

const FindAfterParty = () => {
  const [cityFilter, setCityFilter] = useState<string>("");
  const [genreFilter, setGenreFilter] = useState<string>("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["after-parties-enabled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at, city, venue_name, genres, youtube_url, image_url, artist_name")
        .eq("after_party_enabled", true)
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  // Extract unique cities from events
  const cities = useMemo(() => {
    if (!events) return [];
    const uniqueCities = [...new Set(events.map((e) => e.city).filter(Boolean))];
    return uniqueCities.sort();
  }, [events]);

  // Filter events client-side
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => {
      const matchesCity = !cityFilter || event.city === cityFilter;
      const matchesGenre =
        !genreFilter || (event.genres && event.genres.includes(genreFilter));
      return matchesCity && matchesGenre;
    });
  }, [events, cityFilter, genreFilter]);

  const getEventImage = (event: Event): string | null => {
    // Priority: YouTube thumbnail > image_url > null (show placeholder)
    if (event.youtube_url) {
      const videoId = extractYouTubeId(event.youtube_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "hq");
      }
    }
    return event.image_url || null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Find an After Party
            </h1>

            <div className="flex flex-wrap gap-3">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city!}>
                    {city}
                  </option>
                ))}
              </select>

              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Genres</option>
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>

              {(cityFilter || genreFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCityFilter("");
                    setGenreFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {events && events.length > 0
                  ? "No events match your filters."
                  : "No upcoming after parties found."}
              </p>
              <Link to="/create-afterparty">
                <Button>Create an After Party</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const imageUrl = getEventImage(event);
                return (
                  <div
                    key={event.id}
                    className="rounded-xl border border-border bg-card overflow-hidden flex flex-col group hover:border-primary/50 transition-colors"
                  >
                    <div className="aspect-video relative bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <Music className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      {event.genres && event.genres.length > 0 && (
                        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                          {event.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-0.5 rounded-full bg-background/90 text-foreground text-xs font-medium"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <div>
                        <h2 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                          {event.title}
                        </h2>
                        {event.artist_name && (
                          <p className="text-sm text-muted-foreground">
                            {event.artist_name}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(event.start_at), "MMM d, yyyy · h:mm a")}
                          </span>
                        </div>
                        {(event.city || event.venue_name) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {[event.venue_name, event.city].filter(Boolean).join(", ")}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link to={`/after-party/${event.id}`} className="mt-auto pt-2">
                        <Button variant="secondary" size="sm" className="w-full">
                          View After Party
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindAfterParty;
