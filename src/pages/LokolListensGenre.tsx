import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Pause, SkipForward, Heart } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";
import genreHiphop from "@/assets/Genre-hiphop.png";
import genreRnb from "@/assets/Genre-rnb.png";
import genreAlternative from "@/assets/Genre-alternative.png";
import genreHardcore from "@/assets/Genre-hardcore.png";
import genreIndie from "@/assets/Genre-indie.png";
import genreJazz from "@/assets/Genre-jazz.png";

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

const DAILY_CAP = 50;
const GENERAL_SAVE_CAP = 3;
const STORE_SAVE_CAP = 5;

const trackGenreInSession = (genreLabel: string) => {
  try {
    const tokenRaw = localStorage.getItem("golokol_store_session");
    if (!tokenRaw) return;
    const token = JSON.parse(tokenRaw);
    if (!token.genres_explored) token.genres_explored = [];
    if (!token.genres_explored.includes(genreLabel)) {
      token.genres_explored.push(genreLabel);
      localStorage.setItem("golokol_store_session", JSON.stringify(token));
    }
  } catch {}
};

const trackUnder50InSession = (submissionId: string, add: boolean) => {
  try {
    const tokenRaw = localStorage.getItem("golokol_store_session");
    if (!tokenRaw) return;
    const token = JSON.parse(tokenRaw);
    if (!token.listened_under_50) token.listened_under_50 = [];
    if (add && !token.listened_under_50.includes(submissionId)) {
      token.listened_under_50.push(submissionId);
    } else if (!add) {
      token.listened_under_50 = token.listened_under_50.filter((id: string) => id !== submissionId);
    }
    localStorage.setItem("golokol_store_session", JSON.stringify(token));
  } catch {}
};

// === SOUNDS ===

// Save sound — warm ascending chord, celebratory
const playSaveSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.25, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  } catch {}
};

// Points sound — bright ping, reward feeling
const playPointsSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {}
};

// Cap sound — gentle bump, not punishing
const playCapSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(330, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {}
};

// Unsave sound — soft descending tone
const playUnsaveSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } catch {}
};

