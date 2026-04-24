import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import artistsHero from "@/assets/artists_hero.svg";

const LLSUsArtists = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero with image */}
      <section className="relative w-full min-h-[420px] md:min-h-[520px] flex items-end">
        <img
          src={artistsHero}
          alt="Artists hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-10 md:pb-14 max-w-3xl">
          <h1 className="mb-4">
            <span className="text-foreground">Your Music. Real Fans. </span>
            <span className="text-primary">Great Shows.</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-0 max-w-2xl">
            GoLokol puts your music in front of Atlanta fans who already show up.
          </p>
        </div>
      </section>

      {/* Bullet points */}
      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <ol className="space-y-5 mb-8 max-w-2xl list-none">
          {[
            "Submit one song at a time. Up to 2 per month. Always free.",
            "Your music is discoverable by anyone in Atlanta — online and at partner stores city-wide.",
            "Introduce new music and shows to fans who add you to their Lokol Scene.",
            "Make every new show count. GoLokol show notifications are more than a flyer.",
            "All Atlanta artists get a 1-month free trial.",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="mt-0.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-background font-bold text-base">{i + 1}</span>
              </span>
              <span className="text-foreground text-lg md:text-xl font-medium">{text}</span>
            </li>
          ))}
        </ol>
        <Link
          to="/artist/signup"
          className="inline-flex items-center justify-center bg-primary text-background font-display font-bold text-base rounded-2xl h-14 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Sign Up and Submit Music
        </Link>
      </section>

      {/* What is GoLokol? */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24" style={{ backgroundColor: "#FFD600" }}>
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-8">
            What is GoLokol?
          </h2>
          <ul className="space-y-4 mb-12">
            {[
              "Local music discovery IRL",
              "Music promotion infrastructure serving independent artists, fans, venues, and business city-wide.",
              "A traffic source for local economic sustainability driven by local music",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-3 w-3 rounded-full bg-black flex-shrink-0" />
                <span className="text-black text-lg font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {/* What GoLokol is not */}
          <div className="bg-white rounded-2xl p-8 md:p-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-black mb-6">
              What GoLokol is not?
            </h3>
            <ul className="space-y-3">
              {[
                "A streaming service",
                "Social Media",
                "For everybody",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 h-3 w-3 rounded-full bg-black flex-shrink-0" />
                  <span className="text-black text-lg font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Ready to get your music heard?
          </h2>
          <p className="text-foreground-secondary text-base font-sans mb-8">
            Submit your music to Lokol Listening Stations in Atlanta record stores. Free to submit. No algorithm.
          </p>
          <Link
            to="/artist/signup"
            className="inline-flex items-center justify-center bg-primary text-background font-display font-bold text-base rounded-2xl h-14 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign Up and Submit Music
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsArtists;
