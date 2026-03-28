import { useParams, useSearchParams, Link } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import { Heart, Play, Pause, RotateCcw } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";

import imgFenixFlo from "@/assets/Hiphop-fenixandflo.jpeg";
import imgJointdexter from "@/assets/Hiphop-Jointdexter.png";
import imgSque3eze from "@/assets/Hiphop-Sque3eze-Rock.png";

import audioFenixFlo from "@/assets/audio/Hiphop-FenixandFlo-WhoSaidP2.mp3";
import audioJointdexter from "@/assets/audio/Hiphop-JointDexterandYoshi-Fye.mp3";
import audioSque3eze from "@/assets/audio/Hiphop-Sque3eze-Rock.mp3";

function slugToGenre(slug: string) {
  const map: Record<string, string> = {
    hiphop: "Hip Hop",
    rnb: "RnB",
    alternativesoul: "Alternative Soul",
  };
  return map[slug] || slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
}

const SONGS_BY_GENRE: Record<string, Song[]> = {
  hiphop: [
    { id: "hh1", title: "Who Said? Pt.2", artist: "Fenix&Flo", imageUrl: imgFenixFlo, audioUrl: audioFenixFlo, duration: 164 },
    { id: "hh2", title: "Fye", artist: "Jointdexter", imageUrl: imgJointdexter, audioUrl: audioJointdexter, duration: 129 },
    { id: "hh3", title: "Rock", artist: "Sque3eze", imageUrl: imgSque3eze, audioUrl: audioSque3eze, duration: 153 },
  ],
  rnb: [],
  alternativesoul: [],
};

const MAX_VOTES = 3;

