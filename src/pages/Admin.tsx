import { useSearchParams, Link } from "react-router-dom";
import { Shield, Music, Calendar, Ticket, Building2, MapPin, KeyRound, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  if (!key) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Not authorized</h1>
            <p className="text-muted-foreground">You don't have access to this page.</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl text-foreground">Admin Portal</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              to={`/admin/after-parties?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">After Parties</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage events, view RSVPs, send recaps, and generate artist links.
              </p>
            </Link>

            <Link
              to={`/admin/lls?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">LLS Submissions</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Review song submissions, update statuses, and manage notes.
              </p>
            </Link>

            <Link
              to={`/admin/discount-codes?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">Discount Codes</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Generate one-time use discount codes for After Party listings.
              </p>
            </Link>

            <Link
              to={`/admin/partners?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">Partners</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage curators, event series, and venues for After Party dropdowns.
              </p>
            </Link>

            <Link
              to={`/admin/cities?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">Cities</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Manage cities where After Parties can be created.
              </p>
            </Link>

            <Link
              to={`/admin/curated-codes?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">Curated Codes</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Generate and manage invite codes for curated LLS submissions.
              </p>
            </Link>

            <Link
              to={`/admin/lls-votes?key=${key}`}
              className="block p-6 border border-border/50 rounded-lg bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl text-foreground">LLS Votes</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                View vote tallies for Lokol Listening Stations by session, city, and artist.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
