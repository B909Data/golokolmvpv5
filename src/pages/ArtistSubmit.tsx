import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";
import type { User } from "@supabase/supabase-js";

const GENRE_OPTIONS = [
  "Afrobeats","Alternative","Beats","Blues","Country","EDM","Emo",
  "Folk","Funk","Gospel","Hardcore","Hip-Hop","House","Indie",
  "Jazz","Latin","Metal","Neo-Soul","Pop","Punk","R&B","Rave",
  "Reggae","Rock","Ska","Spoken-Word","Techno",
];

const ATLANTA_NEIGHBORHOODS = [
  "Adair Park","Adams Park","Adamsville","Almond Park","Ansley Park","Arden/Habersham","Argonne Forest","Arlington Estates","Atkins Park","Auburn Avenue","Austell","Avondale Estates","Bakers Ferry","Bankhead","Beecher Hills","Ben Hill","Berkshire Hills","Bowen Homes","Bower Hills","Brookhaven","Brookwood Hills","Buckhead","Buffalo Creek","Cabbagetown","Candler Park","Capitol Gateway","Capitol Hill","Capitol View","Capitol View Manor","Carey Park","Cascade Green","Cascade Heights","Cascade Road","Castleberry Hill","Chancel","Channing Valley","Chastain Park","Chester Avenue","Clairmont","Collier Heights","Collier Hills","Columbia","Conley Hills","Cornelia","Decatur","Deerwood","Downtown","Druid Hills","East Atlanta","East Lake","East Point","Edgewood","English Avenue","Fairburn","Fairburn Aces","Fairway Hills","Five Points","Flat Shoals","Forest Hills","Fort Valley","Garden Hills","Glenrose Heights","Glenwood Park","Grant Park","Grove Park","Hampton Oaks","Hanover West","Hapeville","Harris Chiles","Harvel Hills","Hillsdale","Historic West End","Holly Hills","Home Park","Inman Park","Jonesboro","Joyland","Kirkwood","Lake Claire","Lakewood","Lakewood Heights","Lenox","Linden","Lindbergh","Loring Heights","Lynwood Park","Mableton","Marietta","Mechanicsville","Memorial Park","Midtown","Midway Woods","Moreland Hills","Morningside","Morris Brandon","Mozley Park","Murphey Crossing","Napier/Thomasville","Norcross","North Buckhead","North Druid Hills","Oakland City","Oakview","Old Fourth Ward","Paces","Panthersville","Perkerson","Peters Street","Peyton Forest","Piedmont Heights","Pittsburgh","Plateau","Plunkettown","Ponce City Market area","Ponce De Leon","Princeton Lakes","Pyron","Rebel Valley Forest","Reynoldstown","Ridgewood Heights","Riverside","Rocky Mount","Rollingwood","Sandy Springs","Sherwood Forest","Smyrna","South Atlanta","South Buckhead","Southtowne","Stanton Road","Stone Mountain","Summerhill","Sylvan Hills","Thomasville Heights","Toco Hills","Tucker","Underwood Hills","Utoy Creek","Vine City","Virginia-Highland","Vinings","Waterford","Westview","Whittier Mill","Wildwood","Wilson Mill Meadows","Winn Park","Woodland Hills","Wyngate",
];

const MAX_BIO = 240;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_MP3_SIZE = 20 * 1024 * 1024;
const MIN_IMAGE_DIM = 200;
const TOTAL_STEPS = 3;

