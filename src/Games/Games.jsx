// src/Games/Games.jsx
import { Link } from "react-router-dom";

export default function Games() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 bg-adinkra-bg text-adinkra-gold">
      {/* ✅ Back Button (same style as NewsArticle.jsx) */}
      <div className="mb-6">
        <Link
          to="/news"
          className="inline-block bg-adinkra-card text-adinkra-highlight px-4 py-2 rounded-full border border-adinkra-highlight hover:bg-adinkra-highlight hover:text-black transition"
        >
          ← Back to News
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-adinkra-highlight">
        Adinkra Games
      </h1>
      <p className="mb-8 text-adinkra-gold">
        Just like traditional newspapers had games, here you can enjoy
        Pan-African inspired classics and modern creations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Morabaraba */}
        <Link
          to="/games/morabaraba"
          className="bg-adinkra-card p-6 rounded-2xl shadow-lg hover:shadow-xl transition flex flex-col items-center justify-center text-center"
        >
          <div className="w-full h-40 bg-adinkra-highlight/20 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-adinkra-highlight font-semibold text-lg">
              Morabaraba
            </span>
          </div>
          <h2 className="text-xl font-semibold">Morabaraba</h2>
          <p className="text-sm text-adinkra-gold mt-2">
            A traditional African strategy board game. Play with your friends.
          </p>
        </Link>

        {/* Placeholder for future games */}
        <div className="bg-adinkra-card p-4 rounded-2xl shadow-md opacity-70">
          <div className="w-full h-40 bg-adinkra-highlight/20 rounded-xl mb-4 flex items-center justify-center">
            <span className="text-adinkra-highlight">Coming Soon</span>
          </div>
          <h2 className="text-xl font-semibold">More Games</h2>
          <p className="text-sm text-adinkra-gold mt-2">
            Stay tuned for more Pan-African inspired games.
          </p>
        </div>
      </div>
    </section>
  );
}
