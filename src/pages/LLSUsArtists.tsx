import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GENRE_OPTIONS = [
  "Afrobeats", "Alternative", "Beats", "Blues", "Country", "EDM", "Emo",
  "Folk", "Funk", "Gospel", "Hardcore", "Hip-Hop", "House", "Indie",
  "Jazz", "Latin", "Metal", "Neo-Soul", "Pop", "Punk", "R&B", "Rave",
  "Reggae", "Rock", "Ska", "Spoken-Word", "Techno",
];

const MAX_BIO = 240;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
const MIN_IMAGE_DIM = 200;

const LLSUsArtists = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    artist_name: "",
    contact_email: "",
    instagram_handle: "",
    genre_style: [] as string[],
    city_market: "",
    physical_product: "",
    music_link: "",
    short_bio: "",
    how_heard: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleGenre = (genre: string) => {
    setForm((f) => {
      const current = f.genre_style;
      if (current.includes(genre)) {
        return { ...f, genre_style: current.filter((g) => g !== genre) };
      }
      if (current.length >= 3) return f;
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

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.artist_name || !form.contact_email || form.genre_style.length === 0 ||
      !form.city_market || !form.physical_product || !form.music_link ||
      !form.short_bio || !imageFile
    ) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Upload image
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `lls-artist-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("submissions_audio") // reusing existing public bucket
        .upload(path, imageFile, { contentType: imageFile.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("submissions_audio")
        .getPublicUrl(path);

      const { error } = await supabase.from("lls_artist_submissions").insert({
        artist_name: form.artist_name.trim(),
        contact_email: form.contact_email.trim(),
        instagram_handle: form.instagram_handle.trim() || null,
        genre_style: form.genre_style.join(", "),
        city_market: form.city_market,
        physical_product: form.physical_product,
        music_link: form.music_link.trim(),
        short_bio: form.short_bio.trim(),
        song_image_url: urlData.publicUrl,
        how_heard: form.how_heard.trim() || null,
      });

      if (error) throw error;
      setSuccess(true);
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 md:px-12 lg:px-20 py-5 flex items-center gap-4">
        <Link to="/lls-us" className="text-foreground-secondary hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
          <span className="font-display text-xl text-foreground tracking-wide">GoLokol</span>
        </Link>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-3xl">
          <h1 className="mb-4">
            <span className="text-foreground">Build Local Momentum </span>
            <span className="text-primary">Without an Algorithm</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-6 max-w-2xl">
            Lokol Listening Stations puts your music in front of the fans who buy records, show up to local events, and tell their friends.
          </p>
          <ul className="space-y-4 mb-6 max-w-2xl">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-3 w-3 rounded-full bg-primary shrink-0" />
              <span className="text-foreground text-lg md:text-xl font-medium">Submit your music ($10).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-3 w-3 rounded-full bg-primary shrink-0" />
              <span className="text-foreground text-lg md:text-xl font-medium">If selected, local fans discover and vote in record stores city wide.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-3 w-3 rounded-full bg-primary shrink-0" />
              <span className="text-foreground text-lg md:text-xl font-medium">Votes lead to features and real fan connections, sales and show attendance.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-3 w-3 rounded-full bg-primary shrink-0" />
              <span className="text-foreground text-lg md:text-xl font-medium">If not selected you get feedback and a 1-month free trial of <Link to="/connect" className="text-primary underline hover:text-primary/80 transition-colors">GoLokol Connect</Link>.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Video */}
      <section className="px-6 md:px-12 lg:px-20 pb-12">
        <div className="w-full max-w-3xl rounded-xl overflow-hidden">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src="https://www.youtube.com/embed/gKznwkyfqlU?rel=0"
              title="Lokol Listening Stations"
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {success ? (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-8 text-center">
              <h3 className="text-primary mb-2">We gotchu.</h3>
              <p className="type-body-md text-foreground-secondary">Now check your email.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-foreground mb-2">Submit Your Music</h2>

              {/* Artist Name */}
              <div>
                <Label htmlFor="a-name" className="text-foreground">Artist Name *</Label>
                <Input id="a-name" required value={form.artist_name} onChange={e => setForm(f => ({ ...f, artist_name: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>

              {/* Contact Email */}
              <div>
                <Label htmlFor="a-email" className="text-foreground">Contact Email *</Label>
                <Input id="a-email" type="email" required value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={255} />
              </div>

              {/* Instagram Handle */}
              <div>
                <Label htmlFor="a-ig" className="text-foreground">Instagram Handle</Label>
                <Input id="a-ig" value={form.instagram_handle} onChange={e => setForm(f => ({ ...f, instagram_handle: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} placeholder="@yourhandle" />
              </div>

              {/* Genre Multi-Select */}
              <div>
                <Label className="text-foreground mb-2 block">
                  Genre / Style * <span className="text-foreground-secondary">(select up to 3)</span>
                </Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                        form.genre_style.includes(genre)
                          ? "bg-primary text-primary-foreground ring-2 ring-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* City / Market */}
              <div>
                <Label className="text-foreground">City / Market *</Label>
                <Select value={form.city_market} onValueChange={v => setForm(f => ({ ...f, city_market: v }))}>
                  <SelectTrigger className="mt-1.5 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Atlanta">Atlanta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Physical Product */}
              <div>
                <Label className="text-foreground mb-2 block">Do you have physical product available or in production? *</Label>
                <RadioGroup value={form.physical_product} onValueChange={v => setForm(f => ({ ...f, physical_product: v }))} className="flex flex-col gap-3 mt-1.5">
                  {["Yes", "In Production", "Not Yet"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value={opt} />
                      <span className="text-foreground type-body-md">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Music Link */}
              <div>
                <Label htmlFor="a-music" className="text-foreground">Your Music Link *</Label>
                <p className="type-body-sm text-foreground-secondary mb-1.5">Bandcamp, SoundCloud or Dropbox link (we do not support Spotify)</p>
                <Input id="a-music" required value={form.music_link} onChange={e => setForm(f => ({ ...f, music_link: e.target.value }))} className="bg-input border-border text-foreground" maxLength={500} placeholder="https://" />
              </div>

              {/* Short Bio */}
              <div>
                <Label htmlFor="a-bio" className="text-foreground">Short Bio * <span className="text-foreground-secondary">({form.short_bio.length}/{MAX_BIO})</span></Label>
                <textarea
                  id="a-bio"
                  required
                  value={form.short_bio}
                  onChange={e => {
                    if (e.target.value.length <= MAX_BIO) setForm(f => ({ ...f, short_bio: e.target.value }));
                  }}
                  className="mt-1.5 flex min-h-[100px] w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  maxLength={MAX_BIO}
                />
              </div>

              {/* Song Image Upload */}
              <div>
                <Label className="text-foreground mb-1.5 block">Upload Image for Your Song *</Label>
                <p className="type-body-sm text-foreground-secondary mb-2">Square (1:1), min 200×200px, max 3MB</p>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Song preview" className="w-32 h-32 rounded-lg object-cover border border-border" />
                    <button type="button" onClick={clearImage} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 px-6 py-4 rounded-lg border-2 border-dashed border-border bg-background-tertiary text-foreground-secondary hover:border-primary hover:text-foreground transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="type-body-md">Choose Image</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* How Heard */}
              <div>
                <Label htmlFor="a-heard" className="text-foreground">How did you hear about GoLokol?</Label>
                <Input id="a-heard" value={form.how_heard} onChange={e => setForm(f => ({ ...f, how_heard: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={500} />
              </div>

              <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto">
                {submitting ? "Submitting…" : "Submit Your Music"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsArtists;
