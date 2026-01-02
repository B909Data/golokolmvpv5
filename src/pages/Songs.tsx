import { useState } from "react";
import { Music, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SongCard from "@/components/SongCard";
import VotingCountdownOverlay from "@/components/VotingCountdownOverlay";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const mockSongs = [
  {
    slug: "midnight-drive",
    title: "Midnight Drive",
    artist: "The Night Owls",
    genre: "Indie Rock",
    fanRating: 4.2,
    curatorRating: 3.8,
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    slug: "electric-soul",
    title: "Electric Soul",
    artist: "Voltage",
    genre: "Electronic",
    fanRating: 4.7,
    curatorRating: 4.5,
    youtubeId: "fJ9rUzIMcZQ",
  },
  {
    slug: "broken-strings",
    title: "Broken Strings",
    artist: "Acoustic Dreams",
    genre: "Folk",
    fanRating: 3.9,
    curatorRating: 4.1,
    youtubeId: "kJQP7kiw5Fk",
  },
  {
    slug: "neon-lights",
    title: "Neon Lights",
    artist: "Synthwave Collective",
    genre: "Electronic",
    fanRating: 4.4,
    curatorRating: 4.0,
    youtubeId: "60ItHLz5WEA",
  },
  {
    slug: "raw-power",
    title: "Raw Power",
    artist: "The Amplifiers",
    genre: "Punk",
    fanRating: 4.0,
    curatorRating: 3.5,
    youtubeId: "hTWKbfoikeg",
  },
  {
    slug: "summer-haze",
    title: "Summer Haze",
    artist: "Coastal Vibes",
    genre: "Indie Rock",
    fanRating: 4.3,
    curatorRating: 4.2,
    youtubeId: "JGwWNGJdvx8",
  },
  {
    slug: "downtown-blues",
    title: "Downtown Blues",
    artist: "Smokey Jones",
    genre: "Blues",
    fanRating: 4.6,
    curatorRating: 4.8,
    youtubeId: "RgKAFK5djSk",
  },
  {
    slug: "future-nostalgia",
    title: "Future Nostalgia",
    artist: "Retro Modern",
    genre: "Electronic",
    fanRating: 4.1,
    curatorRating: 3.9,
    youtubeId: "oygrmJFKYZY",
  },
];

const genres = ["All", "Indie Rock", "Electronic", "Folk", "Punk", "Blues"];

const Songs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredSongs = mockSongs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <VotingCountdownOverlay />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Music className="w-12 h-12 text-primary" />
            <h1 className="font-display text-5xl md:text-7xl text-foreground">
              LOKOL <span className="text-primary text-glow">SOUNDS</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover new music near you. Listen, rate, and support your city's sound.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Input
                type="text"
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card/50 border-border/50 pl-4"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Filter className="w-5 h-5 text-muted-foreground" />
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                  className={selectedGenre === genre ? "" : "border-border/50 hover:border-primary/50"}
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Songs Grid */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {filteredSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSongs.map((song) => (
                <SongCard key={song.slug} {...song} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No songs found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Songs;
