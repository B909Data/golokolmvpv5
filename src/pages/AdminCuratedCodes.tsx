import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { KeyRound, RefreshCw, Plus, Copy, Trash2, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CuratedCode {
  id: string;
  code: string;
  is_used: boolean;
  used_by_email: string | null;
  used_at: string | null;
  created_at: string;
}

const AdminCuratedCodes = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [codes, setCodes] = useState<CuratedCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCodes = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-curated-codes?key=${key}`
      );
      if (error) throw error;
      setCodes(data?.codes || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) fetchCodes();
  }, [key]);

  const handleGenerate = async () => {
    if (!key) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-curated-codes?key=${key}`,
        { body: { action: "generate" } }
      );
      if (error) throw error;
      if (data?.code) {
        setCodes((prev) => [data.code, ...prev]);
        toast.success(`Code generated: ${data.code.code}`);
      }
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!key) return;
    try {
      const { error } = await supabase.functions.invoke(
        `admin-curated-codes?key=${key}`,
        { body: { action: "delete", id } }
      );
      if (error) throw error;
      setCodes((prev) => prev.filter((c) => c.id !== id));
      toast.success("Code deleted");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete code");
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <KeyRound className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">Curated Codes</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchCodes} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={handleGenerate} disabled={generating}>
                <Plus className="w-4 h-4 mr-2" />
                {generating ? "Generating..." : "Generate Code"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : codes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No codes yet. Generate one above.</p>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Code</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Used By</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Used At</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Created</th>
                    <th className="px-4 py-3 text-right text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-foreground">{c.code}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            c.is_used
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/20 text-primary"
                          }`}
                        >
                          {c.is_used ? "Used" : "Available"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{c.used_by_email || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.used_at ? new Date(c.used_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(c.code, c.id)}
                            className="h-8 w-8 p-0"
                          >
                            {copiedId === c.id ? (
                              <Check className="w-4 h-4 text-primary" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(c.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminCuratedCodes;
