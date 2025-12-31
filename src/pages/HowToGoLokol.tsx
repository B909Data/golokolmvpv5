import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const HowToGoLokol = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              How to GoLokol
            </h1>
            <p className="text-muted-foreground text-lg">
              Coming soon — your guide to discovering and supporting local music culture.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowToGoLokol;
