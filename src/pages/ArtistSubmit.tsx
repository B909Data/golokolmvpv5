import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";
import type { User } from "@supabase/supabase-js";

const GENRE_OPTIONS = ["Hip Hop", "RnB", "Alternative", "Hardcore + Punk", "Indie", "Jazz"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_MP3_SIZE = 20 * 1024 * 1024;
const TOTAL_STEPS = 2;

const ArtistSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mp3InputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    artist_name: "",
    song_title: "",
    youtube_url: "",
    genre_style: [] as string[],
  });
  const [termsConfirmed, setTermsConfirmed] = useState(false);

  const [mp3File, setMp3File] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/artist/signup", { replace: true });
        return;
      }
      setUser(session.user);
      const metaArtistName = session.user.user_metadata?.artist_name;
      if (metaArtistName) {
        setForm((f) => ({ ...f, artist_name: metaArtistName }));
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const toggleGenre = (genre: string) => {
    setForm((f) => {
      const current = f.genre_style;
      if (current.includes(genre)) return { ...f, genre_style: current.filter((g) => g !== genre) };
      if (current.length >= 2) return f;
      return { ...f, genre_style: [...current, genre] };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ title: "Image must be under 5MB.", variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const clearMp3 = () => {
    setMp3File(null);
    if (mp3InputRef.current) mp3InputRef.current.value = "";
  };

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.artist_name.trim()) {
        toast({ title: "Artist Name is required.", variant: "destructive" });
        return false;
      }
      if (!form.song_title.trim()) {
        toast({ title: "Song Title is required.", variant: "destructive" });
        return false;
      }
      if (form.genre_style.length === 0) {
        toast({ title: "Please select at least one genre.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (s === 2) {
      if (!mp3File) {
        toast({ title: "Please upload your MP3.", variant: "destructive" });
        return false;
      }
      if (!imageFile) {
        toast({ title: "Please upload a song image.", variant: "destructive" });
        return false;
      }
      if (!termsConfirmed) {
        toast({ title: "Please agree to the terms before submitting.", variant: "destructive" });
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };
  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!mp3File) {
      toast({ title: "Please upload your MP3.", variant: "destructive" });
      return;
    }
    if (!imageFile) {
      toast({ title: "Please upload a song image.", variant: "destructive" });
      return;
    }
    if (!termsConfirmed) {
      toast({ title: "Please agree to the terms before submitting.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count, error: countErr } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("id", { count: "exact", head: true })
        .eq("artist_user_id", user.id)
        .gte("created_at", firstOfMonth);
      if (countErr) throw countErr;
      if ((count ?? 0) >= 2) {
        toast({ title: "You've reached your 2 submissions this month. Try again next month.", variant: "destructive" });
        return;
      }

      const ts = Date.now();
      const sanitizedMp3 = mp3File.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const mp3Path = `submissions/${user.id}/${ts}-${sanitizedMp3}`;
      const { error: mp3Err } = await supabase.storage
        .from("station_submission_audio")
        .upload(mp3Path, mp3File, { contentType: "audio/mpeg" });
      if (mp3Err) throw mp3Err;
      const { data: mp3Url } = supabase.storage.from("station_submission_audio").getPublicUrl(mp3Path);

      const sanitizedImg = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const imgPath = `${user.id}/${ts}-${sanitizedImg}`;
      const { error: imgErr } = await supabase.storage
        .from("station_submission_images")
        .upload(imgPath, imageFile, { contentType: imageFile.type });
      if (imgErr) throw imgErr;
      const { data: imgUrl } = supabase.storage.from("station_submission_images").getPublicUrl(imgPath);

      const { error } = await (supabase as any).from("lls_artist_submissions").insert({
        artist_name: form.artist_name.trim(),
        contact_email: user.email,
        genre_style: form.genre_style.join(", "),
        city_market: "Atlanta",
        song_title: form.song_title.trim(),
        song_image_url: imgUrl.publicUrl,
        mp3_url: mp3Url.publicUrl,
        mp3_path: mp3Path,
        original_filename: mp3File.name,
        youtube_url: form.youtube_url.trim() || null,
        artist_user_id: user.id,
        payment_status: "free",
        admin_status: "pending",
        terms_confirmed: true,
      });
      if (error) throw error;

      try {
        await supabase.functions.invoke("send-mailerlite-artist-welcome", {
          body: { email: user.email, artist_name: form.artist_name.trim() },
        });
      } catch (mlErr) {
        console.error("MailerLite error:", mlErr);
      }

      navigate("/artist/dashboard");
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground/50 font-sans">Loading...</div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl text-primary-foreground">Song Info</h2>
        <p className="text-primary-foreground/70 text-sm font-sans mt-1">
          This song will replace any song currently featured on ATL Lokol Listening Stations.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Artist Name *</Label>
        <Input
          value={form.artist_name}
          readOnly
          className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 placeholder:text-muted-foreground opacity-70 cursor-not-allowed"
          maxLength={200}
          placeholder="Your artist or band name"
        />
        <p className="text-white/40 text-xs font-sans mt-1">This is your registered artist name.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Song Title *</Label>
        <Input
          value={form.song_title}
          onChange={(e) => setForm((f) => ({ ...f, song_title: e.target.value }))}
          className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 placeholder:text-muted-foreground"
          maxLength={300}
          placeholder="Your song title"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">YouTube Link (optional)</Label>
        <p className="text-primary-foreground/60 text-sm font-sans">
          Strongly suggested. Something new to share with fans who save you to their Lokol Scene. (ie music video or
          live performance)
        </p>
        <Input
          value={form.youtube_url}
          onChange={(e) => setForm((f) => ({ ...f, youtube_url: e.target.value }))}
          className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 placeholder:text-muted-foreground"
          maxLength={500}
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">
          Genre / Style * <span className="text-primary-foreground/60">(up to 2)</span>
        </Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {GENRE_OPTIONS.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => toggleGenre(genre)}
              className={`px-3 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                form.genre_style.includes(genre)
                  ? "bg-primary-foreground text-primary ring-2 ring-primary-foreground"
                  : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl text-primary-foreground">Upload Files</h2>
        <p className="text-primary-foreground/70 text-sm font-sans mt-1">Almost there — add your song and artwork.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">
          Upload MP3 * <span className="text-primary-foreground/60">(MP3 only, max 20MB)</span>
        </Label>
        {mp3File ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary-foreground/30 bg-background">
            <span className="text-foreground text-sm font-sans truncate flex-1">{mp3File.name}</span>
            <button
              type="button"
              onClick={clearMp3}
              className="bg-destructive text-destructive-foreground rounded-full p-1 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => mp3InputRef.current?.click()}
            className="flex items-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground/70 hover:border-primary-foreground hover:text-primary-foreground transition-colors w-full"
          >
            <Upload className="h-5 w-5" />
            <span className="text-base font-sans">Choose MP3 File</span>
          </button>
        )}
        <input ref={mp3InputRef} type="file" accept=".mp3,audio/mpeg" onChange={handleMp3Select} className="hidden" />
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Upload Song Image *</Label>
        <p className="text-sm text-primary-foreground/60 font-sans">
          Any size or shape — we'll display it as a square.
        </p>
        {imagePreview ? (
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-primary-foreground/30">
              <img src={imagePreview} alt="Song preview" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground/70 hover:border-primary-foreground hover:text-primary-foreground transition-colors w-full"
          >
            <Upload className="h-5 w-5" />
            <span className="text-base font-sans">Choose Image</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      </div>

      <label className="flex items-start gap-3 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={termsConfirmed}
          onChange={(e) => setTermsConfirmed(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#FFD600]"
        />
        <span className="text-sm text-primary-foreground/80 font-sans">
          I agree to the{" "}
          <a href="/lls-music-release" target="_blank" style={{ color: "#000000", textDecoration: "underline" }}>
            GoLokol Artist Terms &amp; Music Release
          </a>
        </span>
      </label>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !mp3File || !imageFile || !termsConfirmed}
        className="w-full h-14 text-base font-display font-bold mt-4 bg-black text-[#FFD600] hover:bg-white hover:text-black disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 px-6 md:px-12 py-12 max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <img src={golokolLogo} alt="GoLokol" className="h-10 w-10 mx-auto mb-4" />
          <h1 className="font-display text-3xl text-foreground mb-1">
            Submit to <span className="text-primary">GoLokol</span>
          </h1>
          <p className="text-muted-foreground text-sm font-sans">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        <div className="bg-primary rounded-2xl p-6 md:p-8">
          <form onSubmit={(e) => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}

            {step < TOTAL_STEPS && (
              <div className="flex justify-between gap-3 mt-8">
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="h-11 px-6 font-display font-bold text-base bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                <Button
                  type="button"
                  onClick={handleNext}
                  className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Next
                </Button>
              </div>
            )}

            {step === TOTAL_STEPS && step > 1 && (
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="h-11 px-6 font-display font-bold text-base bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistSubmit;
