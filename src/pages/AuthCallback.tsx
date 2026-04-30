import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/signin", { replace: true }); return; }

      const { data: artistProfile } = await (supabase as any)
        .from("artist_profiles")
        .select("id")
        .eq("artist_user_id", session.user.id)
        .maybeSingle();

      if (artistProfile) {
        navigate("/artist/dashboard", { replace: true });
      } else {
        navigate("/fan/scene", { replace: true });
      }
    };
    handle();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-[#FFD600] animate-spin" />
    </div>
  );
};

export default AuthCallback;
