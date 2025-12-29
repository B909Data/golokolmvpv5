import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shows from "./pages/Shows";
import Songs from "./pages/Songs";
import SongDetail from "./pages/SongDetail";
import AfterpartyDetail from "./pages/AfterpartyDetail";
import CreateAfterparty from "./pages/CreateAfterparty";
import Checkin from "./pages/Checkin";
import SubmitSong from "./pages/SubmitSong";
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
          <Route path="/songs" element={<Songs />} />
          <Route path="/song/:slug" element={<SongDetail />} />
          <Route path="/afterparty/:slug" element={<AfterpartyDetail />} />
          <Route path="/create-afterparty" element={<CreateAfterparty />} />
          <Route path="/checkin/:qr_token" element={<Checkin />} />
          <Route path="/submit-song" element={<SubmitSong />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
