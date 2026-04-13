import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { supabase } from "@/integrations/supabase/client";
import golokolLogo from "@/assets/golokol-logo.svg";

const HIDDEN_PREFIXES = ["/lls"];
const HIDDEN_EXACT = ["/fan/scene", "/fan/info"];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Hide navbar on certain routes
  const path = location.pathname;
  if (HIDDEN_EXACT.includes(path) || HIDDEN_PREFIXES.some(p => path.startsWith(p))) {
    return null;
  }

  const isActive = (p: string) => path === p;

  const navItems = [
    { label: "Record Stores", path: "/lls-us/retail" },
    { label: "Artists", path: "/lls-us/artists" },
    { label: "How to GoLokol", path: "/how-to-golokol" },
    { label: "Pricing", path: "/pricing" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const authButton = (
    <Link to={isLoggedIn ? "/artist/dashboard" : "/artist/signup"}>
      <button
        className="font-bold text-[13px] text-black rounded-[8px] px-[14px] py-2"
        style={{ backgroundColor: "#FFD600" }}
      >
        {isLoggedIn ? "My Dashboard" : "Artist Login"}
      </button>
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src={golokolLogo} alt="GoLokol" className="h-10 w-10" />
            <span className="font-display text-2xl text-foreground tracking-wide">GoLokol</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {authButton}
          </div>

          {/* Mobile: Auth button + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {authButton}
            <button
              className="flex items-center justify-center h-10 w-10 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background py-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  style={{ color: "#FFD600" }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
