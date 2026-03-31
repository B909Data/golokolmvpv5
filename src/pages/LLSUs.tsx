import { Link } from "react-router-dom";
import { Music, Disc3 } from "lucide-react";
import Footer from "@/components/Footer";
import golokolLogo from "@/assets/golokol-logo.svg";
import llsUsHero from "@/assets/lls-us-hero.jpg";

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

      {/* HERO with image */}
      <section className="relative w-full min-h-[420px] md:min-h-[520px] flex items-end">
        <img
          src={llsUsHero}
          alt="Black woman with headphones listening to music with Atlanta map background"
          className="absolute inset-0 w-full h-full object-cover object-top"
          width={1920}
          height={800}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        {/* Hero text */}
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-10 md:pb-14 max-w-3xl">
          <h1 className="mb-0">
            <span className="text-foreground">The Future of Music </span>
            <span className="text-primary">Is Local.</span>
          </h1>
        </div>
      </section>

      {/* Body text below hero */}
      <section className="px-6 md:px-12 lg:px-20 py-10 md:py-16">
        <ul className="space-y-4 max-w-2xl">
          <li className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 rounded-full bg-primary flex-shrink-0" />
            <span className="type-subcaption text-[#F0EDE8]">
              Lokol Listens Sessions turns your city's favorite record stores, retail and cafe's into local music discovery hubs.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 rounded-full bg-primary flex-shrink-0" />
            <span className="type-subcaption text-[#F0EDE8]">
              Music lovers add their favs to their{" "}
              <Link to="/connect" className="text-primary underline hover:text-primary/80 transition-colors">Golokol Connect</Link>{" "}
              dashboard. Your city. Your scene.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-2 h-3 w-3 rounded-full bg-primary flex-shrink-0" />
            <span className="type-subcaption text-[#F0EDE8]">
              Artists can promote local shows and sell music directly to the dashboards they're on. Local momentum w/o an algorithm.
            </span>
          </li>
        </ul>
      </section>

      {/* AUDIENCE SPLIT */}
      <section className="px-6 md:px-12 lg:px-20 pb-24 md:pb-32">
        <h2 className="text-foreground mb-8">Who are you in Atlanta?</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          <Link
            to="/lls-us/artists"
            className="group relative block rounded-xl border-2 border-border bg-background-tertiary p-10 md:p-14 transition-all duration-300 hover:border-primary hover:bg-background-secondary hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Music className="h-12 w-12 text-primary mb-6 transition-transform duration-300 group-hover:scale-110" />
            <h2 className="text-foreground mb-3 text-2xl md:text-3xl">I'm an Artist</h2>
            <p className="type-body-md text-[#F0EDE8]">
              Submit your music and build real momentum with Atlanta record store and Lokol event features. Get a free 1-month trial of Golokol Connect.
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
            <p className="type-body-md text-[#F0EDE8]">
              Turn your store into a lokol music discovery hub. Generate more traffic, sales and cultural relevance.
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
