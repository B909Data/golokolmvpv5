import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Music, Tag, User, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { z } from "zod";

const genres = [
  "Indie Rock",
  "Jazz",
  "Electronic",
  "Acoustic",
  "Punk",
  "Hip-Hop",
  "R&B",
  "Metal",
  "Folk",
  "Pop",
  "Other",
];

// Placeholder artists - in production this would come from Airtable
const artists = [
  "The Velvet Sounds",
  "Echo Chamber",
  "Moonlight Drive",
  "The Smooth Quartet",
  "Sarah Miles Trio",
  "DJ Synthwave",
  "Binary Code",
  "Neon Dreams",
];

const eventSchema = z.object({
  artist: z.string().min(1, "Please select an artist"),
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  venue: z.string().trim().min(1, "Venue is required").max(200, "Venue must be less than 200 characters"),
  dateTime: z.string().min(1, "Date and time is required"),
  genre: z.string().min(1, "Please select a genre"),
});

const CreateAfterparty = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    artist: "",
    title: "",
    venue: "",
    dateTime: "",
    genre: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data
    const result = eventSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("create-event", {
        body: {
          artist: formData.artist,
          title: formData.title.trim(),
          venue: formData.venue.trim(),
          dateTime: formData.dateTime,
          genre: formData.genre,
        },
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Event Created!",
        description: "Your afterparty has been submitted as a draft.",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl text-foreground mb-4">
              EVENT CREATED!
            </h1>
            <p className="text-muted-foreground mb-6">
              Your afterparty has been saved as a draft. A shareable link will be available once the event is live.
            </p>
            <div className="rounded-xl border border-border bg-card p-4 mb-6 gradient-card">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> To appear in the public feed, set <span className="text-primary font-medium">status</span> to "live" and <span className="text-primary font-medium">is_public</span> to "true" in the admin table.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({ artist: "", title: "", venue: "", dateTime: "", genre: "" });
                }}
              >
                Create Another Event
              </Button>
              <Link to="/shows">
                <Button variant="outline" className="w-full">
                  View All Shows
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
                CREATE AN <span className="text-primary">AFTERPARTY</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Set up your event and let the community know about your show
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-border p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
                <div className="relative z-10 space-y-6">
                  {/* Artist Select */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Artist
                    </Label>
                    <Select onValueChange={(value) => handleChange("artist", value)} value={formData.artist}>
                      <SelectTrigger className={`bg-secondary border-border ${errors.artist ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select an artist" />
                      </SelectTrigger>
                      <SelectContent>
                        {artists.map((artist) => (
                          <SelectItem key={artist} value={artist}>
                            {artist}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.artist && <p className="text-sm text-destructive">{errors.artist}</p>}
                  </div>

                  {/* Event Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-primary" />
                      Event Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Midnight Groove Session"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className={`bg-secondary border-border ${errors.title ? 'border-destructive' : ''}`}
                      maxLength={200}
                    />
                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                  </div>

                  {/* Venue */}
                  <div className="space-y-2">
                    <Label htmlFor="venue" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Venue
                    </Label>
                    <Input
                      id="venue"
                      placeholder="e.g., The Basement"
                      value={formData.venue}
                      onChange={(e) => handleChange("venue", e.target.value)}
                      className={`bg-secondary border-border ${errors.venue ? 'border-destructive' : ''}`}
                      maxLength={200}
                    />
                    {errors.venue && <p className="text-sm text-destructive">{errors.venue}</p>}
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-2">
                    <Label htmlFor="dateTime" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Date & Time
                    </Label>
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      value={formData.dateTime}
                      onChange={(e) => handleChange("dateTime", e.target.value)}
                      className={`bg-secondary border-border ${errors.dateTime ? 'border-destructive' : ''}`}
                    />
                    {errors.dateTime && <p className="text-sm text-destructive">{errors.dateTime}</p>}
                  </div>

                  {/* Genre */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Genre
                    </Label>
                    <Select onValueChange={(value) => handleChange("genre", value)} value={formData.genre}>
                      <SelectTrigger className={`bg-secondary border-border ${errors.genre ? 'border-destructive' : ''}`}>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.genre && <p className="text-sm text-destructive">{errors.genre}</p>}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "CREATE EVENT"
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateAfterparty;
