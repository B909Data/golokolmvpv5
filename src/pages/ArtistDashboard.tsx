import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

interface LatestSubmission {
  song_title: string;
  admin_status: string | null;
  rejection_reason: string | null;
}

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<LatestSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/artist/signup", { replace: true }); return; }

      setUserEmail(session.user.email ?? null);

      // Handle pending profile from Google OAuth signup
      const pendingProfile = localStorage.getItem("pending_profile");
      if (pendingProfile) {
        try {
          const profileData = JSON.parse(pendingProfile);
          await supabase.auth.updateUser({ data: profileData });
          localStorage.removeItem("pending_profile");
          if (profileData.first_name) setFirstName(profileData.first_name);
        } catch {
          localStorage.removeItem("pending_profile");
        }
      }

      // Read user metadata for first_name
      const meta = session.user.user_metadata;
      if (meta?.first_name) setFirstName(meta.first_name);

      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("artist_name, song_title, admin_status, rejection_reason")
        .eq("artist_user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.artist_name) setArtistName(data.artist_name);
      if (data?.song_title) {
        setLatestSubmission({
          song_title: data.song_title,
          admin_status: data.admin_status,
          rejection_reason: data.rejection_reason,
        });
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/artist/signup", { replace: true });
  };

  const getWelcomeMessage = () => {
    const hasSubmission = !!latestSubmission;
    if (firstName) {
      return hasSubmission
        ? `Welcome back, ${firstName}.`
        : `You're in, ${firstName}. Let's get your music heard.`;
    }
    if (artistName) {
      return `Good to have you back, ${artistName}.`;
    }
    return "You're in. Let's get your music heard.";
  };

  const renderStatusBadge = () => {
    if (!latestSubmission) return null;
    const { admin_status, rejection_reason } = latestSubmission;

    if (admin_status === "approved") {
      return (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 space-y-2">
          <p className="text-white font-bold text-lg font-sans">{latestSubmission.song_title}</p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-black">
            Added to Platform
          </span>
          <p className="text-white text-sm font-sans">
            Your song is now being discovered at our participating stores in Atlanta. Your free month trial begins today.
          </p>
        </div>
      );
    }

    if (admin_status === "rejected") {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 space-y-2">
          <p className="text-white font-bold text-lg font-sans">{latestSubmission.song_title}</p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
            Not Accepted
          </span>
          {rejection_reason && (
            <p className="text-white/70 text-sm font-sans">{rejection_reason}</p>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 space-y-2">
        <p className="text-white font-bold text-lg font-sans">{latestSubmission.song_title}</p>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary text-black">
          Pending Review
        </span>
        <p className="text-white/70 text-sm font-sans">We'll be in touch soon.</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-white/50 font-sans">Loading...</div>
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
          <h1 className="font-display text-3xl md:text-4xl text-white">Welcome to GoLokol</h1>
          <p className="text-white text-base font-sans">{getWelcomeMessage()}</p>
          <p className="text-primary text-sm font-sans italic">The future of music is local.</p>
        </section>

        <section className="space-y-4">
          {renderStatusBadge()}

          <Link to="/artist/submit" className="block">
            <Button className="w-full h-14 text-base font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90">
              Submit Your Music
            </Button>
          </Link>
          <ul className="space-y-1.5 text-white/60 text-sm font-sans list-disc list-inside">
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
          <p className="text-white/50 text-sm font-sans">
            Coming soon. Every fan who adds you to their Lokol Atlanta Scene gets notified when you have a show — and earns points for showing up.
          </p>
        </section>

        <div className="pt-6 border-t border-white/10 space-y-3">
          {userEmail && (
            <p className="text-white text-xs font-sans">Signed in as: {userEmail}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-white/20 text-white/60 hover:text-white hover:bg-white/5"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;