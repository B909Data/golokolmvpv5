import { useState } from "react";
import { ChevronDown, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface WelcomeTabProps {
  artistName: string;
  eventTitle: string;
  pinnedMessage: string | null;
  curatorName: string | null;
  venueName: string | null;
  onGoToChat: () => void;
}

const WelcomeTab = ({
  artistName,
  eventTitle,
  pinnedMessage,
  curatorName,
  venueName,
  onGoToChat,
}: WelcomeTabProps) => {
  const [notifyOptIn, setNotifyOptIn] = useState(false);

  // Build attribution line
  const attributionParts: string[] = [];
  if (venueName) attributionParts.push(venueName);
  if (curatorName) attributionParts.push(curatorName);
  const presentedBy = attributionParts.length > 0 
    ? `Presented by ${attributionParts.join(" & ")}` 
    : null;

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
