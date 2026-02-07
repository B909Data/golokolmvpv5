import { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Success state
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [successArtistName, setSuccessArtistName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const trimmedName = guestName.trim();
    const trimmedEmail = guestEmail.trim();
    const trimmedCode = code.trim();

    const missingFields: string[] = [];
    if (!trimmedName) missingFields.push("Name");
    if (!trimmedEmail) missingFields.push("Email");
    if (!artistName) missingFields.push("Artist");
    if (!trimmedCode) missingFields.push("Invite Code");

    if (missingFields.length > 0) {
      setError(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("lls-claim-pass", {
        body: {
          eventId,
          guestName: trimmedName,
          guestEmail: trimmedEmail.toLowerCase(),
          artistName,
          code: trimmedCode.toUpperCase(),
        },
      });

      if (fnError) {
        setError(fnError.message || "Something went wrong. Please try again.");
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      if (data?.qrImageUrl) {
        setQrImageUrl(data.qrImageUrl);
        setSuccessArtistName(data.artistName || artistName);
      }
    } catch (err) {
      console.error("Error claiming pass:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!qrImageUrl) return;
    
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lls-pass-${successArtistName?.replace(/\s+/g, "-").toLowerCase() || "guest"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Success State */}
          {qrImageUrl ? (
            <div className="text-center space-y-6">
              <h1 className="font-display text-2xl text-foreground">
                Your pass is ready
              </h1>
              
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={qrImageUrl} 
                  alt="Your LLS Guest Pass QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              
              <p className="text-muted-foreground">
                Show this QR code at the door for {successArtistName}
              </p>
              
              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
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
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Artist Dropdown */}
                <div className="space-y-2">
                  <Label className="text-foreground">Artist</Label>
                  <Select value={artistName} onValueChange={setArtistName}>
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

                {/* Invite Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="inviteCode" className="text-foreground">
                    Invite Code
                  </Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                    placeholder="Enter your invite code"
                  />
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
