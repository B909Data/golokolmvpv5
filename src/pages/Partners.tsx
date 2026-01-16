import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
              Curators? Extend the night for your crowd.
            </h1>
            <p className="text-[hsl(0,0%,20%)] text-xl md:text-2xl font-sans mb-4 max-w-3xl">
              GoLokol After Parties give your artists a private, time-limited space to connect with fans who showed up to your event.
            </p>
            <p className="text-[hsl(0,0%,50%)] text-sm font-sans">
              Easy execution. No ongoing management.
            </p>
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
            <h2 className="font-display text-2xl md:text-3xl text-[hsl(0,0%,10%)] mb-6">
              Why This Matters for Curators and Venues
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-6 max-w-2xl">
              When a show ends, momentum usually disappears.<br />
              GoLokol After Parties keep it alive — without adding work.
            </p>
            <ul className="space-y-3 text-[hsl(0,0%,30%)] font-sans mb-8">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>Artists leave with real fan connections, not just applause</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>Fans feel recognized for showing up</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>Your nights become more memorable and repeatable</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>You support artists without changing how you book or promote</span>
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
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-2xl md:text-3xl text-[hsl(0,0%,10%)] mb-2">
              How GoLokol After Parties Work
            </h2>
            <p className="text-[hsl(0,0%,50%)] text-sm font-sans mb-8">
              Simple by design.
            </p>
            <ol className="space-y-6 text-[hsl(0,0%,30%)] font-sans mb-8">
              <li className="flex items-start gap-4">
                <span className="font-display text-2xl text-[hsl(0,0%,10%)]">1.</span>
                <span className="text-lg pt-1">An artist sets up an After Party. It takes under a minute.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-display text-2xl text-[hsl(0,0%,10%)]">2.</span>
                <span className="text-lg pt-1">Fans who attended the show join after it ends.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="font-display text-2xl text-[hsl(0,0%,10%)]">3.</span>
                <span className="text-lg pt-1">The space closes automatically after 24 hours.</span>
              </li>
            </ol>
            <div className="space-y-1 text-[hsl(0,0%,50%)] text-sm font-sans">
              <p>No moderation required.</p>
              <p>No long-term chats.</p>
              <p>No extra tools to manage.</p>
            </div>
          </div>
        </section>

        {/* How Partners Use GoLokol Section */}
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-2xl md:text-3xl text-[hsl(0,0%,10%)] mb-6">
              How Partners Use GoLokol
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-6 max-w-2xl">
              As a curator or venue, you can choose to offer After Party credits to artists you book.
            </p>
            <ul className="space-y-3 text-[hsl(0,0%,30%)] font-sans mb-8">
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>You decide when to offer them</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>You control how many you give each month</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>Artists activate them on their own</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[hsl(50,100%,40%)] mt-1">—</span>
                <span>Credited After Parties are "Brought to you by…(your curatorial brand)"</span>
              </li>
            </ul>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans italic mb-8">
              Think of it as hosting the after-show moment — not managing it.
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

        {/* Artists Stay in Control Section */}
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-2xl md:text-3xl text-[hsl(0,0%,10%)] mb-6">
              Artists Stay in Control
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-4 max-w-2xl">
              Artists can create future After Parties on their own for any show, anywhere.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans max-w-2xl">
              Partner credits simply introduce the experience.
            </p>
          </div>
        </section>

        {/* Built for Real Scenes Section */}
        <section className="container mx-auto px-4 max-w-4xl mb-20">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <h2 className="font-display text-2xl md:text-3xl text-[hsl(0,0%,10%)] mb-6">
              Built for Real Scenes
            </h2>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-4 max-w-2xl">
              GoLokol is designed for independent venues, curated shows, and artists building community — not chasing algorithms.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-8">
              It works best where culture already exists.
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

        {/* Closing Section */}
        <section className="container mx-auto px-4 max-w-4xl">
          <div className="border-t border-[hsl(50,100%,50%)] pt-12">
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-8 max-w-2xl">
              We keep partnerships simple and limited by design.
            </p>
            <p className="text-[hsl(0,0%,30%)] text-lg font-sans mb-6">
              If you are a curator or venue interested in offering After Party credits to your artists:
            </p>
            <div className="space-y-3 text-[hsl(0,0%,30%)] font-sans mb-8">
              <p>
                <a 
                  href="https://golokol.app" 
                  className="underline hover:text-[hsl(0,0%,10%)] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit golokol.app
                </a>
                {" "}to learn more.
              </p>
              <p>
                DM us{" "}
                <a 
                  href="https://instagram.com/golokolmusic" 
                  className="underline hover:text-[hsl(0,0%,10%)] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @golokolmusic
                </a>
                {" "}on Instagram.
              </p>
              <p>
                Email{" "}
                <a 
                  href="mailto:hw@golokol.app" 
                  className="underline hover:text-[hsl(0,0%,10%)] transition-colors"
                >
                  hw@golokol.app
                </a>
              </p>
            </div>
            <p className="text-[hsl(0,0%,50%)] text-sm font-sans">
              No long-term commitments. No required promotion. No pressure.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partners;
