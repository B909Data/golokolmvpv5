import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const anton = "'Anton', sans-serif";

const ShowCheckin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fanId = searchParams.get("fan") || "";
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [artistVerified, setArtistVerified] = useState(false);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [fanName, setFanName] = useState("");
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  // Validate token is within current 10-minute window or previous
  const isTokenValid = (t: string) => {
    const current = Math.floor(Date.now() / 600000);
    const tokenNum = parseInt(t);
    return tokenNum === current || tokenNum === current - 1;
  };

  useEffect(() => {
    const verify = async () => {
      if (!fanId || !token) {
        setError("Invalid QR code.");
        setLoading(false);
        return;
      }
      if (!isTokenValid(token)) {
        setError("This QR code has expired. Ask the fan to refresh theirs.");
        setLoading(false);
        return;
      }

      // Check if artist is signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("You need to be signed in as a GoLokol artist to check in fans.");
        setLoading(false);
        return;
      }

      const currentUserId = session.user.id;

      // Check if they are a registered artist
      const { data: artistProfile } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("id, artist_name")
        .eq("artist_user_id", currentUserId)
        .maybeSingle();

      if (!artistProfile) {
        setError("Artist accounts only. This page is for GoLokol artists checking in fans at shows.");
        setLoading(false);
        return;
      }

      setArtistVerified(true);
      setArtistId(currentUserId);

      // Check if fan already checked in today
      const checkinDate = new Date().toISOString().split("T")[0];

      const { data: existingCheckin } = await (supabase as any)
        .from("show_checkins")
        .select("id")
        .eq("fan_user_id", fanId)
        .eq("artist_user_id", currentUserId)
        .eq("checkin_date", checkinDate)
        .maybeSingle();

      if (existingCheckin) {
        setAlreadyCheckedIn(true);
        setLoading(false);
        return;
      }

      // Get fan name
      const { data: fanProfile } = await (supabase as any)
        .from("fan_profiles")
        .select("name, email")
        .eq("fan_user_id", fanId)
        .maybeSingle();

      setFanName(fanProfile?.name || fanProfile?.email?.split("@")[0] || "This fan");
      setLoading(false);
    };
    verify();
  }, [fanId, token]);

  const handleConfirm = async () => {
    if (!artistId || !fanId) return;
    setConfirming(true);
    try {
      const checkinDate = new Date().toISOString().split("T")[0];

      // Insert check-in record
      await (supabase as any).from("show_checkins").insert({
        fan_user_id: fanId,
        artist_user_id: artistId,
        checkin_date: checkinDate,
        points_awarded: 25,
      });

      // Award 25pts to fan
      const { data: fanProfile } = await (supabase as any)
        .from("fan_profiles")
        .select("lokol_points")
        .eq("fan_user_id", fanId)
        .maybeSingle();

      if (fanProfile) {
        await (supabase as any)
          .from("fan_profiles")
          .update({ lokol_points: (fanProfile.lokol_points || 0) + 25 })
          .eq("fan_user_id", fanId);
      }

      setConfirmed(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setConfirming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 text-sm">Verifying...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 gap-6 text-center">
      <img src={golokolLogo} alt="GoLokol" className="w-16 h-16 mb-2" />

      {error && (
        <>
          <p style={{ fontFamily: anton, fontSize: 28, color: "#FFD600" }}>Hold up.</p>
          <p className="text-white/70 text-sm max-w-sm">{error}</p>
          {error.includes("signed in") && (
            <button
              onClick={() => navigate("/artist/signin")}
              className="px-6 py-3 rounded-full font-bold text-sm"
              style={{ backgroundColor: "#FFD600", color: "#000" }}
            >
              Sign In as Artist
            </button>
          )}
        </>
      )}

      {!error && alreadyCheckedIn && (
        <>
          <p style={{ fontFamily: anton, fontSize: 28, color: "#FFD600" }}>Already checked in.</p>
          <p className="text-white/70 text-sm max-w-sm">
            This fan already earned their show points today.
          </p>
        </>
      )}

      {!error && !alreadyCheckedIn && !confirmed && artistVerified && (
        <>
          <p style={{ fontFamily: anton, fontSize: 32, color: "#FFD600" }}>Check in fan</p>

          <div className="bg-white/5 rounded-2xl px-6 py-5 border border-white/10 w-full max-w-sm">
            <p style={{ fontFamily: anton, fontSize: 22, color: "#fff" }}>{fanName}</p>
            <p className="text-[#FFD600] text-sm mt-1 font-bold">+25 Lokol Points</p>
          </div>

          <p className="text-white/60 text-sm max-w-sm">
            Confirm this fan attended your show. This awards them 25 points.
          </p>

          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="px-8 py-3 rounded-full font-bold text-sm disabled:opacity-50"
            style={{ backgroundColor: "#FFD600", color: "#000" }}
          >
            {confirming ? "Confirming..." : "Confirm Check-in"}
          </button>
        </>
      )}

      {!error && confirmed && (
        <>
          <p style={{ fontFamily: anton, fontSize: 32, color: "#FFD600" }}>25 pts awarded!</p>
          <p className="text-white/70 text-sm">{fanName} earned their show points.</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 rounded-full font-bold text-sm border border-white/20 text-white/50"
          >
            Close
          </button>
        </>
      )}
    </div>
  );
};

export default ShowCheckin;
