import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { Activity, } from "lucide-react"; 
import {
  Home,
  Music2,
  Book,
  Film,
  Mail,
  Music,
} from "lucide-react";
import AuthButton from "./AuthButton";
import { useAudioPlayer } from "./AudioPlayerContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setIsPlayerOpen } = useAudioPlayer();

  return (
    <header className="w-full bg-adinkra-bg text-adinkra-gold shadow-md fixed top-0 left-0 z-50">
      <div className="w-full flex items-center justify-between px-6 py-4">

        {/* 🔥 BRAND UPDATE */}
        <Link to="/" className="flex items-center gap-2">
        <Activity className="w-10 h-10 text-adinkra-gold" />
        <span className="text-sm font-semibold hidden md:inline">Adinkra Media</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex space-x-8 text-sm">

            <Link to="/" className="hover:text-adinkra-highlight transition-colors" title="Home">
              <Home className="w-6 h-6" />
            </Link>

            <Link to="/audio" className="hover:text-adinkra-highlight transition-colors" title="Audio Store">
              <Music2 className="w-6 h-6" />
            </Link>

            <Link to="/gallery" className="hover:text-adinkra-highlight transition-colors" title="Gallery">
              <Film className="w-6 h-6" />
            </Link>

            <Link to="/contact" className="hover:text-adinkra-highlight transition-colors" title="Hire / Contact">
              <Mail className="w-6 h-6" />
            </Link>

          </nav>

          {/* Zen Orb Player */}
          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 transition text-adinkra-gold"
            title="Open Player"
          >
            <Music className="w-6 h-6" />
          </button>

          <AuthButton />
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-4">

          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 transition text-adinkra-gold"
          >
            <Music className="w-6 h-6" />
          </button>

          <button
            className="text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden w-full bg-adinkra-card text-adinkra-gold px-6 py-6 space-y-6 text-center animate-slideDown">

          <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 hover:text-adinkra-highlight">
            <Home className="w-6 h-6" /> Home
          </Link>

          <Link to="/audio" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 hover:text-adinkra-highlight">
            <Music2 className="w-6 h-6" /> Audio Store
          </Link>

          <Link to="/gallery" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 hover:text-adinkra-highlight">
            <Film className="w-6 h-6" /> Gallery
          </Link>

          <Link to="/contact" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 hover:text-adinkra-highlight">
            <Mail className="w-6 h-6" /> Hire / Contact
          </Link>

          <div className="pt-6 border-t border-adinkra-highlight flex justify-center">
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
}