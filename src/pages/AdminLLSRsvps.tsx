import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface GuestClaim {
  id: string;
  guest_name: string;
  guest_email: string;
  artist_name: string;
  checkin_status: string;
  claimed_at: string;
  checked_in_at: string | null;
}

const LLS_EVENTS = [
  { id: "ed9dc0d5-b974-43fa-b5c3-91e8763ccde7", label: "LLS 1 — Feb 15, 2026" },
  { id: "078ae183-c5ce-4f41-802c-91a2cf881d3e", label: "LLS 2 — Mar 15, 2026" },
  { id: "3a076338-5e05-4499-ac18-6b41f615c255", label: "LLS 3 — Apr 19, 2026" },
];

const AdminLLSRsvps = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [selectedEvent, setSelectedEvent] = useState(LLS_EVENTS[LLS_EVENTS.length - 1].id);
  const [claims, setClaims] = useState<GuestClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-list-rsvps?key=${encodeURIComponent(key)}&event_id=${encodeURIComponent(selectedEvent)}`;
      const res = await fetch(url, {
        headers: {
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch RSVPs");
      const json = await res.json();
      setClaims(json.claims || []);
    } catch (err) {
      console.error("Error fetching RSVPs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [key, selectedEvent]);

  // Compute artist counts
  const artistCounts: Record<string, number> = {};
  claims.forEach((c) => {
    artistCounts[c.artist_name] = (artistCounts[c.artist_name] || 0) + 1;
  });
  const sortedArtists = Object.entries(artistCounts).sort((a, b) => b[1] - a[1]);

  if (!key) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">Not authorized</h1>
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
        <div className="max-w-5xl mx-auto">
          <Link
            to={`/admin?key=${key}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              <h1 className="font-display text-2xl text-foreground">LLS RSVPs</h1>
            </div>
            <Button variant="outline" size="sm" onClick={fetchClaims} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Event Selector */}
          <div className="mb-6">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full max-w-sm bg-background border-2 border-muted-foreground/30">
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                {LLS_EVENTS.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artist Counts Summary */}
          {sortedArtists.length > 0 && (
            <div className="mb-6 p-4 border border-border/50 rounded-lg bg-card/30">
              <h2 className="font-display text-lg text-foreground mb-3">
                RSVPs by Artist — {claims.length} total
              </h2>
              <div className="flex flex-wrap gap-3">
                {sortedArtists.map(([artist, count]) => (
                  <div
                    key={artist}
                    className="px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-md text-sm"
                  >
                    <span className="font-semibold text-foreground">{artist}</span>
                    <span className="text-muted-foreground ml-2">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claims Table */}
          {loading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : claims.length === 0 ? (
            <p className="text-muted-foreground">No RSVPs for this event yet.</p>
          ) : (
            <div className="overflow-x-auto border border-border/50 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Supporting</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>RSVP Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">{claim.guest_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {claim.guest_email}
                      </TableCell>
                      <TableCell>{claim.artist_name}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            claim.checkin_status === "checked_in"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {claim.checkin_status === "checked_in" ? "Checked In" : "Not Checked In"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(claim.claimed_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AdminLLSRsvps;
