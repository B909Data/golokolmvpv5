import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Music, Users, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAirtableEvent } from "@/hooks/useAirtableEvents";

const AfterpartyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: event, isLoading, error } = useAirtableEvent(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
            <Link to="/shows">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shows
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const attendancePercentage = event.capacity > 0 
    ? Math.round((event.attending / event.capacity) * 100) 
    : 0;

  const artists = Array.isArray(event.artists) ? event.artists : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/shows" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Shows
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Image */}
              <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <Music className="h-20 w-20 text-primary/30" />
                )}
              </div>

              {/* Event Info */}
              <div>
                {event.genre && (
                  <span className="inline-flex items-center rounded-full bg-accent/20 px-4 py-1 text-sm font-medium text-accent mb-4">
                    {event.genre}
                  </span>
                )}
                <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
                  {event.title}
                </h1>
                {event.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Artists */}
              {artists.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl text-foreground mb-4">PERFORMING ARTISTS</h2>
                  <div className="flex flex-wrap gap-3">
                    {artists.map((artist, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 border border-border"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Music className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{artist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details Card */}
              <div className="rounded-xl border border-border bg-card p-6 gradient-card">
                <h3 className="font-display text-xl text-foreground mb-4">EVENT DETAILS</h3>
                <div className="space-y-4">
                  {event.dateTime && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(event.dateTime).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.dateTime).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{event.venue}</p>
                      {event.address && <p className="text-sm text-muted-foreground">{event.address}</p>}
                    </div>
                  </div>
                  {event.capacity > 0 && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{event.attending} attending</p>
                        <p className="text-sm text-muted-foreground">of {event.capacity} capacity</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Capacity Bar */}
                {event.capacity > 0 && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="text-foreground font-medium">{attendancePercentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* RSVP Card */}
              <div className="rounded-xl border border-primary/50 bg-card p-6 gradient-card">
                <div className="flex items-center gap-2 mb-4">
                  <Ticket className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl text-foreground">RSVP</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Reserve your spot for this event. We'll send you a QR code for check-in.
                </p>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Your Name"
                    className="bg-secondary border-border"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="bg-secondary border-border"
                  />
                  <Button variant="hero" className="w-full">
                    RSVP NOW
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Free entry • No payment required
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AfterpartyDetail;
