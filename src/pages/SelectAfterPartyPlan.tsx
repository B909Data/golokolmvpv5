import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SelectAfterPartyPlan = () => {
  const navigate = useNavigate();

  const handleSelectPlan = (plan: "emerge" | "touring") => {
    navigate(`/create-afterparty?plan=${plan}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
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

          {/* Plan Cards — mirrors /pricing layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Emerging */}
            <Card className="bg-card border-border flex flex-col">
              <CardHeader className="pb-4">
                <div className="text-xs text-card-foreground-secondary uppercase tracking-wide mb-2">
                  Best for emerging artists
                </div>
                <CardTitle className="font-display text-2xl text-card-foreground">
                  Emerging
                </CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-display font-bold text-card-foreground">$25.99</span>
                  <span className="text-card-foreground-secondary ml-2">per After Party</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="type-body text-card-foreground/80 mb-2 font-medium">
                  Perfect for your first After Party. Test, learn, scale.
                </p>
                <p className="type-body text-card-foreground/70 mb-6 text-sm">
                  Emerging artists testing fan engagement and monetization.
                </p>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-card-foreground mb-3">Includes:</p>
                  <ul className="type-body text-card-foreground/80 space-y-2">
                    <li>• Basic livestream embed</li>
                    <li>• Live chat</li>
                    <li>• Simple viewer analytics</li>
                    <li>• Email support</li>
                  </ul>
                </div>

                {/* Revenue */}
                <div className="border-t border-border pt-4 mb-6 space-y-2">
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Revenue:</strong> 30% platform commission.
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <Button
                    variant="card"
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan("emerge")}
                  >
                    Create an After Party
                  </Button>
                  <p className="text-xs text-card-foreground-secondary text-center mt-3">
                    No limits. No caps. Run as many as you want.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Touring */}
            <Card className="bg-card border-border flex flex-col">
              <CardHeader className="pb-4">
                <div className="text-xs text-card-foreground-secondary uppercase tracking-wide mb-2">
                  For touring artists
                </div>
                <CardTitle className="font-display text-2xl text-card-foreground">
                  Touring
                </CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-display font-bold text-card-foreground">$49.99</span>
                  <span className="text-card-foreground-secondary ml-2">per After Party</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="type-body text-card-foreground/80 mb-2 font-medium">
                  Built for touring artists running multiple shows.
                </p>
                <p className="type-body text-card-foreground/70 mb-6 text-sm">
                  For artists actively touring and monetizing real fan demand.
                </p>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-card-foreground mb-3">Includes:</p>
                  <ul className="type-body text-card-foreground/80 space-y-2">
                    <li>• Everything in Emerging, plus:</li>
                    <li>• Priority support (24-hour response)</li>
                    <li>• Branded landing page customization</li>
                    <li>• Full analytics dashboard</li>
                    <li>• Ability to manage multiple parties</li>
                  </ul>
                </div>

                {/* Revenue */}
                <div className="border-t border-border pt-4 mb-6 space-y-2">
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Revenue:</strong> 30% platform commission.
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <Button
                    variant="card"
                    size="lg"
                    className="w-full"
                    onClick={() => handleSelectPlan("touring")}
                  >
                    Create an After Party
                  </Button>
                  <p className="text-xs text-card-foreground-secondary text-center mt-3">
                    Premium features for serious touring artists.
                  </p>
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
