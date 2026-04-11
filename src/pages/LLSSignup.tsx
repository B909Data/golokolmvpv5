import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import { supabase } from "@/integrations/supabase/client";

const LLSSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const points = searchParams.get("points") || "0";

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password || password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/fan/scene",
      },
    });
    if (error) {
      setErrors({ general: error.message });
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin + "/fan/scene",
      },
    });

    if (error) {
      setErrors({ general: error.message });
      setLoading(false);
      return;
    }

    const user = data.user;
    if (user) {
      const pointsNum = parseInt(points) || 0;

      // Create fan profile - don't block redirect on failure
      try {
        await supabase.from("fan_profiles").upsert(
          {
            fan_user_id: user.id,
            name: name.trim() || null,
            email: email.trim(),
            city: "Atlanta",
            lokol_points: pointsNum,
          },
          { onConflict: "fan_user_id" }
        );

        // Record points in ledger
        if (pointsNum > 0) {
          await supabase.from("lokol_points_ledger").insert({
            fan_user_id: user.id,
            points_earned: pointsNum,
            action_type: "station_scan",
          });
        }
      } catch (dbError) {
        console.error("Profile creation error:", dbError);
      }

      navigate("/fan/scene");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Nav */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-black border-b border-gray-800">
        <Link to="/lls" className="flex items-center">
          <img src={golokolLogo} alt="GoLokol" className="h-6 w-6" />
        </Link>
        <p className="text-sm font-bold text-white">Sign Up</p>
        <div className="w-6" />
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center px-6 py-12">
        <p className="text-2xl sm:text-3xl font-bold text-[#FFD600] text-center mb-3">
          {points} Crate Points
        </p>
        <h1 className="text-[28px] sm:text-4xl font-bold text-white text-center mb-4">
          Sign up and Save your Points.
        </h1>
        <p className="text-base sm:text-lg text-white/80 text-center mb-12 max-w-md">
          100 points = 10% off your next Crate purchase
        </p>

        {/* Form Card */}
        <div className="w-full max-w-[400px] bg-white rounded-xl border border-[#E8E8E8] p-8 sm:p-10">
          {errors.general && (
            <p className="text-red-500 text-sm mb-4 text-center">{errors.general}</p>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-11 flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg text-black font-medium text-base hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-black mb-1.5">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 text-base text-black placeholder:text-[#999999] bg-[#F5F5F5] border border-transparent rounded-md focus:border-black focus:outline-none transition-colors"
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-bold text-black mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`w-full h-11 px-3 text-base text-black placeholder:text-[#999999] bg-[#F5F5F5] border rounded-md focus:outline-none transition-colors ${
                  errors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-transparent focus:border-black"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm font-bold text-black mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  className={`w-full h-11 px-3 pr-10 text-base text-black placeholder:text-[#999999] bg-[#F5F5F5] border rounded-md focus:outline-none transition-colors ${
                    errors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-black"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-6 bg-[#FFD600] text-black font-bold text-base rounded-lg hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60"
            >
              {loading ? "Signing up…" : "Sign Up"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-gray-800">
        <p className="text-xs text-gray-400">
          GoLokol — The future of music is local.
        </p>
      </footer>
    </div>
  );
};

export default LLSSignup;
