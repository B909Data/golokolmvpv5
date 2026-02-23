import { Link } from "react-router-dom";
import { ArrowRight, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { extractYouTubeId } from "@/lib/youtube";

const Songs = () => {

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />

      {/* Hero Section - moved from landing page */}
      <section className="py-16 pt-32">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="font-display text-3xl md:text-5xl text-[hsl(0,0%,10%)] mb-3">LOKOL LISTENING SESSIONS</h2>
            <p className="text-[hsl(0,0%,30%)] text-lg">
              A dj event and YouTube series brought to you by GoLokol, featuring the emerging sounds of a city.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-2 items-start">
            {/* Left column - Description + CTA */}
            <div className="space-y-4">
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed">
                Music discovery the right way. At a party and on YouTube screens at the same time. Local fans and
                artists turn up when their song comes on.
              </p>
              <p className="text-[hsl(0,0%,10%)] text-lg leading-relaxed font-medium">All featured artists receive:</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(0,0%,10%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[hsl(0,0%,10%)] text-base leading-relaxed">A way to promote your music in a party setting with crowd reaction.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(0,0%,10%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[hsl(0,0%,10%)] text-base leading-relaxed">A free After Party to promote and connect with the fans who show up and turn up for the camera.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[hsl(0,0%,10%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-[hsl(0,0%,10%)] text-base leading-relaxed">A YouTube collaboration link so the session shows up on your channel.</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex flex-col">
                  <Link to="/submit-song">
                    <Button variant="secondary" size="lg">
                      Submit a Song
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-[hsl(0,0%,40%)] text-sm mt-2">$5 each submission</p>
                </div>
              </div>
            </div>

            {/* Right column - YouTube Video */}
            <div className="aspect-video w-full rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId("https://youtu.be/2exJWgcJRlA")}`}
              title="Lokol Listening Sessions"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl text-[hsl(0,0%,10%)] mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-[hsl(0,0%,10%)]" />
            Rules
          </h2>
          <ul className="space-y-3 text-[hsl(0,0%,30%)]">
            <li className="flex items-start gap-3">
              <span className="text-[hsl(0,0%,10%)] font-bold">1.</span>
              <span>You must be an independent artist (no major label affiliation).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[hsl(0,0%,10%)] font-bold">2.</span>
              <span>Your submitted song must be original work.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[hsl(0,0%,10%)] font-bold">3.</span>
              <span>You must be able to be present for the filming of Lokol Listening Sessions in your city.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[hsl(0,0%,10%)] font-bold">4.</span>
              <span>Submission fee is non-refundable. Selection is at our discretion.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[hsl(0,0%,10%)] font-bold">5.</span>
              <span>Be respectful to staff, other artists, and the audience.</span>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Songs;
