import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AfterPartyCard from "@/components/AfterPartyCard";

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
  "Ska",
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
              Download a pass. Show up. Get access to a 24 hour After Party with your favorite local band.
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
              {filteredEvents.map((event) => (
                <AfterPartyCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  artistName={event.artist_name}
                  startAt={event.start_at}
                  city={event.city}
                  genres={event.genres}
                  youtubeUrl={event.youtube_url}
                  imageUrl={event.image_url}
                />
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
