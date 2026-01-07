import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface EventData {
  id: string;
  title: string;
  artist_name: string;
  start_at: string;
  city: string;
  venue_name: string;
  artist_access_token: string;
}

const CreateAfterpartySuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "verify-afterparty-payment",
          { body: { session_id: sessionId } }
        );

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        
        const event = data.event as EventData;
        
        // Redirect immediately to Artist Control Room
        if (event?.id && event?.artist_access_token) {
          navigate(`/artist/event/${event.id}?token=${event.artist_access_token}&welcome=true`, { replace: true });
        } else {
          setError("Missing event data");
          setIsVerifying(false);
        }
      } catch (err: any) {
        console.error("Verification error:", err);
        setError(err.message || "Failed to verify payment");
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-sans">Verifying your payment...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <div className="rounded-full bg-destructive/20 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="font-display text-3xl text-foreground mb-4">
              Verification Failed
            </h1>
            <p className="text-muted-foreground font-sans mb-6">{error}</p>
            <Link to="/create-afterparty">
              <Button variant="outline">Try Again</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return null;
};

export default CreateAfterpartySuccess;
