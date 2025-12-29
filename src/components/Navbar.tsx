import { Link, useLocation } from "react-router-dom";
import { Music, Calendar, Plus, Radio, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-2xl text-foreground tracking-wide">
              GoLokol
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link to="/shows">
              <Button
                variant={isActive("/shows") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Shows
              </Button>
            </Link>
            <Link to="/create-afterparty">
              <Button
                variant={isActive("/create-afterparty") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </Link>
            <Link to="/songs">
              <Button
                variant={isActive("/songs") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Disc className="h-4 w-4" />
                Songs
              </Button>
            </Link>
            <Link to="/submit-song">
              <Button
                variant={isActive("/submit-song") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Radio className="h-4 w-4" />
                Submit Song
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/shows">
              <Button variant="glow" size="sm" className="hidden sm:flex">
                Explore Shows
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
