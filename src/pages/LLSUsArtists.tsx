import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import golokolLogo from "@/assets/golokol-logo.svg";
import artistsHero from "@/assets/artists_hero.svg";

const PENDING_SUBMISSION_KEY = "pending_artist_submission";

const GENRE_OPTIONS = [
  "Afrobeats", "Alternative", "Beats", "Blues", "Country", "EDM", "Emo",
  "Folk", "Funk", "Gospel", "Hardcore", "Hip-Hop", "House", "Indie",
  "Jazz", "Latin", "Metal", "Neo-Soul", "Pop", "Punk", "R&B", "Rave",
  "Reggae", "Rock", "Ska", "Spoken-Word", "Techno",
];

const MAX_BIO = 240;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_MP3_SIZE = 20 * 1024 * 1024;
const MIN_IMAGE_DIM = 200;
const TOTAL_STEPS = 4;

const ATLANTA_NEIGHBORHOODS = [
  "Adair Park","Adams Park","Adamsville","Almond Park","Ansley Park","Arden/Habersham","Argonne Forest","Arlington Estates","Atkins Park","Auburn Avenue","Austell","Avondale Estates","Bakers Ferry","Bankhead","Beecher Hills","Ben Hill","Berkshire Hills","Bowen Homes","Bower Hills","Brookhaven","Brookwood Hills","Buckhead","Buffalo Creek","Cabbagetown","Candler Park","Capitol Gateway","Capitol Hill","Capitol View","Capitol View Manor","Carey Park","Cascade Green","Cascade Heights","Cascade Road","Castleberry Hill","Chancel","Channing Valley","Chastain Park","Chester Avenue","Clairmont","Collier Heights","Collier Hills","Columbia","Conley Hills","Cornelia","Decatur","Deerwood","Downtown","Druid Hills","East Atlanta","East Lake","East Point","Edgewood","English Avenue","Fairburn","Fairburn Aces","Fairway Hills","Five Points","Flat Shoals","Forest Hills","Fort Valley","Garden Hills","Glenrose Heights","Glenwood Park","Grant Park","Grove Park","Hampton Oaks","Hanover West","Hapeville","Harris Chiles","Harvel Hills","Hillsdale","Historic West End","Holly Hills","Home Park","Inman Park","Jonesboro","Joyland","Kirkwood","Lake Claire","Lakewood","Lakewood Heights","Lenox","Linden","Lindbergh","Loring Heights","Lynwood Park","Mableton","Marietta","Mechanicsville","Memorial Park","Midtown","Midway Woods","Moreland Hills","Morningside","Morris Brandon","Mozley Park","Murphey Crossing","Napier/Thomasville","Norcross","North Buckhead","North Druid Hills","Oakland City","Oakview","Old Fourth Ward","Paces","Panthersville","Perkerson","Peters Street","Peyton Forest","Piedmont Heights","Pittsburgh","Plateau","Plunkettown","Ponce City Market area","Ponce De Leon","Princeton Lakes","Pyron","Rebel Valley Forest","Reynoldstown","Ridgewood Heights","Riverside","Rocky Mount","Rollingwood","Sandy Springs","Sherwood Forest","Smyrna","South Atlanta","South Buckhead","Southtowne","Stanton Road","Stone Mountain","Summerhill","Sylvan Hills","Thomasville Heights","Toco Hills","Tucker","Underwood Hills","Utoy Creek","Vine City","Virginia-Highland","Vinings","Waterford","Westview","Whittier Mill","Wildwood","Wilson Mill Meadows","Winn Park","Woodland Hills","Wyngate",
];

