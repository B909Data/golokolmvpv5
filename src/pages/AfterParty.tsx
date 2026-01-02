import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AfterParty = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <p>After Party Page – loading event…</p>
      </main>
      <Footer />
    </div>
  );
};

export default AfterParty;
