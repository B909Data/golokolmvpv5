import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CheckBullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-3 h-3 text-[#0E0E0E]" strokeWidth={3} />
    </span>
    <span className="font-normal">{children}</span>
  </li>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[#0E0E0E] leading-relaxed mb-4">{children}</p>
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
        isOpen ? "max-h-[3000px] opacity-100 pb-6" : "max-h-0 opacity-0"
      )}
    >
      {children}
    </div>
  </div>
);

const SECTIONS = [
  { id: "after-parties-what-is-it", title: "After Parties? What is it?" },
  { id: "how-artists-use", title: "How Artists Use After Parties?" },
  { id: "what-can-you-offer", title: "What Can You Offer at After Parties?" },
  { id: "how-to-set-up-livestream", title: "How to set up a livestream?" },
  { id: "how-fans-use", title: "How Fans Use After Parties?" },
  { id: "what-after-parties-arent", title: "What After Parties Aren't?" },
  { id: "lls-what-is-it", title: "LLS? What is it" },
  { id: "what-fans-expect-lls", title: "What fans can expect at LLS" },
  { id: "what-artists-expect-lls", title: "What artists can expect at LLS" },
  { id: "why-we-built-golokol", title: "WHY WE BUILT GOLOKOL" },
];

const HowToGoLokol = () => {
  // Desktop: first section open by default; Mobile: all closed
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return new Set([SECTIONS[0].id]);
    }
    return new Set();
  });

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {/* Page Header */}
            <header className="mb-10">
              <h1 className="font-display text-4xl md:text-5xl font-black text-[#0E0E0E] mb-6">HOW TO GOLOKOL</h1>
              <p className="text-lg md:text-xl text-[#555555] leading-relaxed">
                GoLokol is in Baby Beta mode folks. Please share your thoughts, issues and suggestions to help us better help our emerging artist community. Email us at backstage@golokol.app
              </p>
            </header>

            {/* Section Header */}
            <div className="mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-[#0E0E0E] mb-2">GOLOKOL AFTER PARTIES (FAQ)</h2>
              <p className="text-lg text-[#555555]">A better way to take fans home after the show.</p>
            </div>

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
              {/* After Parties? What is it? */}
              <AccordionItem
                id="after-parties-what-is-it"
                title="After Parties? What is it?"
                isOpen={openSections.has("after-parties-what-is-it")}
                onToggle={() => toggleSection("after-parties-what-is-it")}
              >
                <Paragraph>
                  After Parties are temporary, event-only group chats that open after a show and disappear 24-hours later.
                </Paragraph>
                <ul className="space-y-2 text-[#0E0E0E] mb-4">
                  <li>• They're not public feeds.</li>
                  <li>• They're not permanent communities.</li>
                  <li>• They're only for those who were there.</li>
                </ul>
              </AccordionItem>

              {/* How Artists Use After Parties? */}
              <AccordionItem
                id="how-artists-use"
                title="How Artists Use After Parties?"
                isOpen={openSections.has("how-artists-use")}
                onToggle={() => toggleSection("how-artists-use")}
              >
                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mb-3">For artists: How After Parties work?</h4>
                <Paragraph>
                  After setting up and paying for an after party (only $11.99), as needed. No subscriptions. You'll receive:
                </Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>A promo link. Promote your show and After party at the same time.</CheckBullet>
                  <CheckBullet>A link to Artist Control. Use it to manage your After Party.</CheckBullet>
                  <CheckBullet>People RSVP and get verified at the show. Meet them at the merchtable.</CheckBullet>
                  <CheckBullet>Invite new fans from the stage to your after party. You can hook them up too.</CheckBullet>
                  <CheckBullet>The party starts when the first fan walks in.</CheckBullet>
                  <CheckBullet>It ends 24-hours after that.</CheckBullet>
                </ul>
                <Paragraph>
                  We make it easy and fun to cultivate a true fanbase one show at a time.
                </Paragraph>
              </AccordionItem>

              {/* What Can You Offer at After Parties? */}
              <AccordionItem
                id="what-can-you-offer"
                title="What Can You Offer at After Parties?"
                isOpen={openSections.has("what-can-you-offer")}
                onToggle={() => toggleSection("what-can-you-offer")}
              >
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Write a pinned message to fans at the parties Welcome page</CheckBullet>
                  <CheckBullet>Set up a YouTube Livestream with fans</CheckBullet>
                  <CheckBullet>Chat with fans</CheckBullet>
                </ul>
                
                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mt-6 mb-3">Coming Soon</h4>
                <Paragraph>
                  sell merch, share show photos, opt-ins for future show notifications and more
                </Paragraph>
                <Paragraph>
                  You're an artist. Use your imagination, your music. That's what matters when you Golokol.
                </Paragraph>
              </AccordionItem>

              {/* How to set up a livestream? */}
              <AccordionItem
                id="how-to-set-up-livestream"
                title="How to set up a livestream?"
                isOpen={openSections.has("how-to-set-up-livestream")}
                onToggle={() => toggleSection("how-to-set-up-livestream")}
              >
                <Paragraph>
                  We are only YouTube Live compatible at the time. To go live on YouTube, you must first enable and verify your channel (might take 24 hours), then use the YouTube app (tap '+', then 'Go Live') or YouTube Studio on a computer (click 'Create' &gt; 'Go live') to set up your stream with a title, description, and privacy settings, and finally start broadcasting, using the provided stream key for advanced setups or just hitting the "Go Live" button for simpler streams. Your unique live stream link appears in the Live Control Room once you schedule or start your stream, allowing you to share it with your audience.
                </Paragraph>

                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mt-6 mb-3">How to go live using your desktop?</h4>
                <a href="https://youtu.be/Rdta45g_hg8?si=iWDAKoAvAUAzp7Gr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mb-4">
                  https://youtu.be/Rdta45g_hg8?si=iWDAKoAvAUAzp7Gr
                </a>

                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mt-6 mb-3">How to go live using your Phone?</h4>
                <a href="https://youtu.be/Rdta45g_hg8?si=BcfC4T6z9JHujnZu" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block mb-4">
                  https://youtu.be/Rdta45g_hg8?si=BcfC4T6z9JHujnZu
                </a>

                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mt-6 mb-3">REMEMBER:</h4>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Uncheck Live Chat (Chat happens on GoLokol)</CheckBullet>
                  <CheckBullet>Make Private or unlisted and share links with GoLokol. You can share when creating After Party or on your Artist Control page</CheckBullet>
                </ul>
              </AccordionItem>

              {/* How Fans Use After Parties? */}
              <AccordionItem
                id="how-fans-use"
                title="How Fans Use After Parties?"
                isOpen={openSections.has("how-fans-use")}
                onToggle={() => toggleSection("how-fans-use")}
              >
                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mb-3">For fans: How After Parties Work?</h4>
                <ol className="list-decimal list-outside ml-6 space-y-3 text-[#0E0E0E] mb-6">
                  <li className="pl-2">You RSVP to an after party. Receive a QR Code. Save it.</li>
                  <li className="pl-2">Show up and check in with the artist at the merch table or in the crowd</li>
                  <li className="pl-2">Once your code is scanned by the artist you get access to the After Party</li>
                  <li className="pl-2">If you forgot to RSVP, ask the artist at the show to walk-you-in.</li>
                  <li className="pl-2">Every show and after party you attend you receive a badge to collect and share.</li>
                </ol>
                <Paragraph>
                  Get to know the artists and other fans who were there. This is where fans become a community.
                </Paragraph>
              </AccordionItem>

              {/* What After Parties Aren't? */}
              <AccordionItem
                id="what-after-parties-arent"
                title="What After Parties Aren't?"
                isOpen={openSections.has("what-after-parties-arent")}
                onToggle={() => toggleSection("what-after-parties-arent")}
              >
                <Paragraph>There are no feeds to maintain.</Paragraph>
                <Paragraph>No pressure to be other than who you are.</Paragraph>
                <Paragraph>After Parties are not social media.</Paragraph>
              </AccordionItem>

              {/* LLS? What is it */}
              <AccordionItem
                id="lls-what-is-it"
                title="LLS? What is it"
                isOpen={openSections.has("lls-what-is-it")}
                onToggle={() => toggleSection("lls-what-is-it")}
              >
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold text-[#0E0E0E] mb-2">GOLOKOL LOKOL LISTENING SESSIONS (FAQ)</h3>
                </div>
                <Paragraph>
                  Lokol Listening Sessions are live, curated listening events that spotlight local music inside real spaces and community gatherings.
                </Paragraph>
                <Paragraph>Think:</Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>A DJ or host playing local artists alongside familiar records</CheckBullet>
                  <CheckBullet>A real crowd, in a real room</CheckBullet>
                  <CheckBullet>Recorded and edited for an ongoing YouTube Series</CheckBullet>
                  <CheckBullet>A new way for artists to promote their music and music fans to support their local sounds.</CheckBullet>
                </ul>
              </AccordionItem>

              {/* What fans can expect at LLS */}
              <AccordionItem
                id="what-fans-expect-lls"
                title="What fans can expect at LLS"
                isOpen={openSections.has("what-fans-expect-lls")}
                onToggle={() => toggleSection("what-fans-expect-lls")}
              >
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Dress to represent your scene and city</CheckBullet>
                  <CheckBullet>Come to dance, turn up and engage with the DJ set and crowd</CheckBullet>
                  <CheckBullet>Advance tix $15, At Door $20. Free tickets are available through featured artists.</CheckBullet>
                  <CheckBullet>If you're on your phone you won't be on camera.</CheckBullet>
                </ul>
              </AccordionItem>

              {/* What artists can expect at LLS */}
              <AccordionItem
                id="what-artists-expect-lls"
                title="What artists can expect at LLS"
                isOpen={openSections.has("what-artists-expect-lls")}
                onToggle={() => toggleSection("what-artists-expect-lls")}
              >
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Real listener feedback, not vanity metrics</CheckBullet>
                  <CheckBullet>Songs selected by local curatorial partners.</CheckBullet>
                  <CheckBullet>If selected for the live taping, your music placed intentionally, not randomly</CheckBullet>
                  <CheckBullet>The full taping shared freely via YouTube</CheckBullet>
                  <CheckBullet>A new way to engage with your fanbase (we give you free tix to give away how you feel)</CheckBullet>
                </ul>
                <Paragraph>
                  LLS is not pay-to-play. It's about alignment, timing, and community fit.
                </Paragraph>
              </AccordionItem>

              {/* WHY WE BUILT GOLOKOL */}
              <AccordionItem
                id="why-we-built-golokol"
                title="WHY WE BUILT GOLOKOL"
                isOpen={openSections.has("why-we-built-golokol")}
                onToggle={() => toggleSection("why-we-built-golokol")}
              >
                <Paragraph>
                  Local music scenes don't grow from attention. They grow from relationships, repetition, and shared experiences.
                </Paragraph>
                <Paragraph>GoLokol exists to:</Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Help artists build real local momentum without burnout.</CheckBullet>
                  <CheckBullet>Help fans find music and community.</CheckBullet>
                  <CheckBullet>Protect moments from becoming content mills.</CheckBullet>
                </ul>
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