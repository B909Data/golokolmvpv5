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
  { id: "what-are-after-parties", title: "What Are After Parties?" },
  { id: "throw-great-after-party", title: "How Do I Throw a Great After Party?" },
  { id: "set-up-livestream", title: "How Do I Set Up a Livestream?" },
  { id: "what-are-lls", title: "What Are Lokol Listening Sessions?" },
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
              {/* Section 1: What Are After Parties? */}
              <AccordionItem
                id="what-are-after-parties"
                title="What Are After Parties?"
                isOpen={openSections.has("what-are-after-parties")}
                onToggle={() => toggleSection("what-are-after-parties")}
              >
                <Paragraph>
                  After Parties are private, event-only group chats that open after a live show and disappear 24 hours later.
                </Paragraph>
                <Paragraph>
                  Only fans who show up in real life can join.<br />
                  No public feeds. No algorithms. Just real connection.
                </Paragraph>
                <Paragraph>
                  Fans are notified by SMS when the artist enters the room.
                </Paragraph>
                <YouTubeEmbed videoId="rAsCj9e7FZo" />
              </AccordionItem>

              {/* Section 2: How Do I Throw a Great After Party? */}
              <AccordionItem
                id="throw-great-after-party"
                title="How Do I Throw a Great After Party?"
                isOpen={openSections.has("throw-great-after-party")}
                onToggle={() => toggleSection("throw-great-after-party")}
              >
                <Paragraph>
                  An After Party works best when it's treated as part of the show — not something separate.
                </Paragraph>
                <Paragraph>
                  It's another reason to come out, stay longer, and connect.
                </Paragraph>

                {/* Subsection: Artist Control Room */}
                <div className="mt-6 mb-8">
                  <h3 className="font-display text-lg font-bold text-[#0E0E0E] mb-2">
                    How to Promote and Manage Your After Party with the Artist Control Room
                  </h3>
                  <Paragraph className="text-[#555555]">
                    This video walks through how to use your Artist Control Room to promote, manage, and host your After Party — all in one place.
                  </Paragraph>
                  <YouTubeEmbed videoId="4b9rf2KQt0E" />
                </div>

                {/* Subsection: How to Promote */}
                <div className="mb-8">
                  <h3 className="font-display text-lg font-bold text-[#0E0E0E] mb-2">
                    How to Promote Your After Party Before and During the Show
                  </h3>
                  <YouTubeEmbed videoId="6Q7AZCHm8OE" />
                </div>

                {/* Steps */}
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Share your After Party link in your bio, Stories, texts, and website.</CheckBullet>
                  <CheckBullet>Talk about the After Party from the stage — more than once.</CheckBullet>
                  <CheckBullet>(Optional) Go live with fans after the show.</CheckBullet>
                  <CheckBullet>Write a pinned message fans see when they first enter.</CheckBullet>
                  <CheckBullet>Add merch or music links while the energy is still fresh.</CheckBullet>
                </ul>

                <Paragraph className="mt-6 italic text-[#555555]">
                  You're an artist. Use your imagination, your voice, your music.<br />
                  That's what GoLokol is built for.
                </Paragraph>
              </AccordionItem>

              {/* Section 3: How Do I Set Up a Livestream? */}
              <AccordionItem
                id="set-up-livestream"
                title="How Do I Set Up a Livestream?"
                isOpen={openSections.has("set-up-livestream")}
                onToggle={() => toggleSection("set-up-livestream")}
              >
                <Paragraph>
                  GoLokol currently supports YouTube Live for After Parties.
                </Paragraph>
                <Paragraph>
                  You don't need to be live the whole time — even a few minutes goes a long way.
                </Paragraph>

                {/* Subsection: Desktop */}
                <div className="mt-6 mb-8">
                  <h3 className="font-display text-lg font-bold text-[#0E0E0E] mb-2">
                    Going Live from Your Desktop
                  </h3>
                  <YouTubeEmbed videoId="Rdta45g_hg8" startTime={161} />
                </div>

                {/* Subsection: Phone */}
                <div className="mb-8">
                  <h3 className="font-display text-lg font-bold text-[#0E0E0E] mb-2">
                    Going Live from Your Phone
                  </h3>
                  <YouTubeEmbed videoId="Rdta45g_hg8" startTime={594} />
                </div>

                {/* Reminders */}
                <h4 className="font-display text-base font-bold text-[#0E0E0E] mb-3">Reminders</h4>
                <ul className="space-y-3 text-[#0E0E0E]">
                  <CheckBullet>Turn off YouTube Live Chat</CheckBullet>
                  <CheckBullet>Set the stream to Unlisted (not Public or Private)</CheckBullet>
                  <CheckBullet>Paste the livestream link into your Artist Control Room</CheckBullet>
                  <CheckBullet>(Optional) Add a thumbnail — this is what fans see before you go live</CheckBullet>
                </ul>
              </AccordionItem>

              {/* Section 4: What Are Lokol Listening Sessions? */}
              <AccordionItem
                id="what-are-lls"
                title="What Are Lokol Listening Sessions?"
                isOpen={openSections.has("what-are-lls")}
                onToggle={() => toggleSection("what-are-lls")}
              >
                <Paragraph>
                  Lokol Listening Sessions are live, curated listening events that spotlight local music in real spaces.
                </Paragraph>
                <Paragraph>Think:</Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>A DJ or host playing local artists alongside familiar records</CheckBullet>
                  <CheckBullet>A real crowd, in a real room</CheckBullet>
                  <CheckBullet>Recorded and edited into an ongoing YouTube series</CheckBullet>
                </ul>
                <Paragraph>
                  It's a new way for artists to share music — and for fans to support their local scene.
                </Paragraph>
                <YouTubeEmbed videoId="2exJWgcJRlA" />
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
