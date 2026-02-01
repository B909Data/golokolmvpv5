import { useState } from "react";
import { Settings, Save, Trash2, MessageSquare, RefreshCw, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import CollapsibleSection from "./CollapsibleSection";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  message: string | null;
  role: string;
  created_at: string;
}

interface RoomControlsSectionProps {
  eventId: string;
  token: string;
  pinnedMessage: string;
  livestreamUrl: string;
  merchLink: string;
  musicLink: string;
  messages: Message[];
  onUpdate: () => void;
}

const RoomControlsSection = ({
  eventId,
  token,
  pinnedMessage: initialPinned,
  livestreamUrl: initialLivestream,
  merchLink: initialMerch,
  musicLink: initialMusic,
  messages,
  onUpdate,
}: RoomControlsSectionProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  return (
    <CollapsibleSection
      title="Room Controls"
      icon={Settings}
      defaultOpen={!isMobile}
      variant="accent"
    >
      <div className="space-y-5">
        <p className="text-primary-foreground/80 font-sans text-sm">
          Shape what fans see in your After Party.
        </p>

        {/* Pinned message */}
        <div>
          <label className="block text-sm text-primary-foreground mb-1.5 font-sans font-medium">
            Pinned Message
          </label>
          <Textarea
            value={pinnedMessage}
            onChange={(e) => setPinnedMessage(e.target.value)}
            placeholder="Pin an announcement fans see first."
            rows={2}
            className="bg-black/90 border-primary-foreground/30 focus:border-primary-foreground text-foreground"
          />
        </div>

        {/* Livestream URL */}
        <div>
          <label className="block text-sm text-primary-foreground mb-1.5 font-sans font-medium">
            Livestream URL (optional)
          </label>
          <Input
            value={livestreamUrl}
            onChange={(e) => setLivestreamUrl(e.target.value)}
            placeholder="Paste livestream link"
            className="bg-black/90 border-primary-foreground/30 focus:border-primary-foreground text-foreground"
          />
        </div>

        {/* Merch link */}
        <div>
          <label className="block text-sm text-primary-foreground mb-1.5 font-sans font-medium">
            Buy Merch Link (optional)
          </label>
          <Input
            value={merchLink}
            onChange={(e) => setMerchLink(e.target.value)}
            placeholder="Link to merch"
            className="bg-black/90 border-primary-foreground/30 focus:border-primary-foreground text-foreground"
          />
        </div>

        {/* Music link */}
        <div>
          <label className="block text-sm text-primary-foreground mb-1.5 font-sans font-medium">
            Buy Music Link (optional)
          </label>
          <Input
            value={musicLink}
            onChange={(e) => setMusicLink(e.target.value)}
            placeholder="Link to music"
            className="bg-black/90 border-primary-foreground/30 focus:border-primary-foreground text-foreground"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-primary hover:bg-black/90 w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        {/* Artist Party Entrance */}
        <Button
          variant="outline"
          onClick={() => navigate(`/after-party/${eventId}/room?artist_token=${token}`)}
          className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
        >
          <PartyPopper className="w-4 h-4 mr-2" />
          Enter Party as Artist
        </Button>

        {/* Moderation */}
        <div className="border-t border-primary-foreground/20 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-primary-foreground font-sans font-medium text-sm uppercase tracking-wide">
              Moderation
            </p>
            <span className="bg-primary-foreground/20 text-primary-foreground px-2 py-0.5 rounded-full text-xs">
              {localMessages.length} messages
            </span>
          </div>

          {localMessages.length === 0 ? (
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <MessageSquare className="w-6 h-6 text-primary-foreground/50 mx-auto mb-2" />
              <p className="text-primary-foreground/70 text-sm">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {localMessages.slice(0, 10).map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start justify-between gap-3 p-3 bg-black/30 rounded-lg group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm break-words">{msg.message || "(empty)"}</p>
                    <p className="text-primary-foreground/50 text-xs mt-1">
                      {msg.role === "artist" ? "Artist" : "Fan"} ·{" "}
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-50 group-hover:opacity-100"
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
    </CollapsibleSection>
  );
};

export default RoomControlsSection;
