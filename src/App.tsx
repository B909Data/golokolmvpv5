import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Songs from "./pages/Songs";
import SongsSuccess from "./pages/SongsSuccess";
import SongDetail from "./pages/SongDetail";
import AfterpartyDetail from "./pages/AfterpartyDetail";
import AfterParty from "./pages/AfterParty";
import AfterPartyRoom from "./pages/AfterPartyRoom";

import RSVPAfterParty from "./pages/RSVPAfterParty";
import AfterPartyPass from "./pages/AfterPartyPass";
import QRDisplayPage from "./pages/QRDisplayPage";
import VerifyQRPage from "./pages/VerifyQRPage";
import WalkInIntro from "./pages/WalkInIntro";
import CreateAfterparty from "./pages/CreateAfterparty";
import CreateAfterpartySuccess from "./pages/CreateAfterpartySuccess";
import Checkin from "./pages/Checkin";
import SubmitSong from "./pages/SubmitSong";
import HowToGoLokol from "./pages/HowToGoLokol";
import FindAfterParty from "./pages/FindAfterParty";
import Admin from "./pages/Admin";
import AdminLLS from "./pages/AdminLLS";
import AdminAfterParties from "./pages/AdminAfterParties";
import AdminDiscountCodes from "./pages/AdminDiscountCodes";
import AdminPartners from "./pages/AdminPartners";
import ArtistEvent from "./pages/ArtistEvent";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shows" element={<Shows />} />
          <Route path="/find-after-party" element={<FindAfterParty />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/songs/success" element={<SongsSuccess />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/lls" element={<AdminLLS />} />
          <Route path="/admin/after-parties" element={<AdminAfterParties />} />
          <Route path="/admin/discount-codes" element={<AdminDiscountCodes />} />
          <Route path="/admin/partners" element={<AdminPartners />} />
          <Route path="/artist/event/:eventId" element={<ArtistEvent />} />
          <Route path="/song/:slug" element={<SongDetail />} />
          <Route path="/afterparty/:slug" element={<AfterpartyDetail />} />
          <Route path="/after-party/:eventId" element={<AfterParty />} />
          <Route path="/after-party/:eventId/rsvp" element={<RSVPAfterParty />} />
          <Route path="/after-party/:eventId/rsvp/confirmed" element={<Navigate to="../pass" replace />} />
          <Route path="/after-party/:eventId/pass" element={<AfterPartyPass />} />
          <Route path="/after-party/:eventId/qr/:qrToken" element={<QRDisplayPage />} />
          <Route path="/after-party/:eventId/verify/:qrToken" element={<VerifyQRPage />} />
          <Route path="/after-party/:eventId/intro" element={<WalkInIntro />} />
          <Route path="/after-party/:eventId/room" element={<AfterPartyRoom />} />
          
          <Route path="/create-afterparty" element={<CreateAfterparty />} />
          <Route path="/create-afterparty/success" element={<CreateAfterpartySuccess />} />
          <Route path="/checkin/:qr_token" element={<Checkin />} />
          <Route path="/submit-song" element={<SubmitSong />} />
          <Route path="/how-to-golokol" element={<HowToGoLokol />} />
          <Route path="/q/:code" element={<ShortLinkRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
