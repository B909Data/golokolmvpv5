import { Link } from "react-router-dom";
import { Music, Disc3 } from "lucide-react";
import Footer from "@/components/Footer";
import golokolLogo from "@/assets/golokol-logo.svg";

const LLSUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="px-6 md:px-12 lg:px-20 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
          <span className="font-display text-xl text-foreground tracking-wide">GoLokol</span>
        </Link>
      </header>

      {/* HERO */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="mb-6">
            <span className="text-foreground">The Future of Music </span>
            <span className="text-primary">Is Local.</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-6 max-w-2xl">
            Lokol Listening Sessions re-envisions music discovery. We place local emerging music in discovery hubs like neighborhood record stores and filmed DJ sets featuring new sounds coming out of Atlanta.
          </p>
        </div>
      </section>

      {/* AUDIENCE SPLIT */}
      <section className="px-6 md:px-12 lg:px-20 pb-24 md:pb-32">
        <p className="type-body-lg text-foreground-secondary mb-8">Who are you in Atlanta?</p>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          <Link
            to="/lls-us/artists"
            className="group relative block rounded-xl border-2 border-border bg-background-tertiary p-10 md:p-14 transition-all duration-300 hover:border-primary hover:bg-background-secondary hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Music className="h-12 w-12 text-primary mb-6 transition-transform duration-300 group-hover:scale-110" />
            <h2 className="text-foreground mb-3 text-2xl md:text-3xl">I'm an Artist</h2>
            <p className="type-body-md text-foreground-secondary">
              Submit your music to be heard in stores and at live events.
            </p>
            <span className="mt-6 inline-block text-primary font-display text-sm tracking-wide uppercase transition-transform duration-300 group-hover:translate-x-1">
              Get Started →
            </span>
          </Link>

          <Link
            to="/lls-us/retail"
            className="group relative block rounded-xl border-2 border-border bg-background-tertiary p-10 md:p-14 transition-all duration-300 hover:border-primary hover:bg-background-secondary hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Disc3 className="h-12 w-12 text-primary mb-6 transition-transform duration-300 group-hover:scale-110" />
            <h2 className="text-foreground mb-3 text-2xl md:text-3xl">I'm Music Retail</h2>
            <p className="type-body-md text-foreground-secondary">
              Partner your store to become a local music discovery hub.
            </p>
            <span className="mt-6 inline-block text-primary font-display text-sm tracking-wide uppercase transition-transform duration-300 group-hover:translate-x-1">
              Get Started →
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUs;
