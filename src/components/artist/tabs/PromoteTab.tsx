import { useState } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";

const PUBLIC_BASE_URL = "https://golokol.app";

interface PromoteTabProps {
  eventId: string;
  artistName: string;
  fixedPrice: number | null;
}

const PromoteTab = ({ eventId, artistName, fixedPrice }: PromoteTabProps) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [posterHeadline, setPosterHeadline] = useState("");
  const [customCaption, setCustomCaption] = useState(
    `Come hang after tonight's show. Join my After Party: ${PUBLIC_BASE_URL}/after-party/${eventId}/rsvp`
  );

  const shareUrl = `${PUBLIC_BASE_URL}/after-party/${eventId}/rsvp`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success("Link copied");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyCaption = async () => {
    await navigator.clipboard.writeText(customCaption);
    setCaptionCopied(true);
    toast.success("Caption copied");
    setTimeout(() => setCaptionCopied(false), 2000);
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
    
    const titleText = posterHeadline || `${artistName}'s After Party`;
    doc.text(titleText, pageWidth / 2, 2.5, { align: "center" });
    
    const qrSize = 4.5;
    const qrX = (pageWidth - qrSize) / 2;
    doc.addImage(qrDataUrl, "PNG", qrX, 4.5, qrSize, qrSize);
    
    // Add CTA
    doc.setFontSize(16);
    doc.text("Scan to join the party", pageWidth / 2, 9.5, { align: "center" });
    
    const safeTitle = artistName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    doc.save(`afterparty-poster-${safeTitle}.pdf`);
    
    toast.success("Poster downloaded!");
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(0)}`;

  // Caption templates
  const captionTemplates = [
    {
      label: "Before the show",
      text: `Come hang after tonight's show. Join my After Party: ${shareUrl}`,
    },
    {
      label: "On stage",
      text: `Scan the QR or visit ${shareUrl} to join the After Party!`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      <p className="text-muted-foreground text-sm font-sans">
        Most artists share twice: once before the show, once on stage.
      </p>

      {/* Share Link */}
      <div className="space-y-3">
        <label className="block text-sm text-primary font-sans font-medium">Share link</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3">
            <p className="text-foreground font-mono text-sm break-all">{shareUrl}</p>
          </div>
          <Button
            onClick={handleCopyLink}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 shrink-0"
          >
            {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {linkCopied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>

      {/* Current price display */}
      {fixedPrice && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
          <p className="text-primary text-sm font-sans">
            Fans see: <strong>{formatPrice(fixedPrice)} to join</strong>
          </p>
        </div>
      )}

      {/* QR Code + Poster */}
      <div className="bg-primary/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-lg shrink-0">
            <QRCodeSVG value={shareUrl} size={80} level="H" />
          </div>
          <div className="flex-1 space-y-2">
            <Input
              value={posterHeadline}
              onChange={(e) => setPosterHeadline(e.target.value.slice(0, 60))}
              placeholder={`${artistName}'s After Party`}
              className="bg-background border-border text-sm"
              maxLength={60}
            />
            <p className="text-muted-foreground text-xs font-sans">
              Custom headline (max 60 chars)
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleDownloadPoster}
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-12"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Poster
        </Button>
      </div>

      {/* Hidden canvas for PDF */}
      <div className="hidden">
        <QRCodeCanvas id="promote-qr-canvas" value={shareUrl} size={400} level="H" />
      </div>

      {/* Custom Caption */}
      <div className="space-y-3">
        <label className="block text-sm text-primary font-sans font-medium">Custom caption</label>
        <Textarea
          value={customCaption}
          onChange={(e) => setCustomCaption(e.target.value)}
          rows={3}
          className="bg-background border-border text-sm resize-none"
        />
        <Button
          onClick={handleCopyCaption}
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          {captionCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {captionCopied ? "Copied!" : "Copy Caption"}
        </Button>
      </div>

      {/* Caption Templates */}
      <div className="space-y-3">
        <p className="text-muted-foreground font-sans text-xs uppercase tracking-wide">Caption ideas</p>
        {captionTemplates.map((template, i) => (
          <button
            key={i}
            onClick={() => setCustomCaption(template.text)}
            className="w-full text-left bg-muted/50 border border-border rounded-lg p-3 hover:bg-muted transition-colors"
          >
            <p className="text-muted-foreground font-sans text-xs mb-1">{template.label}</p>
            <p className="text-foreground font-sans text-sm">{template.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromoteTab;
