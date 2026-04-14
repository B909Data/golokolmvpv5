import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ClaimAccount = () => {
  const { code } = useParams<{ code: string }>();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-display text-4xl text-foreground mb-4">Claim Account</h1>
          <p className="text-muted-foreground">Claim Code: {code}</p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ClaimAccount;