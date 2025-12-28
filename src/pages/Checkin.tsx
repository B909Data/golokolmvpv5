import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, QrCode, Music, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Checkin = () => {
  const { qr_token } = useParams<{ qr_token: string }>();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckin = () => {
    setIsLoading(true);
    // Simulate check-in process
    setTimeout(() => {
      setIsLoading(false);
      setIsCheckedIn(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            {!isCheckedIn ? (
              <>
                {/* QR Token Display */}
                <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/20 animate-pulse-glow">
                  <QrCode className="h-12 w-12 text-primary" />
                </div>

                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                  CHECK-IN
                </h1>

                <p className="text-muted-foreground mb-2">
                  Token: <span className="font-mono text-primary">{qr_token}</span>
                </p>

                <div className="rounded-xl border border-border bg-card p-6 gradient-card mb-8 mt-6">
                  <h2 className="font-display text-xl text-foreground mb-2">
                    Midnight Groove Session
                  </h2>
                  <p className="text-muted-foreground text-sm mb-1">The Basement</p>
                  <p className="text-muted-foreground text-sm">January 15, 2025 • 9:00 PM</p>
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleCheckin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      CONFIRM CHECK-IN
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground mt-4">
                  Please confirm your attendance when you arrive at the venue
                </p>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-accent/20">
                  <PartyPopper className="h-12 w-12 text-accent" />
                </div>

                <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                  YOU'RE <span className="text-accent">IN!</span>
                </h1>

                <p className="text-muted-foreground mb-8">
                  Welcome to the party! Enjoy the show and support your local artists.
                </p>

                <div className="rounded-xl border border-accent/50 bg-card p-6 gradient-card mb-8">
                  <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                  <p className="text-foreground font-medium">Check-in confirmed</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Token: {qr_token}
                  </p>
                </div>

                <div className="space-y-3">
                  <Link to="/shows" className="block">
                    <Button variant="outline" className="w-full">
                      <Music className="h-4 w-4" />
                      Browse More Shows
                    </Button>
                  </Link>
                  <Link to="/" className="block">
                    <Button variant="ghost" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkin;
