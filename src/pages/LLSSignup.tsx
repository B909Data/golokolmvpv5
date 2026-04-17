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

      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      await (supabase as any).from("fan_profiles").upsert(
        {
          fan_user_id: userId,
          name: name.trim() || null,
          email: email.trim(),
          city: "Atlanta",
          lokol_points: points,
          daily_points_earned: points,
          daily_points_date: today,
          last_store_slug: storeSlug || null,
          last_store_visit: storeSlug ? new Date().toISOString() : null,
        },
        { onConflict: "fan_user_id" }
      );

      if (artistName) {
        await (supabase as any).from("fan_saves").insert({
          fan_user_id: userId,
          artist_choice: artistName,
          store_slug: storeSlug || null,
        });
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
