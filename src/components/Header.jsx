
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

import {
  Activity,
  Home,
  Film,
  Info,
  Upload,
} from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Gallery",
      href: "/gallery",
      icon: Film,
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
    },
    {
      name: "Submit Project",
      href: "/submit-project",
      icon: Upload,
    },
  ];

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-adinkra-bg text-adinkra-gold shadow-md">
      <div className="flex w-full items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2"
          aria-label="Adinkra Media home"
        >
          <Activity className="h-10 w-10 text-adinkra-gold" />

          <span className="hidden text-sm font-semibold md:inline">
            Adinkra Media
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                title={item.name}
                aria-label={item.name}
                className="transition-colors hover:text-adinkra-highlight"
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          })}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 transition-colors hover:bg-adinkra-highlight/10 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="space-y-2 bg-adinkra-card px-6 py-6 md:hidden"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-adinkra-highlight/10 hover:text-adinkra-highlight"
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
