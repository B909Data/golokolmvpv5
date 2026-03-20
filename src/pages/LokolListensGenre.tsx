import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";

function slugToGenre(slug: string) {
  return slug
    .replace(/-and-/g, " & ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const LokolListensGenre = () => {
  const { genre } = useParams<{ genre: string }>();
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get("store") || "";
  const genreName = genre ? slugToGenre(genre) : "Unknown";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 py-5 flex items-center gap-3 border-b border-border">
        <Link
          to={`/lls${storeId ? `?store=${storeId}` : ""}`}
          className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">Back</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <img src={golokolLogo} alt="GoLokol" className="h-7 w-7" />
        </div>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="font-display font-black text-3xl md:text-4xl text-foreground mb-4">
          {genreName}
        </h1>
        <p className="text-lg text-foreground-secondary max-w-md">
          Songs for this genre will appear here soon. Stay tuned.
        </p>
      </section>

      <footer className="px-6 py-6 text-center border-t border-border">
        <p className="text-xs text-foreground-secondary">
          Powered by{" "}
          <span className="font-display font-bold text-primary">GoLokol</span>
        </p>
      </footer>
    </div>
  );
};

export default LokolListensGenre;
