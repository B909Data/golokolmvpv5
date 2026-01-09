import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Ticket, RefreshCw, Copy, Check, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  event_id: string | null;
  used_at: string | null;
  used_by_email: string | null;
  created_at: string;
}

const AdminDiscountCodes = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("free");

  const fetchCodes = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("afterparty_discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) {
      fetchCodes();
    }
  }, [key]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-generate-discount-code", {
        body: { key, discount_type: selectedType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Generated code: ${data.code}`);
      fetchCodes();
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscountType = (type: string) => {
    switch (type) {
      case "50_percent":
        return "50% Off";
      case "free":
        return "Free";
      default:
        return type;
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Ticket className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">Discount Codes</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchCodes} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Generate Code Section */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 mb-8">
            <h2 className="font-display text-xl text-foreground mb-4">Generate New Code</h2>
            <div className="flex items-center gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50_percent">50% Off</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={generateCode} disabled={generating}>
                <Plus className="w-4 h-4 mr-2" />
                {generating ? "Generating..." : "Generate Code"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Codes are one-time use and apply to any After Party listing.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : codes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No discount codes yet.</p>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-card/50 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Code</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Discount</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Created</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                        <td className="px-4 py-3">
                          <code className="font-mono text-foreground bg-muted px-2 py-1 rounded">
                            {code.code}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            code.discount_type === "free"
                              ? "bg-primary/20 text-primary"
                              : "bg-accent/20 text-accent-foreground"
                          }`}>
                            {formatDiscountType(code.discount_type)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {code.used_at ? (
                            <div className="text-muted-foreground">
                              <span className="text-xs">Used by</span>
                              <br />
                              <span className="text-foreground text-xs">{code.used_by_email || "—"}</span>
                            </div>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground text-xs">
                          {new Date(code.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => copyCode(code.code)}
                            disabled={!!code.used_at}
                          >
                            {copiedCode === code.code ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminDiscountCodes;
