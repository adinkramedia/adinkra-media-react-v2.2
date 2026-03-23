import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import AnalyticsTracker from "./components/AnalyticsTracker";
import ProtectedContent from "./components/ProtectedContent";

// Global Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Audio Player
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import BackgroundAudioPlayer from "./components/BackgroundAudioPlayer";

// Pages
import Home from "./pages/Home";
import Audio from "./pages/Audio";
import Downloads from "./pages/Downloads"; // <--- Added Downloads
import HouseOfAusar from "./pages/HouseOfAusar";
import HouseArticle from "./pages/HouseArticle";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";

// ✅ FIXED IMPORT NAME
import AdinkraGallery from "./pages/AdinkraGallery";

import TVVideoPage from "./pages/TVVideoPage";
import PremiumTV from "./pages/PremiumTV";
import PremiumVideo from "./pages/PremiumVideo";
import Contact from "./pages/Contact";

// Games
import Games from "./Games/Games";
import MorabarabaGame from "./Games/MorabarabaGame";

export default function App() {
  const [audioCartOpen, setAudioCartOpen] = useState(false);

  return (
    <PayPalScriptProvider
      options={{
        "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
      }}
    >
      <AudioPlayerProvider>
        <div className="min-h-screen flex flex-col bg-adinkra-bg text-adinkra-gold relative">
          <AnalyticsTracker />

          {/* Global Navbar */}
          <Header />

          {/* Persistent Audio Player */}
          <BackgroundAudioPlayer />

          {/* Page Content */}
          <div className="flex-1 relative pt-20">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Audio Pages */}
              <Route path="/audio" element={<Audio />} />
              <Route path="/downloads" element={<Downloads />} />

              {/* House of Ausar (can remove later if you fully replace it) */}
              <Route path="/house-of-ausar" element={<HouseOfAusar />} />
              <Route path="/house-article/:id" element={<HouseArticle />} />
              <Route path="/house/:id" element={<HouseArticle />} />

              {/* News */}
              <Route path="/news" element={<News />} />
              <Route path="/news-article/:slug" element={<NewsArticle />} />

              {/* ✅ GALLERY (correct now) */}
              <Route path="/gallery" element={<AdinkraGallery />} />
              <Route path="/tv-video/:id" element={<TVVideoPage />} />

              {/* Premium */}
              <Route path="/premium-tv" element={<PremiumTV />} />
              <Route path="/premium-tv/:id" element={<PremiumVideo />} />

              {/* Games */}
              <Route path="/games" element={<Games />} />
              <Route path="/games/morabaraba" element={<MorabarabaGame />} />

              {/* Contact */}
              <Route path="/contact" element={<Contact />} />

              {/* Protected */}
              <Route
                path="/features"
                element={
                  <ProtectedContent>
                    <h1 className="text-center mt-20 text-2xl">
                      Features Page
                    </h1>
                  </ProtectedContent>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <h1 className="text-center mt-20 text-adinkra-highlight text-2xl">
                    404 — Page Not Found
                  </h1>
                }
              />
            </Routes>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </AudioPlayerProvider>
    </PayPalScriptProvider>
  );
}