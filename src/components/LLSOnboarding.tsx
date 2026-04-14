import { useState, useEffect, useRef, ReactNode } from "react";
import atlantaBg from "@/assets/atlanta-bg.svg";
import golokolLogo from "@/assets/golokol-logo.svg";

interface LLSOnboardingProps {
  storeSlug: string;
  children: ReactNode;
}

const STORAGE_KEY_PREFIX = "golokol_onboarded_";

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
    <style>{`
      @keyframes soundWave {
        0%, 100% { transform: scaleY(0.4); }
        50% { transform: scaleY(1); }
      }
    `}</style>
  </div>
);

const SLIDES = [
  {
    emoji: "🎧",
    heading: "Discover Local Music",
    body: "Browse Atlanta artists you won't find on any algorithm. Real music. Right here.",
  },
  {
    emoji: "⭐",
    heading: "Earn Lokol Points",
    body: "Save artists to your Lokol Scene and show up to local shows to earn points.",
  },
  {
    emoji: "🎁",
    heading: "Redeem at Local Spots",
    body: "Use your points for discounts at Crates ATL and other Atlanta partners.",
  },
];

const LLSOnboarding = ({ storeSlug, children }: LLSOnboardingProps) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${storeSlug}`;
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(storageKey) === "true");
  const [phase, setPhase] = useState<"splash" | "swipe">("splash");
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (onboarded) return;
    const timer = setTimeout(() => setPhase("swipe"), 3000);
    return () => clearTimeout(timer);
  }, [onboarded]);

  if (onboarded) return <>{children}</>;

  if (phase === "splash") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <img src={atlantaBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-md">
          <img src={golokolLogo} alt="GoLokol" className="w-16 h-16" />
          <SoundWave />
          <p className="text-white font-bold text-[18px] leading-relaxed">
            Good music lives here. Start exploring.
          </p>
          <p className="font-bold text-[14px]" style={{ color: "#FFD600" }}>
            Your city. Your scene. Be a part of it.
          </p>
        </div>
      </div>
    );
  }

  const isLast = currentSlide === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem(storageKey, "true");
      setOnboarded(true);
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

  const slide = SLIDES[currentSlide];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress dots */}
      <div className="absolute top-12 flex gap-2">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
            style={{ backgroundColor: i === currentSlide ? "#FFD600" : "#555" }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 px-8 text-center max-w-md">
        <span className="text-[64px]">{slide.emoji}</span>
        <h2 className="text-white font-bold text-[28px]">{slide.heading}</h2>
        <p className="text-white text-[16px] leading-relaxed">{slide.body}</p>
      </div>

      <button
        onClick={next}
        className="absolute bottom-16 font-bold text-[16px] rounded-[16px] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ backgroundColor: "#FFD600", color: "#000", width: 200, height: 56 }}
      >
        {isLast ? "Let's Go" : "Next"}
      </button>
    </div>
  );
};

export default LLSOnboarding;
