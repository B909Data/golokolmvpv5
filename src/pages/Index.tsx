import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background placeholder for hero artwork */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-30" />
        
        <div className="container relative z-10 mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-[0.95]">
              A better way <span className="text-primary">to take fans home</span> after the show.
            </h1>

            <div className="mt-8">
              <Link to="/create-afterparty">
                <Button variant="secondary" size="lg">
                  Create an After Party
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What's an After Party Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-3">
              WHAT'S AN <span className="text-primary">AFTER PARTY?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Keep them in the palm of your hands after the adrenaline wears off.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 items-start">
            {/* Video Placeholder */}
            <div className="aspect-video w-full bg-secondary rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group">
              <PlayCircle className="w-20 h-20 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 mb-3" />
              <span className="text-sm text-muted-foreground">After Party Explainer</span>
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <ChecklistItem>An exclusive room online. Only the fans who attend shows get access.</ChecklistItem>
              <ChecklistItem>Get to know your true fans and they get to know each other.</ChecklistItem>
              <ChecklistItem>Create an experience that reflects your music, imagination and capacity.</ChecklistItem>
              <ChecklistItem>In 3 days the moment disappears, like the show but not the data.</ChecklistItem>
            </div>
          </div>
        </div>
      </section>

      {/* Large Image Hero Section 1 - "Never shout your instagram" */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background placeholder for poster artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center" />
        
        <div className="container relative z-20 mx-auto px-4 py-14">
          <div className="max-w-4xl">
            <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-foreground leading-[0.95]">
              never shout <span className="text-primary">your instagram from the</span> stage again.
            </h2>
          </div>
        </div>
      </section>

      {/* How to Throw an After Party Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-3">
              HOW TO THROW AN <span className="text-primary">AFTER PARTY?</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Be an artist. As much or as little as you want.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 items-start">
            {/* Left column - Text items + CTAs */}
            <div className="space-y-3">
              <ChecklistItem>Answer questions, crack jokes, take roll call! Talk about what happened at the show last night.</ChecklistItem>
              <ChecklistItem>Write a song with fans.</ChecklistItem>
              <ChecklistItem>Livestream from the studio, or the kitchen or somewhere local near by.</ChecklistItem>
              <ChecklistItem>Plan a stunt together for the next show.</ChecklistItem>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/create-afterparty">
                  <Button variant="secondary" size="lg">
                    Create an After Party
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/shows">
                  <Button size="lg">
                    Find an After Party
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right column - Image placeholder (same aspect ratio as explainer video) */}
            <div className="aspect-video w-full bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Illustration Placeholder</span>
            </div>
          </div>
        </div>
      </section>

      {/* Large Image Hero Section 2 - "The future of music is local" */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background placeholder for poster artwork */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center" />
        
        <div className="container relative z-20 mx-auto px-4 py-14">
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-foreground leading-[0.95]">
              the future <span className="text-primary">of music</span><br />
              <span className="text-primary">is local.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Lokol Listening Sessions Section */}
      <section className="py-16 bg-[hsl(60,10%,95%)]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl text-[hsl(0,0%,10%)] mb-3">
              LOKOL LISTENING SESSIONS
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg">
              A dj event and youtube series featuring the emerging sounds of a city.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 items-start">
            {/* Left column - Description + CTA */}
            <div className="space-y-4">
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                A dj event and youtube series featuring the emerging sounds of a city. Music discovery the right way. In-person and on Youtube screens at the same time.
              </p>
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                Local fans and artists turn up when their song come on.
              </p>
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                We launch this February in Atlanta at Handlebar on Edgewood. Only Atlanta based music for now.
              </p>

              <div className="pt-2">
                <Link to="/submit-song">
                  <Button variant="secondary" size="lg">
                    Submit a Song
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-[hsl(0,0%,40%)] text-sm mt-2">$5 per submission</p>
              </div>
            </div>

            {/* Right column - Video/Image placeholder */}
            <div className="space-y-4">
              <div className="aspect-video w-full bg-secondary rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group">
                <PlayCircle className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 mb-2" />
                <span className="text-sm text-muted-foreground">Lokol Listening Sessions</span>
                <span className="text-xs text-muted-foreground">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Checklist item component with yellow circle and black check icon
const ChecklistItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
      <Check className="w-4 h-4 text-foreground" />
    </div>
    <p className="text-foreground text-lg leading-relaxed">{children}</p>
  </div>
);

export default Index;
