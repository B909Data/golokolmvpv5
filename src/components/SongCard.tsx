import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { getYouTubeThumbnail } from "@/lib/youtube";

interface SongCardProps {
  slug: string;
  title: string;
  artist: string;
  genre: string;
  fanRating: number;
  curatorRating: number;
  youtubeId?: string;
}

const SongCard = ({ slug, title, artist, genre, fanRating, curatorRating, youtubeId }: SongCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.round(rating) ? "fill-card-foreground text-card-foreground" : "text-card-foreground/30"}
      />
    ));
  };

  return (
    <Link to={`/song/${slug}`}>
      <div className="group rounded-xl bg-card-feature p-6 transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--primary)/0.3)]">
        <div className="flex items-start gap-4">
          {/* YouTube Thumbnail or Fallback Icon */}
          <div className="relative w-24 h-16 bg-card-foreground/10 rounded-lg overflow-hidden flex-shrink-0">
            {youtubeId ? (
              <>
                <img
                  src={getYouTubeThumbnail(youtubeId, 'mq')}
                  alt={`${title} thumbnail`}
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-card-foreground rounded-full flex items-center justify-center">
                    <Play className="w-5 h-5 text-card-feature fill-card-feature ml-0.5" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="w-8 h-8 text-card-foreground fill-card-foreground" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-xl text-card-foreground leading-tight truncate">
              {title}
            </h3>
            <p className="text-card-foreground/80 type-body-sm mb-2">{artist}</p>
            
            {/* Genre label - stamp style on yellow */}
            <span className="inline-flex items-center rounded px-2 py-0.5 type-badge bg-card-foreground/10 text-card-foreground">
              {genre}
            </span>
          </div>
        </div>
        
        {/* Ratings */}
        <div className="mt-4 pt-4 border-t border-card-foreground/15 grid grid-cols-2 gap-4">
          <div>
            <p className="type-meta text-card-foreground/70 mb-1">Fan Rating</p>
            <div className="flex items-center gap-1">
              {renderStars(fanRating)}
              <span className="type-body-sm text-card-foreground font-semibold ml-2">{fanRating.toFixed(1)}</span>
            </div>
          </div>
          <div>
            <p className="type-meta text-card-foreground/70 mb-1">Curator Rating</p>
            <div className="flex items-center gap-1">
              {renderStars(curatorRating)}
              <span className="type-body-sm text-card-foreground font-semibold ml-2">{curatorRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SongCard;
