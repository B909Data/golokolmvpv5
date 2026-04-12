import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

const Connect = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[48px] md:text-[64px] font-bold text-white mb-4">
          GoLokol
        </h1>
        <h2 className="font-display text-[24px] md:text-[32px] font-bold text-[#FFD600] mb-6">
          Good Music Lives Here.
        </h2>
        <p className="text-white text-[16px] md:text-[18px] leading-[1.8] max-w-xl mb-8">
          GoLokol connects local artists and fans through record stores, listening stations, and real community. No algorithm. No streaming. Just local music and the people who love it.
        </p>
        <Link to="/lls-us/artists">
          <Button
            size="lg"
            className="bg-[#FFD600] text-black font-semibold hover:bg-[#FFD600]/90 rounded-lg px-8"
          >
            Submit Your Music
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Connect;
