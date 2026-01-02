import { Link } from "react-router-dom";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CreateAfterparty = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Music className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
              CREATE AN <span className="text-primary">AFTERPARTY</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Event creation is being rebuilt. Check back soon!
            </p>
            <Link to="/shows">
              <Button variant="outline">View Shows</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateAfterparty;
