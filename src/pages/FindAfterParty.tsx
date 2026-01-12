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
  const [genreFilter, setGenreFilter] = useState<string>("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["after-parties-enabled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at, city, venue_name, genres, youtube_url, image_url, artist_name")
        .eq("after_party_enabled", true)
        .eq("city", "Atlanta") // MVP: Atlanta only
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  // Filter events client-side (only genre filter now)
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => {
      const matchesGenre =
        !genreFilter || (event.genres && event.genres.includes(genreFilter));
      return matchesGenre;
    });
  }, [events, genreFilter]);

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
            <ul className="space-y-2 text-lg font-sans">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span className="text-muted-foreground">Download an After Party Pass.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span className="text-muted-foreground">Attend and enjoy the show.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                <span className="text-muted-foreground">Get access to an online After Party with the artist/band. 24 hours later it disappears.</span>
              </li>
            </ul>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Static Atlanta label */}
            <span className="h-10 inline-flex items-center rounded-md border-2 border-primary/50 bg-primary/10 px-3 py-2 text-base font-sans text-primary">
              Atlanta only (for now)
            </span>

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

            {genreFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGenreFilter("")}
                className="text-foreground hover:text-primary"
              >
                Clear Filter
              </Button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !filteredEvents || filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-md mx-auto">
                {events && events.length > 0 && genreFilter ? (
                  <>
                    <h2 className="font-display text-2xl text-foreground mb-3">
                      No matches found
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your filter or create your own After Party.
                    </p>
                    <Link to="/create-afterparty">
                      <Button size="lg">Create an After Party</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-2xl text-foreground mb-3">
                      Be the first to throw a GoLokol After Party in Atlanta.
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      No After Parties scheduled yet—create one and bring your fans together.
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
