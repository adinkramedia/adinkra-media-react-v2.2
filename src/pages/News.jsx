// src/pages/News.jsx
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCard from "../components/SponsorAds";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import WaveformPlayer from "../components/WaveformPlayer";
import { useAuth0 } from "@auth0/auth0-react";
import AuthButton from "../components/AuthButton";
import PayPalSubscribeButton from "../components/PayPalSubscribeButton"; // ✅ For R45/month sub

// ✅ Updated to use Vite env variables
const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const categories = [
  "All",
  "Politics",
  "Sports",
  "Business",
  "Technology",
  "Cultural",
  "International Affairs",
  "Science & Heritage",
  "Conflict & Humanitarian",
  "Health",
  "Crime",
  "Entertainment",
  "News",
];

const articleTypes = ["All", "Breaking", "Analysis", "Feature", "Opinion", "News", "Sports", "Deep Feature", "Exclusive Feature"];
const restrictedTypes = ["Deep Feature", "Opinion", "Analysis", "Exclusive Feature"]; // 🔒 Premium articles
const loginOnlyTypes = ["News", "Sports", "Feature", "Analysis", "Exclusive Feature", "Deep Feature"]; // 🧑‍💻 Require Auth0 login

function CollapsibleAudioBox({ clip }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth0();
  const { title, date, description, audioFile } = clip.fields;
  const audioUrl = `https:${audioFile.fields.file.url}`;

  return (
    <div className="max-w-xl mx-auto relative">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full cursor-pointer rounded-lg bg-adinkra-highlight/20 border border-adinkra-highlight text-adinkra-highlight px-6 py-4 flex items-center justify-between hover:bg-adinkra-highlight/40 transition"
        >
          <span className="font-semibold text-lg truncate">{title}</span>
          <span className="text-2xl leading-none">▶</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-adinkra-card rounded-lg border border-adinkra-highlight p-6 shadow-md relative overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-adinkra-gold hover:text-yellow-500 font-bold text-xl"
          >
            ✕
          </button>

          {!isAuthenticated && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center px-4 rounded-lg">
              <p className="text-lg font-semibold mb-4">Please log in to access this content.</p>
              <AuthButton />
            </div>
          )}

          <h2 className="text-2xl font-bold text-adinkra-highlight mb-2">{title}</h2>
          <p className="text-sm italic text-adinkra-gold/70 mb-3">
            {new Date(date).toLocaleDateString()}
          </p>
          <WaveformPlayer audioUrl={audioUrl} />
          {description && (
            <div className="prose prose-invert prose-sm text-adinkra-gold max-w-none mt-4">
              {documentToReactComponents(description)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function News() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticleType, setSelectedArticleType] = useState("All");
  const [africaInAMinuteClip, setAfricaInAMinuteClip] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const itemsPerPage = 9;

  useEffect(() => {
    const pageParam = parseInt(query.get("page")) || 1;
    setCurrentPage(pageParam);
  }, [location.search]);

  async function fetchAllNews() {
    let allItems = [];
    let skip = 0;
    const pageSize = 100;
    let total = 0;

    do {
      const res = await client.getEntries({
        content_type: "africanTrendingNews",
        order: "-fields.date",
        limit: pageSize,
        skip,
      });
      allItems = [...allItems, ...res.items];
      total = res.total;
      skip += pageSize;
    } while (skip < total);

    return allItems;
  }

  useEffect(() => {
    fetchAllNews()
      .then((items) => setArticles(items))
      .catch(console.error);

    client
      .getEntries({
        content_type: "africaInAMinuteClip",
        order: "-fields.date",
        limit: 1,
      })
      .then((res) => {
        if (res.items.length > 0) setAfricaInAMinuteClip(res.items[0]);
      })
      .catch(console.error);
  }, []);

  const filteredArticles = articles.filter((post) => {
    const categoryMatch =
      selectedCategory === "All" ||
      (post.fields.category &&
        post.fields.category.toLowerCase() === selectedCategory.toLowerCase());
    const articleTypeMatch =
      selectedArticleType === "All" ||
      (post.fields.articleType &&
        post.fields.articleType.toLowerCase() === selectedArticleType.toLowerCase());
    return categoryMatch && articleTypeMatch;
  });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    navigate(`?page=${page}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSubscribe = () => {
    document.getElementById("subscribe-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen relative">
      <Header />

      {/* 📰 Hero Section */}
      <section className="relative w-full">
        <picture>
          <source media="(min-width: 768px)" srcSet="/news-hero-desktop.jpg" />
          <img
            src="/news-hero-mobile.jpg"
            alt="African Trending News"
            className="w-full h-[40vh] md:h-[55vh] object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-adinkra-gold drop-shadow-lg">
            African Trending News
          </h1>
          <p className="mt-3 text-adinkra-gold/80 text-sm md:text-base px-6 max-w-2xl">
            The pulse of Africa — breaking stories, in-depth features, and cultural highlights from
            Adinkra Media.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* 🎧 Africa in a Minute */}
        {africaInAMinuteClip && <CollapsibleAudioBox clip={africaInAMinuteClip} />}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="max-w-xs w-full">
            <label className="block mb-2 font-semibold text-adinkra-highlight">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-adinkra-card text-adinkra-gold rounded-md px-4 py-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="max-w-xs w-full">
            <label className="block mb-2 font-semibold text-adinkra-highlight">
              Filter by Article Type
            </label>
            <select
              value={selectedArticleType}
              onChange={(e) => setSelectedArticleType(e.target.value)}
              className="w-full bg-adinkra-card text-adinkra-gold rounded-md px-4 py-2"
            >
              {articleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sponsor Ad */}
        <SponsorCard />

        {/* 📰 News Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.map((post) => {
            const { coverImage, summaryExcerpt, newsArticle, date, category, articleType } =
              post.fields;
            const cover = coverImage?.fields?.file?.url;
            const postDate = new Date(date).toLocaleDateString();
            const isRestricted = restrictedTypes.includes(articleType);
            const isLoginOnly = loginOnlyTypes.includes(articleType);

            return (
              <div
                key={post.sys.id}
                className="relative bg-adinkra-card rounded-xl border border-adinkra-highlight p-4 shadow-md overflow-hidden"
              >
                {cover && (
                  <div
                    className="h-48 bg-cover bg-center rounded mb-4"
                    style={{ backgroundImage: `url(https:${cover})` }}
                  />
                )}
                <h3 className="text-xl font-semibold mb-1">{newsArticle}</h3>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="italic text-adinkra-gold/60">{category}</span>
                  {articleType && (
                    <span className="px-2 py-0.5 bg-adinkra-highlight/30 text-adinkra-highlight text-xs rounded">
                      {articleType}
                    </span>
                  )}
                </div>
                <p className="text-sm text-adinkra-gold/70 mb-2">{postDate}</p>
                <p className="text-sm text-adinkra-gold/90 mb-4">{summaryExcerpt}</p>

                {/* 🔒 Logic for different article types */}
                {isLoginOnly && !isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-sm text-adinkra-gold/70 mb-2">
                      🔒 Breaking News — Log in to Read
                    </p>
                    <button
                      onClick={() => loginWithRedirect()}
                      className="px-4 py-2 bg-adinkra-highlight text-black rounded font-semibold"
                    >
                      Log In
                    </button>
                  </div>
                ) : (
                  <Link
                    to={`/news-article/${post.sys.id}`}
                    className="inline-block text-adinkra-highlight font-semibold hover:underline"
                  >
                    {isRestricted ? "Read Preview →" : "Read More →"}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center flex-wrap gap-3 mt-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-adinkra-highlight text-adinkra-bg rounded disabled:opacity-50"
            >
              ← Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1.5 rounded ${
                  i + 1 === currentPage
                    ? "bg-adinkra-highlight text-adinkra-bg font-semibold"
                    : "bg-adinkra-card text-adinkra-gold/70 hover:bg-adinkra-highlight/30"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-adinkra-highlight text-adinkra-bg rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}

        {/* 💳 Subscription Section */}
        <div id="subscribe-section" className="mt-20 text-center">
          <PayPalSubscribeButton />
        </div>
      </section>
    </div>
  );
}
