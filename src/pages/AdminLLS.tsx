import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Music, RefreshCw, ExternalLink, CheckCircle, XCircle, Plus, Copy, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GENRE_OPTIONS = [
  "Afrobeats", "Alternative", "Beats", "Blues", "Country", "EDM", "Emo", "Folk",
  "Funk", "Gospel", "Hardcore", "Hip-Hop", "House", "Indie", "Jazz", "Latin",
  "Metal", "Neo-Soul", "Pop", "Punk", "R&B", "Rave", "Reggae", "Rock", "Ska",
  "Spoken-Word", "Techno",
];

interface Submission {
  id: string;
  created_at: string;
  artist_name: string;
  song_title: string;
  contact_email: string;
  spotify_url: string;
  youtube_url: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  mp3_url: string | null;
  mp3_path: string | null;
  original_filename: string | null;
  payment_status: string | null;
  music_release_agreed: boolean;
  music_release_agreed_at: string | null;
  submission_type?: string;
  admin_status?: string | null;
  rejection_reason?: string | null;
  song_image_url?: string | null;
  short_bio?: string | null;
}

const STATUS_OPTIONS = ["Unreviewed", "Reviewed", "Shortlisted", "Selected"];

const REJECTION_REASONS = [
  "Violates our community standards",
  "Poor mix/master quality",
];

