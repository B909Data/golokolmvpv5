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
                  Emerge
                </CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-display font-bold text-card-foreground">$25.99</span>
                  <span className="text-card-foreground-secondary ml-2">per After Party</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="type-body text-card-foreground/80 mb-6">
                  Designed for emerging artists testing value, building momentum, and learning what their fans will support.
                </p>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-card-foreground mb-3">Includes:</p>
                  <ul className="type-body text-card-foreground/80 space-y-2">
                    <li>• Private After Party chat</li>
                    <li>• Livestream access</li>
                    <li>• Show badges</li>
                    <li>• Special merch links</li>
                    <li>• Chat moderation tools</li>
                  </ul>
                </div>

                {/* Limits & Revenue */}
                <div className="border-t border-border pt-4 mb-6 space-y-2">
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Limit:</strong> $500 gross revenue cap per After Party
                  </p>
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Revenue:</strong> Artist keeps majority. GoLokol platform fee applies.
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
                    Emerge is designed to help you prove value. Upgrade when you outgrow it.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* TOURING TIER */}
            <Card className="bg-card border-border flex flex-col">
              <CardHeader className="pb-4">
                <div className="text-xs text-card-foreground-secondary uppercase tracking-wide mb-2">
                  No revenue cap
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
                <p className="type-body text-card-foreground/80 mb-6">
                  Built for artists actively touring and monetizing real fan demand.
                </p>

                {/* Features */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-card-foreground mb-3">Includes:</p>
                  <ul className="type-body text-card-foreground/80 space-y-2">
                    <li>• Private After Party chat</li>
                    <li>• Livestream access</li>
                    <li>• Show badges</li>
                    <li>• Special merch links</li>
                    <li>• Chat moderation tools</li>
                  </ul>
                </div>

                {/* Limits & Revenue */}
                <div className="border-t border-border pt-4 mb-6 space-y-2">
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Limit:</strong> No revenue cap
                  </p>
                  <p className="text-sm text-card-foreground-secondary">
                    <strong className="text-card-foreground">Revenue:</strong> Artist keeps majority. GoLokol platform fee applies.
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
                    Unlimited revenue. No ceiling.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* PROFESSIONAL / BULK TIER */}
            <Card className="bg-card border-border flex flex-col">
              <CardHeader className="pb-4">
                <div className="text-xs text-card-foreground-secondary uppercase tracking-wide mb-2">
                  For teams & labels
                </div>
                <CardTitle className="font-display text-2xl text-card-foreground">
                  Professional / Bulk
                </CardTitle>
                <div className="pt-2">
                  <span className="text-3xl font-display font-bold text-card-foreground">Custom</span>
                  <span className="text-card-foreground-secondary ml-2">pricing</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="type-body text-card-foreground/80 mb-6">
                  For touring artists, venues, booking agents, labels, and live show curators who want to purchase After Parties in bulk.
                </p>

                {/* Details */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-card-foreground mb-3">Details:</p>
                  <ul className="type-body text-card-foreground/80 space-y-2">
                    <li>• Discounted bulk After Party purchases</li>
                    <li>• Optional advanced workflows</li>
                    <li>• Designed for teams managing multiple events</li>
                  </ul>
                </div>

                {/* Spacer to align with other cards */}
                <div className="border-t border-border pt-4 mb-6">
                  <p className="text-sm text-card-foreground-secondary">
                    Custom pricing based on volume and needs.
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
                    Email backstage@golokol.app
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
