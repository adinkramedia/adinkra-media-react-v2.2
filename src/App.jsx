import { Routes, Route } from "react-router-dom";
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
import Downloads from "./pages/Downloads";

import HouseOfAusar from "./pages/HouseOfAusar";
import HouseArticle from "./pages/HouseArticle";

import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";

import AdinkraGallery from "./pages/AdinkraGallery";

import TVVideoPage from "./pages/TVVideoPage";
import PremiumTV from "./pages/PremiumTV";
import PremiumVideo from "./pages/PremiumVideo";

import Contact from "./pages/Contact";

// Contributor
import ContributorPage from "./pages/ContributorPage";
import ContributorDashboard from "./pages/ContributorDashboard";

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

          <Header />

          <BackgroundAudioPlayer />

          <main className="flex-1 relative pt-20">
            <Routes>

              {/* HOME */}
              <Route path="/" element={<Home />} />

              {/* AUDIO */}
              <Route path="/audio" element={<Audio />} />
              <Route path="/downloads" element={<Downloads />} />

              {/* CONTRIBUTORS */}
              <Route path="/contributor/:slug" element={<ContributorPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedContent>
                    <ContributorDashboard />
                  </ProtectedContent>
                }
              />

              {/* HOUSE OF AUSAR */}
              <Route path="/house-of-ausar" element={<HouseOfAusar />} />
              <Route path="/house-article/:id" element={<HouseArticle />} />
              <Route path="/house/:id" element={<HouseArticle />} />

              {/* NEWS */}
              <Route path="/news" element={<News />} />
              <Route path="/news-article/:slug" element={<NewsArticle />} />

              {/* GALLERY */}
              <Route path="/gallery" element={<AdinkraGallery />} />

              {/* TV */}
              <Route path="/tv-video/:id" element={<TVVideoPage />} />
              <Route path="/premium-tv" element={<PremiumTV />} />
              <Route path="/premium-tv/:id" element={<PremiumVideo />} />

              {/* GAMES */}
              <Route path="/games" element={<Games />} />
              <Route path="/games/morabaraba" element={<MorabarabaGame />} />

              {/* CONTACT */}
              <Route path="/contact" element={<Contact />} />

              {/* PROTECTED TEST AREA */}
              <Route
                path="/features"
                element={
                  <ProtectedContent>
                    <div className="py-20 text-center">
                      <h1 className="text-3xl font-bold text-adinkra-highlight">
                        Features
                      </h1>
                      <p className="mt-4 text-adinkra-gold/70">
                        Protected content area
                      </p>
                    </div>
                  </ProtectedContent>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="py-32 text-center">
                    <h1 className="text-4xl font-bold text-adinkra-highlight">
                      404
                    </h1>
                    <p className="mt-3 text-adinkra-gold/60">
                      The page you're looking for doesn't exist.
                    </p>
                  </div>
                }
              />

            </Routes>
          </main>

          <Footer />

        </div>
      </AudioPlayerProvider>
    </PayPalScriptProvider>
  );
}