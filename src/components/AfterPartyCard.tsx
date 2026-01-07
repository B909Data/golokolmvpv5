import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, MapPin, Music, PlayCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

interface AfterPartyCardProps {
  id: string;
  title: string;
  artistName?: string | null;
  startAt: string;
  city?: string | null;
  venueName?: string | null;
  genres?: string[] | null;
  youtubeUrl?: string | null;
  imageUrl?: string | null;
  showRsvpButton?: boolean;
  onRsvpClick?: () => void;
  isPreview?: boolean;
}

const AfterPartyCard = ({
  id,
  title,
  artistName,
  startAt,
  city,
  venueName,
  genres,
  youtubeUrl,
  imageUrl,
  showRsvpButton = true,
  onRsvpClick,
  isPreview = false,
}: AfterPartyCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Priority: flyer image first, fallback to YouTube thumbnail
  const getEventImage = (): string | null => {
    if (imageUrl) {
      return imageUrl;
    }
    if (youtubeUrl) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "hq");
      }
    }
    return null;
  };

  const hasVideo = (): boolean => {
    return !!(youtubeUrl && extractYouTubeId(youtubeUrl));
  };

  const handlePlayVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(true);
  };

  const handleCloseVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlaying(false);
  };

  const eventImage = getEventImage();
  const eventHasVideo = hasVideo();
  const videoId = youtubeUrl ? extractYouTubeId(youtubeUrl) : null;

  return (
    <div className="rounded-xl overflow-hidden flex flex-col group bg-primary">
      {/* Media Section */}
      <div className="aspect-[16/9] relative bg-primary/80 overflow-hidden">
        {isPlaying && videoId ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={handleCloseVideo}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Close video"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </>
        ) : (
          <>
            {eventImage ? (
              <img
                src={eventImage}
                alt={title}
                className="w-full h-full object-cover object-center block"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/60">
                <Music className="h-12 w-12 text-primary-foreground/40" />
              </div>
            )}
            
            {/* Play button overlay - only for videos */}
            {eventHasVideo && (
              <button
                onClick={handlePlayVideo}
                className="absolute inset-0 flex items-center justify-center bg-background/20 hover:bg-background/30 transition-colors cursor-pointer"
                aria-label="Play video"
              >
                <PlayCircle className="w-16 h-16 text-primary drop-shadow-lg" />
              </button>
            )}

            {/* Genre badges */}
            {genres && genres.length > 0 && (
              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                {genres.slice(0, 2).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 rounded-full bg-primary/80 text-primary-foreground text-xs font-sans"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col gap-4 flex-1 bg-primary">
        {/* Primary info: Artist name in Breul Grotesk */}
        <div>
          <h2 className="font-display text-xl text-primary-foreground leading-tight mb-1">
            {artistName || title}
          </h2>
          {artistName && title !== artistName && (
            <p className="text-base font-sans text-primary-foreground/80">
              {title}
            </p>
          )}
        </div>

        {/* Secondary info: Date and Location in Roboto */}
        <div className="flex flex-col gap-1.5 text-base font-sans text-primary-foreground/80">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>
              {format(new Date(startAt), "EEE, MMM d · h:mm a")}
            </span>
          </div>
          {(city || venueName) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>
                {venueName && city ? `${venueName}, ${city}` : venueName || city}
              </span>
            </div>
          )}
        </div>

        {/* Primary CTA - Black bg with yellow text */}
        {showRsvpButton && (
          isPreview ? (
            <Button 
              disabled
              className="w-full mt-auto bg-primary-foreground text-primary cursor-not-allowed opacity-70 font-sans"
            >
              Get Access
            </Button>
          ) : onRsvpClick ? (
            <Button 
              onClick={onRsvpClick}
              className="w-full mt-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans"
            >
              Get Access
            </Button>
          ) : (
            <Link to={`/after-party/${id}/rsvp`} className="mt-auto">
              <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans">
                Get Access
              </Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
};

export default AfterPartyCard;
