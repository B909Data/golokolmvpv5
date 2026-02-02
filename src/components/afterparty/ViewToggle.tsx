import { Home, MessageCircle, Settings } from "lucide-react";

type ViewMode = "welcome" | "chat";

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isArtistMode?: boolean;
  onGoToControl?: () => void;
  isExpired?: boolean;
}

const ViewToggle = ({ 
  viewMode, 
  setViewMode, 
  isArtistMode = false, 
  onGoToControl, 
  isExpired = false 
}: ViewToggleProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B] border-t border-border/20 px-4 py-3 safe-area-pb">
      <div className="flex justify-center gap-2 max-w-xs mx-auto">
        {/* Fans see Welcome + Chat */}
        {!isArtistMode && (
          <>
            <button
              onClick={() => setViewMode("welcome")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all ${
                viewMode === "welcome"
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
              }`}
            >
              <Home size={18} />
              <span>Welcome</span>
            </button>
            <button
              onClick={() => setViewMode("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all ${
                viewMode === "chat"
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
              }`}
            >
              <MessageCircle size={18} />
              <span>Chat</span>
            </button>
          </>
        )}
        
        {/* Artists see Chat + Artist Control (hide control when expired) */}
        {isArtistMode && (
          <>
            <button
              onClick={() => setViewMode("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all ${
                viewMode === "chat"
                  ? "bg-primary text-primary-foreground"
                  : "bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
              }`}
            >
              <MessageCircle size={18} />
              <span>Chat</span>
            </button>
            {!isExpired && (
              <button
                onClick={onGoToControl}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-sans text-sm transition-all bg-[#1A1A1A] text-muted-foreground hover:bg-[#252525]"
              >
                <Settings size={18} />
                <span>Artist Control</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewToggle;
