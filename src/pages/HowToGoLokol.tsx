import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

const CheckBullet = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3">
    <span className="flex-shrink-0 mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
      <Check className="w-3 h-3 text-[#0E0E0E]" strokeWidth={3} />
    </span>
    <span className="font-normal">{children}</span>
  </li>
);

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-display text-3xl md:text-4xl font-extrabold text-[#0E0E0E] mt-16 mb-6">{children}</h2>
);

const SubHeader = ({ children }: { children: React.ReactNode }) => (
  <h3 className="font-display text-xl md:text-2xl font-bold text-[#0E0E0E] mt-10 mb-4">{children}</h3>
);

const SubSubHeader = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-display text-lg md:text-xl font-bold text-[#0E0E0E] mt-8 mb-3">{children}</h4>
);

const Paragraph = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[#0E0E0E] leading-relaxed mb-4">{children}</p>
);

const HowToGoLokol = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            {/* Page Header */}
            <header className="mb-12">
              <h1 className="font-display text-4xl md:text-5xl font-black text-[#0E0E0E] mb-6">How GoLokol Works</h1>
              <p className="text-xl md:text-2xl text-[#555555] leading-relaxed font-medium">
                Good music lives here, and it lives in real rooms with real people.
              </p>
            </header>

            {/* Intro */}
            <div className="mb-12">
              <Paragraph>
                GoLokol is built around live shows and local scenes.
                <br />
                Not algorithms. Not endless content. Not follower counts.
              </Paragraph>
              <Paragraph>Here's what to expect After Parties and Lokol Listening Sessions.</Paragraph>
            </div>

            {/* After Parties Section */}
            <SectionHeader>After Parties (What happens after the show)</SectionHeader>

            <SubHeader>What an After Party is</SubHeader>
            <Paragraph>After Parties are temporary, event-only group chats that open after a show.</Paragraph>
            <Paragraph>
              They're not public feeds.
              <br />
              They're not permanent communities.
              <br />
              They're not another place to perform.
            </Paragraph>
            <Paragraph>They're a shared room for the people who were actually there.</Paragraph>

            {/* For Fans */}
            <SubHeader>For fans: How After Parties work</SubHeader>
            <ol className="list-decimal list-outside ml-6 space-y-3 text-[#0E0E0E] mb-6">
              <li className="pl-2">
                You RSVP to an after party. Receive a text with a QR Code and link to buy a ticket.
              </li>
              <li className="pl-2">Show up and check in with the artist at the merch table or in the crowd</li>
              <li className="pl-2">Once your code is scanned by the artist you get access to the After Party</li>
            </ol>

            <SubSubHeader>Inside the After Party:</SubSubHeader>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>Chat with the artist</CheckBullet>
              <CheckBullet>Conversation with other fans who were there</CheckBullet>
              <CheckBullet>Exclusive drops, livestream links, or whatever the artist imagines</CheckBullet>
            </ul>

            <Paragraph>After Parties last 3 days from the show date.</Paragraph>
            <Paragraph>
              If you weren't there, you don't experience it.
              <br />
              That's the point.
            </Paragraph>

            {/* For Artists */}
            <SubHeader>For artists: How After Parties work?</SubHeader>
            <Paragraph>After setting up and paying for an after party (only $14.99). You'll receive:</Paragraph>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>
                A promo link to your RSVP page to share with your fans on socials, website or flyers.
              </CheckBullet>
              <CheckBullet>Create an experience for those who show up.</CheckBullet>
              <CheckBullet>Connections that last until the next show</CheckBullet>
              <CheckBullet>Your data. No overwhelm.</CheckBullet>
            </ul>

            {/* Poster Placeholder */}
            <div className="my-10 flex justify-center">
              <div className="w-full max-w-md aspect-[3/4] bg-[#F0F0F0] border-2 border-dashed border-[#CCCCCC] rounded-lg flex items-center justify-center">
                <span className="text-[#888888] text-sm">[insert poster sample]</span>
              </div>
            </div>

            <Paragraph>The day of the show you're sent a link. When you check in, the After Party begins.</Paragraph>
            <Paragraph>We suggest you post a quick welcome greeting to fans who will show up later.</Paragraph>
            <ol className="list-decimal list-outside ml-6 space-y-3 text-[#0E0E0E] mb-6">
              <li className="pl-2">Invite more people to the after party from the stage.</li>
              <li className="pl-2">
                Tell your fans who RSVP to meet you at the merch table to get access to your after party
              </li>
              <li className="pl-2">Scan their QR Code to give them access.</li>
            </ol>

            <Paragraph>After Parties are:</Paragraph>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>Optional</CheckBullet>
              <CheckBullet>Lightweight</CheckBullet>
              <CheckBullet>Short-lived</CheckBullet>
            </ul>

            <Paragraph>
              They're not meant to be managed forever.
              <br />
              They're meant to extend the energy of the night and get new fans to become community.
            </Paragraph>

            {/* Important Things to Know */}
            <SectionHeader>A few important things to know</SectionHeader>

            <SubHeader>After Parties are not social media</SubHeader>
            <Paragraph>
              There are no feeds to maintain.
              <br />
              No posting schedules.
              <br />
              No pressure to perform online.
            </Paragraph>
            <Paragraph>GoLokol is about:</Paragraph>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>Being present</CheckBullet>
              <CheckBullet>Showing up</CheckBullet>
              <CheckBullet>Letting moments exist, then end</CheckBullet>
            </ul>

            <SubHeader>WhatsApp is required for After Parties</SubHeader>
            <Paragraph>After Parties happen on WhatsApp.</Paragraph>
            <Paragraph>You don't need WhatsApp to:</Paragraph>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>RSVP</CheckBullet>
              <CheckBullet>Attend a show</CheckBullet>
              <CheckBullet>Support artists</CheckBullet>
            </ul>
            <Paragraph>You only need it if you want to participate in the After Party chat.</Paragraph>

            {/* LLS Section */}
            <SectionHeader>Lokol Listening Sessions (LLS)</SectionHeader>

            <SubHeader>What it is</SubHeader>
            <Paragraph>
              Lokol Listening Sessions are live, curated listening events that spotlight local music inside real spaces
              and community gatherings.
            </Paragraph>
            <Paragraph>Think:</Paragraph>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>A DJ or host playing local artists alongside familiar records</CheckBullet>
              <CheckBullet>A real crowd, in a real room</CheckBullet>
              <CheckBullet>Recorded and edited for an ongoing Youtube Series</CheckBullet>
              <CheckBullet>
                A new way for artists to promote their music and music fans to support their local sounds.
              </CheckBullet>
            </ul>

            <SubHeader>What fans can expect at LLS</SubHeader>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>Dress to represent your scene and city</CheckBullet>
              <CheckBullet>Come to dance, turn up and engage with the DJ set and crowd</CheckBullet>
              <CheckBullet>
                Advance tix $10, At Door $20. Free tickets are available through featured artists.
              </CheckBullet>
              <CheckBullet>If you're on your phone you won't be on camera. This is a live feed.</CheckBullet>
            </ul>

            <SubHeader>What artists can expect at LLS</SubHeader>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>Real listener feedback, not vanity metrics</CheckBullet>
              <CheckBullet>Songs selected by fan and curator ratings.</CheckBullet>
              <CheckBullet>If selected for the live taping, your music placed intentionally, not randomly</CheckBullet>
              <CheckBullet>
                The full taping shared via Youtube, Your song's promo clip short with reactions $10
              </CheckBullet>
              <CheckBullet>
                A new way to engage with your fanbase (we give you free tix to give away how you feel)
              </CheckBullet>
            </ul>

            <Paragraph>
              LLS is not pay-to-play.
              <br />
              It's about alignment, timing, and community fit.
            </Paragraph>

            {/* Why Section */}
            <SectionHeader>Why we built it this way</SectionHeader>
            <Paragraph>
              Local music scenes don't grow from attention.
              <br />
              They grow from relationships, repetition, and shared experiences.
            </Paragraph>
            <Paragraph>GoLokol exists to:</Paragraph>
            <ul className="space-y-3 text-[#0E0E0E] mb-6">
              <CheckBullet>Help artists build real local momentum without burnout.</CheckBullet>
              <CheckBullet>Help fans find music and community.</CheckBullet>
              <CheckBullet>Protect moments from becoming content mills</CheckBullet>
            </ul>

            <p className="text-xl md:text-2xl text-[#555555] leading-relaxed font-medium mt-12 mb-8">
              Good music lives here — if you're willing to show up.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowToGoLokol;
