import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";

const allEvents = [
  {
    slug: "midnight-groove",
    title: "Midnight Groove Session",
    venue: "The Basement",
    date: "Jan 15, 2025",
    genre: "Indie Rock",
  },
  {
    slug: "jazz-underground",
    title: "Jazz Underground",
    venue: "Blue Note Club",
    date: "Jan 18, 2025",
    genre: "Jazz",
  },
  {
    slug: "electronic-nights",
    title: "Electronic Nights",
    venue: "Warehouse 21",
    date: "Jan 22, 2025",
    genre: "Electronic",
  },
  {
    slug: "acoustic-sundays",
    title: "Acoustic Sundays",
    venue: "The Coffee House",
    date: "Jan 26, 2025",
    genre: "Acoustic",
  },
  {
    slug: "punk-revival",
    title: "Punk Revival Night",
    venue: "The Pit",
    date: "Jan 28, 2025",
    genre: "Punk",
  },
  {
    slug: "hip-hop-cypher",
    title: "Hip-Hop Cypher",
    venue: "Studio 54",
    date: "Feb 1, 2025",
    genre: "Hip-Hop",
  },
];

const genres = ["All", "Indie Rock", "Jazz", "Electronic", "Acoustic", "Punk", "Hip-Hop"];

const Shows = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEvents = allEvents.filter((event) => {
    const matchesGenre = selectedGenre === "All" || event.genre === selectedGenre;
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
              UPCOMING <span className="text-primary">GOLOKOL</span> SHOWS
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover live music events happening in your area
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events or venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>

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
          </div>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.slug} {...event} />
              ))}
            </div>
          ) : (
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
