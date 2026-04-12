import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogOut, Upload, X, Loader2 } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import type { User } from "@supabase/supabase-js";

const PENDING_SUBMISSION_KEY = "pending_artist_submission";
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_MP3_SIZE = 20 * 1024 * 1024;
const MIN_IMAGE_DIM = 200;

interface PendingSubmission {
  artist_name: string;
  instagram_handle: string;
  genre_style: string[];
  city_market: string;
  physical_product: string;
  song_title: string;
  short_bio: string;
  how_heard: string;
}

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<PendingSubmission | null>(null);

  // File upload state for pending submission completion
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const mp3InputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/lls-us/artists", { replace: true });
        return;
      }
      setUser(session.user);
      setIsLoading(false);

      // Check for pending submission from Google OAuth flow
      const raw = localStorage.getItem(PENDING_SUBMISSION_KEY);
      if (raw) {
        try {
          setPending(JSON.parse(raw));
        } catch {
          localStorage.removeItem(PENDING_SUBMISSION_KEY);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/lls-us/artists", { replace: true });
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/lls-us/artists");
  };

  const handleMp3Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
      toast({ title: "MP3 files only, max 20MB", variant: "destructive" });
      return;
    }
    if (file.size > MAX_MP3_SIZE) {
      toast({ title: "MP3 files only, max 20MB", variant: "destructive" });
      return;
    }
    setMp3File(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ title: "Image must be under 3MB.", variant: "destructive" });
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < MIN_IMAGE_DIM || img.height < MIN_IMAGE_DIM) {
        toast({ title: `Image must be at least ${MIN_IMAGE_DIM}x${MIN_IMAGE_DIM}px.`, variant: "destructive" });
        URL.revokeObjectURL(url);
        return;
      }
      const ratio = img.width / img.height;
      if (ratio < 0.9 || ratio > 1.1) {
        toast({ title: "Image should be square (1:1 ratio).", variant: "destructive" });
        URL.revokeObjectURL(url);
        return;
      }
      setImageFile(file);
      setImagePreview(url);
    };
    img.src = url;
  };

  const handleCompleteSubmission = async () => {
    if (!pending || !user || !mp3File || !imageFile) return;
    setSubmitting(true);

    try {
      // Check monthly limit
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count, error: countErr } = await supabase
        .from("submissions")
        .select("id", { count: "exact", head: true })
        .eq("artist_user_id", user.id)
        .gte("created_at", firstOfMonth);
      if (countErr) throw countErr;
      if ((count ?? 0) >= 2) {
        toast({ title: "You've reached your 2 submissions this month. Try again next month.", variant: "destructive" });
        return;
      }

      const ts = Date.now();
      const mp3Path = `submissions/${user.id}/${ts}-${mp3File.name}`;
      const { error: mp3Err } = await supabase.storage.from("station_submission_audio").upload(mp3Path, mp3File, { contentType: "audio/mpeg" });
      if (mp3Err) throw mp3Err;
      const { data: mp3Url } = supabase.storage.from("station_submission_audio").getPublicUrl(mp3Path);

      const imgPath = `${user.id}/${ts}-${imageFile.name}`;
      const { error: imgErr } = await supabase.storage.from("station_submission_images").upload(imgPath, imageFile, { contentType: imageFile.type });
      if (imgErr) throw imgErr;
      const { data: imgUrl } = supabase.storage.from("station_submission_images").getPublicUrl(imgPath);

      const { error } = await supabase.from("submissions").insert({
        artist_name: pending.artist_name.trim(),
        contact_email: user.email || "",
        instagram_handle: pending.instagram_handle.trim() || null,
        genre_style: pending.genre_style.join(", "),
        city_market: pending.city_market,
        physical_product: pending.physical_product,
        song_title: pending.song_title.trim(),
        short_bio: pending.short_bio.trim(),
        song_image_url: imgUrl.publicUrl,
        mp3_url: mp3Url.publicUrl,
        mp3_path: mp3Path,
        original_filename: mp3File.name,
        how_heard: pending.how_heard.trim() || null,
        artist_user_id: user.id,
        payment_status: "free",
        admin_status: "pending",
        spotify_url: "",
      });
      if (error) throw error;

      // Fire-and-forget MailerLite welcome
      supabase.functions.invoke("send-mailerlite-artist-welcome", {
        body: { email: user.email, artist_name: pending.artist_name.trim() },
      });

      localStorage.removeItem(PENDING_SUBMISSION_KEY);
      setPending(null);
      toast({ title: "Your submission is complete! 🎉" });
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-24 px-4 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-lg mx-auto w-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <img src={golokolLogo} alt="GoLokol" className="h-10 w-10" />
            <h1 className="font-display text-3xl sm:text-4xl text-foreground">
              Artist Dashboard
            </h1>
          </div>

          {/* Pending Submission Completion */}
          {pending && (
            <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6 mb-6">
              <h2 className="font-display text-xl text-primary mb-2">
                Complete your submission
              </h2>
              <p className="text-foreground/80 text-sm font-sans mb-4">
                You still need to upload your MP3 and song image to finish submitting
                <span className="font-semibold"> "{pending.song_title}"</span>.
              </p>

              {/* Pre-filled summary */}
              <div className="rounded-lg bg-card border border-border p-3 mb-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">Artist:</span> <span className="text-foreground font-medium">{pending.artist_name}</span></p>
                <p><span className="text-muted-foreground">Genre:</span> <span className="text-foreground">{pending.genre_style.join(", ")}</span></p>
                <p><span className="text-muted-foreground">Neighborhood:</span> <span className="text-foreground">{pending.city_market}</span></p>
              </div>

              {/* MP3 Upload */}
              <div className="space-y-2 mb-4">
                <Label className="text-foreground text-sm font-sans">Upload MP3 *</Label>
                {mp3File ? (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-card">
                    <span className="text-foreground text-sm truncate flex-1">{mp3File.name}</span>
                    <button type="button" onClick={() => { setMp3File(null); if (mp3InputRef.current) mp3InputRef.current.value = ""; }} className="bg-destructive text-destructive-foreground rounded-full p-1 shrink-0">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => mp3InputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-sans">Choose MP3 File</span>
                  </button>
                )}
                <input ref={mp3InputRef} type="file" accept=".mp3,audio/mpeg" onChange={handleMp3Select} className="hidden" />
              </div>

              {/* Image Upload */}
              <div className="space-y-2 mb-5">
                <Label className="text-foreground text-sm font-sans">Upload Song Image * <span className="text-muted-foreground">(Square, min 200×200, max 3MB)</span></Label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Song preview" className="w-24 h-24 rounded-lg object-cover border border-border" />
                    <button type="button" onClick={() => { setImageFile(null); if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(null); if (imgInputRef.current) imgInputRef.current.value = ""; }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => imgInputRef.current?.click()} className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-sans">Choose Image</span>
                  </button>
                )}
                <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>

              <Button
                onClick={handleCompleteSubmission}
                disabled={submitting || !mp3File || !imageFile}
                className="w-full h-12 font-display font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Complete Submission"
                )}
              </Button>

              <button
                type="button"
                onClick={() => { localStorage.removeItem(PENDING_SUBMISSION_KEY); setPending(null); }}
                className="w-full mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Coming Soon Card */}
          {!pending && (
            <div className="rounded-2xl bg-primary p-8 mb-6">
              <h2 className="font-display text-2xl text-primary-foreground mb-3">
                Your dashboard is coming soon.
              </h2>
              <p className="text-primary-foreground/80 text-base font-sans">
                We're building something good.
              </p>
            </div>
          )}

          {/* User info */}
          <div className="rounded-xl border border-border bg-card p-4 mb-6">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-foreground font-medium">{user?.email}</p>
          </div>

          {/* Sign Out */}
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full h-12"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDashboard;
