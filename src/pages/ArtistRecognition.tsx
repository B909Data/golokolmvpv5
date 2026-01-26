import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/arp-hero.png";
import contextImage from "@/assets/arp-context.png";
import valueImage from "@/assets/arp-value.png";

const ArtistRecognition = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* SECTION 1 — HERO */}
      <section className="pt-20">
        <img
          src={heroImage}
          alt="Artist backstage with red cup"
          className="w-full h-auto block"
        />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-[0.95]">
              Make every show count.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 leading-relaxed">
              The shows cover expenses. The After Party funds the rest.
            </p>
            <Link to="/create-afterparty">
              <Button size="lg">
                Create an After Party
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2 — EXPLANATION */}
      <section>
        <img
          src={contextImage}
          alt="Empty stage after show"
          className="w-full h-auto block"
        />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-[0.95]">
              Your party. Your time. Your imagination.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              A GoLokol After Party is a space fans at the show pay to chat/ livestream with artists. 24 hours, to use how you want. Then Poof! The party ends.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — VALUE */}
      <section>
        <img
          src={valueImage}
          alt="Two people in focused conversation"
          className="w-full h-auto block"
        />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-[0.95]">
              This is where value shows up again.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              The After Party lets you see who stays, who pays, and who comes back. Not vanity metrics. Real signals careers are based on.
            </p>
            <Link to="/how-to-golokol">
              <Button variant="secondary" size="lg">
                How it works
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistRecognition;
