import { useState, useRef, ReactNode } from "react";
import golokolLogo from "@/assets/golokol-logo.svg";
import slide1Screenshot from "@/assets/slide1-screenshot.png";
import slide2Screenshot from "@/assets/slide2-screenshot.png";
import slide3Screenshot from "@/assets/slide3-screenshot.png";

interface LLSOnboardingProps {
  storeSlug: string;
  children: ReactNode;
}

const STORAGE_KEY_PREFIX = "golokol_onboarded_v3_";

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
    screenshot: slide1Screenshot,
    heading: (
      <>
        1
        <br />
        Listen to Atlanta's emerging music. No algorithm.
      </>
    ),
  },
  {
    screenshot: slide2Screenshot,
    heading: (
      <>
        2
        <br />
        Add artists to your own Lokol Scene.
      </>
    ),
  },
  {
    screenshot: slide3Screenshot,
    heading: (
      <>
        3
        <br />
        Show up. Show out. Earn points. Redeem locally.
      </>
    ),
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
        style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: "#000" }}
      >
        <style>{KEYFRAMES}</style>
        <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center max-w-md">
          <img src={golokolLogo} alt="GoLokol" className="w-16 h-16" />
          <SoundWave />
          <p className="text-white text-[18px] leading-relaxed">
            Discover Atlanta artists and shows in 3 steps.
          </p>
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: "#000" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{KEYFRAMES}</style>

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
          src={slide.screenshot}
          alt=""
          className="w-auto max-h-[55vh] rounded-2xl"
        />
        <h2
          style={{
            fontFamily: "'Anton', sans-serif",
            color: "#FFD600",
            fontSize: 28,
            lineHeight: 1.15,
          }}
        >
          {slide.heading}
        </h2>
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
