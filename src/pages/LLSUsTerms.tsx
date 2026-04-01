import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AGREEMENT_VERSION = "LLS_KIOSK_PLACEMENT_V1";

const buildAgreementText = (storeName: string, contactName: string, city: string) =>
  `LOKOL LISTENING SESSIONS KIOSK PLACEMENT AGREEMENT

This Agreement is entered into between:

GoLokol, Inc. ("GoLokol")
and
${storeName} and ${contactName} ("Store")

Effective Date: [Date of Signature]
Pilot Period: 90 days from installation

1. WHAT IS LOKOL LISTENING SESSIONS?

GoLokol provides a music discovery kiosk featuring local artists from ${city}. Here's how it works:

Customers scan a QR code on a foam board poster placed in your store.
They listen to curated local music and vote on their favorites.
Votes are counted toward seasonal compilations and featured content.
Customers earn Points with each vote, which they can redeem for discounts at your store.
The kiosk uses geo-location technology—it only works inside your store.
Customers are invited to join GoLokol Connect, our artist discovery app (optional for them).

This is a 90-day pilot. After the pilot ends, GoLokol and Store will meet to review results and decide whether to continue.

2. WHAT GOLOKOL PROVIDES

Foam board poster with QR code (includes GoLokol branding and one rotating sponsor logo)
Full technical setup and troubleshooting — we handle all platform issues
Points tracking system — customers can redeem points via QR code scan at your register
Data insights — we'll share voting trends and customer engagement metrics
One foam board replacement during the 90-day pilot if damaged by normal wear and tear
Optional promotional support — we may create and share promotional content featuring your store (see Section 5)

3. WHAT THE STORE PROVIDES

Store WiFi access (if available) for the kiosk platform
Physical space for the foam board poster in a visible customer area
Notification of technical issues — email or text GoLokol immediately if the QR code is damaged or the kiosk isn't working
Points redemption at checkout — scan customer QR codes to deduct points when they redeem discounts
Data integrity — store staff do not modify, remove, or tamper with the kiosk or QR code
Optional: Create one social media post or in-store signage promoting the voting experience to your customers.

4. POINTS & REDEMPTION

Customers earn points each time they vote on a song.
The Store sets the redemption rate — e.g., 50 points = $5 off, 100 points = $10 off. GoLokol will help design this with you.
Points are tracked in the GoLokol system. Store staff scan the customer's QR code at checkout to redeem.
If this agreement ends before the 90-day pilot completes, Store honors all remaining customer points (no expiration).

5. SPONSORSHIP & CONTENT

Sponsorship:
GoLokol places one sponsor logo on the foam board (local business—café, restaurant, neighborhood partner).
Store receives no sponsorship revenue. All sponsorship fees go to GoLokol.
Sponsors are small, local businesses aligned with your store's community. GoLokol will not partner with alcohol, drug, or political organizations.
Sponsor logos may rotate (GoLokol may update the foam board with new sponsors during the 90-day period).

Promotional Content:
GoLokol may film in-store to create promotional content (photos, video clips) featuring the kiosk and your store.
Store grants GoLokol permission to use this content in promotional materials (social media, website, case studies).
Filming will be unobtrusive and brief—we'll coordinate timing with you.
Store is acknowledged as a GoLokol partner in promotional materials.

6. CUSTOMER DATA

GoLokol owns all customer data collected through the kiosk (names, emails, voting history, music preferences, visit frequency).
Store does not receive customer lists or access to voting data.
After the 90-day pilot ends, Store has the option to purchase customer data from GoLokol. Pricing and terms will be discussed separately if Store is interested.
All customer data is used only for music discovery and platform improvements.

7. TECHNICAL SUPPORT & TROUBLESHOOTING

GoLokol is responsible for all platform issues, QR code functionality, and system troubleshooting.
Store's role: Notify GoLokol immediately by text or email if the kiosk isn't working or the QR code is damaged.
Response time: GoLokol will respond within 24 hours and resolve issues as quickly as possible.
Foam board replacement: GoLokol will replace one damaged foam board (normal wear and tear) during the 90-day pilot at no cost to Store.
Additional damage: If the foam board is damaged again due to negligence or intentional damage, Store will pay $20 per replacement.

8. LIABILITY & RESPONSIBILITY

GoLokol is liable for all technical failures, data loss, or platform malfunctions.
Store is not liable if customers experience issues with voting, points, or the platform.
Store is not liable for customer disputes about points or voting results.
GoLokol indemnifies Store — if a customer claims damages related to the kiosk or voting platform, GoLokol handles the claim and expense.

9. TERMINATION

During the 90-Day Pilot:
Either party may terminate this agreement with 3 days' written notice (email is acceptable).
Store honors all remaining customer points upon termination.
GoLokol removes the foam board and any signage within 5 business days.

After the 90-Day Pilot:
GoLokol and Store will meet to review results and decide on continuation.
If both parties agree to continue, a new agreement will be executed.
If either party declines to continue, this agreement ends.

10. CHANGES & UPDATES

GoLokol may update the kiosk platform, voting mechanics, or features without additional notice.
Store acknowledges that technology evolves and that GoLokol may make improvements to the system.
Material changes (e.g., new customer data collection) will be communicated to Store before implementation.

11. NO EXCLUSIVITY

GoLokol may place Lokol Listening Stations kiosks in other record stores and retail locations in ${city} and beyond.
This agreement does not grant Store any exclusive rights.

12. SIGNATURES

By signing below, both parties agree to the terms of this Lokol Listening Stations Kiosk Placement Agreement.`;

