import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import signageSquare from "@/assets/lls-signage-square.png";
import signageTall from "@/assets/lls-signage-tall.png";

const LLSUsRetail = () => {
  const { toast } = useToast();

const [form, setForm] = useState({
    store_name: "",
    city_location: "",
    store_type: "",
    has_listening_station: "",
    signage_preference: [] as string[],
    contact_name: "",
    contact_email: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Please upload a JPG, PNG, or SVG file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File must be under 5 MB.", variant: "destructive" });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.store_name || !form.city_location || !form.store_type || !form.has_listening_station || !form.contact_name || !form.contact_email) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    let store_logo_url: string | null = null;
    if (logoFile) {
      setUploadingLogo(true);
      const ext = logoFile.name.split(".").pop() || "png";
      const path = `lls-retail-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("submissions_audio")
        .upload(path, logoFile, { contentType: logoFile.type, upsert: false });
      setUploadingLogo(false);
      if (uploadErr) {
        setSubmitting(false);
        toast({ title: "Logo upload failed. Please try again.", variant: "destructive" });
        return;
      }
      const { data: urlData } = supabase.storage.from("submissions_audio").getPublicUrl(path);
      store_logo_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("lls_retail_signups").insert({
      store_name: form.store_name.trim(),
      city_location: form.city_location,
      store_type: form.store_type,
      has_listening_station: form.has_listening_station,
      signage_preference: form.signage_preference,
      store_logo_url,
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      notes: form.notes.trim() || null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } else {
      setSuccess(true);
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
            <span className="text-foreground">Is Your Store Where Atlanta </span>
            <span className="text-primary">Discovers Its Sound?</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-6 max-w-2xl">
            The record stores that win aren't just selling music — they're breaking it.
          </p>
          <p className="type-body-lg text-foreground-secondary max-w-2xl">
            We do the vetting. Artists submitted to LLS are crowdsourced and curated — so what plays in your store reflects your brand. Our simple QR code in-store touchpoint turns your space into a curated discovery experience as music fans browse your aisles.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          {success ? (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-8 text-center">
              <h3 className="text-primary mb-2">Thanks for reaching out.</h3>
              <p className="type-body-md text-foreground-secondary">We'll follow up shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-foreground mb-2">Partner Your Store</h2>

              <div>
                <Label htmlFor="r-store" className="text-foreground">Store Name *</Label>
                <Input id="r-store" required value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>

              <div>
                <Label className="text-foreground">City / Location *</Label>
                <Select value={form.city_location} onValueChange={v => setForm(f => ({ ...f, city_location: v }))}>
                  <SelectTrigger className="mt-1.5 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Atlanta">Atlanta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-foreground">Store Type *</Label>
                <Select value={form.store_type} onValueChange={v => setForm(f => ({ ...f, store_type: v }))}>
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
                <Label className="text-foreground">Do you currently have a space dedicated to local music? *</Label>
                <Select value={form.has_listening_station} onValueChange={v => setForm(f => ({ ...f, has_listening_station: v }))}>
                  <SelectTrigger className="mt-1.5 bg-input border-border text-foreground">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Something Informal">Something Informal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Signage Preference */}
              <div className="rounded-lg bg-[#2a2a2a] p-6">
                <Label className="text-foreground mb-4 block">Choose store signage? (free)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: "14x14_foam_board", img: signageSquare, caption: '14x14 foam board. Great for table top or in aisle.' },
                    { value: "11x17_foam_board", img: signageTall, caption: '11x17 foam board (Great to hang on wall)' },
                  ].map((opt) => {
                    const selected = form.signage_preference.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setForm(f => ({
                            ...f,
                            signage_preference: selected
                              ? f.signage_preference.filter(v => v !== opt.value)
                              : [...f.signage_preference, opt.value],
                          }))
                        }
                        className={`rounded-lg border-2 p-3 transition-all text-left ${
                          selected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-input hover:border-foreground/30'
                        }`}
                      >
                        <img src={opt.img} alt={opt.caption} className="w-full rounded-md mb-3 object-contain max-h-52" loading="lazy" />
                        <p className="type-body-sm text-[#F0EDE8]">{opt.caption}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Store Logo Upload */}
              <div>
                <Label className="text-foreground mb-2 block">Upload your high resolution store logo. (jpg, svg or png)</Label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.svg"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img src={logoPreview} alt="Store logo preview" className="h-24 w-24 object-contain rounded-md border border-border bg-input p-2" />
                    <button type="button" onClick={clearLogo} className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border bg-input px-5 py-4 text-foreground-secondary hover:border-foreground/30 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="type-body-sm">Choose file</span>
                  </button>
                )}
              </div>

                <Label htmlFor="r-name" className="text-foreground">Contact Name *</Label>
                <Input id="r-name" required value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={200} />
              </div>

              <div>
                <Label htmlFor="r-email" className="text-foreground">Contact Email *</Label>
                <Input id="r-email" type="email" required value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={255} />
              </div>

              <div>
                <Label htmlFor="r-notes" className="text-foreground">Anything else you want us to know?</Label>
                <Textarea id="r-notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="mt-1.5 bg-input border-border text-foreground" maxLength={2000} />
              </div>

              <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto">
                {submitting ? "Submitting…" : "Partner Your Store"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsRetail;
