import { useState } from "react";
import { PartyPopper, Save, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  message: string | null;
  role: string;
  created_at: string;
}

interface AfterPartyTabProps {
  eventId: string;
  token: string;
  pinnedMessage: string;
  livestreamUrl: string;
  merchLink: string;
  musicLink: string;
  messages: Message[];
  onUpdate: () => void;
}

const AfterPartyTab = ({
  eventId,
  token,
  pinnedMessage: initialPinned,
  livestreamUrl: initialLivestream,
  merchLink: initialMerch,
  musicLink: initialMusic,
  messages,
  onUpdate,
}: AfterPartyTabProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(initialPinned);
  const [livestreamUrl, setLivestreamUrl] = useState(initialLivestream);
  const [merchLink, setMerchLink] = useState(initialMerch);
  const [musicLink, setMusicLink] = useState(initialMusic);
  const [localMessages, setLocalMessages] = useState(messages);

  const handleSave = async () => {
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
      onUpdate();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.functions.invoke("artist-delete-message", {
        body: { event_id: eventId, token, message_id: messageId },
      });
      if (error) throw error;
      setLocalMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message removed");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete");
    }
  };

  const handleEnterParty = () => {
    navigate(`/after-party/${eventId}/room?artist_token=${token}`);
  };

  return (
    <div className="space-y-6">
      {/* Primary CTA */}
      <Button
        onClick={handleEnterParty}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-base"
      >
        <PartyPopper className="w-5 h-5 mr-2" />
        Enter After Party (Chat Mode)
      </Button>

      {/* Room Settings */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h3 className="font-display text-lg text-primary uppercase tracking-tight">Room Settings</h3>

        {/* Pinned message */}
        <div>
          <label className="block text-sm text-foreground mb-2 font-sans font-medium">
            Pinned Message
          </label>
          <Textarea
            value={pinnedMessage}
            onChange={(e) => setPinnedMessage(e.target.value)}
            placeholder="Pin an announcement fans see first."
            rows={2}
            className="bg-background border-border resize-none"
          />
        </div>

        {/* Livestream URL */}
        <div>
          <label className="block text-sm text-foreground mb-2 font-sans font-medium">
            Livestream URL (optional)
          </label>
          <Input
            value={livestreamUrl}
            onChange={(e) => setLivestreamUrl(e.target.value)}
            placeholder="Paste livestream link"
            className="bg-background border-border"
          />
        </div>

        {/* Merch link */}
        <div>
          <label className="block text-sm text-foreground mb-2 font-sans font-medium">
            Buy Merch Link (optional)
          </label>
          <Input
            value={merchLink}
            onChange={(e) => setMerchLink(e.target.value)}
            placeholder="Link to merch"
            className="bg-background border-border"
          />
        </div>

        {/* Music link */}
        <div>
          <label className="block text-sm text-foreground mb-2 font-sans font-medium">
            Buy Music Link (optional)
          </label>
          <Input
            value={musicLink}
            onChange={(e) => setMusicLink(e.target.value)}
            placeholder="Link to music"
            className="bg-background border-border"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Moderation */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-primary uppercase tracking-tight">Moderation</h3>
          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-sans">
            {localMessages.length} messages
          </span>
        </div>

        {localMessages.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm font-sans">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {localMessages.slice(0, 10).map((msg) => (
              <div
                key={msg.id}
                className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-lg group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm break-words font-sans">{msg.message || "(empty)"}</p>
                  <p className="text-muted-foreground text-xs mt-1 font-sans">
                    {msg.role === "artist" ? "Artist" : "Fan"} ·{" "}
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100"
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
  );
};

export default AfterPartyTab;
