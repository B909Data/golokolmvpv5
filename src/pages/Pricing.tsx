import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-card-foreground">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Page Title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-12">
            Pricing
          </h1>

          {/* Section 1 — Pay-As-Needed */}
          <section className="mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Pay as needed
            </h2>
            <p className="text-3xl md:text-4xl font-display font-bold mb-6">
              11.99 <span className="text-lg font-normal text-muted-foreground">per After Party</span>
            </p>

            <p className="type-body text-card-foreground mb-4">Includes:</p>
            <ul className="type-body text-card-foreground space-y-2 mb-4 list-disc list-inside">
              <li>Chat</li>
              <li>Livestream</li>
              <li>Show badges</li>
              <li>Special merch links</li>
              <li>Moderate chat</li>
            </ul>
            <p className="type-body text-card-foreground mb-8">
              10% of sales goes to GoLokol.
            </p>

            <Link to="/create-afterparty">
              <Button variant="card" size="lg">
                Create an After Party
              </Button>
            </Link>
          </section>

          {/* Divider */}
          <Separator className="my-12 bg-border" />

          {/* Section 2 — Professional Credits */}
          <section>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              Professional Credits
            </h2>

            <p className="type-body text-card-foreground mb-6">
              Purchase After Parties in bulk at a discounted rate. Perfect for touring artists, venues, booking agents, and live show curators.
            </p>

            <Link 
              to="/partners" 
              className="inline-block type-body text-card-foreground underline underline-offset-4 hover:text-primary transition-colors mb-8"
            >
              Learn more →
            </Link>

            <p className="type-body text-muted-foreground">
              Questions? Contact us at{" "}
              <a 
                href="mailto:backstage@golokol.app" 
                className="underline underline-offset-2 hover:text-card-foreground transition-colors"
              >
                backstage@golokol.app
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
