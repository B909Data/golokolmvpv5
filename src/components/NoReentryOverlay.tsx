import { Button } from "@/components/ui/button";

interface NoReentryOverlayProps {
  eventId: string;
  onEnter: () => void;
}

const NoReentryOverlay = ({ eventId, onEnter }: NoReentryOverlayProps) => {
  const handleEnter = () => {
    // Set localStorage flag to not show again for this event
    localStorage.setItem(`afterPartyNoReentrySeen_${eventId}`, "true");
    onEnter();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground uppercase tracking-tight">
          THIS PARTY HAS NO RE-ENTRY
        </h1>
        
        <p className="font-sans text-xl sm:text-2xl font-bold text-foreground">
          Keep this tab open to stay in the After Party.
        </p>
        
        <Button
          onClick={handleEnter}
          size="lg"
          className="w-full max-w-xs mx-auto bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 font-display font-bold uppercase"
        >
          ENTER PARTY
        </Button>
      </div>
    </div>
  );
};

export default NoReentryOverlay;
