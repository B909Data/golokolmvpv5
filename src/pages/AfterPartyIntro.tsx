import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import doorsBg from "@/assets/after-party-doors.png";

const AfterPartyIntro = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event } = useQuery({
    queryKey: ["event-intro", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("artist_name, title")
        .eq("id", eventId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const artistName = event?.artist_name || "the Artist";

  const handleContinue = () => {
    navigate(`/after-party/${eventId}/rsvp?source=merch`);
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-end relative overflow-hidden"
      style={{
        backgroundImage: `url(${doorsBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Content positioned in bottom half */}
      <div className="relative z-10 w-full max-w-[500px] px-6 pb-10 pt-8 flex flex-col items-center text-center">
        {/* Heading */}
        <h1
          className="font-display uppercase font-bold leading-tight mb-4 text-[36px] sm:text-[48px] md:text-[56px]"
          style={{ color: "#FFD600" }}
        >
          {artistName} AFTER PARTY
        </h1>

        {/* Subheading */}
        <p className="text-white font-sans text-lg sm:text-xl mb-6">
          A 24-hour exclusive experience
        </p>

        {/* Body */}
        <p className="text-white font-sans text-sm sm:text-base leading-relaxed max-w-[400px] mb-8">
          An After Party is a 24-hour, fan-only livestream where {artistName} engages directly with fans, answers questions, and shares exclusive moments. You get immediate access right after purchase.
        </p>

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="w-full max-w-[300px] font-display uppercase font-bold text-sm tracking-wide rounded px-7 py-4 transition-all hover:brightness-90 hover:-translate-y-0.5"
          style={{
            backgroundColor: "#FFD600",
            color: "#080808",
            minHeight: "48px",
          }}
        >
          Continue to {artistName} After Party
        </button>

        {/* Footer note */}
        <p
          className="font-mono text-[11px] tracking-widest mt-6"
          style={{ color: "#999999" }}
        >
          24 hours of exclusive access. Starts after the live show.
        </p>
      </div>
    </div>
  );
};

export default AfterPartyIntro;
