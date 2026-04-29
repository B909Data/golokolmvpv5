import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AGREEMENT_VERSION = "LOKOL_STICKER_PARTNER_V1";

const buildAgreementText = (storeName: string, contactName: string) =>
  `LOKOL STICKER PARTNER AGREEMENT

This Agreement is entered into between:

GoLokol, Inc. ("GoLokol")
and
${storeName} and ${contactName} ("Partner")

Effective Date: Date of Sticker Pack Purchase

1. WHAT IS LOKOL LISTENING SESSIONS?

GoLokol is a music discovery platform featuring local artists. Here's how the partnership works:

GoLokol provides Partner with branded sticker packs containing QR codes.
Partner gives one sticker to customers after purchase as a gift.
Customers scan the sticker on their own device at their convenience and enter the GoLokol music discovery experience.
Customers vote on local music, earn Points, and can redeem rewards at Partner's business.
Customers are invited to join GoLokol Connect, our artist discovery app (optional for them).

This is a flexible, ongoing partnership based on sticker distribution. There is no fixed end date — the partnership remains active as long as stickers are in circulation.

2. THE STICKER PACK & PRICING

What GoLokol Provides:
One initial pack of 500 branded stickers per order. Each sticker contains a unique QR code tied to Partner's location. Stickers are printed with GoLokol branding and Partner's business name. GoLokol handles all QR code generation, tracking, and platform infrastructure.

Partner's Investment:
Partner pays $40 per sticker pack (500 stickers = $40 one-time). Payment is due at signup before stickers are printed. Additional sticker pack orders follow the same $40 pricing. No refunds are issued after the sticker pack order is fulfilled and printed.

3. PARTNER'S RESPONSIBILITIES

Partner agrees to:
- Distribute stickers to customers after purchase as a gift (recommended practice, not a hard requirement)
- Notify GoLokol when the sticker pack distribution begins and when the last sticker has been given away
- Set their own redemption reward rate
- Honor point redemptions at checkout by scanning customer QR codes to deduct Points
- Honor remaining customer points if the partnership ends

What Partner does NOT need to provide:
- Physical wall or floor space
- Store WiFi or internet access
- Hardware installation or maintenance
- Technical support (GoLokol handles all platform issues)

4. DISTRIBUTION TIMELINE & PARTNERSHIP DURATION

The partnership begins on the date of sticker pack purchase. The active distribution period is defined as the time between first sticker distribution and the last sticker being given away.

A 30-day review period begins after the last sticker has been distributed. During this review period, GoLokol and Partner will meet to assess results and determine whether to continue. If both parties agree to continue, Partner may order a new sticker pack at the same $40 pricing.

The partnership remains active and ongoing as long as stickers are in circulation and Points are being redeemed. There is no predetermined expiration date unless either party terminates.

5. POINTS & REDEMPTION

Customers earn Points each time they engage with local music via the sticker QR code. Partner sets the redemption rate. Points are tracked in the GoLokol system. Partner staff scan the customer's QR code at checkout to redeem. If the partnership ends, Partner honors all remaining customer Points (no expiration).

6. CUSTOMER DATA & CO-BRANDING

GoLokol owns all customer data collected through the sticker QR codes. Partner does not receive customer lists or access to voting data. After the partnership ends, Partner has the option to purchase customer data from GoLokol.

GoLokol may co-brand the stickers with a sponsor logo. Sponsors are small, local businesses aligned with Partner's community. GoLokol will not partner with alcohol, drug, or political organizations. Partner will be notified of any co-branding before stickers are printed. Partner retains the right to request sponsor review if there are community concerns.

7. TERMINATION

Either party may terminate this agreement with 3 days' written notice (email is acceptable) at any time. Upon termination, Partner honors all remaining customer Points. No sticker refunds are issued after the order is fulfilled.

8. CHANGES & UPDATES

GoLokol may update the discovery platform, voting mechanics, or features without additional notice. Material changes will be communicated to Partner before implementation.

9. LIABILITY & INDEMNITY

GoLokol is liable for all technical failures, data loss, or platform malfunctions. Partner is not liable for customer disputes about Points or voting results. GoLokol indemnifies Partner — if a customer claims damages related to the stickers, QR code, or voting platform, GoLokol handles the claim and expense.

10. NO EXCLUSIVITY

GoLokol may provide sticker packs to other retail and gathering spot partners in the same geographic area and beyond. This agreement does not grant Partner any exclusive rights.`;

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
  const agreementText = buildAgreementText(store_name, contact_name);

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
      const signatureId = crypto.randomUUID();
      const { error } = await supabase.from("lls_kiosk_agreement_signatures" as any).insert({
        id: signatureId,
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

      if (retail_signup_id) {
        await supabase
          .from("lls_retail_signups")
          .update({ terms_accepted: true } as any)
          .eq("id", retail_signup_id);
      }

      const signedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      supabase.functions
        .invoke("send-transactional-email", {
          body: {
            templateName: "kiosk-agreement-confirmation",
            recipientEmail: contact_email,
            idempotencyKey: `sticker-agreement-${signatureId}`,
            templateData: {
              contact_name,
              store_name,
              city,
              signed_date: signedDate,
              agreement_text: agreementText,
              agreement_version: AGREEMENT_VERSION,
            },
          },
        })
        .catch((err: any) => console.error("Email send error:", err));

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
            <h1 className="font-display text-2xl md:text-3xl text-black mb-4">Agreement Signed Successfully</h1>
            <p className="text-black/70 mb-2">
              Thank you, <span className="text-black font-medium">{contact_name}</span>.
            </p>
            <p className="text-black/70 mb-8">
              Your electronic signature for the Lokol Sticker Partner Agreement has been recorded. A copy has been sent
              to your email. We'll be in touch shortly to get your sticker pack on the way.
            </p>
            <Link to="/">
              <Button className="bg-black text-yellow-400 hover:bg-black/90">Back to GoLokol</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl md:text-3xl text-black mb-2">LOKOL STICKER PARTNER AGREEMENT</h1>
          <p className="text-black/50 text-sm mb-8">Version: {AGREEMENT_VERSION}</p>

          <div className="space-y-8 text-black/70 leading-relaxed mb-12">
            <div>
              <p>This Agreement is entered into between:</p>
              <p className="mt-3">
                <strong className="text-black">GoLokol, Inc.</strong> ("GoLokol")
                <br />
                and
                <br />
                <strong className="text-black">{store_name}</strong> and{" "}
                <strong className="text-black">{contact_name}</strong> ("Partner")
              </p>
              <p className="mt-3">Effective Date: Date of Sticker Pack Purchase</p>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">1. WHAT IS LOKOL LISTENING SESSIONS?</h3>
              <p className="mb-3">
                GoLokol is a music discovery platform featuring local artists. Here's how the partnership works:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol provides Partner with branded sticker packs containing QR codes.</li>
                <li>Partner gives one sticker to customers after purchase as a gift.</li>
                <li>
                  Customers scan the sticker on their own device at their convenience and enter the GoLokol music
                  discovery experience.
                </li>
                <li>Customers vote on local music, earn Points, and can redeem rewards at Partner's business.</li>
                <li>Customers are invited to join GoLokol Connect, our artist discovery app (optional for them).</li>
              </ul>
              <p className="mt-3">
                This is a flexible, ongoing partnership based on sticker distribution. There is no fixed end date — the
                partnership remains active as long as stickers are in circulation.
              </p>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">2. THE STICKER PACK & PRICING</h3>
              <p className="font-medium text-black mb-2">What GoLokol Provides:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
                <li>One initial pack of 500 branded stickers per order.</li>
                <li>Each sticker contains a unique QR code tied to Partner's location.</li>
                <li>Stickers are printed with GoLokol branding and Partner's business name.</li>
                <li>GoLokol handles all QR code generation, tracking, and platform infrastructure.</li>
              </ul>
              <p className="font-medium text-black mb-2">Partner's Investment:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Partner pays $40 per sticker pack (500 stickers = $40 one-time).</li>
                <li>Payment is due at signup before stickers are printed.</li>
                <li>Additional sticker pack orders follow the same $40 pricing.</li>
                <li>No refunds are issued after the sticker pack order is fulfilled and printed.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">3. PARTNER'S RESPONSIBILITIES</h3>
              <p className="font-medium text-black mb-2">Partner agrees to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
                <li>
                  Distribute stickers to customers after purchase as a gift (recommended practice, not a hard
                  requirement).
                </li>
                <li>
                  Notify GoLokol when the sticker pack distribution begins and when the last sticker has been given
                  away.
                </li>
                <li>Set their own redemption reward rate.</li>
                <li>Honor point redemptions at checkout by scanning customer QR codes to deduct Points.</li>
                <li>Honor remaining customer points if the partnership ends.</li>
              </ul>
              <p className="font-medium text-black mb-2">What Partner does NOT need to provide:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Physical wall or floor space.</li>
                <li>Store WiFi or internet access.</li>
                <li>Hardware installation or maintenance.</li>
                <li>Technical support (GoLokol handles all platform issues).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">4. DISTRIBUTION TIMELINE & PARTNERSHIP DURATION</h3>
              <p className="mb-3">
                The partnership begins on the date of sticker pack purchase. The active distribution period is defined
                as the time between first sticker distribution and the last sticker being given away.
              </p>
              <p className="mb-3">
                A 30-day review period begins after the last sticker has been distributed. During this review period,
                GoLokol and Partner will meet to assess results and determine whether to continue. If both parties agree
                to continue, Partner may order a new sticker pack at the same $40 pricing.
              </p>
              <p>
                The partnership remains active and ongoing as long as stickers are in circulation and Points are being
                redeemed. There is no predetermined expiration date unless either party terminates.
              </p>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">5. POINTS & REDEMPTION</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Customers earn Points each time they engage with local music via the sticker QR code.</li>
                <li>
                  Partner sets the redemption rate — e.g., 50 points = $5 off, 100 points = 10% off $50+ purchase.
                  GoLokol will help design this with Partner.
                </li>
                <li>
                  Points are tracked in the GoLokol system. Partner staff scan the customer's QR code at checkout to
                  redeem.
                </li>
                <li>If the partnership ends, Partner honors all remaining customer Points (no expiration).</li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">6. CUSTOMER DATA & CO-BRANDING</h3>
              <p className="font-medium text-black mb-2">Customer Data Ownership:</p>
              <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
                <li>GoLokol owns all customer data collected through the sticker QR codes.</li>
                <li>Partner does not receive customer lists or access to voting data.</li>
                <li>
                  After the partnership ends, Partner has the option to purchase customer data from GoLokol. Pricing and
                  terms will be discussed separately.
                </li>
              </ul>
              <p className="font-medium text-black mb-2">Co-Branding & Sponsorship:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol may co-brand the stickers with a sponsor logo (local businesses only).</li>
                <li>Partner receives no sponsorship revenue. All sponsorship fees go to GoLokol.</li>
                <li>GoLokol will not partner with alcohol, drug, or political organizations.</li>
                <li>Partner will be notified of any co-branding before stickers are printed.</li>
                <li>Partner retains the right to request sponsor review if there are community concerns.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">7. TERMINATION</h3>
              <p className="mb-3">
                Either party may terminate this agreement with 3 days' written notice (email is acceptable) at any time.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Partner honors all remaining customer Points upon termination (no expiration).</li>
                <li>No sticker refunds are issued after the order is fulfilled.</li>
                <li>Customer voting data and historical Points remain valid for redemption after termination.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">8. CHANGES & UPDATES</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  GoLokol may update the discovery platform, voting mechanics, or features without additional notice.
                </li>
                <li>Material changes will be communicated to Partner before implementation.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">9. LIABILITY & INDEMNITY</h3>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>GoLokol is liable for all technical failures, data loss, or platform malfunctions.</li>
                <li>Partner is not liable for customer disputes about Points or voting results.</li>
                <li>
                  GoLokol indemnifies Partner — if a customer claims damages related to the stickers, QR code, or voting
                  platform, GoLokol handles the claim and expense.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">10. NO EXCLUSIVITY</h3>
              <p>
                GoLokol may provide sticker packs to other retail and gathering spot partners in the same geographic
                area and beyond. This agreement does not grant Partner any exclusive rights.
              </p>
            </div>

            <div>
              <h3 className="text-black font-semibold mb-3">SIGNATURES</h3>
              <div className="space-y-3">
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
            <h2 className="font-display text-xl md:text-2xl text-black mb-8">Sign the Agreement</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-lg bg-gray-100 border border-black/10 p-4 space-y-1">
                <p className="text-sm text-black/70">
                  Signing on behalf of: <span className="text-black font-medium">{store_name}</span>
                </p>
                <p className="text-sm text-black/70">
                  Contact: <span className="text-black font-medium">{contact_name}</span>
                </p>
                <p className="text-sm text-black/70">
                  Email: <span className="text-black font-medium">{contact_email}</span>
                </p>
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
                  className="border-black/20 text-black bg-white"
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  className="mt-0.5 border-black/40"
                />
                <Label htmlFor="consent" className="text-black text-sm leading-relaxed cursor-pointer">
                  I confirm that I have read and agree to the Lokol Sticker Partner Agreement and that I have the
                  authority to enter into this agreement on behalf of the Partner.{" "}
                  <span className="text-red-500">*</span>
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature_name" className="text-black">
                  Type your full legal name to sign <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="signature_name"
                  placeholder="Type your full legal name"
                  value={formData.signature_name}
                  onChange={(e) => setFormData((p) => ({ ...p, signature_name: e.target.value }))}
                  className="font-serif italic text-lg border-black/20 text-black bg-white"
                  required
                  maxLength={200}
                />
                <p className="text-xs text-black/50 mt-1">
                  By typing my name above and submitting this form, I acknowledge that this constitutes my electronic
                  signature and that I am legally bound by the terms of this agreement.
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