const AdminLLS = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const fetchSubmissions = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) fetchSubmissions();
  }, [key]);

  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  const handleStatusChange = async (status: string) => {
    if (!selectedId || !key) return;
    setSaving(true);
    try {
      const submission = submissions.find(s => s.id === selectedId);
      const { error } = await supabase.functions.invoke(`admin-update-submission?key=${key}`, {
        body: { id: selectedId, status, submission_type: submission?.submission_type || "general" },
      });
      if (error) throw error;
      setSubmissions((prev) => prev.map((s) => (s.id === selectedId ? { ...s, status } : s)));
      toast.success("Status updated");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleNotesChange = async (admin_notes: string) => {
    if (!selectedId || !key) return;
    setSaving(true);
    try {
      const submission = submissions.find(s => s.id === selectedId);
      const { error } = await supabase.functions.invoke(`admin-update-submission?key=${key}`, {
        body: { id: selectedId, admin_notes, submission_type: submission?.submission_type || "general" },
      });
      if (error) throw error;
      setSubmissions((prev) => prev.map((s) => (s.id === selectedId ? { ...s, admin_notes } : s)));
      toast.success("Notes saved");
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!key) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("lls_artist_submissions")
        .update({ admin_status: "approved" })
        .eq("id", id);
      if (error) throw error;
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, admin_status: "approved" } : s)));
      toast.success("Submission approved");
    } catch (err: any) {
      console.error("Approve error:", err);
      toast.error(err?.message || "Failed to approve");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!key || selectedReasons.length === 0) return;
    setSaving(true);
    try {
      const reason = selectedReasons.join(", ");
      const { error } = await (supabase as any)
        .from("lls_artist_submissions")
        .update({ admin_status: "rejected", rejection_reason: reason })
        .eq("id", id);
      if (error) throw error;
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, admin_status: "rejected", rejection_reason: reason } : s)));
      setRejectingId(null);
      setSelectedReasons([]);
      toast.success("Submission rejected");
    } catch (err: any) {
      console.error("Reject error:", err);
      toast.error(err?.message || "Failed to reject");
    } finally {
      setSaving(false);
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
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
              <Music className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">LLS Submissions</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-2 space-y-2">
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : submissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No submissions yet.</p>
              ) : (
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-card/50 border-b border-border/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Artist</th>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Song</th>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Type</th>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">MP3</th>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedId(sub.id)}
                          className={`border-b border-border/30 cursor-pointer hover:bg-card/30 transition-colors ${
                            selectedId === sub.id ? "bg-card/50" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-foreground">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-foreground">{sub.artist_name}</td>
                          <td className="px-4 py-3 text-foreground">{sub.song_title}</td>
                          <td className="px-4 py-3 text-foreground text-xs">
                            {sub.payment_status === "curated" ? "Curated" : "Paid"}
                          </td>
                          <td className="px-4 py-3">
                            {sub.mp3_url ? (
                              <a href={sub.mp3_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                                {sub.original_filename || "Download"}
                              </a>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                sub.admin_status === "approved"
                                  ? "bg-green-500/20 text-green-500"
                                  : sub.admin_status === "rejected"
                                  ? "bg-red-500/20 text-red-500"
                                  : sub.status === "Selected"
                                  ? "bg-primary/20 text-primary"
                                  : sub.status === "Shortlisted"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : sub.status === "Reviewed"
                                  ? "bg-blue-500/20 text-blue-500"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {sub.admin_status === "approved" ? "Approved" : sub.admin_status === "rejected" ? "Rejected" : sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                              {sub.admin_status !== "approved" && (
                                <button
                                  onClick={() => handleApprove(sub.id)}
                                  disabled={saving}
                                  className="p-1 rounded hover:bg-green-500/20 text-green-500 transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {sub.admin_status !== "rejected" && (
                                <button
                                  onClick={() => { setRejectingId(sub.id); setSelectedReasons([]); }}
                                  disabled={saving}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inline reject form */}
              {rejectingId && (
                <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5 space-y-3">
                  <p className="text-foreground text-sm font-medium">
                    Reject: {submissions.find(s => s.id === rejectingId)?.song_title}
                  </p>
                  {REJECTION_REASONS.map(reason => (
                    <label key={reason} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedReasons.includes(reason)}
                        onCheckedChange={() => toggleReason(reason)}
                      />
                      <span className="text-foreground text-sm">{reason}</span>
                    </label>
                  ))}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={saving || selectedReasons.length === 0}
                      onClick={() => handleReject(rejectingId)}
                    >
                      Confirm Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setRejectingId(null); setSelectedReasons([]); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Details Panel */}
            <div className="lg:col-span-1">
              {selectedSubmission ? (
                <div className="border border-border/50 rounded-lg p-6 space-y-6 bg-card/30">
                  {selectedSubmission.song_image_url && (
                    <img src={selectedSubmission.song_image_url} className="w-full rounded-lg object-cover aspect-square mb-4" />
                  )}
                  <div>
                    <h3 className="font-display text-xl text-foreground mb-1">
                      {selectedSubmission.song_title}
                    </h3>
                    <p className="text-muted-foreground">{selectedSubmission.artist_name}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Email:</span> {selectedSubmission.contact_email}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Submitted:</span>{" "}
                      {new Date(selectedSubmission.created_at).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Release Agreement:</span>{" "}
                      {selectedSubmission.music_release_agreed ? (
                        <span className="text-green-600 font-medium">
                          ✅ Signed{selectedSubmission.music_release_agreed_at
                            ? ` on ${new Date(selectedSubmission.music_release_agreed_at).toLocaleString()}`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">❌ Not signed</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedSubmission.mp3_url && (
                      <a href={selectedSubmission.mp3_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="w-4 h-4" />
                        🎵 {selectedSubmission.original_filename || "MP3 Download"}
                      </a>
                    )}
                    {selectedSubmission.spotify_url && selectedSubmission.spotify_url !== "curated-submission" && (
                      <a href={selectedSubmission.spotify_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="w-4 h-4" />Spotify
                      </a>
                    )}
                    {selectedSubmission.youtube_url && (
                      <a href={selectedSubmission.youtube_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                        <ExternalLink className="w-4 h-4" />YouTube
                      </a>
                    )}
                  </div>

                  {selectedSubmission.short_bio && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Artist Bio</p>
                      <p className="text-sm text-foreground">{selectedSubmission.short_bio}</p>
                    </div>
                  )}

                  {selectedSubmission.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Artist Notes</p>
                      <p className="text-sm text-foreground">{selectedSubmission.notes}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select value={selectedSubmission.status} onValueChange={handleStatusChange} disabled={saving}>
                      <SelectTrigger className="bg-card/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Admin Notes</p>
                    <Textarea
                      value={selectedSubmission.admin_notes || ""}
                      onChange={(e) => {
                        const newNotes = e.target.value;
                        setSubmissions((prev) =>
                          prev.map((s) => s.id === selectedId ? { ...s, admin_notes: newNotes } : s)
                        );
                      }}
                      onBlur={(e) => handleNotesChange(e.target.value)}
                      placeholder="Internal notes..."
                      rows={4}
                      className="bg-card/50 border-border/50"
                      disabled={saving}
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-border/50 rounded-lg p-6 text-center bg-card/30">
                  <p className="text-muted-foreground">Select a submission to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminLLS;
