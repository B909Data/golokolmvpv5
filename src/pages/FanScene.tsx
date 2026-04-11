import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Play, LogOut } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import fanmenuArtists from "@/assets/fanmenu-artists.svg";
import fanmenuShows from "@/assets/fanmenu-shows.svg";
import fanmenuMarket from "@/assets/fanmenu-market.svg";
import fanmenuInfo from "@/assets/fanmenu-info.svg";

type Tab = "artists" | "shows" | "market" | "info";

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
}

const FanScene = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<FanProfile | null>(null);
  const [saves, setSaves] = useState<SavedArtist[]>([]);
  const [shows, setShows] = useState<ShowListing[]>([]);
  const [notifications, setNotifications] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Tab>("artists");

  // Auth check
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

  // Load data once we have userId
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      // Profile
      const { data: prof } = await supabase
        .from("fan_profiles")
        .select("*")
        .eq("fan_user_id", userId)
        .maybeSingle();
      setProfile(prof);

      // Saves with submission join
      const { data: savesData } = await supabase
        .from("fan_saves")
        .select("id, artist_choice")
        .eq("email", prof?.email || "");

      if (savesData && savesData.length > 0) {
        const artistNames = savesData.map((s) => s.artist_choice);
        const { data: subs } = await supabase
          .from("submissions")
          .select("artist_name, song_title, song_image_url, youtube_url, instagram_handle, artist_user_id")
          .in("artist_name", artistNames);

        const enriched = savesData.map((s) => ({
          ...s,
          submission: subs?.find((sub: any) => sub.artist_name === s.artist_choice),
        }));
        setSaves(enriched as SavedArtist[]);
      }

      // Shows
      const { data: showsData } = await supabase
        .from("show_listings")
        .select("*")
        .eq("city", "Atlanta")
        .order("show_date", { ascending: true });
      if (showsData) setShows(showsData);

      // Notifications
      const { data: notifs } = await supabase
        .from("show_notifications")
        .select("artist_user_id")
        .eq("fan_user_id", userId);
      if (notifs) setNotifications(new Set(notifs.map((n) => n.artist_user_id)));

      setLoading(false);
    };
    load();
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/lls", { replace: true });
  };

  const toggleNotification = async (artistUserId: string | null) => {
    if (!artistUserId || !userId) return;
    const has = notifications.has(artistUserId);
    if (has) {
      await supabase
        .from("show_notifications")
        .delete()
        .eq("fan_user_id", userId)
        .eq("artist_user_id", artistUserId);
      setNotifications((prev) => {
        const n = new Set(prev);
        n.delete(artistUserId);
        return n;
      });
    } else {
      await supabase
        .from("show_notifications")
        .insert({ fan_user_id: userId, artist_user_id: artistUserId });
      setNotifications((prev) => new Set(prev).add(artistUserId));
    }
  };

  // Pick a random hero image from saved artists
  const heroImage = useMemo(() => {
    const withImages = saves.filter((s) => s.submission?.song_image_url);
    if (withImages.length === 0) return null;
    return withImages[Math.floor(Math.random() * withImages.length)].submission!.song_image_url;
  }, [saves]);

  const points = profile?.lokol_points || 0;
  const progressPct = Math.min((points / 100) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: "artists", icon: fanmenuArtists, label: "Artists" },
    { key: "shows", icon: fanmenuShows, label: "Shows" },
    { key: "market", icon: fanmenuMarket, label: "Market" },
    { key: "info", icon: fanmenuInfo, label: "Info" },
  ];

  return (
    <div className="min-h-screen bg-black pb-20 font-['Montserrat',sans-serif]">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between bg-black border-b border-gray-800">
        <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
        <span className="text-sm text-white">My Lokol Scene</span>
        <button onClick={handleSignOut} className="text-[#FFD600] text-xs font-bold flex items-center gap-1">
          <LogOut className="w-3 h-3" /> Sign Out
        </button>
      </header>

      {/* Hero */}
      <div className="relative w-full h-[280px] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "sepia(0.4) saturate(1.8) hue-rotate(5deg) brightness(0.7)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
          <h1
            className="text-5xl font-black text-white tracking-tight"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            MY LOKOL SCENE
          </h1>
          <p
            className="text-2xl text-[#FFD600] mt-1"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            ATLANTA
          </p>
        </div>
      </div>

      {/* Points */}
      <div className="px-5 py-5 border-b border-gray-800">
        <p className="text-[13px] text-white mb-1">Lokol Points</p>
        <p className="text-3xl font-bold text-[#FFD600] mb-2">{points}</p>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFD600] rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-white mt-2">100 points unlocks rewards at local partners</p>
      </div>

      {/* Tab Content */}
      <div className="px-5 py-5">
        {activeTab === "artists" && <ArtistsTab saves={saves} notifications={notifications} toggleNotification={toggleNotification} />}
        {activeTab === "shows" && <ShowsTab shows={shows} />}
        {activeTab === "market" && <MarketTab points={points} progressPct={progressPct} />}
        {activeTab === "info" && <InfoTab />}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-[#333] flex">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="flex-1 flex flex-col items-center py-2 gap-1"
          >
            <img
              src={t.icon}
              alt={t.label}
              className="w-6 h-6"
              style={{
                opacity: activeTab === t.key ? 1 : 0.5,
                filter: activeTab === t.key ? "none" : "brightness(0) invert(1)",
              }}
            />
            <span
              className="text-[10px] font-medium"
              style={{ color: activeTab === t.key ? "#FFD600" : "rgba(255,255,255,0.5)" }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />
    </div>
  );
};