interface LocationState {
  retail_signup_id?: string;
  store_name: string;
  contact_name: string;
  contact_email: string;
  city: string;
}

const LLSUsTerms = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [formData, setFormData] = useState({
    signature_name: "",
    signer_title: "",
  });

  if (!state?.store_name) {
    return <Navigate to="/lls-us/retail" replace />;
  }

  const { store_name, contact_name, contact_email, city, retail_signup_id } = state;
  const agreementText = buildAgreementText(store_name, contact_name, city);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.signature_name) {
      toast.error("Please type your name to sign.");
      return;
    }
    if (!consentChecked) {
      toast.error("You must agree to the terms before signing.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("lls_kiosk_agreement_signatures" as any).insert({
        retail_signup_id: retail_signup_id || null,
        store_name,
        contact_name,
        city,
        email: contact_email,
        signature_name: formData.signature_name.trim(),
        signer_title: formData.signer_title.trim() || null,
        agreement_text: agreementText,
        agreement_version: AGREEMENT_VERSION,
        user_agent: navigator.userAgent,
      } as any);
      if (error) throw error;

      // Mark terms_accepted on the retail signup
      if (retail_signup_id) {
        await supabase
          .from("lls_retail_signups")
          .update({ terms_accepted: true } as any)
          .eq("id", retail_signup_id);
      }

      setSigned(true);
      toast.success("Agreement signed successfully.");
    } catch (err) {
      console.error("Signature error:", err);
      toast.error("Failed to sign agreement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (signed) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="font-display text-2xl md:text-3xl text-black mb-4">
              Agreement Signed Successfully
            </h1>
            <p className="text-black/70 mb-2">
              Thank you, <span className="text-black font-medium">{contact_name}</span>.
            </p>
            <p className="text-black/70 mb-8">
              Your electronic signature for the Lokol Listening Stations Kiosk Placement Agreement has been recorded. We'll be in touch shortly to get your store set up.
            </p>
            <Link to="/lls-us">
              <Button className="bg-black text-yellow-400 hover:bg-black/90">Back to LLS</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 md:px-12 lg:px-20 py-5 flex items-center gap-4">
        <Link to="/lls-us/retail" className="text-black/60 hover:text-black transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <img src={golokolLogo} alt="GoLokol" className="h-8 w-8" />
          <span className="font-display text-xl text-black tracking-wide">GoLokol</span>
        </Link>
      </header>

      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl text-black mb-2">
            LOKOL LISTENING SESSIONS
          </h1>
          <h2 className="font-display text-xl md:text-2xl text-black mb-8">
            KIOSK PLACEMENT AGREEMENT
          </h2>

          {/* Agreement preamble */}
          <div className="space-y-6 text-black/70 leading-relaxed mb-12">
            <p>This Agreement is entered into between:</p>
            <p>
              <strong className="text-black">GoLokol, Inc.</strong> ("GoLokol")<br />
              and<br />
              <strong className="text-black">{store_name}</strong> and <strong className="text-black">{contact_name}</strong> ("Store")
            </p>
            <p>Effective Date: Date of Signature<br />Pilot Period: 90 days from installation</p>

            {/* Section 1 */}
            <div>
              <h3 className="text-black font-semibold mb-3">1. WHAT IS LOKOL LISTENING SESSIONS?</h3>
              <p className="mb-3">GoLokol provides a music discovery kiosk featuring local artists from {city}. Here's how it works:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Customers scan a QR code on a foam board poster placed in your store.</li>
                <li>They listen to curated local music and vote on their favorites.</li>
                <li>Votes are counted toward seasonal compilations and featured content.</li>
                <li>Customers earn Points with each vote, which they can redeem for discounts at your store.</li>
                <li>The kiosk uses geo-location technology—it only works inside your store.</li>
                <li>Customers are invited to join GoLokol Connect, our artist discovery app (optional for them).</li>
              </ul>
              <p className="mt-3">This is a 90-day pilot. After the pilot ends, GoLokol and Store will meet to review results and decide whether to continue.</p>
            </div>

            {/* Section 2 */}
            <div>
              <h3 className="text-black font-semibold mb-3">2. WHAT GOLOKOL PROVIDES</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Foam board poster with QR code (includes GoLokol branding and one rotating sponsor logo)</li>
                <li>Full technical setup and troubleshooting — we handle all platform issues</li>
                <li>Points tracking system — customers can redeem points via QR code scan at your register</li>
                <li>Data insights — we'll share voting trends and customer engagement metrics</li>
                <li>One foam board replacement during the 90-day pilot if damaged by normal wear and tear</li>
                <li>Optional promotional support — we may create and share promotional content featuring your store (see Section 5)</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h3 className="text-black font-semibold mb-3">3. WHAT THE STORE PROVIDES</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Store WiFi access (if available) for the kiosk platform</li>
                <li>Physical space for the foam board poster in a visible customer area</li>
                <li>Notification of technical issues — email or text GoLokol immediately if the QR code is damaged or the kiosk isn't working</li>
                <li>Points redemption at checkout — scan customer QR codes to deduct points when they redeem discounts</li>
                <li>Data integrity — store staff do not modify, remove, or tamper with the kiosk or QR code</li>
                <li>Optional: Create one social media post or in-store signage promoting the voting experience to your customers.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h3 className="text-black font-semibold mb-3">4. POINTS & REDEMPTION</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Customers earn points each time they vote on a song.</li>
                <li>The Store sets the redemption rate — e.g., 50 points = $5 off, 100 points = $10 off. GoLokol will help design this with you.</li>
                <li>Points are tracked in the GoLokol system. Store staff scan the customer's QR code at checkout to redeem.</li>
                <li>If this agreement ends before the 90-day pilot completes, Store honors all remaining customer points (no expiration).</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div>
              <h3 className="text-black font-semibold mb-3">5. SPONSORSHIP & CONTENT</h3>
              <p className="font-medium text-black mb-2">Sponsorship:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
                <li>GoLokol places one sponsor logo on the foam board (local business—café, restaurant, neighborhood partner).</li>
                <li>Store receives no sponsorship revenue. All sponsorship fees go to GoLokol.</li>
                <li>Sponsors are small, local businesses aligned with your store's community. GoLokol will not partner with alcohol, drug, or political organizations.</li>
                <li>Sponsor logos may rotate (GoLokol may update the foam board with new sponsors during the 90-day period).</li>
              </ul>
              <p className="font-medium text-black mb-2">Promotional Content:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol may film in-store to create promotional content (photos, video clips) featuring the kiosk and your store.</li>
                <li>Store grants GoLokol permission to use this content in promotional materials (social media, website, case studies).</li>
                <li>Filming will be unobtrusive and brief—we'll coordinate timing with you.</li>
                <li>Store is acknowledged as a GoLokol partner in promotional materials.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div>
              <h3 className="text-black font-semibold mb-3">6. CUSTOMER DATA</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol owns all customer data collected through the kiosk (names, emails, voting history, music preferences, visit frequency).</li>
                <li>Store does not receive customer lists or access to voting data.</li>
                <li>After the 90-day pilot ends, Store has the option to purchase customer data from GoLokol. Pricing and terms will be discussed separately if Store is interested.</li>
                <li>All customer data is used only for music discovery and platform improvements.</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h3 className="text-black font-semibold mb-3">7. TECHNICAL SUPPORT & TROUBLESHOOTING</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol is responsible for all platform issues, QR code functionality, and system troubleshooting.</li>
                <li>Store's role: Notify GoLokol immediately by text or email if the kiosk isn't working or the QR code is damaged.</li>
                <li>Response time: GoLokol will respond within 24 hours and resolve issues as quickly as possible.</li>
                <li>Foam board replacement: GoLokol will replace one damaged foam board (normal wear and tear) during the 90-day pilot at no cost to Store.</li>
                <li>Additional damage: If the foam board is damaged again due to negligence or intentional damage, Store will pay $20 per replacement.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div>
              <h3 className="text-black font-semibold mb-3">8. LIABILITY & RESPONSIBILITY</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol is liable for all technical failures, data loss, or platform malfunctions.</li>
                <li>Store is not liable if customers experience issues with voting, points, or the platform.</li>
                <li>Store is not liable for customer disputes about points or voting results.</li>
                <li>GoLokol indemnifies Store — if a customer claims damages related to the kiosk or voting platform, GoLokol handles the claim and expense.</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div>
              <h3 className="text-black font-semibold mb-3">9. TERMINATION</h3>
              <p className="font-medium text-black mb-2">During the 90-Day Pilot:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
                <li>Either party may terminate this agreement with 3 days' written notice (email is acceptable).</li>
                <li>Store honors all remaining customer points upon termination.</li>
                <li>GoLokol removes the foam board and any signage within 5 business days.</li>
              </ul>
              <p className="font-medium text-black mb-2">After the 90-Day Pilot:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol and Store will meet to review results and decide on continuation.</li>
                <li>If both parties agree to continue, a new agreement will be executed.</li>
                <li>If either party declines to continue, this agreement ends.</li>
              </ul>
            </div>

            {/* Section 10 */}
            <div>
              <h3 className="text-black font-semibold mb-3">10. CHANGES & UPDATES</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol may update the kiosk platform, voting mechanics, or features without additional notice.</li>
                <li>Store acknowledges that technology evolves and that GoLokol may make improvements to the system.</li>
                <li>Material changes (e.g., new customer data collection) will be communicated to Store before implementation.</li>
              </ul>
            </div>

            {/* Section 11 */}
            <div>
              <h3 className="text-black font-semibold mb-3">11. NO EXCLUSIVITY</h3>
              <p>GoLokol may place Lokol Listening Stations kiosks in other record stores and retail locations in {city} and beyond. This agreement does not grant Store any exclusive rights.</p>
            </div>

            {/* Section 12 */}
            <div>
              <h3 className="text-black font-semibold mb-3">12. SIGNATURES</h3>
              <p>By signing below, both parties agree to the terms of this Lokol Listening Stations Kiosk Placement Agreement.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="font-medium text-black">For GoLokol, Inc.:</p>
                  <p className="text-black/70">Name: Hanifah Walidah</p>
                  <p className="text-black/70">Title: Founder</p>
                </div>
                <div>
                  <p className="font-medium text-black">For {store_name}:</p>
                  <p className="text-black/70 italic">To be signed electronically below.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-t border-black/20 pt-10">
            <h2 className="font-display text-xl md:text-2xl text-black mb-8">
              Store Agreement Signature
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pre-filled info */}
              <div className="rounded-lg bg-gray-100 border border-black/10 p-4 space-y-1">
                <p className="type-body-sm text-black/70">Signing on behalf of: <span className="text-black font-medium">{store_name}</span></p>
                <p className="type-body-sm text-black/70">Contact: <span className="text-black font-medium">{contact_name}</span></p>
                <p className="type-body-sm text-black/70">Email: <span className="text-black font-medium">{contact_email}</span></p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signer_title" className="text-black">
                  Title / Role
                </Label>
                <Input
                  id="signer_title"
                  placeholder="e.g. Owner, Manager"
                  value={formData.signer_title}
                  onChange={(e) => setFormData((p) => ({ ...p, signer_title: e.target.value }))}
                  maxLength={200}
                  className="border-black/20 text-black"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  className="mt-0.5 border-black/40"
                />
                <Label htmlFor="consent" className="text-black text-sm leading-relaxed cursor-pointer">
                  I confirm that I have read and agree to the Lokol Listening Stations Kiosk Placement Agreement and that I have the authority to enter into this agreement on behalf of the Store. <span className="text-red-500">*</span>
                </Label>
              </div>

              {/* Electronic Signature */}
              <div className="space-y-2">
                <Label htmlFor="signature_name" className="text-black">
                  Type your full legal name to sign <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signature_name"
                  placeholder="Type your full legal name"
                  value={formData.signature_name}
                  onChange={(e) => setFormData((p) => ({ ...p, signature_name: e.target.value }))}
                  className="font-serif italic text-lg border-black/20 text-black"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-black/50 mt-1">
                  By typing my name above and submitting this form, I acknowledge that this constitutes my electronic signature and that I am legally bound by the terms of this agreement.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || !consentChecked || !formData.signature_name.trim()}
                className="w-full md:w-auto bg-black text-yellow-400 hover:bg-black/90"
              >
                {submitting ? "Signing..." : "Sign Agreement"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LLSUsTerms;
