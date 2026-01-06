import { format } from "date-fns";
import { Check } from "lucide-react";
import AfterPartyCard from "@/components/AfterPartyCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReviewAfterPartyStepProps {
  formData: {
    artist_name: string;
    contact_email: string;
    title: string;
    start_date: Date;
    start_time: string;
    city: string;
    venue_name: string;
    ticket_url?: string;
    genres: string[];
    youtube_url?: string;
    image_url: string;
  };
  isConfirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
}

const ReviewAfterPartyStep = ({
  formData,
  isConfirmed,
  onConfirmChange,
}: ReviewAfterPartyStepProps) => {
  // Combine date and time for preview
  const getStartAtISO = (): string => {
    const startDate = new Date(formData.start_date);
    const [hours, minutes] = formData.start_time.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    return startDate.toISOString();
  };

  const formatTime = (timeValue: string): string => {
    const [hours, minutes] = timeValue.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-display text-2xl text-primary-foreground">Review & Confirm</h2>
        <p className="text-primary-foreground/70 text-base font-sans mt-1">
          Preview your listing before payment
        </p>
      </div>

      {/* A) RSVP Card Preview */}
      <div className="space-y-3">
        <Label className="text-primary-foreground text-base font-sans">Your RSVP Card Preview</Label>
        <div className="bg-background rounded-xl p-4">
          <AfterPartyCard
            id="preview"
            title={formData.title}
            artistName={formData.artist_name}
            startAt={getStartAtISO()}
            city={formData.city}
            venueName={formData.venue_name}
            genres={formData.genres}
            youtubeUrl={formData.youtube_url || null}
            imageUrl={formData.image_url || null}
            showRsvpButton={false}
          />
        </div>
      </div>

      {/* B) Details Summary */}
      <div className="space-y-3">
        <Label className="text-primary-foreground text-base font-sans">Details Summary</Label>
        <div className="bg-background/10 rounded-xl p-4 space-y-2">
          <div className="grid gap-2 text-sm font-sans">
            <div className="flex justify-between">
              <span className="text-primary-foreground/70">Event Title</span>
              <span className="text-primary-foreground font-medium">{formData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-foreground/70">Artist Name</span>
              <span className="text-primary-foreground font-medium">{formData.artist_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-foreground/70">City</span>
              <span className="text-primary-foreground font-medium">{formData.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary-foreground/70">Date & Time</span>
              <span className="text-primary-foreground font-medium">
                {format(formData.start_date, "MMM d, yyyy")} · {formatTime(formData.start_time)}
              </span>
            </div>
            {formData.venue_name && (
              <div className="flex justify-between">
                <span className="text-primary-foreground/70">Venue</span>
                <span className="text-primary-foreground font-medium">{formData.venue_name}</span>
              </div>
            )}
            {formData.genres.length > 0 && (
              <div className="flex justify-between">
                <span className="text-primary-foreground/70">Genres</span>
                <span className="text-primary-foreground font-medium">{formData.genres.join(", ")}</span>
              </div>
            )}
            <div className="flex justify-between items-start">
              <span className="text-primary-foreground/70">Flyer URL</span>
              <span className="text-primary-foreground font-medium text-right break-all max-w-[60%]">
                {formData.image_url}
              </span>
            </div>
            {formData.youtube_url && (
              <div className="flex justify-between items-start">
                <span className="text-primary-foreground/70">YouTube URL</span>
                <span className="text-primary-foreground font-medium text-right break-all max-w-[60%]">
                  {formData.youtube_url}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-primary-foreground/20">
              <span className="text-primary-foreground/70">Price</span>
              <span className="text-primary-foreground font-medium">$11.99 — No Subscription</span>
            </div>
          </div>
        </div>
      </div>

      {/* E) What happens after you pay */}
      <div className="space-y-3">
        <Label className="text-primary-foreground text-base font-sans">What happens after you pay</Label>
        <div className="bg-background/10 rounded-xl p-4">
          <ol className="space-y-2 text-sm font-sans text-primary-foreground/90 list-decimal list-inside">
            <li>Your After Party page is created instantly.</li>
            <li>You'll get your Artist Control link (bookmark it).</li>
            <li>Use 'Door Check-In' to scan passes or add walk-ins.</li>
            <li>After Party opens when the first fan gets checked in.</li>
            <li>Fans should show their pass to band at merch table to get checked in.</li>
            <li>The After Party stays open for 24 hours.</li>
          </ol>
        </div>
      </div>

      {/* C) Confirmation Checkbox */}
      <div className="flex items-start gap-3 pt-2">
        <Checkbox
          id="confirm-accurate"
          checked={isConfirmed}
          onCheckedChange={(checked) => onConfirmChange(checked === true)}
          className="mt-0.5 border-primary-foreground/50 data-[state=checked]:bg-background data-[state=checked]:text-primary"
        />
        <Label
          htmlFor="confirm-accurate"
          className="text-primary-foreground text-sm font-sans cursor-pointer leading-tight"
        >
          I confirm this is accurate and ready to publish.
        </Label>
      </div>
    </div>
  );
};

export default ReviewAfterPartyStep;
