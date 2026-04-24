import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Info, Plus, Play, Pause, X, ArrowLeft } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import fanmenuArtists from "@/assets/fanmenu-artists.svg";
import fanmenuShows from "@/assets/fanmenu-shows.svg";
import fanmenuMarket from "@/assets/fanmenu-market.svg";
import fanmenuHome from "@/assets/fanmenu-home.svg";
import CratesATL from "@/assets/CratesATL.svg";
import DBSlogo from "@/assets/DBSlogo.svg";
import MoodsMusic from "@/assets/MoodsMusic.svg";
import lokolHome1 from "@/assets/lokolhome-1.jpg";
import lokolHome2 from "@/assets/lokolhome-2.jpg";
import lokolHome3 from "@/assets/lokolhome-3.jpg";

type View = "home" | "artists" | "shows" | "market";
const HOME_IMAGES = [lokolHome1, lokolHome2, lokolHome3];

interface FanProfile {
  id: string;
  fan_user_id: string;
  name: string | null;
  email: string | null;
  lokol_points: number | null;
  city: string | null;
}

interface SavedArtist {
  id: string;
  artist_choice: string;
  submission_id?: string | null;
  submission?: {
    id?: string;
    artist_name: string;
    song_title: string;
    song_image_url: string | null;
    youtube_url: string | null;
    instagram_handle: string | null;
    artist_user_id: string | null;
  };
}

interface ShowListing {
  id: string;
  event_name: string;
  venue_name: string;
  show_date: string;
  show_time: string | null;
  ticket_url: string | null;
  artist_user_id: string;
}

interface MissedTrack {
  id: string;
  artist_name: string;
  song_title: string;
  song_image_url: string | null;
  mp3_url: string | null;
  genre_style: string | null;
}

interface StoreSession {
  store_slug: string;
  store_name?: string;
  created_at: number;
  expires_at: number;
  genres_explored: string[];
  listened_under_50: string[];
  points_earned: number;
  scan_bonus_awarded?: boolean;
  city_session?: boolean;
}

const anton = "'Anton', sans-serif";

