import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, X, Search, ChevronLeft, ChevronRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import golokolLogo from "@/assets/golokol-logo.svg";

const GENRE_OPTIONS = [
  "Afrobeats", "Alternative", "Beats", "Blues", "Country", "EDM", "Emo",
  "Folk", "Funk", "Gospel", "Hardcore", "Hip-Hop", "House", "Indie",
  "Jazz", "Latin", "Metal", "Neo-Soul", "Pop", "Punk", "R&B", "Rave",
  "Reggae", "Rock", "Ska", "Spoken-Word", "Techno",
];

const ATLANTA_NEIGHBORHOODS = [
  { name: "Adamsville", nickname: "" },
  { name: "Ansley Park", nickname: "" },
  { name: "Ashview Heights", nickname: "" },
  { name: "Atlanta University Center", nickname: "AUC" },
  { name: "Bankhead", nickname: "" },
  { name: "Ben Hill", nickname: "" },
  { name: "Bowen Homes", nickname: "" },
  { name: "Brookhaven", nickname: "" },
  { name: "Buckhead", nickname: "" },
  { name: "Candler Park", nickname: "" },
  { name: "Capitol View", nickname: "" },
  { name: "Cascade Heights", nickname: "" },
  { name: "Castleberry Hill", nickname: "" },
  { name: "Centennial Hill", nickname: "" },
  { name: "Chamblee", nickname: "" },
  { name: "Chosewood Park", nickname: "" },
  { name: "Clarkston", nickname: "" },
  { name: "College Park", nickname: "" },
  { name: "Collier Heights", nickname: "" },
  { name: "Cabbagetown", nickname: "" },
  { name: "Decatur", nickname: "" },
  { name: "Donald Lee Hollowell", nickname: "" },
  { name: "Doraville", nickname: "" },
  { name: "Downtown Atlanta", nickname: "Downtown" },
  { name: "Druid Hills", nickname: "" },
  { name: "Dunwoody", nickname: "" },
  { name: "East Atlanta Village", nickname: "EAV" },
  { name: "East Lake", nickname: "" },
  { name: "East Point", nickname: "" },
  { name: "Edgewood", nickname: "" },
  { name: "English Avenue", nickname: "" },
  { name: "Fairburn", nickname: "" },
  { name: "Forest Park", nickname: "" },
  { name: "Fort McPherson", nickname: "" },
  { name: "Grant Park", nickname: "" },
  { name: "Greenbriar", nickname: "" },
  { name: "Grove Park", nickname: "" },
  { name: "Hapeville", nickname: "" },
  { name: "Herndon Homes", nickname: "" },
  { name: "Home Park", nickname: "" },
  { name: "Inman Park", nickname: "" },
  { name: "Jonesboro", nickname: "" },
  { name: "Kirkwood", nickname: "" },
  { name: "Lake Claire", nickname: "" },
  { name: "Lakewood Heights", nickname: "" },
  { name: "Lenox Park", nickname: "" },
  { name: "Lithonia", nickname: "" },
  { name: "Little Five Points", nickname: "L5P" },
  { name: "Mableton", nickname: "" },
  { name: "Marietta", nickname: "" },
  { name: "Mechanicsville", nickname: "" },
  { name: "Midtown", nickname: "" },
  { name: "Moreland Heights", nickname: "" },
  { name: "Morningside-Lenox Park", nickname: "" },
  { name: "Mozley Park", nickname: "" },
  { name: "Norcross", nickname: "" },
  { name: "North Druid Hills", nickname: "" },
  { name: "Oakland City", nickname: "" },
  { name: "Old Fourth Ward", nickname: "O4W" },
  { name: "Ormewood Park", nickname: "" },
  { name: "Peachtree Corners", nickname: "" },
  { name: "Peachtree Hills", nickname: "" },
  { name: "Peoplestown", nickname: "" },
  { name: "Piedmont Heights", nickname: "" },
  { name: "Pine Hills", nickname: "" },
  { name: "Pittsburg", nickname: "" },
  { name: "Redan", nickname: "" },
  { name: "Reynoldstown", nickname: "" },
  { name: "Riverside", nickname: "" },
  { name: "Roswell", nickname: "" },
  { name: "Sandy Springs", nickname: "" },
  { name: "Scottdale", nickname: "" },
  { name: "Smyrna", nickname: "" },
  { name: "South Atlanta", nickname: "" },
  { name: "South Fulton", nickname: "" },
  { name: "Southside", nickname: "" },
  { name: "Southwest Atlanta", nickname: "SWATS" },
  { name: "Stone Mountain", nickname: "" },
  { name: "Summerhill", nickname: "" },
  { name: "Sylvan Hills", nickname: "" },
  { name: "Tucker", nickname: "" },
  { name: "Union City", nickname: "" },
  { name: "Vine City", nickname: "" },
  { name: "Virginia-Highland", nickname: "VaHi" },
  { name: "Washington Park", nickname: "" },
  { name: "West End", nickname: "" },
  { name: "West Midtown", nickname: "Westside" },
  { name: "Westview", nickname: "" },
  { name: "Whittier Mill Village", nickname: "" },
  { name: "Woodstock", nickname: "" },
  { name: "Zone 6", nickname: "" },
];

