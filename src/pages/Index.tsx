import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/homepage-hero-2026.png";
import section2Image from "@/assets/homepage-section2-2026.png";
import section3Image from "@/assets/homepage-section3-2026.png";

const Index = () => {
  const heroBullets = [
    "Sell After Party passes before and at the show.",
    "Fans must be at the show to activate them.",
    "Easy to manage. Fun to curate. Low overhead. High return merch.",
  ];

  const section2Bullets = [
    "Whether fans pay $1, $100 or $1,000. After Party metrics are backed by value. Find the true fans in the crowd.",
    "Show fees pay for hotel and gas. GoLokol After Parties pay for the dream.",
    "Each Party is an extension of one show, venue, curator, team. Learn more about GoLokol Partners.",
  ];

  const section3Bullets = [
    "Fans feel seen by artists and each other",
    "Artists earn directly from their community",
    "Real engagement replaces empty data points",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-16">
        {/* Hero Image with Text Overlay */}
        <div className="relative w-full">
          <img
            src={heroImage}
            alt="Artists on stage"
            className="w-full h-auto block"
          />
          {/* Light overlay for readability */}
          <div className="absolute inset-0 bg-background/40" />
          {/* Text overlay on image */}
          <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-12 lg:px-20 pt-5">
            <div className="max-w-3xl">
              <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-[0.95] mb-4">
                <span className="text-foreground font-bold">Make every show </span>
                <span className="text-primary font-bold">count.</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed font-semibold">
                Build momentum and revenue after each show.
              </p>
            </div>
          </div>
        </div>

        {/* Black Section Below Hero */}
        <div className="bg-background px-6 md:px-12 lg:px-20 py-10 md:py-14">
          <div className="max-w-4xl">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
              What is a GoLokol After Party?
            </h3>
            <p className="text-base md:text-lg text-foreground/80 mb-8 leading-relaxed max-w-3xl">
              A post-show online space curated by the artist that fans pay to access. Only 24 hours, to use how you want. Then Poof! The party ends.
            </p>

            <ul className="space-y-4 mb-8">
              {heroBullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground/90">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </span>
                  <span className="text-base md:text-lg">{bullet}</span>
                </li>
              ))}
            </ul>

            <Link to="/create-after-party">
              <Button variant="default" size="lg">
                Create an After Party
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section>
        {/* Section 2 Image with Text Overlay */}
        <div className="relative w-full">
          <img
            src={section2Image}
            alt="Stage setup"
            className="w-full h-auto block"
          />
          {/* Light overlay for readability */}
          <div className="absolute inset-0 bg-background/40" />
          {/* Text overlay on image */}
          <div className="absolute inset-0 flex flex-col justify-center items-start px-6 md:px-12 lg:px-20 pt-5">
            <div className="max-w-3xl">
              <h2 className="font-display font-black text-3xl md:text-5xl lg:text-6xl leading-[0.95]">
                <span className="text-foreground font-bold">Your party. Your time. </span>
                <span className="text-primary font-bold">Your imagination.</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Black Section Below */}
        <div className="bg-background px-6 md:px-12 lg:px-20 py-10 md:py-14">
          <div className="max-w-4xl">
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
              Who are After Parties for?
            </h3>
            <p className="text-base md:text-lg text-foreground/80 mb-8 leading-relaxed max-w-3xl">
              Emerging and touring artists who know their fans, want more show revenue and a better way to create community on their terms.
            </p>

            <ul className="space-y-4 mb-8">
              {section2Bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground/90">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </span>
                  <span className="text-base md:text-lg">{bullet}</span>
                </li>
              ))}
            </ul>

            <Link to="/pricing">
              <Button variant="default" size="lg">
                Pricing
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3 */}
      <section>
        {/* Section 3 Image */}
        <div className="w-full">
          <img
            src={section3Image}
            alt="Artists connecting"
            className="w-full h-auto block"
          />
        </div>

        {/* Black Section Below */}
        <div className="bg-background px-6 md:px-12 lg:px-20 py-10 md:py-14">
          <div className="max-w-4xl">
            <h2 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-foreground mb-4 leading-tight">
              Value comes in stages.
            </h2>
            <p className="text-base md:text-lg text-foreground/80 mb-8 leading-relaxed max-w-3xl">
              See who stays, who pays, and who comes back. Not vanity metrics. Real signals careers are based on.
            </p>

            <ul className="space-y-4 mb-8">
              {section3Bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground/90">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </span>
                  <span className="text-base md:text-lg">{bullet}</span>
                </li>
              ))}
            </ul>

            <Link to="/how-to-golokol">
              <Button variant="default" size="lg">
                How it works
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
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
