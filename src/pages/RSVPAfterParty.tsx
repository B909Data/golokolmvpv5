import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RSVPAfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at, city, venue_name, ticket_url")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim() || !phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in your name and phone number.",
        variant: "destructive",
      });
      return;
    }

    if (!eventId) return;

    setIsSubmitting(true);

    try {
      const normalizedPhone = phone.trim();

      // Check for existing attendee by event_id + phone (deduplication)
      const { data: existingAttendee, error: checkError } = await supabase
        .from("attendees")
        .select("id, qr_token")
        .eq("event_id", eventId)
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAttendee) {
        // Already RSVP'd - resend SMS and show message
        const qrUrl = `${window.location.origin}/after-party/${eventId}/qr/${existingAttendee.qr_token}`;
        
        await supabase.functions.invoke("send-rsvp-sms", {
          body: {
            phone: normalizedPhone,
            eventTitle: event?.title || "After Party",
            qrUrl,
          },
        });

        // Store attendee info for this session
        localStorage.setItem(`attendee_${eventId}`, existingAttendee.id);
        localStorage.setItem(`attendee_qr_${eventId}`, existingAttendee.qr_token || "");

        toast({
          title: "You're already RSVP'd",
          description: "Check your texts for your QR code.",
        });

        navigate(`/after-party/${eventId}/rsvp/confirmed`);
        return;
      }

      // New RSVP - generate QR token and insert
      const qrToken = crypto.randomUUID();

      const { data: attendee, error: insertError } = await supabase
        .from("attendees")
        .insert({
          event_id: eventId,
          display_name: displayName.trim(),
          phone: normalizedPhone,
          checkin_method: "qr",
          qr_token: qrToken,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Send RSVP SMS with QR link
      const qrUrl = `${window.location.origin}/after-party/${eventId}/qr/${qrToken}`;
      
      await supabase.functions.invoke("send-rsvp-sms", {
        body: {
          phone: normalizedPhone,
          eventTitle: event?.title || "After Party",
          qrUrl,
        },
      });

      // Store attendee ID and qr_token for later use
      localStorage.setItem(`attendee_${eventId}`, attendee.id);
      localStorage.setItem(`attendee_qr_${eventId}`, qrToken);

      // Navigate to confirmation
      navigate(`/after-party/${eventId}/rsvp/confirmed`);
    } catch (error: any) {
      console.error("RSVP error:", error);
      toast({
        title: "RSVP failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Event not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-24 px-4">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              RSVP — {event.title}
            </h1>
            {event.city && (
              <p className="text-muted-foreground">{event.city}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll text you your QR code and event link.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "RSVP"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RSVPAfterParty;