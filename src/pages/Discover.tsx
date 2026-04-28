import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";
import genreHiphop from "@/assets/Genre-hiphop.png";
import genreRnb from "@/assets/Genre-rnb.png";
import genreAlternative from "@/assets/Genre-alternative.png";
import genreHardcore from "@/assets/Genre-hardcore.png";
import genreIndie from "@/assets/Genre-indie.png";

const SLUG_MAP: Record<string, string> = {
  "Hip-Hop": "hiphop",
  "Hip Hop": "hiphop",
  "R&B": "rnb",
  "RnB": "rnb",
  "Alternative": "alternative",
  "Hardcore + Punk": "hardcore",
};

const Discover = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<{ label: string; slug: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const GENRE_IMAGES: Record<string, string> = {
    "Hip-Hop": genreHiphop,
    "R&B": genreRnb,
    "Alternative": genreAlternative,
    "Hardcore": genreHardcore,
    "Indie": genreIndie,
  };

  useEffect(() => {
    // Ensure atlanta session token exists
    try {
      const existingRaw = localStorage.getItem("golokol_store_session");
      const existing = existingRaw ? JSON.parse(existingRaw) : null;
      const isValid = existing && existing.store_slug === "atlanta" && existing.expires_at > Date.now();
      if (!isValid) {
        const token = {
          store_slug: "atlanta",
          store_name: "Atlanta",
          city_session: true,
          created_at: Date.now(),
          expires_at: Date.now() + (1 * 60 * 60 * 1000),
          genres_explored: [] as string[],
          listened_under_50: [] as string[],
          points_earned: 0,
          scan_bonus_awarded: false,
        };
        localStorage.setItem("golokol_store_session", JSON.stringify(token));
      }
    } catch {}

    const fetchGenres = async () => {
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("genre_style, song_image_url")
        .eq("admin_status", "approved")
        .not("song_image_url", "is", null);

      if (!data || data.length === 0) { setLoading(false); return; }

      const usedImages = new Set<string>();
      const genreMap = new Map<string, string>();

      for (const row of data) {
        const parts = (row.genre_style as string).split(",").map((s: string) => s.trim());
        for (const genre of parts) {
          if (!genre) continue;
          if (genreMap.has(genre)) continue;
          const img = row.song_image_url as string;
          genreMap.set(genre, GENRE_IMAGES[genre] || img);
        }
      }

      const cards: { label: string; slug: string; image: string }[] = [];
      for (const [label, img] of genreMap) {
        const slug = SLUG_MAP[label] || label.toLowerCase().replace(/[^a-z0-9]/g, "");
        cards.push({ label, slug, image: img });
      }
      setGenres(cards);
      setLoading(false);
    };
    fetchGenres();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/fan/scene")}
          className="text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          My Scene
        </button>
        <img src={golokolLogo} alt="GoLokol" className="h-8" />
      </div>

      {/* Headline */}
      <div className="px-6 pt-6 pb-8">
        <h1 className="text-[#FFD600] text-5xl md:text-6xl font-black leading-none">
          DISCOVER
        </h1>
        <h1 className="text-white text-5xl md:text-6xl font-black leading-none mt-1">
          ATLANTA
        </h1>
        <h1 className="text-white text-5xl md:text-6xl font-black leading-none mt-1">
          MUSIC
        </h1>
        <p className="text-white/80 mt-4 text-base md:text-lg">
          Pick a genre. Listen. Save artists to your Lokol Scene.
        </p>
      </div>

      {/* Genre Cards */}
      {loading ? (
        <div className="px-6 py-12 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : genres.length === 0 ? (
        <p className="px-6 py-12 text-center text-white/60">Music loading soon. Check back.</p>
      ) : (
        <div className="px-6 grid grid-cols-2 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.slug}
              onClick={() => navigate(`/lls/atlanta/genre/${genre.slug}`)}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
            >
              <img
                src={genre.image}
                alt={genre.label}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white font-bold text-lg uppercase tracking-wide">
                {genre.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="px-6 py-8 text-center text-white/50 text-sm">
        Atlanta, GA — More cities coming soon.
      </p>
    </div>
  );
};

export default Discover;
