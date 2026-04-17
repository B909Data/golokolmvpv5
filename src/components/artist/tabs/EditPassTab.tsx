import { useState, useRef } from "react";
import { Save, Upload, X, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const US_CITIES = [
  "Albuquerque", "Anchorage", "Atlanta", "Austin", "Baltimore",
  "Birmingham", "Boise", "Boston", "Buffalo", "Charlotte",
  "Chicago", "Cincinnati", "Cleveland", "Colorado Springs", "Columbus",
  "Dallas", "Denver", "Des Moines", "Detroit", "El Paso",
  "Fort Worth", "Fresno", "Honolulu", "Houston", "Indianapolis",
  "Jacksonville", "Kansas City", "Las Vegas", "Long Beach", "Los Angeles",
  "Louisville", "Memphis", "Mesa", "Miami", "Milwaukee",
  "Minneapolis", "Nashville", "New Orleans", "New York", "Newark",
  "Oakland", "Oklahoma City", "Omaha", "Orlando", "Philadelphia",
  "Phoenix", "Pittsburgh", "Portland", "Raleigh", "Richmond",
  "Sacramento", "Salt Lake City", "San Antonio", "San Diego", "San Francisco",
  "San Jose", "Seattle", "St. Louis", "Tampa", "Tucson",
  "Tulsa", "Virginia Beach", "Washington D.C.",
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const displayHours = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const label = `${displayHours}:00 ${ampm}`;
  const value = `${i.toString().padStart(2, "0")}:00`;
  return { label, value };
});

const GENRE_OPTIONS = ["Hip Hop", "RnB", "Alternative", "Hardcore + Punk"];

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

interface EditPassTabProps {
  eventId: string;
  token: string | null;
  artistName: string;
  city: string | null;
  venueName: string | null;
  startAt: string;
  ticketUrl: string | null;
  imageUrl: string | null;
  youtubeUrl: string | null;
  genres: string[] | null;
  title: string;
  onUpdate: () => void;
}

const EditPassTab = ({
  eventId,
  token,
  artistName: initialArtistName,
  city: initialCity,
  venueName: initialVenue,
  startAt,
  ticketUrl: initialTicketUrl,
  imageUrl: initialImageUrl,
  youtubeUrl: initialYoutubeUrl,
  genres: initialGenres,
  title: initialTitle,
  onUpdate,
}: EditPassTabProps) => {
  const [saving, setSaving] = useState(false);
  const [artistName, setArtistName] = useState(initialArtistName);
  const [title, setTitle] = useState(initialTitle);
  const [city, setCity] = useState(initialCity || "");
  const [venueName, setVenueName] = useState(initialVenue || "");
  const [ticketUrl, setTicketUrl] = useState(initialTicketUrl || "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialYoutubeUrl || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres || []);

  // Date/time from startAt
  const startDate = new Date(startAt);
  const [eventDate, setEventDate] = useState<Date>(startDate);
  const [eventTime, setEventTime] = useState(
    `${startDate.getHours().toString().padStart(2, "0")}:00`
  );

  // Flyer upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < 2) {
      setSelectedGenres([...selectedGenres, genre]);
    } else {
      toast.error("Maximum 2 genres allowed");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG or PNG image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 3MB");
      return;
    }
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setFilePreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Combine date + time
      const combined = new Date(eventDate);
      const [hours] = eventTime.split(":").map(Number);
      combined.setHours(hours, 0, 0, 0);

      const { error } = await supabase.functions.invoke("artist-update-event", {
        body: {
          event_id: eventId,
          token: token || undefined,
          artist_name: artistName,
          title,
          city,
          venue_name: venueName,
          start_at: combined.toISOString(),
          ticket_url: ticketUrl || null,
          youtube_url: youtubeUrl || null,
          genres: selectedGenres,
        },
      });
      if (error) throw error;

      // Upload flyer if new file selected
      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        const { error: uploadErr } = await supabase.functions.invoke(
          "afterparty-upload-flyer",
          {
            body: {
              event_id: eventId,
              file_base64: base64,
              content_type: selectedFile.type,
              filename: selectedFile.name,
            },
          }
        );
        if (uploadErr) {
          toast.error("Flyer upload failed, other changes saved.");
        } else {
          setSelectedFile(null);
          if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
          setFilePreviewUrl(null);
        }
      }

      toast.success("Pass updated — fans will see changes immediately");
      onUpdate();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 rounded-xl p-5 space-y-5">
        <h3 className="font-display text-lg text-primary uppercase tracking-tight">
          Edit Fan Pass Details
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Changes update the fan-facing pass in real time. Purchased passes remain valid.
        </p>

        {/* Artist Name */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">Artist / Band Name</Label>
          <Input
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Event Title */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">Name of Event</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional"
            className="bg-background border-border"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-foreground text-sm font-sans font-medium">Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-sans bg-background border-border",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "MMM d, yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={(d) => d && setEventDate(d)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground text-sm font-sans font-medium">Start Time</Label>
            <select
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">City</Label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Select a city</option>
            {US_CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Venue Name */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">Venue Name</Label>
          <Input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="bg-background border-border"
          />
        </div>

        {/* Buy Ticket URL */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">Buy Ticket URL (Optional)</Label>
          <Input
            value={ticketUrl}
            onChange={(e) => setTicketUrl(e.target.value)}
            placeholder="https://..."
            className="bg-background border-border"
          />
        </div>

        {/* YouTube URL */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">YouTube URL (Optional)</Label>
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="bg-background border-border"
          />
        </div>

        {/* Genres */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">
            Genres <span className="text-muted-foreground">(up to 2)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Flyer Upload */}
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-sans font-medium">Flyer Image</Label>
          {initialImageUrl && !selectedFile && (
            <div className="flex items-center gap-3 mb-2">
              <img
                src={initialImageUrl}
                alt="Current flyer"
                className="w-16 h-16 object-cover rounded-lg border border-border"
              />
              <span className="text-sm text-muted-foreground font-sans">Current flyer</span>
            </div>
          )}
          {selectedFile ? (
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
              {filePreviewUrl && (
                <img src={filePreviewUrl} alt="New flyer" className="w-16 h-16 object-cover rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm truncate font-sans">{selectedFile.name}</p>
                <p className="text-muted-foreground text-xs font-sans">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button type="button" onClick={handleRemoveFile} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
              <p className="text-foreground text-sm font-sans">Upload new flyer</p>
              <p className="text-muted-foreground text-xs font-sans mt-1">JPG/PNG · max 3MB, 4:3 ratio</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditPassTab;
