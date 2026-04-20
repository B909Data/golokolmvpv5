import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Music, RefreshCw, ExternalLink, CheckCircle, XCircle, Plus, Copy, X, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GENRE_OPTIONS = ["Hip Hop", "RnB", "Alternative", "Hardcore + Punk"];

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
  claim_code?: string | null;
}

const STATUS_OPTIONS = ["Unreviewed", "Reviewed", "Shortlisted", "Selected"];
const REJECTION_REASONS = ["Violates our community standards", "Poor mix/master quality"];

const AdminLLS = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addArtistName, setAddArtistName] = useState("");
  const [addSongTitle, setAddSongTitle] = useState("");
  const [addYoutubeUrl, setAddYoutubeUrl] = useState("");
  const [addGenre, setAddGenre] = useState("");
  const [addMp3File, setAddMp3File] = useState<File | null>(null);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [claimLink, setClaimLink] = useState<string | null>(null);
  const [editingYoutube, setEditingYoutube] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"submissions" | "analytics">("submissions");
  const [analytics, setAnalytics] = useState<{
    totalFans: number;
    fansPerStore: { store: string; count: number }[];
    totalSaves: number;
    topSongs: { artist_name: string; song_title: string; count: number }[];
    savesPerGenre: { genre: string; count: number }[];
    totalPoints: number;
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const { data: fans } = await (supabase as any)
        .from("fan_profiles")
        .select("fan_user_id, city");

      const { data: saves } = await (supabase as any)
        .from("lokol_scene_saves")
        .select("submission_id, artist_name, store_slug");
      const { data: submissions } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("id, artist_name, song_title, genre_style")
        .eq("admin_status", "approved");
      const { data: points } = await (supabase as any)
        .from("fan_profiles")
        .select("lokol_points");
      const totalFans = fans?.length || 0;
      const totalSaves = saves?.length || 0;
      const totalPoints = points?.reduce((sum: number, f: any) => sum + (f.lokol_points || 0), 0) || 0;
      const storeMap: Record<string, number> = {};
      saves?.forEach((s: any) => {
        const store = s.store_slug || "unknown";
        storeMap[store] = (storeMap[store] || 0) + 1;
      });
      const fansPerStore = Object.entries(storeMap).map(([store, count]) => ({ store, count })).sort((a, b) => b.count - a.count);
      const songMap: Record<string, { artist_name: string; song_title: string; count: number }> = {};
      saves?.forEach((s: any) => {
        if (!s.submission_id) return;
        const sub = submissions?.find((sub: any) => sub.id === s.submission_id);
        if (!sub) return;
        if (!songMap[s.submission_id]) {
          songMap[s.submission_id] = { artist_name: sub.artist_name, song_title: sub.song_title, count: 0 };
        }
        songMap[s.submission_id].count++;
      });
      const topSongs = Object.values(songMap).sort((a, b) => b.count - a.count).slice(0, 10);
      const genreMap: Record<string, number> = {};
      saves?.forEach((s: any) => {
        if (!s.submission_id) return;
        const sub = submissions?.find((sub: any) => sub.id === s.submission_id);
        if (!sub?.genre_style) return;
        genreMap[sub.genre_style] = (genreMap[sub.genre_style] || 0) + 1;
      });
      const savesPerGenre = Object.entries(genreMap).map(([genre, count]) => ({ genre, count })).sort((a, b) => b.count - a.count);
      setAnalytics({ totalFans, fansPerStore, totalSaves, topSongs, savesPerGenre, totalPoints });
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

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

  // When selected submission changes, sync youtube edit field
  const selectedSubmission = submissions.find((s) => s.id === selectedId);
  useEffect(() => {
    setEditingYoutube(selectedSubmission?.youtube_url || "");
  }, [selectedId]);

  const handleStatusChange = async (status: string) => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from("lls_artist_submissions").update({ status }).eq("id", selectedId);
      if (error) throw error;
      setSubmissions((prev) => prev.map((s) => (s.id === selectedId ? { ...s, status } : s)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleNotesChange = async (admin_notes: string) => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("lls_artist_submissions")
        .update({ admin_notes })
        .eq("id", selectedId);
      if (error) throw error;
      setSubmissions((prev) => prev.map((s) => (s.id === selectedId ? { ...s, admin_notes } : s)));
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: string) => {
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
      toast.error(err?.message || "Failed to approve");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (id: string) => {
    if (selectedReasons.length === 0) return;
    setSaving(true);
    try {
      const reason = selectedReasons.join(", ");
      const { error } = await (supabase as any)
        .from("lls_artist_submissions")
        .update({ admin_status: "rejected", rejection_reason: reason })
        .eq("id", id);
      if (error) throw error;
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, admin_status: "rejected", rejection_reason: reason } : s)),
      );
      setRejectingId(null);
      setSelectedReasons([]);
      toast.success("Submission rejected");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveYoutube = async () => {
    if (!selectedId) return;
    const val = editingYoutube.trim() || null;
    try {
      await (supabase as any).from("lls_artist_submissions").update({ youtube_url: val }).eq("id", selectedId);
      setSubmissions((prev) => prev.map((s) => (s.id === selectedId ? { ...s, youtube_url: val } : s)));
      toast.success("YouTube URL saved");
    } catch {
      toast.error("Failed to save YouTube URL");
    }
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) => (prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]));
  };

  const handleAddSong = async () => {
    if (!addArtistName.trim() || !addSongTitle.trim() || !addGenre || !addMp3File || !addImageFile) {
      toast.error("All fields are required");
      return;
    }
    if (addMp3File.size > 20 * 1024 * 1024) {
      toast.error("MP3 must be under 20MB");
      return;
    }
    if (addImageFile.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setAddSubmitting(true);
    try {
      const ts = Date.now();
      const claimCode = "GOLOKOL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const sanitizedMp3 = addMp3File.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const sanitizedImg = addImageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const mp3Path = `curated/${ts}-${sanitizedMp3}`;
      const imgPath = `curated/${ts}-${sanitizedImg}`;

      const { error: mp3Err } = await supabase.storage.from("station_submission_audio").upload(mp3Path, addMp3File);
      if (mp3Err) throw mp3Err;
      const { error: imgErr } = await supabase.storage.from("station_submission_images").upload(imgPath, addImageFile);
      if (imgErr) throw imgErr;

      const { data: mp3UrlData } = supabase.storage.from("station_submission_audio").getPublicUrl(mp3Path);
      const { data: imgUrlData } = supabase.storage.from("station_submission_images").getPublicUrl(imgPath);

      const { error: insertErr } = await (supabase as any).from("lls_artist_submissions").insert({
        artist_name: addArtistName.trim(),
        song_title: addSongTitle.trim(),
        youtube_url: addYoutubeUrl.trim() || null,
        genre_style: addGenre,
        city_market: "Atlanta",
        mp3_url: mp3UrlData.publicUrl,
        mp3_path: mp3Path,
        original_filename: addMp3File.name,
        song_image_url: imgUrlData.publicUrl,
        admin_status: "approved",
        payment_status: "curated",
        claim_code: claimCode,
        contact_email: "pending@golokol.app",
      });
      if (insertErr) throw insertErr;

      setClaimLink(`golokol.app/claim/${claimCode}`);
      setAddArtistName("");
      setAddSongTitle("");
      setAddYoutubeUrl("");
      setAddGenre("");
      setAddMp3File(null);
      setAddImageFile(null);
      toast.success("Song added successfully");
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add song");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleDeleteSong = async (id: string) => {
    if (!window.confirm("Remove this song from the station? This cannot be undone.")) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("lls_artist_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (selectedId === id) setSelectedId(null);
      toast.success("Song removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove song");
    } finally {
      setSaving(false);
    }
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
              <h1 className="font-display text-3xl text-foreground">LLS Admin</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <button
                onClick={() => setActiveTab("submissions")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "submissions" ? "bg-[#FFD600] text-black" : "bg-card/50 text-foreground border border-border/50"}`}
              >
                Submissions
              </button>
              <button
                onClick={() => { setActiveTab("analytics"); fetchAnalytics(); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === "analytics" ? "bg-[#FFD600] text-black" : "bg-card/50 text-foreground border border-border/50"}`}
              >
                Analytics
              </button>
              {activeTab === "submissions" && (
                <>
                  <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button size="sm" className="font-bold" style={{ backgroundColor: "#FFD600", color: "#000" }} onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Song
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {activeTab === "submissions" && (<>
          {/* Add Song Form */}
          {showAddForm && (
            <div className="border border-border/50 rounded-lg p-6 mb-6 bg-card/30 space-y-4">
              <h2 className="text-foreground font-bold text-lg">Add Song for Artist</h2>
              {claimLink && (
                <div className="rounded-lg p-4 space-y-2" style={{ backgroundColor: "#FFD600" }}>
                  <p className="text-sm font-bold text-black">Claim Link:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-black">{claimLink}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://${claimLink}`);
                        toast.success("Link copied!");
                      }}
                      className="p-1 rounded hover:bg-black/10"
                    >
                      <Copy className="w-4 h-4 text-black" />
                    </button>
                    <button onClick={() => setClaimLink(null)} className="p-1 rounded hover:bg-black/10 ml-auto">
                      <X className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Artist Name *</label>
                  <Input
                    value={addArtistName}
                    onChange={(e) => setAddArtistName(e.target.value)}
                    placeholder="Artist name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Song Title *</label>
                  <Input
                    value={addSongTitle}
                    onChange={(e) => setAddSongTitle(e.target.value)}
                    placeholder="Song title"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">YouTube Link (optional)</label>
                  <Input
                    value={addYoutubeUrl}
                    onChange={(e) => setAddYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Genre *</label>
                  <Select value={addGenre} onValueChange={setAddGenre}>
                    <SelectTrigger className="bg-card/50 border-border/50">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRE_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Upload MP3 * (max 20MB)</label>
                  <input
                    type="file"
                    accept=".mp3"
                    onChange={(e) => setAddMp3File(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-muted-foreground">Upload Song Image * (max 5MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAddImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  className="font-bold"
                  style={{ backgroundColor: "#FFD600", color: "#000" }}
                  onClick={handleAddSong}
                  disabled={addSubmitting}
                >
                  {addSubmitting ? "Adding..." : "Add Song"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setClaimLink(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

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
                        <th className="px-4 py-3 text-left text-muted-foreground font-medium">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr
                          key={sub.id}
                          onClick={() => setSelectedId(sub.id)}
                          className={`border-b border-border/30 cursor-pointer hover:bg-card/30 transition-colors ${selectedId === sub.id ? "bg-card/50" : ""}`}
                        >
                          <td className="px-4 py-3 text-foreground">{new Date(sub.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-foreground">{sub.artist_name}</td>
                          <td className="px-4 py-3 text-foreground">{sub.song_title}</td>
                          <td className="px-4 py-3 text-foreground text-xs">
                            {sub.payment_status === "curated" ? "Curated" : "Paid"}
                          </td>
                          <td className="px-4 py-3">
                            {sub.mp3_url ? (
                              <a
                                href={sub.mp3_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-xs"
                              >
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
                              {sub.admin_status === "approved"
                                ? "Approved"
                                : sub.admin_status === "rejected"
                                  ? "Rejected"
                                  : sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                                  onClick={() => {
                                    setRejectingId(sub.id);
                                    setSelectedReasons([]);
                                  }}
                                  disabled={saving}
                                  className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleDeleteSong(sub.id)}
                            disabled={saving}
                            className="p-1 rounded hover:bg-red-500/20 text-red-500/50 hover:text-red-500 transition-colors"
                            title="Remove song"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {rejectingId && (
                <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5 space-y-3">
                  <p className="text-foreground text-sm font-medium">
                    Reject: {submissions.find((s) => s.id === rejectingId)?.song_title}
                  </p>
                  {REJECTION_REASONS.map((reason) => (
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
                      onClick={() => {
                        setRejectingId(null);
                        setSelectedReasons([]);
                      }}
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
                <div className="border border-border/50 rounded-lg p-6 space-y-4 bg-card/30">
                  {selectedSubmission.song_image_url && (
                    <img
                      src={selectedSubmission.song_image_url}
                      className="w-full rounded-lg object-cover aspect-square"
                      alt=""
                    />
                  )}
                  <div>
                    <h3 className="font-display text-xl text-foreground mb-1">{selectedSubmission.song_title}</h3>
                    <p className="text-muted-foreground">{selectedSubmission.artist_name}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Email:</span> {selectedSubmission.contact_email}
                    </p>
                    {selectedSubmission.claim_code && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs">Claim Code:</p>
                        <p className="text-foreground font-mono text-sm">{selectedSubmission.claim_code}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-foreground text-sm">golokol.app/claim/{selectedSubmission.claim_code}</p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`golokol.app/claim/${selectedSubmission.claim_code}`);
                              toast.success("Link copied!");
                            }}
                            className="p-1 rounded hover:bg-primary/20 transition-colors"
                            title="Copy Link"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Submitted:</span>{" "}
                      {new Date(selectedSubmission.created_at).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-foreground">Release Agreement:</span>{" "}
                      {selectedSubmission.music_release_agreed ? (
                        <span className="text-green-600 font-medium">✅ Signed</span>
                      ) : (
                        <span className="text-red-500 font-medium">❌ Not signed</span>
                      )}
                    </p>
                  </div>

                  {/* MP3 link */}
                  {selectedSubmission.mp3_url && (
                    <a
                      href={selectedSubmission.mp3_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      🎵 {selectedSubmission.original_filename || "MP3 Download"}
                    </a>
                  )}

                  {/* YouTube URL — editable */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">YouTube URL</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingYoutube}
                        onChange={(e) => setEditingYoutube(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="flex-1 text-xs px-2 py-1.5 rounded bg-card/50 border border-border/50 text-foreground focus:outline-none focus:border-primary"
                      />
                      <button
                        onClick={handleSaveYoutube}
                        className="px-2 py-1.5 rounded text-xs font-bold"
                        style={{ backgroundColor: "#FFD600", color: "#000" }}
                      >
                        Save
                      </button>
                    </div>
                    {editingYoutube && (
                      <a
                        href={editingYoutube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Preview
                      </a>
                    )}
                  </div>

                  {/* Short bio */}
                  {selectedSubmission.short_bio && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Artist Bio</p>
                      <p className="text-sm text-foreground">{selectedSubmission.short_bio}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select value={selectedSubmission.status} onValueChange={handleStatusChange} disabled={saving}>
                      <SelectTrigger className="bg-card/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Admin Notes</p>
                    <Textarea
                      value={selectedSubmission.admin_notes || ""}
                      onChange={(e) => {
                        const newNotes = e.target.value;
                        setSubmissions((prev) =>
                          prev.map((s) => (s.id === selectedId ? { ...s, admin_notes: newNotes } : s)),
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
          </>)}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <p className="text-muted-foreground text-center py-16">Loading analytics...</p>
              ) : !analytics ? (
                <p className="text-muted-foreground text-center py-16">No data yet.</p>
              ) : (
                <>
                  {/* Top stat cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Fans", value: analytics.totalFans },
                      { label: "Total Saves", value: analytics.totalSaves },
                      { label: "Points Distributed", value: analytics.totalPoints },
                      { label: "Songs on Station", value: submissions.filter(s => s.admin_status === "approved").length },
                    ].map(stat => (
                      <div key={stat.label} className="border border-border/50 rounded-lg p-4 bg-card/30 text-center">
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Saves per store */}
                    <div className="border border-border/50 rounded-lg p-4 bg-card/30">
                      <h3 className="font-bold text-foreground mb-3">Saves by Store</h3>
                      {analytics.fansPerStore.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No data yet.</p>
                      ) : analytics.fansPerStore.map(s => (
                        <div key={s.store} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                          <span className="text-sm text-foreground capitalize">{s.store.replace(/-/g, " ")}</span>
                          <span className="text-sm font-bold" style={{ color: "#FFD600" }}>{s.count}</span>
                        </div>
                      ))}
                    </div>
                    {/* Saves per genre */}
                    <div className="border border-border/50 rounded-lg p-4 bg-card/30">
                      <h3 className="font-bold text-foreground mb-3">Saves by Genre</h3>
                      {analytics.savesPerGenre.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No data yet.</p>
                      ) : analytics.savesPerGenre.map(g => (
                        <div key={g.genre} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                          <span className="text-sm text-foreground">{g.genre}</span>
                          <span className="text-sm font-bold" style={{ color: "#FFD600" }}>{g.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Top saved songs */}
                  <div className="border border-border/50 rounded-lg p-4 bg-card/30">
                    <h3 className="font-bold text-foreground mb-3">Top Saved Songs</h3>
                    {analytics.topSongs.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No saves yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/30">
                            <th className="text-left py-2 text-muted-foreground font-medium">#</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Artist</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Song</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Saves</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.topSongs.map((song, i) => (
                            <tr key={i} className="border-b border-border/20 last:border-0">
                              <td className="py-2 text-muted-foreground">{i + 1}</td>
                              <td className="py-2 text-foreground">{song.artist_name}</td>
                              <td className="py-2 text-foreground">{song.song_title}</td>
                              <td className="py-2 font-bold" style={{ color: "#FFD600" }}>{song.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminLLS;
