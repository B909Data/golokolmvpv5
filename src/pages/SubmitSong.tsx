import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Music, User, Link as LinkIcon, FileAudio, Phone, Instagram, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SubmitSong = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [musicReleaseAgreed, setMusicReleaseAgreed] = useState(false);
  const [formData, setFormData] = useState({
    artist_name: "",
    contact_email: "",
    phone: "",
    instagram_handle: "",
    song_title: "",
    spotify_url: "",
    youtube_url: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.artist_name || !formData.contact_email || !formData.phone || !formData.song_title || !formData.spotify_url) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!musicReleaseAgreed) {
      toast.error("You must agree to the Music Release Agreement");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-lls-checkout", {
        body: { ...formData, music_release_agreed: true },
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
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link
            to="/songs"
            className="inline-flex items-center gap-2 text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,10%)] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Listening Sessions
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(0,0%,85%)] mb-6">
                <Music className="h-8 w-8 text-[hsl(0,0%,10%)]" />
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-[hsl(0,0%,10%)] mb-4">
                SUBMIT A <span className="text-[hsl(0,0%,30%)]">LISTENING</span> SESSION
              </h1>
              <p className="text-[hsl(0,0%,40%)] text-lg">
                Your music, get feedback and featured at the next Lokol Listening Sessions event. One Artist, One Song.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-[hsl(0,0%,80%)] p-6 relative overflow-hidden bg-white">
                <div className="relative z-10 space-y-6">
                  {/* Artist Name */}
                  <div className="space-y-2">
                    <Label htmlFor="artist_name" className="flex items-center gap-2 text-[hsl(0,0%,10%)]">
                      <User className="h-4 w-4 text-[hsl(0,0%,30%)]" />
                      Artist / Band Name *
                    </Label>
                    <Input
                      id="artist_name"
                      placeholder="Your artist or band name"
                      value={formData.artist_name}
                      onChange={(e) => handleChange("artist_name", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                      required
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-[hsl(0,0%,10%)]">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.contact_email}
                      onChange={(e) => handleChange("contact_email", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-[hsl(0,0%,10%)]">
                      <Phone className="h-4 w-4 text-[hsl(0,0%,30%)]" />
                      Phone (used only if selected) *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                      required
                    />
                  </div>

                  {/* Instagram Handle */}
                  <div className="space-y-2">
                    <Label htmlFor="instagram_handle" className="flex items-center gap-2 text-[hsl(0,0%,10%)]">
                      <Instagram className="h-4 w-4 text-[hsl(0,0%,30%)]" />
                      Instagram Handle
                    </Label>
                    <Input
                      id="instagram_handle"
                      placeholder="@yourhandle"
                      value={formData.instagram_handle}
                      onChange={(e) => handleChange("instagram_handle", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                    />
                  </div>

                  {/* Song Title */}
                  <div className="space-y-2">
                    <Label htmlFor="song_title" className="flex items-center gap-2 text-[hsl(0,0%,10%)]">
                      <FileAudio className="h-4 w-4 text-[hsl(0,0%,30%)]" />
                      Song Title *
                    </Label>
                    <Input
                      id="song_title"
                      placeholder="Name of your track"
                      value={formData.song_title}
                      onChange={(e) => handleChange("song_title", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                      required
                    />
                  </div>

                  {/* Spotify URL */}
                  <div className="space-y-2">
                    <Label htmlFor="spotify_url" className="flex items-center gap-2 text-[hsl(0,0%,10%)]">
                      <LinkIcon className="h-4 w-4 text-[hsl(0,0%,30%)]" />
                      Spotify URL *
                    </Label>
                    <Input
                      id="spotify_url"
                      type="url"
                      placeholder="https://open.spotify.com/track/..."
                      value={formData.spotify_url}
                      onChange={(e) => handleChange("spotify_url", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                      required
                    />
                  </div>

                  {/* YouTube Channel URL */}
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className="flex items-center gap-2 text-[hsl(0,0%,10%)]">
                      <LinkIcon className="h-4 w-4 text-[hsl(0,0%,30%)]" />
                      YouTube Channel URL
                    </Label>
                    <Input
                      id="youtube_url"
                      type="url"
                      placeholder="https://youtube.com/@yourchannel"
                      value={formData.youtube_url}
                      onChange={(e) => handleChange("youtube_url", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[hsl(0,0%,10%)]">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Anything else you'd like us to know..."
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] min-h-[100px]"
                    />
                  </div>

                  {/* Music Release Agreement */}
                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="music_release"
                      checked={musicReleaseAgreed}
                      onCheckedChange={(checked) => setMusicReleaseAgreed(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="music_release" className="text-[hsl(0,0%,10%)] text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link to="/lls-music-release" target="_blank" className="underline hover:text-[hsl(0,0%,30%)]">
                        Blanket Artist Music Release Agreement
                      </Link>{" "}
                      and grant GoLokol the right to use my submitted music for Lokol Listening Sessions. *
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Loading..." : "Submit & Pay ($5)"}
                </Button>
                <p className="text-xs text-[hsl(0,0%,40%)] mt-3">
                  You'll be redirected to Stripe to complete payment. Submission fee is $5 USD. No subscription.
                </p>
                <p className="text-xs text-[hsl(0,0%,50%)] mt-1">
                  By proceeding, you agree to GoLokol's{" "}
                  <Link to="/terms" className="underline hover:text-[hsl(0,0%,30%)]">Terms</Link>
                  {" & "}
                  <Link to="/privacy" className="underline hover:text-[hsl(0,0%,30%)]">Privacy</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitSong;