const KEYFRAMES = `
  @keyframes pointsFlash {
    0% { transform: scale(0.5); opacity: 0; }
    30% { transform: scale(1.2); opacity: 1; }
    70% { transform: scale(1.0); opacity: 1; }
    100% { transform: scale(1.0); opacity: 0; }
  }
  @keyframes sceneFlash {
    0% { opacity: 0; transform: scale(0.9); }
    20% { opacity: 1; transform: scale(1.02); }
    70% { opacity: 1; transform: scale(1.0); }
    100% { opacity: 0; transform: scale(1.0); }
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
  const [searchParams] = useSearchParams();
  const autoplayId = searchParams.get("autoplay") || "";
  const refCode = searchParams.get("ref") || localStorage.getItem("golokol_referral_code") || "";
  const audioRef = useRef<HTMLAudioElement>(null);
  const capToastShownRef = useRef(false);

  const GENRE_IMAGES: Record<string, string> = {
    "Hip-Hop": genreHiphop,
    "R&B": genreRnb,
    "Alternative": genreAlternative,
    "Hardcore": genreHardcore,
    "Indie": genreIndie,
    "Jazz": genreJazz,
  };

  const [tracks, setTracks] = useState<Track[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
  // sceneFlashIds: shows "ADDED TO YOUR LOKOL SCENE" full screen flash
  const [sceneFlashIds, setSceneFlashIds] = useState<Set<string>>(new Set());
  // pointsFlashIds: shows "+10 POINTS" flash (separate from scene flash)
  const [pointsFlashIds, setPointsFlashIds] = useState<Set<string>>(new Set());
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayTrack, setOverlayTrack] = useState<Track | null>(null);
  const [isFan, setIsFan] = useState(false);
  const [capToast, setCapToast] = useState("");
  // Unsave confirm state — which track id is pending removal confirmation
  const [unsaveConfirmId, setUnsaveConfirmId] = useState<string | null>(null);

  const hasValidTokenRef = useRef(false);
  const isFanRef = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const dailyPointsRef = useRef(0);
  const isInStoreRef = useRef(false);

  const genreLabel = SLUG_TO_GENRE[genre || ""] || genre || "";

  useEffect(() => {
    isFanRef.current = isFan;
  }, [isFan]);

  useEffect(() => {
    localStorage.setItem("golokol_saved_ids", JSON.stringify([...savedIds]));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem("golokol_session_points", points.toString());
  }, [points]);

  useEffect(() => {
    const checkToken = () => {
      try {
        const token = JSON.parse(localStorage.getItem("golokol_store_session") || "null");
        const valid = !!(token && token.expires_at > Date.now());
        hasValidTokenRef.current = valid;
        isInStoreRef.current = valid && !token?.city_session;
      } catch {
        hasValidTokenRef.current = false;
        isInStoreRef.current = false;
      }
    };
    checkToken();
    const interval = setInterval(checkToken, 10000);
    return () => clearInterval(interval);
  }, []);

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
          const todayAtlanta = getTodayAtlanta();
          const isToday = fanProfile.daily_points_date === todayAtlanta;
          dailyPointsRef.current = isToday ? fanProfile.daily_points_earned || 0 : 0;
          const dbPoints = fanProfile.lokol_points || 0;
          const localPoints = parseInt(localStorage.getItem("golokol_session_points") || "0");
          const finalPoints = Math.max(dbPoints, localPoints);
          setPoints(finalPoints);
          localStorage.setItem("golokol_session_points", finalPoints.toString());

          const { data: existingSaves } = await (supabase as any)
            .from("lokol_scene_saves")
            .select("submission_id")
            .eq("fan_user_id", session.user.id);
          if (existingSaves) {
            setSavedIds(new Set(existingSaves.map((s: any) => s.submission_id).filter(Boolean)));
          }

          const pendingSaveRaw = localStorage.getItem("golokol_pending_save");
          if (pendingSaveRaw) {
            try {
              const pendingTrack = JSON.parse(pendingSaveRaw);
              await (supabase as any).from("lokol_scene_saves").insert({
                fan_user_id: session.user.id,
                submission_id: pendingTrack.id,
                artist_name: pendingTrack.artist_name,
                store_slug: pendingTrack.store_slug || null,
              });
              setSavedIds((prev) => new Set(prev).add(pendingTrack.id));
              const pendingPts = parseInt(localStorage.getItem("golokol_pending_points") || "0");
              const newPoints = Math.max(finalPoints, pendingPts) + 10;
              setPoints(newPoints);
              localStorage.setItem("golokol_session_points", newPoints.toString());
              localStorage.removeItem("golokol_pending_save");
              localStorage.removeItem("golokol_pending_points");
            } catch {}
          }
        }
      }

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
      // Auto-play specific song if autoplay param present
      if (autoplayId) {
        const autoTrack = filtered.find((t: Track) => t.id === autoplayId);
        if (autoTrack) {
          setTimeout(() => {
            const audio = document.querySelector("audio") as HTMLAudioElement;
            if (audio) {
              audio.src = autoTrack.mp3_url;
              audio.play();
            }
            setPlayingId(autoTrack.id);
            setIsPlaying(true);
          }, 500);
        }
      }
    })();
  }, [genreLabel]);

  const awardPoints = useCallback(async (amount: number): Promise<number> => {
    if (!hasValidTokenRef.current) return 0;

    const saveCapForSession = isInStoreRef.current ? STORE_SAVE_CAP : GENERAL_SAVE_CAP;
    const pointsCapForSession = saveCapForSession * 10;

    if (dailyPointsRef.current >= pointsCapForSession) {
      if (!capToastShownRef.current) {
        capToastShownRef.current = true;
        playCapSound();
        const msg = isInStoreRef.current
          ? `You've earned 50 points saving 5 artists today! You can keep saving but artist points are capped at 50 daily.`
          : `You've earned 30 points saving 3 artists today! You can keep saving but artist points are capped at 30 daily.`;
        setCapToast(msg);
        setTimeout(() => setCapToast(""), 6000);
      }
      return 0;
    }

    const pointsToAward = Math.min(amount, DAILY_CAP - dailyPointsRef.current);

    setPoints((prev) => {
      const newVal = prev + pointsToAward;
      localStorage.setItem("golokol_session_points", newVal.toString());
      return newVal;
    });
    dailyPointsRef.current += pointsToAward;

    if (dailyPointsRef.current >= pointsCapForSession && !capToastShownRef.current) {
      capToastShownRef.current = true;
      playCapSound();
      const msg = isInStoreRef.current
        ? `You've earned 50 points saving 5 artists today! You can keep saving but artist points are capped at 50 daily.`
        : `You've earned 30 points saving 3 artists today! You can keep saving but artist points are capped at 30 daily.`;
      setCapToast(msg);
      setTimeout(() => setCapToast(""), 6000);
    }

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

  const deductPoints = useCallback(async (amount: number) => {
    if (!isFanRef.current || !userIdRef.current) return;
    const deduct = Math.min(amount, dailyPointsRef.current);
    setPoints((prev) => {
      const newVal = Math.max(0, prev - deduct);
      localStorage.setItem("golokol_session_points", newVal.toString());
      return newVal;
    });
    dailyPointsRef.current = Math.max(0, dailyPointsRef.current - deduct);
    // Reset cap toast so it can fire again if they re-save
    capToastShownRef.current = false;

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
            lokol_points: Math.max(0, fp.lokol_points - deduct),
            daily_points_earned: Math.max(0, dbDaily - deduct),
            daily_points_date: todayAtlanta,
          })
          .eq("fan_user_id", userIdRef.current);
      }
    } catch {}
  }, []);

  const handleUnsave = useCallback(
    async (track: Track) => {
      if (!isFanRef.current || !userIdRef.current) return;
      playUnsaveSound();
      setSavedIds((prev) => {
        const n = new Set(prev);
        n.delete(track.id);
        return n;
      });
      setUnsaveConfirmId(null);
      // Deduct points if they earned them (only if token was valid when they saved)
      await deductPoints(10);
      try {
        await (supabase as any)
          .from("lokol_scene_saves")
          .delete()
          .eq("fan_user_id", userIdRef.current)
          .eq("submission_id", track.id);
      } catch {}
    },
    [deductPoints],
  );

  const handlePlayToggle = (track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    trackGenreInSession(genreLabel);
    trackUnder50InSession(track.id, true);
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
      audio.currentTime = 30;
      audio.play();
      setPlayingId(track.id);
      setIsPlaying(true);
      setCurrentTime(30);
      setDuration(0);
      setUnsaveConfirmId(null);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !playingId) return;
    setCurrentTime(audio.currentTime);
    // Stop playback at 1:30 (90 seconds)
    if (audio.currentTime >= 90) {
      audio.pause();
      audio.currentTime = 30;
      setIsPlaying(false);
      setCurrentTime(30);
    }
    if (audio.duration > 0 && audio.currentTime / audio.duration >= 0.5) {
      trackUnder50InSession(playingId, false);
    }
  };

  const handleNext = () => {
    if (!playingId) return;
    const idx = tracks.findIndex((t) => t.id === playingId);
    const nextTrack = tracks[(idx + 1) % tracks.length];
    if (nextTrack) handlePlayToggle(nextTrack);
  };

  const handleSave = async (track: Track) => {
    if (!isFanRef.current) {
      setOverlayTrack(track);
      setShowOverlay(true);
      return;
    }
    if (savedIds.has(track.id) || splashIds.has(track.id)) return;

    trackGenreInSession(genreLabel);
    localStorage.setItem("golokol_last_genre_url", `/lls/${storeSlug}/genre/${genre}`);
    trackUnder50InSession(track.id, false);

    // 1. Play save sound
    playSaveSound();

    // 2. Show "ADDED TO YOUR LOKOL SCENE" full screen flash
    setSceneFlashIds((prev) => new Set(prev).add(track.id));
    setTimeout(() => {
      setSceneFlashIds((prev) => {
        const n = new Set(prev);
        n.delete(track.id);
        return n;
      });
    }, 1800);

    // 3. Award points — if points awarded show +10 flash with sound
    const awarded = await awardPoints(10);
    if (awarded > 0) {
      playPointsSound();
      setPointsFlashIds((prev) => new Set(prev).add(track.id));
      setTimeout(() => {
        setPointsFlashIds((prev) => {
          const n = new Set(prev);
          n.delete(track.id);
          return n;
        });
      }, 1500);
    }

    // 4. Save to DB
    try {
      await (supabase as any).from("lokol_scene_saves").insert({
        fan_user_id: userIdRef.current,
        submission_id: track.id,
        artist_name: track.artist_name,
        store_slug: storeSlug || null,
      });
    } catch {}

    // 5. Mark as saved (shows heart badge)
    setSavedIds((prev) => new Set(prev).add(track.id));
  };

  const currentTrack = tracks.find((t) => t.id === playingId);

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <style>{KEYFRAMES}</style>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio) return;
          setDuration(Math.min(audio.duration, 90));
          if (audio.currentTime < 30) {
            audio.currentTime = 30;
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 px-4 py-3 bg-black border-b border-gray-800 flex items-center justify-between">
        <button
          onClick={() => {
            const citySlugs = ["atlanta"];
            if (!storeSlug || citySlugs.includes(storeSlug)) {
              navigate("/discover");
            } else {
              navigate(`/lls/${storeSlug}`);
            }
          }}
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
          <div className="flex items-center">
            <span className="text-[#FFD600] font-bold text-sm">Points: {points}</span>
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
            const isSceneFlash = sceneFlashIds.has(track.id);
            const isPointsFlash = pointsFlashIds.has(track.id);

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

                {/* Saved heart badge — upper right corner */}
                {isSaved && !isSceneFlash && !isPointsFlash && (
                  <div className="absolute top-2 right-2 z-20">
                    <Heart size={20} fill="#FFD600" stroke="#FFD600" />
                  </div>
                )}

                {/* Default: play icon */}
                {!isCurrent && !isSceneFlash && !isPointsFlash && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={56} className="text-white drop-shadow-lg" strokeWidth={1.5} />
                  </div>
                )}

                {/* Playing: + save button */}
                {isCurrent && !isSaved && !isSceneFlash && !isPointsFlash && (
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

                {/* Playing saved song: show play state with heart badge */}
                {isCurrent && isSaved && !isSceneFlash && !isPointsFlash && (
                  <>
                    <div className="absolute inset-0 bg-black/30" />
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
                      <div className="absolute top-2 left-2 text-white bg-black/60 rounded-full p-1">
                        <Pause size={14} />
                      </div>
                    )}
                  </>
                )}

                {/* FULL SCREEN: ADDED TO YOUR LOKOL SCENE flash */}
                {isSceneFlash && (
                  <div
                    className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-2 rounded-2xl"
                    style={{ animation: "sceneFlash 1.8s ease-out forwards" }}
                  >
                    <Heart size={32} fill="#FFD600" stroke="#FFD600" />
                    <span
                      style={{
                        fontFamily: "'Anton', sans-serif",
                        fontSize: 18,
                        color: "#FFD600",
                        textAlign: "center",
                        lineHeight: 1.2,
                        padding: "0 8px",
                      }}
                    >
                      ADDED TO YOUR{"\n"}LOKOL SCENE
                    </span>
                  </div>
                )}

                {/* FULL SCREEN: +10 POINTS flash (after scene flash) */}
                {isPointsFlash && !isSceneFlash && (
                  <div
                    className="absolute inset-0 bg-[#FFD600]/20 ring-4 ring-[#FFD600] rounded-2xl flex items-center justify-center"
                    style={{ animation: "pointsFlash 1.5s ease-out forwards" }}
                  >
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, color: "#fff" }}>+10 POINTS</span>
                  </div>
                )}

                {/* Artist info */}
                {!isSceneFlash && !isPointsFlash && (
                  <div className="absolute bottom-2 left-2 right-8 z-10">
                    <p className="text-white font-bold text-[13px] truncate">{track.song_title}</p>
                    <p className="text-white/70 text-[11px] truncate">{track.artist_name}</p>
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

            {/* Heart unsave button */}
            <div className="relative">
              {unsaveConfirmId === currentTrack.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUnsave(currentTrack)}
                    className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/80 text-white"
                  >
                    Remove
                  </button>
                  <button onClick={() => setUnsaveConfirmId(null)} className="text-[10px] text-white/50">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (savedIds.has(currentTrack.id)) {
                      setUnsaveConfirmId(currentTrack.id);
                    } else {
                      handleSave(currentTrack);
                    }
                  }}
                  className="p-1"
                  aria-label={savedIds.has(currentTrack.id) ? "Unsave" : "Save"}
                >
                  {savedIds.has(currentTrack.id) ? (
                    <Heart size={20} fill="#FFD600" stroke="#FFD600" />
                  ) : (
                    <Heart size={20} fill="none" stroke="rgba(255,255,255,0.4)" />
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-[13px] truncate">{currentTrack.song_title}</p>
              <p className="text-white/60 text-[11px] truncate">{currentTrack.artist_name}</p>
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

      {/* Save overlay for non-fans */}
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
                localStorage.setItem("golokol_last_genre_url", `/lls/${storeSlug}/genre/${genre}`);
                const refParam = refCode ? `&ref=${refCode}` : "";
                navigate(
                  `/lls/signup?points=${points}&store=${storeSlug || ""}&artist=${encodeURIComponent(overlayTrack?.artist_name || "")}${refParam}`,
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

      {/* Cap toast */}
      {capToast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-5 py-4 rounded-xl shadow-2xl max-w-[90%] text-center"
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
