import CratesATL from "@/assets/CratesATL.svg";
import DBSlogo from "@/assets/DBSlogo.svg";
import MoodsMusic from "@/assets/MoodsMusic.svg";
import golokolLogo from "@/assets/golokol-logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const STORES = [
  { name: "Crates ATL", logo: CratesATL, slug: "crates-atl" },
  { name: "Moods Music", logo: MoodsMusic, slug: "moods-music" },
  { name: "DBS Sounds", logo: DBSlogo, slug: "dbs-sounds" },
];

const anton = "'Anton', sans-serif";

const LokolStations = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate("/")}
          aria-label="Back"
          className="text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
        <div className="w-6" />
      </header>

      {/* Headings */}
      <div className="text-center mb-8">
        <h1
          className="text-[#FFD600] mb-2"
          style={{ fontFamily: anton, fontSize: 32, lineHeight: 1.1 }}
        >
          Lokol Listening Stations
        </h1>
        <p className="text-white text-[18px]">Atlanta, GA</p>
      </div>

      {/* Store Cards */}
      <div className="max-w-sm mx-auto flex flex-col gap-4">
        {STORES.map((store) => (
          <Link
            key={store.slug}
            to={`/lls/${store.slug}`}
            className="bg-[#1a1a1a] rounded-2xl p-6 flex items-center gap-4 hover:bg-[#222] transition-colors"
          >
            <div className="bg-white rounded-xl p-3 w-16 h-16 flex items-center justify-center flex-shrink-0">
              <img
                src={store.logo}
                alt={store.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span
                className="text-white font-bold"
                style={{ fontFamily: anton, fontSize: 18 }}
              >
                {store.name}
              </span>
              <span className="bg-[#FFD600] text-black text-[11px] font-bold px-2 py-0.5 rounded-full self-start">
                Active
              </span>
            </div>
            <ArrowRight size={20} className="text-white" />
          </Link>
        ))}
      </div>

      <p className="text-white/50 text-sm text-center mt-8">
        More locations coming soon.
      </p>
    </div>
  );
};

export default LokolStations;
