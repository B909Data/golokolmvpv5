import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ShortLinkRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!code) {
        setError("Invalid link");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("short_links")
        .select("target_url")
        .eq("code", code)
        .maybeSingle();

      if (fetchError || !data) {
        console.error("Short link resolution failed:", fetchError);
        setError("Link not found or expired");
        return;
      }

      // 302 redirect via window.location
      window.location.replace(data.target_url);
    };

    resolve();
  }, [code]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl text-foreground mb-2">Oops</h1>
          <p className="text-muted-foreground font-sans">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground font-sans">Redirecting...</p>
    </div>
  );
};

export default ShortLinkRedirect;
