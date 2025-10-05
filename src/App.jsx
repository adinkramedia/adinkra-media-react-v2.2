// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AnalyticsTracker from "./components/AnalyticsTracker";
import ProtectedContent from "./components/ProtectedContent";

// Global Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Audio Player (global)
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import BackgroundAudioPlayer from "./components/BackgroundAudioPlayer";

// Pages
import Home from "./pages/Home";
import Audio from "./pages/Audio";
import HouseOfAusar from "./pages/HouseOfAusar";
import HouseArticle from "./pages/HouseArticle";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Apply from "./pages/Apply";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import SubmitArticle from "./pages/SubmitArticle";
import AdinkraTV from "./pages/AdinkraTV";
import TVVideoPage from "./pages/TVVideoPage";
import PremiumTV from "./pages/PremiumTV";
import PremiumVideo from "./pages/PremiumVideo";
import Contact from "./pages/Contact";
import ShareDashboard from "./pages/ShareDashboard";

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

        {/* Page Content */}
        <div className="flex-1 relative pt-20">
          {/* added pt-20 to push content below sticky header */}
          <Routes>
            {/* Core Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/house-of-ausar" element={<HouseOfAusar />} />
            <Route path="/news" element={<News />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/submit-article" element={<SubmitArticle />} />
            <Route path="/contact" element={<Contact />} />

            {/* Public Contributor Profile */}
            <Route path="/contributor/:id" element={<ShareDashboard />} />

            {/* Article Pages */}
            <Route path="/house-article/:id" element={<HouseArticle />} />
            <Route path="/house/:id" element={<HouseArticle />} />
            <Route path="/news-article/:id" element={<NewsArticle />} />
            <Route path="/news/:id" element={<NewsArticle />} />

            {/* Adinkra TV */}
            <Route path="/adinkra-tv" element={<AdinkraTV />} />
            <Route path="/tv" element={<Navigate to="/adinkra-tv" replace />} />
            <Route path="/tv-video/:id" element={<TVVideoPage />} />

            {/* Premium TV */}
            <Route path="/premium-tv" element={<PremiumTV />} />
            <Route path="/premium-tv/:id" element={<PremiumVideo />} />

            {/* Games Hub & Individual Games */}
            <Route path="/games" element={<Games />} />
            <Route path="/games/morabaraba" element={<MorabarabaGame />} />

            {/* ✅ Protected Sections */}
            <Route
              path="/features"
              element={
                <ProtectedContent>
                  <h1 className="text-center mt-20 text-2xl">Features Page</h1>
                </ProtectedContent>
              }
            />
            <Route
              path="/opinions"
              element={
                <ProtectedContent>
                  <h1 className="text-center mt-20 text-2xl">Opinions Page</h1>
                </ProtectedContent>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedContent>
                  <h1 className="text-center mt-20 text-2xl">Analysis Page</h1>
                </ProtectedContent>
              }
            />

            {/* Catch-All */}
            <Route
              path="*"
              element={
                <h1 className="text-center mt-20 text-adinkra-highlight text-2xl">
                  404 — Page Not Found
                </h1>
              }
            />
          </Routes>

          {/* Floating background audio player (global) */}
          <BackgroundAudioPlayer />
        </div>

        {/* Global Footer */}
        <Footer />
      </div>
    </AudioPlayerProvider>
  );
}
