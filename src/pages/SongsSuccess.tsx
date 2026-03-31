import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2, XCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SongsSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("verify-lls-payment", {
          body: { session_id: sessionId },
        });

        if (error || !data?.success) {
          console.error("Verification error:", error || data?.error);
          setStatus("error");
          return;
        }

        setStatus("success");
      } catch (err) {
        console.error("Verification failed:", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="font-display text-4xl text-foreground mb-4">
                Verifying your payment...
              </h1>
              <p className="text-muted-foreground">
                Please wait while we confirm your submission.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              <h1 className="font-display text-4xl text-foreground mb-4">
                Submission received.
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for submitting to Lokol Listening Stations. We'll be in touch if you're selected.
              </p>
              <Link to="/songs">
                <Button size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lokol Listening Stations
                </Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
              <h1 className="font-display text-4xl text-foreground mb-4">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-8">
                We couldn't verify your payment. If you completed payment, please contact us.
              </p>
              <Link to="/songs">
                <Button size="lg" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Lokol Listening Stations
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SongsSuccess;
