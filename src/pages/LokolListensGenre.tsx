import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, RotateCcw, Heart } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import golokolLogo from "@/assets/golokol-logo.svg";
import fenixFloImg from "@/assets/Hiphop-fenixandflo.jpeg";
import jointdexterImg from "@/assets/Hiphop-Jointdexter.png";
import sque3ezeImg from "@/assets/Hiphop-Sque3eze-Rock.png";
import fenixFloAudio from "@/assets/audio/Hiphop-FenixandFlo-WhoSaidP2.mp3";
import jointdexterAudio from "@/assets/audio/Hiphop-JointDexterandYoshi-Fye.mp3";
import sque3ezeAudio from "@/assets/audio/Hiphop-Sque3eze-Rock.mp3";

interface Artist {
  id: string;
  name: string;
  image: string;
  song: string;
  duration: number;
  audio: string;
}

interface PlayerState {
  artistId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

function slugToGenre(slug: string) {
  // Insert space before uppercase letters in camelCase slugs (e.g., "hiphop" → "hip hop")
  const spaced = slug
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/-and-/g, " & ")
    .replace(/-/g, " ");
  // Special cases for known compound words
  const specialCases: Record<string, string> = {
    hiphop: "Hip Hop",
    rnb: "RnB",
    alternativesoul: "Alternative Soul",
  };
  if (specialCases[slug]) return specialCases[slug];
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const LokolListensGenre = () => {
  const { genre } = useParams<{ genre: string }>();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("store") || "";
  const genreName = genre ? slugToGenre(genre) : "Unknown";

  const artists: Record<string, Artist[]> = {
    hiphop: [
      {
        id: "fenix-flo",
        name: "Fenix&Flo",
        image: fenixFloImg,
        song: "Who Said? Pt.2",
        duration: 164,
        audio: fenixFloAudio,
      },
      {
        id: "jointdexter",
        name: "Jointdexter",
        image: jointdexterImg,
        song: "Fye",
        duration: 129,
        audio: jointdexterAudio,
      },
      {
        id: "sque3eze",
        name: "Sque3eze",
        image: sque3ezeImg,
        song: "Rock",
        duration: 153,
        audio: sque3ezeAudio,
      },
    ],
    rnb: [],
    alternativesoul: [],
  };

  const currentArtists = artists[genre || ""] || [];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    artistId: "",
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const [cratePoints, setCratePoints] = useState(0);
  const [votedArtists, setVotedArtists] = useState<Set<string>>(
    new Set()
  );
  const [listeningProgress, setListeningProgress] = useState<
    Record<string, number>
  >({});
  const [pointsAwarded, setPointsAwarded] = useState<Set<string>>(
    new Set()
  );
  const [voteCount, setVoteCount] = useState(0);
  const [showVoteLimitModal, setShowVoteLimitModal] = useState(false);

  // Handle timeupdate event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setPlayerState((prev) => ({
        ...prev,
        currentTime: audio.currentTime,
      }));

      // Check if 50% of song has been listened to
      const progress = audio.currentTime / audio.duration;
      if (progress >= 0.5 && !pointsAwarded.has(playerState.artistId)) {
        setCratePoints((prev) => prev + 5);
        setPointsAwarded(
          (prev) => new Set([...prev, playerState.artistId])
        );
      }
    };

    const handleLoadedMetadata = () => {
      setPlayerState((prev) => ({
        ...prev,
        duration: audio.duration,
      }));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [playerState.artistId, pointsAwarded]);

  const handlePlayPause = (artistId: string, audioUrl: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If switching to a different song, load it
    if (playerState.artistId !== artistId) {
      audio.src = audioUrl;
      audio.currentTime = 0;
      audio.play();
      setPlayerState({
        artistId,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      });
    } else {
      // Same song: toggle play/pause
      if (playerState.isPlaying) {
        audio.pause();
        setPlayerState((prev) => ({ ...prev, isPlaying: false }));
      } else {
        audio.play();
        setPlayerState((prev) => ({ ...prev, isPlaying: true }));
      }
    }
  };

  const handleRewind = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setPlayerState((prev) => ({ ...prev, currentTime: 0 }));
    }
  };

  const handleVote = (artistId: string) => {
    if (votedArtists.has(artistId)) return;

    if (voteCount >= 3) {
      setShowVoteLimitModal(true);
      return;
    }

    setVotedArtists((prev) => new Set([...prev, artistId]));
    setVoteCount((prev) => prev + 1);
    setCratePoints((prev) => prev + 5);
  };

  if (!currentArtists || currentArtists.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <header className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between bg-black border-b border-gray-800">
          <Link
            to={`/lls${storeId ? `?store=${storeId}` : ""}`}
            className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <img src={golokolLogo} alt="GoLokol" className="h-6 w-6" />
          </div>
          <div className="text-right">
            <p className="text-sm text-white">Crate Points: {cratePoints}</p>
          </div>
        </header>

        <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="font-bold text-3xl text-white mb-4">{genreName}</h1>
          <p className="text-lg text-gray-400 max-w-md">
            Songs for this genre will appear here soon. Stay tuned.
          </p>
        </section>

        <footer className="px-6 py-6 text-center border-t border-gray-800">
          <p className="text-xs text-gray-400">
            GoLokol — The future of music is local.
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-black border-b border-gray-800">
        <Link
          to={`/lls${storeId ? `?store=${storeId}` : ""}`}
          className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <p className="text-base font-bold text-[#FFD600]">
          Crate Points: {cratePoints}
        </p>
        <Link
          to={`/lls/signup?points=${cratePoints}`}
          className="bg-[#FFD600] text-black font-bold text-sm px-4 py-2 rounded-lg hover:brightness-110 transition-all"
        >
          Save
        </Link>
      </header>

      {/* Genre Title */}
      <div className="px-6 py-6 text-center border-b border-gray-800">
        <h1 className="font-bold text-3xl text-white">Lokol {genreName} Artists</h1>
      </div>

      {/* Artist Cards */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {currentArtists.map((artist) => (
          <div
            key={artist.id}
            className="rounded-lg overflow-hidden bg-black border border-gray-800"
          >
            {/* Image Section */}
            <div className="relative w-full aspect-square rounded-t-lg overflow-hidden">
              <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <h3 className="text-xl font-bold text-white drop-shadow-lg">
                  {artist.name}
                </h3>
              </div>
            </div>

            {/* Controls Section (Off-Black Bar) */}
            <div className="bg-gray-900 px-4 py-4 flex items-center justify-between">
              {/* Left: Heart */}
              <button
                onClick={() => handleVote(artist.id)}
                disabled={votedArtists.has(artist.id)}
                className={`transition-all ${
                  votedArtists.has(artist.id)
                    ? "text-yellow-400"
                    : "text-gray-400 hover:text-yellow-400"
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${
                    votedArtists.has(artist.id) ? "fill-yellow-400" : ""
                  }`}
                />
              </button>

              {/* Center: Play/Pause + Rewind */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayPause(artist.id, artist.audio)}
                  className="h-10 w-10 rounded-full bg-yellow-400 text-black flex items-center justify-center hover:bg-yellow-300 transition-all"
                >
                  {playerState.artistId === artist.id &&
                  playerState.isPlaying ? (
                    <Pause className="h-5 w-5 fill-black" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5 fill-black" />
                  )}
                </button>

                <button
                  onClick={handleRewind}
                  disabled={playerState.artistId !== artist.id}
                  className={`h-8 w-8 rounded border border-yellow-400 flex items-center justify-center transition-all ${
                    playerState.artistId === artist.id
                      ? "text-yellow-400 hover:bg-yellow-400 hover:text-black"
                      : "text-gray-400 border-gray-400"
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Right: Duration */}
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {playerState.artistId === artist.id
                    ? formatTime(playerState.currentTime)
                    : "0:00"}{" "}
                  / {formatTime(artist.duration)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      {/* Vote Limit Modal */}
      {showVoteLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-3">
              Vote Limit Reached
            </h2>
            <p className="text-gray-300 mb-6">
              You've used all 3 votes this session. Sign up to save your points
              and unlock more votes!
            </p>
            <Link
              to="/lls/signup"
              className="w-full bg-yellow-400 text-black font-bold py-3 rounded text-center hover:bg-yellow-300 transition-all block"
            >
              Sign Up
            </Link>
            <button
              onClick={() => setShowVoteLimitModal(false)}
              className="w-full mt-2 border border-gray-600 text-white py-3 rounded hover:bg-gray-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-gray-800">
        <p className="text-xs text-gray-400">
          GoLokol — The future of music is local.
        </p>
      </footer>
    </div>
  );
};

export default LokolListensGenre;