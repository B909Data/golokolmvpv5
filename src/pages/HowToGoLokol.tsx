import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

const YouTubeEmbed = ({ videoId, startTime }: { videoId: string; startTime?: number }) => {
  const src = startTime 
    ? `https://www.youtube.com/embed/${videoId}?start=${startTime}`
    : `https://www.youtube.com/embed/${videoId}`;
  
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden my-6">
      <iframe
        src={src}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

const SECTIONS = [
  { id: "what-is-golokol", title: "What is GoLokol?" },
  { id: "serve-artists", title: "How do we serve Artists?" },
  { id: "serve-small-business", title: "How do we serve small business?" },
  { id: "what-are-lls", title: "What Are Lokol Listening Stations?" },
  { id: "serve-fans", title: "How do we serve Local Music Fans?" },
  { id: "suggestion-box", title: "Suggestion Box" },
];

const HowToGoLokol = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return new Set([SECTIONS[0].id]);
    }
    return new Set();
  });
  const [suggestion, setSuggestion] = useState("");
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

  const handleSuggestionSubmit = () => {
    if (!suggestion.trim()) {
      toast.error("Please enter a suggestion first.");
      return;
    }
    setIsSubmitting(true);
    // Open email client with pre-filled suggestion
    const subject = encodeURIComponent("GoLokol Suggestion");
    const body = encodeURIComponent(suggestion);
    window.location.href = `mailto:backstage@golokol.app?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSuggestion("");
      setIsSubmitting(false);
      toast.success("Opening your email client...");
    }, 500);
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
                <div className="py-4" />
              </AccordionItem>

              {/* Section 2: How do we serve Artists? */}
              <AccordionItem
                id="serve-artists"
                title="How do we serve Artists?"
                isOpen={openSections.has("serve-artists")}
                onToggle={() => toggleSection("serve-artists")}
              >
                <div className="py-4" />
              </AccordionItem>

              {/* Section 3: How do we serve small business? */}
              <AccordionItem
                id="serve-small-business"
                title="How do we serve small business?"
                isOpen={openSections.has("serve-small-business")}
                onToggle={() => toggleSection("serve-small-business")}
              >
                <div className="py-4" />
              </AccordionItem>

              {/* Section 4: What Are Lokol Listening Stations? */}
              <AccordionItem
                id="what-are-lls"
                title="What Are Lokol Listening Stations?"
                isOpen={openSections.has("what-are-lls")}
                onToggle={() => toggleSection("what-are-lls")}
              >
                <div className="py-4" />
              </AccordionItem>

              {/* Section 5: How do we serve Local Music Fans? */}
              <AccordionItem
                id="serve-fans"
                title="How do we serve Local Music Fans?"
                isOpen={openSections.has("serve-fans")}
                onToggle={() => toggleSection("serve-fans")}
              >
                <div className="py-4" />
              </AccordionItem>

              {/* Section 5: Suggestion Box */}
              <AccordionItem
                id="suggestion-box"
                title="Suggestion Box"
                isOpen={openSections.has("suggestion-box")}
                onToggle={() => toggleSection("suggestion-box")}
              >
                <Paragraph>
                  GoLokol is a work in progress.
                </Paragraph>
                <Paragraph>
                  If you have ideas, critiques, or things that didn't make sense — we want to hear it.
                </Paragraph>
                <div className="mt-6 space-y-4">
                  <Textarea
                    placeholder="Share your thoughts, ideas, or feedback..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    className="min-h-[120px] bg-[#282828] border-primary text-white placeholder:text-gray-400"
                  />
                  <Button 
                    onClick={handleSuggestionSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Sending..." : "Submit Suggestion"}
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
