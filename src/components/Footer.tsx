import { Link } from "react-router-dom";
import { Music, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <span className="font-display text-2xl text-foreground tracking-wide">
                GoLokol
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Connecting local bands with their community. Discover shows, create afterparties, and support your local music scene.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shows" className="text-muted-foreground hover:text-primary transition-colors">
                  Upcoming Shows
                </Link>
              </li>
              <li>
                <Link to="/create-afterparty" className="text-muted-foreground hover:text-primary transition-colors">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/submit-song" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Song
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">Connect</h4>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/golokolmusic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-background"
              >
                <Instagram className="h-5 w-5 text-primary" />
              </a>
              <a
                href="https://youtube.com/@golokolmusic"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-background"
              >
                <Youtube className="h-5 w-5 text-primary" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GoLokol. Support your local scene.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;