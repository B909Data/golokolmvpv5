import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Building2, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, Upload, Image, X } from "lucide-react";
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

interface Partner {
  id: string;
  name: string;
  type: "curator" | "venue";
  active: boolean;
  created_at: string;
  flyer_image_url?: string | null;
  flyer_updated_at?: string | null;
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];

const AdminPartners = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"curator" | "venue">("curator");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchPartners = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-list-partners?key=${key}`
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPartners(data?.partners || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) {
      fetchPartners();
    }
  }, [key]);

  const createPartner = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-partner", {
        body: { key, action: "create", name: newName.trim(), type: newType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${newType === "curator" ? "Curator" : "Venue"} created`);
      setNewName("");
      fetchPartners();
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create partner");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (partner: Partner) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-partner", {
        body: { key, action: "toggle", id: partner.id, active: !partner.active },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${partner.name} ${partner.active ? "deactivated" : "activated"}`);
      fetchPartners();
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update partner");
    }
  };

  const deletePartner = async (partner: Partner) => {
    if (!confirm(`Delete "${partner.name}"? This cannot be undone.`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-partner", {
        body: { key, action: "delete", id: partner.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${partner.name} deleted`);
      fetchPartners();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete partner");
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const handleFlyerUpload = async (partner: Partner, file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Please select a JPG or PNG image");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 3MB");
      return;
    }

    setUploadingId(partner.id);
    try {
      const base64 = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke("admin-manage-partner", {
        body: {
          key,
          action: "upload-flyer",
          id: partner.id,
          file_base64: base64,
          content_type: file.type,
          filename: file.name,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Flyer uploaded successfully");
      fetchPartners();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload flyer");
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemoveFlyer = async (partner: Partner) => {
    if (!confirm("Remove this flyer?")) return;

    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-partner", {
        body: { key, action: "remove-flyer", id: partner.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Flyer removed");
      fetchPartners();
    } catch (err) {
      console.error("Remove flyer error:", err);
      toast.error("Failed to remove flyer");
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

  const curators = partners.filter((p) => p.type === "curator");
  const venues = partners.filter((p) => p.type === "venue");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">Partners</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchPartners} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Add Partner Section */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 mb-8">
            <h2 className="font-display text-xl text-foreground mb-4">Add New Partner</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Partner name"
                className="flex-1"
              />
              <Select value={newType} onValueChange={(v) => setNewType(v as "curator" | "venue")}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curator">Curator / Series</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createPartner} disabled={creating || !newName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                {creating ? "Adding..." : "Add"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Partners appear in dropdowns on the Create After Party form.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Curators Section */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-3">Curators / Event Series</h3>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : curators.length === 0 ? (
              <p className="text-muted-foreground text-sm">No curators yet.</p>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-card/50 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Flyer</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curators.map((partner) => (
                      <tr key={partner.id} className="border-b border-border/30 hover:bg-card/30">
                        <td className="px-4 py-3 text-foreground font-medium">{partner.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            partner.active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {partner.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {/* Flyer column for curators */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {partner.flyer_image_url ? (
                              <div className="flex items-center gap-2">
                                <img
                                  src={partner.flyer_image_url}
                                  alt="Flyer"
                                  className="w-10 h-10 object-cover rounded border border-border"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveFlyer(partner)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png"
                                  className="hidden"
                                  ref={(el) => (fileInputRefs.current[partner.id] = el)}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFlyerUpload(partner, file);
                                    e.target.value = "";
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7"
                                  disabled={uploadingId === partner.id}
                                  onClick={() => fileInputRefs.current[partner.id]?.click()}
                                >
                                  {uploadingId === partner.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 mr-1" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => toggleActive(partner)}
                            >
                              {partner.active ? (
                                <ToggleRight className="w-4 h-4 text-green-400" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-destructive hover:text-destructive"
                              onClick={() => deletePartner(partner)}
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

          {/* Venues Section */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-3">Venues</h3>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : venues.length === 0 ? (
              <p className="text-muted-foreground text-sm">No venues yet.</p>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-card/50 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((partner) => (
                      <tr key={partner.id} className="border-b border-border/30 hover:bg-card/30">
                        <td className="px-4 py-3 text-foreground font-medium">{partner.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            partner.active
                              ? "bg-green-500/20 text-green-400"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {partner.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => toggleActive(partner)}
                            >
                              {partner.active ? (
                                <ToggleRight className="w-4 h-4 text-green-400" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-destructive hover:text-destructive"
                              onClick={() => deletePartner(partner)}
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdminPartners;