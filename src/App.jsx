import { Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import AnalyticsTracker from "./components/AnalyticsTracker";

// Global Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Audio Player
import { AudioPlayerProvider } from "./components/AudioPlayerContext";
import BackgroundAudioPlayer from "./components/BackgroundAudioPlayer";

// Pages
import Home from "./pages/Home";
import Downloads from "./pages/Downloads";
import SubmitProject from "./pages/SubmitProject";
import About from "./pages/About";               // ← changed from Contact

import AdinkraGallery from "./pages/AdinkraGallery";

import TVVideoPage from "./pages/TVVideoPage";
import PremiumTV from "./pages/PremiumTV";
import PremiumVideo from "./pages/PremiumVideo";

import UploadTrack from "./pages/UploadTrack";
import CreateAlbum from "./pages/CreateAlbum";

// Contributor
import ContributorPage from "./pages/ContributorPage";
import ContributorDashboard from "./pages/ContributorDashboard";

// Admin
import AdminModeration from "./pages/AdminModeration";

// Terms
import Terms from "./pages/Terms";

// Privacy
import Privacy from "./pages/Privacy";

// Refund
import Refunds from "./pages/Refunds";

// Games
import Games from "./Games/Games";
import MorabarabaGame from "./Games/MorabarabaGame";

export default function App() {
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

              {/* DOWNLOADS */}
              <Route path="/downloads" element={<Downloads />} />

              {/* SUBMIT PROJECT */}
              <Route path="/submit-project" element={<SubmitProject />} />

              {/* ABOUT */}
              <Route path="/about" element={<About />} />

              {/* CONTRIBUTORS */}
              <Route path="/contributor/:slug" element={<ContributorPage />} />
              <Route path="/dashboard" element={<ContributorDashboard />} />
              <Route path="/dashboard/upload-track" element={<UploadTrack />} />
              <Route path="/dashboard/create-album" element={<CreateAlbum />} />

              {/* ADMIN MODERATION */}
              <Route path="/admin/moderation" element={<AdminModeration />} />

              {/* GALLERY */}
              <Route path="/gallery" element={<AdinkraGallery />} />

              {/* TV */}
              <Route path="/tv-video/:id" element={<TVVideoPage />} />
              <Route path="/premium-tv" element={<PremiumTV />} />
              <Route path="/premium-tv/:id" element={<PremiumVideo />} />

              {/* GAMES */}
              <Route path="/games" element={<Games />} />
              <Route path="/games/morabaraba" element={<MorabarabaGame />} />

              {/* LEGAL */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refunds" element={<Refunds />} />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="py-32 text-center">
                    <h1 className="text-4xl font-bold text-adinkra-highlight">404</h1>
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