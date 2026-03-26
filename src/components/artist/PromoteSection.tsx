import { useState } from "react";
import { Share2, Copy, Check, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import CollapsibleSection from "./CollapsibleSection";

const PUBLIC_BASE_URL = "https://golokol.app";

interface PromoteSectionProps {
  eventId: string;
  artistName: string;
  fixedPrice: number | null;
}

const PromoteSection = ({ eventId, artistName, fixedPrice }: PromoteSectionProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${PUBLIC_BASE_URL}/after-party/${eventId}/intro`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPoster = () => {
    const canvas = document.getElementById("promote-qr-canvas") as HTMLCanvasElement;
    if (!canvas) {
      toast.error("Could not generate QR code");
      return;
    }

    const qrDataUrl = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });
    
    const pageWidth = 8.5;
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    
    const titleText = `${artistName}'s After Party`;
    doc.text(titleText, pageWidth / 2, 2.5, { align: "center" });
    
    const qrSize = 4.5;
    const qrX = (pageWidth - qrSize) / 2;
    doc.addImage(qrDataUrl, "PNG", qrX, 4.5, qrSize, qrSize);
    
    const safeTitle = artistName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    doc.save(`afterparty-poster-${safeTitle}.pdf`);
    
    toast.success("Poster downloaded!");
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  // Caption templates
  const captions = [
    {
      label: "Before the show",
      text: `Come hang after tonight's show. Join my After Party: ${shareUrl}`,
    },
    {
      label: "On stage",
      text: `Scan the QR or visit ${shareUrl} to join the After Party after the set!`,
    },
  ];

  return (
    <CollapsibleSection
      title="Promote"
      icon={Share2}
      defaultOpen={true}
      variant="dark"
    >
      <div className="space-y-5">
        <p className="text-muted-foreground font-sans text-sm">
          Share this link so fans can RSVP. Most artists share twice: before the show, then on stage.
        </p>

        {/* Share link */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
            <p className="text-primary font-mono text-sm break-all">{shareUrl}</p>
          </div>
          <Button
            onClick={handleCopy}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        {/* Current price display */}
        {fixedPrice && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
            <p className="text-primary text-sm font-sans">
              Fans see: <strong>{formatPrice(fixedPrice)} to join</strong>
            </p>
          </div>
        )}

        {/* QR Code + Download */}
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-lg">
            <QRCodeSVG value={shareUrl} size={80} level="H" />
          </div>
          <div className="flex-1">
            <Button
              variant="outline"
              onClick={handleDownloadPoster}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Poster
            </Button>
          </div>
        </div>

        {/* Hidden canvas for PDF */}
        <div className="hidden">
          <QRCodeCanvas id="promote-qr-canvas" value={shareUrl} size={400} level="H" />
        </div>

        {/* Caption templates */}
        <div className="space-y-3">
          <p className="text-primary/70 font-sans text-xs uppercase tracking-wide">Caption ideas</p>
          {captions.map((cap, i) => (
            <div key={i} className="bg-black/50 border border-primary/20 rounded-lg p-3">
              <p className="text-primary/60 font-sans text-xs mb-1">{cap.label}</p>
              <p className="text-foreground font-sans text-sm">{cap.text}</p>
            </div>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
};

export default PromoteSection;
