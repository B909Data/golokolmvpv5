import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CheckBullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-3 h-3 text-[#0E0E0E]" strokeWidth={3} />
    </span>
    <span className="font-normal">{children}</span>
  </li>
);

const Paragraph = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-[#0E0E0E] leading-relaxed mb-4", className)}>{children}</p>
);

type AccordionItemProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

const AccordionItem = ({ id, title, children, isOpen, onToggle }: AccordionItemProps) => (
  <div className="border-b border-[#CCCCCC] last:border-b-0">
    <button
      id={id}
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-expanded={isOpen}
    >
      <h2 className="font-display text-xl md:text-2xl font-bold text-[#0E0E0E] pr-4">{title}</h2>
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#0E0E0E]" strokeWidth={2.5} />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#0E0E0E]" strokeWidth={2.5} />
        )}
      </span>
    </button>
    <div
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[5000px] opacity-100 pb-6" : "max-h-0 opacity-0"
      )}
    >
      {children}
    </div>
  </div>
);

const SECTIONS = [
  { id: "what-is-golokol", title: "What is GoLokol?" },
  { id: "serve-artists", title: "How do we serve Artists?" },
  { id: "serve-small-business", title: "How do we serve small business?" },
  { id: "what-are-lls", title: "What Are Lokol Listening Stations?" },
  { id: "serve-fans", title: "How do we serve Local Music Fans?" },
  { id: "suggestion-box", title: "Suggestion Box" },
];

