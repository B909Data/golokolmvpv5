import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/golokol-hero.svg";
import llsCard from "@/assets/lls-card.jpg";
import afterpartyCard from "@/assets/afterparty-card.jpg";
import connectCard from "@/assets/connect-card.jpg";


const HowItWorksCard = ({
  image,
  number,
  title,
  description,
  to,
}: {
  image: string;
  number: number;
  title: string;
  description: string;
  to: string;
}) => (
  <Link
    to={to}
    className="group block rounded-2xl border border-[hsl(0,0%,20%)] bg-[#1A1A1A] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <div className="h-[200px] w-full overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-6 relative">
      <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-[#FFD600] flex items-center justify-center text-black font-bold text-lg shadow-md">
        {number}
      </div>
      <h3 className="mt-4 text-2xl font-bold text-white font-display">{title}</h3>
      <p className="mt-2 text-base text-[#CCCCCC]">{description}</p>
    </div>
  </Link>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-start overflow-hidden">
        <img
          src={heroImage}
          alt="GoLokol community"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-16 max-w-3xl">
          <h1 className="font-display font-bold text-[32px] md:text-[48px] leading-[1.1] mb-4">
            <span className="text-white">Find fans you love </span>
            <span className="text-[#FFD600]">where you are</span>
          </h1>
          <p className="text-white text-base md:text-lg mt-4 max-w-xl opacity-90">
            GoLokol supports local music discovery, fan engagement and music scenes. We launch in Atlanta.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/songs"
              className="inline-flex items-center justify-center bg-white text-black font-semibold text-base rounded-2xl h-14 px-8 min-w-[200px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Lokol Listening Sessions
            </Link>
            <Link
              to="/ap-us"
              className="inline-flex items-center justify-center bg-[#FFD600] text-black font-semibold text-base rounded-2xl h-14 px-8 min-w-[200px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Create an After Party
            </Link>
          </div>
        </div>
      </section>

      {/* WHY LOCAL */}
      <section className="bg-black px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-3xl md:text-[40px] text-[#FFD600] mb-6 leading-tight">
            Music isn't dead, it's local.
          </h2>
          <p className="text-[16px] text-white leading-relaxed mb-6">
            Local music ecosystems have been disconnected by algorithms and individual passive viral moments. Artists struggle alone. Fans are overwhelmed with choice. Venues and music retail compete with digital monopolies.
          </p>
          <p className="text-[16px] text-white leading-relaxed">
            We help reconnect the collective independent strength of artists, fans, venues, and retail with the city they call home.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#0E0E0E] px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <h2 className="text-center font-display font-bold text-3xl md:text-[40px] text-white mb-12">
          How it works
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          <HowItWorksCard
            image={llsCard}
            number={1}
            title="Lokol Listening Sessions"
            description="Good music lives here. Discover and vote for local artists at your favorite record store. Find music you love where you live. Algorithms and AI can't call any place home. You do."
            to="/songs"
          />
          <HowItWorksCard
            image={afterpartyCard}
            number={2}
            title="After Parties"
            description="Make every show count. Reward and develop community with local fans who show up. A private 24 hour online chat/livestream you curate and your fans appreciate."
            to="/ap-us"
          />
          <div className="sm:col-span-2 flex justify-center">
            <div className="w-full max-w-md">
              <HowItWorksCard
                image={connectCard}
                number={3}
                title="Try GoLokol Connect"
                description="One dashboard that updates you about the shows, new music and news from all the artists you love city-wide."
                to="/connect"
              />
            </div>
          </div>
        </div>
      </section>


      {/* FAN CALLOUT */}
      <section className="bg-[#0E0E0E] px-6 py-16 md:py-24 flex justify-center">
        <div className="border-2 border-[#333] rounded-[32px] p-8 max-w-[400px] w-full text-center">
          <h3 className="font-display font-bold text-xl text-white mb-3">
            Are you a local fan?
          </h3>
          <p className="text-base text-[#999999] mb-6">
            Discover and follow artists where you live.
          </p>
          <Link
            to="/connect"
            className="inline-flex items-center justify-center bg-[#FFD600] text-black font-semibold text-base rounded-lg py-3 px-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Join GoLokol Connect
          </Link>
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

export default Index;
