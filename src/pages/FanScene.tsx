import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Info, Plus, Play, Pause } from "lucide-react";
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
}

const anton = "'Anton', sans-serif";

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
  const [expiredBannerDismissed, setExpiredBannerDismissed] = useState(false);
  const [missedTracks, setMissedTracks] = useState<MissedTrack[]>([]);

  useEffect(() => {
    setHomeImage(HOME_IMAGES[Math.floor(Math.random() * HOME_IMAGES.length)]);

    try {
      const session = JSON.parse(localStorage.getItem("golokol_store_session") || "null") as StoreSession | null;
      if (session) {
        setStoreSession(session);
        const valid = session.expires_at > Date.now();
        setTokenValid(valid);
        setTokenExpired(!valid);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
      const { data: profData } = await supabase
        .from("fan_profiles")
        .select("*")
        .eq("fan_user_id", userId)
        .maybeSingle();

      if (profData) {
        prof = profData;
      } else {
        const { data: newProf } = await supabase
          .from("fan_profiles")
          .insert({ fan_user_id: userId, city: "Atlanta", lokol_points: 0 })
          .select()
          .single();
        prof = newProf;
      }
      setProfile(prof);

      const { data: savesData } = await (supabase as any)
        .from("fan_saves")
        .select("id, artist_choice, submission_id")
        .eq("fan_user_id", userId);

      if (savesData && savesData.length > 0) {
        const ids: string[] = savesData.filter((s: any) => s.submission_id).map((s: any) => s.submission_id);
        const names: string[] = savesData.filter((s: any) => !s.submission_id).map((s: any) => s.artist_choice);

        const orParts: string[] = [];
        if (ids.length > 0) orParts.push(`id.in.(${ids.join(",")})`);
        if (names.length > 0) orParts.push(`artist_name.in.(${names.map((n) => `"${n}"`).join(",")})`);

        let subs: any[] = [];
        if (orParts.length > 0) {
          const { data: subsData } = await (supabase as any)
            .from("lls_artist_submissions")
            .select("id, artist_name, song_title, song_image_url, youtube_url, instagram_handle, artist_user_id")
            .or(orParts.join(","));
          subs = subsData || [];
        }

        const enriched = savesData.map((s: any) => ({
          ...s,
          submission:
            subs.find((sub: any) => sub.id === s.submission_id) ||
            subs.find((sub: any) => sub.artist_name === s.artist_choice),
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

  // Load "Music You Might've Missed" when token expired
  useEffect(() => {
    if (!tokenExpired || !storeSession || !userId) return;
    const loadMissed = async () => {
      const genres = storeSession.genres_explored || [];
      const underIds = storeSession.listened_under_50 || [];
      if (genres.length === 0 && underIds.length === 0) return;

      const savedSubmissionIds = new Set(
        saves.map((s) => s.submission_id || s.submission?.id).filter(Boolean) as string[]
      );

      let query = (supabase as any)
        .from("lls_artist_submissions")
        .select("id, artist_name, song_title, song_image_url, mp3_url, genre_style")
        .eq("admin_status", "approved");

      if (genres.length > 0) {
        query = query.in("genre_style", genres);
      }

      const { data } = await query;
      if (!data) return;

      const filtered = (data as MissedTrack[]).filter(
        (t) => t.mp3_url && !savedSubmissionIds.has(t.id)
      );

      // listened_under_50 first, then others
      const priority = filtered.filter((t) => underIds.includes(t.id));
      const rest = filtered.filter((t) => !underIds.includes(t.id));
      setMissedTracks([...priority, ...rest].slice(0, 12));
    };
    loadMissed();
  }, [tokenExpired, storeSession, userId, saves]);

  const points = profile?.lokol_points || 0;
  const progressPct = Math.min((points / 100) * 100, 100);

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
        <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.removeItem("golokol_saved_ids");
              localStorage.removeItem("golokol_session_points");
              localStorage.removeItem("golokol_store_session");
              navigate("/lls/signup");
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
            storeSession={storeSession}
            expiredBannerDismissed={expiredBannerDismissed}
            onDismissExpired={() => setExpiredBannerDismissed(true)}
            onKeepDiscovering={() => storeSession && navigate(`/lls/${storeSession.store_slug}`)}
            onGoToMarket={() => setActiveView("market")}
            missedTracks={missedTracks}
            saves={saves}
            setSaves={setSaves}
            userId={userId}
          />
        )}
        {activeView === "artists" && <ArtistsTab saves={saves} />}
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
                style={{
                  border: `2px solid ${isActive ? "#FFD600" : "#555"}`,
                }}
              >
                <img
                  src={t.icon}
                  alt={t.label}
                  className="w-8 h-8"
                  style={{
                    opacity: isActive ? 1 : 0.4,
                    filter: isActive ? "none" : "brightness(0) invert(1)",
                  }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? "#FFD600" : "rgba(255,255,255,0.4)",
                }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/* ========== HOME VIEW ========== */
function HomeView({
  homeImage,
  tokenValid,
  tokenExpired,
  storeSession,
  expiredBannerDismissed,
  onDismissExpired,
  onKeepDiscovering,
  onGoToMarket,
  missedTracks,
  saves,
  setSaves,
  userId,
}: {
  homeImage: string | null;
  tokenValid: boolean;
  tokenExpired: boolean;
  storeSession: StoreSession | null;
  expiredBannerDismissed: boolean;
  onDismissExpired: () => void;
  onKeepDiscovering: () => void;
  onGoToMarket: () => void;
  missedTracks: MissedTrack[];
  saves: SavedArtist[];
  setSaves: (s: SavedArtist[]) => void;
  userId: string | null;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedMissedIds, setSavedMissedIds] = useState<Set<string>>(new Set());

  const handlePlay = useCallback((track: MissedTrack) => {
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
  }, [playingId, isPlaying]);

  const handleSaveMissed = useCallback(async (track: MissedTrack) => {
    if (!userId || savedMissedIds.has(track.id)) return;
    setSavedMissedIds((prev) => new Set([...prev, track.id]));
    await (supabase as any).from("fan_saves").insert({
      fan_user_id: userId,
      artist_choice: track.artist_name,
      submission_id: track.id,
      email: "",
      name: "",
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
  }, [userId, savedMissedIds, saves, setSaves]);

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

      {/* Return-to-store banner */}
      {tokenValid && storeSession && (
        <div className="bg-[#FFD600] text-black px-4 py-3 flex items-center justify-between gap-3 relative z-20">
          <p className="text-sm font-bold flex-1">
            You're still earning points at {storeSession.store_name || storeSession.store_slug}
          </p>
          <button
            onClick={onKeepDiscovering}
            className="bg-black text-[#FFD600] px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
          >
            Keep Discovering
          </button>
        </div>
      )}
      {tokenExpired && storeSession && !expiredBannerDismissed && (
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
          <button
            onClick={onDismissExpired}
            className="text-white/60 text-xl leading-none"
            aria-label="Dismiss"
          >
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
            style={{
              filter: "sepia(0.5) saturate(2) hue-rotate(10deg) brightness(0.75) contrast(1.1)",
            }}
          />
        )}
        <div className="relative z-10 pl-5 pt-5">
          <p style={{ fontFamily: anton, fontSize: 72, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
          <p style={{ fontFamily: anton, fontSize: 72, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
          <p style={{ fontFamily: anton, fontSize: 72, lineHeight: 0.9, color: "#FFD600" }}>SCENE</p>
          <p style={{ fontFamily: anton, fontSize: 56, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
        </div>
      </div>

      {/* Music You Might've Missed */}
      {tokenExpired && storeSession && missedTracks.length > 0 && (
        <div className="relative z-10 mt-[60vh] px-5 pt-8 pb-4">
          <h2
            style={{ fontFamily: anton, fontSize: 20, color: "#fff", textTransform: "uppercase" }}
            className="mb-4"
          >
            Music you might've missed at {storeSession.store_name || storeSession.store_slug}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {missedTracks.map((track) => {
              const isCurrent = playingId === track.id;
              const isSaved = savedMissedIds.has(track.id);
              return (
                <div key={track.id}>
                  <div className="relative">
                    <button
                      onClick={() => handlePlay(track)}
                      className="w-full aspect-square rounded-xl overflow-hidden bg-[#1a1a1a] flex items-center justify-center"
                    >
                      {track.song_image_url ? (
                        <img
                          src={track.song_image_url}
                          alt={track.artist_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-3xl">♪</span>
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
                  </div>
                  <p
                    style={{
                      fontFamily: anton,
                      fontSize: 14,
                      color: "#fff",
                      textTransform: "uppercase",
                      marginTop: 8,
                    }}
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
            <span
              style={{ color: "#FFD600", textDecoration: "underline", cursor: "pointer" }}
              onClick={onGoToMarket}
            >
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
function ArtistsTab({ saves }: { saves: SavedArtist[] }) {
  return (
    <div>
      <div className="pl-5 pt-5 pb-4">
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>ARTISTS</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
      </div>

      {saves.length === 0 ? (
        <p className="text-[#FFD600] text-sm px-5">
          Discover artists at a Lokol Listening Station to build your scene
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5">
          {saves.map((s) => {
            const sub = s.submission;
            return (
              <div key={s.id}>
                {sub?.song_image_url ? (
                  <img src={sub.song_image_url} alt={sub.artist_name} className="w-full aspect-square object-cover rounded-xl" />
                ) : (
                  <div className="w-full aspect-square bg-[#1a1a1a] rounded-xl flex items-center justify-center text-gray-600 text-3xl">♪</div>
                )}
                <p style={{ fontFamily: anton, fontSize: 14, color: "#fff", textTransform: "uppercase", marginTop: 8 }}>
                  {sub?.artist_name || s.artist_choice}
                </p>
                <p className="text-white text-xs" style={{ opacity: 0.7 }}>{sub?.song_title || ""}</p>
                <img
                  src={fanmenuArtists}
                  alt="saved"
                  className="w-5 h-5 mt-1"
                  style={{ filter: "none" }}
                />
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
  const savedArtistIds = new Set(
    saves.map((s) => s.submission?.artist_user_id).filter(Boolean) as string[]
  );

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
                    <p className="text-[#FFD600] text-[11px] font-bold uppercase tracking-wide mb-1">
                      From your scene
                    </p>
                  )}
                  <p style={{ fontFamily: anton, fontSize: 16, color: "#fff", textTransform: "uppercase" }}>
                    {s.event_name}
                  </p>
                  <p className="text-white text-sm">{s.venue_name}</p>
                  <p className="text-[#FFD600] text-sm mt-1">
                    {new Date(s.show_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
      <div className="pl-5 pt-5">
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>POINTS</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 1, color: "#FFFFFF", marginTop: 0 }}>{points}</p>
        <div className="mt-1" style={{ width: "60%" }}>
          <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
            <div className="h-full bg-[#FFD600] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-white text-[11px] mt-1">100 pts unlocks rewards at local partners</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 pt-6 pb-4">
        {partners.map((p) => (
          <div key={p.name} className="bg-[#1a1a1a] rounded-xl p-4">
            <div className="bg-white rounded-lg p-2 flex items-center justify-center" style={{ aspectRatio: "1/1", maxHeight: 80 }}>
              <img src={p.logo} alt={p.name} className="w-full h-full object-contain" />
            </div>
            <p style={{ fontFamily: anton, fontSize: 14, color: "#fff", textTransform: "uppercase", marginTop: 12 }}>100 POINTS</p>
            <p className="text-white text-xs" style={{ opacity: 0.7 }}>10% off purchase</p>
            <button
              disabled={points < 100}
              className="mt-3 w-full py-2 bg-[#FFD600] text-black font-bold text-sm rounded-full"
              style={{
                opacity: points < 100 ? 0.4 : 1,
                cursor: points < 100 ? "not-allowed" : "pointer",
              }}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FanScene;
