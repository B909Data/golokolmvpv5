import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Music, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface VoteTally {
  artist_choice: string;
  vote_count: number;
}

const SESSION_INFO = {
  name: "Atlanta Spring 2026",
  city: "Atlanta",
  number: 1,
};

const AdminLLSVotes = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [votes, setVotes] = useState<VoteTally[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lls_votes" as any)
      .select("artist_choice");

    if (error) {
      console.error("Error fetching votes:", error);
      setLoading(false);
      return;
    }

    // Tally votes client-side since we can't do GROUP BY via SDK
    const tally: Record<string, number> = {};
    (data as any[])?.forEach((row: any) => {
      tally[row.artist_choice] = (tally[row.artist_choice] || 0) + 1;
    });

    const sorted = Object.entries(tally)
      .map(([artist_choice, vote_count]) => ({ artist_choice, vote_count }))
      .sort((a, b) => b.vote_count - a.vote_count);

    setVotes(sorted);
    setTotalVotes(sorted.reduce((sum, v) => sum + v.vote_count, 0));
    setLoading(false);
  };

  useEffect(() => {
    if (key) fetchVotes();
  }, [key]);

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to={`/admin?key=${key}`}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Music className="w-7 h-7 text-primary" />
              <h1 className="font-display text-2xl md:text-3xl text-foreground">LLS Votes</h1>
            </div>
            <Button variant="outline" size="sm" onClick={fetchVotes} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Session Card */}
          <div className="border border-border/50 rounded-lg bg-card/30 p-6 mb-6">
            <h2 className="font-display text-xl text-foreground mb-1">
              LLS #{SESSION_INFO.number} — {SESSION_INFO.name}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              City: {SESSION_INFO.city} · Total votes: {totalVotes}
            </p>

            {loading ? (
              <p className="text-muted-foreground text-sm py-4">Loading votes…</p>
            ) : votes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No votes yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead className="text-right w-32">Votes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votes.map((v, i) => (
                    <TableRow key={v.artist_choice}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium text-foreground">{v.artist_choice}</TableCell>
                      <TableCell className="text-right text-foreground">{v.vote_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminLLSVotes;
