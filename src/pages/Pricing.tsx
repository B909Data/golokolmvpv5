import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* PAGE HEADER */}
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Pricing
            </h1>
            <p className="type-body text-foreground text-lg max-w-xl mx-auto">
              Choose the After Party setup that fits where you are right now.
            </p>
          </div>

          {/* PRICING TIERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* EMERGE TIER */}
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
                  <Link to="/create-afterparty?plan=emerge" className="block">
                    <Button variant="card" size="lg" className="w-full">
                      Create an After Party
                    </Button>
                  </Link>
                  <p className="text-xs text-card-foreground-secondary text-center mt-3">
                    No limits. No caps. Run as many as you want.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* TOURING TIER */}
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
                  <Link to="/create-afterparty?plan=touring" className="block">
                    <Button variant="card" size="lg" className="w-full">
                      Create an After Party
                    </Button>
                  </Link>
                  <p className="text-xs text-card-foreground-secondary text-center mt-3">
                    Premium features for serious touring artists.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* BULK/ORG TIER */}
            <Card className="bg-card border-border flex flex-col">
              <CardHeader className="pb-4">
                <div className="text-xs text-card-foreground-secondary uppercase tracking-wide mb-2">
                  For labels, managers, and booking agents
                </div>
                <CardTitle className="font-display text-2xl text-card-foreground">
                  Bulk/Org
                </CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-display font-bold text-card-foreground">$30</span>
                  <span className="text-card-foreground-secondary ml-2">per party (10+ per quarter min)</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="type-body text-card-foreground/80 mb-2 font-medium">
                  For labels, managers, and booking agents.
                </p>
                <p className="type-body text-card-foreground/70 mb-6 text-sm">
                  Manage multiple roster artists from one centralized dashboard.
                </p>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-card-foreground mb-3">Includes:</p>
                  <ul className="type-body text-card-foreground/80 space-y-2">
                    <li>• Everything in Touring, plus:</li>
                    <li>• Centralized org dashboard</li>
                    <li>• Manage multiple roster artists</li>
                  </ul>
                </div>

                {/* Revenue */}
                <div className="border-t border-border pt-4 mb-6">
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Revenue:</strong> 30% platform commission.
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <a 
                    href="mailto:backstage@golokol.app" 
                    className="block"
                  >
                    <Button variant="outline" size="lg" className="w-full border-card-foreground text-card-foreground hover:bg-card-foreground/10">
                      Contact Us
                    </Button>
                  </a>
                  <p className="text-xs text-card-foreground-secondary text-center mt-3">
                    Volume pricing. Minimum commitment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FOOTER NOTE */}
          <div className="text-center pt-8 border-t border-border">
            <p className="text-foreground text-sm">
              Artist curated. Fan appreciated.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
