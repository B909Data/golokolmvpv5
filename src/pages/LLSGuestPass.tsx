import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

const ARTISTS = [
  "D Money Sign",
  "DESTIN",
  "Lady Ty",
  "Priscilla Manning",
  "Yn3",
];

const LLSGuestPass = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [artistName, setArtistName] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success state
  const [successData, setSuccessData] = useState<{
    claimId: string;
    artistName: string;
    qrImageUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const trimmedName = guestName.trim();
    const trimmedEmail = guestEmail.trim();

    const missingFields: string[] = [];
    if (!trimmedName) missingFields.push("Name");
    if (!trimmedEmail) missingFields.push("Email");
    if (!artistName) missingFields.push("Artist");

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    if (!consentChecked) {
      setError("You must agree to the photo/video release to get a pass.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      eventId,
      guestName: trimmedName,
      guestEmail: trimmedEmail.toLowerCase(),
      artistName,
    };

    try {
      // Try supabase.functions.invoke first
      const { data, error: fnError } = await supabase.functions.invoke("lls-claim-pass", {
        body: payload,
      });

      if (fnError) {
        // Fallback to fetch to read actual response body
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lls-claim-pass`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const txt = await res.text();
          setError(txt);
          return;
        }

        const fallbackData = await res.json();
        if (fallbackData?.qrImageUrl) {
          setSuccessData({
            claimId: fallbackData.claimId,
            artistName: fallbackData.artistName || artistName,
            qrImageUrl: fallbackData.qrImageUrl,
          });
        }
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.qrImageUrl) {
        setSuccessData({
          claimId: data.claimId,
          artistName: data.artistName || artistName,
          qrImageUrl: data.qrImageUrl,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Error claiming pass:", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Success State */}
          {successData ? (
            <div className="text-center space-y-6 px-2">
              <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight">
                Thank you for supporting{" "}
                <span className="text-primary">{successData.artistName}</span>{" "}
                and the Atlanta Local Music Scene!
              </h1>

              <p className="text-xl text-muted-foreground">
                Check your email for more!
              </p>

              <Button variant="outline" onClick={handleReset} className="w-full mt-4">
                Back
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-foreground text-center mb-4">
                RSVP for Lokol Listening Station 3
              </h1>

              <ul className="text-muted-foreground text-sm space-y-1 mb-6 list-disc list-inside">
                <li>Pick the artist you come to support</li>
                <li>Checkbox Filming Consent</li>
                <li>Check your email</li>
              </ul>

              {/* YouTube Video */}
              <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/2exJWgcJRlA"
                  title="Lokol Listening Stations"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Artist Dropdown */}
                <div className="space-y-2">
                  <Label className="text-foreground">Artist You're Supporting</Label>
                  <Select value={artistName} onValueChange={setArtistName} required>
                    <SelectTrigger className="bg-background border-2 border-muted-foreground/30 focus:border-primary">
                      <SelectValue placeholder="Select the artist you're coming for" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTISTS.map((artist) => (
                        <SelectItem key={artist} value={artist}>
                          {artist}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={consentChecked}
                    onCheckedChange={(checked) => setConsentChecked(checked === true)}
                    className="mt-1"
                  />
                  <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I consent to be filmed/photographed at Lokol Listening Stations on April 19, 2026 at The Handlebar, and I grant GoLokol permission to use my image/likeness in event-related media.{" "}
                    <Link to="/lls-release" className="text-primary hover:underline">
                      (Read more)
                    </Link>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Generating…" : "Get Pass"}
                </Button>

                {/* Error Message Area */}
                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSGuestPass;
