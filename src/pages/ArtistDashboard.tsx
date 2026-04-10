import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogOut } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import type { User } from "@supabase/supabase-js";

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/lls-us/artists", { replace: true });
        return;
      }
      setUser(session.user);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/lls-us/artists", { replace: true });
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/lls-us/artists");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-24 px-4 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <img src={golokolLogo} alt="GoLokol" className="h-10 w-10" />
            <h1 className="font-display text-3xl sm:text-4xl text-foreground">
              Artist Dashboard
            </h1>
          </div>

          {/* Coming Soon Card */}
          <div className="rounded-2xl bg-primary p-8 mb-6">
            <h2 className="font-display text-2xl text-primary-foreground mb-3">
              Your dashboard is coming soon.
            </h2>
            <p className="text-primary-foreground/80 text-base font-sans">
              We're building something good.
            </p>
          </div>

          {/* User info */}
          <div className="rounded-xl border border-border bg-card p-4 mb-6">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>

          {/* Sign Out */}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full h-12"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDashboard;
