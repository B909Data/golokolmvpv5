import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, Heart } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const SLUG_TO_GENRE: Record<string, string> = {
  hiphop: "Hip-Hop",
  rnb: "R&B",
  afrobeats: "Afrobeats",
  alternative: "Alternative",
  beats: "Beats",
  blues: "Blues",
  country: "Country",
  edm: "EDM",
  emo: "Emo",
  folk: "Folk",
  funk: "Funk",
  gospel: "Gospel",
  hardcore: "Hardcore",
  house: "House",
  indie: "Indie",
  jazz: "Jazz",
  latin: "Latin",
  metal: "Metal",
  neosoul: "Neo-Soul",
  pop: "Pop",
  punk: "Punk",
  rave: "Rave",
  reggae: "Reggae",
  rock: "Rock",
  ska: "Ska",
  spokenword: "Spoken-Word",
  techno: "Techno",
};

const DAILY_CAP = 40;

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
  } catch (e) {}
};

const KEYFRAMES = `
  @keyframes pointsFlash {
    0% { transform: scale(0.5); opacity: 0; }
    30% { transform: scale(1.2); opacity: 1; }
    70% { transform: scale(1.0); opacity: 1; }
    100% { transform: scale(1.0); opacity: 0; }
  }
  @keyframes capToastIn {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;

interface Track {
  id: string;
  artist_name: string;
  song_title: string;
  song_image_url: string;
  mp3_url: string;
}

const getTodayAtlanta = () => new Date().toLocaleDateString("en-US", { timeZone: "America/New_York" });

const LokolListensGenre = () => {
  const { genre, storeSlug } = useParams<{ genre: string; storeSlug: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const capToastShownRef = useRef(false);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Points — local only for April 18th launch
  const [points, setPoints] = useState(() => {
    try {
      return parseInt(localStorage.getItem("golokol_session_points") || "0");
    } catch {
      return 0;
    }
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("golokol_saved_ids");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [splashIds, setSplashIds] = useState<Set<string>>(new Set());
  const [pointsAwardedIds, setPointsAwardedIds] = useState<Set<string>>(new Set());
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTrack, setOverlayTrack] = useState<Track | null>(null);
  const [isFan, setIsFan] = useState(false);
  const [capToast, setCapToast] = useState("");

  const hasValidTokenRef = useRef(false);
  const isFanRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const dailyPointsRef = useRef(0);

  const genreLabel = SLUG_TO_GENRE[genre || ""] || genre || "";

  // Sync refs with state
  useEffect(() => {
    isFanRef.current = isFan;
  }, [isFan]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("golokol_saved_ids", JSON.stringify([...savedIds]));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem("golokol_session_points", points.toString());
  }, [points]);

  // Token check
  useEffect(() => {
    const checkToken = () => {
      try {
        const token = JSON.parse(localStorage.getItem("golokol_store_session") || "null");
        hasValidTokenRef.current = !!(token && token.expires_at > Date.now());
      } catch {
        hasValidTokenRef.current = false;
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auth + data load
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        userIdRef.current = session.user.id;

        const { data: fanProfile } = await (supabase as any)
          .from("fan_profiles")
          .select("id, lokol_points, daily_points_earned, daily_points_date")
          .eq("fan_user_id", session.user.id)
          .maybeSingle();

        if (fanProfile) {
          setIsFan(true);
          isFanRef.current = true;

          // Load daily points count into ref for cap checking
          const todayAtlanta = getTodayAtlanta();
          const isToday = fanProfile.daily_points_date === todayAtlanta;
          dailyPointsRef.current = isToday ? fanProfile.daily_points_earned || 0 : 0;

          // Sync points from DB
          const dbPoints = fanProfile.lokol_points || 0;
          const localPoints = parseInt(localStorage.getItem("golokol_session_points") || "0");
          // Use whichever is higher
          const finalPoints = Math.max(dbPoints, localPoints);
          setPoints(finalPoints);
          localStorage.setItem("golokol_session_points", finalPoints.toString());

          // Show cap toast if already at limit
          if (dailyPointsRef.current >= DAILY_CAP && !capToastShownRef.current) {
            capToastShownRef.current = true;
            setCapToast("You've maxed out today's points. Keep listening — the music is still free. 🎧");
            setTimeout(() => setCapToast(""), 5000);
          }

          // Load existing saves
          const { data: existingSaves } = await (supabase as any)
            .from("lokol_scene_saves")
            .select("submission_id")
            .eq("fan_user_id", session.user.id);
          if (existingSaves) {
            setSavedIds(new Set(existingSaves.map((s: any) => s.submission_id).filter(Boolean)));
          }

          // *** HANDLE PENDING SAVE FROM PRE-SIGNUP ***
          const pendingSaveRaw = localStorage.getItem("golokol_pending_save");
          if (pendingSaveRaw) {
            try {
              const pendingTrack = JSON.parse(pendingSaveRaw);
              // Insert save to DB
              await (supabase as any).from("lokol_scene_saves").insert({
                fan_user_id: session.user.id,
                submission_id: pendingTrack.id,
                artist_name: pendingTrack.artist_name,
                store_slug: pendingTrack.store_slug || null,
              });
              // Add to local saved state
              setSavedIds((prev) => new Set(prev).add(pendingTrack.id));
              // Award 10 points locally
              const pendingPts = parseInt(localStorage.getItem("golokol_pending_points") || "0");
              const newPoints = Math.max(finalPoints, pendingPts) + 10;
              setPoints(newPoints);
              localStorage.setItem("golokol_session_points", newPoints.toString());
              // Clear pending
              localStorage.removeItem("golokol_pending_save");
              localStorage.removeItem("golokol_pending_points");
            } catch {}
          }
        }
      }

      // Load tracks
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("id, artist_name, song_title, song_image_url, mp3_url, genre_style")
        .eq("admin_status", "approved")
        .not("mp3_url", "is", null);

      const filtered = (data || []).filter(
        (row: any) => row.genre_style && row.genre_style.toLowerCase().includes(genreLabel.toLowerCase()),
      );
      setTracks(filtered);
      setTracksLoading(false);
    })();
  }, [genreLabel]);

  // Award points — local + DB
  const awardPoints = useCallback(async (amount: number): Promise<number> => {
    if (!hasValidTokenRef.current) return 0;

    // Check daily cap using ref
    if (dailyPointsRef.current >= DAILY_CAP) {
      if (!capToastShownRef.current) {
        capToastShownRef.current = true;
        setCapToast("You've hit today's 40pt limit. Keep listening — the music is still free. 🎧");
        setTimeout(() => setCapToast(""), 5000);
      }
      return 0;
    }

    const pointsToAward = Math.min(amount, DAILY_CAP - dailyPointsRef.current);

    // Update local immediately
    setPoints((prev) => {
      const newVal = prev + pointsToAward;
      localStorage.setItem("golokol_session_points", newVal.toString());
      return newVal;
    });
    dailyPointsRef.current += pointsToAward;

    // Check if we just hit the cap
    if (dailyPointsRef.current >= DAILY_CAP && !capToastShownRef.current) {
      capToastShownRef.current = true;
      setCapToast("You've hit today's 40pt limit. Keep listening — the music is still free. 🎧");
      setTimeout(() => setCapToast(""), 5000);
    }

    // Write to DB if fan
    if (isFanRef.current && userIdRef.current) {
      try {
        const { data: fp } = await (supabase as any)
          .from("fan_profiles")
          .select("lokol_points, daily_points_earned, daily_points_date")
          .eq("fan_user_id", userIdRef.current)
          .single();

        if (fp) {
          const todayAtlanta = getTodayAtlanta();
          const isToday = fp.daily_points_date === todayAtlanta;
          const dbDaily = isToday ? fp.daily_points_earned || 0 : 0;

          await (supabase as any)
            .from("fan_profiles")
            .update({
              lokol_points: fp.lokol_points + pointsToAward,
              daily_points_earned: dbDaily + pointsToAward,
              daily_points_date: todayAtlanta,
            })
            .eq("fan_user_id", userIdRef.current);
        }
      } catch {}
    }

    return pointsToAward;
  }, []);

  const handlePlayToggle = (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.src = track.mp3_url;
      audio.play();
      setPlayingId(track.id);
      setIsPlaying(true);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  const handleTimeUpdate = async () => {
    const audio = audioRef.current;
    if (!audio || !playingId) return;
    setCurrentTime(audio.currentTime);
    if (
      hasValidTokenRef.current &&
      audio.duration > 0 &&
      audio.currentTime / audio.duration >= 0.5 &&
      !pointsAwardedIds.has(playingId)
    ) {
      setPointsAwardedIds((prev) => new Set(prev).add(playingId));
      await awardPoints(5);
    }
  };

  const handleNext = () => {
    if (!playingId) return;
    const idx = tracks.findIndex((t) => t.id === playingId);
    const nextTrack = tracks[(idx + 1) % tracks.length];
    if (nextTrack) handlePlayToggle(nextTrack);
  };

  const handleSave = async (track: Track) => {
    // Not a fan yet — show signup overlay
    if (!isFanRef.current) {
      setOverlayTrack(track);
      setShowOverlay(true);
      return;
    }
    if (savedIds.has(track.id) || splashIds.has(track.id)) return;

    // Show splash immediately
    setSplashIds((prev) => new Set(prev).add(track.id));
    playRewardSound();

    // Award points + save to DB concurrently
    await Promise.all([
      awardPoints(10),
      (async () => {
        try {
          await (supabase as any).from("lokol_scene_saves").insert({
            fan_user_id: userIdRef.current,
            submission_id: track.id,
            artist_name: track.artist_name,
            store_slug: storeSlug || null,
          });
        } catch {}
      })(),
    ]);

    setTimeout(() => {
      setSplashIds((prev) => {
        const n = new Set(prev);
        n.delete(track.id);
        return n;
      });
      setSavedIds((prev) => new Set(prev).add(track.id));
    }, 1500);
  };

  const handleHeaderSave = () => {
    if (!isFanRef.current) {
      setOverlayTrack(null);
      setShowOverlay(true);
    } else {
      navigate("/fan/scene");
    }
  };

  const currentTrack = tracks.find((t) => t.id === playingId);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <style>{KEYFRAMES}</style>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 bg-black border-b border-gray-800 flex items-center justify-between">
        <button
          onClick={() => navigate(storeSlug ? `/lls/${storeSlug}` : "/lls")}
          className="text-white"
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </button>
        <img src={golokolLogo} alt="GoLokol" className="w-8 h-8" />
        {isFan ? (
          <div className="flex items-center gap-2">
            <span className="text-[#FFD600] font-bold text-sm">🎵 {points} pts</span>
            <button
              onClick={() => navigate("/fan/scene")}
              className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFD600] text-black"
            >
              My Scene
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem("golokol_saved_ids");
                localStorage.removeItem("golokol_session_points");
                localStorage.removeItem("golokol_store_session");
                navigate("/");
              }}
              className="px-3 py-1 rounded-full text-xs border border-white text-white"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-[#FFD600] font-bold text-sm">Points: {points}</span>
            <button
              onClick={handleHeaderSave}
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: "#FFD600", color: "#000" }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <h1 className="text-white font-bold text-2xl text-center py-4 border-b border-gray-800">
        Lokol {genreLabel} Artists
      </h1>

      {tracksLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#FFD600] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tracks.length === 0 ? (
        <p className="text-white text-center py-16">No songs here yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-3 py-4" style={{ paddingBottom: playingId ? 96 : 24 }}>
          {tracks.map((track) => {
            const isCurrentlyPlaying = playingId === track.id && isPlaying;
            const isCurrent = playingId === track.id;
            const isSaved = savedIds.has(track.id);
            const isSplash = splashIds.has(track.id);

            return (
              <div
                key={track.id}
                onClick={() => handlePlayToggle(track)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={track.song_image_url || "/placeholder.svg"}
                  alt={track.song_title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Default: show play icon */}
                {!isCurrent && !isSaved && !isSplash && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={56} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  </div>
                )}

                {/* Playing: show + save button */}
                {isCurrent && !isSaved && !isSplash && (
                  <>
                    <div className="absolute inset-0 bg-black/50" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(track);
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label="Save"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center text-white text-3xl font-light">
                        +
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute bottom-2 right-2 text-white"
                      aria-label="Next"
                    >
                      <SkipForward size={20} />
                    </button>
                    {isCurrentlyPlaying && (
                      <div className="absolute top-2 right-2 text-white bg-black/60 rounded-full p-1">
                        <Pause size={14} />
                      </div>
                    )}
                  </>
                )}

                {/* Splash: +10 POINTS animation */}
                {isSplash && (
                  <>
                    <div className="absolute inset-0 bg-[#FFD600]/20 ring-4 ring-[#FFD600] rounded-2xl" />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ animation: "pointsFlash 1.5s ease-out forwards" }}
                    >
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, color: "#fff" }}>+10 POINTS</span>
                    </div>
                  </>
                )}

                {/* Saved: permanent state */}
                {isSaved && !isSplash && (
                  <>
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                      <Heart size={24} fill="#FFD600" stroke="#FFD600" />
                      <span
                        style={{ fontFamily: "'Anton', sans-serif", color: "#FFD600", fontSize: 16, lineHeight: 1.1 }}
                      >
                        ADDED TO YOUR
                      </span>
                      <span
                        style={{ fontFamily: "'Anton', sans-serif", color: "#FFD600", fontSize: 16, lineHeight: 1.1 }}
                      >
                        LOKOL SCENE
                      </span>
                    </div>
                  </>
                )}

                {/* Artist info */}
                {!isSaved && !isSplash && (
                  <div className="absolute bottom-2 left-2 right-2 z-10">
                    <p className="text-white font-bold text-[13px] truncate">{track.artist_name}</p>
                    <p className="text-white/70 text-[11px] truncate">{track.song_title}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom player bar */}
      {playingId && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] z-40">
          <div
            className="absolute top-0 left-0 h-[2px] bg-[#FFD600] transition-all"
            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src={currentTrack.song_image_url || "/placeholder.svg"}
              alt=""
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[13px] truncate">{currentTrack.artist_name}</p>
              <p className="text-white/60 text-[11px] truncate">{currentTrack.song_title}</p>
            </div>
            <button
              onClick={() => handlePlayToggle(currentTrack)}
              className="text-white"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button onClick={handleNext} className="text-white" aria-label="Next">
              <SkipForward size={28} />
            </button>
          </div>
        </div>
      )}

      {/* Save overlay — shown when not a fan yet */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4">
            {overlayTrack && (
              <>
                <img
                  src={overlayTrack.song_image_url || "/placeholder.svg"}
                  alt=""
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <p className="text-white font-bold text-[18px] text-center">{overlayTrack.artist_name}</p>
                <p className="text-white text-[14px] text-center">Save to your Atlanta Lokol Scene.</p>
                {hasValidTokenRef.current && (
                  <p className="font-bold text-[14px] text-center" style={{ color: "#FFD600" }}>
                    +10 pts after signing up.
                  </p>
                )}
              </>
            )}
            <button
              onClick={() => {
                // Store pending save so it executes after signup
                if (overlayTrack) {
                  localStorage.setItem(
                    "golokol_pending_save",
                    JSON.stringify({
                      id: overlayTrack.id,
                      artist_name: overlayTrack.artist_name,
                      song_title: overlayTrack.song_title,
                      song_image_url: overlayTrack.song_image_url,
                      mp3_url: overlayTrack.mp3_url,
                      store_slug: storeSlug || "",
                    }),
                  );
                  localStorage.setItem("golokol_pending_points", points.toString());
                }
                navigate(
                  `/lls/signup?points=${points}&store=${storeSlug || ""}&artist=${encodeURIComponent(overlayTrack?.artist_name || "")}`,
                );
              }}
              className="w-full h-12 font-bold rounded-xl"
              style={{ backgroundColor: "#FFD600", color: "#000" }}
            >
              Create Account
            </button>
            <button onClick={() => setShowOverlay(false)} className="text-white/50 text-sm">
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Daily cap toast */}
      {capToast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-2xl max-w-[90%] text-center"
          style={{ backgroundColor: "#1a1a1a", border: "1px solid #FFD600", animation: "capToastIn 0.3s ease-out" }}
        >
          <p className="text-sm font-bold" style={{ color: "#FFD600" }}>
            {capToast}
          </p>
        </div>
      )}
    </div>
  );
};

export default LokolListensGenre;