const MAX_BIO = 240;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_MP3_SIZE = 20 * 1024 * 1024;
const MIN_IMAGE_DIM = 200;
const TOTAL_STEPS = 4;

const LLSUsArtists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mp3InputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    artist_name: "",
    instagram_handle: "",
    genre_style: [] as string[],
    city_market: "",
    physical_product: "",
    song_title: "",
    short_bio: "",
    how_heard: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mp3File, setMp3File] = useState<File | null>(null);

  const [neighborhoodSearch, setNeighborhoodSearch] = useState("");
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

  // Step 4 auth state
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const filteredNeighborhoods = ATLANTA_NEIGHBORHOODS.filter((n) => {
    const q = neighborhoodSearch.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.nickname.toLowerCase().includes(q);
  });

  const toggleGenre = (genre: string) => {
    setForm((f) => {
      const current = f.genre_style;
      if (current.includes(genre)) return { ...f, genre_style: current.filter((g) => g !== genre) };
      if (current.length >= 3) return f;
      return { ...f, genre_style: [...current, genre] };
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Please select an image file.", variant: "destructive" }); return; }
    if (file.size > MAX_IMAGE_SIZE) { toast({ title: "Image must be under 3MB.", variant: "destructive" }); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < MIN_IMAGE_DIM || img.height < MIN_IMAGE_DIM) { toast({ title: `Image must be at least ${MIN_IMAGE_DIM}x${MIN_IMAGE_DIM}px.`, variant: "destructive" }); URL.revokeObjectURL(url); return; }
      const ratio = img.width / img.height;
      if (ratio < 0.9 || ratio > 1.1) { toast({ title: "Image should be square (1:1 ratio).", variant: "destructive" }); URL.revokeObjectURL(url); return; }
      setImageFile(file);
      setImagePreview(url);
    };
    img.src = url;
  };

  const clearImage = () => { setImageFile(null); if (imagePreview) URL.revokeObjectURL(imagePreview); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleMp3Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "audio/mpeg" && !file.name.toLowerCase().endsWith(".mp3")) {
      toast({ title: "MP3 files only, max 20MB", variant: "destructive" }); return;
    }
    if (file.size > MAX_MP3_SIZE) { toast({ title: "MP3 files only, max 20MB", variant: "destructive" }); return; }
    setMp3File(file);
  };

  const clearMp3 = () => { setMp3File(null); if (mp3InputRef.current) mp3InputRef.current.value = ""; };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!form.artist_name.trim()) { toast({ title: "Artist Name is required.", variant: "destructive" }); return false; }
      if (form.genre_style.length === 0) { toast({ title: "Please select at least one genre.", variant: "destructive" }); return false; }
      if (!form.city_market) { toast({ title: "Please select your neighborhood.", variant: "destructive" }); return false; }
      return true;
    }
    if (step === 2) {
      if (!form.physical_product) { toast({ title: "Please select a physical product option.", variant: "destructive" }); return false; }
      if (!mp3File) { toast({ title: "Please upload your MP3.", variant: "destructive" }); return false; }
      return true;
    }
    if (step === 3) {
      if (!form.song_title.trim()) { toast({ title: "Song Title is required.", variant: "destructive" }); return false; }
      if (!form.short_bio.trim()) { toast({ title: "Short bio is required.", variant: "destructive" }); return false; }
      if (!imageFile) { toast({ title: "Please upload a song image.", variant: "destructive" }); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const saveSubmission = async (contactEmail: string, userId: string) => {
    if (!imageFile || !mp3File) throw new Error("Missing files");

    // Check monthly submission limit
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count, error: countErr } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("artist_user_id", userId)
      .gte("created_at", firstOfMonth);
    if (countErr) throw countErr;
    if ((count ?? 0) >= 2) {
      throw new Error("LIMIT_REACHED");
    }

    const ts = Date.now();
    const mp3Path = `submissions/${userId}/${ts}-${mp3File.name}`;
    const { error: mp3Err } = await supabase.storage.from("submissions_audio").upload(mp3Path, mp3File, { contentType: "audio/mpeg" });
    if (mp3Err) throw mp3Err;
    const { data: mp3Url } = supabase.storage.from("submissions_audio").getPublicUrl(mp3Path);

    const imgExt = imageFile.name.split(".").pop() || "jpg";
    const imgPath = `lls-artist-images/${userId}/${ts}-${imageFile.name}`;
    const { error: imgErr } = await supabase.storage.from("submissions_audio").upload(imgPath, imageFile, { contentType: imageFile.type });
    if (imgErr) throw imgErr;
    const { data: imgUrl } = supabase.storage.from("submissions_audio").getPublicUrl(imgPath);

    const { error } = await supabase.from("submissions").insert({
      artist_name: form.artist_name.trim(),
      contact_email: contactEmail,
      instagram_handle: form.instagram_handle.trim() || null,
      genre_style: form.genre_style.join(", "),
      city_market: form.city_market,
      physical_product: form.physical_product,
      song_title: form.song_title.trim(),
      short_bio: form.short_bio.trim(),
      song_image_url: imgUrl.publicUrl,
      mp3_url: mp3Url.publicUrl,
      mp3_path: mp3Path,
      original_filename: mp3File.name,
      how_heard: form.how_heard.trim() || null,
      artist_user_id: userId,
      payment_status: "free",
      admin_status: "pending",
      spotify_url: "",
    });

    if (error) throw error;
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/artist/dashboard",
      });
      if (result.error) {
        toast({ title: "Google sign-in failed. Please try again.", variant: "destructive" });
        setAuthLoading(false);
        return;
      }
      if (result.redirected) {
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await saveSubmission(user.email || "", user.id);
        navigate("/artist/dashboard");
      }
    } catch (err: any) {
      if (err?.message === "LIMIT_REACHED") {
        toast({ title: "You've reached your 2 submissions this month. Try again next month.", variant: "destructive" });
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) { toast({ title: "Email is required.", variant: "destructive" }); return; }
    if (authPassword.length < 8) { toast({ title: "Password must be at least 8 characters.", variant: "destructive" }); return; }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          emailRedirectTo: window.location.origin + "/artist/dashboard",
        },
      });
      if (error) {
        toast({ title: error.message, variant: "destructive" });
        return;
      }
      if (data.user) {
        await saveSubmission(authEmail.trim(), data.user.id);
        navigate("/artist/dashboard");
      }
    } catch (err: any) {
      if (err?.message === "LIMIT_REACHED") {
        toast({ title: "You've reached your 2 submissions this month. Try again next month.", variant: "destructive" });
      } else {
        toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-sans font-semibold transition-colors ${
              step === currentStep
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                : step < currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground border border-muted-foreground/30"
            }`}
          >
            {step}
          </div>
          {step < TOTAL_STEPS && (
            <div
              className={`w-8 h-1 mx-1 rounded ${
                step < currentStep ? "bg-primary" : "bg-muted/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Step 1: Your Artist Info
  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Your Artist Info</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">Tell us who you are</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="a-name" className="text-primary-foreground text-base font-sans">Artist Name *</Label>
        <Input id="a-name" value={form.artist_name} onChange={e => setForm(f => ({ ...f, artist_name: e.target.value }))} className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground" maxLength={200} placeholder="Your artist or band name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="a-ig" className="text-primary-foreground text-base font-sans">Instagram Handle</Label>
        <Input id="a-ig" value={form.instagram_handle} onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))} className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground" maxLength={200} placeholder="@yourhandle" />
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Genre / Style * <span className="text-primary-foreground/60">(select up to 3)</span></Label>
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

      {/* Neighborhood */}
      <div className="space-y-2 relative">
        <Label className="text-primary-foreground text-base font-sans">City / Market * <span className="text-primary-foreground/70">(Atlanta only for now)</span></Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={form.city_market || neighborhoodSearch}
            onChange={e => {
              setNeighborhoodSearch(e.target.value);
              if (form.city_market) setForm(f => ({ ...f, city_market: "" }));
              setNeighborhoodOpen(true);
            }}
            onFocus={() => setNeighborhoodOpen(true)}
            className="h-14 pl-9 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            placeholder="Search neighborhoods..."
          />
        </div>
        {neighborhoodOpen && (
          <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-lg">
            {filteredNeighborhoods.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">No neighborhoods found</div>
            ) : (
              filteredNeighborhoods.map((n) => (
                <button
                  key={n.name}
                  type="button"
                  onClick={() => {
                    setForm(f => ({ ...f, city_market: n.nickname ? `${n.name} (${n.nickname})` : n.name }));
                    setNeighborhoodSearch("");
                    setNeighborhoodOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${form.city_market === (n.nickname ? `${n.name} (${n.nickname})` : n.name) ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
                >
                  {n.name}{n.nickname ? ` (${n.nickname})` : ""}
                </button>
              ))
            )}
          </div>
        )}
        {neighborhoodOpen && <div className="fixed inset-0 z-40" onClick={() => setNeighborhoodOpen(false)} />}
      </div>
    </div>
  );

  // Step 2: Your Music
  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Your Music</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">Share your song</p>
      </div>

      {/* Physical Product */}
      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Do you have physical product available or in production? *</Label>
        <RadioGroup value={form.physical_product} onValueChange={v => setForm(f => ({ ...f, physical_product: v }))} className="flex flex-col gap-3 mt-1">
          {["Yes", "In Production", "Not Yet"].map(opt => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <RadioGroupItem value={opt} className="border-primary-foreground/50 text-primary-foreground" />
              <span className="text-primary-foreground text-base font-sans">{opt}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Upload MP3 */}
      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Upload Your Song * <span className="text-primary-foreground/60">(MP3 only, max 20MB)</span></Label>
        {mp3File ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary-foreground/30 bg-background">
            <span className="text-foreground text-sm font-sans truncate flex-1">{mp3File.name}</span>
            <button type="button" onClick={clearMp3} className="bg-destructive text-destructive-foreground rounded-full p-1 shrink-0">
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
    </div>
  );

  // Step 3: Your Song Details
  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Your Song Details</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">Tell us about the track</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="a-song-title" className="text-primary-foreground text-base font-sans">Song Title *</Label>
        <Input id="a-song-title" value={form.song_title} onChange={e => setForm(f => ({ ...f, song_title: e.target.value }))} className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground" maxLength={300} placeholder="Your song title" />
      </div>

      {/* Short Bio */}
      <div className="space-y-2">
        <Label htmlFor="a-bio" className="text-primary-foreground text-base font-sans">Short Bio * <span className="text-primary-foreground/60">({form.short_bio.length}/{MAX_BIO})</span></Label>
        <textarea
          id="a-bio"
          value={form.short_bio}
          onChange={e => { if (e.target.value.length <= MAX_BIO) setForm(f => ({ ...f, short_bio: e.target.value })); }}
          className="flex min-h-[100px] w-full rounded-md border border-primary-foreground/50 bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          maxLength={MAX_BIO}
          placeholder="A short bio or greeting to new fans (max 240 characters)"
        />
      </div>

      {/* Upload Image */}
      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Upload Image for Your Song *</Label>
        <p className="text-sm text-primary-foreground/60 font-sans">Square (1:1), min 200×200px, max 3MB</p>
        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Song preview" className="w-32 h-32 rounded-lg object-cover border border-primary-foreground/30" />
            <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
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

      {/* How Heard */}
      <div className="space-y-2">
        <Label htmlFor="a-heard" className="text-primary-foreground text-base font-sans">How did you hear about GoLokol?</Label>
        <Input id="a-heard" value={form.how_heard} onChange={e => setForm(f => ({ ...f, how_heard: e.target.value }))} className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground" maxLength={500} />
      </div>
    </div>
  );

  // Step 4: Create Your Account
  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Create Your Account</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">Almost there. Create your account to submit.</p>
      </div>

      <Button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={authLoading}
        className="w-full h-14 text-base font-display font-bold bg-background text-foreground hover:bg-background/90 border border-border"
      >
        {authLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-primary-foreground/30" />
        <span className="text-primary-foreground/70 text-sm font-sans">or</span>
        <div className="flex-1 h-px bg-primary-foreground/30" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="auth-email" className="text-primary-foreground text-base font-sans">Email</Label>
          <Input
            id="auth-email"
            type="email"
            value={authEmail}
            onChange={e => setAuthEmail(e.target.value)}
            className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            placeholder="you@email.com"
            maxLength={255}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="auth-password" className="text-primary-foreground text-base font-sans">Password</Label>
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground pr-12"
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
          type="button"
          onClick={handleEmailSignUp}
          disabled={authLoading || !authEmail.trim() || authPassword.length < 8}
          className="w-full h-14 text-base font-display font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {authLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account & Submit"
          )}
        </Button>
      </div>
    </div>
  );

  const renderNavButtons = () => (
    <div className="flex justify-end gap-3 mt-8">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="h-11 px-6 font-display font-bold text-base bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      )}

      {currentStep < TOTAL_STEPS && (
        <Button
          type="button"
          onClick={handleNext}
          className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-12 md:pb-20">
        <div className="max-w-3xl">
          <h1 className="mb-4">
            <span className="text-foreground">Build Local </span>
            <span className="text-primary">Momentum</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-8 max-w-2xl">
            GoLokol puts your music in front of music lovers in your city that buy records, show up to local events, and tell their friends.
          </p>
          <ol className="space-y-5 mb-8 max-w-2xl list-none">
            {[
              "Submit ONE song (first submission is free).",
              "If selected, local fans can discover and connect with you at Lokol Listening Stations city-wide.",
              "GoLokol lets you invite those new fans to your next show. No algorithms. No BS.",
              "All selected artists get a 1-month free trial.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-0.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-background font-bold text-base">{i + 1}</span>
                </span>
                <span className="text-foreground text-lg md:text-xl font-medium">{text}</span>
              </li>
            ))}
          </ol>
          <a
            href="#wizard"
            className="inline-flex items-center justify-center bg-primary text-background font-display font-bold text-base rounded-2xl h-14 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Submit a Song
          </a>
        </div>
      </section>

      {/* Wizard */}
      <section id="wizard" className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24 scroll-mt-20">
        <div className="max-w-md mx-auto">
          {/* Frozen header above wizard */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <img src={golokolLogo} alt="GoLokol" className="h-12 w-12" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
              Submit Your Music to <span className="text-primary">GoLokol Connect</span>
            </h1>
            <p className="italic text-foreground-secondary text-sm font-sans mt-3 max-w-sm mx-auto">
              GoLokol does not select songs that are grossly violent towards women, glorifies the drug trade or senseless criminality within our Atlanta communities. We call it the Tiana Robinson rule.
            </p>
          </div>

          <p className="text-center text-base font-sans text-muted-foreground mb-6">
            Step {currentStep} of {TOTAL_STEPS}
          </p>

          {renderStepIndicator()}

          <div className="bg-primary rounded-2xl p-6 md:p-8">
            <form onSubmit={handleFormSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {renderNavButtons()}
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsArtists;
