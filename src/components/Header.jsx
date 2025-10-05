import { useState } from "react";
import { Link } from "react-router-dom"; 
import { FiMenu, FiX } from "react-icons/fi";
import AuthButton from "./AuthButton";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full bg-adinkra-bg text-adinkra-gold shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold">Adinkra Media</h1>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex space-x-6 text-sm font-medium">
            <Link to="/" className="hover:text-adinkra-highlight">Home</Link>
            <Link to="/audio" className="hover:text-adinkra-highlight">Audio</Link>
            <Link to="/house-of-ausar" className="hover:text-adinkra-highlight">House of Ausar</Link>
            <Link to="/news" className="hover:text-adinkra-highlight">News</Link>
            <Link to="/tv" className="hover:text-adinkra-highlight">Adinkra TV</Link>
            <Link to="/contact" className="hover:text-adinkra-highlight">Contact</Link>
          </nav>

          {/* ✅ Auth Button on Desktop */}
          <AuthButton />
        </div>

        {/* Hamburger for Mobile */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-adinkra-card text-adinkra-gold px-6 py-4 space-y-4 text-center animate-slideDown">
          <Link to="/" className="block hover:text-adinkra-highlight" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/audio" className="block hover:text-adinkra-highlight" onClick={() => setMenuOpen(false)}>Audio</Link>
          <Link to="/house-of-ausar" className="block hover:text-adinkra-highlight" onClick={() => setMenuOpen(false)}>House of Ausar</Link>
          <Link to="/news" className="block hover:text-adinkra-highlight" onClick={() => setMenuOpen(false)}>News</Link>
          <Link to="/tv" className="block hover:text-adinkra-highlight" onClick={() => setMenuOpen(false)}>Adinkra TV</Link>
          <Link to="/contact" className="block hover:text-adinkra-highlight" onClick={() => setMenuOpen(false)}>Contact</Link>

          {/* ✅ Auth Button inside Mobile Nav */}
          <div className="pt-4 border-t border-adinkra-highlight flex justify-center">
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
}
