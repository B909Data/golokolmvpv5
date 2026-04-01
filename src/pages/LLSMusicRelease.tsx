import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AGREEMENT_VERSION = "LLS_MUSIC_RELEASE_V1";

const AGREEMENT_TEXT = `LOKOL LISTENING SESSIONS

BLANKET ARTIST MUSIC RELEASE AGREEMENT

This Music Release Agreement ("Agreement") is entered into by and between Golokol LLC, a Georgia limited liability company ("Company"), and the undersigned submitting artist ("Artist").

This Agreement applies to all music submitted by Artist through the Lokol Listening Stations music submission form, including but not limited to the specific artist name and song title(s) provided in that submission.

By submitting music and participating in Lokol Listening Stations, Artist agrees to the following:

1. Grant of Rights

Artist hereby grants to Company a non-exclusive, worldwide, perpetual, royalty-free license to:

Play and publicly perform the submitted music during Lokol Listening Stations events

Record, film, and capture such music in audio and audiovisual formats

Edit, reproduce, distribute, stream, publicly display, and otherwise exploit such recordings in connection with Lokol Listening Stations content

Use such recordings in promotional materials, social media, digital platforms, websites, and marketing materials related to Lokol Listening Stations

Exhibit and publicly play the submitted music through curated listening environments, including but not limited to:

Lokol Listening Stations events
Lokol Listening Stations listening stations or kiosks
In-store listening installations located in record stores, retail locations, or partner venues
Digital listening interfaces associated with Lokol Listening Stations where listeners may preview and vote on music

Such uses may include audio-only playback, audiovisual presentation, and digital listening experiences designed to showcase local artists and allow audiences to discover and vote on music.

This grant includes rights in both the master recording and the underlying musical composition to the extent controlled by Artist.

2. No Compensation

Artist acknowledges and agrees that:

No publishing royalties
No mechanical royalties
No synchronization fees
No performance royalties
No future licensing fees

shall be owed by Company for the uses authorized under this Agreement.

Participation in Lokol Listening Stations is voluntary and promotional in nature.

3. Ownership and Authority

Artist represents and warrants that:

Artist owns or controls all necessary rights in the submitted music
All necessary permissions have been obtained from co-writers, producers, or other rights holders
The submitted music does not infringe upon any third-party rights

Artist agrees to indemnify and hold Company harmless from any claims arising from breach of these representations.

4. Scope of Use

This Agreement applies solely to uses connected to the Lokol Listening Stations ecosystem, including:

Lokol Listening Stations live events
Filmed and recorded Lokol Listening Stations content
Online video and digital media distribution
In-store listening kiosks and curated music listening installations
Audience voting and music discovery experiences associated with Lokol Listening Stations

This Agreement does not transfer ownership of the music to Company.

5. Release

Artist releases and discharges Company from any and all claims, demands, or liabilities arising out of the permitted use of the submitted music as described herein.

6. Binding Effect

By submitting music through the Lokol Listening Stations submission form and agreeing to these terms, Artist acknowledges that this Agreement is legally binding.

7. Governing Law

This Agreement shall be governed by the laws of the State of Georgia.`;

