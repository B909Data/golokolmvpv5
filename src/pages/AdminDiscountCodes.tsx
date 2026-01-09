import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Ticket, RefreshCw, Copy, Check, Plus, Download, Building2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Partner {
  id: string;
  name: string;
  type: "curator" | "venue";
}

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  event_id: string | null;
  partner_id: string | null;
  month_scope: string | null;
  expires_at: string | null;
  used_at: string | null;
  used_by_email: string | null;
  created_at: string;
}

const MONTHLY_CAPS = {
  curator: 20,
  venue: 50,
};

const AdminDiscountCodes = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // General code generation
  const [selectedType, setSelectedType] = useState<string>("free");
  
  // Partner code generation
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [codeCount, setCodeCount] = useState<number>(5);
  const [partnerCodeUsage, setPartnerCodeUsage] = useState<{ used: number; cap: number } | null>(null);

  // Generate month options (current month + next 2 months)
  const getMonthOptions = () => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      options.push({ value, label });
    }
    return options;
  };

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("id, name, type")
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      setPartners((data as Partner[]) || []);
    } catch (err) {
      console.error("Fetch partners error:", err);
    }
  };

  const fetchCodes = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("afterparty_discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCodes((data as DiscountCode[]) || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load discount codes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerUsage = async (partnerId: string, monthScope: string) => {
    if (!partnerId || !monthScope) {
      setPartnerCodeUsage(null);
      return;
    }
    
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    const { count, error } = await supabase
      .from("afterparty_discount_codes")
      .select("*", { count: "exact", head: true })
      .eq("partner_id", partnerId)
      .eq("month_scope", monthScope);

    if (!error) {
      setPartnerCodeUsage({
        used: count || 0,
        cap: MONTHLY_CAPS[partner.type],
      });
    }
  };

  useEffect(() => {
    if (key) {
      fetchCodes();
      fetchPartners();
    }
  }, [key]);

  useEffect(() => {
    if (selectedPartnerId && selectedMonth) {
      fetchPartnerUsage(selectedPartnerId, selectedMonth);
    } else {
      setPartnerCodeUsage(null);
    }
  }, [selectedPartnerId, selectedMonth, partners]);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-generate-discount-code", {
        body: { key, discount_type: selectedType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Generated code: ${data.codes[0]?.code}`);
      fetchCodes();
    } catch (err) {
      console.error("Generate error:", err);
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const generatePartnerCodes = async () => {
    if (!selectedPartnerId || !selectedMonth) {
      toast.error("Please select a partner and month");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-generate-discount-code", {
        body: { 
          key, 
          discount_type: "free",
          partner_id: selectedPartnerId,
          month_scope: selectedMonth,
          count: codeCount
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Generated ${data.count} codes`);
      fetchCodes();
      fetchPartnerUsage(selectedPartnerId, selectedMonth);
    } catch (err: unknown) {
      console.error("Generate error:", err);
      const message = err instanceof Error ? err.message : "Failed to generate codes";
      toast.error(message);
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

  const exportPartnerCodes = () => {
    if (!selectedPartnerId || !selectedMonth) return;
    
    const partnerCodes = codes.filter(
      c => c.partner_id === selectedPartnerId && c.month_scope === selectedMonth && !c.used_at
    );
    
    if (partnerCodes.length === 0) {
      toast.error("No unused codes to export");
      return;
    }

    const partner = partners.find(p => p.id === selectedPartnerId);
    const csvContent = partnerCodes.map(c => c.code).join("\n");
    const blob = new Blob([csvContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${partner?.name || "partner"}-${selectedMonth}-codes.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${partnerCodes.length} codes`);
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

  const getPartnerName = (partnerId: string | null) => {
    if (!partnerId) return null;
    return partners.find(p => p.id === partnerId)?.name || "Unknown";
  };

  // Filter codes based on active tab
  const generalCodes = codes.filter(c => !c.partner_id);
  const partnerCodes = codes.filter(c => c.partner_id);
  const filteredPartnerCodes = selectedPartnerId && selectedMonth
    ? partnerCodes.filter(c => c.partner_id === selectedPartnerId && c.month_scope === selectedMonth)
    : partnerCodes;

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

          <Tabs defaultValue="partner" className="space-y-6">
            <TabsList className="bg-card/50">
              <TabsTrigger value="partner" className="gap-2">
                <Building2 className="w-4 h-4" />
                Partner Codes
              </TabsTrigger>
              <TabsTrigger value="general" className="gap-2">
                <Ticket className="w-4 h-4" />
                General Codes
              </TabsTrigger>
            </TabsList>

            {/* Partner Codes Tab */}
            <TabsContent value="partner" className="space-y-6">
              <div className="bg-card/50 border border-border/50 rounded-lg p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Generate Partner Codes</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Partner</label>
                    <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select partner..." />
                      </SelectTrigger>
                      <SelectContent>
                        {partners.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Month</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getMonthOptions().map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Count</label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={codeCount}
                      onChange={(e) => setCodeCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <Button 
                      onClick={generatePartnerCodes} 
                      disabled={generating || !selectedPartnerId || !selectedMonth}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {generating ? "Generating..." : `Generate ${codeCount}`}
                    </Button>
                  </div>
                </div>

                {partnerCodeUsage && (
                  <div className="flex items-center justify-between bg-muted/30 rounded px-4 py-2">
                    <span className="text-sm text-muted-foreground">
                      Monthly usage: <span className="text-foreground font-medium">{partnerCodeUsage.used}</span> / {partnerCodeUsage.cap} codes
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {partnerCodeUsage.cap - partnerCodeUsage.used} remaining
                    </span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Curators: 20 codes/month • Venues: 50 codes/month • All partner codes are "Free" (100% off)
                </p>
              </div>

              {/* Export button */}
              {selectedPartnerId && selectedMonth && filteredPartnerCodes.length > 0 && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={exportPartnerCodes}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Unused Codes
                  </Button>
                </div>
              )}

              {/* Partner codes table */}
              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : filteredPartnerCodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {selectedPartnerId && selectedMonth 
                    ? "No codes for this partner/month yet." 
                    : "Select a partner and month to view codes."}
                </p>
              ) : (
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-card/50 border-b border-border/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Code</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Partner</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Month</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Redeemed</th>
                          <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPartnerCodes.map((code) => (
                          <tr key={code.id} className="border-b border-border/30 hover:bg-card/30 transition-colors">
                            <td className="px-4 py-3">
                              <code className="font-mono text-foreground bg-muted px-2 py-1 rounded">
                                {code.code}
                              </code>
                            </td>
                            <td className="px-4 py-3 text-foreground text-xs">
                              {getPartnerName(code.partner_id)}
                            </td>
                            <td className="px-4 py-3 text-foreground text-xs">
                              {code.month_scope || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {code.used_at ? (
                                <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                                  Used
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                                  Available
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {code.used_at ? (
                                <div className="text-xs space-y-0.5">
                                  <div className="text-foreground">{code.used_by_email || "—"}</div>
                                  <div className="text-muted-foreground">
                                    {new Date(code.used_at).toLocaleDateString()}
                                  </div>
                                  {code.event_id && (
                                    <div className="text-muted-foreground truncate max-w-[120px]" title={code.event_id}>
                                      Event: {code.event_id.slice(0, 8)}...
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
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
            </TabsContent>

            {/* General Codes Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="bg-card/50 border border-border/50 rounded-lg p-6">
                <h2 className="font-display text-xl text-foreground mb-4">Generate General Code</h2>
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
                  General codes are one-time use and apply to any After Party listing.
                </p>
              </div>

              {loading ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : generalCodes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No general discount codes yet.</p>
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
                        {generalCodes.map((code) => (
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
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminDiscountCodes;
