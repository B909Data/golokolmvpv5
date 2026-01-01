import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Music, Upload, User, Link as LinkIcon, FileAudio, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SubmitSong = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    artistName: "",
    songTitle: "",
    genre: "",
    streamingLink: "",
    bio: "",
    email: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "Song Submitted!",
      description: "We'll review your submission and get back to you soon.",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-6">
                <Music className="h-8 w-8 text-accent" />
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
                SUBMIT A <span className="text-accent">LISTENING</span> SESSION
              </h1>
              <p className="text-muted-foreground text-lg">
                Your musc, get feedback and featured at the next Lokol Listening Sessions event. One Artist, One Song.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-border p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
                <div className="relative z-10 space-y-6">
                  {/* Artist Name */}
                  <div className="space-y-2">
                    <Label htmlFor="artistName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-accent" />
                      Artist / Band Name
                    </Label>
                    <Input
                      id="artistName"
                      placeholder="Your artist or band name"
                      value={formData.artistName}
                      onChange={(e) => handleChange("artistName", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  {/* Song Title */}
                  <div className="space-y-2">
                    <Label htmlFor="songTitle" className="flex items-center gap-2">
                      <FileAudio className="h-4 w-4 text-accent" />
                      Song Title
                    </Label>
                    <Input
                      id="songTitle"
                      placeholder="Name of your track"
                      value={formData.songTitle}
                      onChange={(e) => handleChange("songTitle", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      placeholder="e.g., Indie Rock, Hip-Hop, Electronic"
                      value={formData.genre}
                      onChange={(e) => handleChange("genre", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>

                  {/* Streaming Link */}
                  <div className="space-y-2">
                    <Label htmlFor="streamingLink" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-accent" />
                      Streaming Link
                    </Label>
                    <Input
                      id="streamingLink"
                      type="url"
                      placeholder="Spotify, SoundCloud, YouTube, etc."
                      value={formData.streamingLink}
                      onChange={(e) => handleChange("streamingLink", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Link to your song on any major streaming platform</p>
                  </div>

                  {/* Song Image Upload */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-accent" />
                      Upload Song Img (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                      <Image className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">Click to upload or drag and drop</p>
                      <p className="text-muted-foreground text-xs mt-1">1MB max</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">About the Track</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your song, inspiration, or anything you'd like listeners to know..."
                      value={formData.bio}
                      onChange={(e) => handleChange("bio", e.target.value)}
                      className="bg-secondary border-border min-h-[100px]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                    <p className="text-xs text-muted-foreground">We'll use this to notify you about your submission</p>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                SUBMIT SONG
                <Music className="h-5 w-5" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By submitting, you confirm that you have the rights to this music and agree to our terms.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubmitSong;
