import { useState } from "react";
import { Music, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import Footer from "@/components/Footer";
import golokolLogo from "@/assets/golokol-logo.svg";
import { Link } from "react-router-dom";

const LLSUs = () => {
  const { toast } = useToast();

  // Artist form state
  const [artistForm, setArtistForm] = useState({
    artist_name: "",
    contact_email: "",
    genre_style: "",
    city_market: "",
    physical_product: "",
    how_heard: "",
  });
  const [artistSubmitting, setArtistSubmitting] = useState(false);
  const [artistSuccess, setArtistSuccess] = useState(false);

  // Retail form state
  const [retailForm, setRetailForm] = useState({
    store_name: "",
    city_location: "",
    store_type: "",
    has_listening_station: "",
    contact_name: "",
    contact_email: "",
    notes: "",
  });
  const [retailSubmitting, setRetailSubmitting] = useState(false);
  const [retailSuccess, setRetailSuccess] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistForm.artist_name || !artistForm.contact_email || !artistForm.genre_style || !artistForm.city_market || !artistForm.physical_product) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setArtistSubmitting(true);
    const { error } = await supabase.from("lls_artist_submissions").insert({
      artist_name: artistForm.artist_name.trim(),
      contact_email: artistForm.contact_email.trim(),
      genre_style: artistForm.genre_style.trim(),
      city_market: artistForm.city_market.trim(),
      physical_product: artistForm.physical_product,
      how_heard: artistForm.how_heard.trim() || null,
    });
    setArtistSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      setArtistSuccess(true);
    }
  };

  const handleRetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retailForm.store_name || !retailForm.city_location || !retailForm.store_type || !retailForm.has_listening_station || !retailForm.contact_name || !retailForm.contact_email) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setRetailSubmitting(true);
    const { error } = await supabase.from("lls_retail_signups").insert({
      store_name: retailForm.store_name.trim(),
      city_location: retailForm.city_location.trim(),
      store_type: retailForm.store_type,
      has_listening_station: retailForm.has_listening_station,
      contact_name: retailForm.contact_name.trim(),
      contact_email: retailForm.contact_email.trim(),
      notes: retailForm.notes.trim() || null,
    });
    setRetailSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      setRetailSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
      <header className="px-6 md:px-12 lg:px-20 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
          <span className="font-display text-xl text-foreground tracking-wide">GoLokol</span>
        </Link>
      </header>

      {/* HERO */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="mb-6">
            <span className="text-foreground">Your Music. Your City. </span>
            <span className="text-primary">In the Stores and On the Floor.</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-10 max-w-2xl">
            Lokol Listening Sessions brings emerging independent artists into record stores and onto the dance floor — where real music fans discover what's next.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" onClick={() => scrollTo("artist-submission")}>
              Submit Your Music
            </Button>
            <Button variant="outline" size="lg" onClick={() => scrollTo("retail-signup")}>
              Partner Your Store
            </Button>
          </div>
        </div>
      </section>

      {/* ARTIST SECTION */}
      <section id="artist-submission" className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="mb-6">
            <span className="text-foreground">Get Your Music Heard — </span>
            <span className="text-primary">In Stores and On the Floor</span>
          </h2>
          <p className="type-body-lg text-foreground-secondary mb-4">
            Lokol Listening Sessions is two things in one. First, it's a curated in-store listening kiosk inside independent record stores — your music playing where real fans browse and buy. Second, it's a live event series: DJ sets and dance parties built around local independent music, filmed and distributed as content.
          </p>
          <p className="type-body-md text-foreground-secondary mb-10">
            One submission. You may be selected for one, both, or neither — but every artist who submits is considered for the full experience.
          </p>

          {/* Format cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            <div className="rounded-lg border border-border bg-background-tertiary p-6">
              <Music className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-display text-foreground mb-1">In-Store</h4>
              <p className="type-body-sm text-foreground-secondary">Your music in local record store listening kiosks</p>
            </div>
            <div className="rounded-lg border border-border bg-background-tertiary p-6">
              <Film className="h-8 w-8 text-primary mb-3" />
              <h4 className="font-display text-foreground mb-1">Live Event</h4>
              <p className="type-body-sm text-foreground-secondary">DJ sets, dance parties, and content distribution</p>
            </div>
          </div>

          {/* Artist Form */}
          {artistSuccess ? (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-8 text-center">
              <h3 className="text-primary mb-2">You're in.</h3>
              <p className="type-body-md text-foreground-secondary">We'll be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleArtistSubmit} className="space-y-5">
              <div>
                <Label htmlFor="a-name" className="text-foreground">Artist Name *</Label>
                <Input id="a-name" required value={artistForm.artist_name} onChange={e => setArtistForm(f => ({ ...f, artist_name: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="a-email" className="text-foreground">Contact Email *</Label>
                <Input id="a-email" type="email" required value={artistForm.contact_email} onChange={e => setArtistForm(f => ({ ...f, contact_email: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={255} />
              </div>
              <div>
                <Label htmlFor="a-genre" className="text-foreground">Genre / Style *</Label>
                <Input id="a-genre" required value={artistForm.genre_style} onChange={e => setArtistForm(f => ({ ...f, genre_style: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="a-city" className="text-foreground">City / Market *</Label>
                <Input id="a-city" required value={artistForm.city_market} onChange={e => setArtistForm(f => ({ ...f, city_market: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>
              <div>
                <Label className="text-foreground mb-2 block">Do you have physical product available or in production? *</Label>
                <RadioGroup value={artistForm.physical_product} onValueChange={v => setArtistForm(f => ({ ...f, physical_product: v }))} className="flex flex-col gap-3 mt-1.5">
                  {["Yes", "In Production", "Not Yet"].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer">
                      <RadioGroupItem value={opt} />
                      <span className="text-foreground type-body-md">{opt}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <Label htmlFor="a-heard" className="text-foreground">How did you hear about GoLokol?</Label>
                <Input id="a-heard" value={artistForm.how_heard} onChange={e => setArtistForm(f => ({ ...f, how_heard: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={500} />
              </div>
              <Button type="submit" size="lg" disabled={artistSubmitting} className="w-full md:w-auto">
                {artistSubmitting ? "Submitting…" : "Submit to Lokol Listening Sessions"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* RETAIL SECTION */}
      <section id="retail-signup" className="bg-background px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="mb-6">
            <span className="text-foreground">Bring Local Artists </span>
            <span className="text-primary">Into Your Store</span>
          </h2>
          <p className="type-body-lg text-foreground-secondary mb-10">
            Partner with GoLokol to host a Lokol Listening Station — a curated in-store kiosk that showcases emerging local artists and drives discovery for your customers. No tech setup required on your end.
          </p>

          {retailSuccess ? (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-8 text-center">
              <h3 className="text-primary mb-2">Thanks for reaching out.</h3>
              <p className="type-body-md text-foreground-secondary">We'll follow up shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleRetailSubmit} className="space-y-5">
              <div>
                <Label htmlFor="r-store" className="text-foreground">Store Name *</Label>
                <Input id="r-store" required value={retailForm.store_name} onChange={e => setRetailForm(f => ({ ...f, store_name: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="r-city" className="text-foreground">City / Location *</Label>
                <Input id="r-city" required value={retailForm.city_location} onChange={e => setRetailForm(f => ({ ...f, city_location: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>
              <div>
                <Label className="text-foreground">Store Type *</Label>
                <Select value={retailForm.store_type} onValueChange={v => setRetailForm(f => ({ ...f, store_type: v }))}>
                  <SelectTrigger className="mt-1.5 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select store type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Independent">Independent</SelectItem>
                    <SelectItem value="Small Chain">Small Chain</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-foreground">Do you currently have a listening station setup? *</Label>
                <Select value={retailForm.has_listening_station} onValueChange={v => setRetailForm(f => ({ ...f, has_listening_station: v }))}>
                  <SelectTrigger className="mt-1.5 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Something informal">Something informal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="r-name" className="text-foreground">Contact Name *</Label>
                <Input id="r-name" required value={retailForm.contact_name} onChange={e => setRetailForm(f => ({ ...f, contact_name: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>
              <div>
                <Label htmlFor="r-email" className="text-foreground">Contact Email *</Label>
                <Input id="r-email" type="email" required value={retailForm.contact_email} onChange={e => setRetailForm(f => ({ ...f, contact_email: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={255} />
              </div>
              <div>
                <Label htmlFor="r-notes" className="text-foreground">Anything else you want us to know?</Label>
                <Textarea id="r-notes" value={retailForm.notes} onChange={e => setRetailForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={2000} />
              </div>
              <Button type="submit" size="lg" disabled={retailSubmitting} className="w-full md:w-auto">
                {retailSubmitting ? "Submitting…" : "Partner With Us"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUs;