const formatCountdown = (ms: number): string => {
  if (ms <= 0) return "0m";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const getYouTubeId = (url: string): string | null => {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
      /youtube\.com\/shorts\/([^&?/\s]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
  } catch {}
  return null;
};

const FanScene = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [saves, setSaves] = useState<SavedArtist[]>([]);
  const [shows, setShows] = useState<ShowListing[]>([]);
  const [activeView, setActiveView] = useState<View>("home");
  const [homeImage, setHomeImage] = useState<string | null>(null);
  const [storeSession, setStoreSession] = useState<StoreSession | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [expiredBannerDismissed, setExpiredBannerDismissed] = useState(false);
  const [missedTracks, setMissedTracks] = useState<MissedTrack[]>([]);
  const [lastGenreUrl, setLastGenreUrl] = useState<string | null>(null);

  // YouTube modal state
  const [youtubeModal, setYoutubeModal] = useState<{ artist: SavedArtist } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("golokol_last_genre_url");
    if (stored) setLastGenreUrl(stored);
    let idx = Math.floor(Math.random() * HOME_IMAGES.length);
    setHomeImage(HOME_IMAGES[idx]);
    const rotateInterval = setInterval(() => {
      idx = (idx + 1) % HOME_IMAGES.length;
      setHomeImage(HOME_IMAGES[idx]);
    }, 6000);
    return () => clearInterval(rotateInterval);
  }, []);

  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem("golokol_store_session") || "null") as StoreSession | null;
      if (session) {
        setStoreSession(session);
        const valid = session.expires_at > Date.now();
        setTokenValid(valid);
        setTokenExpired(!valid);
        if (valid) {
          const tick = () => {
            const remaining = session.expires_at - Date.now();
            if (remaining <= 0) {
              setTokenValid(false);
              setTokenExpired(true);
              setCountdown("");
            } else {
              setCountdown(formatCountdown(remaining));
            }
          };
          tick();
          const interval = setInterval(tick, 1000);
          return () => clearInterval(interval);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/lls/signup", { replace: true });
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      let prof: FanProfile | null = null;
      const { data: profData } = await (supabase as any)
        .from("fan_profiles")
        .select("*")
        .eq("fan_user_id", userId)
        .maybeSingle();
      if (profData) {
        prof = profData;
      } else {
        const { data: newProf } = await (supabase as any)
          .from("fan_profiles")
          .insert({ fan_user_id: userId, city: "Atlanta", lokol_points: 0 })
          .select()
          .single();
        prof = newProf;
      }
      setProfile(prof);

      const { data: savesData } = await (supabase as any)
        .from("lokol_scene_saves")
        .select("id, submission_id, artist_name")
        .eq("fan_user_id", userId);

      if (savesData && savesData.length > 0) {
        const submissionIds = savesData.map((s: any) => s.submission_id).filter(Boolean);
        let subs: any[] = [];
        if (submissionIds.length > 0) {
          const { data: subData } = await (supabase as any)
            .from("lls_artist_submissions")
            .select("id, artist_name, song_title, song_image_url, youtube_url, instagram_handle, artist_user_id")
            .in("id", submissionIds);
          if (subData) subs = subData;
        }
        const enriched = savesData.map((s: any) => ({
          ...s,
          artist_choice: s.artist_name,
          submission: subs.find((sub: any) => sub.id === s.submission_id),
        }));
        setSaves(enriched as SavedArtist[]);
      }

      const { data: showsData } = await supabase
        .from("show_listings")
        .select("*")
        .eq("city", "Atlanta")
        .order("show_date", { ascending: true });
      if (showsData) setShows(showsData);
      setLoading(false);
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!tokenExpired || !storeSession || !userId) return;
    const loadMissed = async () => {
      const genres = storeSession.genres_explored || [];
      const underIds = storeSession.listened_under_50 || [];
      if (genres.length === 0 && underIds.length === 0) return;

      const savedSubmissionIds = new Set(
        saves.map((s) => s.submission_id || s.submission?.id).filter(Boolean) as string[],
      );

      let query = (supabase as any)
        .from("lls_artist_submissions")
        .select("id, artist_name, song_title, song_image_url, mp3_url, genre_style")
        .eq("admin_status", "approved");
      if (genres.length > 0) query = query.in("genre_style", genres);

      const { data } = await query;
      if (!data) return;

      const filtered = (data as MissedTrack[]).filter((t) => t.mp3_url && !savedSubmissionIds.has(t.id));
      const priority = filtered.filter((t) => underIds.includes(t.id));
      const rest = filtered.filter((t) => !underIds.includes(t.id));
      setMissedTracks([...priority, ...rest]);
    };
    loadMissed();
  }, [tokenExpired, storeSession, userId, saves]);

  const points = profile?.lokol_points || 0;
  const progressPct = Math.min((points / 300) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: View; icon: string; label: string }[] = [
    { key: "home", icon: fanmenuHome, label: "Home" },
    { key: "artists", icon: fanmenuArtists, label: "Artists" },
    { key: "shows", icon: fanmenuShows, label: "Shows" },
    { key: "market", icon: fanmenuMarket, label: "Market" },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-black">
        <div className="flex items-center gap-3">
          <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
          {lastGenreUrl && (
            <button
              onClick={() => navigate(lastGenreUrl)}
              className="flex items-center gap-1 text-[#FFD600] text-xs font-bold"
            >
              <ArrowLeft size={14} />
              Back to music
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem("golokol_saved_ids");
              localStorage.removeItem("golokol_session_points");
              localStorage.removeItem("golokol_store_session");
              localStorage.removeItem("golokol_last_genre_url");
              navigate("/");
            }}
            className="text-[11px] text-white/40"
          >
            Sign Out
          </button>
          <button onClick={() => navigate("/fan/info")} className="text-[#FFD600]">
            <Info className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pt-14 pb-24">
        {activeView === "home" && (
          <HomeView
            homeImage={homeImage}
            tokenValid={tokenValid}
            tokenExpired={tokenExpired}
            countdown={countdown}
            storeSession={storeSession}
            expiredBannerDismissed={expiredBannerDismissed}
            onDismissExpired={() => setExpiredBannerDismissed(true)}
            onKeepDiscovering={() => storeSession && navigate(`/lls/${storeSession.store_slug}`)}
            onGoToMarket={() => setActiveView("market")}
            missedTracks={missedTracks}
            saves={saves}
            setSaves={setSaves}
            userId={userId}
            navigate={navigate}
          />
        )}
        {activeView === "artists" && (
          <ArtistsTab
            saves={saves}
            onArtistTap={(s) => setYoutubeModal({ artist: s })}
            onRemoveArtist={async (s) => {
              if (!userId || !s.submission_id) return;
              try {
                await (supabase as any)
                  .from("lokol_scene_saves")
                  .delete()
                  .eq("fan_user_id", userId)
                  .eq("submission_id", s.submission_id);
                setSaves(prev => prev.filter(save => save.id !== s.id));
              } catch {}
            }}
          />
        )}
        {activeView === "shows" && <ShowsTab shows={shows} saves={saves} />}
        {activeView === "market" && <MarketTab points={points} progressPct={progressPct} />}
      </div>

      {/* Fixed Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#222] flex">
        {tabs.map((t) => {
          const isActive = activeView === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveView(t.key)}
              className="flex-1 flex flex-col items-center py-2 gap-1"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ border: `2px solid ${isActive ? "#FFD600" : "#555"}` }}
              >
                <img
                  src={t.icon}
                  alt={t.label}
                  className="w-8 h-8"
                  style={{ opacity: isActive ? 1 : 0.4, filter: isActive ? "none" : "brightness(0) invert(1)" }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: isActive ? "#FFD600" : "rgba(255,255,255,0.4)" }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* YouTube Modal */}
      {youtubeModal && <YouTubeModal artist={youtubeModal.artist} onClose={() => setYoutubeModal(null)} />}
    </div>
  );
};

