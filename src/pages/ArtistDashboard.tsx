import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/artist/signup", { replace: true }); return; }

      setUserEmail(session.user.email ?? null);

      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("artist_name")
        .eq("artist_user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.artist_name) setArtistName(data.artist_name);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/artist/signup", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground/50 font-sans">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 px-6 md:px-12 py-12 max-w-xl mx-auto w-full space-y-10">
        <div className="text-center">
          <img src={golokolLogo} alt="GoLokol" className="h-10 w-10 mx-auto mb-6" />
        </div>

        <section className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl text-foreground">Welcome to GoLokol</h1>
          <p className="text-foreground/80 text-base font-sans">
            {artistName
              ? `Good to have you back, ${artistName}.`
              : "You're in. Let's get your music heard."}
          </p>
          <p className="text-primary text-sm font-sans italic">The future of music is local.</p>
        </section>

        <section className="space-y-4">
          <Link to="/artist/submit" className="block">
            <Button className="w-full h-14 text-base font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Your Music
            </Button>
          </Link>
          <ul className="space-y-1.5 text-foreground/60 text-sm font-sans list-disc list-inside">
            <li>Up to 2 submissions per month</li>
            <li>MP3 files only, max 20MB</li>
            <li>Square song image required (min 200×200px)</li>
            <li>Free to submit</li>
          </ul>
        </section>

        <section className="space-y-3">
          <Button
            disabled
            className="w-full h-14 text-base font-display font-bold bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          >
            Submit a Show
          </Button>
          <p className="text-foreground/50 text-sm font-sans">
            Coming soon. Every fan who adds you to their Lokol Atlanta Scene gets notified when you have a show — and earns points for showing up.
          </p>
        </section>

        <div className="pt-6 border-t border-foreground/10 space-y-3">
          {userEmail && (
            <p className="text-foreground/40 text-xs font-sans">Signed in as: {userEmail}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-foreground/20 text-foreground/60 hover:text-foreground hover:bg-foreground/5"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
