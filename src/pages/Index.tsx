import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/golokol-hero.svg";
import llsCard from "@/assets/lls-us-hero.jpg";
import connectCard from "@/assets/connect-card.jpg";
import img3Card from "@/assets/img3.svg";
import golokolLogo from "@/assets/golokol-logo.svg";
import { supabase } from "@/integrations/supabase/client";


const HowItWorksCard = ({
  image,
  number,
  title,
  description,
  to,
}: {
  image: string;
  number: number;
  title: string;
  description: string;
  to: string;
}) => (
  <Link
    to={to}
    className="group block rounded-2xl border border-[hsl(0,0%,20%)] bg-[#1A1A1A] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="h-[200px] w-full overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-6 relative">
      <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-[#FFD600] flex items-center justify-center text-black font-bold text-lg shadow-md">
        {number}
      </div>
      <h3 className="mt-4 text-2xl font-bold text-white font-display">{title}</h3>
      <p className="mt-2 text-base text-[#CCCCCC]">{description}</p>
    </div>
  </Link>
);

const Index = () => {
  const navigate = useNavigate();
  const [showFanSignIn, setShowFanSignIn] = useState(false);
  const [fanEmail, setFanEmail] = useState("");
  const [fanPassword, setFanPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fanSignInLoading, setFanSignInLoading] = useState(false);
  const [fanSignInError, setFanSignInError] = useState<string | null>(null);

  const [genres, setGenres] = useState<{ label: string; slug: string; image: string }[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);

  const SLUG_MAP: Record<string, string> = {
    "Hip-Hop": "hiphop",
    "Hip Hop": "hiphop",
    "R&B": "rnb",
    "RnB": "rnb",
    "Alternative": "alternative",
    "Hardcore + Punk": "hardcore",
  };

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("genre_style, song_image_url")
        .eq("admin_status", "approved")
        .not("song_image_url", "is", null);

      if (!data || data.length === 0) { setGenresLoading(false); return; }

      const usedImages = new Set<string>();
      const genreMap = new Map<string, string>();

      for (const row of data) {
        const genre = (row.genre_style as string).split(",")[0].trim();
        if (!genre || genreMap.has(genre)) continue;
        const img = row.song_image_url as string;
        if (usedImages.has(img)) continue;
        usedImages.add(img);
        genreMap.set(genre, img);
      }

      const cards: { label: string; slug: string; image: string }[] = [];
      for (const [label, img] of genreMap) {
        const slug = SLUG_MAP[label] || label.toLowerCase().replace(/[^a-z0-9]/g, "");
        cards.push({ label, slug, image: img });
      }
      setGenres(cards);
      setGenresLoading(false);
    };
    fetchGenres();
  }, []);

  const closeFanSignIn = () => {
    setShowFanSignIn(false);
    setFanSignInError(null);
    setFanPassword("");
    setShowPassword(false);
  };

  const handleFanSignIn = async () => {
    setFanSignInError(null);
    if (!fanEmail || !fanPassword) {
      setFanSignInError("Email and password are required.");
      return;
    }
    setFanSignInLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fanEmail.trim(),
        password: fanPassword,
      });
      if (error) {
        setFanSignInError(error.message);
        setFanSignInLoading(false);
        return;
      }
      const userId = data.user?.id;
      if (!userId) {
        setFanSignInError("Sign in failed. Please try again.");
        setFanSignInLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("fan_profiles")
        .select("id")
        .eq("fan_user_id", userId)
        .maybeSingle();
      if (!profile) {
        await supabase.auth.signOut();
        setFanSignInError("No fan account found. Discover at a local store first.");
        setFanSignInLoading(false);
        return;
      }
      navigate("/fan/scene");
    } catch (err: any) {
      setFanSignInError(err?.message || "Something went wrong.");
      setFanSignInLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-start overflow-hidden">
        <img
          src={heroImage}
          alt="GoLokol community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-16 max-w-3xl">
          <h1 className="font-display font-bold text-[32px] md:text-[48px] leading-[1.1] mb-4">
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 56, lineHeight: 1.0, color: "#FFD600" }}>
              Good Music Lives<br />in Atlanta
            </span>
          </h1>
          <p className="text-white text-base md:text-lg mt-4 max-w-xl opacity-90">
            Discover and build your Lokol Scene.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/lls-us/retail"
              className="inline-flex items-center justify-center bg-white text-black font-semibold text-base rounded-2xl h-14 px-8 min-w-[200px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              I am a record store
            </Link>
            <Link
              to="/lls-us/artists"
              className="inline-flex items-center justify-center bg-black text-[#FFD600] font-semibold text-base rounded-2xl h-14 px-8 min-w-[200px] border-2 border-[#FFD600] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              I am an artist
            </Link>
            <button
              type="button"
              onClick={() => setShowFanSignIn(true)}
              className="inline-flex items-center justify-center bg-transparent text-white font-bold text-base rounded-2xl h-14 px-8 min-w-[200px] border-2 border-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              My Lokol Scene
            </button>
          </div>
        </div>
      </section>

      {/* WHY LOCAL */}
      <section className="bg-black px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#FFD600] mb-6 leading-tight">
            Music isn't dead, it's local.
          </h2>
          <p className="text-[20px] text-white leading-relaxed mb-6">
            Local music ecosystems have been disconnected by algorithms and ungrounded viral moments. Artists struggle alone. Music lovers are overwhelmed with choice. Local venues and music retail compete with monopolies that prioritize the intangible.
          </p>
          <p className="text-[20px] text-white leading-relaxed">
            We help reconnect the collective strength of local artists, fans, venues, and retail with the city they all call home.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#0E0E0E] px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <h2 className="text-center font-display font-bold text-3xl md:text-[40px] text-white mb-12">
          How it works
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <HowItWorksCard
            image={llsCard}
            number={1}
            title="Lokol Listening Stations"
            description="Place a Lokol Listening Station in your store featuring local artists city-wide."
            to="/lls-us"
          />
          <HowItWorksCard
            image={connectCard}
            number={2}
            title="Your City Your Scene"
            description='Local music lovers scan, discover and add artists to their customized "Lokol Scene" dashboard. Local artists enjoy direct-to-fan engagement and show promotion.'
            to="https://golokol.app/lls-us"
          />
          <HowItWorksCard
            image={img3Card}
            number={3}
            title="The Value of Local Music"
            description="Local fans earn points for engaging and attending shows. Then redeem that value at local businesses."
            to="https://golokol.app/lls-us"
          />
        </div>
      </section>

      <Footer />

      {/* FAN SIGN IN MODAL */}
      {showFanSignIn && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={closeFanSignIn}
        >
          <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />
          <div
            className="bg-[#1a1a1a] rounded-2xl p-8 max-w-sm w-full mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeFanSignIn}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-4">
              <img src={golokolLogo} alt="GoLokol" className="w-10 h-10" />
              <h2
                className="text-white text-center"
                style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, lineHeight: 1.1 }}
              >
                Welcome back to your Lokol Scene
              </h2>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={fanEmail}
                onChange={(e) => setFanEmail(e.target.value)}
                className="w-full bg-[#0E0E0E] border border-[#333] text-white placeholder-white/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
              />
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={fanPassword}
                  onChange={(e) => setFanPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFanSignIn();
                  }}
                  className="w-full bg-[#0E0E0E] border border-[#333] text-white placeholder-white/40 rounded-xl px-4 py-3 pr-12 text-base focus:outline-none focus:border-[#FFD600]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: { redirectTo: window.location.origin + "/fan/scene" },
                  });
                }}
                className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-px bg-[#333]" />
                <span className="text-white/50 text-xs">or</span>
                <div className="flex-1 h-px bg-[#333]" />
              </div>
              {fanSignInError && (
                <p className="text-red-500 text-sm text-center w-full">{fanSignInError}</p>
              )}
              <button
                onClick={handleFanSignIn}
                disabled={fanSignInLoading}
                className="w-full bg-[#FFD600] text-black font-bold rounded-xl py-3 text-base disabled:opacity-60"
              >
                {fanSignInLoading ? "Signing in..." : "Sign In"}
              </button>
              <div className="w-full h-px bg-[#333] my-1" />
              <Link
                to="/lls/crates-atl"
                onClick={closeFanSignIn}
                className="text-[#FFD600] text-sm text-center hover:underline"
              >
                New to GoLokol? Explore Atlanta music and build your scene.
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
