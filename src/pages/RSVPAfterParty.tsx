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
import AfterPartyCard from "@/components/AfterPartyCard";
import { CheckCircle } from "lucide-react";

const RSVPAfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) throw new Error("No event ID");
      const { data, error } = await supabase
        .from("events")
        .select("id, title, start_at, city, venue_name, ticket_url, artist_name, genres, youtube_url, image_url")
        .eq("id", eventId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });

  const handleRsvpClick = () => {
    setShowForm(true);
    // Scroll to form after state update
    setTimeout(() => {
      document.getElementById("rsvp-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventId) return;

    setIsSubmitting(true);

    try {
      // Generate QR token client-side
      const qrToken = crypto.randomUUID();

      const { data: attendee, error: insertError } = await supabase
        .from("attendees")
        .insert({
          event_id: eventId,
          display_name: displayName.trim() || null,
          checkin_method: "qr",
          qr_token: qrToken,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Store attendee ID and qr_token for later use
      localStorage.setItem(`attendee_${eventId}`, attendee.id);
      localStorage.setItem(`attendee_qr_${eventId}`, qrToken);

      // Navigate to pass page with token
      navigate(`/after-party/${eventId}/pass?token=${qrToken}`);
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
          <p className="text-muted-foreground font-sans">Loading...</p>
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
          <p className="text-muted-foreground font-sans">Event not found.</p>
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
          {/* Hero / Intro Section */}
          <div className="text-center mb-10">
            {/* Primary Header - Two-color emphasis */}
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase mb-4">
              <span className="text-foreground">{event.artist_name || event.title} </span>
              <span className="text-primary">AFTER PARTY</span>
            </h1>
            
            {/* Subcaption */}
            <p className="text-muted-foreground text-lg font-sans mb-8">
              Find me on GoLokol after my next show.
            </p>
            
          {/* Value Bullets */}
            <div className="text-left space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-foreground font-sans">
                  RSVP to get your digital pass.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-foreground font-sans">
                  Show this to band at merch table to get checked in.
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <p className="text-foreground font-sans">
                  Get access to a private fan chat. It lasts 24 hours, then disappears.
                </p>
              </div>
            </div>
          </div>

          {/* RSVP Card Section */}
          <div className="mb-8">
            <AfterPartyCard
              id={event.id}
              title={event.title}
              artistName={event.artist_name}
              startAt={event.start_at}
              city={event.city}
              genres={event.genres}
              youtubeUrl={event.youtube_url}
              imageUrl={event.image_url}
              showRsvpButton={!showForm}
              onRsvpClick={handleRsvpClick}
            />
          </div>

          {/* RSVP Form - Shows after clicking RSVP on card */}
          {showForm && (
            <div id="rsvp-form" className="rounded-xl border-2 border-primary bg-background p-6">
              <h2 className="font-display text-xl text-primary mb-4 uppercase">Complete Your RSVP</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-foreground font-sans">Your Name (optional)</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-background border-2 border-muted-foreground/30 focus:border-primary text-foreground font-sans"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-sans"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Getting your pass..." : "Get My Pass"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RSVPAfterParty;
