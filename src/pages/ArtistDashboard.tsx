import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

interface Submission {
  song_title: string;
  admin_status: string | null;
  rejection_reason: string | null;
}

const ArtistDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile setup overlay state
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayFirstName, setOverlayFirstName] = useState("");
  const [overlayArtistName, setOverlayArtistName] = useState("");
  const [overlayPhotoFile, setOverlayPhotoFile] = useState<File | null>(null);
  const [overlayPhotoPreview, setOverlayPhotoPreview] = useState<string | null>(null);
  const [overlaySaving, setOverlaySaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/artist/signup", { replace: true }); return; }

      setUserEmail(session.user.email ?? null);
      setUserId(session.user.id);

      // Handle pending profile from Google OAuth signup
      const pendingProfile = localStorage.getItem("pending_profile");
      if (pendingProfile) {
        try {
          const profileData = JSON.parse(pendingProfile);
          await supabase.auth.updateUser({ data: profileData });
          localStorage.removeItem("pending_profile");
        } catch {
          localStorage.removeItem("pending_profile");
        }
      }

      // Re-fetch session after potential update
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const meta = freshSession?.user?.user_metadata ?? {};

      const fn = meta.first_name || null;
      const an = meta.artist_name || null;
      const piu = meta.profile_image_url || null;

      setFirstName(fn);
      setArtistName(an);
      setProfileImageUrl(piu);

      // Check if profile is complete
      if (!fn || !an || !piu) {
        setShowOverlay(true);
        // Pre-fill from metadata if partially complete
        if (fn) setOverlayFirstName(fn);
        if (an) setOverlayArtistName(an);
      }

      // Fetch all submissions
      const { data } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("song_title, admin_status, rejection_reason")
        .eq("artist_user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setSubmissions(data);
      }

      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleOverlayPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Please select an image file.", variant: "destructive" }); return; }
    if (file.size > 3 * 1024 * 1024) { toast({ title: "Image must be under 3MB.", variant: "destructive" }); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      if (img.width < 200 || img.height < 200) { toast({ title: "Image must be at least 200×200px.", variant: "destructive" }); URL.revokeObjectURL(url); return; }
      const ratio = img.width / img.height;
      if (ratio < 0.9 || ratio > 1.1) { toast({ title: "Image should be square (1:1 ratio).", variant: "destructive" }); URL.revokeObjectURL(url); return; }
      setOverlayPhotoFile(file);
      setOverlayPhotoPreview(url);
    };
    img.src = url;
  };

  const handleSaveProfile = async () => {
    if (!overlayFirstName.trim()) { toast({ title: "First Name is required.", variant: "destructive" }); return; }
    if (!overlayArtistName.trim()) { toast({ title: "Artist Name is required.", variant: "destructive" }); return; }
    if (!overlayPhotoFile && !profileImageUrl) { toast({ title: "Profile photo is required.", variant: "destructive" }); return; }
    if (!userId) return;

    setOverlaySaving(true);
    try {
      let publicUrl = profileImageUrl;

      if (overlayPhotoFile) {
        const ext = overlayPhotoFile.name.split(".").pop() || "jpg";
        const path = `${userId}/profile.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("artist-profiles").upload(path, overlayPhotoFile, { contentType: overlayPhotoFile.type, upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("artist-profiles").getPublicUrl(path);
        publicUrl = urlData.publicUrl;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: overlayFirstName.trim(),
          artist_name: overlayArtistName.trim(),
          profile_image_url: publicUrl,
        },
      });
      if (error) throw error;

      setFirstName(overlayFirstName.trim());
      setArtistName(overlayArtistName.trim());
      setProfileImageUrl(publicUrl);
      setShowOverlay(false);
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setOverlaySaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/artist/signup", { replace: true });
  };

  const renderSubmissionCard = (sub: Submission, idx: number) => {
    const { admin_status, rejection_reason, song_title } = sub;

    let badge: React.ReactNode;
    let extra: React.ReactNode = null;

    if (admin_status === "approved") {
      badge = <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-black whitespace-nowrap">Added to Platform</span>;
      extra = <p className="text-white/70 text-sm font-sans mt-1">Your song is now being discovered at our participating stores in Atlanta. Your free month trial begins today.</p>;
    } else if (admin_status === "rejected") {
      badge = <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white whitespace-nowrap">Not Accepted</span>;
      extra = (
        <>
          {rejection_reason && <p className="text-white/70 text-sm font-sans mt-1">{rejection_reason}</p>}
          <p className="text-white/50 text-xs font-sans mt-1">Feel free to submit another song.</p>
        </>
      );
    } else {
      badge = <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFD600] text-black whitespace-nowrap">Pending Review</span>;
      extra = <p className="text-white/70 text-sm font-sans mt-1">We'll be in touch soon.</p>;
    }

    return (
      <div key={idx} className="rounded-xl bg-[#1a1a1a] p-4 mb-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-white font-bold text-base font-sans">{song_title}</p>
          {badge}
        </div>
        {extra}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-white/50 font-sans">Loading...</div>
      </div>
    );
  }

  // Profile setup overlay
  if (showOverlay) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img src={golokolLogo} alt="GoLokol" className="h-10 w-10 mx-auto mb-6" />
            <h1 className="text-white font-bold text-2xl font-display">Set Up Your Profile</h1>
            <p className="text-white/70 text-sm font-sans mt-2">This is how fans and GoLokol will know you.</p>
          </div>

          {/* Photo upload */}
          <div className="flex flex-col items-center space-y-3">
            <div
              className="w-24 h-24 rounded-full bg-[#1a1a1a] border-2 border-white/20 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {overlayPhotoPreview ? (
                <img src={overlayPhotoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-white/40" />
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleOverlayPhotoSelect} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-white/70 text-sm font-sans underline"
            >
              Add Photo
            </button>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-sm font-sans">First Name *</Label>
              <Input
                value={overlayFirstName}
                onChange={e => setOverlayFirstName(e.target.value)}
                className="h-12 text-base font-sans bg-[#1a1a1a] text-white border-white/20 placeholder:text-white/40"
                placeholder="Your first name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white text-sm font-sans">Artist Name *</Label>
              <Input
                value={overlayArtistName}
                onChange={e => setOverlayArtistName(e.target.value)}
                className="h-12 text-base font-sans bg-[#1a1a1a] text-white border-white/20 placeholder:text-white/40"
                placeholder="Your artist or band name"
                maxLength={200}
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={overlaySaving}
            className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
          >
            {overlaySaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 px-6 md:px-12 py-12 max-w-xl mx-auto w-full space-y-8">
        {/* Header with profile */}
        <div className="flex items-center gap-4">
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex-shrink-0" />
          )}
          <div>
            <h1 className="text-white font-bold text-xl font-display">
              Welcome, {firstName || "Artist"}
            </h1>
            {artistName && (
              <p className="text-[#FFD600] text-sm font-sans">{artistName}</p>
            )}
          </div>
        </div>

        {/* Song status cards */}
        <section>
          {submissions.length > 0 ? (
            submissions.map((sub, idx) => renderSubmissionCard(sub, idx))
          ) : (
            <p className="text-white/50 text-sm font-sans">No submissions yet. Submit your first song below.</p>
          )}
        </section>

        {/* Submit Music */}
        <section className="space-y-3">
          <Link to="/artist/submit" className="block">
            <Button className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90">
              Submit Your Music
            </Button>
          </Link>
          <ul className="space-y-1.5 text-white/60 text-[13px] font-sans list-disc list-inside">
            <li>Up to 2 submissions per month</li>
            <li>MP3 files only, max 20MB</li>
            <li>Square song image required</li>
            <li>Free to submit</li>
          </ul>
        </section>

        {/* Submit a Show */}
        <section className="space-y-3">
          <Button
            disabled
            className="w-full h-14 text-base font-display font-bold bg-[#1a1a1a] text-white/40 cursor-not-allowed opacity-50"
          >
            Submit a Show
          </Button>
          <p className="text-white/50 text-sm font-sans">
            Coming soon. Fans who add you to their Lokol Scene get notified when you have a show and earn points for showing up.
          </p>
        </section>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          {userEmail && (
            <p className="text-white text-xs font-sans">Signed in as: {userEmail}</p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="border-white/20 text-white/60 hover:text-white hover:bg-white/5"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
