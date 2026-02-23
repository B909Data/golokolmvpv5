import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";

const LLSMusicRelease = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/submit-song"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>

          <h1 className="font-display text-2xl md:text-3xl text-foreground mb-2">
            LOKOL LISTENING SESSIONS
          </h1>
          <h2 className="font-display text-xl md:text-2xl text-foreground mb-8">
            BLANKET ARTIST MUSIC RELEASE AGREEMENT
          </h2>

          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              This Music Release Agreement ("Agreement") is entered into by and between Golokol LLC, a Georgia limited liability company ("Company"), and the undersigned submitting artist ("Artist").
            </p>

            <p>
              This Agreement applies to all music submitted by Artist through the Lokol Listening Sessions music submission form, including but not limited to the specific artist name and song title(s) provided in that submission.
            </p>

            <p>
              By submitting music and participating in Lokol Listening Sessions, Artist agrees to the following:
            </p>

            <div>
              <h3 className="text-foreground font-semibold mb-3">1. Grant of Rights</h3>
              <p className="mb-3">
                Artist hereby grants to Company a non-exclusive, worldwide, perpetual, royalty-free license to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Play and publicly perform the submitted music during Lokol Listening Sessions events</li>
                <li>Record, film, and capture such music in audio and audiovisual formats</li>
                <li>Edit, reproduce, distribute, stream, publicly display, and otherwise exploit such recordings in connection with Lokol Listening Sessions content</li>
                <li>Use such recordings in promotional materials, social media, digital platforms, websites, compilations, and related marketing efforts</li>
              </ul>
              <p className="mt-3">
                This grant includes rights in both the master recording and the underlying musical composition to the extent controlled by Artist.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">2. No Compensation</h3>
              <p className="mb-3">Artist acknowledges and agrees that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>No publishing royalties</li>
                <li>No mechanical royalties</li>
                <li>No synchronization fees</li>
                <li>No performance royalties</li>
                <li>No future licensing fees</li>
              </ul>
              <p className="mt-3">
                shall be owed by Company for the uses authorized under this Agreement.
              </p>
              <p className="mt-2">
                Participation in Lokol Listening Sessions is voluntary and promotional in nature.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">3. Ownership and Authority</h3>
              <p className="mb-3">Artist represents and warrants that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Artist owns or controls all necessary rights in the submitted music</li>
                <li>All necessary permissions have been obtained from co-writers, producers, or other rights holders</li>
                <li>The submitted music does not infringe upon any third-party rights</li>
              </ul>
              <p className="mt-3">
                Artist agrees to indemnify and hold Company harmless from any claims arising from breach of these representations.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">4. Scope of Use</h3>
              <p className="mb-3">This Agreement applies solely to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Lokol Listening Sessions live events</li>
                <li>Filmed and recorded Lokol Listening Sessions content</li>
                <li>Related promotional and marketing use connected to the Lokol Listening Sessions brand</li>
              </ul>
              <p className="mt-3">
                This Agreement does not transfer ownership of the music to Company.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">5. Release</h3>
              <p>
                Artist releases and discharges Company from any and all claims, demands, or liabilities arising out of the permitted use of the submitted music as described herein.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">6. Binding Effect</h3>
              <p>
                By submitting music through the Lokol Listening Sessions submission form and agreeing to these terms, Artist acknowledges that this Agreement is legally binding.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-semibold mb-3">7. Governing Law</h3>
              <p>
                This Agreement shall be governed by the laws of the State of Georgia.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSMusicRelease;
