import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const LLSRelease = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link 
            to="/shows" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <h1 className="font-display text-2xl md:text-3xl text-foreground mb-8">
            Photo & Video Release — Lokol Listening Sessions
          </h1>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <div className="space-y-1">
              <p><strong className="text-foreground">Event:</strong> Lokol Listening Sessions</p>
              <p><strong className="text-foreground">Date:</strong> March 15, 2026</p>
              <p><strong className="text-foreground">Location:</strong> The Handlebar</p>
              <p><strong className="text-foreground">Produced by:</strong> GoLokol ("GoLokol," "we," "us")</p>
            </div>

            <p>
              By attending Lokol Listening Sessions and/or claiming an LLS pass, I acknowledge and agree that GoLokol and its authorized representatives may photograph, film, or record me during the event.
            </p>

            <p>
              I grant GoLokol the right to use my name, image, likeness, voice, and/or appearance captured at the event in any photos, videos, audio recordings, or other media ("Content") for GoLokol's event-related and promotional purposes, including use on GoLokol's website, social media channels, press materials, advertisements, recaps, and future marketing content.
            </p>

            <div>
              <p className="mb-3">I understand that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>I will not receive compensation for the use of this Content.</li>
                <li>GoLokol may edit, copy, publish, distribute, and otherwise use the Content in any format or medium, now known or later developed.</li>
                <li>This permission is voluntary, and I release GoLokol from any claims related to the use of the Content, including claims for rights of publicity, invasion of privacy, or misrepresentation.</li>
              </ul>
            </div>

            <p>
              If I do not wish to be filmed or photographed, I understand it is my responsibility to notify event staff upon arrival.
            </p>

            <p>
              <strong className="text-foreground">Questions:</strong> Please contact GoLokol at{" "}
              <a 
                href="mailto:backstage@golokol.app" 
                className="text-primary hover:underline"
              >
                backstage@golokol.app
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSRelease;
