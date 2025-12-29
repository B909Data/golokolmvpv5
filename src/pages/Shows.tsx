import { useState } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { useAirtableEvents } from "@/hooks/useAirtableEvents";

const splitGenres = (genreString: string) => {
  if (!genreString) return [] as string[];
  return genreString
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
};

const Shows = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events = [], isLoading, error } = useAirtableEvents();

  const genres = [
    "All",
    ...Array.from(
      new Set(events.flatMap((e) => splitGenres(e.genre)))
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const filteredEvents = events.filter((event) => {
    const genreHaystack = (event.genre || "").toLowerCase();
    const genreNeedle = selectedGenre.toLowerCase();
    const matchesGenre = selectedGenre === "All" || genreHaystack.includes(genreNeedle);

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      event.title.toLowerCase().includes(q) ||
      event.venue.toLowerCase().includes(q) ||
      (event.artistName || "").toLowerCase().includes(q);

    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
              UPCOMING <span className="text-primary">GOLOKOL</span> SHOWS
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover live music events happening in your area
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, venues, or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

            {genres.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGenre(genre)}
                    className="whitespace-nowrap"
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-destructive text-lg mb-2">Failed to load events</p>
              <p className="text-muted-foreground">Please check your Airtable configuration</p>
            </div>
          )}

          {!isLoading && !error && filteredEvents.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  slug={event.slug}
                  title={event.title}
                  artistName={event.artistName}
                  venue={event.venue}
                  dateTime={event.dateTime}
                  genre={event.genre}
                  imageUrl={event.imageUrl}
                />
              ))}
            </div>
          )}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No events found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedGenre("All");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shows;
