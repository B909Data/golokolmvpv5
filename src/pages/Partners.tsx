import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import partnersHero from "@/assets/partners-hero.jpg";
import partnersSection2 from "@/assets/partners-section2.jpg";
import partnersSection3 from "@/assets/partners-section3.jpg";
import partnersSection4 from "@/assets/partners-section4.jpg";

const Partners = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Hero Section */}
        <section className="w-full mb-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-[hsl(0,0%,10%)] mb-6 leading-tight">
              Curators, Venues, Labels
            </h1>
            <p className="text-[hsl(0,0%,20%)] text-2xl md:text-3xl font-sans mb-6 max-w-3xl leading-relaxed">
              Extend the night. Strengthen your brand. Unlock new revenue.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-8 max-w-3xl leading-relaxed">
              GoLokol After Parties give artists a private, time-limited space to connect with fans who actually showed up.
            </p>
            <div className="space-y-2 text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-10">
              <p>Real revenue.</p>
              <p>Clear fan signal.</p>
              <p>No ongoing management.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="default" 
                size="lg"
                className="bg-[hsl(0,0%,10%)] text-white hover:bg-[hsl(0,0%,20%)] text-lg px-8"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn How It Works
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-[hsl(0,0%,10%)] text-[hsl(0,0%,10%)] hover:bg-[hsl(0,0%,10%)] hover:text-white text-lg px-8"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
              </Button>
            </div>
          </div>
          <div className="w-full mt-12 h-64 md:h-80 lg:h-96 overflow-hidden">
            <img 
              src={partnersHero} 
              alt="Small venue crowd in a post-show moment" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Why This Matters Section */}
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,10%)] mb-8">
              Why This Matters for Artists and Their Teams
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-4 max-w-3xl leading-relaxed">
              When a show ends, most artists make their final money at the merch table.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-8 max-w-3xl leading-relaxed">
              GoLokol After Parties create a way to monetize the after-show glow while deepening fan connection.
            </p>
            <ul className="space-y-4 text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-10">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>Artists gauge momentum and value through After Party interest</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>Fans feel recognized for showing up in real life</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>Culture forms around post-show experiences, not social feeds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>Artists and their teams earn additional revenue</span>
              </li>
            </ul>
            <div className="h-48 md:h-64 overflow-hidden rounded-sm">
              <img 
                src={partnersSection2} 
                alt="Artist talking to fans after a show" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,10%)] mb-3">
              How GoLokol After Parties Work
            </h2>
            <p className="text-[hsl(0,0%,50%)] text-lg font-sans mb-10">
              Simple by design.
            </p>
            <ol className="space-y-8 text-[hsl(0,0%,30%)] font-sans mb-10">
              <li className="flex items-start gap-4">
                <span className="font-display text-3xl text-[hsl(0,0%,10%)]">1.</span>
                <span className="text-lg md:text-xl pt-1 leading-relaxed">
                  An artist or partner sets up an After Party in under two minutes. Set the price and level of engagement.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-display text-3xl text-[hsl(0,0%,10%)]">2.</span>
                <span className="text-lg md:text-xl pt-1 leading-relaxed">
                  Fans purchase an After Party pass but must attend the show to gain access.
                </span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-display text-3xl text-[hsl(0,0%,10%)]">3.</span>
                <span className="text-lg md:text-xl pt-1 leading-relaxed">
                  The After Party closes automatically 24 hours after the first fan enters.
                </span>
              </li>
            </ol>
            <div className="space-y-2 text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-4">
              <p>Artists are not required to stay active for the full 24 hours.</p>
              <p>No long-term chats.</p>
              <p>No ongoing moderation.</p>
            </div>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans">
              Just time and attention, curated by the artist.
            </p>
          </div>
        </section>

        {/* How Partners Use GoLokol Section */}
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,10%)] mb-8">
              How Partners Use GoLokol
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-8 max-w-3xl leading-relaxed">
              Curators, agencies, and venues can choose to offer After Party credits to artists they book.
            </p>
            <ul className="space-y-4 text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-10">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>You decide who receives credits and when</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>Revenue split: 90 percent artist or label, 10 percent GoLokol</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>Credited After Parties include a "Brought to you by [Partner Name]" signature</span>
              </li>
            </ul>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans italic mb-10">
              Think of it as hosting the after-show moment, not managing it.
            </p>
            <div className="h-48 md:h-64 overflow-hidden rounded-sm">
              <img 
                src={partnersSection3} 
                alt="Backstage conversation moment" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Built for Real Scenes Section */}
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,10%)] mb-8">
              Built for Real Scenes
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-4 max-w-3xl leading-relaxed">
              GoLokol is designed for independent venues, curated shows, and artists building community, not chasing algorithms.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-4 max-w-3xl leading-relaxed">
              It works best where culture already exists.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-10 max-w-3xl leading-relaxed">
              We keep partnerships simple and intentionally limited.
            </p>
            <div className="h-48 md:h-64 overflow-hidden rounded-sm">
              <img 
                src={partnersSection4} 
                alt="Intimate local venue with live music" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="container mx-auto px-4 max-w-4xl">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-3xl md:text-4xl text-[hsl(0,0%,10%)] mb-8">
              Interested in Partnering?
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-8 max-w-3xl leading-relaxed">
              If you are a curator, venue, or organization interested in offering After Party credits to artists you book:
            </p>
            <ul className="space-y-4 text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans mb-10">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>
                  Visit{" "}
                  <a 
                    href="https://golokol.app" 
                    className="underline hover:text-[hsl(0,0%,10%)] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    golokol.app
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>
                  DM{" "}
                  <a 
                    href="https://instagram.com/golokolmusic" 
                    className="underline hover:text-[hsl(0,0%,10%)] transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @golokolmusic
                  </a>
                  {" "}on Instagram
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1 text-xl">•</span>
                <span>
                  Email{" "}
                  <a 
                    href="mailto:hw@golokol.app" 
                    className="underline hover:text-[hsl(0,0%,10%)] transition-colors"
                  >
                    hw@golokol.app
                  </a>
                </span>
              </li>
            </ul>
            <div className="space-y-2 text-[hsl(0,0%,30%)] text-lg md:text-xl font-sans">
              <p>No overhead.</p>
              <p>Litmus test.</p>
              <p>Real value.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partners;
