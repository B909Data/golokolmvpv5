import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import llsHero from "@/assets/lls-hero-crates.png";

const SLUG_MAP: Record<string, string> = {
  "Hip-Hop": "hiphop", "R&B": "rnb", "Afrobeats": "afrobeats", "Alternative": "alternative",
  "Beats": "beats", "Blues": "blues", "Country": "country", "EDM": "edm", "Emo": "emo",
  "Folk": "folk", "Funk": "funk", "Gospel": "gospel", "Hardcore": "hardcore", "House": "house",
  "Indie": "indie", "Jazz": "jazz", "Latin": "latin", "Metal": "metal", "Neo-Soul": "neosoul",
  "Pop": "pop", "Punk": "punk", "Rave": "rave", "Reggae": "reggae", "Rock": "rock",
  "Ska": "ska", "Spoken-Word": "spokenword", "Techno": "techno",
};

interface GenreCard { label: string; slug: string; image: string }

const LokolListens = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<GenreCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("genre_style, song_image_url, artist_user_id")
        .eq("admin_status", "approved")
        .not("song_image_url", "is", null);

      if (!data || data.length === 0) { setLoading(false); return; }

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
      setLoading(false);
    };
    fetchGenres();
  }, []);

  const scrollToGenres = () => {
    document.getElementById("genre-section")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-[20px] font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Hero Image */}
      <section className="w-full flex items-center justify-center px-4" style={{ height: "55vh", minHeight: 320 }}>
        <img
          src={llsHero}
          alt="Lokol Listening Stations Atlanta"
          className="w-full h-full object-contain"
        />
      </section>

      {/* Subcaption + CTA below hero */}
      <section className="w-full px-6 py-8 text-center" style={{ marginTop: -50 }}>
        <p className="text-white font-normal leading-[1.8] text-[18px] md:text-[20px] max-w-2xl mx-auto">
          Listen and discover a curated selection of Atlanta local artists.
          <br /><br />
          Earn points at Crates.
        </p>
        <button
          onClick={scrollToGenres}
          className="mt-8 inline-block font-bold text-[16px] rounded-[16px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          style={{
            backgroundColor: "#FFD600",
            color: "#000000",
            width: 200,
            height: 56,
          }}
        >
          Get Started
        </button>
      </section>

      {/* Genre Selection Section */}
      <section
        id="genre-section"
        className="w-full py-12 md:py-16 px-4"
        style={{ backgroundColor: "#000000" }}
      >
        <div className="max-w-[1000px] mx-auto">
          <h2
            className="text-center font-bold text-[28px] md:text-[32px] mb-10 md:mb-12 text-white"
          >
            Pick a genre
          </h2>

          {genres.length === 0 ? (
            <p className="text-white text-center text-[18px]">Local artists are being added. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {genres.map((genre) => (
                <button
                  key={genre.slug}
                  onClick={() => navigate(`/lls/genre/${genre.slug}`)}
                  className="group relative aspect-square rounded-[24px] overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD600]"
                >
                  <img
                    src={genre.image}
                    alt={genre.label}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    width={768}
                    height={768}
                  />
                  {/* Hover glow overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-[#FFD600]/15 transition-colors duration-200" />
                  {/* Bottom gradient for label readability */}
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

      {/* Footer */}
      <footer
        className="w-full text-center py-8"
        style={{ backgroundColor: "#000000" }}
      >
        <p className="text-white text-[14px] font-normal">
          GoLokol — The future of music is local.
        </p>
      </footer>
    </div>
  );
};

export default LokolListens;
