import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Music, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GENRE_OPTIONS = [
  "Hip-Hop",
  "R&B",
  "Neo-Soul",
  "Soul",
  "Funk",
  "Jazz",
  "Blues",
  "Gospel",
  "Reggae",
  "Afrobeats",
  "Latin",
  "Pop",
  "Rock",
  "Indie",
  "Alternative",
  "Electronic",
  "House",
  "Techno",
  "Country",
  "Folk",
  "Punk",
  "Metal",
  "Classical",
  "Spoken-Word",
  "Poetry",
  "Comedy",
  "Other",
];

const CITY_OPTIONS = [
  "Austin",
  "Los Angeles",
  "New York",
  "Nashville",
  "Chicago",
  "Atlanta",
  "Miami",
  "Seattle",
  "Denver",
  "Portland",
  "Houston",
  "Dallas",
  "Philadelphia",
  "Detroit",
  "New Orleans",
  "Other",
];

const formSchema = z.object({
  artist_name: z.string().min(1, "Artist/Band name is required"),
  contact_phone: z.string().min(10, "Valid phone number required"),
  contact_email: z.string().email("Valid email required"),
  title: z.string().min(1, "Event title is required"),
  start_at: z.string().min(1, "Start date/time is required"),
  city: z.string().min(1, "City is required"),
  custom_city: z.string().optional(),
  venue_name: z.string().min(1, "Venue name is required"),
  ticket_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  genres: z.array(z.string()).min(1, "Select at least 1 genre").max(2, "Maximum 2 genres"),
  youtube_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const CreateAfterparty = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canceled = searchParams.get("canceled") === "true";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genres: [],
      city: "",
    },
  });

  const selectedCity = watch("city");
  const selectedGenres = watch("genres") || [];

  const toggleGenre = (genre: string) => {
    const current = selectedGenres;
    if (current.includes(genre)) {
      setValue("genres", current.filter((g) => g !== genre));
    } else if (current.length < 2) {
      setValue("genres", [...current, genre]);
    } else {
      toast.error("Maximum 2 genres allowed");
    }
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    // Prevent double submission
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setCheckoutError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const city = data.city === "Other" && data.custom_city ? data.custom_city : data.city;

      const payload = {
        artist_name: data.artist_name,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        title: data.title,
        start_at: new Date(data.start_at).toISOString(),
        city,
        venue_name: data.venue_name,
        ticket_url: data.ticket_url || undefined,
        genres: data.genres,
        youtube_url: data.youtube_url || undefined,
        image_url: data.image_url || undefined,
      };

      const { data: response, error } = await supabase.functions.invoke(
        "create-afterparty-checkout",
        { body: payload }
      );

      clearTimeout(timeoutId);

      if (error) {
        const errMsg = error.message || "Failed to create checkout session";
        setCheckoutError(errMsg);
        toast.error(errMsg);
        return;
      }

      if (response?.url) {
        window.location.href = response.url;
      } else if (response?.error) {
        setCheckoutError(response.error);
        toast.error(response.error);
      } else {
        setCheckoutError("No checkout URL returned. Please try again.");
        toast.error("No checkout URL returned");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const errMsg = err.name === "AbortError" 
        ? "Request timed out. Please try again."
        : err.message || "Failed to start checkout";
      console.error("Checkout error:", err);
      setCheckoutError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
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

          {canceled && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              Payment was canceled. You can try again below.
            </div>
          )}

          {checkoutError && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <strong>Error:</strong> {checkoutError}
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="rounded-full bg-primary/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Music className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-2">
                CREATE AN <span className="text-primary">AFTER PARTY</span>
              </h1>
              <p className="text-muted-foreground">
                $49 one-time fee to list your event
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-xl bg-gradient-to-br from-background to-primary/5 border border-border p-6 space-y-5">
                <h2 className="font-display text-xl text-foreground border-b border-border pb-3">
                  Artist Info
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="artist_name">Artist / Band Name *</Label>
                  <Input
                    id="artist_name"
                    {...register("artist_name")}
                    placeholder="Your artist or band name"
                  />
                  {errors.artist_name && (
                    <p className="text-sm text-destructive">{errors.artist_name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone *</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      {...register("contact_phone")}
                      placeholder="(555) 123-4567"
                    />
                    {errors.contact_phone && (
                      <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      {...register("contact_email")}
                      placeholder="you@example.com"
                    />
                    {errors.contact_email && (
                      <p className="text-sm text-destructive">{errors.contact_email.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-background to-primary/5 border border-border p-6 space-y-5">
                <h2 className="font-display text-xl text-foreground border-b border-border pb-3">
                  Event Details
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Summer Vibes After Party"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_at">Start Date & Time *</Label>
                  <Input
                    id="start_at"
                    type="datetime-local"
                    {...register("start_at")}
                  />
                  {errors.start_at && (
                    <p className="text-sm text-destructive">{errors.start_at.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <select
                      id="city"
                      {...register("city")}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a city</option>
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  {selectedCity === "Other" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_city">Enter City *</Label>
                      <Input
                        id="custom_city"
                        {...register("custom_city")}
                        placeholder="City name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="venue_name">Venue Name *</Label>
                    <Input
                      id="venue_name"
                      {...register("venue_name")}
                      placeholder="e.g., The Blue Room"
                    />
                    {errors.venue_name && (
                      <p className="text-sm text-destructive">{errors.venue_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket_url">Ticket URL (optional)</Label>
                  <Input
                    id="ticket_url"
                    type="url"
                    {...register("ticket_url")}
                    placeholder="https://tickets.example.com/your-event"
                  />
                  {errors.ticket_url && (
                    <p className="text-sm text-destructive">{errors.ticket_url.message}</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-background to-primary/5 border border-border p-6 space-y-5">
                <h2 className="font-display text-xl text-foreground border-b border-border pb-3">
                  Genre & Media
                </h2>

                <div className="space-y-3">
                  <Label>
                    Genres * <span className="text-muted-foreground">(select up to 2)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_OPTIONS.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedGenres.includes(genre)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  {errors.genres && (
                    <p className="text-sm text-destructive">{errors.genres.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube URL (optional)</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    {...register("youtube_url")}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for event thumbnail
                  </p>
                  {errors.youtube_url && (
                    <p className="text-sm text-destructive">{errors.youtube_url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL (optional)</Label>
                  <Input
                    id="image_url"
                    type="url"
                    {...register("image_url")}
                    placeholder="https://example.com/your-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Fallback if no YouTube URL provided
                  </p>
                  {errors.image_url && (
                    <p className="text-sm text-destructive">{errors.image_url.message}</p>
                  )}
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Continue to Payment — $49"
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
