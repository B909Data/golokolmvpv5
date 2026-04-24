import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PostHogPageview from "./components/PostHogPageview";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import ApUs from "./pages/ApUs";
import Shows from "./pages/Shows";
import Songs from "./pages/Songs";
import SongsSuccess from "./pages/SongsSuccess";
import SongDetail from "./pages/SongDetail";
import AfterPartyRoom from "./pages/AfterPartyRoom";
import RSVPAfterParty from "./pages/RSVPAfterParty";
import AfterPartyPass from "./pages/AfterPartyPass";
import QRDisplayPage from "./pages/QRDisplayPage";
import VerifyQRPage from "./pages/VerifyQRPage";
import WalkInIntro from "./pages/WalkInIntro";
import AfterPartyIntro from "./pages/AfterPartyIntro";
import AfterPartyNoReentry from "./pages/AfterPartyNoReentry";
import CreateAfterparty from "./pages/CreateAfterparty";
import CreateAfterpartySuccess from "./pages/CreateAfterpartySuccess";
import SubmitSong from "./pages/SubmitSong";
import HowToGoLokol from "./pages/HowToGoLokol";
import Admin from "./pages/Admin";
import AdminLLS from "./pages/AdminLLS";
import AdminAfterParties from "./pages/AdminAfterParties";
import AdminDiscountCodes from "./pages/AdminDiscountCodes";
import AdminPartners from "./pages/AdminPartners";
import AdminCities from "./pages/AdminCities";
import AdminLLSRsvps from "./pages/AdminLLSRsvps";
import ArtistEvent from "./pages/ArtistEvent";
import ArtistLogin from "./pages/ArtistLogin";
import ArtistAfterParties from "./pages/ArtistAfterParties";
import ArtistDashboard from "./pages/ArtistDashboard";
import ArtistSignup from "./pages/ArtistSignup";
import ArtistSubmit from "./pages/ArtistSubmit";
import ArtistSubmitShow from "./pages/ArtistSubmitShow";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Partners from "./pages/Partners";
import ArtistRecognition from "./pages/ArtistRecognition";
import AfterPartyPricing from "./pages/AfterPartyPricing";
import Pricing from "./pages/Pricing";
import SelectAfterPartyPlan from "./pages/SelectAfterPartyPlan";
import LLSGuestPass from "./pages/LLSGuestPass";
import LLSCheckin from "./pages/LLSCheckin";
import LLSRelease from "./pages/LLSRelease";
import LLSMusicRelease from "./pages/LLSMusicRelease";
import SubmitCurated from "./pages/SubmitCurated";
import AdminCuratedCodes from "./pages/AdminCuratedCodes";
import AdminLLSVotes from "./pages/AdminLLSVotes";
import AdminSignatures from "./pages/AdminSignatures";
import LLSVote from "./pages/LLSVote";
import LLSUs from "./pages/LLSUs";
import LLSUsArtists from "./pages/LLSUsArtists";
import LLSUsArtistAgreement from "./pages/LLSUsArtistAgreement";
import LLSUsRetail from "./pages/LLSUsRetail";
import LLSUsTerms from "./pages/LLSUsTerms";
import LokolListens from "./pages/LokolListens";
import LokolListensGenre from "./pages/LokolListensGenre";
import LLSStorePage from "./pages/LLSStorePage";
import LLSSignup from "./pages/LLSSignup";
import FanScene from "./pages/FanScene";
import FanInfo from "./pages/FanInfo";
import Connect from "./pages/Connect";
import Unsubscribe from "./pages/Unsubscribe";
import ClaimAccount from "./pages/ClaimAccount";
import LokolStations from "./pages/LokolStations";
import Discover from "@/pages/Discover";
import ReferralLanding from "@/pages/ReferralLanding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PostHogPageview />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ap-us" element={<ApUs />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/songs/success" element={<SongsSuccess />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/lls" element={<AdminLLS />} />
          
          {/* LLS Fan Kiosk */}
          <Route path="/lls" element={<LokolListens />} />
          <Route path="/lls/genre/:genre" element={<LokolListensGenre />} />
          <Route path="/lls/signup" element={<LLSSignup />} />
          <Route path="/fan/scene" element={<FanScene />} />
          <Route path="/fan/info" element={<FanInfo />} />
          <Route path="/lls/:storeSlug/genre/:genre" element={<LokolListensGenre />} />
          <Route path="/lls/:storeSlug" element={<LLSStorePage />} />
          
          {/* LLS Guest Pass & Check-in */}
          <Route path="/lls/:eventId/pass" element={<LLSGuestPass />} />
          <Route path="/lls/:eventId/checkin" element={<LLSCheckin />} />
          <Route path="/lls-release" element={<LLSRelease />} />
           <Route path="/lls-music-release" element={<LLSMusicRelease />} />
           <Route path="/llsvote" element={<LLSVote />} />
           <Route path="/lls-us" element={<LLSUs />} />
           <Route path="/lls-us/artists" element={<LLSUsArtists />} />
           <Route path="/lls-us/artist-agreement" element={<LLSUsArtistAgreement />} />
           <Route path="/lls-us/retail" element={<LLSUsRetail />} />
           <Route path="/lls-us/terms" element={<LLSUsTerms />} />
          <Route path="/admin/after-parties" element={<AdminAfterParties />} />
          <Route path="/admin/discount-codes" element={<AdminDiscountCodes />} />
          <Route path="/admin/partners" element={<AdminPartners />} />
          <Route path="/admin/cities" element={<AdminCities />} />
          <Route path="/admin/curated-codes" element={<AdminCuratedCodes />} />
          <Route path="/admin/lls-votes" element={<AdminLLSVotes />} />
          <Route path="/admin/lls-rsvps" element={<AdminLLSRsvps />} />
          <Route path="/admin/signatures" element={<AdminSignatures />} />
          
          {/* Artist Auth Routes */}
          <Route path="/artist/signup" element={<ArtistSignup />} />
          <Route path="/artist/login" element={<ArtistLogin />} />
          <Route path="/artist/after-parties" element={<ArtistAfterParties />} />
          <Route path="/artist/dashboard" element={<ArtistDashboard />} />
          <Route path="/artist/submit" element={<ArtistSubmit />} />
          <Route path="/artist/submit-show" element={<ArtistSubmitShow />} />
          <Route path="/artist/event/:eventId" element={<ArtistEvent />} />
          
          {/* Song Detail */}
          <Route path="/song/:slug" element={<SongDetail />} />
          
          {/* After Party Fan Routes - Canonical: /after-party/:eventId/rsvp */}
          <Route path="/after-party/:eventId/rsvp" element={<RSVPAfterParty />} />
          <Route path="/after-party/:eventId" element={<Navigate to="rsvp" replace />} />
          <Route path="/after-party/:eventId/pass" element={<AfterPartyPass />} />
          <Route path="/after-party/:eventId/qr/:qrToken" element={<QRDisplayPage />} />
          <Route path="/after-party/:eventId/verify/:qrToken" element={<VerifyQRPage />} />
          <Route path="/after-party/:eventId/intro" element={<AfterPartyIntro />} />
          <Route path="/after-party/:eventId/no-reentry" element={<AfterPartyNoReentry />} />
          <Route path="/after-party/:eventId/room" element={<AfterPartyRoom />} />
          
          {/* Redirect legacy/duplicate routes */}
          <Route path="/find-after-party" element={<Navigate to="/shows" replace />} />
          <Route path="/afterparty/:slug" element={<Navigate to="/shows" replace />} />
          
          {/* After Party Creation */}
          <Route path="/create-after-party" element={<SelectAfterPartyPlan />} />
          <Route path="/create-afterparty" element={<CreateAfterparty />} />
          <Route path="/create-afterparty/success" element={<CreateAfterpartySuccess />} />
          
          {/* Other Routes */}
          <Route path="/submit-song" element={<SubmitSong />} />
          <Route path="/songs/submit-curated" element={<SubmitCurated />} />
          <Route path="/how-to-golokol" element={<HowToGoLokol />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/partners" element={<Partners />} />
           <Route path="/pricing-ap" element={<AfterPartyPricing />} />
           <Route path="/pricing" element={<Pricing />} />
           <Route path="/connect" element={<Connect />} />
           <Route path="/unsubscribe" element={<Unsubscribe />} />
           <Route path="/for-artists" element={<ArtistRecognition />} />
           <Route path="/q/:code" element={<ShortLinkRedirect />} />
           <Route path="/claim/:code" element={<ClaimAccount />} />
           <Route path="/lokol-stations" element={<LokolStations />} />
           <Route path="/discover" element={<Discover />} />
           
           {/* 404 */}
           <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
