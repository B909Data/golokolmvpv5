import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const redirectAfterAuth = async (userId: string) => {
    const { data: artistProfile } = await (supabase as any)
      .from("artist_profiles")
      .select("id")
      .eq("artist_user_id", userId)
      .maybeSingle();

    if (artistProfile) {
      navigate("/artist/dashboard", { replace: true });
    } else {
      navigate("/fan/scene", { replace: true });
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/auth/callback" },
        });
        if (signUpError) { setError(signUpError.message); setLoading(false); return; }
        if (data.user) await redirectAfterAuth(data.user.id);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) { setError("Wrong email or password. Try again."); setLoading(false); return; }
        if (data.user) await redirectAfterAuth(data.user.id);
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        <img src={golokolLogo} alt="GoLokol" className="h-16 w-16 mb-6" />

        <h1
          className="text-white text-center mb-2"
          style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, letterSpacing: 0.5 }}
        >
          {mode === "signin" ? "WELCOME BACK" : "JOIN GOLOKOL"}
        </h1>

        <p className="text-white/60 text-center text-sm mb-8">
          {mode === "signin"
            ? "Sign in to your Lokol Scene or Artist Dashboard."
            : "Create your account to start discovering Atlanta music."}
        </p>

        <div className="w-full flex flex-col gap-4">
          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full h-12 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-white/90 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs">or</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:border-[#FFD600] focus:outline-none"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 bg-[#1a1a1a] border border-[#333] text-white rounded-xl focus:border-[#FFD600] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 font-bold rounded-xl mt-2 disabled:opacity-60"
              style={{ backgroundColor: "#FFD600", color: "#000" }}
            >
              {loading ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-center text-white/40 text-sm pt-2"
          >
            {mode === "signin"
              ? "New to GoLokol? Create an account"
              : "Already have an account? Sign in"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-center text-white/30 text-xs"
          >
            Back to GoLokol
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
