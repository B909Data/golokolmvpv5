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
        isOpen ? "max-h-[2000px] opacity-100 pb-6" : "max-h-0 opacity-0"
      )}
    >
      {children}
    </div>
  </div>
);

const SECTIONS = [
  { id: "join-after-party", title: "For Fans: How do I join an After Party?" },
  { id: "get-checked-in", title: "For Fans: How do I get checked in?" },
  { id: "create-after-party", title: "For Artists: How do I create an After Party?" },
  { id: "check-in-fans", title: "For Artists: How do I check in fans?" },
  { id: "what-is-badge", title: "What is a badge?" },
  { id: "troubleshooting", title: "Troubleshooting / FAQs" },
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
              <h1 className="font-display text-4xl md:text-5xl font-black text-[#0E0E0E] mb-6">How GoLokol Works</h1>
              <p className="text-xl md:text-2xl text-[#555555] leading-relaxed font-medium">
                A better way to take fans home after the show.
              </p>
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
                    {section.title.replace("For Fans: ", "").replace("For Artists: ", "")}
                  </button>
                ))}
              </div>
            </nav>

            {/* Accordion Sections */}
            <div className="border-t border-[#CCCCCC]">
              {/* Section 1: For Fans - Join After Party */}
              <AccordionItem
                id="join-after-party"
                title="For Fans: How do I join an After Party?"
                isOpen={openSections.has("join-after-party")}
                onToggle={() => toggleSection("join-after-party")}
              >
                <Paragraph>
                  After Parties are temporary, event-only group chats that open after a show and close in 24 hours.
                </Paragraph>
                <Paragraph>
                  They're not public feeds.
                  <br />
                  They're not permanent communities.
                  <br />
                  They're only for those who were there.
                </Paragraph>
                <ol className="list-decimal list-outside ml-6 space-y-3 text-[#0E0E0E] mb-6">
                  <li className="pl-2">
                    RSVP to an After Party. Save your digital pass.
                  </li>
                  <li className="pl-2">Show up and check in with the artist at the merch table or in the crowd.</li>
                  <li className="pl-2">Once your code is scanned by the artist you get access to the After Party.</li>
                </ol>
                <h4 className="font-display text-lg md:text-xl font-bold text-[#0E0E0E] mt-8 mb-3">Inside the After Party:</h4>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Show afterglow with the artist</CheckBullet>
                  <CheckBullet>Conversation with other fans who were there</CheckBullet>
                  <CheckBullet>Exclusive drops, livestream links, or whatever the band imagines</CheckBullet>
                </ul>
              </AccordionItem>

              {/* Section 2: For Fans - Get Checked In */}
              <AccordionItem
                id="get-checked-in"
                title="For Fans: How do I get checked in?"
                isOpen={openSections.has("get-checked-in")}
                onToggle={() => toggleSection("get-checked-in")}
              >
                <ol className="list-decimal list-outside ml-6 space-y-3 text-[#0E0E0E] mb-6">
                  <li className="pl-2">After RSVPing, save your digital pass to your phone.</li>
                  <li className="pl-2">Show this to the band at the merch table to get checked in.</li>
                  <li className="pl-2">The artist scans your QR code and you're in.</li>
                </ol>
                <Paragraph>
                  Your digital pass is your key. Keep it handy at the show.
                </Paragraph>
              </AccordionItem>

              {/* Section 3: For Artists - Create After Party */}
              <AccordionItem
                id="create-after-party"
                title="For Artists: How do I create an After Party?"
                isOpen={openSections.has("create-after-party")}
                onToggle={() => toggleSection("create-after-party")}
              >
                <Paragraph>
                  After setting up and paying for an After Party ($49 one-time fee. No Subscription), you'll receive:
                </Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>
                    A promo link to your RSVP page to share with your fans on your socials, website, or flyer.
                  </CheckBullet>
                  <CheckBullet>
                    Authentic and automated ways to notify and incentivize their return to the next show.
                  </CheckBullet>
                </ul>

                {/* Poster Placeholder */}
                <div className="my-10 flex justify-center">
                  <div className="w-full max-w-md aspect-[3/4] bg-[#F0F0F0] border-2 border-dashed border-[#CCCCCC] rounded-lg flex items-center justify-center">
                    <span className="text-[#888888] text-sm">[insert poster sample]</span>
                  </div>
                </div>

                <h4 className="font-display text-lg md:text-xl font-bold text-[#0E0E0E] mt-8 mb-3">For your fans and new fans</h4>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Invite new fans from the stage to your after party. You can hook them up too.</CheckBullet>
                  <CheckBullet>
                    Tell your fans who RSVP to meet you at the merch table to get access to your After Party.
                  </CheckBullet>
                  <CheckBullet>Scan their QR Code to give them access.</CheckBullet>
                  <CheckBullet>
                    The day of the show you're sent a link. When you check in, the After Party begins.
                  </CheckBullet>
                </ul>
              </AccordionItem>

              {/* Section 4: For Artists - Check In Fans */}
              <AccordionItem
                id="check-in-fans"
                title="For Artists: How do I check in fans?"
                isOpen={openSections.has("check-in-fans")}
                onToggle={() => toggleSection("check-in-fans")}
              >
                <Paragraph>
                  You have two ways to check fans in:
                </Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>
                    <strong>QR Scan:</strong> Use your Artist Portal to scan their digital pass QR code.
                  </CheckBullet>
                  <CheckBullet>
                    <strong>Walk-In:</strong> Add fans manually by name if they don't have a pass.
                  </CheckBullet>
                </ul>
                <Paragraph>
                  Walk-ins get a QR code on screen that takes them straight into the room. No texting required.
                </Paragraph>
              </AccordionItem>

              {/* Section 5: What is a Badge? */}
              <AccordionItem
                id="what-is-badge"
                title="What is a badge?"
                isOpen={openSections.has("what-is-badge")}
                onToggle={() => toggleSection("what-is-badge")}
              >
                <Paragraph>
                  Badges are visual rewards for fans who attend After Parties. They appear in the After Party room and can be downloaded and shared.
                </Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Each badge features the event flyer and the GoLokol badge frame.</CheckBullet>
                  <CheckBullet>Collect badges from different shows to build your fan history.</CheckBullet>
                </ul>
              </AccordionItem>

              {/* Section 6: Troubleshooting / FAQs */}
              <AccordionItem
                id="troubleshooting"
                title="Troubleshooting / FAQs"
                isOpen={openSections.has("troubleshooting")}
                onToggle={() => toggleSection("troubleshooting")}
              >
                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mb-3">A few important things to know</h4>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>There are no feeds to maintain.</CheckBullet>
                  <CheckBullet>No pressure to be other than who you want to be to your fans.</CheckBullet>
                  <CheckBullet>After Parties are not social media.</CheckBullet>
                  <CheckBullet>After Parties appear, happen, and disappear right on GoLokol.</CheckBullet>
                  <CheckBullet>After Parties close in 24 hours.</CheckBullet>
                </ul>

                <h4 className="font-display text-lg font-bold text-[#0E0E0E] mt-8 mb-3">Why we built it this way</h4>
                <Paragraph>
                  Local music scenes don't grow from attention.
                  <br />
                  They grow from relationships, repetition, and shared experiences.
                </Paragraph>
                <Paragraph>GoLokol exists to:</Paragraph>
                <ul className="space-y-3 text-[#0E0E0E] mb-6">
                  <CheckBullet>Help artists build real local momentum without burnout.</CheckBullet>
                  <CheckBullet>Help fans find music and community.</CheckBullet>
                  <CheckBullet>Protect moments from becoming content mills.</CheckBullet>
                </ul>

                <p className="text-xl md:text-2xl text-[#555555] leading-relaxed font-medium mt-12 mb-8">
                  Good music lives here — if you're willing to show up.
                </p>
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
