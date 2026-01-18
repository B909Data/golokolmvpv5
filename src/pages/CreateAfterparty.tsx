import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
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
  "Afrobeats",
  "Alternative",
  "Beats",
  "Blues",
  "Classical",
  "Comedy",
  "Country",
  "Electronic",
  "Folk",
  "Funk",
  "Gospel",
  "Hip-Hop",
  "House",
  "Indie",
  "Jazz",
  "Latin",
  "Metal",
  "Neo-Soul",
  "Other",
  "Poetry",
  "Pop",
  "Punk",
  "R&B",
  "Reggae",
  "Rock",
  "Singer-Songwriter",
  "Ska",
  "Soul",
  "Spoken-Word",
  "Techno",
];

// Cities now fetched from database

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const displayHours = i === 0 ? 12 : i > 12 ? i - 12 : i;
  const label = `${displayHours}:00 ${ampm}`;
  const value = `${i.toString().padStart(2, "0")}:00`;
  return { label, value };
});

const formSchema = z.object({
  artist_name: z.string().min(1, "Artist/Band name is required"),
  // contact_email is now handled separately via confirmationEmail state (not form-validated)
  contact_email: z.string().optional(),
  // Curator/Event Series selection - now optional text in Step 2
  curator_id: z.string().optional(),
  curator_other_name: z.string().optional(),
  // Event title - now optional text input
  title: z.string().optional(),
  start_date: z.date({ required_error: "Start date is required" }),
  start_time: z.string().min(1, "Start time is required"),
  city: z.string().min(1, "City is required"),
  // Venue selection
  venue_id: z.string().optional(),
  venue_other_name: z.string().optional(),
  venue_name: z.string().min(1, "Venue name is required"),
  ticket_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  genres: z.array(z.string()).min(1, "Select at least 1 genre").max(2, "Maximum 2 genres"),
  youtube_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface Partner {
  id: string;
  name: string;
  type: "curator" | "venue";
  active: boolean;
  flyer_image_url?: string | null;
  city_id?: string | null;
}

interface City {
  id: string;
  name: string;
  active: boolean;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

const CreateAfterparty = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountCodeError, setDiscountCodeError] = useState<string | null>(null);
  const [discountValidation, setDiscountValidation] = useState<{
    valid: boolean;
    type: string | null;
    checking: boolean;
  }>({ valid: false, type: null, checking: false });
  
  // Step 4 curator selection (for discount code purposes)
  const [step4CuratorId, setStep4CuratorId] = useState<string>("none");
  
  // Confirmation email state (optional, for MailerLite)
  const [confirmationEmail, setConfirmationEmail] = useState<string>("");
  const [emailSentConfirmation, setEmailSentConfirmation] = useState<boolean>(false);

  // Partners and cities state
  const [partners, setPartners] = useState<Partner[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(true);
  
  // Curator flyer auto-populated state
  const [curatorFlyerUrl, setCuratorFlyerUrl] = useState<string | null>(null);

  // Scroll to top on page load and fetch partners + cities
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchData = async () => {
      try {
        const [partnersRes, citiesRes] = await Promise.all([
          supabase.from("partners").select("*").eq("active", true).order("name"),
          supabase.from("cities").select("*").eq("active", true).order("name"),
        ]);
        
        if (partnersRes.error) throw partnersRes.error;
        if (citiesRes.error) throw citiesRes.error;
        
        setPartners(partnersRes.data || []);
        setCities(citiesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setPartnersLoading(false);
      }
    };
    
    fetchData();
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
      curator_id: "",
      curator_other_name: "",
      venue_id: "",
      venue_other_name: "",
    },
    mode: "onChange",
  });

  const selectedGenres = watch("genres") || [];
  const selectedCity = watch("city");
  const youtubeUrl = watch("youtube_url");
  const imageUrl = watch("image_url");
  const curatorId = watch("curator_id");
  const venueId = watch("venue_id");
  
  // Filter partners by selected city
  const selectedCityId = cities.find(c => c.name === selectedCity)?.id;
  const curators = partners.filter((p) => p.type === "curator" && (!selectedCityId || p.city_id === selectedCityId));
  const venues = partners.filter((p) => p.type === "venue" && (!selectedCityId || p.city_id === selectedCityId));

  
  // Review step confirmation state
  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  
  // Confirmation email validation (computed)
  const isEmailValid = confirmationEmail.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmationEmail);

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

  // Validate discount code (including expiration check for partner codes)
  const validateDiscountCode = async (code: string) => {
    // Clear previous error
    setDiscountCodeError(null);
    
    if (!code.trim()) {
      setDiscountValidation({ valid: false, type: null, checking: false });
      return;
    }

    setDiscountValidation({ valid: false, type: null, checking: true });

    try {
      const { data, error } = await supabase
        .from("afterparty_discount_codes")
        .select("discount_type, used_at, expires_at")
        .eq("code", code.toUpperCase())
        .single();

      if (error || !data) {
        setDiscountValidation({ valid: false, type: null, checking: false });
        setDiscountCodeError("Invalid code");
        return;
      }

      if (data.used_at) {
        setDiscountValidation({ valid: false, type: null, checking: false });
        setDiscountCodeError("This code has already been used");
        return;
      }

      // Check expiration for partner codes
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setDiscountValidation({ valid: false, type: null, checking: false });
        setDiscountCodeError("This code has expired");
        return;
      }

      setDiscountValidation({ valid: true, type: data.discount_type, checking: false });
      toast.success(data.discount_type === "free" ? "Free listing code applied!" : "50% discount applied!");
    } catch {
      setDiscountValidation({ valid: false, type: null, checking: false });
      setDiscountCodeError("Failed to validate code");
    }
  };

  // Step validation - Now 3 steps total
  // Step 1: Artist name + Event details (merged)
  // Step 2: Genre & Media
  // Step 3: Review + Required confirmation email
  const step1Fields = ["artist_name", "start_date", "start_time", "city", "venue_name"] as const;
  const step2Fields = ["genres"] as const;
  // Step 3 validates confirmationEmail separately (required)

  const validateStep = async (step: number): Promise<boolean> => {
    let fieldsToValidate: readonly (keyof FormData)[] = [];
    if (step === 1) fieldsToValidate = step1Fields;
    if (step === 2) fieldsToValidate = step2Fields;
    // Step 3 has no form fields to validate via zod (email handled separately)

    const result = await trigger(fieldsToValidate as (keyof FormData)[]);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      // Step 2 additional validation: flyer is required (unless curator flyer exists)
      if (currentStep === 2) {
        const hasFlyer = selectedFile || curatorFlyerUrl || watch("image_url");
        if (!hasFlyer) {
          toast.error("Please upload a show flyer");
          return;
        }
        // Reset confirmation when moving to review step
        setIsReviewConfirmed(false);
        setIsTermsAccepted(false);
      }
      setCurrentStep((prev) => Math.min(prev + 1, 3));
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
    console.log("[CreateAfterparty] onSubmit called", { data, isSubmitting, isReviewConfirmed, isTermsAccepted, isEmailValid, confirmationEmail });
    
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

      // Determine image_url: priority is selectedFile (uploaded later), then manual URL, then curator flyer
      const resolvedImageUrl = selectedFile 
        ? undefined // Will be set after upload
        : data.image_url || curatorFlyerUrl || undefined;

      // Build payload - include partner IDs when applicable
      const payload: Record<string, unknown> = {
        artist_name: data.artist_name,
        contact_email: confirmationEmail.trim(), // Use confirmationEmail as contact_email
        title: data.title || undefined, // Title is now optional
        start_at: startDate.toISOString(),
        city: data.city,
        venue_name: data.venue_name,
        ticket_url: data.ticket_url || undefined,
        genres: data.genres,
        youtube_url: data.youtube_url || undefined,
        image_url: resolvedImageUrl,
        // Curator ID from Step 4 dropdown (only if not "none")
        curator_id: step4CuratorId !== "none" ? step4CuratorId : undefined,
        // Venue references - only include if a real partner is selected (not "other")
        venue_id: data.venue_id && data.venue_id !== "other" ? data.venue_id : undefined,
        // Manual text field for "other" venue selection
        venue_other_name: data.venue_id === "other" ? data.venue_other_name : undefined,
        // Required confirmation email for MailerLite
        confirmation_email: confirmationEmail.trim(),
      };

      // Add discount code if valid
      if (discountValidation.valid && discountCode.trim()) {
        payload.discount_code = discountCode.trim().toUpperCase();
      }

      // Create event via create-afterparty-checkout
      console.log("[CreateAfterparty] Calling create-afterparty-checkout with payload:", payload);
      
      const { data: response, error } = await supabase.functions.invoke(
        "create-afterparty-checkout",
        { body: payload }
      );

      clearTimeout(timeoutId);
      
      console.log("[CreateAfterparty] Edge function response:", { response, error });

      if (error) {
        const errMsg = error.message || "Failed to create checkout session";
        console.error("[CreateAfterparty] Edge function error:", error);
        setCheckoutError(errMsg);
        toast.error(errMsg);
        return;
      }

      const eventId = response?.event_id;
      const checkoutUrlResponse = response?.url;
      const isFree = response?.free === true;

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

      // Handle free listing - redirect directly to artist control room
      if (isFree && response?.artist_access_token) {
        // Show email confirmation if sent
        if (response?.email_sent) {
          toast.success("Your free listing is live! Confirmation email sent.");
        } else {
          toast.success("Your free listing is live!");
        }
        navigate(`/artist/event/${eventId}?token=${response.artist_access_token}&welcome=true`);
        return;
      }

      // Redirect to Stripe checkout
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
      {[1, 2, 3].map((step) => (
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
          {step < 3 && (
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

  // Step 1: Event Details + Artist Info (merged from original Steps 1 & 2)
  const renderStep1 = () => {
    const selectedDate = watch("start_date");
    const selectedTime = watch("start_time");
    const venueOtherName = watch("venue_other_name");
    const eventTitle = watch("title");

    // Handle venue dropdown change
    const handleVenueChange = (value: string) => {
      setValue("venue_id", value, { shouldValidate: true });
      if (value === "other") {
        // Keep any existing manual text
      } else {
        // Clear manual text and set venue_name from venue name
        setValue("venue_other_name", "");
        const venue = venues.find((v) => v.id === value);
        setValue("venue_name", venue?.name || "", { shouldValidate: true });
      }
    };

    // Handle venue other name change
    const handleVenueOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValue("venue_other_name", value);
      setValue("venue_name", value, { shouldValidate: true });
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl text-primary-foreground">Event Details</h2>
          <p className="text-primary-foreground/70 text-base font-sans mt-1">Tell us about your show</p>
        </div>

        <div className="space-y-5">
          {/* Artist / Band Name - moved from original Step 1 */}
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

          {/* Name of Event - optional text input */}
          <div className="space-y-2">
            <Label className="text-primary-foreground text-base font-sans">Name of Event?</Label>
            <Input
              value={eventTitle || ""}
              onChange={(e) => setValue("title", e.target.value)}
              placeholder="Optional (ex: Summer Sessions, Release Show)"
              className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
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
                    disabled={(date) => {
                      // Allow same-day selection - only disable past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
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
              {cities.map((city) => (
                <option key={city.id} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-sm text-destructive font-sans">{errors.city.message}</p>
            )}
          </div>

          {/* Venue */}
          <div className="space-y-2">
            <Label className="text-primary-foreground text-base font-sans">Venue *</Label>
            <select
              value={venueId || ""}
              onChange={(e) => handleVenueChange(e.target.value)}
              className="flex h-14 w-full rounded-md border border-primary-foreground/50 bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={partnersLoading}
            >
              <option value="">Select venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
            {venueId === "other" && (
              <Input
                value={venueOtherName || ""}
                onChange={handleVenueOtherChange}
                placeholder="Enter venue name"
                className="h-14 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground mt-2"
              />
            )}
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

  // Step 2: Genre & Media (formerly Step 3)
  const renderStep2 = () => (
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

        {/* Flyer Section - show curator flyer or upload option */}
        {curatorFlyerUrl ? (
          <div className="space-y-3">
            <Label className="text-primary-foreground text-base font-sans">
              Event Flyer <span className="text-green-400 text-sm">(auto-populated from series)</span>
            </Label>
            <div className="relative rounded-xl overflow-hidden bg-primary-foreground/10 p-3">
              <div className="flex items-center gap-3">
                <img
                  src={curatorFlyerUrl}
                  alt="Event series flyer"
                  className="w-16 h-16 object-cover rounded-lg border border-primary-foreground/20"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-primary-foreground font-sans text-sm">Using series flyer</p>
                  <p className="text-primary-foreground/60 text-xs font-sans">
                    Provided by the event curator
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="text-primary-foreground text-base font-sans">
              Upload Show Flyer *
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
        )}

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

  // Step 3: Review + Required Confirmation Email (formerly Step 4)
  const renderStep3 = () => {
    const formValues = watch();
    
    // Get all active curators (not filtered by city in Step 3)
    const allCurators = partners.filter((p) => p.type === "curator");
    
    return (
      <div className="space-y-6">
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
          isTermsAccepted={isTermsAccepted}
          onTermsChange={setIsTermsAccepted}
        />

        {/* Curator Selection for Discount Code */}
        <div className="space-y-4 pt-4 border-t border-primary-foreground/20">
          <div className="space-y-2">
            <Label className="text-primary-foreground text-base font-sans">
              Select a curator
            </Label>
            <select
              value={step4CuratorId}
              onChange={(e) => {
                setStep4CuratorId(e.target.value);
                // Clear discount code and errors when curator changes
                if (e.target.value === "none") {
                  setDiscountCode("");
                  setDiscountCodeError(null);
                  setDiscountValidation({ valid: false, type: null, checking: false });
                }
              }}
              className="flex h-14 w-full rounded-md border border-primary-foreground/50 bg-background px-3 py-2 text-base font-sans text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={partnersLoading}
            >
              {allCurators.map((curator) => (
                <option key={curator.id} value={curator.id}>
                  {curator.name}
                </option>
              ))}
              <option value="none">I don't have a curator code</option>
            </select>
          </div>

          {/* Discount Code Input - only show if a curator is selected */}
          {step4CuratorId !== "none" && (
            <div className="space-y-2">
              <Label className="text-primary-foreground text-base font-sans">
                Discount code
              </Label>
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setDiscountCodeError(null); // Clear error on input change
                  }}
                  placeholder="Enter code"
                  className="h-12 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground uppercase"
                  maxLength={12}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => validateDiscountCode(discountCode)}
                  disabled={discountValidation.checking || !discountCode.trim()}
                  className="h-12 px-4 font-sans bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  {discountValidation.checking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>
              {discountCodeError && (
                <p className="text-sm text-red-500 font-sans">{discountCodeError}</p>
              )}
              {discountValidation.valid && (
                <p className="text-sm text-green-400 font-sans">
                  ✓ {discountValidation.type === "free" ? "Free listing!" : "50% off applied!"}
                </p>
              )}
            </div>
          )}

          {/* Confirmation Email - REQUIRED */}
          <div className="space-y-2 pt-4 border-t border-primary-foreground/20">
            <Label className="text-primary-foreground text-base font-sans">
              Email for confirmation *
            </Label>
            <Input
              type="email"
              value={confirmationEmail}
              onChange={(e) => setConfirmationEmail(e.target.value)}
              placeholder="you@domain.com"
              className="h-12 text-base font-sans bg-background text-foreground border-primary-foreground/50 focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
            />
            {confirmationEmail.trim() !== "" && !isEmailValid && (
              <p className="text-sm text-destructive font-sans">Please enter a valid email address</p>
            )}
            <p className="text-sm text-black font-bold font-sans">
              We'll send you a confirmation with your control room and share links.
            </p>
          </div>
        </div>
      </div>
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
      
      {currentStep < 3 ? (
        <Button
          type="button"
          onClick={handleNext}
          className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      ) : (
        <>
          <Button
            type="submit"
            className="h-11 px-8 font-display font-bold text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || isUploading || !isReviewConfirmed || !isTermsAccepted || !isEmailValid}
            onClick={() => {
              // Additional debugging when button is clicked but form might not submit
              console.log("[CreateAfterparty] Submit button clicked", { isSubmitting, isUploading, isReviewConfirmed, isTermsAccepted, isEmailValid, confirmationEmail });
            }}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading..." : "Processing..."}
              </>
            ) : discountValidation.valid && discountValidation.type === "free" ? (
              "Create Free Listing"
            ) : discountValidation.valid && discountValidation.type === "50_percent" ? (
              "Pay — $5.99"
            ) : (
              "Pay — $11.99"
            )}
          </Button>
          {/* Inline error hints when button is disabled */}
          {currentStep === 3 && !isSubmitting && !isUploading && (
            <div className="w-full mt-2">
              {!isEmailValid && (
                <p className="text-sm text-red-400 font-sans">Enter a valid email address</p>
              )}
              {!isReviewConfirmed && isEmailValid && (
                <p className="text-sm text-red-400 font-sans">Confirm your listing is accurate</p>
              )}
              {!isTermsAccepted && isEmailValid && isReviewConfirmed && (
                <p className="text-sm text-red-400 font-sans">Accept the Terms of Service</p>
              )}
            </div>
          )}
        </>
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
              Step {currentStep} of 3
            </p>

            {renderStepIndicator()}

            <div className="bg-primary rounded-2xl p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit, (formErrors) => {
                console.error("[CreateAfterparty] Form validation failed:", formErrors);
                toast.error("Please fix the form errors before submitting");
              })}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
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
