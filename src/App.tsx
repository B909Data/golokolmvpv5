import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PostHogPageview from "./components/PostHogPageview";
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
import ArtistEvent from "./pages/ArtistEvent";
import ArtistLogin from "./pages/ArtistLogin";
import ArtistAfterParties from "./pages/ArtistAfterParties";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Partners from "./pages/Partners";
import ArtistRecognition from "./pages/ArtistRecognition";
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
import LLSUsRetail from "./pages/LLSUsRetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PostHogPageview />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/songs/success" element={<SongsSuccess />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/lls" element={<AdminLLS />} />
          
          {/* LLS Guest Pass & Check-in */}
          <Route path="/lls/:eventId/pass" element={<LLSGuestPass />} />
          <Route path="/lls/:eventId/checkin" element={<LLSCheckin />} />
          <Route path="/lls-release" element={<LLSRelease />} />
           <Route path="/lls-music-release" element={<LLSMusicRelease />} />
           <Route path="/llsvote" element={<LLSVote />} />
           <Route path="/lls-us" element={<LLSUs />} />
           <Route path="/lls-us/artists" element={<LLSUsArtists />} />
           <Route path="/lls-us/retail" element={<LLSUsRetail />} />
          <Route path="/admin/after-parties" element={<AdminAfterParties />} />
          <Route path="/admin/discount-codes" element={<AdminDiscountCodes />} />
          <Route path="/admin/partners" element={<AdminPartners />} />
          <Route path="/admin/cities" element={<AdminCities />} />
          <Route path="/admin/curated-codes" element={<AdminCuratedCodes />} />
          <Route path="/admin/lls-votes" element={<AdminLLSVotes />} />
          <Route path="/admin/signatures" element={<AdminSignatures />} />
          
          {/* Artist Auth Routes */}
          <Route path="/artist/login" element={<ArtistLogin />} />
          <Route path="/artist/after-parties" element={<ArtistAfterParties />} />
          <Route path="/artist/dashboard" element={<Navigate to="/artist/after-parties" replace />} />
          <Route path="/artist/event/:eventId" element={<ArtistEvent />} />
          
          {/* Song Detail */}
          <Route path="/song/:slug" element={<SongDetail />} />
          
          {/* After Party Fan Routes - Canonical: /after-party/:eventId/rsvp */}
          <Route path="/after-party/:eventId/rsvp" element={<RSVPAfterParty />} />
          <Route path="/after-party/:eventId" element={<Navigate to="rsvp" replace />} />
          <Route path="/after-party/:eventId/pass" element={<AfterPartyPass />} />
          <Route path="/after-party/:eventId/qr/:qrToken" element={<QRDisplayPage />} />
          <Route path="/after-party/:eventId/verify/:qrToken" element={<VerifyQRPage />} />
          <Route path="/after-party/:eventId/intro" element={<WalkInIntro />} />
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
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/for-artists" element={<ArtistRecognition />} />
          <Route path="/q/:code" element={<ShortLinkRedirect />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
