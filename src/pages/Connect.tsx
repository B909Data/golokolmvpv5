import { useState } from "react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import connectHero from "@/assets/connect-hero.jpg";

const Connect = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    // TODO: integrate with backend
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
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-6 md:px-12 pt-32 pb-16 max-w-3xl text-center">
          <h1 className="font-display font-bold text-[32px] md:text-[48px] leading-[1.1] text-white mb-6">
            GoLokol Connect Coming Soon
          </h1>
          <p className="text-white text-[18px] md:text-[20px] leading-[1.8] max-w-2xl mx-auto">
            Local music fans discover your music in the real world and add you to their GoLokol Connect. Starting at $9.99 a month. Promote shows, sell music and announce updates with no algorithmic interference. Own your music, data and momentum.
          </p>
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
              className="w-full h-11 bg-[#FFD600] text-black font-semibold text-base rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg mt-2"
            >
              Notify Me
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black py-8 text-center">
        <p className="text-sm text-white">
          GoLokol — The future of music is local.
        </p>
      </footer>
    </div>
  );
};

export default Connect;
