import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
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
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STRIPE_STICKER_URL = "https://buy.stripe.com/cNieVf0om6IJ7Q3fwd6AM05";

const LLSUsRetail = () => {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    store_name: "",
    business_type: "",
    city_location: "Atlanta",
    contact_name: "",
    contact_email: "",
    notes: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
    if (!form.store_name || !form.business_type || !form.contact_name || !form.contact_email) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Please agree to the partnership terms before continuing.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    let store_logo_url: string | null = null;
    if (logoFile) {
      const ext = logoFile.name.split(".").pop() || "png";
      const path = `lls-retail-logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("partner_flyers")
        .upload(path, logoFile, { contentType: logoFile.type, upsert: false });
      if (uploadErr) {
        setSubmitting(false);
        toast({ title: "Logo upload failed. Please try again.", variant: "destructive" });
        return;
      }
      const { data: urlData } = supabase.storage.from("partner_flyers").getPublicUrl(path);
      store_logo_url = urlData.publicUrl;
    }

    const signupId = crypto.randomUUID();
    const { error } = await (supabase as any).from("lls_retail_signups").insert({
      id: signupId,
      store_name: form.store_name.trim(),
      city_location: form.city_location,
      store_type: form.business_type,
      has_listening_station: "N/A",
      signage_preference: [],
      store_logo_url,
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      notes: form.notes.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      return;
    }

    localStorage.setItem(
      "golokol_retail_signup",
      JSON.stringify({
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        store_name: form.store_name.trim(),
        business_type: form.business_type,
      })
    );

    window.location.href = STRIPE_STICKER_URL;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-12 md:pb-20">
        <div className="max-w-3xl">
          <h1 className="mb-4">
            <span className="text-foreground">Your Business Is a Part of </span>
            <span className="text-primary">Atlanta's Local Music Scene.</span>
          </h1>
          <p className="type-subcaption text-foreground-secondary mb-6 max-w-2xl">
            Atlanta fans are already discovering local music. Your spot is where they come to earn more, redeem points, and go deeper.
          </p>
          <ol className="space-y-5 max-w-2xl list-none">
            {[
              "GoLokol fans discover local artists online and at partner retail and gathering spots city-wide.",
              "Your business is a rewards destination — fans earn bonus points when they visit and redeem that value with you.",
              "Post-purchase gifting turns every transaction into a music discovery moment.",
              "Redemption drives repeat visits. Points earned anywhere, spent at your spot.",
              "You set your own reward. GoLokol handles the infrastructure.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-0.5 w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-background font-bold text-base">{i + 1}</span>
                </span>
                <span className="type-body-lg text-foreground-secondary">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sticker Pack CTA */}
      <section className="bg-primary px-6 md:px-12 lg:px-20 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-card-foreground">
          <h2 className="text-card-foreground mb-3">Get Started with a Lokol Sticker Pack</h2>
          <p className="type-body-lg mb-3">
            500 stickers for $40. Hand them out after every purchase. Your customers get a gift. You get a reason for them to come back.
          </p>
          <p className="type-body-md">
            Fill out the form below and you'll be taken to a secure checkout.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="bg-background-secondary px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-foreground mb-2">Tell us about your business</h2>

            <div>
              <Label htmlFor="r-store" className="text-foreground">Business Name *</Label>
              <Input
                id="r-store"
                required
                value={form.store_name}
                onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))}
                className="mt-1.5 bg-input border-border text-foreground"
                maxLength={200}
                placeholder="Your business name"
              />
            </div>

            <div>
              <Label className="text-foreground">Type of Business *</Label>
              <Select value={form.business_type} onValueChange={v => setForm(f => ({ ...f, business_type: v }))}>
                <SelectTrigger className="mt-1.5 bg-input border-border text-foreground">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Record Store">Record Store</SelectItem>
                  <SelectItem value="Cafe / Coffee Shop">Cafe / Coffee Shop</SelectItem>
                  <SelectItem value="Bar / Lounge">Bar / Lounge</SelectItem>
                  <SelectItem value="Bookstore">Bookstore</SelectItem>
                  <SelectItem value="Barbershop / Salon">Barbershop / Salon</SelectItem>
                  <SelectItem value="Art Gallery">Art Gallery</SelectItem>
                  <SelectItem value="Clothing / Retail">Clothing / Retail</SelectItem>
                  <SelectItem value="Restaurant">Restaurant</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-foreground mb-2 block">Upload your logo — optional (jpg, svg or png)</Label>
              <input
                ref={logoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.svg"
                onChange={handleLogoSelect}
                className="hidden"
              />
              {logoPreview ? (
                <div className="relative inline-block">
                  <img src={logoPreview} alt="Logo preview" className="h-24 w-24 object-contain rounded-md border border-border bg-input p-2" />
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

            <div>
              <Label htmlFor="r-name" className="text-foreground">Contact Full Name *</Label>
              <Input
                id="r-name"
                required
                value={form.contact_name}
                onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                className="mt-1.5 bg-input border-border text-foreground"
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="r-email" className="text-foreground">Contact Email *</Label>
              <Input
                id="r-email"
                type="email"
                required
                value={form.contact_email}
                onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                className="mt-1.5 bg-input border-border text-foreground"
                maxLength={255}
              />
            </div>

            <div>
              <Label htmlFor="r-notes" className="text-foreground">Anything else you want us to know?</Label>
              <Textarea
                id="r-notes"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-1.5 bg-input border-border text-foreground"
                maxLength={2000}
              />
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="agreed"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#FFD600]"
              />
              <label htmlFor="agreed" className="text-foreground-secondary text-sm leading-relaxed cursor-pointer">
                I have read and agree to the{" "}
                <a href="/lls-us/terms-preview" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">
                  GoLokol Partner Agreement
                </a>
                . I understand this is a binding agreement and that a copy will be sent to my email after payment. *
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting || !agreed}
              className="w-full md:w-auto font-bold"
              style={{ backgroundColor: "#FFD600", color: "#000" }}
            >
              {submitting ? "Saving…" : "Continue to Payment — $40"}
            </Button>
            <p className="text-foreground-secondary text-xs">
              You'll be taken to a secure Stripe checkout. Your sticker pack ships after payment is confirmed.
            </p>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsRetail;
