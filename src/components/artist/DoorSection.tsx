import { useState, useRef, useEffect } from "react";
import { DoorOpen, QrCode, UserPlus, X, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import CollapsibleSection from "./CollapsibleSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface DoorSectionProps {
  eventId: string;
  token: string;
  isExpired: boolean;
  onCheckin: () => void;
}

const DoorSection = ({ eventId, token, isExpired, onCheckin }: DoorSectionProps) => {
  const isMobile = useIsMobile();
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [showWalkInsQR, setShowWalkInsQR] = useState(false);
  const [walkInPassData, setWalkInPassData] = useState<{ qrToken: string; displayName: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = () => {
    setScannerError(null);
    setIsScanning(true);

    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("door-qr-scanner");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            await scanner.stop();
            scannerRef.current = null;
            setIsScanning(false);

            const match = decodedText.match(/\/after-party\/[^/]+\/verify\/([^/?]+)/);
            if (match && match[1]) {
              await handleQRCheckin(match[1]);
            } else {
              toast.error("Invalid QR code");
            }
          },
          () => {}
        );
      } catch (err: any) {
        console.error("Scanner error:", err);
        scannerRef.current = null;
        setIsScanning(false);

        if (err.name === "NotAllowedError" || err.message?.includes("Permission")) {
          setScannerError("Camera access blocked. Enable camera for this site.");
        } else {
          setScannerError("Could not start camera. Please try again.");
        }
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScannerError(null);
  };

  const handleQRCheckin = async (qrToken: string) => {
    setIsCheckingIn(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-checkin-attendee", {
        body: { event_id: eventId, token, qr_token: qrToken },
      });

      if (error) throw error;

      if (data.already_checked_in) {
        toast.info(`${data.attendee.display_name || "Guest"} already checked in`);
      } else {
        toast.success(`${data.attendee.display_name || "Guest"} checked in!`);
        onCheckin();
      }
    } catch (err: any) {
      console.error("Check-in error:", err);
      toast.error(err.message || "Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleWalkInSubmit = async () => {
    setIsCheckingIn(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-checkin-attendee", {
        body: {
          event_id: eventId,
          token,
          walk_in: true,
          display_name: walkInName.trim() || undefined,
          phone: walkInPhone.trim() || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Walk-in added: ${data.attendee.display_name || "Guest"}`);
      onCheckin();
      setShowWalkInForm(false);
      setWalkInName("");
      setWalkInPhone("");

      setWalkInPassData({
        qrToken: data.attendee.qr_token,
        displayName: data.attendee.display_name || "Guest",
      });
    } catch (err: any) {
      console.error("Walk-in error:", err);
      toast.error(err.message || "Walk-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getWalkInPassUrl = () => {
    if (!walkInPassData) return "";
    return `${window.location.origin}/after-party/${eventId}/intro?token=${walkInPassData.qrToken}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getWalkInPassUrl());
    setLinkCopied(true);
    toast.success("Link copied");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
      <CollapsibleSection
        title="Door (Check-In)"
        icon={DoorOpen}
        defaultOpen={!isMobile}
        variant="dark"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground font-sans text-sm">
            Scan fan passes or add walk-ins. Entry is quick and stress-free.
          </p>

          {/* Scanner error */}
          {scannerError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-destructive text-sm">
              {scannerError}
            </div>
          )}

          {/* Scanner active */}
          {isScanning ? (
            <div className="space-y-3">
              <div
                id="door-qr-scanner"
                className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black/50 min-h-[280px]"
              />
              <Button
                variant="outline"
                onClick={stopScanner}
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            </div>
          ) : showWalkInForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-primary mb-1.5 font-sans">Name (optional)</label>
                <Input
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="Guest name"
                  className="bg-black/50 border-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-primary mb-1.5 font-sans font-medium">
                  Phone (optional)
                </label>
                <Input
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                  className="bg-black/50 border-primary/30 focus:border-primary"
                />
                <p className="text-primary/60 text-xs mt-1.5">
                  We only use this to alert when you enter the party.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleWalkInSubmit}
                  disabled={isCheckingIn}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  {isCheckingIn ? "Adding..." : "Add Walk-In"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowWalkInForm(false)}
                  className="border-primary text-primary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={startScanner}
                disabled={isExpired}
                className="bg-primary text-primary-foreground"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan Pass
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWalkInsQR(true)}
                disabled={isExpired}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Walk-Ins
              </Button>
            </div>
          )}

          {isExpired && (
            <p className="text-muted-foreground text-sm text-center">
              Party has ended. Check-in is closed.
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* Walk-In Pass Modal */}
      <Dialog open={!!walkInPassData} onOpenChange={(open) => !open && setWalkInPassData(null)}>
        <DialogContent className="sm:max-w-md bg-black border-primary">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center text-primary">Walk-In Pass</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-sans font-medium">
              {walkInPassData?.displayName}
            </div>
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={getWalkInPassUrl()} size={180} level="H" />
            </div>
            <p className="text-primary/70 text-sm text-center">Hand this to the fan to scan</p>
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-1 border-primary text-primary"
              >
                {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {linkCopied ? "Copied!" : "Copy Link"}
              </Button>
              <Button onClick={() => setWalkInPassData(null)} className="flex-1 bg-primary text-primary-foreground">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Walk-Ins QR Modal */}
      <Dialog open={showWalkInsQR} onOpenChange={setShowWalkInsQR}>
        <DialogContent className="sm:max-w-md bg-black border-primary">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center text-primary uppercase">
              Walk-Ins
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-6">
            <div className="bg-white p-6 rounded-xl">
              <QRCodeSVG value={`${window.location.origin}/after-party/${eventId}`} size={240} level="H" />
            </div>
            <p className="text-primary/80 text-sm text-center">Fans scan to join the After Party</p>
            <Button
              onClick={() => setShowWalkInsQR(false)}
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DoorSection;
