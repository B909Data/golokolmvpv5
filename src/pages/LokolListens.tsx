import { useNavigate } from "react-router-dom";
import llsHero from "@/assets/lls-tv-displays.svg";
import genreHiphop from "@/assets/genre-hiphop.jpg";
import genreRnb from "@/assets/genre-rnb.jpg";
import genreAltsoul from "@/assets/genre-altsoul.jpg";

const GENRES = [
  { label: "Hip Hop", slug: "hiphop", image: genreHiphop },
  { label: "RnB", slug: "rnb", image: genreRnb },
  { label: "Alternative Soul", slug: "alternativesoul", image: genreAltsoul },
];

const LokolListens = () => {
  const navigate = useNavigate();

  const scrollToGenres = () => {
    document.getElementById("genre-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-black" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Hero Image */}
      <section className="w-full flex items-center justify-center px-4" style={{ height: "55vh", minHeight: 320 }}>
        <img
          src={llsHero}
          alt="Lokol Listening Sessions Atlanta"
          className="w-full h-full object-contain"
        />
      </section>

      {/* Subcaption + CTA below hero */}
      <section className="w-full px-6 py-8 text-center">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {GENRES.map((genre) => (
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
