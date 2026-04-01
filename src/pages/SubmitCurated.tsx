import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Music, User, FileAudio, Phone, Instagram, Upload, Lock } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link as LinkIcon } from "lucide-react";

const REDIRECT_URL = "https://golokol.app/songs/submit-curated?step=form";
const LS_CODE_KEY = "lls_curated_code";
const LS_EMAIL_KEY = "lls_curated_email";

type Step = "gate" | "form" | "expired";

const SubmitCurated = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>("gate");
  const [gateEmail, setGateEmail] = useState("");
  const [gateCode, setGateCode] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [musicReleaseAgreed, setMusicReleaseAgreed] = useState(false);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    artist_name: "",
    contact_email: "",
    phone: "",
    instagram_handle: "",
    song_title: "",
    youtube_url: "",
    notes: "",
  });

  // Detect OTP expired errors and handle step=form on mount
  useEffect(() => {
    // Check URL params and hash for OTP expired / access_denied
    const errorCode = searchParams.get("error_code");
    const error = searchParams.get("error");
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    const hashErrorCode = hashParams.get("error_code");
    const hashError = hashParams.get("error");

    if (
      errorCode === "otp_expired" || error === "access_denied" ||
      hashErrorCode === "otp_expired" || hashError === "access_denied"
    ) {
      const storedEmail = localStorage.getItem(LS_EMAIL_KEY) || "";
      setResendEmail(storedEmail);
      setStep("expired");
      return;
    }

    const urlStep = searchParams.get("step");

    const initFlow = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (urlStep === "form" && session) {
        // Arrived back from magic link with active session
        const pendingCode = localStorage.getItem(LS_CODE_KEY);
        if (pendingCode) {
          await redeemCode(pendingCode);
        } else {
          // Code already redeemed or missing — show form with session email
          setFormData((prev) => ({ ...prev, contact_email: session.user.email || "" }));
          setStep("form");
        }
        return;
      }

      if (session) {
        const pendingCode = localStorage.getItem(LS_CODE_KEY);
        if (pendingCode) {
          await redeemCode(pendingCode);
        }
      }
    };

    initFlow();

    // Listen for SIGNED_IN in case session arrives after mount (e.g. magic link token exchange)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const pendingCode = localStorage.getItem(LS_CODE_KEY);
        if (pendingCode) {
          await redeemCode(pendingCode);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redeemCode = async (code: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("redeem-curated-code", {
        body: { code },
      });

      if (error) throw error;

      if (!data.success) {
        toast.error(data.error || "Failed to redeem code.");
        localStorage.removeItem(LS_CODE_KEY);
        setStep("gate");
        return;
      }

      localStorage.removeItem(LS_CODE_KEY);
      setFormData((prev) => ({ ...prev, contact_email: data.email }));
      setStep("form");
      toast.success("Code redeemed! You can now submit your song.");
    } catch (err) {
      console.error("Code redemption error:", err);
      toast.error("Failed to redeem code. Please try again.");
      localStorage.removeItem(LS_CODE_KEY);
      setStep("gate");
    }
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gateEmail || !gateCode) {
      toast.error("Please enter both email and code.");
      return;
    }

    setIsCheckingCode(true);

    try {
      const { data, error } = await supabase.functions.invoke("validate-curated-code", {
        body: { code: gateCode },
      });

      if (error) throw error;

      if (!data.valid) {
        toast.error(data.error || "Invalid code.");
        setIsCheckingCode(false);
        return;
      }

      // Persist code + email in localStorage so they survive the redirect
      localStorage.setItem(LS_CODE_KEY, gateCode.toUpperCase().trim());
      localStorage.setItem(LS_EMAIL_KEY, gateEmail);

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: gateEmail,
        options: { emailRedirectTo: REDIRECT_URL },
      });

      if (authError) {
        if (authError.status === 429 || authError.message?.toLowerCase().includes("rate limit")) {
          toast.error("Too many attempts. Please wait a few minutes before trying again.");
          setIsCheckingCode(false);
          return;
        }
        throw authError;
      }

      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email to continue.");
    } catch (err) {
      console.error("Gate error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleResendLink = async () => {
    if (!resendEmail) {
      toast.error("Please enter your email.");
      return;
    }
    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: resendEmail,
        options: { emailRedirectTo: REDIRECT_URL },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast.success("New link sent! Check your email.");
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "audio/mpeg") {
      toast.error("Only MP3 files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB.");
      e.target.value = "";
      return;
    }
    setMp3File(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.artist_name || !formData.contact_email || !formData.phone || !formData.song_title) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!mp3File) {
      toast.error("Please upload an MP3 file.");
      return;
    }
    if (!musicReleaseAgreed) {
      toast.error("You must agree to the Music Release Agreement.");
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      // Try refreshing the session first, then check
      const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
      const session = refreshedSession ?? (await supabase.auth.getSession()).data.session;

      if (!session) {
        toast.error("Your session has expired. Please refresh the page and sign in again.");
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // Note: submissions table has INSERT-only RLS (no SELECT), so client-side dedup
      // isn't possible. The submittingRef guard prevents double-click duplicates,
      // and the form resets after success preventing accidental re-submission.

      // Generate a UUID client-side for the submission so we can use it in the storage path
      const submissionId = crypto.randomUUID();

      // Sanitize filename
      const sanitizedName = mp3File.name
        .toLowerCase()
        .replace(/\.mp3$/i, "")
        .replace(/[^a-z0-9\-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        + ".mp3";

      const objectPath = `lls_curated/${submissionId}/${sanitizedName}`;

      // 1. Upload the file first
      const { error: uploadError } = await supabase.storage
        .from("submissions_audio")
        .upload(objectPath, mp3File, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from("submissions_audio")
        .getPublicUrl(objectPath);

      // 3. Insert submission row with all fields at once
      const { error: insertError } = await supabase
        .from("submissions")
        .insert({
          id: submissionId,
          artist_name: formData.artist_name,
          contact_email: formData.contact_email,
          phone: formData.phone,
          instagram_handle: formData.instagram_handle || null,
          song_title: formData.song_title,
          spotify_url: "curated-submission",
          youtube_url: formData.youtube_url || null,
          notes: formData.notes || null,
          mp3_url: urlData.publicUrl,
          mp3_path: objectPath,
          original_filename: mp3File.name,
          status: "Unreviewed",
          payment_status: "curated",
          music_release_agreed: true,
          music_release_agreed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("DB insert error:", insertError);
        // Try to clean up the uploaded file
        await supabase.storage.from("submissions_audio").remove([objectPath]).catch(() => {});
        toast.error(`Submission failed: ${insertError.message}`);
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      toast.success("Song submitted successfully!");
      setFormData({ artist_name: "", contact_email: "", phone: "", instagram_handle: "", song_title: "", youtube_url: "", notes: "" });
      setMp3File(null);
      setMusicReleaseAgreed(false);
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err?.message || "Failed to submit. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ─── Expired Link Screen ───
  if (step === "expired") {
    return (
      <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Link to="/songs" className="inline-flex items-center gap-2 text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,10%)] transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Listening Sessions
            </Link>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(0,0%,85%)] mb-6">
                  <Lock className="h-8 w-8 text-[hsl(0,0%,10%)]" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,10%)] mb-4">
                  Link Expired
                </h1>
                <p className="text-[hsl(0,0%,40%)] text-lg">This link expired. Enter your email to resend a fresh link.</p>
              </div>

              {magicLinkSent ? (
                <div className="rounded-xl border border-[hsl(0,0%,80%)] p-8 bg-white text-center">
                  <h3 className="text-[hsl(0,0%,10%)] mb-3">Check your email</h3>
                  <p className="text-[hsl(0,0%,40%)] type-body-md">
                    We sent a new link to <strong className="text-[hsl(0,0%,10%)]">{resendEmail}</strong>. Click the link in your email to continue.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-xl border border-[hsl(0,0%,80%)] p-6 bg-white space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="resend_email" className="text-[hsl(0,0%,10%)]">Email *</Label>
                      <Input
                        id="resend_email"
                        type="email"
                        placeholder="your@email.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                        required
                      />
                    </div>
                  </div>
                  <Button onClick={handleResendLink} size="lg" disabled={isResending} className="w-full">
                    {isResending ? "Sending..." : "Resend Link"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Gate Screen ───
  if (step === "gate") {
    return (
      <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="container mx-auto px-4">
            <Link to="/songs" className="inline-flex items-center gap-2 text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,10%)] transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Listening Sessions
            </Link>
            <div className="max-w-md mx-auto">
              <div className="mb-8 rounded-lg overflow-hidden">
                <AspectRatio ratio={16 / 9}>
                  <iframe
                    src="https://www.youtube.com/embed/2exJWgcJRlA"
                    title="Lokol Listening Stations"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </AspectRatio>
              </div>
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(0,0%,85%)] mb-6">
                  <Lock className="h-8 w-8 text-[hsl(0,0%,10%)]" />
                </div>
                <h1 className="font-display text-4xl md:text-5xl text-[hsl(0,0%,10%)] mb-4">
                  LOKOL LISTENING SESSIONS <span className="text-[hsl(0,0%,30%)]">INVITATION</span>
                </h1>
                <p className="text-[hsl(0,0%,40%)] text-lg">Enter your invite code and email to get started.</p>
              </div>

              {magicLinkSent ? (
                <div className="rounded-xl border border-[hsl(0,0%,80%)] p-8 bg-white text-center">
                  <h3 className="text-[hsl(0,0%,10%)] mb-3">Check your email</h3>
                  <p className="text-[hsl(0,0%,40%)] type-body-md">
                    We sent a magic link to <strong className="text-[hsl(0,0%,10%)]">{gateEmail}</strong>. Click the link in your email to continue with your submission.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleGateSubmit} className="space-y-6">
                  <div className="rounded-xl border border-[hsl(0,0%,80%)] p-6 bg-white space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="gate_email" className="text-[hsl(0,0%,10%)]">Email *</Label>
                      <Input id="gate_email" type="email" placeholder="your@email.com" value={gateEmail} onChange={(e) => setGateEmail(e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gate_code" className="text-[hsl(0,0%,10%)]">Invite Code *</Label>
                      <Input id="gate_code" placeholder="Enter your code" value={gateCode} onChange={(e) => setGateCode(e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] uppercase" required />
                    </div>
                  </div>
                  <Button type="submit" size="lg" disabled={isCheckingCode} className="w-full">
                    {isCheckingCode ? "Checking..." : "Continue"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Submission Form ───
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/songs" className="inline-flex items-center gap-2 text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,10%)] transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Listening Sessions
          </Link>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(0,0%,85%)] mb-6">
                <Music className="h-8 w-8 text-[hsl(0,0%,10%)]" />
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-[hsl(0,0%,10%)] mb-4">
                LOKOL LISTENING SESSIONS <span className="text-[hsl(0,0%,30%)]">SUBMISSION</span>
              </h1>
              <p className="text-[hsl(0,0%,40%)] text-lg">Submit your music for the next Lokol Listening Stations event. One Artist, One Song.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-[hsl(0,0%,80%)] p-6 relative overflow-hidden bg-white">
                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="artist_name" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><User className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Artist / Band Name *</Label>
                    <Input id="artist_name" placeholder="Your artist or band name" value={formData.artist_name} onChange={(e) => handleChange("artist_name", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-[hsl(0,0%,10%)]">Contact Email *</Label>
                    <Input id="contact_email" type="email" value={formData.contact_email} readOnly className="bg-[hsl(60,10%,93%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,30%)] cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><Phone className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Phone (used only if selected) *</Label>
                    <Input id="phone" type="tel" placeholder="(555) 555-5555" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_handle" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><Instagram className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Instagram Handle</Label>
                    <Input id="instagram_handle" placeholder="@yourhandle" value={formData.instagram_handle} onChange={(e) => handleChange("instagram_handle", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="song_title" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><FileAudio className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Song Title *</Label>
                    <Input id="song_title" placeholder="Name of your track" value={formData.song_title} onChange={(e) => handleChange("song_title", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mp3_upload" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><Upload className="h-4 w-4 text-[hsl(0,0%,30%)]" /> MP3 Upload *</Label>
                    <Input id="mp3_upload" type="file" accept="audio/mpeg,.mp3" onChange={handleMp3Change} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[hsl(0,0%,85%)] file:text-[hsl(0,0%,10%)]" required />
                    <p className="text-xs text-[hsl(0,0%,50%)]">MP3 only, max 20MB</p>
                    {mp3File && <p className="text-xs text-[hsl(0,0%,40%)]">Selected: {mp3File.name} ({(mp3File.size / (1024 * 1024)).toFixed(1)}MB)</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><LinkIcon className="h-4 w-4 text-[hsl(0,0%,30%)]" /> YouTube Channel URL</Label>
                    <Input id="youtube_url" type="url" placeholder="https://youtube.com/@yourchannel" value={formData.youtube_url} onChange={(e) => handleChange("youtube_url", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[hsl(0,0%,10%)]">Notes (optional)</Label>
                    <Textarea id="notes" placeholder="Anything else you'd like us to know..." value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] min-h-[100px]" />
                  </div>
                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox id="music_release" checked={musicReleaseAgreed} onCheckedChange={(checked) => setMusicReleaseAgreed(checked === true)} className="mt-0.5" />
                    <Label htmlFor="music_release" className="text-[hsl(0,0%,10%)] text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link to="/lls-music-release" target="_blank" className="underline hover:text-[hsl(0,0%,30%)]">Blanket Artist Music Release Agreement</Link>{" "}
                      and grant GoLokol the right to use my submitted music for Lokol Listening Stations. *
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? "Submitting..." : "Submit Song"}
                </Button>
                <p className="text-xs text-[hsl(0,0%,50%)] mt-3">
                  By proceeding, you agree to GoLokol's{" "}
                  <Link to="/terms" className="underline hover:text-[hsl(0,0%,30%)]">Terms</Link>
                  {" & "}
                  <Link to="/privacy" className="underline hover:text-[hsl(0,0%,30%)]">Privacy</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubmitCurated;
