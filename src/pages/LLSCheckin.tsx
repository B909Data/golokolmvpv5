import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface CheckinResult {
  success: boolean;
  artistName?: string;
  guestName?: string;
  error?: string;
}

const LLSCheckin = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CheckinResult | null>(null);

  useEffect(() => {
    const doCheckin = async () => {
      if (!eventId || !token) {
        setResult({ success: false, error: "Missing event or token" });
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("lls-checkin", {
          body: { eventId, token },
        });

        if (fnError) {
          // Fallback to fetch to read actual response body
          const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lls-checkin`;
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ eventId, token }),
          });

          if (!res.ok) {
            const txt = await res.text();
            setResult({ success: false, error: txt });
            return;
          }

          const fallbackData = await res.json();
          setResult({
            success: true,
            artistName: fallbackData.artistName,
            guestName: fallbackData.guestName,
          });
          return;
        }

        if (data?.error) {
          setResult({ success: false, error: data.error });
          return;
        }

        setResult({
          success: true,
          artistName: data.artistName,
          guestName: data.guestName,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setResult({ success: false, error: message });
      } finally {
        setLoading(false);
      }
    };

    doCheckin();
  }, [eventId, token]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto text-center">
          {loading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-muted-foreground text-lg">Checking your pass…</p>
            </div>
          ) : result?.success ? (
            <div className="space-y-4">
              <div className="text-6xl">✅</div>
              <h1 className="font-display text-2xl text-foreground">
                Pass confirmed
              </h1>
              <p className="text-lg text-muted-foreground">
                You're checked in.
              </p>
              {result.guestName && (
                <p className="text-foreground font-medium">
                  Welcome, {result.guestName}!
                </p>
              )}
              {result.artistName && (
                <p className="text-muted-foreground">
                  Attending for <span className="text-foreground font-medium">{result.artistName}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <h1 className="font-display text-2xl text-foreground">
                Pass not valid
              </h1>
              <p className="text-destructive">
                {result?.error || "Unknown error"}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSCheckin;
