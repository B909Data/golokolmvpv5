import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Music, PlayCircle, X } from "lucide-react";
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

// Fixed city options
const CITY_OPTIONS = ["Atlanta", "Athens", "New Orleans"];

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
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

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
    if (event.youtube_url) {
      const videoId = extractYouTubeId(event.youtube_url);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "hq");
      }
    }
    return event.image_url || null;
  };

  const hasVideo = (event: Event): boolean => {
    return !!(event.youtube_url && extractYouTubeId(event.youtube_url));
  };

  const handlePlayVideo = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlayingVideoId(eventId);
  };

  const handleCloseVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlayingVideoId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl uppercase mb-2">
              <span className="text-foreground">FIND AN </span>
              <span className="text-primary">AFTER PARTY</span>
            </h1>
            <p className="text-muted-foreground text-lg font-sans">
              Discover upcoming After Parties by city and genre. RSVP to connect with artists and fans.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="h-10 rounded-md border-2 border-primary bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:bg-primary/10 [&>option]:bg-background [&>option]:text-foreground [&>option:hover]:bg-primary [&>option:checked]:bg-primary/20"
            >
              <option value="">All Cities</option>
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="h-10 rounded-md border-2 border-primary bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:bg-primary/10 [&>option]:bg-background [&>option]:text-foreground [&>option:hover]:bg-primary [&>option:checked]:bg-primary/20"
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
                className="text-foreground hover:text-primary"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                {cityFilter ? (
                  <>
                    <h2 className="font-display text-2xl text-foreground mb-3">
                      Be the first to throw a GoLokol After Party in {cityFilter}.
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      No After Parties scheduled yet—create one and bring your fans together.
                    </p>
                    <Link to="/create-afterparty">
                      <Button size="lg">Create an After Party</Button>
                    </Link>
                  </>
                ) : events && events.length > 0 ? (
                  <>
                    <h2 className="font-display text-2xl text-foreground mb-3">
                      No matches found
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filters or create your own After Party.
                    </p>
                    <Link to="/create-afterparty">
                      <Button size="lg">Create an After Party</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-2xl text-foreground mb-3">
                      No upcoming After Parties yet
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Be the first to create one and start building your fan community.
                    </p>
                    <Link to="/create-afterparty">
                      <Button size="lg">Create an After Party</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const imageUrl = getEventImage(event);
                const eventHasVideo = hasVideo(event);
                const isPlaying = playingVideoId === event.id;
                const videoId = event.youtube_url ? extractYouTubeId(event.youtube_url) : null;

                return (
                  <div
                    key={event.id}
                    className="rounded-xl overflow-hidden flex flex-col group bg-primary"
                  >
                    {/* Media Section */}
                    <div className="aspect-video relative bg-primary/80">
                      {isPlaying && videoId ? (
                        <>
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                            title={event.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                          <button
                            onClick={handleCloseVideo}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
                            aria-label="Close video"
                          >
                            <X className="w-4 h-4 text-foreground" />
                          </button>
                        </>
                      ) : (
                        <>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/60">
                              <Music className="h-12 w-12 text-primary-foreground/40" />
                            </div>
                          )}
                          
                          {/* Play button overlay - only for videos */}
                          {eventHasVideo && (
                            <button
                              onClick={(e) => handlePlayVideo(event.id, e)}
                              className="absolute inset-0 flex items-center justify-center bg-background/20 hover:bg-background/30 transition-colors cursor-pointer"
                              aria-label="Play video"
                            >
                              <PlayCircle className="w-16 h-16 text-primary drop-shadow-lg" />
                            </button>
                          )}

                          {/* Genre badges */}
                          {event.genres && event.genres.length > 0 && (
                            <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                              {event.genres.slice(0, 2).map((genre) => (
                                <span
                                  key={genre}
                                  className="px-2 py-0.5 rounded-full bg-primary/80 text-primary-foreground text-xs font-sans"
                                >
                                  {genre}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex flex-col gap-4 flex-1 bg-primary">
                      {/* Primary info: Artist name in Breul Grotesk */}
                      <div>
                        <h2 className="font-display text-xl text-primary-foreground leading-tight mb-1">
                          {event.artist_name || event.title}
                        </h2>
                        {event.artist_name && event.title !== event.artist_name && (
                          <p className="text-base font-sans text-primary-foreground/80">
                            {event.title}
                          </p>
                        )}
                      </div>

                      {/* Secondary info: Date and Location in Roboto */}
                      <div className="flex flex-col gap-1.5 text-base font-sans text-primary-foreground/80">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0" />
                          <span>
                            {format(new Date(event.start_at), "EEE, MMM d · h:mm a")}
                          </span>
                        </div>
                        {event.city && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{event.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Primary CTA - Black bg with yellow text */}
                      <Link to={`/after-party/${event.id}/rsvp`} className="mt-auto">
                        <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans">
                          RSVP
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
