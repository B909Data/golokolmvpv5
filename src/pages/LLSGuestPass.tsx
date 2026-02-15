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
import { Download } from "lucide-react";

const ARTISTS = [
  "Sque3eze",
  "Kantii",
  "Alyx Ransom",
  "Kavier Sundays",
  "E-Coolin",
  "Charlie Global",
  "Big Prise",
  "Mvsua",
  "Trayonpass",
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
            <div className="text-center space-y-6">
              <h1 className="font-display text-2xl text-foreground">
                Your Pass Is Ready
              </h1>
              
              <p className="text-muted-foreground">
                You're attending Lokol Listening Sessions to support{" "}
                <span className="text-foreground font-semibold">{successData.artistName}</span>
              </p>

              <p className="text-sm text-muted-foreground">
                Save or screenshot this QR code. You'll need it at the door.
              </p>
              
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={successData.qrImageUrl} 
                  alt="Your LLS Guest Pass QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                We've emailed you a copy of your pass. Check your inbox.
              </p>
              
              <div className="space-y-3">
                <a 
                  href={successData.qrImageUrl} 
                  download={`lls-pass-${successData.artistName.replace(/\s+/g, "-").toLowerCase()}.png`}
                  className="inline-flex items-center justify-center w-full rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 font-medium"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </a>
                
                <Button variant="outline" onClick={handleReset} className="w-full">
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl text-foreground text-center mb-6">
                Get Your Lokol Listening Session Guest Pass
              </h1>

              {/* YouTube Video */}
              <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/2exJWgcJRlA"
                  title="Lokol Listening Sessions"
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
                  <Label className="text-foreground">Artist</Label>
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
                    I consent to be filmed/photographed at Lokol Listening Sessions on Feb 15, 2026 at The Handlebar, and I grant GoLokol permission to use my image/likeness in event-related media.{" "}
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
