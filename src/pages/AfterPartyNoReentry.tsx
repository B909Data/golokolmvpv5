import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PartyPopper, Phone } from "lucide-react";

const AfterPartyNoReentry = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const accessToken = searchParams.get("token") || "";

  const [phone, setPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  // Fetch attendee by access_token
  const { data: attendee } = useQuery({
    queryKey: ["no-reentry-attendee", accessToken],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("attendees")
        .select("id, display_name, event_id, phone, sms_opt_in")
        .eq("access_token", accessToken)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!accessToken,
  });

  // Fetch event for artist name
  const { data: event } = useQuery({
    queryKey: ["no-reentry-event", eventId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("events")
        .select("artist_name, title")
        .eq("id", eventId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const artistName = event?.artist_name || "the artist";
  const displayName = attendee?.display_name;

  const handleSavePhone = async () => {
    if (!phone.trim() || !attendee?.id) return;
    setPhoneSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("attendees")
        .update({ phone: phone.trim(), sms_opt_in: true } as any)
        .eq("id", attendee.id);
      if (error) throw error;
      setPhoneSaved(true);
      toast.success("We'll text you when " + artistName + " goes live!");
    } catch {
      toast.error("Couldn't save your number. You can still enter the party.");
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleEnterParty = () => {
    navigate(`/after-party/${eventId}/room?token=${accessToken}`);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[420px] flex flex-col items-center text-center space-y-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <PartyPopper className="w-10 h-10 text-primary" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary uppercase tracking-tight">
            You're In!
          </h1>
          <p className="text-muted-foreground font-sans text-base">
            No reentry allowed. See you inside.
          </p>
        </div>

        {/* Greeting */}
        <p className="text-foreground font-sans text-lg">
          {displayName
            ? `Hey ${displayName}, you're all set!`
            : "Hey there, you're all set!"}
        </p>

        {/* Phone opt-in */}
        {!phoneSaved && (
          <div className="w-full bg-muted rounded-xl p-5 space-y-3 text-left">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <label className="text-sm font-sans font-medium text-foreground">
                Get a text when {artistName} goes live
              </label>
            </div>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 555-5555"
              className="bg-background border-border"
            />
            <p className="text-muted-foreground text-xs font-sans">
              Optional — we'll send you one alert when the artist enters the party.
            </p>
            <Button
              variant="outline"
              onClick={handleSavePhone}
              disabled={!phone.trim() || phoneSaving}
              className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {phoneSaving ? "Saving…" : "Notify Me"}
            </Button>
          </div>
        )}

        {phoneSaved && (
          <div className="w-full bg-primary/10 border border-primary/30 rounded-xl p-4">
            <p className="text-primary font-sans text-sm font-medium">
              ✓ We'll text you when {artistName} goes live!
            </p>
          </div>
        )}

        {/* Enter Party CTA */}
        <Button
          onClick={handleEnterParty}
          className="w-full h-14 text-base font-display uppercase font-bold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Enter Party
        </Button>

        <p className="text-muted-foreground font-mono text-[11px] tracking-widest">
          Keep this tab open to stay in the party.
        </p>
      </div>
    </div>
  );
};

export default AfterPartyNoReentry;
