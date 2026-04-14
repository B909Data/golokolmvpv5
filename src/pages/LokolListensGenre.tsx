import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Play, Pause, Heart, SkipForward, Plus } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";
import { useToast } from "@/hooks/use-toast";

const SLUG_TO_GENRE: Record<string, string> = {
  hiphop: "Hip-Hop", rnb: "R&B", afrobeats: "Afrobeats",
  alternative: "Alternative", beats: "Beats", blues: "Blues",
  country: "Country", edm: "EDM", emo: "Emo", folk: "Folk",
  funk: "Funk", gospel: "Gospel", hardcore: "Hardcore", house: "House",
  indie: "Indie", jazz: "Jazz", latin: "Latin", metal: "Metal",
  neosoul: "Neo-Soul", pop: "Pop", punk: "Punk", rave: "Rave",
  reggae: "Reggae", rock: "Rock", ska: "Ska", spokenword: "Spoken-Word",
  techno: "Techno",
};

interface Track {
  id: string;
  artist_name: string;
  song_title: string;
  song_image_url: string;
  mp3_url: string;
  artist_user_id: string | null;
}

const LokolListensGenre = () => {
  const { genre, storeSlug } = useParams<{ genre: string; storeSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [points, setPoints] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const [overlayTrack, setOverlayTrack] = useState<Track | null>(null);
  const [pointsSplash, setPointsSplash] = useState<{ id: string; amount: number } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dailyPointsRemaining, setDailyPointsRemaining] = useState(40);
  const [userId, setUserId] = useState<string | null>(null);
  const halfAwarded = useRef<Set<string>>(new Set());

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
        const { data: fp } = await supabase
          .from("fan_profiles")
          .select("daily_points_date, daily_points_earned")
          .eq("fan_user_id", session.user.id)
          .maybeSingle();
        if (fp) {
          const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
          const dbDate = fp.daily_points_date
            ? new Date(fp.daily_points_date + "T00:00:00").toLocaleDateString("en-US", { timeZone: "America/New_York" })
            : null;
          if (dbDate === today) {
            setDailyPointsRemaining(40 - (fp.daily_points_earned || 0));
          } else {
            setDailyPointsRemaining(40);
          }
        }
      }

      const genreLabel = SLUG_TO_GENRE[genre || ""];
      if (!genreLabel) { setTracksLoading(false); return; }

      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("id, artist_name, song_title, song_image_url, mp3_url, artist_user_id, genre_style")
        .eq("admin_status", "approved")
        .not("mp3_url", "is", null);

      if (data) {
        const filtered = data.filter((row: any) => {
          const genres = (row.genre_style as string).split(",").map((s: string) => s.trim().toLowerCase());
          return genres.includes(genreLabel.toLowerCase());
        });
        setTracks(filtered.map((r: any) => ({
          id: r.id,
          artist_name: r.artist_name,
          song_title: r.song_title || "Untitled",
          song_image_url: r.song_image_url,
          mp3_url: r.mp3_url,
          artist_user_id: r.artist_user_id,
        })));
      }
      setTracksLoading(false);
    };
    init();
  }, [genre]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      if (playingId && audio.duration && audio.currentTime / audio.duration >= 0.5 && !halfAwarded.current.has(playingId)) {
        halfAwarded.current.add(playingId);
        setPoints(p => p + 5);
      }
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playingId]);

  const handlePlay = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId !== track.id) {
      audio.src = track.mp3_url;
      audio.play();
      setPlayingId(track.id);
      setIsPlaying(true);
    } else {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play(); setIsPlaying(true); }
    }
  }, [playingId, isPlaying]);

  const handleSkip = useCallback(() => {
    if (!playingId || tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === playingId);
    const next = tracks[(idx + 1) % tracks.length];
    const audio = audioRef.current;
    if (audio) {
      audio.src = next.mp3_url;
      audio.play();
      setPlayingId(next.id);
      setIsPlaying(true);
    }
  }, [playingId, tracks]);

  const handleSave = useCallback(async (track: Track) => {
    if (!isLoggedIn) {
      setOverlayTrack(track);
      setShowSaveOverlay(true);
      return;
    }
    if (savedIds.has(track.id)) return;
    if (dailyPointsRemaining <= 0) {
      toast({ title: "You've maxed out your Lokol Points for today. Come back tomorrow." });
      return;
    }
    await (supabase as any).from("fan_saves").insert({
      fan_user_id: userId,
      artist_choice: track.artist_name,
      email: "",
      name: "",
    });
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("fan_profiles").update({
      daily_points_earned: 40 - dailyPointsRemaining + 10,
      daily_points_date: today,
    } as any).eq("fan_user_id", userId!);
    await supabase.from("fan_profiles").update({
      lokol_points: (points + 10),
    } as any).eq("fan_user_id", userId!);

    setDailyPointsRemaining(r => r - 10);
    setSavedIds(prev => new Set([...prev, track.id]));
    setPoints(p => p + 10);
    setPointsSplash({ id: track.id, amount: 10 });
    setTimeout(() => setPointsSplash(null), 1200);
  }, [isLoggedIn, savedIds, dailyPointsRemaining, userId, points, toast]);

  const playingTrack = tracks.find(t => t.id === playingId);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (tracksLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-[16px]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <style>{`
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
      `}</style>
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-black border-b border-[#333]">
        <Link to={`/lls/${storeSlug || ""}`} className="text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={golokolLogo} alt="GoLokol" className="h-6 w-6" />
        <p className="text-[#FFD600] font-bold text-sm">Lokol Points: {points}</p>
      </header>

      {tracks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white text-[16px]">No songs here yet. Check back soon.</p>
        </div>
      ) : (
        <main className="flex-1 px-4 py-4 grid grid-cols-2 gap-3" style={{ paddingBottom: playingId ? 100 : 16 }}>
          {tracks.map(track => {
            const isCurrent = playingId === track.id && isPlaying;
            const alreadySaved = savedIds.has(track.id);
            return (
              <div
                key={track.id}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => handlePlay(track)}
              >
                <img src={track.song_image_url} alt={track.artist_name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Center icon */}
                {isCurrent ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSave(track); }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {alreadySaved ? (
                      <Heart className="w-12 h-12 fill-[#FFD600] text-[#FFD600]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/60" />
                  </div>
                )}

                {/* Points splash */}
                {pointsSplash?.id === track.id && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ animation: "floatUp 1.2s ease-out forwards" }}
                  >
                    <span className="text-[#FFD600] font-bold text-[24px]">+{pointsSplash.amount} pts</span>
                  </div>
                )}

                {/* Bottom text */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-[13px] truncate">{track.artist_name}</p>
                  <p className="text-white/70 text-[11px] truncate">{track.song_title}</p>
                </div>
              </div>
            );
          })}
        </main>
      )}

      {/* Bottom Player Bar */}
      {playingId && playingTrack && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] border-t border-[#333]">
          <div className="h-[2px] bg-[#333]">
            <div className="h-full bg-[#FFD600] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <img src={playingTrack.song_image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[13px] truncate">{playingTrack.artist_name}</p>
              <p className="text-white/60 text-[11px] truncate">{playingTrack.song_title}</p>
            </div>
            <button onClick={() => handlePlay(playingTrack)} className="text-white">
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </button>
            <button onClick={handleSkip} className="text-white">
              <SkipForward className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}

      {/* Save Overlay */}
      {showSaveOverlay && overlayTrack && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full text-center">
            <img src={overlayTrack.song_image_url} alt="" className="w-20 h-20 rounded-xl object-cover mx-auto mb-4" />
            <p className="text-white font-bold text-[18px]">{overlayTrack.artist_name}</p>
            <p className="text-white text-[14px] mt-2">Save {overlayTrack.artist_name} to your Atlanta Lokol Scene</p>
            <p className="text-[#FFD600] font-bold text-[16px] mt-2">+10 Lokol Points</p>
            <button
              onClick={() => navigate(`/lls/signup?points=${points}&store=${storeSlug || ""}`)}
              className="mt-6 w-full py-3 bg-[#FFD600] text-black font-bold rounded-xl text-[16px]"
            >
              Create Account
            </button>
            <button
              onClick={() => setShowSaveOverlay(false)}
              className="mt-3 text-white/50 text-sm"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LokolListensGenre;
