import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";
import golokolLogo from "@/assets/golokol-logo.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-[#161616] mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={golokolLogo} alt="GoLokol" className="h-10 w-10" />
              <span className="font-display text-2xl text-foreground tracking-wide">
                GoLokol
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Make every show count. We help emerging artists cultivate fanbases that show up by rewarding those fans who do.
            </p>
          </div>

          <div>
            <h4 className="font-display text-lg text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/for-artists" className="text-muted-foreground hover:text-primary transition-colors">
                  For Artists
                </Link>
              </li>
              <li>
                <Link to="/create-afterparty" className="text-muted-foreground hover:text-primary transition-colors">
                  Create an After Party
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/songs" className="text-muted-foreground hover:text-primary transition-colors">
                  Lokol Listening Sessions
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <a href="mailto:backstage@golokol.app" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
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
          <p>© {new Date().getFullYear()} GoLokol. The future of music is local.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;