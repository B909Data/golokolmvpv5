import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(60,10%,95%)]">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <article className="prose prose-lg max-w-none">
            <h1 className="font-display text-4xl md:text-5xl text-[hsl(0,0%,10%)] mb-2">
              GoLokol Terms of Service
            </h1>
            <p className="text-[hsl(0,0%,40%)] text-lg mb-8">Effective Date: 01/13/2026</p>

            <div className="text-[hsl(0,0%,30%)] font-sans space-y-8">
              <p>
                Welcome to GoLokol. These Terms of Service ("Terms") govern your access to and use of the GoLokol platform, including the website, applications, and any features or services offered (collectively, the "Platform").
              </p>
              <p>
                By accessing or using GoLokol, you agree to be bound by these Terms. If you do not agree, do not use the Platform.
              </p>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">1. What GoLokol Is (and Is Not)</h2>
                <p>GoLokol is a technology platform that enables artists to create temporary, post-show digital spaces ("After Parties") for fans.</p>
                <p className="mt-4">GoLokol:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Does not organize, host, promote, or manage live events</li>
                  <li>Does not control or moderate conversations in real time</li>
                  <li>Does not verify or endorse user-generated content</li>
                  <li>Is not a venue, promoter, manager, or agent</li>
                </ul>
                <p className="mt-4">Artists, fans, curators, and venues interact on GoLokol at their own discretion.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">2. Eligibility</h2>
                <p>You must be at least 13 years old to use GoLokol. If you are under 18, you represent that you have permission from a parent or guardian.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">3. User Accounts & Access</h2>
                <p>Some features require you to create or access an After Party via a link, pass, or control room.</p>
                <p className="mt-4">You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Keeping access links secure</li>
                  <li>All activity that occurs through your access</li>
                  <li>Ensuring your participation complies with these Terms</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">4. After Parties & Temporary Nature</h2>
                <p>All After Parties are temporary and typically last 24 hours from opening.</p>
                <p className="mt-4">You acknowledge and agree that:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Chats, messages, and content are not permanent</li>
                  <li>GoLokol is not responsible for saving or restoring content</li>
                  <li>Access may end automatically when the After Party closes</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">5. User-Generated Content</h2>
                <p>All messages, livestreams, images, links, and interactions are user-generated content.</p>
                <p className="mt-4">You are solely responsible for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>What you post</li>
                  <li>How you interact</li>
                  <li>The consequences of your behavior</li>
                </ul>
                <p className="mt-4">GoLokol does not endorse, verify, or take responsibility for user content.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">6. Prohibited Conduct</h2>
                <p>You agree not to use GoLokol to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Engage in illegal activity</li>
                  <li>Harass, threaten, or abuse others</li>
                  <li>Share hate speech, explicit violence, or exploitation</li>
                  <li>Coordinate illegal acts</li>
                  <li>Impersonate others or misrepresent identity</li>
                  <li>Share private or personal information without consent</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">7. Moderation & Enforcement</h2>
                <p>GoLokol reserves the right to:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Pause, restrict, or archive any After Party</li>
                  <li>Remove access without notice</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">8. Artists' Responsibilities</h2>
                <p>Artists who create After Parties agree that they are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Inviting fans</li>
                  <li>Managing their community</li>
                  <li>Their content, livestreams, and communication</li>
                  <li>How they promote GoLokol links</li>
                </ul>
                <p className="mt-4">GoLokol is not responsible for fan behavior or artist-fan interactions.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">9. Third-Party Services</h2>
                <p>GoLokol may embed or link to third-party services (e.g., YouTube).</p>
                <p className="mt-4">GoLokol is not responsible for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Availability or uptime</li>
                  <li>Content moderation on third-party platforms</li>
                  <li>Third-party terms or policies</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">10. Limitation of Liability</h2>
                <p>To the maximum extent permitted by law:</p>
                <p className="mt-4">GoLokol LLC is not liable for:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>User conduct</li>
                  <li>Content posted by users</li>
                  <li>Loss of data or content</li>
                  <li>Events or interactions occurring offline or online</li>
                </ul>
                <p className="mt-4">Total liability is limited to the amount paid to GoLokol, if any.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">11. Indemnification</h2>
                <p>You agree to indemnify and hold harmless GoLokol LLC, its owners, contractors, and affiliates from claims arising from:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Your use of the Platform</li>
                  <li>Your content</li>
                  <li>Your violation of these Terms</li>
                </ul>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">12. Governing Law</h2>
                <p>These Terms are governed by the laws of the State of Georgia, USA, without regard to conflict of law principles.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">13. Changes</h2>
                <p>GoLokol may update these Terms from time to time. Continued use constitutes acceptance of changes.</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">14. Contact</h2>
                <p>Questions?</p>
                <p className="mt-2">📧 backstage@golokol.app</p>
              </section>

              <section>
                <h2 className="font-display text-2xl text-[hsl(0,0%,10%)] mt-8 mb-4">15. Lokol Listening Stations (LLS)</h2>
                <p>Lokol Listening Stations ("LLS") are curated music experiences that may include live events, ticket sales, music submissions, and recorded content.</p>
                <p className="mt-4">By submitting music to or purchasing tickets for an LLS event, you agree to the following:</p>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">15.1 Music Submissions</h3>
                <p>Artists who submit music to Lokol Listening Stations acknowledge that:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Submission fees are non-refundable</li>
                  <li>Submission does not guarantee selection</li>
                  <li>Selection is based on curator and DJ discretion</li>
                  <li>GoLokol does not guarantee promotion, exposure, or outcomes</li>
                  <li>Submitted content must comply with these Terms and Community Guidelines</li>
                </ul>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">15.2 Ticket Purchases (Fans & Attendees)</h3>
                <p>All ticket purchases for Lokol Listening Stations are final.</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>No refunds or exchanges</li>
                  <li>Ticket issues must be directed to: backstage@golokol.app</li>
                </ul>
                <p className="mt-4">GoLokol is a technology and media platform and is not responsible for venue operations, safety, or event conditions.</p>
                <p className="mt-2">Venues hosting Lokol Listening Stations are independently owned and insured.</p>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">15.3 Assumption of Risk & Liability</h3>
                <p>By attending an LLS event, you acknowledge that live music events carry inherent risks.</p>
                <p className="mt-4">You agree that:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>GoLokol LLC is not liable for injury, loss, or damages occurring at a venue</li>
                  <li>Responsibility for physical safety rests with the venue and the attendee</li>
                </ul>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">15.4 Likeness & Media Release (IMPORTANT)</h3>
                <p className="font-semibold">BY PURCHASING A TICKET OR ATTENDING A LOKOL LISTENING SESSION, YOU GRANT GOLOKOL LLC PERMISSION TO CAPTURE, RECORD, AND USE YOUR LIKENESS, IMAGE, AND VOICE.</p>
                <p className="mt-4">This includes use in:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Lokol Listening Stations YouTube Series</li>
                  <li>GoLokol social platforms</li>
                  <li>Promotional and marketing materials</li>
                </ul>
                <p className="mt-4">This permission is granted without compensation and is irrevocable.</p>
              </section>

              <section className="border-t border-[hsl(0,0%,80%)] pt-8 mt-12">
                <h2 className="font-display text-3xl text-[hsl(0,0%,10%)] mb-6">GoLokol Community Guidelines</h2>
                <p>GoLokol exists to support real music communities. These guidelines apply to all users.</p>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">Be Respectful</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No harassment, hate speech, or threats</li>
                  <li>No discrimination or targeting</li>
                </ul>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">Be Lawful</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No illegal activity or coordination</li>
                  <li>No exploitation or abuse</li>
                </ul>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">Be Real</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>No impersonation</li>
                  <li>No misleading behavior</li>
                </ul>

                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-6 mb-3">Respect the Space</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>After Parties are temporary</li>
                  <li>What happens here should feel safe and intentional</li>
                </ul>

                <p className="mt-6">GoLokol may pause or close spaces that violate these guidelines.</p>
              </section>

              <section>
                <h3 className="font-display text-xl text-[hsl(0,0%,10%)] mt-8 mb-3">LLS Conduct Guidelines</h3>
                <p>During Lokol Listening Stations (live or digital), users must:</p>
                <ul className="list-disc pl-6 space-y-1 mt-2">
                  <li>Respect performers, DJs, staff, and attendees</li>
                  <li>Avoid disruptive or unsafe behavior</li>
                  <li>Follow venue rules and local laws</li>
                  <li>Accept filming and recording as part of the experience</li>
                </ul>
                <p className="mt-4">Violations may result in removal from the event or platform access restrictions.</p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
