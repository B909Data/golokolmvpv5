import { Link } from "react-router-dom";
import { ArrowRight, Music, Play, Radio, Star, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";

// Featured songs - editorially curated
const featuredSongs = [
  {
    slug: "midnight-drive",
    title: "Midnight Drive",
    artist: "Luna Waves",
    imageUrl: null,
    fanRating: 4.2,
    curatorRating: 4.5,
  },
  {
    slug: "concrete-dreams",
    title: "Concrete Dreams",
    artist: "The Static",
    imageUrl: null,
    fanRating: 3.8,
    curatorRating: 4.0,
  },
  {
    slug: "summer-fade",
    title: "Summer Fade",
    artist: "Dusk Patrol",
    imageUrl: null,
    fanRating: 4.5,
    curatorRating: 4.7,
  },
];

// Featured shows - hand-picked highlights
const featuredShows = [
  {
    slug: "midnight-groove",
    title: "Midnight Groove Session",
    artistName: "The Velvet Sounds",
    venue: "The Basement",
    dateTime: "2025-01-15T21:00:00",
    genre: "Indie Rock",
  },
  {
    slug: "jazz-underground",
    title: "Jazz Underground",
    artistName: "The Smooth Quartet",
    venue: "Blue Note Club",
    dateTime: "2025-01-18T20:00:00",
    genre: "Jazz",
  },
  {
    slug: "electronic-nights",
    title: "Electronic Nights",
    artistName: "DJ Synthwave",
    venue: "Warehouse 21",
    dateTime: "2025-01-22T22:00:00",
    genre: "Electronic",
  },
];

// Upcoming shows - utility listing
const upcomingShows = [
  {
    slug: "acoustic-sunset",
    title: "Acoustic Sunset",
    artistName: "River Folk",
    venue: "The Patio",
    dateTime: "2025-01-25T18:00:00",
    genre: "Folk",
  },
  {
    slug: "punk-revival",
    title: "Punk Revival Night",
    artistName: "The Razors",
    venue: "Dive Bar",
    dateTime: "2025-01-28T21:00:00",
    genre: "Punk",
  },
  {
    slug: "soul-session",
    title: "Soul Session",
    artistName: "Velvet Voice",
    venue: "The Lounge",
    dateTime: "2025-02-01T20:00:00",
    genre: "Soul",
  },
];

// Featured videos - minimal editorial
const featuredVideos = [
  {
    label: "BACKSTAGE",
  },
  {
    label: "GOLOKOL LIVE",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden noise-overlay">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2 text-sm text-accent mb-6 animate-fade-in">
              <Radio className="h-4 w-4" />
              <span>Supporting Local Music Since 2025</span>
            </div>
            
            <h1 className="font-display text-6xl md:text-8xl text-foreground mb-6 leading-[0.9] animate-slide-up text-glow">
              THE FUTURE OF <br />
              <span className="text-primary">MUSIC IS LOCAL</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              GoLokol helps local artists and fans find each other beyond noise.
            </p>
            
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/create-afterparty">
                <Button size="lg">
                  CREATE AN AFTER PARTY
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Songs Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                FEATURED <span className="text-primary">SONGS</span>
              </h2>
              <p className="text-muted-foreground">Curated sounds from the local scene</p>
            </div>
            <Link to="/songs" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                Browse All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredSongs.map((song) => (
              <Link key={song.slug} to={`/song/${song.slug}`}>
                <div className="group rounded-xl bg-card-feature p-6 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
                  {/* Song Image / Placeholder */}
                  <div className="aspect-square w-full bg-card-foreground/10 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    <Music className="w-16 h-16 text-card-foreground/40" />
                    {/* Play action overlay */}
                    <div className="absolute inset-0 bg-card-foreground/0 group-hover:bg-card-foreground/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-card-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
                        <Play className="w-6 h-6 text-card-feature fill-card-feature ml-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Song Info */}
                  <h3 className="font-extrabold text-xl text-card-foreground leading-tight">
                    {song.title}
                  </h3>
                  <p className="text-card-foreground/70 font-medium mb-3">
                    {song.artist}
                  </p>
                  
                  {/* Ratings */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-card-foreground fill-card-foreground" />
                      <span className="text-card-foreground font-semibold">{song.fanRating.toFixed(1)}</span>
                      <span className="text-card-foreground/60">Fan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-card-foreground fill-card-foreground" />
                      <span className="text-card-foreground font-semibold">{song.curatorRating.toFixed(1)}</span>
                      <span className="text-card-foreground/60">Curator</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/songs">
              <Button variant="outlineFeature" className="gap-2">
                Browse All Songs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shows Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                FEATURED <span className="text-primary">SHOWS</span>
              </h2>
              <p className="text-muted-foreground">Hand-picked events worth your time</p>
            </div>
            <Link to="/shows" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                See All Shows
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredShows.map((event) => (
              <EventCard key={event.slug} {...event} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/shows">
              <Button variant="outline" className="gap-2">
                See All Shows
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* LOKOL SCENES - Editorial & Media Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              LOKOL <span className="text-primary">SCENES</span>
            </h2>
            <p className="text-muted-foreground">Stories, videos, and field notes from local music culture.</p>
          </div>

          {/* Two-column video layout */}
          <div className="grid gap-8 md:grid-cols-2">
            {featuredVideos.map((video, index) => (
              <div key={index} className="flex flex-col">
                {/* Video Card */}
                <div className="aspect-video w-full bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer group">
                  <PlayCircle className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
                {/* Label */}
                <span className="mt-3 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                  {video.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Shows - Utility Section */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h3 className="font-bold text-2xl text-foreground mb-1">
                More Shows
              </h3>
              <p className="text-muted-foreground text-sm">Browse the full calendar</p>
            </div>
            <Link to="/shows">
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingShows.map((event) => (
              <Link key={event.slug} to={`/afterparty/${event.slug}`}>
                <div className="group rounded-lg bg-card p-4 transition-all duration-200 hover:bg-card/80 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center shrink-0">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{event.artistName} • {event.venue}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{event.genre}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              ARE YOU AN <span className="text-accent">ARTIST?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Submit your music for our Local Listening Sessions and get featured in front of a growing community of music lovers.
            </p>
            <Link to="/submit-song">
              <Button size="lg">
                SUBMIT YOUR SONG
                <Music className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
