import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import golokolLogo from "@/assets/golokol-logo.svg";

const WalkInIntro = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get("token");

  const handleEnter = () => {
    navigate(`/after-party/${eventId}/room?token=${token}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-24 pb-24 px-4">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Logo */}
          <img
            src={golokolLogo}
            alt="GoLokol"
            className="h-16 w-16 mx-auto mb-8"
          />

          {/* Welcome Message */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Welcome to GoLokol
          </h1>

          <p className="text-muted-foreground font-sans text-lg mb-8 leading-relaxed">
            This is a post-show space for fans who were actually there.
            <br />
            <span className="text-primary font-medium">You're in.</span>
          </p>

          {/* Enter Button */}
          <Button
            size="lg"
            className="w-full max-w-xs mx-auto"
            onClick={handleEnter}
          >
            Enter After Party
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WalkInIntro;
