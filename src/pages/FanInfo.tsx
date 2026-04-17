import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";
import { supabase } from "@/integrations/supabase/client";

const anton = "'Anton', sans-serif";

const FanInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-black">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/fan/scene")} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
        </div>
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
          <Info className="w-6 h-6 text-[#FFD600]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-14 pb-8">
        {/* Headline */}
        <div className="pl-5 pt-5 pb-6">
          <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>MY</p>
          <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>LOKOL</p>
          <p style={{ fontFamily: anton, fontSize: 64, lineHeight: 0.9, color: "#FFD600" }}>INFO</p>
          <p style={{ fontFamily: anton, fontSize: 48, lineHeight: 0.9, color: "#FFFFFF", marginTop: 4 }}>ATLANTA</p>
        </div>

        {/* POINT GUIDE */}
        <div className="px-5 pb-8">
          <p style={{ fontFamily: anton, fontSize: 18, color: "#FFD600", textTransform: "uppercase", marginBottom: 8 }}>POINT GUIDE</p>
          <p className="text-white text-sm mb-5">
            Collect points by engaging with local music. Discover new artists at record shops, listen, add them to your Lokol Scene and go to their shows
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-white font-bold text-xs">discover + listen</p>
              <p style={{ fontFamily: anton, fontSize: 24, color: "#FFD600" }}>5 PTS</p>
            </div>
            <div>
              <p className="text-white font-bold text-xs">add to your scene</p>
              <p style={{ fontFamily: anton, fontSize: 24, color: "#FFD600" }}>10 PTS</p>
            </div>
            <div>
              <p className="text-white font-bold text-xs">attend show</p>
              <p style={{ fontFamily: anton, fontSize: 24, color: "#FFD600" }}>25 PTS</p>
            </div>
          </div>
        </div>

        {/* HOW TO EARN POINTS AT SHOWS */}
        <div className="px-5 pb-8">
          <p style={{ fontFamily: anton, fontSize: 18, color: "#FFD600", marginBottom: 8 }}>HOW TO EARN POINTS AT SHOWS?</p>
          <p className="text-white text-sm">
            When you attend a show, approach the artist and have them scan your QR code. See a great show, meet and support the artist and earn points in one night.
          </p>
        </div>

        {/* HOW DO I REDEEM POINTS */}
        <div className="px-5 pb-8">
          <p style={{ fontFamily: anton, fontSize: 18, color: "#FFD600", marginBottom: 8 }}>HOW DO I REDEEM POINTS?</p>
          <p className="text-white text-sm">
            Tap the Market icon in the menu. Click Redeem under the record store or partner you want to redeem with. A QR code will appear. Have the cashier scan it.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FanInfo;
