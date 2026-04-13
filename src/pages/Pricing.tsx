import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Artist Pricing
          </h1>

          <p className="text-lg md:text-xl leading-relaxed mb-4">
            After enjoying GoLokol for a month for free, artists are welcomed to remain connected to their fanbase for only $9.99/month.
          </p>
          <p className="text-lg md:text-xl leading-relaxed mb-10">
            If you choose not to stay connected with GoLokol, we will keep your fanbase intact for another month.
          </p>

          <h2 className="font-display text-2xl md:text-3xl font-bold text-[#FFD600] mb-6">
            Coming to GoLokol:
          </h2>

          <ul className="space-y-3 mb-12">
            {[
              "Newly added record stores, cafes and public events for Lokol Listening Stations",
              "Download your own Lokol fan data",
              "Direct-to-lokol fan music sales",
              "Direct-to-lokol fan merch",
              "IRL events and opportunities to engage with your lokol base",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#FFD600] flex-shrink-0" />
                <span className="text-base md:text-lg">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/lls-us/artists"
            className="inline-flex items-center justify-center bg-[#FFD600] text-black font-display font-bold text-base rounded-lg py-3 px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Submit Your Music
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
