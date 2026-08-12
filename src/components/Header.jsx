import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

import {
  Activity,
  Home,
  Film,
  Info,
  Music,
  Settings,
  Upload,
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
  } = useAuth0();

  return (
    <header className="w-full bg-adinkra-bg text-adinkra-gold shadow-md fixed top-0 left-0 z-50">

      <div className="w-full flex items-center justify-between px-6 py-4">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <Activity className="w-10 h-10 text-adinkra-gold" />

          <span className="text-sm font-semibold hidden md:inline">
            Adinkra Media
          </span>
        </Link>


        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <div className="hidden md:flex items-center gap-8">

          <nav className="flex items-center space-x-8 text-sm">

            {/* HOME */}

            <Link
              to="/"
              className="hover:text-adinkra-highlight transition-colors"
              title="Home"
            >
              <Home className="w-6 h-6" />
            </Link>


            {/* GALLERY */}

            <Link
              to="/gallery"
              className="hover:text-adinkra-highlight transition-colors"
              title="Gallery"
            >
              <Film className="w-6 h-6" />
            </Link>


            {/* ABOUT */}

            <Link
              to="/about"
              className="hover:text-adinkra-highlight transition-colors"
              title="About"
            >
              <Info className="w-6 h-6" />
            </Link>


            {/* SUBMIT PROJECT */}

            <Link
              to="/submit-project"
              className="hover:text-adinkra-highlight transition-colors"
              title="Submit Project"
            >
              <Upload className="w-6 h-6" />
            </Link>

          </nav>


          {/* =================================================
              AUDIO PLAYER
          ================================================= */}

          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 transition"
            title="Open Audio Player"
          >
            <Music className="w-6 h-6" />
          </button>


          {/* =================================================
              STUDIO
          ================================================= */}

          {!isLoading && isAuthenticated && (
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-adinkra-highlight text-adinkra-bg font-semibold hover:opacity-90 transition"
            >
              <Settings className="w-5 h-5" />
              Studio
            </button>
          )}


          {/* =================================================
              AUTH
          ================================================= */}

          <AuthButton />

        </div>


        {/* =================================================
            MOBILE CONTROLS
        ================================================= */}

        <div className="md:hidden flex items-center gap-4">

          {/* AUDIO PLAYER */}

          <button
            onClick={() => setIsPlayerOpen(true)}
            className="p-2 rounded-full bg-adinkra-highlight/20"
            title="Open Audio Player"
          >
            <Music className="w-6 h-6" />
          </button>


          {/* MENU */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl"
            aria-label={
              menuOpen
                ? "Close menu"
                : "Open menu"
            }
          >
            {menuOpen ? (
              <FiX />
            ) : (
              <FiMenu />
            )}
          </button>

        </div>

      </div>


      {/* =================================================
          MOBILE MENU
      ================================================= */}

      {menuOpen && (
        <div className="md:hidden bg-adinkra-card px-6 py-6 space-y-6 text-center">

          {/* HOME */}

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Home className="w-6 h-6" />
            Home
          </Link>


          {/* GALLERY */}

          <Link
            to="/gallery"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Film className="w-6 h-6" />
            Gallery
          </Link>


          {/* ABOUT */}

          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Info className="w-6 h-6" />
            About
          </Link>


          {/* SUBMIT PROJECT */}

          <Link
            to="/submit-project"
            onClick={() => setMenuOpen(false)}
            className="flex justify-center items-center gap-3"
          >
            <Upload className="w-6 h-6" />
            Submit Project
          </Link>


          {/* STUDIO */}

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


          {/* AUTH */}

          <div className="pt-6 border-t border-adinkra-highlight">
            <AuthButton />
          </div>

        </div>
      )}

    </header>
  );
}