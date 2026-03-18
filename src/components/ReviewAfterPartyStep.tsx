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
  plan?: "emerge" | "touring" | null;
  isConfirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
  isTermsAccepted: boolean;
  onTermsChange: (checked: boolean) => void;
}

const ReviewAfterPartyStep = ({
  formData,
  plan,
  isConfirmed,
  onConfirmChange,
  isTermsAccepted,
  onTermsChange,
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

      {/* A) RSVP Card Preview with Disabled RSVP Button */}
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
            showRsvpButton={true}
            isPreview={true}
          />
        </div>
      </div>

      {/* What happens after you pay */}
      <div className="space-y-3">
        <Label className="text-primary-foreground text-base font-sans">What happens after you pay</Label>
        <div className="bg-background/10 rounded-xl p-4">
          <ol className="space-y-2 text-sm font-sans text-primary-foreground/90 list-decimal list-inside">
            <li>You'll be directed to your Artist Control Room page with promotion tools, payment setup, production tools and FAQs.</li>
            <li>Check your email for confirmation and next steps.</li>
            <li>Whether fans buy before or at the show, access is only granted at the show.</li>
          </ol>
        </div>
      </div>

      {/* Confirmation Checkbox */}
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

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3 pt-2">
        <Checkbox
          id="accept-terms"
          checked={isTermsAccepted}
          onCheckedChange={(checked) => onTermsChange(checked === true)}
          className="mt-0.5 border-primary-foreground/50 data-[state=checked]:bg-background data-[state=checked]:text-primary"
        />
        <Label
          htmlFor="accept-terms"
          className="text-primary-foreground text-sm font-sans cursor-pointer leading-tight"
        >
          I agree to GoLokol's{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            Terms of Service and Community Guidelines
          </a>
        </Label>
      </div>
    </div>
  );
};

export default ReviewAfterPartyStep;