/* ============== Tab Components ============== */

function ArtistsTab({
  saves,
  notifications,
  toggleNotification,
}: {
  saves: SavedArtist[];
  notifications: Set<string>;
  toggleNotification: (id: string | null) => void;
}) {
  if (saves.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold text-white mb-3">Your Saved Artists</h2>
        <p className="text-[#FFD600] text-sm">
          Discover artists at a Lokol Listening Station to build your scene
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Your Saved Artists</h2>
      <div className="grid grid-cols-2 gap-4">
        {saves.map((s) => {
          const sub = s.submission;
          const artistUserId = sub?.artist_user_id || null;
          const isNotified = artistUserId ? notifications.has(artistUserId) : false;

          return (
            <div key={s.id} className="bg-gray-900 rounded-lg overflow-hidden">
              {sub?.song_image_url ? (
                <img src={sub.song_image_url} alt={sub.artist_name} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-gray-800 flex items-center justify-center text-gray-600 text-3xl">♪</div>
              )}
              <div className="p-3">
                <p className="text-white font-bold text-sm truncate">{sub?.artist_name || s.artist_choice}</p>
                <p className="text-gray-400 text-xs truncate">{sub?.song_title || ""}</p>
                <div className="flex gap-3 mt-2">
                  {sub?.youtube_url && (
                    <a href={sub.youtube_url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#FFD600]">
                      <Play className="w-4 h-4" />
                    </a>
                  )}
                  {sub?.instagram_handle && (
                    <a
                      href={`https://instagram.com/${sub.instagram_handle.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-[#FFD600]"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => toggleNotification(artistUserId)}
                    className={isNotified ? "text-[#FFD600]" : "text-white/70 hover:text-[#FFD600]"}
                  >
                    <Bell className="w-4 h-4" fill={isNotified ? "#FFD600" : "none"} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShowsTab({ shows }: { shows: ShowListing[] }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Upcoming Shows</h2>
      {shows.length === 0 ? (
        <p className="text-gray-400 text-sm">No upcoming shows yet. Check back soon.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {shows.map((s) => (
            <div key={s.id} className="bg-gray-900 rounded-lg p-4">
              <p className="text-white font-bold">{s.event_name}</p>
              <p className="text-gray-400 text-sm">{s.venue_name}</p>
              <p className="text-[#FFD600] text-sm mt-1">
                {new Date(s.show_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {s.show_time ? ` · ${s.show_time}` : ""}
              </p>
              {s.ticket_url && (
                <a
                  href={s.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-4 py-2 bg-[#FFD600] text-black font-bold text-sm rounded-lg hover:brightness-110 transition"
                >
                  Get Tickets
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketTab({ points, progressPct }: { points: number; progressPct: number }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-2">Lokol Market</h2>
      <p className="text-gray-400 text-sm mb-5">Earn 100 points to unlock rewards at local partners</p>

      <div className="bg-gray-900 rounded-lg p-4 mb-4">
        <p className="text-white text-sm mb-2">Your Progress</p>
        <p className="text-2xl font-bold text-[#FFD600] mb-2">{points} / 100</p>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-[#FFD600] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 flex items-center gap-3 opacity-60">
        <svg className="w-6 h-6 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className="text-gray-400 text-sm">Rewards unlock at 100 points</p>
      </div>
    </div>
  );
}

function InfoTab() {
  const items = [
    "Scan a Lokol Listening Station QR at a record store to discover local artists",
    "Save artists you love to earn Lokol Points",
    "Listen past 50% of a song to earn points",
    "Show up to local shows to earn points",
    "Redeem 100 points for rewards at local partner stores",
    "The more you engage, the more your scene grows",
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">How GoLokol Works</h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FFD600] mt-1.5 shrink-0" />
            <span className="text-white text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FanScene;
