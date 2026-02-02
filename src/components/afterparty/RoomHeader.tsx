import { Users } from "lucide-react";
import { format } from "date-fns";

interface RoomHeaderProps {
  eventTitle: string;
  city: string | null;
  startAt: string;
  attendeeCount: number;
  isExpired?: boolean;
  isArtistMode?: boolean;
}

const formatEventDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), "MMM d, yyyy");
  } catch {
    return "";
  }
};

const RoomHeader = ({
  eventTitle,
  city,
  startAt,
  attendeeCount,
  isExpired = false,
  isArtistMode = false,
}: RoomHeaderProps) => {
  const eventSubtitle = [city, formatEventDate(startAt)].filter(Boolean).join(" • ");

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-sm border-b border-border/20">
      <div className="max-w-[640px] mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="font-display font-bold text-foreground text-lg truncate">
            {eventTitle}
          </h1>
          {eventSubtitle && (
            <p className="text-muted-foreground text-sm font-sans truncate">
              {eventSubtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3">
          {isExpired && (
            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded font-sans">
              Ended
            </span>
          )}
          {isArtistMode && !isExpired && (
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-sans">
              Artist Mode
            </span>
          )}
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Users size={14} />
            <span className="text-sm font-sans font-medium">{attendeeCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RoomHeader;
