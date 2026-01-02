import { Link } from "react-router-dom";
import { ArrowLeft, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AfterpartyDetail = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Music className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl text-foreground mb-4">COMING SOON</h1>
          <p className="text-muted-foreground mb-6">
            Event details will be available once the new system is ready.
          </p>
          <Link to="/shows">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shows
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AfterpartyDetail;
