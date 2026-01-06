import { useState } from "react";
import { Music, Play, FileText, Send, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Songs = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    artist_name: "",
    contact_email: "",
    song_title: "",
    spotify_url: "",
    youtube_url: "",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.artist_name || !formData.contact_email || !formData.song_title || !formData.spotify_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-lls-checkout", {
        body: formData,
      });

      if (error) throw error;

      if (data?.url) {
        const newWindow = window.open(data.url, "_blank");
        if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
          toast.error("Popup blocked. Please click the link below.");
          toast(
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="underline text-primary">
              Open Stripe Checkout
            </a>,
          );
        }
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Music className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4">
            LOKOL <span className="text-primary text-glow">LISTENING SESSIONS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A live showcase for independent artists. Currently in Atlanta.
          </p>
        </div>
      </section>

      {/* Trailer Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video w-full rounded-lg overflow-hidden border border-border/30">
            <iframe
              src={YOUTUBE_TRAILER_URL}
              title="Lokol Listening Sessions Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* What It Is Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-foreground mb-6 flex items-center gap-3">
            <Play className="w-6 h-6 text-primary" />
            What it is
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Lokol Listening Sessions is a live event where a curated group of artists perform their original music in
              front of an audience of fans, curators, and fellow musicians.
            </p>
            <p>
              Each session features 5-8 artists selected from submissions. Artists get stage time, feedback, and
              exposure to a supportive community.
            </p>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-foreground mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Rules
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>You must be an independent artist (no major label affiliation).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>Your submitted song must be original work.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>You must be able to perform live in Atlanta if selected.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>Submission fee is non-refundable. Selection is at our discretion.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">5.</span>
              <span>Be respectful to staff, other artists, and the audience.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Submit Form Section */}
      <section id="submit" className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-foreground mb-8 flex items-center gap-3">
            <Send className="w-6 h-6 text-primary" />
            Submit a Song
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="artist_name">Artist Name *</Label>
                <Input
                  id="artist_name"
                  name="artist_name"
                  value={formData.artist_name}
                  onChange={handleInputChange}
                  placeholder="Your artist/band name"
                  required
                  className="bg-card/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email *</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  className="bg-card/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="song_title">Song Title *</Label>
              <Input
                id="song_title"
                name="song_title"
                value={formData.song_title}
                onChange={handleInputChange}
                placeholder="Name of the song you're submitting"
                required
                className="bg-card/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spotify_url">Spotify URL *</Label>
              <Input
                id="spotify_url"
                name="spotify_url"
                value={formData.spotify_url}
                onChange={handleInputChange}
                placeholder="https://open.spotify.com/track/..."
                required
                className="bg-card/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL (optional)</Label>
              <Input
                id="youtube_url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-card/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Anything else you'd like us to know..."
                rows={4}
                className="bg-card/50 border-border/50"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                <ExternalLink className="w-4 h-4 mr-2" />
                {isSubmitting ? "Loading..." : "Submit & Pay ($15)"}
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                You'll be redirected to Stripe to complete payment. Submission fee is $15 USD.
              </p>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Songs;
