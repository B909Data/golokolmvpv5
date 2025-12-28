import { Link } from "react-router-dom";
import { Calendar, MapPin, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  slug: string;
  title: string;
  venue: string;
  date: string;
  genre: string;
  imageUrl?: string;
}

const EventCard = ({ slug, title, venue, date, genre, imageUrl }: EventCardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card gradient-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_hsl(330_85%_60%/0.15)]">
      <div className="aspect-[16/10] overflow-hidden bg-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
            <Music className="h-12 w-12 text-primary/50" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent">
            {genre}
          </span>
        </div>

        <h3 className="font-display text-2xl text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{venue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
        </div>

        <Link to={`/afterparty/${slug}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