const HowToGoLokol = () => {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return new Set([SECTIONS[0].id]);
    }
    return new Set();
  });
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const scrollToSection = (id: string) => {
    setOpenSections((prev) => new Set([...prev, id]));
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSuggestionSubmit = async () => {
    if (!feedbackMessage.trim()) {
      toast.error("Please enter a message first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("suggestions").insert({
        name: feedbackName.trim() || null,
        email: feedbackEmail.trim() || null,
        message: feedbackMessage.trim(),
      });
      if (error) throw error;
      setFeedbackName("");
      setFeedbackEmail("");
      setFeedbackMessage("");
      toast.success("Got it. Thank you for helping us build something real.");
    } catch (err) {
      console.error("Suggestion submit error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {/* Page Header */}
            <header className="mb-10">
              <h1 className="font-display text-4xl md:text-5xl font-black text-[#0E0E0E] mb-6">HOW TO GOLOKOL</h1>
              <div className="space-y-4 text-lg text-[#555555] leading-relaxed">
                <p>GoLokol is in beta.</p>
                <p>We're building this alongside artists, not ahead of them.</p>
                <p>
                  If something feels confusing, broken, or unfinished — tell us.<br />
                  Your feedback helps us make this better for the artists coming next.
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <a href="mailto:backstage@golokol.app" className="text-primary hover:underline">
                    backstage@golokol.app
                  </a>
                </p>
              </div>
            </header>

            {/* Jump To Links */}
            <nav className="mb-10 p-4 bg-[#F5F5F5] rounded-lg">
              <p className="text-sm font-medium text-[#555555] mb-3 uppercase tracking-wide">Jump to:</p>
              <div className="flex flex-wrap gap-2">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className="text-sm text-[#0E0E0E] bg-white border border-[#CCCCCC] rounded-full px-3 py-1.5 hover:bg-primary hover:text-[#0E0E0E] hover:border-primary transition-colors"
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </nav>

            {/* Accordion Sections */}
            <div className="border-t border-[#CCCCCC]">
              {/* Section 1: What is GoLokol? */}
              <AccordionItem
                id="what-is-golokol"
                title="What is GoLokol?"
                isOpen={openSections.has("what-is-golokol")}
                onToggle={() => toggleSection("what-is-golokol")}
              >
                <Paragraph>
                  GoLokol is a music discovery platform built for local artists and the fans who support them in person. We connect emerging artists with local music fans through Lokol Listening Stations — physical discovery kiosks placed inside independent record stores and music-friendly retail.
                </Paragraph>
                <Paragraph>
                  No algorithm. No streaming. No followers required. Just real music, real fans, and real community.
                </Paragraph>
                <Paragraph className="font-semibold">
                  GoLokol is built on one belief: the future of music is local.
                </Paragraph>
              </AccordionItem>

              {/* Section 2: How do we serve Artists? */}
              <AccordionItem
                id="serve-artists"
                title="How do we serve Artists?"
                isOpen={openSections.has("serve-artists")}
                onToggle={() => toggleSection("serve-artists")}
              >
                <Paragraph>
                  GoLokol gives emerging artists a direct line to local fans — without needing a label, a playlist, or a social media following.
                </Paragraph>
                <Paragraph className="font-semibold">Here is how it works:</Paragraph>
                <ul className="space-y-3 mb-6">
                  <CheckBullet>Submit up to 2 songs per month for free</CheckBullet>
                  <CheckBullet>GoLokol reviews each submission for sound quality and community fit</CheckBullet>
                  <CheckBullet>Selected songs are placed on Lokol Listening Stations inside Atlanta record stores</CheckBullet>
                  <CheckBullet>Local fans discover, listen, and save your music in person</CheckBullet>
                  <CheckBullet>Every fan who saves you gets notified when you have a show — and earns points for showing up</CheckBullet>
                </ul>

                <Paragraph className="font-semibold">When your song is selected you receive one free month of GoLokol Connect which includes:</Paragraph>
                <ul className="space-y-3 mb-6">
                  <CheckBullet>Dashboard showing how many fans have listened to and saved your song</CheckBullet>
                  <CheckBullet>Fan neighborhood data so you know where your supporters are coming from</CheckBullet>
                  <CheckBullet>Show promotion — alert your fans directly when you have an upcoming show</CheckBullet>
                  <CheckBullet>After your free month GoLokol Connect is $9.99 per month</CheckBullet>
                </ul>

                <Paragraph className="font-semibold">Submission requirements:</Paragraph>
                <ul className="space-y-3 mb-4">
                  <CheckBullet>MP3 format only, max 20MB</CheckBullet>
                  <CheckBullet>Square song artwork (minimum 200×200px, max 3MB)</CheckBullet>
                  <CheckBullet>Short bio (240 characters max) — this is what new fans see</CheckBullet>
                  <CheckBullet>Physical product status (vinyl, CD, merch — in production counts)</CheckBullet>
                </ul>
              </AccordionItem>

              {/* Section 3: How do we serve small business? */}
              <AccordionItem
                id="serve-small-business"
                title="How do we serve small business?"
                isOpen={openSections.has("serve-small-business")}
                onToggle={() => toggleSection("serve-small-business")}
              >
                <Paragraph>
                  GoLokol partners with independent record stores and music-friendly retail to bring local music discovery into your space.
                </Paragraph>
                <Paragraph className="font-semibold">What you get as a partner:</Paragraph>
                <ul className="space-y-3 mb-6">
                  <CheckBullet>A Lokol Listening Station — a QR code display that turns your store into a discovery hub</CheckBullet>
                  <CheckBullet>Foot traffic from music fans who come in specifically to discover local artists</CheckBullet>
                  <CheckBullet>A digital presence on the GoLokol platform listing your store as a discovery location</CheckBullet>
                  <CheckBullet>Revenue share opportunities from future GoLokol market features</CheckBullet>
                  <CheckBullet>Your store logo featured in the GoLokol Lokol Market rewards section</CheckBullet>
                </ul>
                <Paragraph>
                  Partnership is free during our Atlanta pilot. We are currently placing stations in select Atlanta stores.
                </Paragraph>
                <Paragraph>
                  Interested in becoming a partner?{" "}
                  <button
                    onClick={() => navigate("/lls-us/retail")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Visit our Record Stores page to apply.
                  </button>
                </Paragraph>
              </AccordionItem>

              {/* Section 4: What Are Lokol Listening Stations? */}
              <AccordionItem
                id="what-are-lls"
                title="What Are Lokol Listening Stations?"
                isOpen={openSections.has("what-are-lls")}
                onToggle={() => toggleSection("what-are-lls")}
              >
                <Paragraph>
                  Lokol Listening Stations are physical QR code displays placed inside partner stores. When a fan scans the QR code they are taken to a mobile discovery experience where they can:
                </Paragraph>
                <ul className="space-y-3 mb-6">
                  <CheckBullet>Browse local Atlanta artists by genre</CheckBullet>
                  <CheckBullet>Listen to curated song previews</CheckBullet>
                  <CheckBullet>Save artists they love to their Lokol Scene</CheckBullet>
                  <CheckBullet>Earn Lokol Points for listening and saving</CheckBullet>
                </ul>
                <Paragraph>
                  Fans do not need an account to browse. They create a free account to save artists and track their points.
                </Paragraph>
                <Paragraph>
                  Lokol Listening Stations are currently live at Crate ATL in Atlanta as part of our Record Store Day 2026 pilot launch.
                </Paragraph>
              </AccordionItem>

              {/* Section 5: How do we serve Local Music Fans? */}
              <AccordionItem
                id="serve-fans"
                title="How do we serve Local Music Fans?"
                isOpen={openSections.has("serve-fans")}
                onToggle={() => toggleSection("serve-fans")}
              >
                <Paragraph>
                  GoLokol gives local music fans a way to discover and support artists before they blow up — and get rewarded for doing it early.
                </Paragraph>
                <Paragraph className="font-semibold">As a GoLokol fan you can:</Paragraph>
                <ul className="space-y-3 mb-6">
                  <CheckBullet>Discover local Atlanta artists at record stores through Lokol Listening Stations</CheckBullet>
                  <CheckBullet>Build your Lokol Scene — a personal collection of artists you love</CheckBullet>
                  <CheckBullet>Earn Lokol Points for listening, saving artists, and attending shows</CheckBullet>
                  <CheckBullet>Redeem points for discounts at local partner stores</CheckBullet>
                  <CheckBullet>Get notified when artists in your scene have upcoming shows</CheckBullet>
                </ul>
                <Paragraph>
                  My Lokol Scene is your personal music dashboard. It lives on your phone and grows every time you engage with local music.
                </Paragraph>
                <Paragraph className="font-semibold">
                  GoLokol fans do not pay anything. The platform is free to use.
                </Paragraph>
              </AccordionItem>

              {/* Section 6: Suggestion Box */}
              <AccordionItem
                id="suggestion-box"
                title="Suggestion Box"
                isOpen={openSections.has("suggestion-box")}
                onToggle={() => toggleSection("suggestion-box")}
              >
                <Paragraph>
                  We are building GoLokol with the community in mind. If you have ideas, feedback, or want to get involved we want to hear from you.
                </Paragraph>
                <div className="mt-6 space-y-4">
                  <Input
                    placeholder="Name"
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className="bg-[#282828] border-primary text-white placeholder:text-gray-400"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="bg-[#282828] border-primary text-white placeholder:text-gray-400"
                  />
                  <Textarea
                    placeholder="Share your thoughts, ideas, or feedback..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="min-h-[120px] bg-[#282828] border-primary text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSuggestionSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-[#FFD600] text-black font-bold hover:bg-[#FFD600]/90"
                  >
                    {isSubmitting ? "Sending..." : "Send"}
                  </Button>
                </div>
              </AccordionItem>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowToGoLokol;
