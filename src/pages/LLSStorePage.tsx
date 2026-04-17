import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import LLSOnboarding from "@/components/LLSOnboarding";
import cratesHero from "@/assets/crates-atl-hero.svg";
import dbsHero from "@/assets/dbs-sounds-hero.svg";
import moodsHero from "@/assets/moods-music-hero.svg";

const HERO_MAP: Record<string, string> = {
  "crates-atl": cratesHero,
  "dbs-sounds": dbsHero,
  "moods-music": moodsHero,
};

const SLUG_MAP: Record<string, string> = {
  "Hip Hop": "hiphop",
  "RnB": "rnb",
  "Alternative": "alternative",
  "Hardcore + Punk": "hardcore-punk",
};

interface GenreCard { label: string; slug: string; image: string }

const LLSStorePage = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [genres, setGenres] = useState<GenreCard[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      if (!storeSlug) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .from("lls_retail_signups")
        .select("store_name")
        .eq("store_slug", storeSlug)
        .limit(1)
        .maybeSingle();
      if (error || !data) { setNotFound(true); } else {
        setStoreName(data.store_name);
        // Generate or refresh session token
        try {
          const existingRaw = localStorage.getItem("golokol_store_session");
          const existing = existingRaw ? JSON.parse(existingRaw) : null;
          const isValid = existing && existing.store_slug === storeSlug && existing.expires_at > Date.now();
          if (!isValid) {
            const token = {
              store_slug: storeSlug,
              store_name: data.store_name,
              created_at: Date.now(),
              expires_at: Date.now() + (2 * 60 * 60 * 1000),
              genres_explored: [] as string[],
              listened_under_50: [] as string[],
              points_earned: 0,
            };
            localStorage.setItem("golokol_store_session", JSON.stringify(token));
          }
        } catch (e) {
          // ignore localStorage errors
        }
      }
      setLoading(false);
    };
    fetchStore();
  }, [storeSlug]);

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("genre_style, song_image_url, artist_user_id")
        .eq("admin_status", "approved")
        .not("song_image_url", "is", null);

      if (!data || data.length === 0) { setGenresLoading(false); return; }

      const usedImages = new Set<string>();
      const genreMap = new Map<string, string>();

      for (const row of data) {
        const parts = (row.genre_style as string).split(",").map((s: string) => s.trim());
        const firstGenre = parts[0];
        if (!firstGenre || genreMap.has(firstGenre)) continue;
        const img = row.song_image_url as string;
        if (usedImages.has(img)) continue;
        usedImages.add(img);
        genreMap.set(firstGenre, img);
      }

      const cards: GenreCard[] = [];
      for (const [label, img] of genreMap) {
        const slug = SLUG_MAP[label] || label.toLowerCase().replace(/[^a-z0-9]/g, "");
        cards.push({ label, slug, image: img });
      }
      setGenres(cards);
      setGenresLoading(false);
    };
    fetchGenres();
  }, []);

  const scrollToGenres = () => {
    document.getElementById("genre-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 border-4 border-[#FFD600] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-[20px] font-bold">Station not found</p>
      </div>
    );
  }

  return (
    <LLSOnboarding storeSlug={storeSlug || ""}>
      <div className="min-h-screen flex flex-col bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        {/* Hero Image */}
        <section className="w-full flex items-center justify-center px-4" style={{ height: "55vh", minHeight: 320 }}>
          <img src={HERO_MAP[storeSlug || ""] || cratesHero} alt="Lokol Listening Stations" className="w-full h-full object-contain" loading="eager" decoding="async" fetchPriority="high" />
        </section>

        {/* Store name + CTA */}
        <section className="w-full px-6 py-8 text-center" style={{ marginTop: -10 }}>
          <p className="text-white font-normal leading-[1.6] text-[18px] md:text-[20px] max-w-2xl mx-auto">
            Listen, earn points and build your local music scene on GoLokol.
          </p>
          <button
            onClick={scrollToGenres}
            className="mt-8 inline-block font-bold text-[16px] rounded-[16px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ backgroundColor: "#FFD600", color: "#000000", width: 200, height: 56 }}
          >
            Get Started
          </button>
        </section>

        {/* Genre Selection Section */}
        <section id="genre-section" className="w-full py-12 md:py-16 px-4" style={{ backgroundColor: "#000000" }}>
          <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center font-bold text-[28px] md:text-[32px] mb-10 md:mb-12 text-white">Pick a genre</h2>

            {genresLoading ? (
              <p className="text-white text-center text-[20px] font-bold">Loading...</p>
            ) : genres.length === 0 ? (
              <p className="text-white text-center text-[18px]">Local artists are being added. Check back soon.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {genres.map((genre) => (
                  <button
                    key={genre.slug}
                    onClick={() => navigate(`/lls/${storeSlug}/genre/${genre.slug}`)}
                    className="group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD600]"
                  >
                    <img src={genre.image} alt={genre.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={768} height={768} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-[#FFD600]/15 transition-colors duration-200" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-5 left-0 right-0 text-center text-white font-bold text-[24px] md:text-[28px] drop-shadow-lg">
                      {genre.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="w-full text-center py-8" style={{ backgroundColor: "#000000" }}>
          <p className="text-white text-[14px] font-normal">GoLokol — The future of music is local.</p>
        </footer>
      </div>
    </LLSOnboarding>
  );
};

export default LLSStorePage;
