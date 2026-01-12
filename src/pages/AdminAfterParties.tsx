import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Calendar, RefreshCw, Copy, Check, Users, DoorOpen, MessageCircle, Download, Pause, Play, Archive } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PUBLIC_BASE_URL = "https://golokol.app";

interface Event {
  id: string;
  title: string;
  artist_name: string | null;
  city: string | null;
  start_at: string;
  after_party_enabled: boolean;
  artist_access_token: string | null;
  rsvp_count: number;
  admin_state: "active" | "paused" | "archived";
}

const AdminAfterParties = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);
  const [openingControl, setOpeningControl] = useState<string | null>(null);
  const [updatingState, setUpdatingState] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(`admin-list-events?key=${key}`);
      if (error) throw error;
      setEvents(data?.events || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) {
      fetchEvents();
    }
  }, [key]);

  const getArtistControlLink = async (eventId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-get-artist-control-link?key=${key}&event_id=${eventId}`
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data.artist_control_url;
    } catch (err) {
      console.error("Get artist control link error:", err);
      toast.error("Failed to get artist control link");
      return null;
    }
  };

  const openArtistControl = async (eventId: string) => {
    setOpeningControl(eventId);
    const url = await getArtistControlLink(eventId);
    if (url) {
      window.open(url, "_blank");
    }
    setOpeningControl(null);
  };

  const copyArtistControlLink = async (eventId: string) => {
    const url = await getArtistControlLink(eventId);
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedId(eventId);
      toast.success("Artist control link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const copyPassLink = (eventId: string) => {
    const passUrl = `${PUBLIC_BASE_URL}/after-party/${eventId}/rsvp`;
    navigator.clipboard.writeText(passUrl);
    setCopiedPassId(eventId);
    toast.success("Pass link copied!");
    setTimeout(() => setCopiedPassId(null), 2000);
  };

  const updateEventState = async (eventId: string, newState: "active" | "paused" | "archived") => {
    setUpdatingState(eventId);
    try {
      const { data, error } = await supabase.functions.invoke(`admin-update-event-state?key=${key}`, {
        method: "POST",
        body: { event_id: eventId, admin_state: newState },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      // Update local state
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, admin_state: newState } : e))
      );
      toast.success(`Event ${newState === "active" ? "activated" : newState === "paused" ? "paused" : "archived"}`);
    } catch (err) {
      console.error("Update state error:", err);
      toast.error("Failed to update event state");
    } finally {
      setUpdatingState(null);
    }
  };

  const exportEventData = async (eventId: string) => {
    setExporting(eventId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-export-event-data?key=${key}&event_id=${eventId}`,
        { method: "GET" }
      );
      
      if (!response.ok) {
        throw new Error("Export failed");
      }
      
      const csvContent = await response.text();
      
      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `afterparty-${eventId}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("Export downloaded");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data");
    } finally {
      setExporting(null);
    }
  };

  if (!key) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Not authorized</h1>
            <p className="text-muted-foreground">You don't have access to this page.</p>
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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">After Parties</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchEvents} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No after parties yet.</p>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-card/50 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Title</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Artist</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">City</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">State</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">RSVPs</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                        <td className="px-4 py-3 text-foreground font-medium">{event.title}</td>
                        <td className="px-4 py-3 text-foreground">{event.artist_name || "—"}</td>
                        <td className="px-4 py-3 text-foreground">{event.city || "—"}</td>
                        <td className="px-4 py-3 text-foreground">
                          {new Date(event.start_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            event.admin_state === "active"
                              ? "bg-primary/20 text-primary"
                              : event.admin_state === "paused"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {event.admin_state === "active" ? "Active" : event.admin_state === "paused" ? "Paused" : "Archived"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-foreground">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {event.rsvp_count}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {/* Artist Control Room Actions */}
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => openArtistControl(event.id)}
                              disabled={openingControl === event.id}
                            >
                              {openingControl === event.id ? (
                                "..."
                              ) : (
                                <>
                                  <DoorOpen className="w-3 h-3 mr-1" />
                                  Open Control Room
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => copyArtistControlLink(event.id)}
                            >
                              {copiedId === event.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Control Link
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => copyPassLink(event.id)}
                            >
                              {copiedPassId === event.id ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 mr-1" />
                                  Copy Pass Link
                                </>
                              )}
                            </Button>
                            <a
                              href={`/after-party/${event.id}/room?admin=1`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-card/50 border border-border/50 rounded hover:bg-card transition-colors"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Room
                            </a>
                            
                            {/* State Management */}
                            {event.admin_state === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                                onClick={() => updateEventState(event.id, "paused")}
                                disabled={updatingState === event.id}
                              >
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </Button>
                            )}
                            {event.admin_state === "paused" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-primary/50 text-primary hover:bg-primary/10"
                                onClick={() => updateEventState(event.id, "active")}
                                disabled={updatingState === event.id}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Activate
                              </Button>
                            )}
                            {event.admin_state !== "archived" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-muted-foreground/50 text-muted-foreground hover:bg-muted/10"
                                onClick={() => updateEventState(event.id, "archived")}
                                disabled={updatingState === event.id}
                              >
                                <Archive className="w-3 h-3 mr-1" />
                                Archive
                              </Button>
                            )}
                            
                            {/* Export */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => exportEventData(event.id)}
                              disabled={exporting === event.id}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              {exporting === event.id ? "..." : "Export CSV"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminAfterParties;
