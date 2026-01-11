import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import {
  Home,
  Music2,          // ← Changed from MusicNotes (this exists!)
  Book,
  Newspaper,
  Tv,
  Mail,
  Music,
} from "lucide-react";
import AuthButton from "./AuthButton";
import { useAudioPlayer } from "./AudioPlayerContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { setIsPlayerOpen } = useAudioPlayer(); // toggle Zen Orb from context

  return (
    <header className="w-full bg-adinkra-bg text-adinkra-gold shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold">Adinkra Media</h1>

        {/* Desktop Nav - Icons only */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex space-x-8 text-sm">
            <Link to="/" className="hover:text-adinkra-highlight transition-colors" title="Home">
              <Home className="w-6 h-6" />
            </Link>
            <Link to="/audio" className="hover:text-adinkra-highlight transition-colors" title="Audio">
              <Music2 className="w-6 h-6" /> {/* ← Fixed icon */}
            </Link>
            <Link
              to="/house-of-ausar"
              className="hover:text-adinkra-highlight transition-colors"
              title="House of Ausar"
            >
              <Book className="w-6 h-6" />
            </Link>
            <Link to="/news" className="hover:text-adinkra-highlight transition-colors" title="News">
              <Newspaper className="w-6 h-6" />
            </Link>
            <Link to="/tv" className="hover:text-adinkra-highlight transition-colors" title="Adinkra TV">
              <Tv className="w-6 h-6" />
            </Link>
            <Link to="/contact" className="hover:text-adinkra-highlight transition-colors" title="Contact">
              <Mail className="w-6 h-6" />
            </Link>
          </nav>

          {/* Zen Orb Music Button */}
          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 transition text-adinkra-gold focus:outline-none"
            aria-label="Open Zen Orb Music Player"
            title="Zen Orb"
          >
            <Music className="w-6 h-6" />
          </button>

          {/* Auth Button on Desktop */}
          <AuthButton />
        </div>

        {/* Hamburger for Mobile */}
        <div className="md:hidden flex items-center gap-4">
          {/* Zen Orb Music Button on Mobile */}
          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 transition text-adinkra-gold focus:outline-none"
            aria-label="Open Zen Orb Music Player"
            title="Zen Orb"
          >
            <Music className="w-6 h-6" />
          </button>

          <button
            className="text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav - Icons + Text */}
      {menuOpen && (
        <div className="md:hidden bg-adinkra-card text-adinkra-gold px-6 py-6 space-y-6 text-center animate-slideDown">
          <Link
            to="/"
            className="flex items-center justify-center gap-3 hover:text-adinkra-highlight transition"
            onClick={() => setMenuOpen(false)}
          >
            <Home className="w-6 h-6" /> Home
          </Link>
          <Link
            to="/audio"
            className="flex items-center justify-center gap-3 hover:text-adinkra-highlight transition"
            onClick={() => setMenuOpen(false)}
          >
            <Music2 className="w-6 h-6" /> Audio  {/* ← Fixed icon */}
          </Link>
          <Link
            to="/house-of-ausar"
            className="flex items-center justify-center gap-3 hover:text-adinkra-highlight transition"
            onClick={() => setMenuOpen(false)}
          >
            <Book className="w-6 h-6" /> House of Ausar
          </Link>
          <Link
            to="/news"
            className="flex items-center justify-center gap-3 hover:text-adinkra-highlight transition"
            onClick={() => setMenuOpen(false)}
          >
            <Newspaper className="w-6 h-6" /> News
          </Link>
          <Link
            to="/tv"
            className="flex items-center justify-center gap-3 hover:text-adinkra-highlight transition"
            onClick={() => setMenuOpen(false)}
          >
            <Tv className="w-6 h-6" /> Adinkra TV
          </Link>
          <Link
            to="/contact"
            className="flex items-center justify-center gap-3 hover:text-adinkra-highlight transition"
            onClick={() => setMenuOpen(false)}
          >
            <Mail className="w-6 h-6" /> Contact
          </Link>

          {/* Auth Button in Mobile Nav */}
          <div className="pt-6 border-t border-adinkra-highlight flex justify-center">
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
}