const ArtistSubmit = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mp3InputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

  const [form, setForm] = useState({
    artist_name: "",
    instagram_handle: "",
    genre_style: [] as string[],
    city_market: "",
    artist_neighborhood: "",
    song_title: "",
    physical_product: "",
    short_bio: "",
  });

  const [mp3File, setMp3File] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [artistNameReadOnly, setArtistNameReadOnly] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/artist/signup", { replace: true }); return; }
      setUser(session.user);
      const metaArtistName = session.user.user_metadata?.artist_name;
      if (metaArtistName) {
        setForm(f => ({ ...f, artist_name: metaArtistName }));
        setArtistNameReadOnly(true);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const toggleGenre = (genre: string) => {
    setForm(f => {
      const current = f.genre_style;
      if (current.includes(genre)) return { ...f, genre_style: current.filter(g => g !== genre) };
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
      if (img.width < MIN_IMAGE_DIM || img.height < MIN_IMAGE_DIM) { toast({ title: `Image must be at least ${MIN_IMAGE_DIM}×${MIN_IMAGE_DIM}px.`, variant: "destructive" }); URL.revokeObjectURL(url); return; }
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

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.artist_name.trim()) { toast({ title: "Artist Name is required.", variant: "destructive" }); return false; }
      if (form.genre_style.length === 0) { toast({ title: "Please select at least one genre.", variant: "destructive" }); return false; }
      if (!form.city_market) { toast({ title: "Please select a city.", variant: "destructive" }); return false; }
      return true;
    }
    if (s === 2) {
      if (!form.song_title.trim()) { toast({ title: "Song Title is required.", variant: "destructive" }); return false; }
      if (!form.physical_product) { toast({ title: "Please select a physical product option.", variant: "destructive" }); return false; }
      if (!form.short_bio.trim()) { toast({ title: "Short bio is required.", variant: "destructive" }); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => { if (validateStep(step)) setStep(prev => Math.min(prev + 1, TOTAL_STEPS)); };
  const handleBack = () => { setStep(prev => Math.max(prev - 1, 1)); };

  const handleSubmit = async () => {
    if (!mp3File) { toast({ title: "Please upload your MP3.", variant: "destructive" }); return; }
    if (!imageFile) { toast({ title: "Please upload a song image.", variant: "destructive" }); return; }
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
      if ((count ?? 0) >= 2) { toast({ title: "You've reached your 2 submissions this month. Try again next month.", variant: "destructive" }); return; }

      const ts = Date.now();
      const mp3Path = `submissions/${user.id}/${ts}-${mp3File.name}`;
      const { error: mp3Err } = await supabase.storage.from("station_submission_audio").upload(mp3Path, mp3File, { contentType: "audio/mpeg" });
      if (mp3Err) throw mp3Err;
      const { data: mp3Url } = supabase.storage.from("station_submission_audio").getPublicUrl(mp3Path);

      const imgPath = `${user.id}/${ts}-${imageFile.name}`;
      const { error: imgErr } = await supabase.storage.from("station_submission_images").upload(imgPath, imageFile, { contentType: imageFile.type });
      if (imgErr) throw imgErr;
      const { data: imgUrl } = supabase.storage.from("station_submission_images").getPublicUrl(imgPath);

      const { error } = await (supabase as any).from("lls_artist_submissions").insert({
        artist_name: form.artist_name.trim(),
        contact_email: user.email,
        instagram_handle: form.instagram_handle.trim() || null,
        genre_style: form.genre_style.join(", "),
        city_market: form.city_market,
        artist_neighborhood: form.artist_neighborhood || null,
        physical_product: form.physical_product,
        song_title: form.song_title.trim(),
        short_bio: form.short_bio.trim(),
        song_image_url: imgUrl.publicUrl,
        mp3_url: mp3Url.publicUrl,
        mp3_path: mp3Path,
        original_filename: mp3File.name,
      artist_user_id: user.id,
        payment_status: "free",
        admin_status: "pending",
      });
      if (error) throw error;

      toast({ title: "You're in. We'll be in touch." });

      try {
        supabase.functions.invoke("send-mailerlite-artist-welcome", {
          body: { email: user.email, artist_name: form.artist_name.trim() },
        });
      } catch (_) { /* fire and forget */ }

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
        <h2 className="font-display text-2xl text-primary-foreground">Your Artist Info</h2>
        <p className="text-primary-foreground/70 text-sm font-sans mt-1">Tell us who you are</p>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Artist Name *</Label>
        <Input
          value={form.artist_name}
          onChange={e => { if (!artistNameReadOnly) setForm(f => ({ ...f, artist_name: e.target.value })); }}
          readOnly={artistNameReadOnly}
          className={`h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 placeholder:text-muted-foreground ${artistNameReadOnly ? "opacity-70 cursor-not-allowed" : ""}`}
          maxLength={200}
          placeholder="Your artist or band name"
        />
        {artistNameReadOnly && (
          <p className="text-white/40 text-xs font-sans mt-1">This is your registered artist name.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Instagram Handle</Label>
        <Input value={form.instagram_handle} onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))} className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 placeholder:text-muted-foreground" maxLength={200} placeholder="@yourhandle" />
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Genre / Style * <span className="text-primary-foreground/60">(up to 3)</span></Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {GENRE_OPTIONS.map(genre => (
            <button key={genre} type="button" onClick={() => toggleGenre(genre)}
              className={`px-3 py-2 rounded-full text-sm font-sans font-medium transition-colors ${form.genre_style.includes(genre) ? "bg-primary-foreground text-primary ring-2 ring-primary-foreground" : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"}`}>
              {genre}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">City / Market *</Label>
        <Select value={form.city_market} onValueChange={v => setForm(f => ({ ...f, city_market: v }))}>
          <SelectTrigger className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            <SelectItem value="Atlanta" className="text-black">Atlanta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">What part of Atlanta are you based in? (optional)</Label>
        <Popover open={neighborhoodOpen} onOpenChange={setNeighborhoodOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={neighborhoodOpen}
              className="w-full h-14 justify-between text-base font-sans bg-background text-foreground border-primary-foreground/50 hover:bg-background/90">
              {form.artist_neighborhood || "Select neighborhood..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white text-black" align="start">
            <Command>
              <CommandInput placeholder="Search neighborhoods..." className="bg-white text-black placeholder:text-gray-500" />
              <CommandList>
                <CommandEmpty className="text-black">No neighborhood found.</CommandEmpty>
                <CommandGroup>
                  {ATLANTA_NEIGHBORHOODS.map(hood => (
                    <CommandItem key={hood} value={hood} onSelect={() => { setForm(f => ({ ...f, artist_neighborhood: f.artist_neighborhood === hood ? "" : hood })); setNeighborhoodOpen(false); }} className="text-black hover:bg-gray-100 cursor-pointer">
                      <Check className={cn("mr-2 h-4 w-4", form.artist_neighborhood === hood ? "opacity-100" : "opacity-0")} />
                      {hood}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl text-primary-foreground">Song Details</h2>
        <p className="text-primary-foreground/70 text-sm font-sans mt-1">Tell us about your track</p>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Song Title *</Label>
        <Input value={form.song_title} onChange={e => setForm(f => ({ ...f, song_title: e.target.value }))} className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 placeholder:text-muted-foreground" maxLength={300} placeholder="Your song title" />
      </div>

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

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Short Bio - New fans see this. * <span className="text-primary-foreground/60">({form.short_bio.length}/{MAX_BIO})</span></Label>
        <textarea
          value={form.short_bio}
          onChange={e => { if (e.target.value.length <= MAX_BIO) setForm(f => ({ ...f, short_bio: e.target.value })); }}
          className="flex min-h-[100px] w-full rounded-md border border-primary-foreground/50 bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          maxLength={MAX_BIO}
          placeholder="A short bio or greeting to new fans (max 240 characters)"
        />
      </div>

    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl text-primary-foreground">Upload Files</h2>
        <p className="text-primary-foreground/70 text-sm font-sans mt-1">Almost there — upload your song and image</p>
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Upload Your Song * <span className="text-primary-foreground/60">(MP3 only, max 20MB)</span></Label>
        {mp3File ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-primary-foreground/30 bg-background">
            <span className="text-foreground text-sm font-sans truncate flex-1">{mp3File.name}</span>
            <button type="button" onClick={clearMp3} className="bg-destructive text-destructive-foreground rounded-full p-1 shrink-0"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => mp3InputRef.current?.click()}
            className="flex items-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground/70 hover:border-primary-foreground hover:text-primary-foreground transition-colors w-full">
            <Upload className="h-5 w-5" /><span className="text-base font-sans">Choose MP3 File</span>
          </button>
        )}
        <input ref={mp3InputRef} type="file" accept=".mp3,audio/mpeg" onChange={handleMp3Select} className="hidden" />
      </div>

      <div className="space-y-2">
        <Label className="text-primary-foreground text-base font-sans">Upload Song Image *</Label>
        <p className="text-sm text-primary-foreground/60 font-sans">Square (1:1), min 200×200px, max 3MB</p>
        {imagePreview ? (
          <div className="relative inline-block">
            <img src={imagePreview} alt="Song preview" className="w-32 h-32 rounded-lg object-cover border border-primary-foreground/30" />
            <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed border-primary-foreground/30 bg-primary-foreground/5 text-primary-foreground/70 hover:border-primary-foreground hover:text-primary-foreground transition-colors w-full">
            <Upload className="h-5 w-5" /><span className="text-base font-sans">Choose Image</span>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !mp3File || !imageFile}
        className="w-full h-14 text-base font-display font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
          <form onSubmit={e => e.preventDefault()}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {step < TOTAL_STEPS && (
              <div className="flex justify-between gap-3 mt-8">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={handleBack}
                    className="h-11 px-6 font-display font-bold text-base bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                ) : <div />}
                <Button type="button" onClick={handleNext}
                  className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Next
                </Button>
              </div>
            )}

            {step === TOTAL_STEPS && step > 1 && (
              <div className="mt-6">
                <Button type="button" variant="outline" onClick={handleBack}
                  className="h-11 px-6 font-display font-bold text-base bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10">
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
