import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Info } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import fanmenuArtists from "@/assets/fanmenu-artists.svg";
import fanmenuShows from "@/assets/fanmenu-shows.svg";
import fanmenuMarket from "@/assets/fanmenu-market.svg";
import fanmenuHome from "@/assets/fanmenu-home.svg";
import CratesATL from "@/assets/CratesATL.svg";
import DBSlogo from "@/assets/DBSlogo.svg";
import MoodsMusic from "@/assets/MoodsMusic.svg";

type View = "home" | "artists" | "shows" | "market";

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
  submission?: {
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

const anton = "'Anton', sans-serif";

const FanScene = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [saves, setSaves] = useState<SavedArtist[]>([]);
  const [shows, setShows] = useState<ShowListing[]>([]);
  const [activeView, setActiveView] = useState<View>("home");

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

      const { data: savesData } = await supabase
        .from("fan_saves")
        .select("id, artist_choice")
        .eq("email", prof?.email || "");

      if (savesData && savesData.length > 0) {
        const artistNames = savesData.map((s) => s.artist_choice);
        const { data: subs } = await (supabase as any)
          .from("lls_artist_submissions")
          .select("artist_name, song_title, song_image_url, youtube_url, instagram_handle, artist_user_id")
          .in("artist_name", artistNames);

        const enriched = savesData.map((s) => ({
          ...s,
          submission: subs?.find((sub: any) => sub.artist_name === s.artist_choice),
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

  const heroImage = useMemo(() => {
    const withImages = saves.filter((s) => s.submission?.song_image_url);
    if (withImages.length === 0) return null;
    return withImages[Math.floor(Math.random() * withImages.length)].submission!.song_image_url;
  }, [saves]);

  const points = profile?.lokol_points || 0;
  const progressPct = Math.min((points / 40) * 100, 100);

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
        <button onClick={() => navigate("/fan/info")} className="text-[#FFD600]">
          <Info className="w-6 h-6" />
        </button>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pt-14 pb-24">
        {activeView === "home" && <HomeView heroImage={heroImage} />}
        {activeView === "artists" && <ArtistsTab saves={saves} />}
        {activeView === "shows" && <ShowsTab shows={shows} />}
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
function HomeView({ heroImage }: { heroImage: string | null }) {
  return (
    <div className="relative min-h-[calc(100vh-56px-96px)]">
      {heroImage && (
        <img
          src={heroImage}
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
function ShowsTab({ shows }: { shows: ShowListing[] }) {
  return (
    <div>
      <div className="pl-5 pt-5 pb-4">
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
        <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>SHOWS</p>
        <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
      </div>

      <div className="px-5">
        {shows.length === 0 ? (
          <p className="text-white text-sm">No upcoming shows yet. Check back soon.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {shows.map((s) => (
              <div key={s.id} className="bg-[#1a1a1a] rounded-xl p-4">
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
            ))}
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
          <p className="text-white text-[11px] mt-1">40 pts unlocks rewards at local partners</p>
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
              disabled={points < 40}
              className="mt-3 w-full py-2 bg-[#FFD600] text-black font-bold text-sm rounded-full"
              style={{
                opacity: points < 40 ? 0.4 : 1,
                cursor: points < 40 ? "not-allowed" : "pointer",
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
