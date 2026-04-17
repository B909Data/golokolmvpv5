import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import golokolLogo from "@/assets/golokol-logo.svg";
import type { User } from "@supabase/supabase-js";

const GENRE_OPTIONS = ["Hip Hop", "RnB", "Alternative", "Hardcore + Punk"];

const ArtistSubmitShow = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [eventName, setEventName] = useState("");
  const [venueName, setVenueName] = useState("");
  const [showDate, setShowDate] = useState("");
  const [showTime, setShowTime] = useState("");
  const [genre, setGenre] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/artist/signup", { replace: true });
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!eventName.trim()) return toast.error("Event Name is required");
    if (!venueName.trim()) return toast.error("Venue Name is required");
    if (!showDate) return toast.error("Show Date is required");
    if (!genre) return toast.error("Genre is required");

    setSubmitting(true);
    try {
      const { error } = await (supabase as any).from("show_listings").insert({
        event_name: eventName.trim(),
        venue_name: venueName.trim(),
        show_date: showDate,
        show_time: showTime || null,
        ticket_url: ticketUrl.trim() || null,
        artist_user_id: user.id,
        city: "Atlanta",
        genre,
      });
      if (error) throw error;
      toast.success("Show submitted!");
      navigate("/artist/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to submit show");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FFD600] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <link href="https://fonts.googleapis.com/css2?family=Anton&display=swap" rel="stylesheet" />

      <div className="flex-1 px-6 py-12 max-w-md mx-auto w-full">
        <button
          onClick={() => navigate("/artist/dashboard")}
          className="flex items-center text-white/70 text-sm mb-6 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="text-center mb-8">
          <img src={golokolLogo} alt="GoLokol" className="h-12 w-12 mx-auto mb-4" />
          <h1
            className="text-white"
            style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 1.1 }}
          >
            Submit a Show
          </h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Event Name *</label>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              maxLength={200}
              placeholder="Friday Night Live"
              className="w-full bg-[#1a1a1a] border border-[#333] text-white placeholder-white/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Venue Name *</label>
            <input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              maxLength={200}
              placeholder="The Earl"
              className="w-full bg-[#1a1a1a] border border-[#333] text-white placeholder-white/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Show Date *</label>
            <input
              type="date"
              value={showDate}
              onChange={(e) => setShowDate(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Show Time</label>
            <input
              type="time"
              value={showTime}
              onChange={(e) => setShowTime(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Genre *</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
            >
              <option value="">Select a genre</option>
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Ticket URL</label>
            <input
              value={ticketUrl}
              onChange={(e) => setTicketUrl(e.target.value)}
              maxLength={500}
              placeholder="https://..."
              className="w-full bg-[#1a1a1a] border border-[#333] text-white placeholder-white/40 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#FFD600]"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#FFD600] text-black font-bold rounded-xl py-4 text-base disabled:opacity-60 mt-4"
          >
            {submitting ? "Submitting..." : "Submit Show"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistSubmitShow;
