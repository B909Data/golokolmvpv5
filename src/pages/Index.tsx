import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero.png";
import sectionAImage from "@/assets/section-a.png";
import sectionBImage from "@/assets/section-b.png";
import llsPlaceholder from "@/assets/lls-placeholder.png";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
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

      {/* What is an After Party? Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-3">
              WHAT IS AN <span className="text-primary">AFTER PARTY?</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              A private, pop up space for new fans to stay connected after the show.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            {/* Video Placeholder */}
            <div className="aspect-video w-full bg-secondary rounded-lg flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group">
              <PlayCircle className="w-20 h-20 text-primary opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 mb-3" />
              <span className="text-sm text-muted-foreground">After Party Explainer</span>
            </div>

            {/* Checklist */}
            <div className="flex flex-col justify-between h-full space-y-5">
              <ChecklistItem>An exclusive 24-hour chat for fans who attended</ChecklistItem>
              <ChecklistItem>A fun, easy way to create your music community one show at a time.</ChecklistItem>
              <ChecklistItem>Transform each show into true momentum</ChecklistItem>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/create-afterparty">
                  <Button variant="secondary" size="lg">
                    Create an After Party
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/find-after-party">
                  <Button size="lg">
                    Find an After Party
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large Image Hero Section 1 - "Never shout your instagram" */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sectionAImage})` }}
        />
        
        <div className="container relative z-20 mx-auto px-4 py-14">
          <div className="max-w-4xl">
            <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-foreground leading-[0.95]">
              never shout <span className="text-primary">your instagram from the</span> stage again.
            </h2>
            
            <div className="mt-6">
              <Link to="/create-afterparty">
                <Button variant="secondary" size="lg">
                  Create an After Party
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-muted-foreground text-sm mt-2">$11.99 per party. No Subscription.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How to throw an After Party Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-3">
              HOW TO THROW AN <span className="text-primary">AFTER PARTY?</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Make every show count.
            </p>
          </div>

          <div className="flex flex-col justify-between h-full space-y-5">
            <ChecklistItem>Promote your next show with your After Party link</ChecklistItem>
            <ChecklistItem>Fans RSVP and save their pass. You scan them in at the show.</ChecklistItem>
            <ChecklistItem>24-hours to Livestream. Chat. Debut. Sell. Build. Poof!</ChecklistItem>
            
            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
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

      {/* Large Image Hero Section 2 - "The future of music is local" */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${sectionBImage})` }}
        />
        
        <div className="container relative z-20 mx-auto px-4 pb-[calc(3.5rem+20px)] pt-14">
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
              A dj event and YouTube series featuring the emerging sounds of a city.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-start">
            {/* Left column - Description + CTA */}
            <div className="space-y-4">
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                Music discovery the right way. At a party and on YouTube screens at the same time. Local fans and artists turn up when their song comes on.
              </p>
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                We launch this February in Atlanta.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/submit-song">
                  <Button variant="secondary" size="lg">
                    Submit a Song
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a href="https://tickets.example.com" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" variant="outline" className="border-[hsl(0,0%,10%)] text-[hsl(0,0%,10%)] hover:bg-[hsl(0,0%,10%)] hover:text-white">
                    Buy a Ticket
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </a>
              </div>
              <p className="text-[hsl(0,0%,40%)] text-sm">$5 each submission. $15 limited supply.</p>
            </div>

            {/* Right column - LLS Placeholder image */}
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <img src={llsPlaceholder} alt="Lokol Listening Sessions Coming 2026" className="w-full h-full object-cover" />
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
      <Check className="w-4 h-4 text-background" />
    </div>
    <p className="text-foreground text-lg leading-relaxed">{children}</p>
  </div>
);

export default Index;