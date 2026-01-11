import { Routes, Route, Navigate } from "react-router-dom";
import AnalyticsTracker from "./components/AnalyticsTracker";
import ProtectedContent from "./components/ProtectedContent";

// Global Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Audio Player
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import BackgroundAudioPlayer from "./components/BackgroundAudioPlayer"; // ← Add this import!

// Pages
import Home from "./pages/Home";
import Audio from "./pages/Audio";
import HouseOfAusar from "./pages/HouseOfAusar";
import HouseArticle from "./pages/HouseArticle";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import AdinkraTV from "./pages/AdinkraTV";
import TVVideoPage from "./pages/TVVideoPage";
import PremiumTV from "./pages/PremiumTV";
import PremiumVideo from "./pages/PremiumVideo";
import Contact from "./pages/Contact";

// Games
import Games from "./Games/Games";
import MorabarabaGame from "./Games/MorabarabaGame";

export default function App() {
  return (
    <AudioPlayerProvider>
      <div className="min-h-screen flex flex-col bg-adinkra-bg text-adinkra-gold">
        <AnalyticsTracker />

        {/* Global Navbar */}
        <Header />

        {/* Zen Orb Player Panel - persistent, but hidden until toggled */}
        <BackgroundAudioPlayer /> {/* ← Add this line! (pass isSubscribed if needed) */}

        {/* Page Content */}
        <div className="flex-1 relative pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/house-of-ausar" element={<HouseOfAusar />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/house-article/:id" element={<HouseArticle />} />
            <Route path="/house/:id" element={<HouseArticle />} />
            <Route path="/news-article/:slug" element={<NewsArticle />} />

            <Route path="/adinkra-tv" element={<AdinkraTV />} />
            <Route path="/tv" element={<Navigate to="/adinkra-tv" replace />} />
            <Route path="/tv-video/:id" element={<TVVideoPage />} />

            <Route path="/premium-tv" element={<PremiumTV />} />
            <Route path="/premium-tv/:id" element={<PremiumVideo />} />

            <Route path="/games" element={<Games />} />
            <Route path="/games/morabaraba" element={<MorabarabaGame />} />

            {/* Protected example routes */}
            <Route
              path="/features"
              element={
                <ProtectedContent>
                  <h1 className="text-center mt-20 text-2xl">Features Page</h1>
                </ProtectedContent>
              }
            />

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
  );
}