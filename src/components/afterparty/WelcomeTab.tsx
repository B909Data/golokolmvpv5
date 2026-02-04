import { useState, useRef } from "react";
import { Bell, Download } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import badgeFrameSvg from "@/assets/golokol-badge-frame.svg";

interface WelcomeTabProps {
  artistName: string;
  eventTitle: string;
  pinnedMessage: string | null;
  curatorName: string | null;
  venueName: string | null;
  flyerUrl: string | null;
  onGoToChat: () => void;
}

const WelcomeTab = ({
  artistName,
  eventTitle,
  pinnedMessage,
  curatorName,
  venueName,
  flyerUrl,
  onGoToChat,
}: WelcomeTabProps) => {
  const [notifyOptIn, setNotifyOptIn] = useState(false);
  const badgeContainerRef = useRef<HTMLDivElement>(null);

  // Build attribution line
  const attributionParts: string[] = [];
  if (venueName) attributionParts.push(venueName);
  if (curatorName) attributionParts.push(curatorName);
  const presentedBy = attributionParts.length > 0 
    ? `Presented by ${attributionParts.join(" & ")}` 
    : null;

  // Save badge to photos (mobile) or download (desktop)
  const handleSaveBadge = async () => {
    // Create canvas for composite badge
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("Failed to create badge");
      return;
    }

    try {
      // Load frame image
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        frameImg.onload = () => resolve();
        frameImg.onerror = reject;
        frameImg.src = badgeFrameSvg;
      });

      // Load flyer image if available
      let flyerImg: HTMLImageElement | null = null;
      if (flyerUrl) {
        flyerImg = new Image();
        flyerImg.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          flyerImg!.onload = () => resolve();
          flyerImg!.onerror = () => resolve(); // Continue even if flyer fails
          flyerImg!.src = flyerUrl;
        });
      }

      // Draw flyer in circle (centered at 42% from top, 60% size)
      if (flyerImg && flyerImg.complete && flyerImg.naturalWidth > 0) {
        const circleX = canvas.width * 0.5;
        const circleY = canvas.height * 0.42;
        const circleRadius = canvas.width * 0.3;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Draw flyer centered and covering the circle
        const scale = Math.max(
          (circleRadius * 2) / flyerImg.naturalWidth,
          (circleRadius * 2) / flyerImg.naturalHeight
        );
        const drawWidth = flyerImg.naturalWidth * scale;
        const drawHeight = flyerImg.naturalHeight * scale;
        ctx.drawImage(
          flyerImg,
          circleX - drawWidth / 2,
          circleY - drawHeight / 2,
          drawWidth,
          drawHeight
        );
        ctx.restore();
      }

      // Draw frame on top
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

      // Convert to blob and save/share
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error("Failed to create badge image");
          return;
        }

        const safeTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        const fileName = `golokol-badge-${safeTitle}.png`;

        // On mobile, use Web Share API for native "Save to Photos"
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile && navigator.share && navigator.canShare) {
          try {
            const file = new File([blob], fileName, { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file] });
              toast.success("Badge saved to photos!");
              return;
            }
          } catch (err: any) {
            if (err.name === "AbortError") return;
            // Fall through to standard download
          }
        }

        // Desktop fallback
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success("Badge saved!");
      }, "image/png");
    } catch (err) {
      console.error("Error creating badge:", err);
      toast.error("Failed to create badge");
    }
  };

  return (
    <main className="flex-1 overflow-y-auto pb-24">
      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-6">
        {/* Branded Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display font-bold text-foreground text-3xl md:text-4xl leading-tight">
            {artistName}
          </h1>
          <p className="text-primary font-display text-xl uppercase tracking-wide">
            After Party
          </p>
          {presentedBy && (
            <p className="text-muted-foreground font-sans text-sm">
              {presentedBy}
            </p>
          )}
        </div>

        {/* Badge Display */}
        <div className="flex flex-col items-center" data-ph-mask>
          <div 
            ref={badgeContainerRef}
            className="relative w-64 h-64 md:w-72 md:h-72"
          >
            {/* Flyer circle */}
            {flyerUrl && (
              <div 
                className="absolute rounded-full overflow-hidden border-4 border-black"
                style={{
                  top: "42%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "60%",
                  height: "60%",
                }}
              >
                <img 
                  src={flyerUrl} 
                  alt="Event flyer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Badge frame on top */}
            <img 
              src={badgeFrameSvg} 
              alt="GoLokol Badge"
              className="absolute inset-0 w-full h-full"
            />
          </div>
          
          {/* Save Badge Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveBadge}
            className="mt-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Save Badge
          </Button>
        </div>

        {/* Pinned Message (Artist's "what's going down" message) */}
        {pinnedMessage && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-5">
            <p className="text-foreground font-sans text-base leading-relaxed">
              {pinnedMessage}
            </p>
            <p className="text-primary/70 text-xs font-sans mt-3 uppercase tracking-wide">
              — {artistName}
            </p>
          </div>
        )}

        {/* Notification Opt-In (Simplified checkbox) */}
        <div className="bg-[#1A1A1A] rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={notifyOptIn}
              onCheckedChange={(checked) => setNotifyOptIn(checked === true)}
              className="h-5 w-5 border-2"
            />
            <div className="flex items-center gap-2 flex-1">
              <Bell size={16} className="text-primary shrink-0" />
              <span className="text-foreground font-sans text-sm">
                Notify me when the artist joins or goes live
              </span>
            </div>
          </label>
        </div>

        {/* Badge Explanation (Accordion) */}
        <Accordion type="single" collapsible className="bg-[#1A1A1A] rounded-xl overflow-hidden">
          <AccordionItem value="badge" className="border-0">
            <AccordionTrigger className="px-5 py-4 hover:no-underline">
              <span className="text-foreground font-sans text-sm font-medium">
                What does this badge mean?
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                This badge shows you attended this After Party. It's proof you showed up — artists may reward that in the future.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* House Rules */}
        <div className="bg-[#1A1A1A] rounded-xl p-5">
          <h3 className="font-display font-bold text-foreground text-lg mb-4">
            House Rules
          </h3>
          <ul className="space-y-3 text-muted-foreground font-sans text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">•</span>
              <span>Respect the artist and other fans</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">•</span>
              <span>No harassment or spam</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5">•</span>
              <span>Artist may moderate messages</span>
            </li>
          </ul>
        </div>

        {/* Go to Chat CTA */}
        <div className="pt-2">
          <Button
            onClick={onGoToChat}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans font-medium py-6 text-base"
          >
            Join the Conversation
          </Button>
        </div>
      </div>
    </main>
  );
};

export default WelcomeTab;
