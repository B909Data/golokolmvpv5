import { useState, useRef, ReactNode } from "react";
import atlantaBg from "@/assets/atlanta-bg.svg";
import golokolLogo from "@/assets/golokol-logo.svg";
import fanmenuShows from "@/assets/fanmenu-shows.svg";
import fanmenuMarket from "@/assets/fanmenu-market.svg";

interface LLSOnboardingProps {
  storeSlug: string;
  children: ReactNode;
}

const STORAGE_KEY_PREFIX = "golokol_onboarded_v2_";

const KEYFRAMES = `
  @keyframes soundWave { 0%, 100% { transform: scaleY(0.4); } 50% { transform: scaleY(1); } }
  @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
`;

const SoundWave = () => (
  <div className="flex items-end justify-center gap-[5px] h-10">
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-[4px] rounded-full"
        style={{
          backgroundColor: "#FFD600",
          animation: `soundWave 1.2s ease-in-out infinite`,
          animationDelay: `${i * 0.15}s`,
          height: [16, 28, 20, 32, 14][i],
        }}
      />
    ))}
  </div>
);

const SLIDES = [
  {
    icon: golokolLogo,
    animation: "float 2.5s ease-in-out infinite",
    heading: (
      <>
        1<br />
        Discover Local Music
      </>
    ),
    body: "Browse Atlanta artists. Decide who moves you. It matters.",
  },
  {
    icon: fanmenuShows,
    animation: "pulse 2s ease-in-out infinite",
    heading: (
      <>
        2<br />
        Build Your Scene
      </>
    ),
    body: "Save artists you love. Your Lokol Scene is your personal Atlanta music dashboard.",
  },
  {
    icon: fanmenuMarket,
    animation: "float 2.5s ease-in-out infinite",
    heading: (
      <>
        3<br />
        Show Up. Earn. Redeem.
      </>
    ),
    body: "Engage. Go to shows. Earn points and redeem value in your city.",
  },
];

const LLSOnboarding = ({ storeSlug, children }: LLSOnboardingProps) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${storeSlug}`;
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(storageKey) === "true");
  const [phase, setPhase] = useState<"splash" | "swipe">("splash");
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);

  if (onboarded) return <>{children}</>;

  if (phase === "splash") {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        <style>{KEYFRAMES}</style>
        <img src={atlantaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-md">
          <img src={golokolLogo} alt="GoLokol" className="w-16 h-16" />
          <SoundWave />
          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              color: "#FFD600",
              fontSize: 32,
              lineHeight: 1.1,
            }}
          >
            Good Music Lives Here
          </h1>
          <p className="text-white text-[18px] leading-relaxed">Atlanta's local music scene. Discover it in 3 steps.</p>
          <button
            onClick={() => setPhase("swipe")}
            className="mt-4 font-bold text-[16px] rounded-[16px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ backgroundColor: "#FFD600", color: "#000", width: 200, height: 56 }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  const isLast = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];

  const next = () => {
    if (isLast) {
      localStorage.setItem(storageKey, "true");
      setOnboarded(true);
      setTimeout(() => {
        document.getElementById("lokol-music-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      setCurrentSlide((s) => s + 1);
    }
  };

  const prev = () => {
    if (currentSlide > 0) setCurrentSlide((s) => s - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{KEYFRAMES}</style>
      <img src={atlantaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/70" />

      <div className="absolute top-12 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i === currentSlide ? "#FFD600" : "#555" }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-md">
        <img
          src={slide.icon}
          alt=""
          className="w-20 h-20"
          style={{ animation: slide.animation }}
        />
        <h2
          style={{
            fontFamily: "'Anton', sans-serif",
            color: "#FFD600",
            fontSize: 36,
            lineHeight: 1.1,
          }}
        >
          {slide.heading}
        </h2>
        <p className="text-white text-[16px] leading-relaxed max-w-xs">{slide.body}</p>
      </div>

      <button
        onClick={next}
        className="absolute bottom-16 z-10 font-bold text-[16px] rounded-[16px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ backgroundColor: "#FFD600", color: "#000", width: 200, height: 56 }}
      >
        {isLast ? "Let's Go" : "Next"}
      </button>
    </div>
  );
};

export default LLSOnboarding;
