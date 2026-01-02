import { Link } from "react-router-dom";
import { Music, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Shows = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
              UPCOMING <span className="text-primary">LOKOL</span> AFTER PARTIES
            </h1>
            <p className="text-muted-foreground text-lg">Discover live music and after show antics online.</p>
          </div>

          {/* Coming Soon Placeholder */}
          <div className="text-center py-20">
            <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Music className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-3xl text-foreground mb-4">COMING SOON</h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              We're building something new. Check back soon for upcoming events!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create-afterparty">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create an Afterparty
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shows;
