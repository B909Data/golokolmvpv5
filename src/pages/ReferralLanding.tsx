import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LLSOnboarding from "@/components/LLSOnboarding";
import golokolLogo from "@/assets/golokol-logo.svg";

const SLUG_TO_GENRE: Record<string, string> = {
  "Hip-Hop": "hiphop",
  "R&B": "rnb",
  "Alternative": "alternative",
  "Hardcore": "hardcore",
  "Indie": "indie",
};

const ReferralLanding = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      if (!code) { setError(true); setLoading(false); return; }

      try {
        // Look up referral
        const { data: referral } = await (supabase as any)
          .from("referrals")
          .select("submission_id, artist_name")
          .eq("referral_code", code)
          .maybeSingle();

        if (!referral) { setError(true); setLoading(false); return; }

        // Look up submission to get genre
        const { data: submission } = await (supabase as any)
          .from("lls_artist_submissions")
          .select("id, genre_style")
          .eq("id", referral.submission_id)
          .maybeSingle();

        if (!submission) { setError(true); setLoading(false); return; }

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

        // Store ref code for signup to pick up
        localStorage.setItem("golokol_referral_code", code);

        // Get genre slug
        const genreStyle = submission.genre_style?.split(",")[0].trim() || "hiphop";
        const genreSlug = SLUG_TO_GENRE[genreStyle] || genreStyle.toLowerCase().replace(/[^a-z0-9]/g, "");

        setLoading(false);

        // Navigate to genre page with autoplay param
        // Small delay so onboarding can render first
        setTimeout(() => {
          navigate(`/lls/atlanta/genre/${genreSlug}?autoplay=${submission.id}`, { replace: true });
        }, 100);

      } catch {
        setError(true);
        setLoading(false);
      }
    };
    resolve();
  }, [code, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="text-center max-w-sm">
          <img src={golokolLogo} alt="GoLokol" className="w-16 h-16 mx-auto mb-6" />
          <p className="text-white text-xl font-bold mb-2">
            This link has expired.
          </p>
          <p className="text-white/60 text-sm">
            Discover Atlanta music at golokol.app
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-3 rounded-full font-bold text-sm"
            style={{ backgroundColor: "#FFD600", color: "#000" }}
          >
            Explore Music
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse">
          <img src={golokolLogo} alt="GoLokol" className="w-16 h-16" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-pulse">
        <img src={golokolLogo} alt="GoLokol" className="w-16 h-16" />
      </div>
    </div>
  );
};

export default ReferralLanding;
