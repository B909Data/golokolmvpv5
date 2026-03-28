import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";

const LLSSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // TODO: integrate with auth backend
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
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
        {submitted ? (
          <div className="flex flex-col items-center text-center mt-16">
            <h1 className="text-xl font-bold text-white mb-6">
              Welcome! Your points have been saved.
            </h1>
            <Link
              to="/lls/genre/hiphop"
              className="inline-block bg-[#FFD600] text-black font-bold text-base px-8 py-3 rounded-lg hover:brightness-110 transition-all"
            >
              Continue Browsing
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-[28px] sm:text-4xl font-bold text-white text-center mb-4">
              Sign up and Save your Points.
            </h1>
            <p className="text-base sm:text-lg text-white/80 text-center mb-12 max-w-md">
              100 points = 10% off your next Crate purchase
            </p>

            {/* Form Card */}
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-[400px] bg-white rounded-xl border border-[#E8E8E8] p-8 sm:p-10"
            >
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
                  className="w-full h-11 px-3 text-base bg-[#F5F5F5] border border-transparent rounded-md focus:border-black focus:outline-none transition-colors"
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
                  className={`w-full h-11 px-3 text-base bg-[#F5F5F5] border rounded-md focus:outline-none transition-colors ${
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
                    className={`w-full h-11 px-3 pr-10 text-base bg-[#F5F5F5] border rounded-md focus:outline-none transition-colors ${
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
          </>
        )}
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
