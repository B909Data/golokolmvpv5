import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Music, User, Play, Pause } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockSongs: Record<string, {
  title: string;
  artist: string;
  genre: string;
  fanRating: number;
  curatorRating: number;
  audioUrl: string;
}> = {
  "midnight-drive": {
    title: "Midnight Drive",
    artist: "The Night Owls",
    genre: "Indie Rock",
    fanRating: 4.2,
    curatorRating: 3.8,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  "electric-soul": {
    title: "Electric Soul",
    artist: "Voltage",
    genre: "Electronic",
    fanRating: 4.7,
    curatorRating: 4.5,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  "broken-strings": {
    title: "Broken Strings",
    artist: "Acoustic Dreams",
    genre: "Folk",
    fanRating: 3.9,
    curatorRating: 4.1,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
  "neon-lights": {
    title: "Neon Lights",
    artist: "Synthwave Collective",
    genre: "Electronic",
    fanRating: 4.4,
    curatorRating: 4.0,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
  "raw-power": {
    title: "Raw Power",
    artist: "The Amplifiers",
    genre: "Punk",
    fanRating: 4.0,
    curatorRating: 3.5,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  },
  "summer-haze": {
    title: "Summer Haze",
    artist: "Coastal Vibes",
    genre: "Indie Rock",
    fanRating: 4.3,
    curatorRating: 4.2,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  },
  "downtown-blues": {
    title: "Downtown Blues",
    artist: "Smokey Jones",
    genre: "Blues",
    fanRating: 4.6,
    curatorRating: 4.8,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  },
  "future-nostalgia": {
    title: "Future Nostalgia",
    artist: "Retro Modern",
    genre: "Electronic",
    fanRating: 4.1,
    curatorRating: 3.9,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  },
};

const SongDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  const song = slug ? mockSongs[slug] : null;

  if (!song) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4 text-center">
          <Music className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="font-display text-4xl text-foreground mb-4">Song Not Found</h1>
          <p className="text-muted-foreground mb-8">The song you're looking for doesn't exist.</p>
          <Link to="/songs">
            <Button variant="glow">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Songs
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePlayPause = () => {
    const audio = document.getElementById("song-player") as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRating = (rating: number) => {
    if (hasRated) {
      toast({
        title: "Already Rated",
        description: "You have already rated this song.",
        variant: "destructive",
      });
      return;
    }

    setUserRating(rating);
    setHasRated(true);
    toast({
      title: "Rating Submitted!",
      description: `You rated "${song.title}" ${rating} star${rating > 1 ? "s" : ""}.`,
    });
  };

  const renderStars = (rating: number, size: number = 20) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < Math.round(rating) ? "fill-primary text-primary" : "text-muted-foreground"}
      />
    ));
  };

  const renderRatingStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      const isFilled = hoveredStar !== null ? starValue <= hoveredStar : userRating !== null && starValue <= userRating;
      
      return (
        <button
          key={i}
          onClick={() => handleRating(starValue)}
          onMouseEnter={() => !hasRated && setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(null)}
          disabled={hasRated}
          className={`transition-all duration-200 ${hasRated ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            size={32}
            className={isFilled ? "fill-accent text-accent" : "text-muted-foreground hover:text-accent"}
          />
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/songs" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Songs
          </Link>

          {/* Song Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
            <div className="w-48 h-48 bg-primary/20 rounded-2xl flex items-center justify-center flex-shrink-0 box-glow">
              <Music className="w-24 h-24 text-primary" />
            </div>
            <div className="flex-1">
              <Badge variant="outline" className="border-accent/50 text-accent mb-4">
                {song.genre}
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl text-foreground mb-2">
                {song.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground text-lg mb-6">
                <User className="w-5 h-5" />
                <span>{song.artist}</span>
              </div>
              
              {/* Ratings Display */}
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fan Rating</p>
                  <div className="flex items-center gap-2">
                    {renderStars(song.fanRating)}
                    <span className="text-foreground font-semibold">{song.fanRating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Curator Rating</p>
                  <div className="flex items-center gap-2">
                    {renderStars(song.curatorRating)}
                    <span className="text-foreground font-semibold">{song.curatorRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Music Player */}
          <Card className="bg-card/50 border-border/50 mb-8">
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <Music className="w-6 h-6 text-primary" />
                Listen Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <Button
                  onClick={handlePlayPause}
                  variant="glow"
                  size="lg"
                  className="w-20 h-20 rounded-full p-0"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10" />
                  ) : (
                    <Play className="w-10 h-10 ml-1" />
                  )}
                </Button>
                <audio
                  id="song-player"
                  src={song.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full"
                  controls
                />
              </div>
            </CardContent>
          </Card>

          {/* Rating Form */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <Star className="w-6 h-6 text-accent" />
                Rate This Song
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasRated ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-2">Thanks for rating!</p>
                  <div className="flex justify-center gap-1">
                    {renderStars(userRating || 0, 32)}
                  </div>
                  <p className="text-foreground mt-2">You gave this song {userRating} star{userRating && userRating > 1 ? "s" : ""}.</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Click a star to rate this song (1-5)</p>
                  <div className="flex justify-center gap-2">
                    {renderRatingStars()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SongDetail;
