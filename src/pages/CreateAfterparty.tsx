import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, CalendarIcon, Upload, X, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import golokolLogo from "@/assets/golokol-logo.svg";
import ReviewAfterPartyStep from "@/components/ReviewAfterPartyStep";

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
  "Ska",
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
  "Atlanta",
  "Athens",
];

const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => {
  const hours = Math.floor(i / 4);
  const minutes = (i % 4) * 15;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const label = `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  const value = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  return { label, value };
});

const formSchema = z.object({
  artist_name: z.string().min(1, "Artist/Band name is required"),
  contact_email: z.string().email("Valid email required"),
  title: z.string().min(1, "Event title is required"),
  start_date: z.date({ required_error: "Start date is required" }),
  start_time: z.string().min(1, "Start time is required"),
  city: z.string().min(1, "City is required"),
  venue_name: z.string().min(1, "Venue name is required"),
  ticket_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  genres: z.array(z.string()).min(1, "Select at least 1 genre").max(2, "Maximum 2 genres"),
  youtube_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

const CreateAfterparty = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const canceled = searchParams.get("canceled") === "true";

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genres: [],
      city: "",
    },
    mode: "onChange",
  });

  const selectedGenres = watch("genres") || [];
  const youtubeUrl = watch("youtube_url");
  const imageUrl = watch("image_url");
  
  // Review step confirmation state
  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);

  const toggleGenre = (genre: string) => {
    const current = selectedGenres;
    if (current.includes(genre)) {
      setValue("genres", current.filter((g) => g !== genre), { shouldValidate: true });
    } else if (current.length < 2) {
      setValue("genres", [...current, genre], { shouldValidate: true });
    } else {
      toast.error("Maximum 2 genres allowed");
    }
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  // Step validation - Step 3 only requires genres now
  const step1Fields = ["artist_name", "contact_email"] as const;
  const step2Fields = ["title", "start_date", "start_time", "city", "venue_name"] as const;
  const step3Fields = ["genres"] as const;

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: readonly (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = step1Fields;
    if (step === 2) fieldsToValidate = step2Fields;
    if (step === 3) fieldsToValidate = step3Fields;

    const result = await trigger(fieldsToValidate as (keyof FormData)[]);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      // Reset confirmation when moving to review step
      if (currentStep === 3) {
        setIsReviewConfirmed(false);
      }
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG or PNG image");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 3MB");
      return;
    }

    // Clear any previous URL input
    setValue("image_url", "");
    setUploadError(null);

    // Create preview URL
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setFilePreviewUrl(null);
    setSelectedFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setCheckoutError(null);
    setUploadError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Combine date and time into a single ISO string
      const startDate = data.start_date;
      const [hours, minutes] = data.start_time.split(":").map(Number);
      startDate.setHours(hours, minutes, 0, 0);

      // Build payload - only include image_url if using URL input (not file upload)
      const payload = {
        artist_name: data.artist_name,
        contact_email: data.contact_email,
        title: data.title,
        start_at: startDate.toISOString(),
        city: data.city,
        venue_name: data.venue_name,
        ticket_url: data.ticket_url || undefined,
        genres: data.genres,
        youtube_url: data.youtube_url || undefined,
        image_url: (!selectedFile && data.image_url) ? data.image_url : undefined,
      };

      // Create event via create-afterparty-checkout
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

      const eventId = response?.event_id;
      const checkoutUrlResponse = response?.url;

      // If file selected, attempt upload (NON-BLOCKING)
      if (selectedFile && eventId) {
        setIsUploading(true);

        try {
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
            // Show error but DON'T block checkout
            setUploadError("Flyer upload failed. You can add it later.");
            toast.error("Flyer upload failed, but you can still complete payment.");
          }
        } catch {
          setUploadError("Flyer upload failed. You can add it later.");
          toast.error("Flyer upload failed, but you can still complete payment.");
        }

        setIsUploading(false);
      }

      // Always redirect to Stripe checkout (even if upload failed)
      if (checkoutUrlResponse) {
        const newWindow = window.open(checkoutUrlResponse, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          setCheckoutUrl(checkoutUrlResponse);
          toast.error("Popup blocked — please allow popups or use the link below");
        } else {
          toast.success("Stripe Checkout opened in new tab");
        }
      } else if (response?.error) {
        setCheckoutError(response.error);
        toast.error(response.error);
      } else {
        setCheckoutError("No checkout URL returned. Please try again.");
        toast.error("No checkout URL returned");
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const errMsg = err instanceof Error && err.name === "AbortError" 
        ? "Request timed out. Please try again."
        : err instanceof Error ? err.message : "Failed to start checkout";
      console.error("Checkout error:", err);
      setCheckoutError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-sans font-semibold transition-colors ${
              step === currentStep
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                : step < currentStep
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground border border-muted-foreground/30"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div
              className={`w-8 h-1 mx-1 rounded ${
                step < currentStep ? "bg-primary" : "bg-muted/30"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Artist Info</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">Tell us about yourself</p>
      </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="artist_name" className="text-primary-foreground text-base font-sans">Artist / Band Name *</Label>
            <Input
              id="artist_name"
              {...register("artist_name")}
              placeholder="Your artist or band name"
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
            {errors.artist_name && (
              <p className="text-sm text-destructive font-sans">{errors.artist_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email" className="text-primary-foreground text-base font-sans">Contact Email *</Label>
            <Input
              id="contact_email"
              type="email"
              {...register("contact_email")}
              placeholder="you@example.com"
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
            {errors.contact_email && (
              <p className="text-sm text-destructive font-sans">{errors.contact_email.message}</p>
            )}
          </div>
        </div>
    </div>
  );

  const renderStep2 = () => {
    const selectedDate = watch("start_date");
    const selectedTime = watch("start_time");

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl text-primary-foreground">Event Details</h2>
          <p className="text-primary-foreground/70 text-base font-sans mt-1">Where and when is it happening?</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-primary-foreground text-base font-sans">Event Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g., Summer Vibes After Party"
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
            {errors.title && (
              <p className="text-sm text-destructive font-sans">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-primary-foreground text-base font-sans">Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-14 w-full justify-start text-left font-sans text-base bg-background text-foreground border-primary-foreground/50 hover:bg-background/90",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setValue("start_date", date as Date, { shouldValidate: true })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.start_date && (
                <p className="text-sm text-destructive font-sans">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-primary-foreground text-base font-sans">Start Time *</Label>
              <select
                value={selectedTime || ""}
                onChange={(e) => setValue("start_time", e.target.value, { shouldValidate: true })}
                className="flex h-14 w-full rounded-md border border-primary-foreground/50 bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">Select time</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
              {errors.start_time && (
                <p className="text-sm text-destructive font-sans">{errors.start_time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-primary-foreground text-base font-sans">City *</Label>
            <select
              id="city"
              {...register("city")}
              className="flex h-14 w-full rounded-md border border-primary-foreground/50 bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="">Select a city</option>
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-destructive font-sans">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_name" className="text-primary-foreground text-base font-sans">Venue Name *</Label>
            <Input
              id="venue_name"
              {...register("venue_name")}
              placeholder="e.g., The Blue Room"
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
            {errors.venue_name && (
              <p className="text-sm text-destructive font-sans">{errors.venue_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket_url" className="text-primary-foreground text-base font-sans">Ticket URL (optional)</Label>
            <Input
              id="ticket_url"
              type="url"
              {...register("ticket_url")}
              placeholder="https://tickets.example.com/your-event"
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
            {errors.ticket_url && (
              <p className="text-sm text-destructive font-sans">{errors.ticket_url.message}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Genre & Media</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">Help fans discover your event</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-primary-foreground text-base font-sans">
            Genres * <span className="text-primary-foreground/60">(select up to 2)</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-2 rounded-full text-sm font-sans font-medium transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-background text-foreground ring-2 ring-background"
                    : "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
          {errors.genres && (
            <p className="text-sm text-destructive font-sans">{errors.genres.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube_url" className="text-primary-foreground text-base font-sans">YouTube URL (optional)</Label>
          <Input
            id="youtube_url"
            type="url"
            {...register("youtube_url")}
            placeholder="https://youtube.com/watch?v=..."
            className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
          />
          <p className="text-sm text-primary-foreground/60 font-sans">
            Used for event thumbnail
          </p>
          {errors.youtube_url && (
            <p className="text-sm text-destructive font-sans">{errors.youtube_url.message}</p>
          )}
        </div>

        {/* Flyer Upload Section */}
        <div className="space-y-3">
          <Label className="text-primary-foreground text-base font-sans">
            Upload Show Flyer <span className="text-primary-foreground/60">(recommended)</span>
          </Label>
          
          {!selectedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary-foreground/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary-foreground/50 transition-colors bg-primary-foreground/5"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-primary-foreground/60" />
              <p className="text-primary-foreground font-sans text-sm">Click to upload or drag & drop</p>
              <p className="text-primary-foreground/60 text-xs font-sans mt-1">JPG/PNG · max 3MB</p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-primary-foreground/10 p-3">
              <div className="flex items-center gap-3">
                {filePreviewUrl && (
                  <img
                    src={filePreviewUrl}
                    alt="Flyer preview"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-primary-foreground font-sans text-sm truncate">{selectedFile.name}</p>
                  <p className="text-primary-foreground/60 text-xs font-sans">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-primary-foreground/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-primary-foreground" />
                </button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploadError && (
            <p className="text-sm text-destructive font-sans">{uploadError}</p>
          )}
        </div>

        {/* Advanced: Image URL (collapsed) */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors font-sans">
            <ChevronDown className={cn("w-4 h-4 transition-transform", isAdvancedOpen && "rotate-180")} />
            Image URL (advanced)
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <Input
              id="image_url"
              type="url"
              {...register("image_url")}
              placeholder="https://example.com/your-flyer.jpg"
              disabled={!!selectedFile}
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground disabled:opacity-50"
            />
            {selectedFile && (
              <p className="text-xs text-primary-foreground/60 font-sans mt-1">
                Remove uploaded file to use URL instead
              </p>
            )}
            {errors.image_url && (
              <p className="text-sm text-destructive font-sans">{errors.image_url.message}</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const formValues = watch();
    return (
      <ReviewAfterPartyStep
        formData={{
          artist_name: formValues.artist_name || "",
          contact_email: formValues.contact_email || "",
          title: formValues.title || "",
          start_date: formValues.start_date || new Date(),
          start_time: formValues.start_time || "",
          city: formValues.city || "",
          venue_name: formValues.venue_name || "",
          ticket_url: formValues.ticket_url,
          genres: formValues.genres || [],
          youtube_url: formValues.youtube_url,
          image_url: filePreviewUrl || formValues.image_url || "",
        }}
        isConfirmed={isReviewConfirmed}
        onConfirmChange={setIsReviewConfirmed}
      />
    );
  };

  const renderNavButtons = () => (
    <div className="flex justify-end gap-3 mt-8">
      {currentStep > 1 && (
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="h-11 px-6 font-display font-bold text-base bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      )}
      
      {currentStep < 4 ? (
        <Button
          type="button"
          onClick={handleNext}
          className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          disabled={isSubmitting || isUploading || !isReviewConfirmed}
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading..." : "Processing..."}
            </>
          ) : (
            "Pay — $11.99"
          )}
        </Button>
      )}
    </div>
  );

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

          {checkoutUrl && (
            <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-foreground mb-2">Popup was blocked. Click below to continue to Stripe Checkout:</p>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                Open Stripe Checkout →
              </a>
            </div>
          )}

          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <img src={golokolLogo} alt="GoLokol" className="h-12 w-12" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-1">
                CREATE AN <span className="text-primary">AFTER PARTY</span>
              </h1>
              <p className="text-muted-foreground text-base font-sans">
                $11.99 per party. No Subscription.
              </p>
              <p className="text-muted-foreground text-sm font-sans mt-1">
                Promote your show and Afterparty.
              </p>
            </div>

            <p className="text-center text-base font-sans text-muted-foreground mb-6">
              Step {currentStep} of 4
            </p>

            {renderStepIndicator()}

            <div className="bg-primary rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {renderNavButtons()}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateAfterparty;
