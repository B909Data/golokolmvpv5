import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface City {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

const AdminCities = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key");

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchCities = async () => {
    if (!key) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `admin-list-cities?key=${key}`
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCities(data?.cities || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (key) {
      fetchCities();
    }
  }, [key]);

  const createCity = async () => {
    if (!newName.trim()) {
      toast.error("City name is required");
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-city", {
        body: { key, action: "create", name: newName.trim() },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("City created");
      setNewName("");
      fetchCities();
    } catch (err) {
      console.error("Create error:", err);
      toast.error("Failed to create city");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (city: City) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-city", {
        body: { key, action: "toggle", id: city.id, active: !city.active },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${city.name} ${city.active ? "deactivated" : "activated"}`);
      fetchCities();
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update city");
    }
  };

  const deleteCity = async (city: City) => {
    if (!confirm(`Delete "${city.name}"? This will remove the city from all partners. This cannot be undone.`)) return;

    try {
      const { data, error } = await supabase.functions.invoke("admin-manage-city", {
        body: { key, action: "delete", id: city.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`${city.name} deleted`);
      fetchCities();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete city");
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
              <MapPin className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl text-foreground">Cities</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/admin?key=${key}`}>
                <Button variant="ghost" size="sm">← Back</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={fetchCities} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Add City Section */}
          <div className="bg-card/50 border border-border/50 rounded-lg p-6 mb-8">
            <h2 className="font-display text-xl text-foreground mb-4">Add New City</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="City name (e.g., Atlanta)"
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && createCity()}
              />
              <Button onClick={createCity} disabled={creating || !newName.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                {creating ? "Adding..." : "Add City"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Cities appear in the Create After Party form and organize venues/curators.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : cities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No cities yet. Add one above.</p>
          ) : (
            <div className="border border-border/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-card/50 border-b border-border/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">City</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city) => (
                    <tr key={city.id} className="border-b border-border/30 hover:bg-card/30">
                      <td className="px-4 py-3 text-foreground font-medium">{city.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          city.active
                            ? "bg-green-500/20 text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {city.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => toggleActive(city)}
                          >
                            {city.active ? (
                              <ToggleRight className="w-4 h-4 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-destructive hover:text-destructive"
                            onClick={() => deleteCity(city)}
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

export default AdminCities;
