import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            GoLokol Plans
          </h1>
          <p className="type-body text-foreground/80 text-lg mb-12">
            Lokol Listening Stations + GoLokol Connect
          </p>

          <Card className="bg-card border-border mx-auto max-w-md">
            <CardContent className="py-12 px-6">
              <p className="font-display text-xl text-card-foreground">
                Coming Soon
              </p>
              <p className="type-body text-card-foreground/70 mt-2">
                Pricing details dropping shortly
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
