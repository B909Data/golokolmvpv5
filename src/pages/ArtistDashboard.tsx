import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LogOut, Upload, X, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import golokolLogo from "@/assets/golokol-logo.svg";
import type { User } from "@supabase/supabase-js";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_BIO = 240;

const ATLANTA_NEIGHBORHOODS = [
  "Adair Park","Adams Park","Adamsville","Almond Park","Ansley Park","Arden/Habersham","Argonne Forest","Arlington Estates","Atkins Park","Auburn Avenue","Austell","Avondale Estates","Bakers Ferry","Bankhead","Beecher Hills","Ben Hill","Berkshire Hills","Bowen Homes","Bower Hills","Brookhaven","Brookwood Hills","Buckhead","Buffalo Creek","Cabbagetown","Candler Park","Capitol Gateway","Capitol Hill","Capitol View","Capitol View Manor","Carey Park","Cascade Green","Cascade Heights","Cascade Road","Castleberry Hill","Chancel","Channing Valley","Chastain Park","Chester Avenue","Clairmont","Collier Heights","Collier Hills","Columbia","Conley Hills","Cornelia","Decatur","Deerwood","Downtown","Druid Hills","East Atlanta","East Lake","East Point","Edgewood","English Avenue","Fairburn","Fairburn Aces","Fairway Hills","Five Points","Flat Shoals","Forest Hills","Fort Valley","Garden Hills","Glenrose Heights","Glenwood Park","Grant Park","Grove Park","Hampton Oaks","Hanover West","Hapeville","Harris Chiles","Harvel Hills","Hillsdale","Historic West End","Holly Hills","Home Park","Inman Park","Jonesboro","Joyland","Kirkwood","Lake Claire","Lakewood","Lakewood Heights","Lenox","Linden","Lindbergh","Loring Heights","Lynwood Park","Mableton","Marietta","Mechanicsville","Memorial Park","Midtown","Midway Woods","Moreland Hills","Morningside","Morris Brandon","Mozley Park","Murphey Crossing","Napier/Thomasville","Norcross","North Buckhead","North Druid Hills","Oakland City","Oakview","Old Fourth Ward","Paces","Panthersville","Perkerson","Peters Street","Peyton Forest","Piedmont Heights","Pittsburgh","Plateau","Plunkettown","Ponce City Market area","Ponce De Leon","Princeton Lakes","Pyron","Rebel Valley Forest","Reynoldstown","Ridgewood Heights","Riverside","Rocky Mount","Rollingwood","Sandy Springs","Sherwood Forest","Smyrna","South Atlanta","South Buckhead","Southtowne","Stanton Road","Stone Mountain","Summerhill","Sylvan Hills","Thomasville Heights","Toco Hills","Tucker","Underwood Hills","Utoy Creek","Vine City","Virginia-Highland","Vinings","Waterford","Westview","Whittier Mill","Wildwood","Wilson Mill Meadows","Winn Park","Woodland Hills","Wyngate",
];

interface Submission {
  song_title: string | null;
  admin_status: string | null;
  payment_status: string | null;
  rejection_reason: string | null;
}

interface ArtistProfile {
  id: string;
  first_name: string | null;
  artist_name: string | null;
  city: string | null;
  neighborhood: string | null;
  instagram_handle: string | null;
  music_link: string | null;
  short_bio: string | null;
  profile_image_url: string | null;
}

