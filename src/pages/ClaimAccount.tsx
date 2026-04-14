import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import golokolLogo from "@/assets/golokol-logo.svg";

const ClaimAccount = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!code) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("*")
        .eq("claim_code", code)
        .single();
      setSubmission(data ?? null);
      setLoading(false);
    })();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <p className="text-white text-center">This link is invalid or has already been claimed.</p>
      </div>
    );
  }

  const handleGoogle = () => {
    if (code) localStorage.setItem("pending_claim_code", code);
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/artist/dashboard" },
    });
  };

  const handleCreateAccount = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSubmitting(true);
    try {
      let userId: string | undefined;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/artist/dashboard" },
      });

      if (signUpError) {
        if (signUpError.message?.toLowerCase().includes("already registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) { toast.error(signInError.message); setSubmitting(false); return; }
          userId = signInData.user?.id;
        } else {
          toast.error(signUpError.message);
          setSubmitting(false);
          return;
        }
      } else {
        userId = signUpData.user?.id;
      }

      if (!userId) { toast.error("Could not get user ID"); setSubmitting(false); return; }

      await (supabase as any)
        .from("lls_artist_submissions")
        .update({ artist_user_id: userId })
        .eq("claim_code", code);

      await (supabase as any)
        .from("artist_profiles")
        .upsert({ artist_user_id: userId, artist_name: submission.artist_name }, { onConflict: "artist_user_id" });

      await supabase.auth.updateUser({ data: { artist_name: submission.artist_name } });

      localStorage.removeItem("pending_claim_code");
      navigate("/artist/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-4 py-10">
      <img src={golokolLogo} alt="GoLokol" className="w-10 h-10 mb-8" />

      {submission.song_image_url && (
        <img
          src={submission.song_image_url}
          alt={submission.song_title || "Song"}
          className="w-[200px] h-[200px] rounded-xl object-cover mb-4"
        />
      )}

      <h2 className="text-white font-bold text-2xl text-center">{submission.artist_name}</h2>
      <p className="text-[#FFD600] text-base text-center mt-1">{submission.song_title}</p>

      <h3 className="text-white font-bold text-xl text-center mt-8">Your music is already on GoLokol.</h3>
      <p className="text-white/70 text-sm text-center mt-2 max-w-sm">
        Create your account to see your stats, connect with fans and promote your shows.
      </p>

      <div className="w-full max-w-sm mt-8 space-y-4">
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold rounded-lg py-3 text-sm"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.09 24.09 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-white/50 text-xs">or</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-white/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full bg-white/10 text-white rounded-lg px-4 py-3 text-sm placeholder:text-white/40 outline-none focus:ring-1 focus:ring-white/30 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={handleCreateAccount}
          disabled={submitting}
          className="w-full bg-[#FFD600] text-black font-bold rounded-lg py-3 text-sm disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create Account"}
        </button>
      </div>
    </div>
  );
};

export default ClaimAccount;
