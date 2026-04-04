import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    const validate = async () => {
      try {
        const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: supabaseKey } }
        );
        const data = await res.json();
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("invalid");
      }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    try {
      const { error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return <p className="text-black/70">Verifying your request…</p>;
      case "valid":
        return (
          <>
            <p className="text-black/70 mb-6">
              Click below to unsubscribe from future app emails from GoLokol.
            </p>
            <Button
              onClick={handleUnsubscribe}
              className="bg-black text-yellow-400 hover:bg-black/90"
            >
              Confirm Unsubscribe
            </Button>
          </>
        );
      case "already":
        return <p className="text-black/70">You've already been unsubscribed. No further action needed.</p>;
      case "success":
        return <p className="text-green-600 font-medium">You've been unsubscribed successfully.</p>;
      case "invalid":
        return <p className="text-black/70">This unsubscribe link is invalid or has expired.</p>;
      case "error":
        return <p className="text-red-600">Something went wrong. Please try again later.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-black mb-4">Email Preferences</h1>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Unsubscribe;
