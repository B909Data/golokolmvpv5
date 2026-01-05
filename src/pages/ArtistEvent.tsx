import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Lock, Save, Trash2, RefreshCw, QrCode, UserPlus, Users, X, Copy, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

interface Message {
  id: string;
  message: string | null;
  role: string;
  created_at: string;
  attendee_id: string;
}

const ArtistEvent = () => {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [event, setEvent] = useState<EventData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState(true);

  const [pinnedMessage, setPinnedMessage] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [livestreamUrl, setLivestreamUrl] = useState("");

  // Door check-in state
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  // Walk-in pass modal state
  const [walkInPassData, setWalkInPassData] = useState<{ qrToken: string; displayName: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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
      setYoutubeUrl(data.event?.youtube_url || "");
      setImageUrl(data.event?.image_url || "");
      setLivestreamUrl(data.event?.livestream_url || "");
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
          youtube_url: youtubeUrl,
          image_url: imageUrl,
          livestream_url: livestreamUrl,
        },
      });
      if (error) throw error;
      toast.success("Event updated");
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
      toast.success("Message deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete message");
    }
  };

  const startScanner = () => {
    // Reset error state
    setScannerError(null);
    setIsScanning(true);
    
    // Use setTimeout to ensure the DOM element is rendered before starting scanner
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("qr-scanner");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            // Stop scanner immediately after successful scan
            await scanner.stop();
            scannerRef.current = null;
            setIsScanning(false);
            
            // Extract qr_token from URL
            // Expected format: /after-party/:eventId/verify/:qrToken
            const match = decodedText.match(/\/after-party\/[^/]+\/verify\/([^/?]+)/);
            if (match && match[1]) {
              await handleQRCheckin(match[1]);
            } else {
              toast.error("Invalid QR code format");
            }
          },
          () => {} // Ignore scan errors
        );
      } catch (err: any) {
        console.error("Scanner error:", err);
        scannerRef.current = null;
        setIsScanning(false);
        
        // Handle specific error types
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
        toast.success(`Checked in: ${data.attendee.display_name || "Guest"}`);
        fetchCheckedInCount();
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
        },
      });

      if (error) throw error;

      toast.success(`Walk-in checked in: ${data.attendee.display_name || "Guest"}`);
      fetchCheckedInCount();
      setShowWalkInForm(false);
      setWalkInName("");

      // Show walk-in pass modal instead of navigating away
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

  const getWalkInVerifyUrl = () => {
    if (!walkInPassData || !eventId) return "";
    return `${window.location.origin}/after-party/${eventId}/verify/${walkInPassData.qrToken}`;
  };

  const handleCopyLink = async () => {
    const url = getWalkInPassUrl();
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const closeWalkInPassModal = () => {
    setWalkInPassData(null);
    setLinkCopied(false);
  };

  if (!token || !authorized) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Not authorized</h1>
            <p className="text-muted-foreground font-sans">You do not have access to this page.</p>
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
            <p className="text-muted-foreground font-sans">Loading...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl text-foreground">{event?.title}</h1>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-sans uppercase tracking-wide">
                    Private Link
                  </span>
                </div>
                <p className="text-muted-foreground text-sm font-sans">
                  {event?.city} · {event?.start_at ? new Date(event.start_at).toLocaleDateString() : ""}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchEvent} disabled={loading} className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-sans">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Door Check-In Section */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-primary rounded-xl p-6 bg-background space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-primary uppercase tracking-wide">Door Check-In</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="font-sans">{checkedInCount} checked in</span>
              </div>
            </div>

            {/* Scanner Error Display */}
            {scannerError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm font-sans">
                {scannerError}
              </div>
            )}

            {/* Scanner Area */}
            {isScanning ? (
              <div className="space-y-4">
                <div id="qr-scanner" className="w-full max-w-sm mx-auto rounded-lg overflow-hidden bg-muted/20 min-h-[280px]" />
                <Button variant="outline" onClick={stopScanner} className="w-full">
                  <X className="w-4 h-4 mr-2" />
                  Stop Scanning
                </Button>
              </div>
            ) : showWalkInForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-primary mb-2 font-sans font-medium">Name (optional)</label>
                  <Input
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="Walk-in guest name"
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleWalkInSubmit}
                    disabled={isCheckingIn}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isCheckingIn ? "Adding..." : "Add Walk-In"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowWalkInForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button onClick={startScanner} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR
                </Button>
                <Button variant="outline" onClick={() => setShowWalkInForm(true)} className="flex-1">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Walk-In
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-primary rounded-xl p-6 bg-background space-y-6">
            <h2 className="font-display text-xl text-primary uppercase tracking-wide">Event Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-primary mb-2 font-sans font-medium">Pinned Message</label>
                <Textarea
                  value={pinnedMessage}
                  onChange={(e) => setPinnedMessage(e.target.value)}
                  placeholder="A message that will be pinned in the chat room..."
                  rows={3}
                  className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                />
              </div>

              <div>
                <label className="block text-sm text-primary mb-2 font-sans font-medium">YouTube URL</label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                />
              </div>

              <div>
                <label className="block text-sm text-primary mb-2 font-sans font-medium">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                />
              </div>

              <div>
                <label className="block text-sm text-primary mb-2 font-sans font-medium">Livestream URL</label>
                <Input
                  value={livestreamUrl}
                  onChange={(e) => setLivestreamUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-sans">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="border-2 border-primary rounded-xl p-6 bg-background">
            <h2 className="font-display text-xl text-primary mb-4 uppercase tracking-wide">Chat Messages ({messages.length})</h2>

            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 font-sans">No messages yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start justify-between gap-4 p-3 bg-muted/20 rounded-lg border border-border/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm break-words font-sans">{msg.message || "(empty)"}</p>
                      <p className="text-xs text-muted-foreground mt-1 font-sans">
                        {msg.role} · {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Walk-In Pass Modal */}
      <Dialog open={!!walkInPassData} onOpenChange={(open) => !open && closeWalkInPassModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">
              Walk-In Pass: {walkInPassData?.displayName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG
                value={getWalkInVerifyUrl()}
                size={200}
                level="H"
              />
            </div>
            
            {/* Link Text */}
            <div className="w-full">
              <p className="text-xs text-muted-foreground mb-1 font-sans">Pass Link:</p>
              <p className="text-sm text-foreground break-all bg-muted/30 p-2 rounded font-mono">
                {getWalkInPassUrl()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <Button onClick={handleCopyLink} variant="outline" className="flex-1">
                {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {linkCopied ? "Copied!" : "Copy Link"}
              </Button>
              <Button onClick={closeWalkInPassModal} className="flex-1 bg-primary text-primary-foreground">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ArtistEvent;