const LokolListensGenre = () => {
  const { genre } = useParams<{ genre: string }>();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("store") || "";
  const genreName = genre ? slugToGenre(genre) : "Unknown";
  const songs = (genre && SONGS_BY_GENRE[genre]) || [];

  const [cratePoints, setCratePoints] = useState(0);
  const [votedSongs, setVotedSongs] = useState<Set<string>>(new Set());
  const [listenedSongs, setListenedSongs] = useState<Set<string>>(new Set());
  const [showVoteLimit, setShowVoteLimit] = useState(false);

  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (playingSongId && audio.duration > 0 && audio.currentTime >= audio.duration * 0.5) {
        setListenedSongs((prev) => {
          if (prev.has(playingSongId)) return prev;
          const next = new Set(prev);
          next.add(playingSongId);
          setCratePoints((p) => p + 5);
          return next;
        });
      }
    };

    const onEnded = () => {
      setPlayingSongId(null);
      setCurrentTime(0);
    };

    const onLoadedMetadata = () => setAudioDuration(audio.duration);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [playingSongId]);

  const handlePlay = useCallback(
    (song: Song) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (playingSongId === song.id) {
        audio.pause();
        setPlayingSongId(null);
        return;
      }

      if (playingSongId !== song.id) {
        audio.src = song.audioUrl;
        audio.load();
        setCurrentTime(0);
        setAudioDuration(song.duration);
      }
      audio.play().catch(() => {});
      setPlayingSongId(song.id);
    },
    [playingSongId]
  );

  const handleRewind = useCallback(
    (songId: string) => {
      const audio = audioRef.current;
      if (!audio || playingSongId !== songId) return;
      audio.currentTime = 0;
      setCurrentTime(0);
    },
    [playingSongId]
  );

  const handleVote = useCallback(
    (songId: string) => {
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
    },
    [votedSongs]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#000000" }}>
      {/* NAV */}
      <nav className="sticky top-0 z-50 w-full flex items-center justify-between px-4 py-3" style={{ background: "#000000", borderBottom: "1px solid #222" }}>
        <Link to={`/lls${storeId ? `?store=${storeId}` : ""}`}>
          <img src={golokolLogo} alt="GoLokol" className="h-5 w-5" />
        </Link>
        <span className="font-bold text-[18px] text-white">{genreName}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[14px]" style={{ color: "#FFD600" }}>
            Crate Points: {cratePoints}
          </span>
          <Link
            to="/lls/signup"
            className="font-bold text-[12px] text-white rounded-md border-2 border-white px-[16px] py-[8px] hover:bg-white/10 transition-colors"
          >
            Save
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 w-full px-4 py-6">
        <h1 className="font-bold text-center mb-8 text-white" style={{ fontSize: 32 }}>
          {genreName} Artists
        </h1>

        {songs.length === 0 ? (
          <p className="text-center text-base" style={{ color: "#888" }}>
            Songs for this genre coming soon. Stay tuned.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {songs.map((song) => {
              const isPlaying = playingSongId === song.id;
              const progress = isPlaying && audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;
              const hasVoted = votedSongs.has(song.id);

              return (
                <div key={song.id} className="w-full rounded-xl overflow-hidden" style={{ background: "#1A1A1A" }}>
                  {/* Image */}
                  <div className="relative w-full aspect-square">
                    <img src={song.imageUrl} alt={song.artist} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="font-bold text-[20px] text-white drop-shadow-lg block" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                        {song.artist}
                      </span>
                      <span className="text-[13px] text-white/70 drop-shadow">{song.title}</span>
                    </div>
                    {/* Progress bar on image bottom */}
                    {isPlaying && (
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(255,255,255,0.15)" }}>
                        <div className="h-full transition-[width] duration-200 ease-linear" style={{ width: `${progress}%`, background: "#FFD600" }} />
                      </div>
                    )}
                  </div>

                  {/* Info bar */}
                  <div className="flex items-center justify-between px-4" style={{ height: 70, background: "#1A1A1A" }}>
                    {/* Vote */}
                    <button onClick={() => handleVote(song.id)} className="transition-transform active:scale-90" aria-label={hasVoted ? "Voted" : "Vote"}>
                      <Heart size={24} className={hasVoted ? "fill-[#FFD600] text-[#FFD600]" : "text-[#FFD600]"} strokeWidth={2} />
                    </button>

                    {/* Play + Rewind */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlay(song)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90"
                        style={{ background: "#FFD600" }}
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <Pause size={20} className="text-black" fill="black" />
                        ) : (
                          <Play size={20} className="text-black ml-0.5" fill="black" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRewind(song.id)}
                        className="w-7 h-7 rounded-md border-2 flex items-center justify-center transition-transform active:scale-90"
                        style={{ borderColor: "#FFD600" }}
                        aria-label="Rewind"
                      >
                        <RotateCcw size={14} style={{ color: "#FFD600" }} />
                      </button>
                    </div>

                    {/* Duration */}
                    <span className="font-bold text-[14px] text-white">
                      {isPlaying ? `${formatTime(currentTime)} / ${formatTime(audioDuration)}` : formatTime(song.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Vote limit modal */}
      {showVoteLimit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6">
          <div className="rounded-2xl p-8 max-w-sm w-full text-center" style={{ background: "#1A1A1A" }}>
            <h2 className="font-bold text-[22px] text-white mb-3">All 3 Votes Used!</h2>
            <p className="text-[16px] text-white/80 mb-6">
              You've used all 3 votes this session. Sign up to save your points and unlock more votes!
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowVoteLimit(false)} className="px-6 py-3 rounded-lg border-2 border-white/30 text-white font-bold hover:bg-white/10 transition-colors">
                Close
              </button>
              <Link to="/lls/signup" className="px-6 py-3 rounded-lg font-bold text-black hover:opacity-90 transition-opacity" style={{ background: "#FFD600" }}>
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-6 text-center mt-12" style={{ background: "#000000" }}>
        <p className="text-[12px] text-white">GoLokol — The future of music is local.</p>
      </footer>
    </div>
  );
};

export default LokolListensGenre;
