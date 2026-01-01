import { Link } from "react-router-dom";
import { ArrowRight, Radio, PlayCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Featured videos - minimal editorial
const featuredVideos = [
  {
    label: "CITY-WIDE SOUNDS",
  },
  {
    label: "LOKOL LIVE",
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

            <p
              className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              GoLokol helps local artists and fans find each other where the music is. Near by.
            </p>

            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/create-afterparty">
                <Button variant="secondary" size="lg">
                  CREATE AN AFTER PARTY
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What's an After Party Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              WHAT'S AN <span className="text-primary">AFTER PARTY?</span>
            </h2>
            <p className="text-muted-foreground text-lg">A better way to take new fans home after the show.</p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 items-start">
            {/* Video Placeholder */}
            <div className="aspect-video w-full bg-secondary rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group">
              <PlayCircle className="w-20 h-20 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 mb-3" />
              <span className="text-sm text-muted-foreground">After Party Explainer (30s)</span>
            </div>

            {/* Checklist */}
            <div className="space-y-5">
              <h3 className="font-bold text-xl text-foreground mb-6">How to create an After Party?</h3>
              <ChecklistItem number={1}>List your show (one at a time)</ChecklistItem>
              <ChecklistItem number={2}>Prep and promote your After Party</ChecklistItem>
              <ChecklistItem number={3}>Fans RSVP and receive a QR code</ChecklistItem>
              <ChecklistItem number={4}>Fans check in at the merch table</ChecklistItem>
              <ChecklistItem number={5}>The clock starts. 3 days to get to know and grow your fanbase.</ChecklistItem>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mt-12">
            <Link to="/shows">
              <Button variant="secondary" size="lg">
                Find an After Party
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Lokol Listening Sessions Section */}
      <section className="py-20 relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-10">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              LOKOL <span className="text-primary">LISTENING SESSIONS?</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Get local feedback on new music. The best is added to a Lokol Listening Session DJ Set and Youtube series.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 items-start">
            {/* Video Placeholder */}
            <div className="aspect-video w-full bg-secondary rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group">
              <PlayCircle className="w-20 h-20 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 mb-3" />
              <span className="text-sm text-muted-foreground">Lokol Listening Sessions Explainer (30s)</span>
            </div>

            {/* Checklist */}
            <div className="space-y-5">
              <h3 className="font-bold text-xl text-foreground mb-6">Currently available in Atlanta only.</h3>
              <ChecklistItem number={1}>List a song (one at a time)</ChecklistItem>
              <ChecklistItem number={2}>Opt in to be considered for LLS ($5 submission fee)</ChecklistItem>
              <ChecklistItem number={3}>Fans and local curators rate the song</ChecklistItem>
              <ChecklistItem number={4}>Artists receive feedback and may be featured</ChecklistItem>
              <ChecklistItem number={5}>
                LLS happens Saturday, Feb , 2026 at The Handle Bar in Edgewood and @golokolmusic YouTube
              </ChecklistItem>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mt-12">
            <Link to="/submit-song">
              <Button variant="secondary" size="lg">
                Submit a Song
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/songs">
              <Button size="lg">
                Lokol Listens
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* LOKOL LIVE - Media Section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-2">
              LOKOL <span className="text-primary">LIVE</span>
            </h2>
            <p className="text-muted-foreground">Live shows are OG analog.</p>
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

      {/* Artist CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
              ARE YOU AN <span className="text-accent">ARTIST?</span>
            </h2>
            <p className="text-muted-foreground mb-8">Start building your local fanbase today.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/submit-song">
                <Button variant="secondary" size="lg">
                  Submit a Song
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/create-afterparty">
                <Button size="lg">
                  Create an After Party
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Checklist item component
const ChecklistItem = ({ number, children }: { number: number; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
      <Check className="w-4 h-4 text-primary-foreground" />
    </div>
    <p className="text-foreground text-lg leading-relaxed">{children}</p>
  </div>
);

export default Index;
