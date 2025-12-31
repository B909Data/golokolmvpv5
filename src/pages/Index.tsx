import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Music, Radio, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";

const featuredEvents = [
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
              <span>Supporting Local Music Since 2024</span>
            </div>
            
            <h1 className="font-display text-6xl md:text-8xl text-foreground mb-6 leading-[0.9] animate-slide-up text-glow">
              DISCOVER YOUR <br />
              <span className="text-primary">LOCAL SCENE</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Find upcoming shows, connect with local bands, and be part of the underground music movement in your city.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/shows">
                <Button size="lg">
                  EXPLORE SHOWS
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/create-afterparty">
                <Button variant="secondary" size="lg">
                  CREATE EVENT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Calendar, label: "Events This Month", value: "24+" },
              { icon: Users, label: "Active Artists", value: "150+" },
              { icon: Music, label: "Venues", value: "35" },
              { icon: Radio, label: "Songs Submitted", value: "500+" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="font-display text-4xl text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                UPCOMING <span className="text-primary">SHOWS</span>
              </h2>
              <p className="text-muted-foreground">Don't miss out on these local events</p>
            </div>
            <Link to="/shows" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.slug} {...event} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/shows">
              <Button variant="outline" className="gap-2">
                View All Shows
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
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
