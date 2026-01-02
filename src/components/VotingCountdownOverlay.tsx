import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import golokolNameLogo from "@/assets/golokol-name-logo.svg";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
}

const VotingCountdownOverlay = () => {
  const votingStartDate = new Date("2025-01-31T00:00:00");
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0 });
  const [isVotingOpen, setIsVotingOpen] = useState(false);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const difference = votingStartDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsVotingOpen(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown({ days, hours, minutes });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isVotingOpen) {
    return null;
  }

  const padNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ top: "80px" }}>
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm pointer-events-auto" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12 max-w-lg mx-4 pointer-events-auto">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src={golokolNameLogo} 
            alt="GoLokol" 
            className="h-16 md:h-20 mx-auto"
          />
        </div>

        {/* Countdown Timer */}
        <div className="mb-6">
          <div className="font-display text-4xl md:text-6xl text-primary tracking-wider">
            {padNumber(countdown.days)}:{padNumber(countdown.hours)}:{padNumber(countdown.minutes)}
          </div>
          <p className="text-muted-foreground text-sm mt-2">days : hours : minutes</p>
        </div>

        {/* Primary Header */}
        <h2 className="font-display text-2xl md:text-3xl text-foreground mb-2">
          Voting will begin January 31
        </h2>

        {/* Secondary Headers */}
        <div className="mb-8">
          <p className="text-lg md:text-xl text-primary font-semibold">
            The next Lokol Listening Sessions
          </p>
          <p className="text-muted-foreground mt-1">
            Handle Bar on Edgewood
          </p>
          <p className="text-muted-foreground">
            Saturday February 21
          </p>
        </div>

        {/* Buy Tickets Button */}
        <Button variant="default" size="lg" className="px-8">
          Buy Tickets
        </Button>
      </div>
    </div>
  );
};

export default VotingCountdownOverlay;