const LLSMusicRelease = () => {
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    legal_name: "",
    artist_name: "",
    email: "",
    role: "",
    signature_name: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.legal_name || !formData.artist_name || !formData.email || !formData.signature_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!consentChecked) {
      toast.error("You must agree to the terms before signing");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("sign-music-release", {
        body: {
          legal_name: formData.legal_name.trim(),
          artist_name: formData.artist_name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role || null,
          signature_name: formData.signature_name.trim(),
          agreement_text: AGREEMENT_TEXT,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSigned(true);
      toast.success("Agreement signed successfully");
    } catch (err) {
      console.error("Signature error:", err);
      toast.error("Failed to sign agreement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (signed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Agreement Signed Successfully
            </h1>
            <p className="text-muted-foreground mb-2">
              Thank you, <span className="text-foreground font-medium">{formData.legal_name}</span>.
            </p>
            <p className="text-muted-foreground mb-8">
              Your electronic signature for the Lokol Listening Stations Music Release Agreement has been recorded.
              A confirmation will be sent to <span className="text-foreground font-medium">{formData.email}</span>.
            </p>
            <Link to="/submit-song">
              <Button>Submit Your Music</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/submit-song"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          {/* Agreement Display */}
          <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2">
            LOKOL LISTENING SESSIONS
          </h1>
          <h2 className="font-display text-xl md:text-2xl text-foreground mb-8">
            BLANKET ARTIST MUSIC RELEASE AGREEMENT
          </h2>

          <div className="space-y-6 text-muted-foreground leading-relaxed mb-12">
            <p>
              This Music Release Agreement ("Agreement") is entered into by and between Golokol LLC, a Georgia limited liability company ("Company"), and the undersigned submitting artist ("Artist").
            </p>

            <p>
              This Agreement applies to all music submitted by Artist through the Lokol Listening Stations music submission form, including but not limited to the specific artist name and song title(s) provided in that submission.
            </p>

            <p>
              By submitting music and participating in Lokol Listening Stations, Artist agrees to the following:
            </p>

            <div>
              <h3 className="text-foreground font-semibold mb-3">1. Grant of Rights</h3>
              <p className="mb-3">
                Artist hereby grants to Company a non-exclusive, worldwide, perpetual, royalty-free license to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Play and publicly perform the submitted music during Lokol Listening Stations events</li>
                <li>Record, film, and capture such music in audio and audiovisual formats</li>
                <li>Edit, reproduce, distribute, stream, publicly display, and otherwise exploit such recordings in connection with Lokol Listening Stations content</li>
                <li>Use such recordings in promotional materials, social media, digital platforms, websites, and marketing materials related to Lokol Listening Stations</li>
                <li>
                  Exhibit and publicly play the submitted music through curated listening environments, including but not limited to:
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Lokol Listening Stations events</li>
                    <li>Lokol Listening Stations listening stations or kiosks</li>
                    <li>In-store listening installations located in record stores, retail locations, or partner venues</li>
                    <li>Digital listening interfaces associated with Lokol Listening Stations where listeners may preview and vote on music</li>
                  </ul>
                </li>
              </ul>
              <p className="mt-3">
                Such uses may include audio-only playback, audiovisual presentation, and digital listening experiences designed to showcase local artists and allow audiences to discover and vote on music.
              </p>
              <p className="mt-3">
                This grant includes rights in both the master recording and the underlying musical composition to the extent controlled by Artist.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">2. No Compensation</h3>
              <p className="mb-3">Artist acknowledges and agrees that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>No publishing royalties</li>
                <li>No mechanical royalties</li>
                <li>No synchronization fees</li>
                <li>No performance royalties</li>
                <li>No future licensing fees</li>
              </ul>
              <p className="mt-3">
                shall be owed by Company for the uses authorized under this Agreement.
              </p>
              <p className="mt-2">
                Participation in Lokol Listening Stations is voluntary and promotional in nature.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">3. Ownership and Authority</h3>
              <p className="mb-3">Artist represents and warrants that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Artist owns or controls all necessary rights in the submitted music</li>
                <li>All necessary permissions have been obtained from co-writers, producers, or other rights holders</li>
                <li>The submitted music does not infringe upon any third-party rights</li>
              </ul>
              <p className="mt-3">
                Artist agrees to indemnify and hold Company harmless from any claims arising from breach of these representations.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">4. Scope of Use</h3>
              <p className="mb-3">This Agreement applies solely to uses connected to the Lokol Listening Stations ecosystem, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Lokol Listening Stations live events</li>
                <li>Filmed and recorded Lokol Listening Stations content</li>
                <li>Online video and digital media distribution</li>
                <li>In-store listening kiosks and curated music listening installations</li>
                <li>Audience voting and music discovery experiences associated with Lokol Listening Stations</li>
              </ul>
              <p className="mt-3">
                This Agreement does not transfer ownership of the music to Company.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">5. Release</h3>
              <p>
                Artist releases and discharges Company from any and all claims, demands, or liabilities arising out of the permitted use of the submitted music as described herein.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">6. Binding Effect</h3>
              <p>
                By submitting music through the Lokol Listening Stations submission form and agreeing to these terms, Artist acknowledges that this Agreement is legally binding.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">7. Governing Law</h3>
              <p>
                This Agreement shall be governed by the laws of the State of Georgia.
              </p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-t border-border pt-10">
            <h2 className="font-display text-xl md:text-2xl text-foreground mb-8">
              Artist Agreement Signature
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="legal_name" className="text-foreground">
                  Legal Name of Signatory <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="legal_name"
                  placeholder="Your full legal name"
                  value={formData.legal_name}
                  onChange={(e) => handleChange("legal_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist_name" className="text-foreground">
                  Artist Name / Group Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="artist_name"
                  placeholder="Artist or band name"
                  value={formData.artist_name}
                  onChange={(e) => handleChange("artist_name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">
                  Role
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Artist">Artist</SelectItem>
                    <SelectItem value="Band Representative">Band Representative</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Label Representative">Label Representative</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="consent" className="text-foreground text-sm leading-relaxed cursor-pointer">
                  I confirm that I have read and agree to the Lokol Listening Stations Blanket Artist Music Release Agreement and that I have the authority to grant these rights on behalf of the artist or group. <span className="text-red-500">*</span>
                </Label>
              </div>

              {/* Electronic Signature */}
              <div className="space-y-2">
                <Label htmlFor="signature_name" className="text-foreground">
                  Type your legal name to sign <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signature_name"
                  placeholder="Type your full legal name"
                  value={formData.signature_name}
                  onChange={(e) => handleChange("signature_name", e.target.value)}
                  className="font-serif italic text-lg"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  By typing my name above and submitting this form, I acknowledge that this constitutes my electronic signature and that I am legally bound by the terms of this agreement.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full md:w-auto"
              >
                {submitting ? "Signing..." : "Sign Agreement"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSMusicRelease;
