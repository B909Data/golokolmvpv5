import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import { Heart, Play, Pause } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";

/* ── helpers ── */
function slugToGenre(slug: string) {
  return slug
    .replace(/-and-/g, " & ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── mock data per genre ── */
interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number; // seconds
}

const MOCK_SONGS: Record<string, Song[]> = {
  "hip-hop": [
    { id: "hh1", title: "Block Party", artist: "Kilo Tha God", imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=480&h=480&fit=crop", audioUrl: "", duration: 194 },
    { id: "hh2", title: "South Side Anthem", artist: "Lil Marlo", imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=480&h=480&fit=crop", audioUrl: "", duration: 212 },
    { id: "hh3", title: "Run It Up", artist: "Yung Blaze", imageUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=480&h=480&fit=crop", audioUrl: "", duration: 178 },
    { id: "hh4", title: "West End Flow", artist: "DJ Toomp Jr", imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=480&h=480&fit=crop", audioUrl: "", duration: 205 },
    { id: "hh5", title: "Trap Gospel", artist: "Pastor Troy Jr", imageUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=480&h=480&fit=crop", audioUrl: "", duration: 187 },
    { id: "hh6", title: "404 Dreams", artist: "ATL Slim", imageUrl: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=480&h=480&fit=crop", audioUrl: "", duration: 221 },
  ],
  rnb: [
    { id: "rn1", title: "Midnight Drive", artist: "Sasha Renee", imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=480&h=480&fit=crop", audioUrl: "", duration: 234 },
    { id: "rn2", title: "Golden Hour", artist: "Devin Miles", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&h=480&fit=crop", audioUrl: "", duration: 198 },
    { id: "rn3", title: "Slow Burn", artist: "Kiana Ledé ATL", imageUrl: "https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?w=480&h=480&fit=crop", audioUrl: "", duration: 245 },
    { id: "rn4", title: "Honey Glow", artist: "Tyla Rose", imageUrl: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=480&h=480&fit=crop", audioUrl: "", duration: 210 },
    { id: "rn5", title: "After Hours", artist: "Elijah Banks", imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=480&h=480&fit=crop", audioUrl: "", duration: 189 },
    { id: "rn6", title: "Velvet", artist: "Mya Sinclair", imageUrl: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=480&h=480&fit=crop", audioUrl: "", duration: 217 },
  ],
  "alternative-soul": [
    { id: "as1", title: "Lucid State", artist: "Noname ATL", imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=480&h=480&fit=crop", audioUrl: "", duration: 256 },
    { id: "as2", title: "Bloom", artist: "Indigo Sun", imageUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=480&h=480&fit=crop", audioUrl: "", duration: 201 },
    { id: "as3", title: "Dissolve", artist: "Aura James", imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=480&h=480&fit=crop", audioUrl: "", duration: 278 },
    { id: "as4", title: "Orbit", artist: "Sage Monroe", imageUrl: "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=480&h=480&fit=crop", audioUrl: "", duration: 192 },
    { id: "as5", title: "Echo Chamber", artist: "Flux Velvet", imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=480&h=480&fit=crop", audioUrl: "", duration: 230 },
    { id: "as6", title: "Spirit Walk", artist: "Zora Neale", imageUrl: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc30b?w=480&h=480&fit=crop", audioUrl: "", duration: 244 },
  ],
};

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const MAX_VOTES = 3;

/* ── component ── */
const LokolListensGenre = () => {
  const { genre } = useParams<{ genre: string }>();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("store") || "";
  const genreName = genre ? slugToGenre(genre) : "Unknown";
  const songs = (genre && MOCK_SONGS[genre]) || [];

  // session state
  const [cratePoints, setCratePoints] = useState(0);
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set());
  const [listenedSongs, setListenedSongs] = useState<Set<string>>(new Set());
  const [showVoteLimit, setShowVoteLimit] = useState(false);

  // audio state
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Since we have no real audio URLs, simulate playback
  const simulatedProgressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSimulation = useCallback(() => {
    if (simulatedProgressRef.current) {
      clearInterval(simulatedProgressRef.current);
      simulatedProgressRef.current = null;
    }
  }, []);

  const handlePlay = useCallback((song: Song) => {
    if (playingSongId === song.id) {
      // pause
      setPlayingSongId(null);
      stopSimulation();
      return;
    }
    // start new
    stopSimulation();
    setPlayingSongId(song.id);
    setCurrentTime(0);
    setAudioDuration(song.duration);

    // simulate playback at 1s intervals
    let elapsed = 0;
    simulatedProgressRef.current = setInterval(() => {
      elapsed += 1;
      setCurrentTime(elapsed);
      // 50% milestone
      if (elapsed >= song.duration * 0.5 && !listenedSongs.has(song.id)) {
        setListenedSongs((prev) => {
          if (prev.has(song.id)) return prev;
          const next = new Set(prev);
          next.add(song.id);
          return next;
        });
        setCratePoints((p) => p + 5);
      }
      if (elapsed >= song.duration) {
        clearInterval(simulatedProgressRef.current!);
        simulatedProgressRef.current = null;
        setPlayingSongId(null);
        setCurrentTime(0);
      }
    }, 1000);
  }, [playingSongId, listenedSongs, stopSimulation]);

  // award points for listen — effect watches listenedSongs to avoid double
  // (handled inline above)

  const handleVote = useCallback((songId: string) => {
    if (votedSongs.has(songId)) return;
    if (votedSongs.size >= MAX_VOTES) {
      setShowVoteLimit(true);
      return;
    }
    setVotedSongs((prev) => {
      const next = new Set(prev);
      next.add(songId);
      return next;
    });
    setCratePoints((p) => p + 5);
  }, [votedSongs]);

  // cleanup on unmount
  useEffect(() => () => stopSimulation(), [stopSimulation]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FFFFFF" }}>
      {/* ── NAV BAR ── */}
      <nav
        className="sticky top-0 z-50 w-full flex items-center justify-between px-4 py-3"
        style={{ background: "#000000" }}
      >
        <Link to={`/lls${storeId ? `?store=${storeId}` : ""}`}>
          <img src={golokolLogo} alt="GoLokol" className="h-7 w-7" />
        </Link>

        <span className="font-display font-bold text-[20px] text-white">{genreName}</span>

        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-[16px] sm:text-[18px]" style={{ color: "#FFD600" }}>
            Crate Points: {cratePoints}
          </span>
          <Link
            to="/lls/signup"
            className="font-display font-bold text-[14px] text-white rounded-lg border-2 border-white px-[24px] py-[12px] hover:bg-white/10 transition-colors"
          >
            Save
          </Link>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
        <h1
          className="font-display font-bold text-center mb-12"
          style={{ fontSize: 40, color: "#000000" }}
        >
          {genreName} Artists
        </h1>

        {songs.length === 0 ? (
          <p className="text-center text-lg" style={{ color: "#555" }}>
            Songs for this genre coming soon. Stay tuned.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {songs.map((song) => {
              const isPlaying = playingSongId === song.id;
              const hasVoted = votedSongs.has(song.id);
              const progress = isPlaying && audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

              return (
                <div
                  key={song.id}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
                >
                  {/* image */}
                  <img
                    src={song.imageUrl}
                    alt={song.artist}
                    className="w-full h-full object-cover"
                  />

                  {/* dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* artist name */}
                  <span
                    className="absolute top-3 left-3 font-display font-bold text-[16px] text-white drop-shadow-lg leading-tight"
                    style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                  >
                    {song.artist}
                  </span>
                  <span
                    className="absolute top-8 left-3 font-display text-[12px] text-white/70 drop-shadow"
                  >
                    {song.title}
                  </span>

                  {/* controls overlay - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                    {/* vote */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(song.id);
                      }}
                      className="transition-transform hover:scale-110"
                      aria-label={hasVoted ? "Voted" : "Vote"}
                    >
                      <Heart
                        size={24}
                        className={hasVoted ? "fill-[#FFD600] text-[#FFD600]" : "text-[#FFD600]"}
                        strokeWidth={2}
                      />
                    </button>

                    {/* play/pause */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(song);
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ background: "#FFD600" }}
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause size={22} className="text-black" fill="black" />
                      ) : (
                        <Play size={22} className="text-black ml-0.5" fill="black" />
                      )}
                    </button>

                    {/* duration */}
                    <span className="font-mono text-[12px] text-white/80">
                      {isPlaying ? formatTime(currentTime) : formatTime(song.duration)}
                    </span>
                  </div>

                  {/* progress bar */}
                  {isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(255,255,255,0.2)" }}>
                      <div
                        className="h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%`, background: "#FFD600" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── VOTE LIMIT MODAL ── */}
      {showVoteLimit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6">
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "#111" }}>
            <h2 className="font-display font-bold text-[22px] text-white mb-3">
              All 3 Votes Used!
            </h2>
            <p className="text-[16px] text-white/80 mb-6">
              You've used all 3 votes this session. Sign up to save your points and unlock more votes!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowVoteLimit(false)}
                className="px-6 py-3 rounded-lg border-2 border-white/30 text-white font-display font-bold hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <Link
                to="/lls/signup"
                className="px-6 py-3 rounded-lg font-display font-bold text-black hover:opacity-90 transition-opacity"
                style={{ background: "#FFD600" }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="w-full py-8 text-center" style={{ background: "#000000" }}>
        <p className="font-display text-[14px] text-white">
          GoLokol — The future of music is local.
        </p>
      </footer>
    </div>
  );
};

export default LokolListensGenre;
