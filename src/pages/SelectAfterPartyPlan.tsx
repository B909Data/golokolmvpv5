import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Pricing constants
const EMERGE_SETUP_FEE = "$25.99";
const TOURING_SETUP_FEE = "$49.99";

const SelectAfterPartyPlan = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (plan: "emerge" | "touring") => {
    // Navigate to the wizard with the selected plan as a query param
    navigate(`/create-afterparty?plan=${plan}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Choose your After Party plan
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto">
              Pick the plan that matches where you are right now.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emerge Plan */}
            <Card className="bg-card border-border flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">
                  Emerge
                </h2>

                <div className="space-y-2 mb-6">
                  <p className="text-card-foreground/80">
                    <span className="text-card-foreground font-medium">Setup fee:</span> {EMERGE_SETUP_FEE}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan("emerge")}
                  >
                    Continue with Emerge
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Touring Plan */}
            <Card className="bg-card border-border flex flex-col">
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h2 className="font-display text-2xl font-bold text-card-foreground mb-4">
                  Touring
                </h2>

                <div className="space-y-2 mb-6">
                  <p className="text-card-foreground/80">
                    <span className="text-card-foreground font-medium">Setup fee:</span> {TOURING_SETUP_FEE}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan("touring")}
                  >
                    Continue with Touring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <Link
              to="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
            >
              See full pricing details
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SelectAfterPartyPlan;
