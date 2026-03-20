import { useSearchParams, useNavigate } from "react-router-dom";
import { Music, Headphones } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";

const GENRES = [
  "Afrobeats",
  "Alternative",
  "Beats",
  "Blues",
  "Country",
  "EDM",
  "Emo",
  "Folk",
  "Funk",
  "Gospel",
  "Hardcore",
  "Hip-Hop",
  "House",
  "Indie",
  "Jazz",
  "Latin",
  "Metal",
  "Neo-Soul",
  "Pop",
  "Punk",
  "R&B",
  "Rave",
  "Reggae",
  "Rock",
  "Ska",
  "Spoken-Word",
  "Techno",
];

function genreToSlug(genre: string) {
  return genre.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
}

const LokolListens = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storeId = searchParams.get("store") || "";
  const storeName = storeId
    ? storeId
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Your Local Record Store";

  const handleGenreClick = (genre: string) => {
    const slug = genreToSlug(genre);
    navigate(`/lls/genre/${slug}${storeId ? `?store=${storeId}` : ""}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Store header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-3 border-b border-border">
        <img src={golokolLogo} alt="GoLokol" className="h-10 w-10" />
        <div className="min-w-0">
          <h2 className="font-display font-bold text-xl md:text-2xl text-foreground truncate">
            {storeName}
          </h2>
          <p className="text-sm text-foreground-secondary tracking-wide">Atlanta</p>
        </div>
      </header>

      {/* Hero directive */}
      <section className="px-6 pt-10 pb-6 text-center">
        <Headphones className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-foreground mb-3">
          Pick a genre.
        </h1>
        <p className="text-lg md:text-xl text-foreground-secondary font-medium">
          Listen as you browse the aisles.
        </p>
      </section>

      {/* Genre buttons */}
      <section className="flex-1 px-4 pb-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className="w-full flex items-center gap-4 px-6 py-5 md:py-6 rounded-xl bg-background-tertiary border-2 border-border text-left transition-all duration-200 hover:border-primary hover:bg-background-secondary hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Music className="h-7 w-7 text-primary shrink-0" />
              <span className="font-display font-bold text-xl md:text-2xl text-foreground">
                {genre}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="px-6 py-6 text-center border-t border-border">
        <p className="text-xs text-foreground-secondary">
          Powered by{" "}
          <span className="font-display font-bold text-primary">GoLokol</span>
        </p>
      </footer>
    </div>
  );
};

export default LokolListens;
