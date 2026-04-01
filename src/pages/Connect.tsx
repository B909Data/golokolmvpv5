import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import connectHero from "@/assets/connect-card.jpg";

const Connect = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error: dbError } = await supabase
      .from("connect_waitlist" as any)
      .insert({ first_name: firstName.trim() || null, email: trimmedEmail } as any);

    setLoading(false);

    if (dbError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    setFirstName("");
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={connectHero}
          alt="GoLokol Connect"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 px-6 md:px-12 pt-32 pb-16 max-w-3xl text-center">
          <h1 className="font-display font-bold text-[32px] md:text-[48px] leading-[1.1] text-white mb-6">
            GoLokol Connect Coming Soon
          </h1>
          <div className="text-white text-[18px] md:text-[20px] leading-[1.8] max-w-2xl mx-auto text-left">
            <p className="font-bold text-[#FFD600] mb-1">For Artists</p>
            <p>Your fans already found you. They voted for you at a Lokol Listening Station. GoLokol Connect lets you reach them directly. No chasing. No algorithm. Just a direct line to the local fans who already raised their hand for your music. $9.99/month.</p>
          </div>
        </div>
      </section>

      {/* FOR FANS */}
      <section className="bg-black px-6 md:px-12 py-16">
        <div className="max-w-2xl mx-auto text-left">
          <p className="font-bold text-[#FFD600] text-[18px] md:text-[20px] mb-1">For Fans</p>
          <p className="text-white text-[18px] md:text-[20px] leading-[1.8]">Build your local music dashboard. Discover artists through Lokol Listening Stations in the real world, vote for who moves you, and follow their journey on GoLokol Connect. Earn Lokol Points through real engagement, buying music, going to shows, sharing what you love, and redeem with local businesses that matter to you.</p>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="bg-black px-8 py-20 flex justify-center">
        <div className="border-2 border-white rounded-2xl p-8 md:p-12 max-w-[500px] w-full">
          <h2 className="font-display font-bold text-2xl text-white text-center mb-8">
            Join the waitlist
          </h2>

          {submitted && (
            <p className="text-white text-base text-center mb-6">
              Thanks! We'll be in touch soon.
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={100}
              className="w-full h-11 bg-black text-white placeholder-[#888] border border-[#444] rounded-lg px-4 text-base focus:outline-none focus:border-white transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
              className="w-full h-11 bg-black text-white placeholder-[#888] border border-[#444] rounded-lg px-4 text-base focus:outline-none focus:border-white transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#FFD600] text-black font-semibold text-base rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg mt-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Notify Me"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Connect;