const ArtistDashboard = () => {
  const [showTianahRule, setShowTianahRule] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const setupPhotoRef = useRef<HTMLInputElement>(null);
  const profilePhotoRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // First time setup
  const [firstName, setFirstName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Profile form
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    city: "Atlanta",
    neighborhood: "",
    instagram_handle: "",
    music_link: "",
    short_bio: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [pPhotoFile, setPPhotoFile] = useState<File | null>(null);
  const [pPhotoPreview, setPPhotoPreview] = useState<string | null>(null);

  const profileComplete = !!(
    profileForm.city &&
    profileForm.neighborhood &&
    profileForm.instagram_handle &&
    profileForm.music_link &&
    profileForm.short_bio
  );

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/artist/signup", { replace: true }); return; }

      const currentUser = session.user;
      setUser(currentUser);

      // Handle pending claim code
      const pendingCode = localStorage.getItem("pending_claim_code");
      if (pendingCode) {
        await (supabase as any)
          .from("lls_artist_submissions")
          .update({ artist_user_id: currentUser.id })
          .eq("claim_code", pendingCode);
        localStorage.removeItem("pending_claim_code");
      }

      // Load profile
      const { data: profileData } = await (supabase as any)
        .from("artist_profiles")
        .select("*")
        .eq("artist_user_id", currentUser.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          city: profileData.city || "Atlanta",
          neighborhood: profileData.neighborhood || "",
          instagram_handle: profileData.instagram_handle || "",
          music_link: profileData.music_link || "",
          short_bio: profileData.short_bio || "",
        });
        setPPhotoPreview(profileData.profile_image_url || null);
      }

      // Load submissions
      const { data: subs } = await (supabase as any)
        .from("lls_artist_submissions")
        .select("*")
        .eq("artist_user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (subs) setSubmissions(subs);

      // Determine first time
      const firstTime = !profileData || !profileData.first_name || !profileData.artist_name;
      setIsFirstTime(firstTime);

      if (firstTime) {
        setArtistName(currentUser.user_metadata?.artist_name || profileData?.artist_name || "");
      }

      setIsLoading(false);
    };
    init();
  }, [navigate]);

  const uploadPhoto = async (file: File, uid: string): Promise<string> => {
    const ext = file.name.split(".").pop() || "jpg";
    const sanitized = ext.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${uid}/profile.${sanitized}`;
    const { error } = await supabase.storage.from("artist-profiles").upload(path, file, { contentType: file.type, upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("artist-profiles").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSetupPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Please select an image file.", variant: "destructive" }); return; }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) { toast({ title: "Image must be under 5MB.", variant: "destructive" }); return; }
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Please select an image file.", variant: "destructive" }); return; }
    if (file.size > MAX_PROFILE_IMAGE_SIZE) { toast({ title: "Image must be under 5MB.", variant: "destructive" }); return; }
    setPPhotoFile(file);
    setPPhotoPreview(URL.createObjectURL(file));
  };

  const handleSetupSave = async () => {
    if (!user) return;
    if (!firstName.trim()) { toast({ title: "First Name is required.", variant: "destructive" }); return; }
    if (!artistName.trim()) { toast({ title: "Artist Name is required.", variant: "destructive" }); return; }

    setProfileSaving(true);
    try {
      let publicUrl: string | null = null;
      if (profileImageFile) {
        publicUrl = await uploadPhoto(profileImageFile, user.id);
      }

      await supabase.auth.updateUser({
        data: { first_name: firstName.trim(), artist_name: artistName.trim(), profile_image_url: publicUrl },
      });

      await (supabase as any).from("artist_profiles").upsert({
        artist_user_id: user.id,
        first_name: firstName.trim(),
        artist_name: artistName.trim(),
        profile_image_url: publicUrl,
      }, { onConflict: "artist_user_id" });

      const { data: freshProfile } = await (supabase as any)
        .from("artist_profiles")
        .select("*")
        .eq("artist_user_id", user.id)
        .single();

      if (freshProfile) {
        setProfile(freshProfile);
        setProfileForm({
          city: freshProfile.city || "Atlanta",
          neighborhood: freshProfile.neighborhood || "",
          instagram_handle: freshProfile.instagram_handle || "",
          music_link: freshProfile.music_link || "",
          short_bio: freshProfile.short_bio || "",
        });
        setPPhotoPreview(freshProfile.profile_image_url || null);
      }
      setIsFirstTime(false);
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      let photoUrl = profile?.profile_image_url || null;
      if (pPhotoFile) {
        photoUrl = await uploadPhoto(pPhotoFile, user.id);
        setPPhotoFile(null);
      }

      await (supabase as any).from("artist_profiles").upsert({
        artist_user_id: user.id,
        first_name: profile?.first_name || null,
        artist_name: profile?.artist_name || null,
        profile_image_url: photoUrl,
        city: profileForm.city,
        neighborhood: profileForm.neighborhood || null,
        instagram_handle: profileForm.instagram_handle.trim() || null,
        music_link: profileForm.music_link.trim() || null,
        short_bio: profileForm.short_bio.trim() || null,
      }, { onConflict: "artist_user_id" });

      const { data: freshProfile } = await (supabase as any)
        .from("artist_profiles")
        .select("*")
        .eq("artist_user_id", user.id)
        .single();

      if (freshProfile) {
        setProfile(freshProfile);
        setProfileForm({
          city: freshProfile.city || "Atlanta",
          neighborhood: freshProfile.neighborhood || "",
          instagram_handle: freshProfile.instagram_handle || "",
          music_link: freshProfile.music_link || "",
          short_bio: freshProfile.short_bio || "",
        });
        setPPhotoPreview(freshProfile.profile_image_url || null);
      }
      setEditingProfile(false);
      toast({ title: "Profile saved." });
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/artist/signup", { replace: true });
  };

  const getInitials = () => {
    const name = profile?.artist_name || profile?.first_name || artistName || "";
    return name.charAt(0).toUpperCase() || "?";
  };

  // ─── LOADING ───
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white font-sans">Loading...</p>
      </div>
    );
  }

  // ─── FIRST TIME SETUP ───
  if (isFirstTime) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center px-6 py-12">
        <img src={golokolLogo} alt="GoLokol" className="h-10 mb-8" />
        <h1 className="text-white font-bold text-2xl font-display text-center">Let's set up your profile</h1>
        <p className="text-white/70 text-sm font-sans text-center mt-2 mb-8">
          This is how fans and GoLokol will know you.
        </p>

        {/* Photo upload */}
        <div className="flex flex-col items-center mb-6">
          {profileImagePreview ? (
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                <img src={profileImagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => { setProfileImageFile(null); if (profileImagePreview) URL.revokeObjectURL(profileImagePreview); setProfileImagePreview(null); if (setupPhotoRef.current) setupPhotoRef.current.value = ""; }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white/40 text-2xl font-bold border-2 border-white/10">
              {getInitials()}
            </div>
          )}
          <button type="button" onClick={() => setupPhotoRef.current?.click()}
            className="mt-3 text-sm text-white/70 hover:text-white underline font-sans">
            Add Photo
          </button>
          <input ref={setupPhotoRef} type="file" accept="image/*" onChange={handleSetupPhotoSelect} className="hidden" />
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <Label className="text-white text-sm font-sans">First Name *</Label>
            <Input value={firstName} onChange={e => setFirstName(e.target.value)}
              className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40"
              placeholder="Your first name" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label className="text-white text-sm font-sans">Artist Name *</Label>
            <Input value={artistName} onChange={e => setArtistName(e.target.value)}
              className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40"
              placeholder="Your artist or band name" maxLength={200} />
          </div>

          <Button onClick={handleSetupSave} disabled={profileSaving}
            className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90">
            {profileSaving ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Saving...</> : "Save and Continue"}
          </Button>
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD ───
  const displayName = profile?.first_name || profile?.artist_name || user?.user_metadata?.artist_name || "";
  const hasSubmissions = submissions.length > 0;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-[480px] mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {profile?.profile_image_url ? (
            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
              <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#FFD600] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-bold text-xl">{getInitials()}</span>
            </div>
          )}
          <div>
            <h1 className="text-white font-bold text-xl font-display">
              {hasSubmissions ? `Welcome back, ${displayName}` : `Welcome, ${displayName}`}
            </h1>
            {profile?.artist_name && (
              <p className="text-[#FFD600] text-sm font-sans">{profile.artist_name}</p>
            )}
          </div>
        </div>

        {/* Submission cards */}
        <section>
          {hasSubmissions ? (
            submissions.map((sub, idx) => {
              const { admin_status, payment_status, rejection_reason, song_title } = sub;
              let badge: React.ReactNode;
              let extra: React.ReactNode = null;

              if (admin_status === "pending") {
                badge = <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#FFD600] text-black whitespace-nowrap">Pending Review</span>;
              } else if (admin_status === "approved" && payment_status === "curated") {
                badge = <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-black whitespace-nowrap">Live on GoLokol</span>;
              } else if (admin_status === "approved") {
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
              }

              return (
                <div key={idx} className="rounded-xl bg-[#1a1a1a] p-4 mb-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white font-bold text-base font-sans">{song_title || "Untitled"}</p>
                    {badge}
                  </div>
                  {extra}
                </div>
              );
            })
          ) : (
            <p className="text-white/50 text-sm font-sans">No submissions yet.</p>
          )}
        </section>

        {/* Profile completion button */}
        {!profileComplete ? (
          <Button
            onClick={() => { setEditingProfile(true); setTimeout(() => document.getElementById("artist-profile")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
          >
            Complete Your Profile
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => { setEditingProfile(true); setTimeout(() => document.getElementById("artist-profile")?.scrollIntoView({ behavior: "smooth" }), 100); }}
            className="w-full h-14 text-base font-display font-bold border-white text-white hover:bg-white/10"
          >
            Edit Profile
          </Button>
        )}

        {/* Submit New Music */}
        <section className="space-y-3">
          <Button
            onClick={() => navigate("/artist/submit")}
            className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
          >
            Submit New Music
          </Button>
          <ul className="space-y-2 text-white text-[13px] font-sans list-disc list-inside">
            <li>Up to 2 submissions per month. Only ONE song is discoverable in stores at a time.</li>
            <li>Once fans add you to their Lokol Scene you can send them, and only them up to 3 new songs and 4 show promotions per month.</li>
            <li>MP3 files only, max 20MB</li>
            <li>
              Submissions are only denied for two reasons: a poor mix, or a violation of{" "}
              <button type="button" onClick={() => setShowTianahRule(true)}
                className="text-[#FFD600] underline hover:text-[#FFD600]/80 font-bold inline">
                The Tianah Robinson Rule
              </button>.
            </li>
          </ul>
        </section>

        {/* Submit a Show */}
        <section className="space-y-2">
          <Button
            onClick={() => navigate("/artist/submit-show")}
            className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-white"
          >
            Submit a Show
          </Button>
          <p className="text-white/50 text-sm font-sans">
            Fans who add you to their Lokol Scene get notified and earn points for showing up.
          </p>
        </section>

        {/* Profile Section */}
        <section id="artist-profile" className="scroll-mt-24">
          {editingProfile && (
            <div className="rounded-2xl bg-[#1a1a1a] p-6 space-y-5">
              <h2 className="font-display text-xl font-bold text-white">Your Profile</h2>

              {/* Photo */}
              <div className="flex flex-col items-center">
                {pPhotoPreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20">
                      <img src={pPhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={() => { setPPhotoFile(null); setPPhotoPreview(profile?.profile_image_url || null); if (profilePhotoRef.current) profilePhotoRef.current.value = ""; }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => profilePhotoRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/30 flex items-center justify-center text-white/50 hover:border-white transition-colors">
                    <Upload className="h-6 w-6" />
                  </button>
                )}
                <button type="button" onClick={() => profilePhotoRef.current?.click()}
                  className="mt-2 text-xs text-white/60 hover:text-white underline font-sans">Change Photo</button>
                <input ref={profilePhotoRef} type="file" accept="image/*" onChange={handleProfilePhotoSelect} className="hidden" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white text-sm font-sans">City</Label>
                  <Input value={profileForm.city} onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))}
                    className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40" placeholder="Atlanta" />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-sans">Neighborhood</Label>
                  <Popover open={neighborhoodOpen} onOpenChange={setNeighborhoodOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={neighborhoodOpen}
                        className="w-full h-12 justify-between text-base font-sans bg-[#111] text-white border-white/20 hover:bg-[#222]">
                        {profileForm.neighborhood || "Select neighborhood..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white" align="start">
                      <Command>
                        <CommandInput placeholder="Search neighborhoods..." style={{ color: "black", backgroundColor: "white" }} />
                        <CommandList>
                          <CommandEmpty className="text-black">No neighborhood found.</CommandEmpty>
                          <CommandGroup className="bg-white">
                            {ATLANTA_NEIGHBORHOODS.map(hood => (
                              <CommandItem key={hood} value={hood}
                                onSelect={() => { setProfileForm(f => ({ ...f, neighborhood: f.neighborhood === hood ? "" : hood })); setNeighborhoodOpen(false); }}
                                className="text-black hover:bg-gray-100">
                                <Check className={cn("mr-2 h-4 w-4", profileForm.neighborhood === hood ? "opacity-100" : "opacity-0")} />
                                {hood}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-sans">Instagram Handle</Label>
                  <Input value={profileForm.instagram_handle} onChange={e => setProfileForm(f => ({ ...f, instagram_handle: e.target.value }))}
                    className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40" placeholder="@yourhandle" maxLength={200} />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-sans">Where can people buy or stream your music?</Label>
                  <Input value={profileForm.music_link} onChange={e => setProfileForm(f => ({ ...f, music_link: e.target.value }))}
                    className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40" placeholder="Bandcamp, Groovetie, etc." maxLength={500} />
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-sm font-sans">Short Bio - New fans see this. <span className="text-white/40">({profileForm.short_bio.length}/{MAX_BIO})</span></Label>
                  <textarea
                    value={profileForm.short_bio}
                    onChange={e => { if (e.target.value.length <= MAX_BIO) setProfileForm(f => ({ ...f, short_bio: e.target.value })); }}
                    className="flex min-h-[80px] w-full rounded-md border border-white/20 bg-[#111] px-3 py-2 text-base font-sans text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600]"
                    maxLength={MAX_BIO}
                    placeholder="A short bio (max 240 characters)"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={profileSaving}
                className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90">
                {profileSaving ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Saving...</> : "Save Profile"}
              </Button>
            </div>
          )}
        </section>

        {/* Bottom */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <p className="text-white/40 text-xs font-sans">Signed in as:</p>
          <p className="text-white text-xs font-sans">{user?.email}</p>
          <Button variant="outline" size="sm" onClick={handleSignOut}
            className="border-white/20 text-white/60 hover:text-white hover:bg-white/5">
            <LogOut className="h-4 w-4 mr-2" />Sign Out
          </Button>
        </div>
      </div>
      {/* Tianah Robinson Rule Overlay */}
      {showTianahRule && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur z-50 flex items-center justify-center px-4"
          onClick={() => setShowTianahRule(false)}>
          <div className="bg-[#1a1a1a] rounded-2xl p-8 max-w-sm w-full mx-auto"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-white text-center text-[24px] font-bold tracking-widest" style={{ fontFamily: "'Anton', sans-serif" }}>
              THE TIANAH ROBINSON RULE
            </h2>
            <p className="text-white text-[15px] leading-relaxed text-center mt-6">
              GoLokol does not support absurdly violent lyrics that support a neglect for human life. There are plenty of other platforms that dgaf about our communities. This isn't one.
            </p>
            <div className="w-full h-px bg-[#FFD600] mt-6" />
            <button onClick={() => setShowTianahRule(false)}
              className="w-full mt-4 py-3 rounded-xl bg-[#FFD600] text-black font-bold text-base">
              Close
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ArtistDashboard;