const LLSUsArtists = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mp3InputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    artist_name: "",
    instagram_handle: "",
    genre_style: [] as string[],
    city_market: "",
    physical_product: "",
    song_title: "",
    short_bio: "",
    how_heard: "",
    artist_neighborhood: "",
  });
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!form.artist_name.trim()) { toast({ title: "Artist Name is required.", variant: "destructive" }); return false; }
      if (form.genre_style.length === 0) { toast({ title: "Please select at least one genre.", variant: "destructive" }); return false; }
      if (!form.city_market) { toast({ title: "Please select a city.", variant: "destructive" }); return false; }
      return true;
    }
    if (s === 2) {
      if (!form.physical_product) { toast({ title: "Please select a physical product option.", variant: "destructive" }); return false; }
      if (!mp3File) { toast({ title: "Please upload your MP3.", variant: "destructive" }); return false; }
      return true;
    }
    if (s === 3) {
      if (!form.song_title.trim()) { toast({ title: "Song Title is required.", variant: "destructive" }); return false; }
      if (!form.short_bio.trim()) { toast({ title: "Short bio is required.", variant: "destructive" }); return false; }
      if (!imageFile) { toast({ title: "Please upload a song image.", variant: "destructive" }); return false; }
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

  const saveFormToLocalStorage = () => {
    const payload = {
      artist_name: form.artist_name,
      instagram_handle: form.instagram_handle,
      genre_style: form.genre_style,
      city_market: form.city_market,
      physical_product: form.physical_product,
      song_title: form.song_title,
      short_bio: form.short_bio,
      how_heard: form.how_heard,
      artist_neighborhood: form.artist_neighborhood,
    };
    localStorage.setItem(PENDING_SUBMISSION_KEY, JSON.stringify(payload));
  };

  const handleGoogleSignIn = async () => {
    saveFormToLocalStorage();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/artist/dashboard" },
    });
  };

  const doSubmission = async (contactEmail: string, userId: string) => {
    if (!imageFile || !mp3File) throw new Error("Missing files");

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count, error: countErr } = await (supabase as any)
      .from("lls_artist_submissions")
      .select("id", { count: "exact", head: true })
      .eq("artist_user_id", userId)
      .gte("created_at", firstOfMonth);
    if (countErr) throw countErr;
    if ((count ?? 0) >= 2) throw new Error("LIMIT_REACHED");

    const ts = Date.now();
    const mp3Path = `submissions/${userId}/${ts}-${mp3File.name}`;
    const { error: mp3Err } = await supabase.storage.from("station_submission_audio").upload(mp3Path, mp3File, { contentType: "audio/mpeg" });
    if (mp3Err) throw mp3Err;
    const { data: mp3Url } = supabase.storage.from("station_submission_audio").getPublicUrl(mp3Path);

    const imgPath = `${userId}/${ts}-${imageFile.name}`;
    const { error: imgErr } = await supabase.storage.from("station_submission_images").upload(imgPath, imageFile, { contentType: imageFile.type });
    if (imgErr) throw imgErr;
    const { data: imgUrl } = supabase.storage.from("station_submission_images").getPublicUrl(imgPath);

    const { error } = await (supabase as any).from("lls_artist_submissions").insert({
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
      artist_neighborhood: form.artist_neighborhood || null,
      artist_user_id: userId,
      payment_status: "free",
      admin_status: "pending",
    });
    if (error) throw error;

    supabase.functions.invoke("send-mailerlite-artist-welcome", {
      body: { email: contactEmail, artist_name: form.artist_name.trim() },
    });
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast({ title: "Email is required.", variant: "destructive" }); return; }
    if (password.length < 8) { toast({ title: "Password must be at least 8 characters.", variant: "destructive" }); return; }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + "/artist/dashboard" },
      });

      let userId: string | undefined;

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          if (signInError) { toast({ title: "Wrong password. Please try again.", variant: "destructive" }); return; }
          userId = signInData.user?.id;
        } else {
          toast({ title: error.message, variant: "destructive" }); return;
        }
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) { toast({ title: "Wrong password. Please try again.", variant: "destructive" }); return; }
        userId = signInData.user?.id;
      } else {
        userId = data.user?.id;
      }

      if (!userId) { toast({ title: "Unable to create account.", variant: "destructive" }); return; }

      await doSubmission(email.trim(), userId);
      localStorage.removeItem(PENDING_SUBMISSION_KEY);
      navigate("/artist/dashboard");
    } catch (err: any) {
      if (err?.message === "LIMIT_REACHED") {
        toast({ title: "You've reached your 2 submissions this month.", variant: "destructive" });
      } else {
        toast({ title: err?.message || "Something went wrong.", variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero with image */}
      <section className="relative w-full min-h-[420px] md:min-h-[520px] flex items-end">
        <img
          src={artistsHero}
          alt="Artists hero"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pb-10 md:pb-14 max-w-3xl">
          <h1 className="mb-4">
            <span className="text-foreground">Build Local </span>
            <span className="text-primary">Momentum</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-0 max-w-2xl">
            GoLokol puts your music in front of music lovers in your city that buy records, show up to local events, and tell their friends.
          </p>
        </div>
      </section>

      {/* Bullet points */}
      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <ol className="space-y-5 mb-8 max-w-2xl list-none">
          {[
            "ONE song lives on the platform at one time. Submit up to 2 per month.",
            "Local fans discover and connect with you at Lokol Listening Stations distributed city-wide.",
            "Promote directly to fans who include your music in the GOLOKOL SCENE.",
            "All Atlanta artists get a 1-month free trial.",
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="mt-0.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-background font-bold text-base">{i + 1}</span>
              </span>
              <span className="text-foreground text-lg md:text-xl font-medium">{text}</span>
            </li>
          ))}
        </ol>
        <Link
          to="/artist/signup"
          className="inline-flex items-center justify-center bg-primary text-background font-display font-bold text-base rounded-2xl h-14 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          Sign Up and Submit Music
        </Link>
      </section>

      {/* What is GoLokol? */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24" style={{ backgroundColor: "#FFD600" }}>
        <div className="max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-8">
            What is GoLokol?
          </h2>
          <ul className="space-y-4 mb-12">
            {[
              "Local music discovery IRL",
              "Music promotion infrastructure serving independent artists, fans, venues, and business city-wide.",
              "A traffic source for local economic sustainability driven by local music",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-3 w-3 rounded-full bg-black flex-shrink-0" />
                <span className="text-black text-lg font-medium">{text}</span>
              </li>
            ))}
          </ul>

          {/* What GoLokol is not */}
          <div className="bg-white rounded-2xl p-8 md:p-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-black mb-6">
              What GoLokol is not?
            </h3>
            <ul className="space-y-3">
              {[
                "A streaming service",
                "Social Media",
                "For everybody",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 h-3 w-3 rounded-full bg-black flex-shrink-0" />
                  <span className="text-black text-lg font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-md mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Ready to get your music heard?
          </h2>
          <p className="text-foreground-secondary text-base font-sans mb-8">
            Submit your music to Lokol Listening Stations in Atlanta record stores. Free to submit. No algorithm.
          </p>
          <Link
            to="/artist/signup"
            className="inline-flex items-center justify-center bg-primary text-background font-display font-bold text-base rounded-2xl h-14 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Sign Up and Submit Music
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsArtists;
