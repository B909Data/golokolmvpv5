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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      eventId,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      artistName,
      code: code.trim().toUpperCase(),
    };

    console.log("Form submitted:", payload);
    // Placeholder for future database integration
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="font-display text-3xl text-foreground text-center mb-8">
            Get Your LLS Pass
          </h1>

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
                required
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
                required
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
                required
                className="bg-background border-2 border-muted-foreground/30 focus:border-primary"
                placeholder="Enter your invite code"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !artistName}
              className="w-full"
            >
              {isSubmitting ? "Processing..." : "Get Pass"}
            </Button>

            {/* Error Message Area */}
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSGuestPass;
