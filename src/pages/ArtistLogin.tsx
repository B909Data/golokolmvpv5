import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

const ArtistLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/artist/dashboard`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We sent you a magic link to sign in.",
      });
    } catch (error: unknown) {
      console.error("Magic link error:", error);
      const message = error instanceof Error ? error.message : "Failed to send magic link.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-24 px-4 flex items-center justify-center">
          <div className="max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="font-display text-3xl text-foreground mb-4">
              CHECK YOUR EMAIL
            </h1>
            
            <p className="text-muted-foreground mb-6">
              We sent a magic link to <span className="text-foreground font-medium">{email}</span>.
              <br />
              Click the link to sign in.
            </p>
            
            <p className="text-muted-foreground text-sm mb-8">
              Didn't receive it? Check your spam folder or try again.
            </p>
            
            <Button 
              variant="outline" 
              onClick={() => setEmailSent(false)}
              className="w-full"
            >
              Try a different email
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl text-foreground mb-4">
              ARTIST SIGN IN
            </h1>
            
            <p className="text-muted-foreground">
              Enter your email to receive a magic link.
              <br />
              No password needed.
            </p>
          </div>

          <form onSubmit={handleMagicLinkLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                "Sending..."
              ) : (
                <>
                  Send Magic Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-muted-foreground text-sm text-center mt-8">
            New to GoLokol?{" "}
            <a 
              href="/create-afterparty" 
              className="text-primary hover:underline"
            >
              Create your first After Party
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistLogin;
