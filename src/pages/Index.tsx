import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/golokol-hero.svg";
import llsCard from "@/assets/lls-us-hero.jpg";
import connectCard from "@/assets/connect-card.jpg";
import img3Card from "@/assets/img3.svg";


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
            <span className="text-white">The Future of music </span>
            <span className="text-[#FFD600]">is local</span>
          </h1>
          <p className="text-white text-base md:text-lg mt-4 max-w-xl opacity-90">
            GoLokol supports local music discovery, fan engagement and music scenes.
          </p>
          <p className="text-white text-base md:text-lg mt-2 max-w-xl opacity-90">
            We launch April 18 on Record Store Day in Atlanta.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/lls-us/retail"
              className="inline-flex items-center justify-center bg-white text-black font-semibold text-base rounded-2xl h-14 px-8 min-w-[200px] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              I am a record store
            </Link>
            <Link
              to="/lls-us/artists"
              className="inline-flex items-center justify-center bg-black text-[#FFD600] font-semibold text-base rounded-2xl h-14 px-8 min-w-[200px] border-2 border-[#FFD600] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              I am an artist
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
          <p className="text-[20px] text-white leading-relaxed mb-6">
            Local music ecosystems have been disconnected by algorithms and ungrounded viral moments. Artists struggle alone. Music lovers are overwhelmed with choice. Local venues and music retail compete with monopolies that prioritize the intangible.
          </p>
          <p className="text-[20px] text-white leading-relaxed">
            We help reconnect the collective strength of local artists, fans, venues, and retail with the city they all call home.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-[#0E0E0E] px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <h2 className="text-center font-display font-bold text-3xl md:text-[40px] text-white mb-12">
          How it works
        </h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <HowItWorksCard
            image={llsCard}
            number={1}
            title="Lokol Listening Stations"
            description="Place a Lokol Listening Station in your store featuring local artists city-wide."
            to="/lls-us"
          />
          <HowItWorksCard
            image={connectCard}
            number={2}
            title="Your City Your Scene"
            description='Local music lovers scan, discover and add artists to their customized "Lokol Scene" dashboard. Local artists enjoy direct-to-fan engagement and show promotion.'
            to="https://golokol.app/lls-us"
          />
          <HowItWorksCard
            image={img3Card}
            number={3}
            title="The Value of Local Music"
            description="Local fans earn points for engaging and attending shows. Then redeem that value at local businesses."
            to="https://golokol.app/lls-us"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
