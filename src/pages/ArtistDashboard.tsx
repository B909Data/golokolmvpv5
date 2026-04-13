import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const MAX_BIO = 240;

const ATLANTA_NEIGHBORHOODS = [
  "Adair Park","Adams Park","Adamsville","Almond Park","Ansley Park","Arden/Habersham","Argonne Forest","Arlington Estates","Atkins Park","Auburn Avenue","Austell","Avondale Estates","Bakers Ferry","Bankhead","Beecher Hills","Ben Hill","Berkshire Hills","Bowen Homes","Bower Hills","Brookhaven","Brookwood Hills","Buckhead","Buffalo Creek","Cabbagetown","Candler Park","Capitol Gateway","Capitol Hill","Capitol View","Capitol View Manor","Carey Park","Cascade Green","Cascade Heights","Cascade Road","Castleberry Hill","Chancel","Channing Valley","Chastain Park","Chester Avenue","Clairmont","Collier Heights","Collier Hills","Columbia","Conley Hills","Cornelia","Decatur","Deerwood","Downtown","Druid Hills","East Atlanta","East Lake","East Point","Edgewood","English Avenue","Fairburn","Fairburn Aces","Fairway Hills","Five Points","Flat Shoals","Forest Hills","Fort Valley","Garden Hills","Glenrose Heights","Glenwood Park","Grant Park","Grove Park","Hampton Oaks","Hanover West","Hapeville","Harris Chiles","Harvel Hills","Hillsdale","Historic West End","Holly Hills","Home Park","Inman Park","Jonesboro","Joyland","Kirkwood","Lake Claire","Lakewood","Lakewood Heights","Lenox","Linden","Lindbergh","Loring Heights","Lynwood Park","Mableton","Marietta","Mechanicsville","Memorial Park","Midtown","Midway Woods","Moreland Hills","Morningside","Morris Brandon","Mozley Park","Murphey Crossing","Napier/Thomasville","Norcross","North Buckhead","North Druid Hills","Oakland City","Oakview","Old Fourth Ward","Paces","Panthersville","Perkerson","Peters Street","Peyton Forest","Piedmont Heights","Pittsburgh","Plateau","Plunkettown","Ponce City Market area","Ponce De Leon","Princeton Lakes","Pyron","Rebel Valley Forest","Reynoldstown","Ridgewood Heights","Riverside","Rocky Mount","Rollingwood","Sandy Springs","Sherwood Forest","Smyrna","South Atlanta","South Buckhead","Southtowne","Stanton Road","Stone Mountain","Summerhill","Sylvan Hills","Thomasville Heights","Toco Hills","Tucker","Underwood Hills","Utoy Creek","Vine City","Virginia-Highland","Vinings","Waterford","Westview","Whittier Mill","Wildwood","Wilson Mill Meadows","Winn Park","Woodland Hills","Wyngate",
];

interface Submission {
  song_title: string;
  admin_status: string | null;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile state
  const [profile, setProfile] = useState<ArtistProfile | null>(null);

