import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const anton = "'Anton', sans-serif";

const PartnerSuccess = () => {
  const navigate = useNavigate();
  const [partnerName, setPartnerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("golokol_retail_signup");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      setPartnerName(data.contact_name || "");
      setStoreName(data.store_name || "");

      if (!fired) {
        setFired(true);
        supabase.functions
          .invoke("send-mailerlite-retail-welcome", {
            body: {
              email: data.contact_email,
              name: data.contact_name,
              business_name: data.store_name,
            },
          })
          .catch(() => {});

        localStorage.removeItem("golokol_retail_signup");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-6 py-16">
      <img src={golokolLogo} alt="GoLokol" className="h-10 mb-10" />

      <h1
        className="text-4xl md:text-6xl text-center leading-none tracking-tight"
        style={{ fontFamily: anton, color: "#FFD600" }}
      >
        WELCOME TO
      </h1>
      <h1
        className="text-4xl md:text-6xl text-center leading-none tracking-tight"
        style={{ fontFamily: anton, color: "#FFD600" }}
      >
        THE LOKOL
      </h1>
      <h1
        className="text-4xl md:text-6xl text-center leading-none tracking-tight mb-6"
        style={{ fontFamily: anton, color: "#FFD600" }}
      >
        COLLECTIVE.
      </h1>

      {storeName && (
        <p className="text-white/80 text-lg mb-8 text-center">
          {storeName}
        </p>
      )}

      <div className="max-w-2xl w-full space-y-8 mt-4">
        {/* Email confirmation */}
        <div className="border border-white/15 rounded-lg p-6 bg-white/5">
          <h2 className="text-2xl mb-3" style={{ fontFamily: anton, color: "#FFD600" }}>
            CHECK YOUR EMAIL
          </h2>
          <p className="text-white/85 text-sm leading-relaxed">
            A copy of your GoLokol Partner Agreement and payment confirmation is on its way to your inbox. Check your spam folder if you don't see it within a few minutes.
          </p>
        </div>

        {/* Next steps */}
        <div className="border border-white/15 rounded-lg p-6 bg-white/5">
          <h2 className="text-2xl mb-4" style={{ fontFamily: anton, color: "#FFD600" }}>
            WHAT HAPPENS NEXT
          </h2>
          <ul className="space-y-4">
            {[
              { step: "1", text: "Your sticker pack of 500 GoLokol stickers ships within 5 business days." },
              { step: "2", text: "Hand a sticker to every customer after purchase. It's their gift — a gateway to Atlanta's local music scene." },
              { step: "3", text: "Fans scan the sticker, discover music, earn points, and redeem at your business." },
              { step: "4", text: "GoLokol will reach out to set up your redemption reward and add you to the platform." },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-black font-bold text-sm"
                  style={{ backgroundColor: "#FFD600" }}
                >
                  {item.step}
                </span>
                <p className="text-white/85 text-sm leading-relaxed">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Questions */}
        <div className="border border-white/15 rounded-lg p-6 bg-white/5">
          <h2 className="text-2xl mb-3" style={{ fontFamily: anton, color: "#FFD600" }}>
            QUESTIONS?
          </h2>
          <p className="text-white/85 text-sm leading-relaxed">
            Email us at{" "}
            <a href="mailto:hello@golokol.app" className="text-[#FFD600] underline">
              hello@golokol.app
            </a>
            {" "}— we respond within 24 hours.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-10 px-8 py-3 rounded-full font-bold text-sm"
        style={{ backgroundColor: "#FFD600", color: "#000" }}
      >
        Explore GoLokol
      </button>

      <p className="text-white/50 text-xs mt-8 text-center">
        GoLokol — The Future of Music Is Local
      </p>
    </div>
  );
};

export default PartnerSuccess;