/* ========== YOUTUBE MODAL ========== */
function YouTubeModal({ artist, onClose }: { artist: SavedArtist; onClose: () => void }) {
  const sub = artist.submission;
  const youtubeId = sub?.youtube_url ? getYouTubeId(sub.youtube_url) : null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col" onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: "#FFD600" }}>
            {sub?.artist_name || artist.artist_choice}
          </p>
          <p className="text-white/60 text-sm">{sub?.song_title}</p>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white p-2">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
        {youtubeId ? (
          <div className="w-full" style={{ maxWidth: 600 }}>
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title={sub?.song_title || ""}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center px-8">
            {sub?.song_image_url && (
              <img src={sub.song_image_url} alt="" className="w-48 h-48 rounded-xl object-cover" />
            )}
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: "#fff" }}>
              {sub?.artist_name || artist.artist_choice}
            </p>
            <p className="text-white/50 text-sm">Video coming soon.</p>
            {sub?.instagram_handle && (
              <a
                href={`https://instagram.com/${sub.instagram_handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFD600] text-sm underline"
              >
                {sub.instagram_handle} on Instagram
              </a>
            )}
          </div>
        )}
      </div>

      {sub?.instagram_handle && youtubeId && (
        <div className="px-4 pb-8 text-center">
          <a
            href={`https://instagram.com/${sub.instagram_handle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFD600] text-sm underline"
          >
            {sub.instagram_handle}
          </a>
        </div>
      )}
    </div>
  );
}

