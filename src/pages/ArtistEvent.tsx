import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { Save, Trash2, RefreshCw, QrCode, UserPlus, Users, X, Copy, Check, MessageSquare, CheckCircle2, Share2, Bookmark, PartyPopper, Download, Printer, Clock, DoorOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PaidAccessSection from "@/components/PaidAccessSection";

const PUBLIC_BASE_URL = "https://golokol.app";

interface EventData {
  id: string;
  title: string;
  artist_name: string | null;
  pinned_message: string | null;
  youtube_url: string | null;
  image_url: string | null;
  livestream_url: string | null;
  start_at: string;
  city: string | null;
  venue_name: string | null;
  merch_link: string | null;
  music_link: string | null;
  after_party_opens_at: string | null;
  // Paid access fields
  stripe_account_id: string | null;
  pricing_mode: string | null;
  fixed_price: number | null;
  min_price: number | null;
  pricing_locked_at: string | null;
}

interface Message {
  id: string;
  message: string | null;
  role: string;
  created_at: string;
  attendee_id: string;
}

// Status Card Component - Compact inline style
// Uses Roboto Bold for numeric/stat displays to prevent Grotesk rendering issues
const StatusCard = ({ icon: Icon, label, value, accent = false }: { 
  icon: React.ElementType; 
  label: string; 
  value: number | string;
  accent?: boolean;
}) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${accent ? 'bg-primary text-primary-foreground' : 'bg-black/80 border border-primary/30'}`}>
    <Icon className={`w-5 h-5 ${accent ? 'text-primary-foreground' : 'text-primary'}`} />
    <div>
      <p className={`text-base font-sans uppercase tracking-wide ${accent ? 'text-primary-foreground/80' : 'text-primary/70'}`}>{label}</p>
      <p className={`text-xl font-sans font-bold ${accent ? 'text-primary-foreground' : 'text-primary'}`} style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>{value}</p>
    </div>
  </div>
);

// Time Left Hook - calculates remaining time from after_party_opens_at
const useTimeLeft = (afterPartyOpensAt: string | null) => {
  const [timeLeft, setTimeLeft] = useState<string>("24:00:00");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!afterPartyOpensAt) {
      setTimeLeft("24:00:00");
      setIsExpired(false);
      return;
    }

    const calculateTimeLeft = () => {
      const openTime = new Date(afterPartyOpensAt).getTime();
      const endTime = openTime + 24 * 60 * 60 * 1000; // 24 hours after opening
      const now = Date.now();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [afterPartyOpensAt]);

  return { timeLeft, isExpired };
};

const ArtistEvent = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const isWelcome = searchParams.get("welcome") === "true";
  const stripeConnected = searchParams.get("stripe_connected") === "true";
  const stripeRefresh = searchParams.get("stripe_refresh") === "true";

  const [event, setEvent] = useState<EventData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  const [pinnedMessage, setPinnedMessage] = useState("");
  const [livestreamUrl, setLivestreamUrl] = useState("");
  const [merchLink, setMerchLink] = useState("");
  const [musicLink, setMusicLink] = useState("");

  // Door check-in state
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  // Walk-in pass modal state
  const [walkInPassData, setWalkInPassData] = useState<{ qrToken: string; displayName: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Walk-ins QR modal state (new flow: show QR for fans to scan)
  const [showWalkInsQR, setShowWalkInsQR] = useState(false);
  
  // Share link copied state
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // Time left hook
  const { timeLeft, isExpired } = useTimeLeft(event?.after_party_opens_at || null);

  const fetchEvent = async () => {
    if (!eventId || !token) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `artist-get-event?event_id=${eventId}&token=${token}`
      );
      if (error) throw error;
      if (data?.error === "Not authorized") {
        setAuthorized(false);
        return;
      }
      setEvent(data.event);
      setMessages(data.messages || []);
      setPinnedMessage(data.event?.pinned_message || "");
      setLivestreamUrl(data.event?.livestream_url || "");
      setMerchLink(data.event?.merch_link || "");
      setMusicLink(data.event?.music_link || "");
    } catch (err) {
      console.error("Fetch error:", err);
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckedInCount = async () => {
    if (!eventId) return;
    const { count } = await supabase
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .not("checked_in_at", "is", null);
    setCheckedInCount(count || 0);
  };

  useEffect(() => {
    fetchEvent();
    fetchCheckedInCount();
  }, [eventId, token]);

  // Show welcome toast on first visit
  useEffect(() => {
    if (isWelcome && event) {
      toast.success("Your After Party is live!", {
        description: "Bookmark this page and share the link with your fans.",
        duration: 5000,
      });
    }
  }, [isWelcome, event]);

  // Handle Stripe Connect callback
  useEffect(() => {
    if (stripeConnected && event) {
      toast.success("Stripe connected!", {
        description: "You can now set up paid access for your After Party.",
        duration: 5000,
      });
      // Clean up URL params
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("stripe_connected");
      window.history.replaceState({}, "", newUrl.toString());
    }
    if (stripeRefresh && event) {
      toast.info("Stripe onboarding incomplete", {
        description: "Click 'Connect with Stripe' to continue setup.",
        duration: 5000,
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("stripe_refresh");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [stripeConnected, stripeRefresh, event]);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleSave = async () => {
    if (!eventId || !token) return;
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("artist-update-event", {
        body: {
          event_id: eventId,
          token,
          pinned_message: pinnedMessage,
          livestream_url: livestreamUrl,
          merch_link: merchLink,
          music_link: musicLink,
        },
      });
      if (error) throw error;
      toast.success("Settings saved");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!eventId || !token) return;
    try {
      const { error } = await supabase.functions.invoke("artist-delete-message", {
        body: { event_id: eventId, token, message_id: messageId },
      });
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message removed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete message");
    }
  };

  const startScanner = () => {
    setScannerError(null);
    setIsScanning(true);
    
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("qr-scanner");
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
              toast.error("Invalid QR code format");
            }
          },
          () => {}
        );
      } catch (err: any) {
        console.error("Scanner error:", err);
        scannerRef.current = null;
        setIsScanning(false);
        
        if (err.name === "NotAllowedError" || err.message?.includes("Permission")) {
          setScannerError("Camera access blocked. Enable camera for this site and reload.");
        } else if (err.message?.includes("secure context") || err.message?.includes("HTTPS")) {
          setScannerError("Camera requires HTTPS.");
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
      } catch (e) {
        // Ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setScannerError(null);
  };

  const handleQRCheckin = async (qrToken: string) => {
    if (!eventId || !token) return;
    
    setIsCheckingIn(true);
    try {
      const { data, error } = await supabase.functions.invoke("artist-checkin-attendee", {
        body: {
          event_id: eventId,
          token,
          qr_token: qrToken,
        },
      });

      if (error) throw error;

      if (data.already_checked_in) {
        toast.info(`${data.attendee.display_name || "Guest"} is already checked in`);
      } else {
        toast.success(`${data.attendee.display_name || "Guest"} checked in`);
        fetchCheckedInCount();
        // Refetch event to get updated after_party_opens_at
        fetchEvent();
      }
    } catch (err: any) {
      console.error("Check-in error:", err);
      toast.error(err.message || "Check-in failed");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleWalkInSubmit = async () => {
    if (!eventId || !token) return;
    
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
      fetchCheckedInCount();
      // Refetch event to get updated after_party_opens_at
      fetchEvent();
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
    if (!walkInPassData || !eventId) return "";
    return `${window.location.origin}/after-party/${eventId}/intro?token=${walkInPassData.qrToken}`;
  };

  // Walk-in QR encodes the intro URL (not verify) since they're already checked in
  const getWalkInQRUrl = () => {
    if (!walkInPassData || !eventId) return "";
    return `${window.location.origin}/after-party/${eventId}/intro?token=${walkInPassData.qrToken}`;
  };

  const handleCopyLink = async () => {
    const url = getWalkInPassUrl();
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success("Link copied");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const closeWalkInPassModal = () => {
    setWalkInPassData(null);
    setLinkCopied(false);
  };

  // Walk-ins QR URL - points to fan join form
  const getWalkInsJoinUrl = () => {
    if (!eventId) return "";
    return `${window.location.origin}/after-party/${eventId}`;
  };

  // Share link functionality
  const shareUrl = eventId ? `${PUBLIC_BASE_URL}/after-party/${eventId}/rsvp` : "";
  
  const handleCopyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShareLinkCopied(true);
    toast.success("Share link copied");
    setTimeout(() => setShareLinkCopied(false), 2000);
  };

  // Download Merch Table QR Poster
  const handleDownloadPoster = () => {
    const canvas = document.getElementById("merch-table-qr-canvas") as HTMLCanvasElement;
    if (!canvas) {
      toast.error("Could not generate QR code");
      return;
    }

    const qrDataUrl = canvas.toDataURL("image/png");
    const doc = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });
    
    // Page dimensions: 8.5 x 11 inches
    const pageWidth = 8.5;
    
    // Top 1/3: Band Name's After Party Access (centered)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    
    const bandName = event?.artist_name || event?.title || "Your Band";
    const titleText = `${bandName}'s After Party Access`;
    
    // Center text in top third (y = 2.5 inches from top)
    doc.text(titleText, pageWidth / 2, 2.5, { align: "center" });
    
    // Bottom 2/3: Large QR code (centered)
    const qrSize = 4.5;
    const qrX = (pageWidth - qrSize) / 2;
    const qrY = 4.5;
    
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    
    // Save PDF
    const safeTitle = (event?.artist_name || event?.title || "afterparty")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    doc.save(`merch-table-qr-${safeTitle}.pdf`);
    
    toast.success("Poster downloaded!");
  };

  if (!token || !authorized) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Not authorized</h1>
            <p className="text-muted-foreground font-sans text-base">You do not have access to this page.</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground font-sans text-base">Loading...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const artistName = event?.artist_name || "YOUR";

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Header - Brutal Grotesk Style */}
        <section className="pt-28 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground uppercase tracking-tight leading-none">
              <span className="text-primary">{artistName}</span>
              <br />
              <span className="text-foreground">AFTER PARTY</span>
              <br />
              <span className="text-primary">CONTROL ROOM</span>
            </h1>
            
            {/* Bookmark Instruction - Increased font size */}
            <div className="flex items-center gap-3 mt-6 text-muted-foreground">
              <Bookmark className="w-5 h-5 shrink-0" />
              <p className="text-lg font-sans">
                Bookmark this page. This is your home base to promote and manage your After Party.{" "}
                <Link to="/how-to-golokol" className="text-primary hover:underline">FAQ</Link>
              </p>
            </div>

            {/* Tutorial Video */}
            <div className="mt-6 aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/4b9rf2KQt0E"
                title="How to use the Artist Control Room"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* CONTAINER 1: Promote Your After Party - Yellow Container */}
        <section className="px-4 pb-8 pt-2">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-primary-foreground" />
                <h2 className="font-display text-xl text-primary-foreground uppercase tracking-wide">
                  Promote Your After Party
                </h2>
              </div>
              
              <p className="text-primary-foreground text-base font-sans">
                Share this link with your fans so they can get their pass.
              </p>
              
              {/* Link Display - Black on Yellow */}
              <div className="bg-black rounded-lg p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-primary font-mono text-base truncate">
                    {shareUrl}
                  </p>
                </div>
                <Button
                  onClick={handleCopyShareLink}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 text-base"
                >
                  {shareLinkCopied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              
            </div>
          </div>
        </section>

        {/* PAID ACCESS SECTION */}
        {event && eventId && token && (
          <PaidAccessSection
            eventId={eventId}
            token={token}
            stripeAccountId={event.stripe_account_id}
            pricingMode={event.pricing_mode}
            fixedPrice={event.fixed_price}
            minPrice={event.min_price}
            pricingLockedAt={event.pricing_locked_at}
            onUpdate={fetchEvent}
          />
        )}

        {/* CONTAINER 2: After Party Check-In - Dark Theme */}
        <section className="px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black border border-primary/30 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <h3 className="font-display text-xl text-primary uppercase tracking-wide">After Party Check-In</h3>
              </div>

              {/* Scanner Error Display */}
              {scannerError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-base font-sans">
                  {scannerError}
                </div>
              )}

              {/* Scanner Area */}
              {isScanning ? (
                <div className="space-y-4">
                  <div id="qr-scanner" className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-black/50 min-h-[280px]" />
                  <Button variant="outline" onClick={stopScanner} className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5">
                    <X className="w-5 h-5 mr-2" />
                    Stop Scanning
                  </Button>
                </div>
              ) : showWalkInForm ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-base text-primary mb-2 font-sans font-medium">Name (optional)</label>
                    <Input
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="Walk-in guest name"
                      className="bg-black/50 border-2 border-primary/30 focus:border-primary text-foreground font-sans text-base py-5"
                    />
                  </div>
                  <div>
                    <label className="block text-base text-primary mb-2 font-sans font-bold">
                      Phone number (optional) — get a text when you enter
                    </label>
                    <Input
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      type="tel"
                      className="bg-black/50 border-2 border-primary/30 focus:border-primary text-foreground font-sans text-base py-5"
                    />
                    <p className="text-primary/80 font-sans font-semibold text-sm mt-2">
                      We ONLY use this to alert when the artist enters the After Party.
                      <br />
                      Number is not shared with artist or third parties.
                    </p>
                    <p className="text-primary/60 font-sans text-xs mt-1">
                      Msg & data rates may apply.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleWalkInSubmit}
                      disabled={isCheckingIn}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-base py-5"
                    >
                      {isCheckingIn ? "Adding..." : "Add Walk-In"}
                    </Button>
                    <Button variant="outline" onClick={() => { setShowWalkInForm(false); setWalkInPhone(""); }} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={startScanner} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-base py-5"
                    disabled={isExpired}
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Scan Pass QR Code
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWalkInsQR(true)} 
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5"
                    disabled={isExpired}
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Walk-Ins
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadPoster}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Print QR Access Poster
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/after-party/${eventId}/room?artist_token=${token}`)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5"
                  >
                    <PartyPopper className="w-5 h-5 mr-2" />
                    Artist Party Entrance
                  </Button>
                </div>
              )}

              {/* Hidden QR Canvas for PDF generation */}
              <div className="hidden">
                <QRCodeCanvas
                  id="merch-table-qr-canvas"
                  value={`${window.location.origin}/after-party/${eventId}`}
                  size={400}
                  level="H"
                  includeMargin={false}
                />
              </div>

              {/* Monitoring Row - Compact inline status */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary/20">
                <StatusCard icon={CheckCircle2} label="Checked In" value={checkedInCount} accent />
                <StatusCard icon={Users} label="In Room" value={checkedInCount} />
                <StatusCard icon={Clock} label="Time Left" value={timeLeft} />
              </div>
            </div>
          </div>
        </section>

        {/* CONTAINER 3: After Party Production - Yellow Container / Black Text */}
        <section className="px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-primary rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl text-primary-foreground uppercase tracking-wide">After Party Production</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchEvent} 
                  disabled={loading} 
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-sans text-base"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-base text-primary-foreground mb-2 font-sans font-medium">Pinned Message</label>
                  <Textarea
                    value={pinnedMessage}
                    onChange={(e) => setPinnedMessage(e.target.value)}
                    placeholder="Pin an announcement so fans see it first."
                    rows={3}
                    className="bg-black/90 border-2 border-primary-foreground/30 focus:border-primary-foreground text-foreground font-sans text-base"
                  />
                  <p className="text-primary-foreground/70 text-base mt-2 font-sans">
                    Pin an announcement so fans see it first.
                  </p>
                </div>

                <div>
                  <label className="block text-base text-primary-foreground mb-2 font-sans font-medium">Livestream URL</label>
                  <Input
                    value={livestreamUrl}
                    onChange={(e) => setLivestreamUrl(e.target.value)}
                    placeholder="Paste livestream link (optional)"
                    className="bg-black/90 border-2 border-primary-foreground/30 focus:border-primary-foreground text-foreground font-sans text-base py-5"
                  />
                </div>

                <div>
                  <label className="block text-base text-primary-foreground mb-2 font-sans font-medium">Buy Merch Link</label>
                  <Input
                    value={merchLink}
                    onChange={(e) => setMerchLink(e.target.value)}
                    placeholder="Link to merch (optional)"
                    className="bg-black/90 border-2 border-primary-foreground/30 focus:border-primary-foreground text-foreground font-sans text-base py-5"
                  />
                </div>

                <div>
                  <label className="block text-base text-primary-foreground mb-2 font-sans font-medium">Buy Music Link</label>
                  <Input
                    value={musicLink}
                    onChange={(e) => setMusicLink(e.target.value)}
                    placeholder="Link to music (optional)"
                    className="bg-black/90 border-2 border-primary-foreground/30 focus:border-primary-foreground text-foreground font-sans text-base py-5"
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={saving} 
                  className="bg-black text-primary hover:bg-black/90 font-sans text-lg py-6 w-full"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CONTAINER 4: Moderation - Dark Theme */}
        <section className="px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black border border-primary/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-xl text-primary uppercase tracking-wide">Moderation</h3>
                <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-base font-sans">
                  {messages.length} total
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="bg-primary/10 rounded-lg p-8 text-center border border-primary/30">
                  <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
                  <p className="text-primary font-sans font-medium text-lg mb-2">No messages yet</p>
                  <p className="text-primary/70 text-base font-sans">
                    Delete unwanted messages.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-start justify-between gap-4 p-4 bg-primary/10 rounded-lg border border-primary/30 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-base break-words font-sans">{msg.message || "(empty)"}</p>
                        <p className="text-base text-primary/60 mt-2 font-sans">
                          <span className={`${msg.role === 'artist' ? 'text-primary font-medium' : ''}`}>
                            {msg.role === 'artist' ? 'Artist' : 'Fan'}
                          </span>
                          {' · '}
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary/50 hover:text-destructive hover:bg-destructive/10 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CONTAINER 5: Educational Video - Dark Theme */}
        <section className="px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black border border-primary/30 rounded-xl p-6">
              <h3 className="font-display text-xl text-primary uppercase tracking-wide mb-6">
                How to Promote Your After Party
              </h3>
              <div className="w-full aspect-video rounded-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/6Q7AZCHm8OE?rel=0"
                  title="How to Promote Your After Party"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* Walk-In Pass Modal */}
        <Dialog open={!!walkInPassData} onOpenChange={(open) => !open && closeWalkInPassModal()}>
          <DialogContent className="sm:max-w-md bg-black border-primary">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-center text-primary">
                Walk-In Pass
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-6 py-4">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-sans font-medium text-center text-base">
                {walkInPassData?.displayName}
              </div>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <QRCodeSVG
                  value={getWalkInQRUrl()}
                  size={200}
                  level="H"
                />
              </div>
              
              <p className="text-primary/70 text-base font-sans text-center">
                Hand this to the fan to scan or screenshot
              </p>
              
              {/* Link Text */}
              <div className="w-full">
                <p className="text-base text-primary/60 mb-1 font-sans">Pass Link:</p>
                <p className="text-base text-primary break-all bg-primary/10 p-3 rounded-lg font-mono border border-primary/30">
                  {getWalkInPassUrl()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <Button onClick={handleCopyLink} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5">
                  {linkCopied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                  {linkCopied ? "Copied!" : "Copy Link"}
                </Button>
                <Button onClick={closeWalkInPassModal} className="flex-1 bg-primary text-primary-foreground text-base py-5">
                  Done
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Walk-Ins QR Modal - Shows QR for fans to scan */}
        <Dialog open={showWalkInsQR} onOpenChange={setShowWalkInsQR}>
          <DialogContent className="sm:max-w-md bg-black border-primary">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl text-center text-primary uppercase">
                Walk-Ins
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-6 py-6">
              {/* Large QR Code */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <QRCodeSVG
                  value={getWalkInsJoinUrl()}
                  size={280}
                  level="H"
                />
              </div>
              
              <p className="text-primary/80 text-base font-sans text-center">
                Fans scan to join the After Party
              </p>
              
              {/* Close Button */}
              <Button 
                onClick={() => setShowWalkInsQR(false)} 
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base py-5"
              >
                <X className="w-5 h-5 mr-2" />
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default ArtistEvent;
