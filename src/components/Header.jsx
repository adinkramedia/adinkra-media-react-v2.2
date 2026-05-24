import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

import {
  Activity,
  Home,
  Music2,
  Film,
  Mail,
  Music,
  Settings
} from "lucide-react";

import { useAuth0 } from "@auth0/auth0-react";

import AuthButton from "./AuthButton";
import { useAudioPlayer } from "./AudioPlayerContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { setIsPlayerOpen } = useAudioPlayer();
  const navigate = useNavigate();

  const {
    isAuthenticated,
    isLoading,
    user
  } = useAuth0();

  return (
    <header className="w-full bg-adinkra-bg text-adinkra-gold shadow-md fixed top-0 left-0 z-50">

      <div className="w-full flex items-center justify-between px-6 py-4">

        {/* Logo */}

        <Link to="/" className="flex items-center gap-2">
          <Activity className="w-10 h-10 text-adinkra-gold" />

          <span className="text-sm font-semibold hidden md:inline">
            Adinkra Media
          </span>
        </Link>

        {/* Desktop */}

        <div className="hidden md:flex items-center gap-8">

          <nav className="flex space-x-8 text-sm">

            <Link
              to="/"
              className="hover:text-adinkra-highlight transition-colors"
            >
              <Home className="w-6 h-6" />
            </Link>

            <Link
              to="/audio"
              className="hover:text-adinkra-highlight transition-colors"
            >
              <Music2 className="w-6 h-6" />
            </Link>

            <Link
              to="/gallery"
              className="hover:text-adinkra-highlight transition-colors"
            >
              <Film className="w-6 h-6" />
            </Link>

            <Link
              to="/contact"
              className="hover:text-adinkra-highlight transition-colors"
            >
              <Mail className="w-6 h-6" />
            </Link>

          </nav>

          {/* Audio Player */}

          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 transition"
          >
            <Music className="w-6 h-6" />
          </button>

          {/* Studio */}

          {!isLoading && isAuthenticated && (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-adinkra-highlight text-adinkra-bg font-semibold hover:opacity-90 transition"
            >
              <Settings className="w-5 h-5" />
              Studio
            </button>
          )}

          <AuthButton />

        </div>

        {/* Mobile */}

        <div className="md:hidden flex items-center gap-4">

          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20"
          >
            <Music className="w-6 h-6" />
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>

        </div>

      </div>

      {/* Mobile Menu */}

      {menuOpen && (

        <div className="md:hidden bg-adinkra-card px-6 py-6 space-y-6 text-center">

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Home className="w-6 h-6" />
            Home
          </Link>

          <Link
            to="/audio"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Music2 className="w-6 h-6" />
            Audio Store
          </Link>

          <Link
            to="/gallery"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Film className="w-6 h-6" />
            Gallery
          </Link>

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Mail className="w-6 h-6" />
            Contact
          </Link>

          {!isLoading && isAuthenticated && (
            <button
              onClick={() => {
                navigate("/dashboard");
                setMenuOpen(false);
              }}
              className="w-full flex justify-center items-center gap-3 bg-adinkra-highlight text-adinkra-bg px-4 py-3 rounded-xl font-semibold"
            >
              <Settings className="w-6 h-6" />
              Studio
            </button>
          )}

          <div className="pt-6 border-t border-adinkra-highlight">
            <AuthButton />
          </div>

        </div>

      )}

    </header>
  );
}