import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-revised.jpg";
import sectionAImage from "@/assets/sectiona-revised.png";
import sectionBImage from "@/assets/sectionb-revised.png";
import llsCover from "@/assets/lls-cover.jpg";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);

  const handleBuyTicket = async () => {
    setIsLoadingTicket(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-lls-ticket-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error creating ticket checkout:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsLoadingTicket(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-background/50" />

        <div className="container relative z-10 mx-auto px-4 pt-40 pb-16">
          <div className="max-w-4xl mt-24">
            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 leading-[0.95]">
              Reward the fans <span className="text-primary">who were there.</span>
            </h1>

            <div className="mt-8">
              <Link to="/create-afterparty">
                <Button variant="secondary" size="lg">
                  Create an After Party
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-foreground text-lg font-medium mt-4 max-w-lg">
                Host an invite-only After Party for the fans who showed up.<br />No algorithm. No noise. No burnout.
              </p>
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
              A private space for artists and the fans who showed up. Open for 24 hours. Then it disappears.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-stretch">
            {/* YouTube Video */}
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/1gOtgr4xIUw?loop=1&playlist=1gOtgr4xIUw&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
                title="What is an After Party?"
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>

            {/* Checklist */}
            <div className="flex flex-col justify-between h-full space-y-5">
              <ChecklistItem>Turn one night into a growing fan base w/o feeds, algorithms, or subscriptions.</ChecklistItem>
              <ChecklistItem>Control who's there, how long it lasts, and how you show up.</ChecklistItem>
              <ChecklistItem>Fans feel recognized, and learn to recognize each other.</ChecklistItem>

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
              <p className="text-foreground text-base font-medium">This is how you build a fanbase that feels like community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Large Image Hero Section 1 - "Never shout your instagram" */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionAImage})` }} />
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-background/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/40 to-transparent z-10" />

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
            <p className="text-muted-foreground text-lg">Invite fans behind the curtain, on your terms.</p>
          </div>

          <div className="flex flex-col justify-between h-full space-y-5">
            <ChecklistItem>Talk about what happened at the show last night.</ChecklistItem>
            <ChecklistItem>Jam with fans, preview new music, or explain the meaning behind songs.</ChecklistItem>
            <ChecklistItem>You have 24 hours to explore your imagination and fan connection with chat and Youtube live.</ChecklistItem>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/create-afterparty">
                <Button variant="secondary" size="lg">
                  Create an After Party
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-foreground text-base font-medium">Each week, GoLokol hosts and features one band's After Party live stream for GoLokol Live on Youtube.</p>
          </div>
        </div>
      </section>

      {/* Large Image Hero Section 2 - "The future of music is local" */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBImage})` }} />
        {/* Light overlay for readability */}
        <div className="absolute inset-0 bg-background/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/40 to-transparent z-10" />

        <div className="container relative z-20 mx-auto px-4 pb-[calc(3.5rem+40px)] pt-14">
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-foreground leading-[0.95]">
              the future <span className="text-primary">of music</span>
              <br />
              <span className="text-primary">is local.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Lokol Listening Sessions Section */}
      <section className="py-16 bg-[hsl(60,10%,95%)]">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl text-[hsl(0,0%,10%)] mb-3">LOKOL LISTENING SESSIONS</h2>
            <p className="text-[hsl(0,0%,30%)] text-lg">
              A dj event and YouTube series brought to you by GoLokol, featuring the emerging sounds of a city.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-start">
            {/* Left column - Description + CTA */}
            <div className="space-y-4">
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                Music discovery the right way. At a party and on YouTube screens at the same time. Local fans and
                artists turn up when their song comes on.
              </p>
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed font-medium">All featured artists receive:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(0,0%,10%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[hsl(0,0%,10%)] text-base leading-relaxed">A way to promote your music in a party setting with crowd reaction.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(0,0%,10%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[hsl(0,0%,10%)] text-base leading-relaxed">A free After Party to promote and connect with the fans who show up and turn up for the camera.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(0,0%,10%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[hsl(0,0%,10%)] text-base leading-relaxed">A YouTube collaboration link so the session shows up on your channel.</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex flex-col">
                  <Link to="/submit-song">
                    <Button variant="secondary" size="lg">
                      Submit a Song
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-[hsl(0,0%,40%)] text-sm mt-2">$5 each submission</p>
                </div>
                <div className="flex flex-col">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[hsl(0,0%,10%)] text-[hsl(0,0%,10%)] hover:bg-[hsl(0,0%,10%)] hover:text-white"
                    onClick={handleBuyTicket}
                    disabled={isLoadingTicket}
                  >
                    {isLoadingTicket ? "Loading..." : "Buy a Ticket"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <p className="text-[hsl(0,0%,40%)] text-sm mt-2">$15 limited capacity</p>
                </div>
              </div>
            </div>

            {/* Right column - LLS Cover image */}
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <img
                src={llsCover}
                alt="Lokol Listening Sessions Coming February 2026"
                className="w-full h-full object-cover"
              />
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
