import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/homepage-hero.png";
import section2Image from "@/assets/homepage-section2.png";

const Index = () => {
  const heroBullets = [
    "Earn directly from fans after your show",
    "Create a private, 24-hour After Party",
    "See who values your work in real time",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* SECTION 1 — HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-background/30" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-2xl ml-auto mr-8 md:mr-16 lg:mr-24 text-right">
            <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl text-foreground mb-4 leading-[0.95]">
              Make every show count
            </h1>

            <p className="text-lg md:text-xl text-foreground/90 mb-6 leading-relaxed">
              Turn the energy after your set into real support from the fans who showed up.
            </p>

            <ul className="space-y-3 mb-8">
              {heroBullets.map((bullet, index) => (
                <li key={index} className="flex items-center justify-end gap-3 text-foreground/90">
                  <span className="text-base md:text-lg">{bullet}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </span>
                </li>
              ))}
            </ul>

            <Link to="/for-artists" className="inline-block">
              <Button variant="secondary" size="lg">
                Throw an After Party
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — ATMOSPHERIC */}
      <section className="relative w-full">
        <img
          src={section2Image}
          alt=""
          className="w-full h-auto block"
        />
        {/* Subcaption overlay positioned in lower center third */}
        <div className="absolute inset-0 flex items-end justify-center pb-[15%]">
          <p className="font-display font-bold text-lg md:text-xl lg:text-2xl text-white leading-[1.1]">
            Artist curated. Fan appreciated.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
