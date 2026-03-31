import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="prose prose-lg max-w-none">
            <h1 className="font-display text-4xl md:text-5xl text-[hsl(0,0%,10%)] mb-2">
              GoLokol Privacy Policy
            </h1>
            <p className="text-[hsl(0,0%,40%)] text-lg mb-8">Effective Date: 01/13/2026</p>

            <div className="text-[hsl(0,0%,30%)] font-sans space-y-8">
              <p>GoLokol respects your privacy.</p>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">1. Information We Collect</h2>
                <p>We may collect:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Email addresses (optional, for notifications)</li>
                  <li>Event participation data</li>
                  <li>Chat messages (temporarily)</li>
                  <li>Technical data (device, browser, basic analytics)</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">2. How We Use Information</h2>
                <p>We use information to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Operate After Parties</li>
                  <li>Notify users (if opted in)</li>
                  <li>Improve the Platform</li>
                  <li>Maintain safety and integrity</li>
                </ul>
                <p className="mt-4">We do not sell user data.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">3. Emails & Notifications</h2>
                <p>Email opt-ins are optional and can be managed by the user.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">4. Data Retention</h2>
                <ul className="list-disc pl-6 space-y-1">
                  <li>After Parties are temporary</li>
                  <li>Chats and content may be deleted after closure</li>
                  <li>We do not guarantee long-term storage</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">5. Third-Party Services</h2>
                <p>We may use third-party services (analytics, video embeds). Their privacy practices are governed by their own policies.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">6. Security</h2>
                <p>We take reasonable steps to protect data but cannot guarantee absolute security.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">7. Contact</h2>
                <p>📧 backstage@golokol.app</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">8. LLS Media & Event Data</h2>
                <p>For Lokol Listening Stations, GoLokol may collect and process:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Event attendance data</li>
                  <li>Recorded audio/video footage</li>
                  <li>User likeness and participation metadata</li>
                </ul>
                <p className="mt-4">This data is used solely for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Producing the Lokol Listening Stations series</li>
                  <li>Promotion of GoLokol and participating artists</li>
                  <li>Internal analytics</li>
                </ul>
                <p className="mt-4">We do not sell personal data.</p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
