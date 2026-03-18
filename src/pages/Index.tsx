import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/golokol-hero.png";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="px-6 md:px-12 lg:px-20 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl">
          <h1 className="mb-6">
            <span className="text-foreground">Tools That Build Every Stage of </span>
            <span className="text-primary">Your Music Career</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary max-w-3xl mb-6">
            GoLokol is a toolbox built to support independent music discovery, scenes and tours.
          </p>
        </div>
        <div className="mt-10 w-full">
          <img src={heroImage} alt="GoLokol community illustration" className="w-full h-auto rounded-xl" />
        </div>
      </section>

      {/* SECTION 2 — Lokol Listening Sessions */}
      <section className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-border">
        <div className="max-w-3xl">
          <h2 className="mb-4">
            <span className="text-foreground">Lokol </span>
            <span className="text-primary">Listening Sessions</span>
          </h2>
          <p className="type-body-lg text-foreground-secondary mb-10">
            LLS is for emerging artists building local momentum. Get your music placed in our Lokol Listening kiosks inside record stores around Atlanta, get your music featured in an event series filmed for YouTube, and get honest feedback — whether you're selected or not.
          </p>
          <Link to="/lls-us">
            <Button variant="default" size="lg">
              Learn More and go Lokol!
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* SECTION 3 — After Parties */}
      <section className="bg-background px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-border">
        <div className="max-w-3xl">
          <h2 className="mb-4">
            <span className="text-foreground">After Parties. </span>
            <span className="text-primary">Make Every Show Count.</span>
          </h2>
          <p className="type-subcaption text-foreground-secondary mb-6">
            Build momentum and revenue after each show.
          </p>
          <p className="type-body-lg text-foreground-secondary mb-8">
            A post-show online space curated by you that fans pay to access. Only 24 hours, to use how you want. Then poof — the party ends. Sell passes before and at the show. Easy to manage. Low overhead. High return.
          </p>
          <div className="w-full max-w-2xl mb-10 rounded-xl overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/h5IwdHKv6rA?rel=0"
                title="GoLokol After Party"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          <Link to="/create-after-party">
            <Button variant="default" size="lg">
              Create an After Party
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="bg-background px-6 md:px-12 lg:px-20 py-12 text-center">
        <p className="font-display font-bold text-lg md:text-xl text-foreground">
          Artist curated. Fan appreciated.
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