  // Profile form fields
  const [pCity, setPCity] = useState("Atlanta");
  const [pNeighborhood, setPNeighborhood] = useState("");
  const [pInstagram, setPInstagram] = useState("");
  const [pMusicLink, setPMusicLink] = useState("");
  const [pBio, setPBio] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);

  const isProfileIncomplete = !profile || !profile.city || !profile.neighborhood || !profile.instagram_handle || !profile.music_link || !profile.short_bio;

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/artist/signup", { replace: true }); return; }

      setUserEmail(session.user.email ?? null);
      setUserId(session.user.id);
      setArtistName(session.user.user_metadata?.artist_name || null);

      const justSubmitted = sessionStorage.getItem("submission_success");
      if (justSubmitted) {
        setSuccessMessage("We got it! Check your dashboard for status.");
        sessionStorage.removeItem("submission_success");
      }

      // Load profile
      const { data: profileData } = await (supabase as any)
        .from("artist_profiles")
        .select("*")
        .eq("artist_user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        prefillForm(profileData);
      } else {
        // Create a stub profile
        const newProfile = {
          artist_user_id: session.user.id,
          artist_name: session.user.user_metadata?.artist_name || null,
          first_name: session.user.user_metadata?.first_name || null,
        };
        await (supabase as any).from("artist_profiles").insert(newProfile);
        const { data: created } = await (supabase as any)
          .from("artist_profiles")
          .select("*")
          .eq("artist_user_id", session.user.id)
          .maybeSingle();
        if (created) {
          setProfile(created);
          prefillForm(created);
        }
      }

      // Fetch submissions
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

  const prefillForm = (p: ArtistProfile) => {
    setPCity(p.city || "Atlanta");
    setPNeighborhood(p.neighborhood || "");
    setPInstagram(p.instagram_handle || "");
    setPMusicLink(p.music_link || "");
    setPBio(p.short_bio || "");
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    setProfileSaving(true);
    try {
      const profilePayload = {
        artist_user_id: userId,
        first_name: profile?.first_name || null,
        artist_name: artistName || profile?.artist_name || null,
        city: pCity,
        neighborhood: pNeighborhood || null,
        instagram_handle: pInstagram.trim() || null,
        music_link: pMusicLink.trim() || null,
        short_bio: pBio.trim() || null,
        profile_image_url: profile?.profile_image_url || null,
      };

      const { error } = await (supabase as any)
        .from("artist_profiles")
        .upsert(profilePayload, { onConflict: "artist_user_id" });
      if (error) throw error;

      await supabase.auth.updateUser({
        data: {
          first_name: profile?.first_name,
          artist_name: artistName,
          profile_image_url: profile?.profile_image_url,
        },
      });

      const { data: freshProfile } = await (supabase as any)
        .from("artist_profiles")
        .select("*")
        .eq("artist_user_id", userId)
        .maybeSingle();

      setProfile(freshProfile);
      if (freshProfile) prefillForm(freshProfile);
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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 px-6 md:px-12 py-12 max-w-xl mx-auto w-full space-y-8">
        {/* Header with profile */}
        <div className="flex items-center gap-4">
          {profile?.profile_image_url ? (
            <img src={profile.profile_image_url} alt="Profile" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex-shrink-0" />
          )}
          <div>
            <h1 className="text-white font-bold text-xl font-display">
              Welcome back, {profile?.first_name || "Artist"}
            </h1>
            {(profile?.artist_name || artistName) && (
              <p className="text-[#FFD600] text-sm font-sans">{profile?.artist_name || artistName}</p>
            )}
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="rounded-xl bg-green-500/20 border border-green-500/40 p-4">
            <p className="text-green-400 font-sans text-sm">{successMessage}</p>
          </div>
        )}

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
              Submit New Music
            </Button>
          </Link>
          <ul className="space-y-1.5 text-white/60 text-[13px] font-sans list-disc list-inside">
            <li>Up to 2 submissions per month</li>
            <li>MP3 files only, max 20MB</li>
            <li>Square song image required</li>
            <li>Free to submit</li>
          </ul>
        </section>

        {/* Complete / Edit Profile button */}
        <a href="#artist-profile" className="block">
          <Button className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90">
            {isProfileIncomplete ? "Complete Your Profile" : "Edit Profile"}
          </Button>
        </a>

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

        {/* Profile Section */}
        <section id="artist-profile" className="rounded-2xl bg-[#1a1a1a] p-6 md:p-8 space-y-5 scroll-mt-24">
          <h2 className="font-display text-xl font-bold text-white">Your Profile</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-sm font-sans">City</Label>
              <Input value={pCity} onChange={e => setPCity(e.target.value)} className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40" placeholder="Atlanta" />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-sans">Neighborhood</Label>
              <Popover open={neighborhoodOpen} onOpenChange={setNeighborhoodOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={neighborhoodOpen}
                    className="w-full h-12 justify-between text-base font-sans bg-[#111] text-white border-white/20 hover:bg-[#222]">
                    {pNeighborhood || "Select neighborhood..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white" align="start">
                  <Command>
                    <CommandInput placeholder="Search neighborhoods..." style={{ color: 'black', backgroundColor: 'white' }} />
                    <CommandList>
                      <CommandEmpty className="text-black">No neighborhood found.</CommandEmpty>
                      <CommandGroup className="bg-white">
                        {ATLANTA_NEIGHBORHOODS.map(hood => (
                          <CommandItem key={hood} value={hood} onSelect={() => { setPNeighborhood(pNeighborhood === hood ? "" : hood); setNeighborhoodOpen(false); }}
                            className="text-black hover:bg-gray-100">
                            <Check className={cn("mr-2 h-4 w-4", pNeighborhood === hood ? "opacity-100" : "opacity-0")} />
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
              <Input value={pInstagram} onChange={e => setPInstagram(e.target.value)} className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40" placeholder="@yourhandle" maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-sans">Where can people buy or stream your music?</Label>
              <Input value={pMusicLink} onChange={e => setPMusicLink(e.target.value)} className="h-12 text-base font-sans bg-[#111] text-white border-white/20 placeholder:text-white/40" placeholder="Bandcamp, Groovetie, etc." maxLength={500} />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm font-sans">Short Bio - New fans see this. <span className="text-white/40">({pBio.length}/{MAX_BIO})</span></Label>
              <textarea
                value={pBio}
                onChange={e => { if (e.target.value.length <= MAX_BIO) setPBio(e.target.value); }}
                className="flex min-h-[80px] w-full rounded-md border border-white/20 bg-[#111] px-3 py-2 text-base font-sans text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD600]"
                maxLength={MAX_BIO}
                placeholder="A short bio (max 240 characters)"
              />
            </div>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={profileSaving}
            className="w-full h-14 text-base font-display font-bold bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
          >
            {profileSaving ? "Saving..." : "Save Profile"}
          </Button>
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
