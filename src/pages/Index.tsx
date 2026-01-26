import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/homepage-hero.png";
import section2Image from "@/assets/homepage-section2.png";

const Index = () => {
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
              The show is over.
            </h1>
            <p className="font-display font-bold text-2xl md:text-3xl lg:text-4xl text-primary mb-8 leading-[1.1]">
              This is what comes after.
            </p>

            <Link to="/find-after-party">
              <Button variant="secondary" size="lg">
                Tonight's After Party
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — EMPTY STAGE (atmosphere only) */}
      <section className="relative w-full">
        <img
          src={section2Image}
          alt=""
          className="w-full h-auto block"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Index;
