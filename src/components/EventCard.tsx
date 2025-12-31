import { Link } from "react-router-dom";
import { Calendar, MapPin, Music, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  slug: string;
  title: string;
  artistName?: string;
  venue: string;
  dateTime: string;
  genre: string;
  imageUrl?: string;
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "";
  try {
    const date = new Date(dateTime);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateTime;
  }
};

const EventCard = ({ slug, title, artistName, venue, dateTime, genre, imageUrl }: EventCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card-feature transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
      {/* Image section */}
      <div className="aspect-[16/10] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-card-foreground/10">
            <Music className="h-12 w-12 text-card-foreground/40" />
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-5">
        {/* Genre label - stamp style on yellow */}
        <div className="mb-3">
          <span className="inline-flex items-center rounded px-2 py-1 type-badge bg-card-foreground/10 text-card-foreground">
            {genre}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-xl text-card-foreground mb-2 leading-tight">
          {title}
        </h3>

        {/* Meta info */}
        <div className="space-y-1.5 mb-4">
          {artistName && (
            <div className="flex items-center gap-2 type-body-sm text-card-foreground/80">
              <User className="h-4 w-4" />
              <span>{artistName}</span>
            </div>
          )}
          <div className="flex items-center gap-2 type-body-sm text-card-foreground/80">
            <MapPin className="h-4 w-4" />
            <span>{venue}</span>
          </div>
          <div className="flex items-center gap-2 type-body-sm text-card-foreground/80">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(dateTime)}</span>
          </div>
        </div>

        {/* CTA - Black button on yellow surface */}
        <Link to={`/afterparty/${slug}`}>
          <Button variant="onFeature" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
