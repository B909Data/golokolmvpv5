import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FileText, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Signature {
  id: string;
  created_at: string;
  legal_name: string;
  artist_name: string;
  email: string;
  role: string | null;
  agreement_version: string;
  release_confirmed: boolean;
}

const AdminSignatures = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignatures = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-list-signatures?key=${key}`
      );
      if (error) throw error;
      setSignatures(data?.signatures || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load signatures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) fetchSignatures();
  }, [key]);

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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">Signed Agreements</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchSignatures} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : signatures.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No signed agreements yet.</p>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Date Signed</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Artist Name</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Legal Name</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Version</th>
                  </tr>
                </thead>
                <tbody>
                  {signatures.map((sig) => (
                    <tr key={sig.id} className="border-b border-border/30">
                      <td className="px-4 py-3 text-foreground">
                        {new Date(sig.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-foreground">{sig.artist_name}</td>
                      <td className="px-4 py-3 text-foreground">{sig.legal_name}</td>
                      <td className="px-4 py-3 text-foreground">{sig.email}</td>
                      <td className="px-4 py-3 text-foreground">{sig.role || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">
                          {sig.agreement_version}
                        </span>
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

export default AdminSignatures;
