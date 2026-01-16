import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import golokolLogo from "@/assets/golokol-logo.svg";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "After Parties", path: "/find-after-party", colorClass: "text-foreground" },
    { label: "Create an After Party", path: "/create-afterparty", hideOnTablet: true, colorClass: "text-foreground" },
    { label: "Lokol Listening Sessions", path: "/songs", shortLabel: "Listening Sessions", colorClass: "text-primary" },
  ];

  const tabletHiddenItems = navItems.filter((item) => item.hideOnTablet);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <img src={golokolLogo} alt="GoLokol" className="h-10 w-10" />
            <span className="font-display text-2xl text-foreground tracking-wide">GoLokol</span>
          </Link>

          {/* Desktop Navigation - Full menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  size="sm"
                  className={`whitespace-nowrap ${!isActive(item.path) ? `${item.colorClass} hover:${item.colorClass}` : ""}`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Tablet Navigation - Reduced menu with More dropdown */}
          <div className="hidden md:flex lg:hidden items-center gap-0.5">
            {navItems
              .filter((item) => !item.hideOnTablet)
              .map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    size="sm"
                    className={`whitespace-nowrap text-xs px-2 ${!isActive(item.path) ? `${item.colorClass} hover:${item.colorClass}` : ""}`}
                  >
                    {item.shortLabel || item.label}
                  </Button>
                </Link>
              ))}

            {/* More dropdown for tablet */}
            <DropdownMenu open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 transition-colors ${
                    moreMenuOpen
                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      : "text-foreground hover:text-foreground"
                  }`}
                >
                  More
                  <ChevronDown className={`h-4 w-4 transition-transform ${moreMenuOpen ? "rotate-180" : ""}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-primary border-primary min-w-[180px]">
                {tabletHiddenItems.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    asChild
                    className="text-primary-foreground hover:bg-primary-foreground hover:text-primary focus:bg-primary-foreground focus:text-primary cursor-pointer font-medium"
                  >
                    <Link to={item.path} className="w-full">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop/Tablet CTA Button */}
          <div className="hidden md:flex items-center flex-shrink-0 ml-2">
            <Link to="/how-to-golokol">
              <Button variant="secondary" size="sm" className="text-xs md:text-sm whitespace-nowrap">
                How to GoLokol
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center justify-center h-10 w-10 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
                    className={`w-full justify-start ${!isActive(item.path) ? item.colorClass : ""}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="pt-2 mt-2 border-t border-border/50">
                <Link to="/how-to-golokol" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    How to GoLokol
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
