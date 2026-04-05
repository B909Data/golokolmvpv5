import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Music, User, FileAudio, Phone, Instagram, Upload, Lock } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link as LinkIcon } from "lucide-react";

const SubmitCurated = () => {
  const navigate = useNavigate();
  const submittingRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [musicReleaseAgreed, setMusicReleaseAgreed] = useState(false);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [formData, setFormData] = useState({
    artist_name: "",
    contact_email: "",
    phone: "",
    instagram_handle: "",
    song_title: "",
    youtube_url: "",
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "audio/mpeg") {
      toast.error("Only MP3 files are accepted.");
      e.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20MB.");
      e.target.value = "";
      return;
    }
    setMp3File(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      toast.error("Please enter your invite code.");
      return;
    }
    if (!formData.artist_name || !formData.contact_email || !formData.phone || !formData.song_title) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!mp3File) {
      toast.error("Please upload an MP3 file.");
      return;
    }
    if (!musicReleaseAgreed) {
      toast.error("You must agree to the Music Release Agreement.");
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      // 1. Validate the code
      const { data: validateData, error: validateError } = await supabase.functions.invoke("validate-curated-code", {
        body: { code: inviteCode.trim() },
      });

      if (validateError) throw validateError;

      if (!validateData.valid) {
        toast.error(validateData.error || "Invalid invite code.");
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // 2. Redeem the code
      const { data: redeemData, error: redeemError } = await supabase.functions.invoke("redeem-curated-code", {
        body: { code: inviteCode.trim().toUpperCase(), email: formData.contact_email },
      });

      if (redeemError) throw redeemError;

      if (!redeemData.success) {
        toast.error(redeemData.error || "Failed to redeem code.");
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // 3. Upload MP3
      const submissionId = crypto.randomUUID();
      const sanitizedArtist = formData.artist_name
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const sanitizedName = mp3File.name
        .toLowerCase()
        .replace(/\.mp3$/i, "")
        .replace(/[^a-z0-9\-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        + ".mp3";

      const now = new Date();
      const monthFolder = `LLS-${now.toLocaleString("en-US", { month: "long" })}-${now.getFullYear()}`;
      const objectPath = `lls_curated/${monthFolder}/${sanitizedArtist}--${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("submissions_audio")
        .upload(objectPath, mp3File, {
          contentType: "audio/mpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        toast.error(`Upload failed: ${uploadError.message}`);
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      // 4. Get public URL
      const { data: urlData } = supabase.storage
        .from("submissions_audio")
        .getPublicUrl(objectPath);

      // 5. Insert submission
      const { error: insertError } = await supabase
        .from("curated_submissions")
        .insert({
          id: submissionId,
          artist_name: formData.artist_name,
          contact_email: formData.contact_email,
          phone: formData.phone,
          instagram_handle: formData.instagram_handle || null,
          song_title: formData.song_title,
          spotify_url: "curated-submission",
          mp3_url: urlData.publicUrl,
          mp3_path: objectPath,
          original_filename: mp3File.name,
          status: "Unreviewed",
          music_release_agreed: true,
          music_release_agreed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("DB insert error:", insertError);
        await supabase.storage.from("submissions_audio").remove([objectPath]).catch(() => {});
        toast.error(`Submission failed: ${insertError.message}`);
        submittingRef.current = false;
        setIsSubmitting(false);
        return;
      }

      navigate("/songs/success?type=curated");
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error(err?.message || "Failed to submit. Please try again.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/songs" className="inline-flex items-center gap-2 text-[hsl(0,0%,40%)] hover:text-[hsl(0,0%,10%)] transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Listening Sessions
          </Link>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 rounded-lg overflow-hidden">
              <AspectRatio ratio={16 / 9}>
                <iframe
                  src="https://www.youtube.com/embed/2exJWgcJRlA"
                  title="Lokol Listening Stations"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </AspectRatio>
            </div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[hsl(0,0%,85%)] mb-6">
                <Music className="h-8 w-8 text-[hsl(0,0%,10%)]" />
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-[hsl(0,0%,10%)] mb-4">
                LOKOL LISTENING SESSIONS <span className="text-[hsl(0,0%,30%)]">SUBMISSION</span>
              </h1>
              <p className="text-[hsl(0,0%,40%)] text-lg">Submit your music for the next Lokol Listening Stations event. One Artist, One Song.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Invite Code */}
              <div className="rounded-xl border-2 border-[hsl(50,100%,50%)] p-6 bg-white">
                <div className="space-y-2">
                  <Label htmlFor="invite_code" className="flex items-center gap-2 text-[hsl(0,0%,10%)] font-semibold">
                    <Lock className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Invite Code *
                  </Label>
                  <Input
                    id="invite_code"
                    placeholder="Enter your invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] uppercase"
                    required
                  />
                  <p className="text-xs text-[hsl(0,0%,50%)]">You need a valid invite code to submit.</p>
                </div>
              </div>

              {/* Main form fields */}
              <div className="rounded-xl border border-[hsl(0,0%,80%)] p-6 relative overflow-hidden bg-white">
                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="artist_name" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><User className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Artist / Band Name *</Label>
                    <Input id="artist_name" placeholder="Your artist or band name" value={formData.artist_name} onChange={(e) => handleChange("artist_name", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-[hsl(0,0%,10%)]">Contact Email *</Label>
                    <Input id="contact_email" type="email" placeholder="your@email.com" value={formData.contact_email} onChange={(e) => handleChange("contact_email", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><Phone className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Phone (used only if selected) *</Label>
                    <Input id="phone" type="tel" placeholder="(555) 555-5555" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_handle" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><Instagram className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Instagram Handle</Label>
                    <Input id="instagram_handle" placeholder="@yourhandle" value={formData.instagram_handle} onChange={(e) => handleChange("instagram_handle", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="song_title" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><FileAudio className="h-4 w-4 text-[hsl(0,0%,30%)]" /> Song Title *</Label>
                    <Input id="song_title" placeholder="Name of your track" value={formData.song_title} onChange={(e) => handleChange("song_title", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mp3_upload" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><Upload className="h-4 w-4 text-[hsl(0,0%,30%)]" /> MP3 Upload *</Label>
                    <Input id="mp3_upload" type="file" accept="audio/mpeg,.mp3" onChange={handleMp3Change} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-[hsl(0,0%,85%)] file:text-[hsl(0,0%,10%)]" required />
                    <p className="text-xs text-[hsl(0,0%,50%)]">MP3 only, max 20MB</p>
                    {mp3File && <p className="text-xs text-[hsl(0,0%,40%)]">Selected: {mp3File.name} ({(mp3File.size / (1024 * 1024)).toFixed(1)}MB)</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className="flex items-center gap-2 text-[hsl(0,0%,10%)]"><LinkIcon className="h-4 w-4 text-[hsl(0,0%,30%)]" /> YouTube Channel URL</Label>
                    <Input id="youtube_url" type="url" placeholder="https://youtube.com/@yourchannel" value={formData.youtube_url} onChange={(e) => handleChange("youtube_url", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[hsl(0,0%,10%)]">Notes (optional)</Label>
                    <Textarea id="notes" placeholder="Anything else you'd like us to know..." value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} className="bg-[hsl(60,10%,95%)] border-[hsl(0,0%,80%)] text-[hsl(0,0%,10%)] min-h-[100px]" />
                  </div>
                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox id="music_release" checked={musicReleaseAgreed} onCheckedChange={(checked) => setMusicReleaseAgreed(checked === true)} className="mt-0.5" />
                    <Label htmlFor="music_release" className="text-[hsl(0,0%,10%)] text-sm leading-relaxed cursor-pointer">
                      I agree to the{" "}
                      <Link to="/lls-music-release" target="_blank" className="underline hover:text-[hsl(0,0%,30%)]">Blanket Artist Music Release Agreement</Link>{" "}
                      and grant GoLokol the right to use my submitted music for Lokol Listening Stations. *
                    </Label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                  {isSubmitting ? "Submitting..." : "Submit Song"}
                </Button>
                <p className="text-xs text-[hsl(0,0%,50%)] mt-3">
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

export default SubmitCurated;