/* ========== HOME VIEW ========== */
function HomeView({
  homeImage,
  tokenValid,
  tokenExpired,
  countdown,
  storeSession,
  expiredBannerDismissed,
  onDismissExpired,
  onKeepDiscovering,
  onGoToMarket,
  missedTracks,
  saves,
  setSaves,
  userId,
  navigate,
}: {
  homeImage: string | null;
  tokenValid: boolean;
  tokenExpired: boolean;
  countdown: string;
  storeSession: StoreSession | null;
  expiredBannerDismissed: boolean;
  onDismissExpired: () => void;
  onKeepDiscovering: () => void;
  onGoToMarket: () => void;
  missedTracks: MissedTrack[];
  saves: SavedArtist[];
  setSaves: (s: SavedArtist[]) => void;
  userId: string | null;
  navigate: (path: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedMissedIds, setSavedMissedIds] = useState<Set<string>>(new Set());

  const handlePlay = useCallback(
    (track: MissedTrack) => {
      const audio = audioRef.current;
      if (!audio || !track.mp3_url) return;
      if (playingId !== track.id) {
        audio.src = track.mp3_url;
        audio.play();
        setPlayingId(track.id);
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio.play();
          setIsPlaying(true);
        }
      }
    },
    [playingId, isPlaying],
  );

  const handleSaveMissed = useCallback(
    async (track: MissedTrack) => {
      if (!userId || savedMissedIds.has(track.id)) return;
      setSavedMissedIds((prev) => new Set([...prev, track.id]));
      await (supabase as any).from("lokol_scene_saves").insert({
        fan_user_id: userId,
        submission_id: track.id,
        artist_name: track.artist_name,
      });
      setSaves([
        ...saves,
        {
          id: crypto.randomUUID(),
          artist_choice: track.artist_name,
          submission_id: track.id,
          submission: {
            id: track.id,
            artist_name: track.artist_name,
            song_title: track.song_title,
            song_image_url: track.song_image_url,
            youtube_url: null,
            instagram_handle: null,
            artist_user_id: null,
          },
        },
      ]);
    },
    [userId, savedMissedIds, saves, setSaves],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-56px-96px)]">
      <audio ref={audioRef} />

      {tokenValid && storeSession && countdown && !storeSession.city_session && (
        <div className="bg-[#FFD600] text-black px-4 py-3 flex items-center justify-between gap-3 relative z-20">
          <p className="text-sm font-bold flex-1">
            Your {storeSession.store_name || storeSession.store_slug} discovery access ends in{" "}
            <span className="underline">{countdown}</span>
          </p>
          <button
            onClick={onKeepDiscovering}
            className="bg-black text-[#FFD600] px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
          >
            Keep Discovering
          </button>
        </div>
      )}

      {tokenExpired && storeSession && !expiredBannerDismissed && !storeSession.city_session && (
        <div className="bg-[#1a1a1a] text-white px-4 py-3 flex items-center justify-between gap-3 relative z-20">
          <p className="text-sm flex-1">
            Earn more points —{" "}
            <button
              onClick={() => {
                onDismissExpired();
                onGoToMarket();
              }}
              className="text-[#FFD600] underline font-bold"
            >
              visit
            </button>{" "}
            a Lokol Listening Station
          </p>
          <button onClick={onDismissExpired} className="text-white/60 text-xl leading-none" aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <div className="relative">
        {homeImage && (
          <img
            src={homeImage}
            alt=""
            className="absolute right-0 top-0 h-[70vh] w-[65%] object-cover object-top"
            style={{ filter: "sepia(0.5) saturate(2) hue-rotate(10deg) brightness(0.75) contrast(1.1)" }}
          />
        )}
        <div className="relative z-10 pl-5 pt-5">
          <p style={{ fontFamily: anton, fontSize: 72, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
          <p style={{ fontFamily: anton, fontSize: 72, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
          <p style={{ fontFamily: anton, fontSize: 72, lineHeight: 0.9, color: "#FFD600" }}>SCENE</p>
          <p style={{ fontFamily: anton, fontSize: 56, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
          <button
            onClick={() => navigate("/discover")}
            className="mt-4 px-6 py-3 rounded-full font-bold text-sm"
            style={{ backgroundColor: "#FFD600", color: "#000" }}
          >
            Discover More Music
          </button>
        </div>
      </div>

      {tokenExpired && storeSession && missedTracks.length > 0 && (
        <div className="relative z-10 mt-[60vh] px-5 pt-8 pb-4">
          <h2 style={{ fontFamily: anton, fontSize: 20, color: "#fff", textTransform: "uppercase" }} className="mb-1">
            Music you might've missed
          </h2>
          <p className="text-white/50 text-xs mb-4">at {storeSession.store_name || storeSession.store_slug}</p>
          <div className="grid grid-cols-2 gap-3">
            {missedTracks.map((track) => {
              const isCurrent = playingId === track.id;
              const isSaved = savedMissedIds.has(track.id);
              return (
                <div key={track.id}>
                  <div className="relative">
                    <button
                      onClick={() => handlePlay(track)}
                      className="w-full aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] relative"
                    >
                      {track.song_image_url ? (
                        <img
                          src={track.song_image_url}
                          alt={track.artist_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">♪</div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-10 h-10 text-white" />
                        ) : (
                          <Play className="w-10 h-10 text-white" />
                        )}
                      </div>
                    </button>
                    {!isSaved && (
                      <button
                        onClick={() => handleSaveMissed(track)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FFD600] flex items-center justify-center"
                        aria-label="Save"
                      >
                        <Plus className="w-5 h-5 text-black" strokeWidth={3} />
                      </button>
                    )}
                    {isSaved && (
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#FFD600] flex items-center justify-center">
                        <span className="text-black font-bold text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p
                    style={{ fontFamily: anton, fontSize: 14, color: "#fff", textTransform: "uppercase", marginTop: 8 }}
                  >
                    {track.artist_name}
                  </p>
                  <p className="text-white text-xs" style={{ opacity: 0.7 }}>
                    {track.song_title}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-white text-sm mt-6 text-center">
            Visit a{" "}
            <span style={{ color: "#FFD600", textDecoration: "underline", cursor: "pointer" }} onClick={onGoToMarket}>
              Lokol Listening Station
            </span>{" "}
            to earn points.
          </p>
        </div>
      )}
    </div>
  );
}

/* ========== ARTISTS TAB ========== */
function ArtistsTab({ saves, onArtistTap, onRemoveArtist, userId }: { saves: SavedArtist[]; onArtistTap: (s: SavedArtist) => void; onRemoveArtist: (s: SavedArtist) => void; userId: string | null }) {
  const [editMode, setEditMode] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShare = async (s: SavedArtist) => {
    if (!userId || !s.submission_id) return;
    setSharingId(s.id);
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await (supabase as any).from("referrals").insert({
        referrer_fan_id: userId,
        submission_id: s.submission_id,
        artist_name: s.submission?.artist_name || s.artist_choice,
        referral_code: code,
      });
      const link = `https://golokol.app/lls/atlanta/genre/${
        (s.submission?.artist_name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
      }?ref=${code}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch {}
    setSharingId(null);
  };

  return (
    <div>
      <div className="pl-5 pt-5 pb-4">
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>ARTISTS</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
        {saves.length > 0 && (
          <button
            onClick={() => setEditMode(e => !e)}
            className="mt-4 px-5 py-2 rounded-full text-sm font-bold border"
            style={{
              borderColor: editMode ? "#fff" : "#FFD600",
              color: editMode ? "#fff" : "#FFD600",
              backgroundColor: "transparent",
            }}
          >
            {editMode ? "Done" : "Remove Artists"}
          </button>
        )}
      </div>

      {saves.length === 0 ? (
        <p className="text-[#FFD600] text-sm px-5">Discover artists at a Lokol Listening Station to build your scene</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5">
          {saves.map((s) => {
            const sub = s.submission;
            return (
              <div key={s.id} onClick={() => !editMode && onArtistTap(s)} className="cursor-pointer">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden">
                  {editMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveArtist(s); }}
                      className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                      aria-label="Remove artist"
                    >
                      <X size={14} className="text-white" strokeWidth={3} />
                    </button>
                  )}
                  {sub?.song_image_url ? (
                    <img src={sub.song_image_url} alt={sub.artist_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-gray-600 text-3xl">
                      ♪
                    </div>
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-[#FFD600] flex items-center justify-center">
                      <Play size={20} className="text-black ml-1" />
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: anton, fontSize: 14, color: "#fff", textTransform: "uppercase", marginTop: 8 }}>
                  {sub?.artist_name || s.artist_choice}
                </p>
                <p className="text-white text-xs" style={{ opacity: 0.7 }}>
                  {sub?.song_title || ""}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <img src={fanmenuArtists} alt="saved" className="w-5 h-5" style={{ filter: "none" }} />
                  {!editMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(s); }}
                      className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: copiedId === s.id ? "#FFD600" : "transparent",
                        color: copiedId === s.id ? "#000" : "rgba(255,255,255,0.4)",
                        border: copiedId === s.id ? "none" : "1px solid rgba(255,255,255,0.2)",
                      }}
                      disabled={sharingId === s.id}
                    >
                      {copiedId === s.id ? "Link Copied!" : sharingId === s.id ? "..." : "Share"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ========== SHOWS TAB ========== */
function ShowsTab({ shows, saves }: { shows: ShowListing[]; saves: SavedArtist[] }) {
  const savedArtistIds = new Set(saves.map((s) => s.submission?.artist_user_id).filter(Boolean) as string[]);
  const sortedShows = [...shows].sort((a, b) => {
    const aSaved = savedArtistIds.has(a.artist_user_id);
    const bSaved = savedArtistIds.has(b.artist_user_id);
    if (aSaved && !bSaved) return -1;
    if (!aSaved && bSaved) return 1;
    return a.show_date.localeCompare(b.show_date);
  });

  return (
    <div>
      <div className="pl-5 pt-5 pb-4">
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>SHOWS</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
      </div>
      <div className="px-5">
        {sortedShows.length === 0 ? (
          <p className="text-white text-sm">No upcoming shows yet. Check back soon.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedShows.map((s) => {
              const isSaved = savedArtistIds.has(s.artist_user_id);
              return (
                <div
                  key={s.id}
                  className="bg-[#1a1a1a] rounded-xl p-4"
                  style={isSaved ? { border: "2px solid #FFD600" } : undefined}
                >
                  {isSaved && (
                    <p className="text-[#FFD600] text-[11px] font-bold uppercase tracking-wide mb-1">From your scene</p>
                  )}
                  <p style={{ fontFamily: anton, fontSize: 16, color: "#fff", textTransform: "uppercase" }}>
                    {s.event_name}
                  </p>
                  <p className="text-white text-sm">{s.venue_name}</p>
                  <p className="text-[#FFD600] text-sm mt-1">
                    {new Date(s.show_date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {s.show_time ? ` · ${s.show_time}` : ""}
                  </p>
                  {s.ticket_url && (
                    <a
                      href={s.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 px-5 py-2 bg-[#FFD600] text-black font-bold text-sm rounded-full"
                    >
                      Buy Tickets
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== MARKET TAB ========== */
function MarketTab({ points, progressPct }: { points: number; progressPct: number }) {
  const partners = [
    { logo: CratesATL, name: "Crates ATL" },
    { logo: DBSlogo, name: "DBS Sounds" },
    { logo: MoodsMusic, name: "Moods Music" },
  ];

  return (
    <div>
      <div className="pl-5 pt-5 pb-2">
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>POINTS</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 1, color: "#FFFFFF", marginTop: 0 }}>{points}</p>
        <div className="mt-2 mb-1" style={{ width: "60%" }}>
          <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD600] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <p className="text-white text-[13px] mt-1">
          Collect points. Redeem locally.{" "}
          <span style={{ color: "#FFD600" }}>(Coming soon)</span>
        </p>
      </div>

      <div className="px-5 pt-6 pb-2">
        <p style={{ fontFamily: anton, fontSize: 18, color: "#FFD600", textTransform: "uppercase", lineHeight: 1.2 }}>
          Lokol Points Coming Soon for the World Cup 2026
        </p>
        <p className="text-white text-[13px] mt-2 mb-5" style={{ opacity: 0.7 }}>
          Meanwhile, Discover, Engage and Collect Points. New music added daily.
        </p>
        <div className="bg-[#1a1a1a] border border-[#FFD600]/30 rounded-xl p-4 mb-3">
          <p className="text-white text-sm">
            <span style={{ color: "#FFD600" }} className="font-bold">Earn more points</span> — visit a Lokol Listening Station. Scan in-store for a{" "}
            <span style={{ color: "#FFD600" }} className="font-bold">15pt bonus</span> plus up to 5 saves per day.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {partners.map((p) => (
            <div key={p.name} className="bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-4">
              <div
                className="bg-white rounded-lg p-2 flex items-center justify-center"
                style={{ width: 64, height: 64, flexShrink: 0 }}
              >
                <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
              </div>
              <p style={{ fontFamily: anton, fontSize: 16, color: "#fff", textTransform: "uppercase" }}>{p.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FanScene;
