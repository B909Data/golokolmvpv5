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

const playRewardSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.setValueAtTime(659.25, now + 0.15);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.start(now);
    osc1.stop(now + 0.6);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(783.99, now + 0.15);
    gain2.gain.setValueAtTime(0.2, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (e) {
    // Silent fail
  }
};

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
  const [flashingId, setFlashingId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFan, setIsFan] = useState(false);
  const [dailyPointsRemaining, setDailyPointsRemaining] = useState(40);
  const [userId, setUserId] = useState<string | null>(null);
  const [hasValidToken, setHasValidToken] = useState(false);
  const halfAwarded = useRef<Set<string>>(new Set());
  const sessionTrackWritten = useRef<Set<string>>(new Set());

  const readToken = useCallback(() => {
    try {
      const raw = localStorage.getItem("golokol_store_session");
      const t = raw ? JSON.parse(raw) : null;
      if (t && t.expires_at > Date.now()) return t;
    } catch {}
    return null;
  }, []);

  const writeToken = useCallback((updater: (t: any) => any) => {
    try {
      const raw = localStorage.getItem("golokol_store_session");
      const t = raw ? JSON.parse(raw) : null;
      if (!t) return;
      const next = updater(t);
      localStorage.setItem("golokol_store_session", JSON.stringify(next));
    } catch {}
  }, []);

  const todayAtlanta = useCallback(() => {
    const d = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
    const [m, day, y] = d.split("/");
    return `${y}-${m.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data: fp } = await (supabase as any)
          .from("fan_profiles")
          .select("daily_points_date, daily_points_earned, lokol_points")
          .eq("fan_user_id", session.user.id)
          .maybeSingle();
        if (fp) {
          setIsLoggedIn(true);
          setIsFan(true);
          const today = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });
          const dbDate = fp.daily_points_date
            ? new Date(fp.daily_points_date + "T00:00:00").toLocaleDateString("en-US", { timeZone: "America/New_York" })
            : null;
          if (dbDate === today) {
            setDailyPointsRemaining(40 - (fp.daily_points_earned || 0));
          } else {
            setDailyPointsRemaining(40);
          }
          setPoints(fp.lokol_points || 0);
        } else {
          // Logged in but no fan profile (e.g. artist account)
          setIsLoggedIn(true);
          setIsFan(false);
        }
      }

      // Read session token
      setHasValidToken(!!readToken());

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
      if (playingId && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        // Update token under_50 list
        if (pct < 50) {
          writeToken((t) => {
            if (!t.listened_under_50.includes(playingId)) {
              t.listened_under_50 = [...t.listened_under_50, playingId];
            }
            return t;
          });
        } else {
          writeToken((t) => {
            t.listened_under_50 = t.listened_under_50.filter((id: string) => id !== playingId);
            return t;
          });
        }
        // 50%+ awards & DB write
        if (pct >= 50 && !halfAwarded.current.has(playingId)) {
          halfAwarded.current.add(playingId);
          const token = readToken();
          if (hasValidToken && isFan && userId && dailyPointsRemaining > 0) {
            const today = todayAtlanta();
            (supabase as any).from("fan_profiles").update({
              lokol_points: points + 5,
              daily_points_earned: (40 - dailyPointsRemaining) + 5,
              daily_points_date: today,
              last_store_slug: token?.store_slug || null,
              last_store_visit: new Date().toISOString(),
            }).eq("fan_user_id", userId).then(() => {});
            setPoints(p => p + 5);
            setDailyPointsRemaining(r => r - 5);
            writeToken((t) => { t.points_earned = (t.points_earned || 0) + 5; return t; });
          }
          // Write fan_session_tracks (50% complete)
          if (userId && token && !sessionTrackWritten.current.has(playingId + ":listen")) {
            sessionTrackWritten.current.add(playingId + ":listen");
            (supabase as any).from("fan_session_tracks").insert({
              fan_user_id: userId,
              submission_id: playingId,
              store_slug: token.store_slug,
              genre: SLUG_TO_GENRE[genre || ""] || null,
              listen_pct: 50,
              saved: false,
              session_date: todayAtlanta(),
            }).then(() => {});
          }
        }
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
  }, [playingId, hasValidToken, isFan, userId, dailyPointsRemaining, points, genre, readToken, writeToken, todayAtlanta]);

  const handlePlay = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId !== track.id) {
      audio.src = track.mp3_url;
      audio.play();
      setPlayingId(track.id);
      setIsPlaying(true);
      // Track genre explored in token
      writeToken((t) => {
        const g = SLUG_TO_GENRE[genre || ""];
        if (g && !t.genres_explored.includes(g)) {
          t.genres_explored = [...t.genres_explored, g];
        }
        return t;
      });
    } else {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play(); setIsPlaying(true); }
    }
  }, [playingId, isPlaying, genre, writeToken]);

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
    if (!isFan) {
      setOverlayTrack(track);
      setShowSaveOverlay(true);
      return;
    }
    if (savedIds.has(track.id)) return;

    const awardPoints = hasValidToken && dailyPointsRemaining > 0;
    if (hasValidToken && dailyPointsRemaining <= 0) {
      toast({ title: "You've maxed out your Lokol Points for today. Come back tomorrow." });
      return;
    }

    // Phase 1: flash
    setFlashingId(track.id);
    playRewardSound();

    const token = readToken();

    await (supabase as any).from("fan_saves").insert({
      fan_user_id: userId,
      artist_choice: track.artist_name,
      email: "",
      name: "",
    });

    if (awardPoints) {
      const today = todayAtlanta();
      await (supabase as any).from("fan_profiles").update({
        lokol_points: points + 10,
        daily_points_earned: (40 - dailyPointsRemaining) + 10,
        daily_points_date: today,
        last_store_slug: token?.store_slug || null,
        last_store_visit: new Date().toISOString(),
      }).eq("fan_user_id", userId!);
      setDailyPointsRemaining(r => r - 10);
      setPoints(p => p + 10);
      writeToken((t) => {
        t.points_earned = (t.points_earned || 0) + 10;
        t.listened_under_50 = t.listened_under_50.filter((id: string) => id !== track.id);
        return t;
      });
    } else {
      writeToken((t) => {
        t.listened_under_50 = t.listened_under_50.filter((id: string) => id !== track.id);
        return t;
      });
    }

    // Write fan_session_tracks for save
    if (token && userId) {
      const currentListenPct = duration > 0 && playingId === track.id
        ? Math.round((currentTime / duration) * 100)
        : 0;
      (supabase as any).from("fan_session_tracks").insert({
        fan_user_id: userId,
        submission_id: track.id,
        store_slug: token.store_slug,
        genre: SLUG_TO_GENRE[genre || ""] || null,
        listen_pct: currentListenPct,
        saved: true,
        session_date: todayAtlanta(),
      }).then(() => {});
    }

    // After 1.5s transition to Phase 2 (permanent saved)
    setTimeout(() => {
      setFlashingId(null);
      setSavedIds(prev => new Set([...prev, track.id]));
    }, 1500);
  }, [isFan, savedIds, dailyPointsRemaining, userId, points, toast, hasValidToken, readToken, writeToken, todayAtlanta, currentTime, duration, playingId, genre]);

  const handleHeaderSave = useCallback(() => {
    if (isFan) {
      navigate("/fan/scene");
    } else {
      // Show overlay with first track or generic
      setOverlayTrack(tracks[0] || null);
      setShowSaveOverlay(true);
    }
  }, [isFan, navigate, tracks]);

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
        @keyframes pointsFlash {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(1.0); opacity: 1; }
          100% { transform: scale(1.0); opacity: 0; }
        }
      `}</style>
      <audio ref={audioRef} />

      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-black border-b border-[#333]">
        <Link to={storeSlug ? `/lls/${storeSlug}` : "/lls"} className="text-white">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <img src={golokolLogo} alt="GoLokol" className="h-6 w-6" />
          <p className="text-[#FFD600] font-bold text-sm">{points} pts</p>
        </div>
        <button
          onClick={handleHeaderSave}
          className="bg-[#FFD600] text-black font-bold text-xs px-3 py-1 rounded-full"
        >
          Save
        </button>
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
            const isFlashing = flashingId === track.id;
            return (
              <div
                key={track.id}
                className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer ${isFlashing ? "ring-4 ring-[#FFD600]" : ""}`}
                onClick={() => handlePlay(track)}
              >
                <img src={track.song_image_url} alt={track.artist_name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Phase 1: Points flash overlay */}
                {isFlashing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"
                    style={{ animation: "pointsFlash 1.5s ease-out forwards" }}
                  >
                    <span
                      className="text-white font-bold text-[32px]"
                      style={{ fontFamily: "'Anton', sans-serif" }}
                    >
                      +10 POINTS
                    </span>
                  </div>
                )}

                {/* Phase 2: Permanent saved state */}
                {alreadySaved && !isFlashing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                    <Heart className="w-6 h-6 fill-[#FFD600] text-[#FFD600] mb-1" />
                    <p className="text-[#FFD600] text-[18px] leading-tight text-center" style={{ fontFamily: "'Anton', sans-serif" }}>
                      ADDED TO YOUR
                    </p>
                    <p className="text-[#FFD600] text-[18px] leading-tight text-center" style={{ fontFamily: "'Anton', sans-serif" }}>
                      LOKOL SCENE
                    </p>
                  </div>
                )}

                {/* Unsaved: show play or + button */}
                {!alreadySaved && !isFlashing && (
                  <>
                    {isCurrent ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSave(track); }}
                        className="absolute inset-0 flex items-center justify-center z-10"
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/60" />
                      </div>
                    )}
                  </>
                )}

                {/* Bottom text */}
                <div className="absolute bottom-3 left-3 right-3 z-20">
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
      {showSaveOverlay && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full text-center">
            {overlayTrack && (
              <>
                <img src={overlayTrack.song_image_url} alt="" className="w-20 h-20 rounded-xl object-cover mx-auto mb-4" />
                <p className="text-white font-bold text-[18px]">{overlayTrack.artist_name}</p>
                <p className="text-white text-[14px] mt-2">Save {overlayTrack.artist_name} to your Atlanta Lokol Scene</p>
              </>
            )}
            {!overlayTrack && (
              <p className="text-white font-bold text-[18px] mb-2">Save artists to your Lokol Scene</p>
            )}
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
