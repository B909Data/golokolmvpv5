import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LLSUsArtistAgreement = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <section className="px-6 md:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-foreground">LOKOL LISTENING SESSIONS – ARTIST SUBMISSION &amp; FEATURED PLACEMENT AGREEMENT</h1>

          <p className="text-foreground-secondary">
            This Agreement is entered into between:
          </p>
          <p className="text-foreground"><strong>GoLokol, Inc.</strong> ("GoLokol")<br />and<br /><strong>[Artist Name]</strong> ("Artist")</p>
          <p className="text-foreground"><strong>Effective Date:</strong> [Date]</p>

          <h2 className="text-foreground">1. WHAT IS LOKOL LISTENING SESSIONS?</h2>
          <p className="text-foreground-secondary">Lokol Listening Sessions (LLS) is a music discovery and artist promotion platform, not a streaming service. Here's how it works:</p>
          <ul className="text-foreground-secondary">
            <li>GoLokol curates local Atlanta artists and features their music on interactive kiosks placed in independent record stores and retail locations.</li>
            <li>Fans scan a QR code, listen to featured music, and vote on their favorites.</li>
            <li>Featured artists receive a one-month free trial of GoLokol Connect (our artist discovery and fan engagement app) and gain three-month featured placement in the kiosks.</li>
          </ul>
          <p className="text-foreground-secondary">This agreement covers Artist's submission, featured placement, and the terms under which their music is used.</p>

          <h2 className="text-foreground">2. ARTIST RIGHTS &amp; MUSIC OWNERSHIP</h2>
          <p className="text-foreground-secondary">By submitting music to GoLokol, Artist warrants and confirms:</p>
          <ul className="text-foreground-secondary">
            <li>Artist owns or controls the master recording (or has explicit permission from the record label/distributor to submit).</li>
            <li>Artist owns or controls the composition (songwriting rights), or has permission from the publisher.</li>
            <li>Artist takes full responsibility if a third party (label, publisher, copyright holder) claims Artist did not have the right to submit this music. GoLokol is not liable for rights disputes.</li>
            <li>Artist grants GoLokol the right to feature this music on the LLS discovery platform for the duration of the featured placement period.</li>
          </ul>

          <h2 className="text-foreground">3. SUBMISSION REQUIREMENTS</h2>
          <p className="text-foreground-secondary">To be considered for LLS featured placement, Artist must meet these criteria:</p>
          <h3 className="text-foreground">Geographic &amp; Professional Standards:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist (or at least one band leader) must be based in Atlanta and consider Atlanta their home base for performance.</li>
            <li>Music must be professionally mixed and mastered.</li>
          </ul>
          <h3 className="text-foreground">Content Standards — The Tiana Rule:</h3>
          <ul className="text-foreground-secondary">
            <li>GoLokol will not feature music that demeans women, glorifies violence, or promotes gang activity or drug dealing as a primary theme.</li>
            <li>This rule honors Tiana Robinson and reflects GoLokol's commitment to supporting music that strengthens, rather than harms, our community.</li>
            <li>GoLokol reserves the right to reject submissions that violate these standards. Rejection decisions are final and non-negotiable.</li>
          </ul>
          <p className="text-foreground-secondary">If rejected: Artist will receive an email with bulleted reasons for rejection. Artist may submit a new song once for free. After that first free resubmission, all future submissions are $5 per submission.</p>

          <h2 className="text-foreground">4. SUBMISSION FREQUENCY &amp; FEES</h2>
          <h3 className="text-foreground">Featured Placement Submissions (Discovery Kiosk):</h3>
          <ul className="text-foreground-secondary">
            <li>Artist may submit one song per three-month season for consideration as a featured artist on the LLS kiosks.</li>
            <li>First submission: Free</li>
            <li>Second and subsequent submissions within the same three-month period: $5 per submission</li>
          </ul>
          <h3 className="text-foreground">Monthly Connection Updates (GoLokol Connect followers):</h3>
          <ul className="text-foreground-secondary">
            <li>Once Artist converts to a paid GoLokol Connect subscription, they may send one new song link (Spotify, Bandcamp, Apple Music, etc.) per month to their followers.</li>
            <li>These are links only—not audio uploads. Artist is directing followers to listen on licensed streaming platforms.</li>
            <li>No fee for Connection updates.</li>
          </ul>

          <h2 className="text-foreground">5. HOW YOUR MUSIC IS USED</h2>
          <h3 className="text-foreground">In-Store Kiosk Playback:</h3>
          <ul className="text-foreground-secondary">
            <li>GoLokol features Artist's music on interactive kiosks in independent record stores and retail locations in Atlanta (and beyond, as GoLokol expands).</li>
            <li>Each fan user gets three free plays of the song before the kiosk redirects them to stream on external platforms (Spotify, Bandcamp, Apple Music, etc.).</li>
            <li>This is a limited preview model, not a full streaming experience. Artist's music drives discovery; fans complete listening on licensed streaming services where Artist earns royalties through their distributor.</li>
          </ul>
          <h3 className="text-foreground">Featured Placement Duration:</h3>
          <ul className="text-foreground-secondary">
            <li>If selected, Artist's song is featured on LLS kiosks for one three-month season, then removed.</li>
            <li>Artist can resubmit a new song for the next season.</li>
          </ul>
          <h3 className="text-foreground">Artist Can Request Removal:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist may request removal of their song from LLS kiosks at any time via their account dashboard (a self-service feature).</li>
            <li>GoLokol will honor removal requests within 5 business days.</li>
          </ul>

          <h2 className="text-foreground">6. DATA &amp; PUBLIC VISIBILITY</h2>
          <h3 className="text-foreground">Voting Data &amp; Engagement:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist will see real-time voting data and engagement metrics in their GoLokol account dashboard (votes, genres, store locations, repeat listeners, etc.).</li>
            <li>GoLokol owns all voting and engagement data. Artist may use this data publicly (e.g., "My song got 500 votes at Crate ATL") for promotion purposes.</li>
            <li>GoLokol retains all voting and engagement data even after the three-month featured placement ends. This data informs GoLokol's platform insights and community trends.</li>
          </ul>
          <h3 className="text-foreground">Public Display:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist's name, music, and voting results will be displayed publicly on LLS kiosks and in GoLokol's promotional content (Instagram, YouTube, case studies, etc.).</li>
            <li>Artist grants GoLokol the right to feature Artist's name and music in promotional materials without additional compensation.</li>
          </ul>

          <h2 className="text-foreground">7. GOLOKOL CONNECT TRIAL &amp; CONVERSION</h2>
          <h3 className="text-foreground">One-Month Free Trial:</h3>
          <ul className="text-foreground-secondary">
            <li>Upon selection for LLS featured placement, Artist receives a full one-month free trial of GoLokol Connect (all features, no restrictions).</li>
            <li>Artist can use this trial to test the platform and connect with followers.</li>
          </ul>
          <h3 className="text-foreground">After Trial Ends:</h3>
          <ul className="text-foreground-secondary">
            <li>If Artist does not convert to a paid subscription, their account becomes frozen after 30 days.</li>
            <li>Frozen account status means:
              <ul>
                <li>Artist can still log in and view historical data (past voting charts, engagement metrics).</li>
                <li>Artist cannot see new votes or updated metrics after the freeze date.</li>
                <li>Artist cannot message or connect with followers.</li>
                <li>Artist cannot access new platform features.</li>
              </ul>
            </li>
            <li>To reactivate, Artist must subscribe to GoLokol Connect ($9.99/month or current pricing).</li>
          </ul>

          <h2 className="text-foreground">8. COMPENSATION</h2>
          <h3 className="text-foreground">What Artist Receives:</h3>
          <ul className="text-foreground-secondary">
            <li>One-month free trial of GoLokol Connect (full access, all features).</li>
            <li>Three-month featured placement on LLS kiosks in partner record stores and retail locations.</li>
            <li>Voting data and engagement metrics visible in their account and available for public promotion.</li>
            <li>Exposure to local music fans and potential new followers.</li>
          </ul>
          <h3 className="text-foreground">What Artist Does NOT Receive:</h3>
          <ul className="text-foreground-secondary">
            <li>No cash payment or royalties for featured placement.</li>
            <li>No payment per vote or per play.</li>
            <li>No share of sponsorship revenue from kiosk sponsors.</li>
            <li>This is not a streaming or royalty-bearing service.</li>
          </ul>

          <h2 className="text-foreground">9. GOKOLOL'S RESPONSIBILITIES</h2>
          <p className="text-foreground-secondary">GoLokol will:</p>
          <ul className="text-foreground-secondary">
            <li>Feature Artist's music on LLS kiosks in partner retail locations for three months (if selected).</li>
            <li>Provide real-time voting and engagement data in Artist's account dashboard.</li>
            <li>Handle all technical playback and platform management.</li>
            <li>Direct fans to licensed streaming services for full listening.</li>
            <li>Promote featured artists on GoLokol's social media and promotional channels.</li>
          </ul>
          <p className="text-foreground-secondary">GoLokol is not responsible for:</p>
          <ul className="text-foreground-secondary">
            <li>Artist's performance or engagement metrics (votes depend on fan interest).</li>
            <li>Guaranteed foot traffic or store visibility.</li>
            <li>Artist's success on GoLokol Connect or elsewhere.</li>
          </ul>

          <h2 className="text-foreground">10. CONTENT MODERATION &amp; REMOVAL</h2>
          <p className="text-foreground-secondary">GoLokol reserves the right to remove Artist's song from LLS kiosks at any time if:</p>
          <ul className="text-foreground-secondary">
            <li>Content is found to violate the Tiana Rule (demeaning women, glorifying violence, promoting gang activity or drug dealing).</li>
            <li>Content is offensive, defamatory, or conflicts with community values.</li>
            <li>Artist's submission was made without proper rights or authorization.</li>
            <li>Artist breaches this agreement.</li>
          </ul>
          <p className="text-foreground-secondary">Removal decisions are final and non-negotiable. Artist will be notified via email of the reason for removal.</p>

          <h2 className="text-foreground">11. MUSIC LICENSING &amp; ROYALTIES</h2>
          <p className="text-foreground-secondary font-semibold">Important: This Is Not a Streaming Service.</p>
          <ul className="text-foreground-secondary">
            <li>GoLokol is a discovery and promotion platform, not a streaming service. We do not pay royalties or performance fees to artists.</li>
            <li>Fans complete full listening on licensed streaming platforms (Spotify, Bandcamp, Apple Music, YouTube, etc.) where Artist earns royalties through their distributor.</li>
            <li>GoLokol provides limited-play previews (three plays per user) to drive discovery and direct fans to licensed services.</li>
            <li>GoLokol handles all legal and licensing obligations related to music playback on our platform.</li>
          </ul>

          <h2 className="text-foreground">12. LIABILITY &amp; INDEMNITY</h2>
          <h3 className="text-foreground">Artist's Warranties:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist warrants they own or control all rights to submit this music.</li>
            <li>Artist warrants the music does not infringe on any third-party copyright, trademark, or other intellectual property rights.</li>
            <li>Artist warrants they have the right to grant these licenses to GoLokol.</li>
          </ul>
          <h3 className="text-foreground">Artist Indemnification:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist indemnifies and holds harmless GoLokol from any third-party claims (from labels, publishers, copyright holders, or others) that Artist did not have the right to submit this music or grant these licenses.</li>
            <li>If a third party claims ownership or rights to Artist's submission, Artist is solely responsible for resolving the dispute and any associated costs.</li>
          </ul>
          <h3 className="text-foreground">GoLokol Liability:</h3>
          <ul className="text-foreground-secondary">
            <li>GoLokol is not liable for Artist's success, engagement metrics, or failure to convert to paid subscriptions.</li>
            <li>GoLokol is not liable for technical failures, platform downtime, or loss of voting data.</li>
          </ul>

          <h2 className="text-foreground">13. TERMINATION &amp; REMOVAL</h2>
          <h3 className="text-foreground">Automatic Removal:</h3>
          <ul className="text-foreground-secondary">
            <li>Artist's song is automatically removed from LLS kiosks after three months of featured placement.</li>
            <li>Artist may request early removal at any time via their account dashboard.</li>
          </ul>
          <h3 className="text-foreground">For Cause Removal:</h3>
          <ul className="text-foreground-secondary">
            <li>GoLokol may remove Artist's song immediately for breach of this agreement, rights violations, or content violations.</li>
          </ul>
          <h3 className="text-foreground">Account Deactivation:</h3>
          <ul className="text-foreground-secondary">
            <li>If Artist fails to convert to a paid GoLokol Connect subscription after the free trial, their account becomes frozen (see Section 7).</li>
            <li>Frozen accounts can be reactivated by purchasing a subscription.</li>
          </ul>

          <h2 className="text-foreground">14. CHANGES TO GOLOKOL</h2>
          <p className="text-foreground-secondary">GoLokol may update its platform, features, curation standards, or submission requirements at any time. Artist acknowledges that technology and platform policies evolve, and GoLokol may implement changes without prior notice.</p>

          <h2 className="text-foreground">15. NO EXCLUSIVITY</h2>
          <p className="text-foreground-secondary">This agreement grants no exclusive rights. Artist is free to submit to other platforms, streaming services, and discovery platforms simultaneously. Artist may be featured on competing platforms without restriction.</p>

          <h2 className="text-foreground">16. ENTIRE AGREEMENT</h2>
          <p className="text-foreground-secondary">This agreement constitutes the entire understanding between Artist and GoLokol regarding submission and featured placement on Lokol Listening Sessions. Any modifications must be in writing and signed by both parties.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LLSUsArtistAgreement;
