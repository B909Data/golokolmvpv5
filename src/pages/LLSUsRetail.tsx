import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.store_name || !form.city_location || !form.store_type || !form.has_listening_station || !form.contact_name || !form.contact_email) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("lls_retail_signups").insert({
      store_name: form.store_name.trim(),
      city_location: form.city_location,
      store_type: form.store_type,
      has_listening_station: form.has_listening_station,
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      notes: form.notes.trim() || null,
    });
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

              <div>
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
