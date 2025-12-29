import { Link } from "react-router-dom";
import { Star, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SongCardProps {
  slug: string;
  title: string;
  artist: string;
  genre: string;
  fanRating: number;
  curatorRating: number;
}

const SongCard = ({ slug, title, artist, genre, fanRating, curatorRating }: SongCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground"}
      />
    ));
  };

  return (
    <Link to={`/song/${slug}`}>
      <Card className="group bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:box-glow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Music className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors truncate">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{artist}</p>
              <Badge variant="outline" className="border-accent/50 text-accent text-xs">
                {genre}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/30 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fan Rating</p>
              <div className="flex items-center gap-1">
                {renderStars(fanRating)}
                <span className="text-sm text-foreground ml-2">{fanRating.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Curator Rating</p>
              <div className="flex items-center gap-1">
                {renderStars(curatorRating)}
                <span className="text-sm text-foreground ml-2">{curatorRating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SongCard;
