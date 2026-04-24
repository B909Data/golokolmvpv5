import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const LLSSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const points = parseInt(searchParams.get("points") || "0");
  const storeSlug = searchParams.get("store") || "";
  const artistName = searchParams.get("artist") || "";
  const refCode = searchParams.get("ref") || localStorage.getItem("golokol_referral_code") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || password.length < 8) {
      setError("Please enter a valid email and password (min 8 characters).");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + "/fan/scene" },
      });

      let userId = data?.user?.id;

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInError) {
            setError("Wrong password. Try again.");
            setLoading(false);
            return;
          }
          userId = signInData?.user?.id;
        } else {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
      }

      if (!userId) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Process referral if present
      if (refCode && userId) {
        try {
          const { data: referral } = await (supabase as any)
            .from("referrals")
            .select("id, referrer_fan_id, points_awarded")
            .eq("referral_code", refCode)
            .maybeSingle();
          if (referral && !referral.points_awarded) {
            await (supabase as any)
              .from("referrals")
              .update({
                referred_fan_id: userId,
                signed_up_at: new Date().toISOString(),
                points_awarded: true,
              })
              .eq("id", referral.id);
            const { data: referrerProfile } = await (supabase as any)
              .from("fan_profiles")
              .select("lokol_points")
              .eq("fan_user_id", referral.referrer_fan_id)
              .maybeSingle();
            if (referrerProfile) {
              await (supabase as any)
                .from("fan_profiles")
                .update({
                  lokol_points: (referrerProfile.lokol_points || 0) + 5,
                })
                .eq("fan_user_id", referral.referrer_fan_id);
            }
          }
        } catch {}
        localStorage.removeItem("golokol_referral_code");
      }

      // Check if profile already exists
      const { data: existingProfile } = await (supabase as any)
        .from("fan_profiles")
        .select("lokol_points, daily_points_earned, daily_points_date")
        .eq("fan_user_id", userId)
        .maybeSingle();

      const todayAtlanta = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
      const existingIsToday = existingProfile?.daily_points_date === todayAtlanta;
      const existingDaily = existingIsToday ? (existingProfile?.daily_points_earned || 0) : 0;
      const existingTotal = existingProfile?.lokol_points || 0;

      // Use whichever is higher — DB or URL param
      const finalPoints = Math.max(points, existingTotal);
      const finalDaily = Math.max(points, existingDaily);

      await (supabase as any).from("fan_profiles").upsert(
        {
          fan_user_id: userId,
          name: name.trim() || null,
          email: email.trim(),
          city: "Atlanta",
          lokol_points: finalPoints,
          daily_points_earned: finalDaily,
          daily_points_date: todayAtlanta,
          last_store_slug: storeSlug || null,
          last_store_visit: storeSlug ? new Date().toISOString() : null,
        },
        { onConflict: "fan_user_id" }
      );

      // Save all pre-signup saves from localStorage
      try {
        const savedIdsRaw = localStorage.getItem("golokol_saved_ids");
        const savedIds: string[] = savedIdsRaw ? JSON.parse(savedIdsRaw) : [];

        // Also include the artist from URL param if not already in savedIds
        // We need submission data for URL artist
        if (savedIds.length > 0) {
          const saves = savedIds.map((submissionId: string) => ({
            fan_user_id: userId,
            submission_id: submissionId,
            store_slug: storeSlug || null,
            artist_name: submissionId === "url_artist" ? artistName : null,
          }));

          // Upsert to avoid duplicates
          await (supabase as any).from("lokol_scene_saves").upsert(saves, {
            onConflict: "fan_user_id,submission_id",
            ignoreDuplicates: true,
          });
        } else if (artistName) {
          // Fallback: just save the URL artist by name if no localStorage
          await (supabase as any).from("lokol_scene_saves").insert({
            fan_user_id: userId,
            artist_name: artistName,
            store_slug: storeSlug || null,
          });
        }
      } catch (saveErr) {
        console.error("Error saving pre-signup artists:", saveErr);
      }

      try {
        await supabase.functions.invoke("send-mailerlite-fan-welcome", {
          body: { email: email.trim(), name: name.trim() || "" },
        });
      } catch (mlErr) {
        console.error("MailerLite fan welcome error:", mlErr);
      }

      navigate("/fan/scene");
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black text-white flex flex-col"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <img src={golokolLogo} alt="GoLokol" className="w-16 h-16 mb-4" />
        <h1
          style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, color: "#FFD600" }}
        >
          Create Account
        </h1>
      </div>

      <div className="flex-1 px-6 pb-12 max-w-md w-full mx-auto">
        {points > 0 && (
          <div
            className="rounded-2xl p-5 mb-6 text-center"
            style={{ backgroundColor: "#FFD600", color: "#000" }}
          >
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 1.1 }}>
              {points} Lokol Points
            </p>
            <p className="text-sm font-semibold mt-2">
              Sign up to save your points{artistName ? ` and ${artistName}` : ""} to your Lokol Scene.
            </p>
          </div>
        )}
        {points === 0 && artistName && (
          <div
            className="rounded-2xl p-5 mb-6 text-center"
            style={{ backgroundColor: "#FFD600", color: "#000" }}
          >
            <p className="font-bold">Save {artistName} to your Atlanta Lokol Scene.</p>
          </div>
        )}

        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: window.location.origin + "/fan/scene" },
            });
          }}
          className="w-full h-12 mb-4 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-[#333]" />
          <span className="text-white/40 text-xs">or</span>
          <div className="flex-1 h-px bg-[#333]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:border-[#FFD600] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Email *</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:border-[#FFD600] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-white">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:border-[#FFD600] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 font-bold text-base rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: "#FFD600", color: "#000" }}
          >
            {loading ? "Creating Account..." : "Create Account & Save"}
          </button>
        </form>
      </div>

      <div className="px-6 pb-8 text-center">
        <p className="text-white/40 text-xs">GoLokol — The future of music is local.</p>
      </div>
    </div>
  );
};

export default LLSSignup;
