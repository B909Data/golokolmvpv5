import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Mic, Save, Trash2, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchEvent();
  }, [eventId, token]);

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

  if (!token || !authorized) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground">Loading...</p>
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
              <Mic className="w-8 h-8 text-primary" />
              <div>
                <h1 className="font-display text-3xl text-foreground">{event?.title}</h1>
                <p className="text-muted-foreground text-sm">
                  {event?.city} • {event?.start_at ? new Date(event.start_at).toLocaleDateString() : ""}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchEvent} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border/50 rounded-lg p-6 bg-card/30 space-y-6">
            <h2 className="font-display text-xl text-foreground">Event Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Pinned Message</label>
                <Textarea
                  value={pinnedMessage}
                  onChange={(e) => setPinnedMessage(e.target.value)}
                  placeholder="A message that will be pinned in the chat room..."
                  rows={3}
                  className="bg-card/50 border-border/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">YouTube URL</label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-card/50 border-border/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card/50 border-border/50"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Livestream URL</label>
                <Input
                  value={livestreamUrl}
                  onChange={(e) => setLivestreamUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-card/50 border-border/50"
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="border border-border/50 rounded-lg p-6 bg-card/30">
            <h2 className="font-display text-xl text-foreground mb-4">Chat Messages ({messages.length})</h2>

            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No messages yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start justify-between gap-4 p-3 bg-card/50 rounded-lg border border-border/30"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm break-words">{msg.message || "(empty)"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {msg.role} • {new Date(msg.created_at).toLocaleString()}
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

      <Footer />
    </div>
  );
};

export default ArtistEvent;
