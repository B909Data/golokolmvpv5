import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const ArtistSignup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/artist/dashboard" },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast({ title: "Email is required.", variant: "destructive" }); return; }
    if (password.length < 8) { toast({ title: "Password must be at least 8 characters.", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { toast({ title: error.message, variant: "destructive" }); return; }
        navigate("/artist/dashboard");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + "/artist/dashboard" },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          if (signInError) { toast({ title: "Wrong password. Try again.", variant: "destructive" }); return; }
          navigate("/artist/dashboard");
          return;
        }
        toast({ title: error.message, variant: "destructive" }); return;
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) { toast({ title: "Wrong password. Try again.", variant: "destructive" }); return; }
      }

      navigate("/artist/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <img src={golokolLogo} alt="GoLokol" className="h-12 w-12 mx-auto mb-6" />
          <h1 className="font-display text-4xl text-foreground mb-3">
            {mode === "signup" ? "Join GoLokol" : "Welcome Back"}
          </h1>
          <p className="text-foreground/70 text-sm font-sans">
            {mode === "signup"
              ? "Create your artist account to submit your music to Lokol Listening Stations."
              : "Sign in to your artist account."}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full h-14 text-base font-display font-bold bg-foreground text-background hover:bg-foreground/90"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-foreground/20" />
          <span className="text-foreground/50 text-sm font-sans">or</span>
          <div className="flex-1 h-px bg-foreground/20" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-foreground text-sm font-sans">Email</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-14 text-base font-sans bg-card text-foreground border-foreground/20 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
              placeholder="you@email.com"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-foreground text-sm font-sans">Password</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-14 text-base font-sans bg-card text-foreground border-foreground/20 focus:border-primary focus:ring-primary placeholder:text-muted-foreground pr-12"
                placeholder="Min 8 characters"
                minLength={8}
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || !email.trim() || password.length < 8}
            className="w-full h-14 text-base font-display font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting
              ? (mode === "signup" ? "Creating Account..." : "Signing In...")
              : (mode === "signup" ? "Create Account" : "Sign In")}
          </Button>
        </form>

        <p className="text-center text-sm font-sans text-foreground/60">
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => setMode("signin")} className="text-primary hover:underline font-medium">Sign in</button>
            </>
          ) : (
            <>Don't have an account?{" "}
              <button onClick={() => setMode("signup")} className="text-primary hover:underline font-medium">Sign up</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default ArtistSignup;
