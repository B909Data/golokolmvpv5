import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Music, Tag, Image, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const CreateAfterparty = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    address: "",
    date: "",
    time: "",
    genre: "",
    description: "",
    capacity: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Placeholder submission
    toast({
      title: "Event Created!",
      description: "Your afterparty has been submitted for review.",
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
              <div className="rounded-xl border border-border bg-card p-6 gradient-card space-y-6">
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
                    className="bg-secondary border-border"
                    required
                  />
                </div>

                {/* Venue */}
                <div className="space-y-2">
                  <Label htmlFor="venue" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Venue Name
                  </Label>
                  <Input
                    id="venue"
                    placeholder="e.g., The Basement"
                    value={formData.venue}
                    onChange={(e) => handleChange("venue", e.target.value)}
                    className="bg-secondary border-border"
                    required
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Venue Address</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street, City"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Time
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      className="bg-secondary border-border"
                      required
                    />
                  </div>
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Genre
                  </Label>
                  <Select onValueChange={(value) => handleChange("genre", value)} required>
                    <SelectTrigger className="bg-secondary border-border">
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
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <Label htmlFor="capacity">Expected Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.capacity}
                    onChange={(e) => handleChange("capacity", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Event Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell people what to expect at your event..."
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    className="bg-secondary border-border min-h-[120px]"
                  />
                </div>

                {/* Cover Image Placeholder */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-primary" />
                    Cover Image
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                    <Image className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="hero" size="xl" className="w-full">
                CREATE EVENT
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
