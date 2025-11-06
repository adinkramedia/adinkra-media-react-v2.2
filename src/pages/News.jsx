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
import PayPalSubscribeButton from "../components/PayPalSubscribeButton";
import AdsterraEmbed from "../components/AdsterraEmbed";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const categories = [
  "All", "Politics", "Sports", "Business", "Technology",
  "Cultural", "International Affairs", "Science & Heritage",
  "Conflict & Humanitarian", "Health", "Crime", "Entertainment", "News"
];

const articleTypes = [
  "All", "Breaking", "Analysis", "Feature", "Opinion",
  "News", "Sports", "Deep Feature", "Exclusive Feature"
];

const restrictedTypes = ["Deep Feature", "Opinion", "Analysis", "Exclusive Feature"];
const loginOnlyTypes = ["News", "Sports", "Feature", "Analysis", "Exclusive Feature", "Deep Feature"];

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

  const handleReadMore = (articleId) => {
    sessionStorage.setItem("newsLastPage", `/news?page=${currentPage}`);
    sessionStorage.setItem("newsScrollPosition", window.scrollY.toString());
    navigate(`/news-article/${articleId}`);
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen relative">
      <Header />

      {/* === Hero === */}
      <section className="relative w-full overflow-hidden rounded-b-2xl">
        <picture>
          <source media="(max-width: 767px)" srcSet="/news-hero-mobile.jpg" />
          <source media="(min-width: 768px)" srcSet="/news-hero-desktop.jpg" />
          <img
            src="/news-hero-desktop.jpg"
            alt="Adinkra News"
            className="w-full h-[80vh] md:h-[95vh] object-cover object-center"
          />
        </picture>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-adinkra-gold drop-shadow-xl">
            Adinkra News
          </h1>
          <p className="mt-4 text-adinkra-gold/90 text-sm md:text-lg px-6 max-w-3xl leading-relaxed">
            The pulse of Africa — breaking stories, deep features, and cultural highlights from Adinkra Media.
          </p>
        </div>
      </section>

      {/* === Top Ads === */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">
        <div className="hidden md:flex justify-center">
          <AdsterraEmbed adKey="825faa72504bd8a6ee1bac5b8cd098af" width={728} height={90} />
        </div>
        <div className="flex md:hidden justify-center">
          <AdsterraEmbed adKey="f58bb7dacd9d77f1bcea231e9e2052b5" width={320} height={50} />
        </div>
      </div>

      {/* === Main === */}
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative">
        {/* Sidebar ad for desktop */}
        <div className="hidden lg:block absolute right-0 top-40">
          <AdsterraEmbed adKey="c3f61289b3cda0ec1a125e7a15d941b9" width={160} height={600} />
        </div>

        {africaInAMinuteClip && <CollapsibleAudioBox clip={africaInAMinuteClip} />}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="max-w-xs w-full">
            <label className="block mb-2 font-semibold text-adinkra-highlight">Filter by Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-adinkra-card text-adinkra-gold rounded-md px-4 py-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="max-w-xs w-full">
            <label className="block mb-2 font-semibold text-adinkra-highlight">Filter by Article Type</label>
            <select
              value={selectedArticleType}
              onChange={(e) => setSelectedArticleType(e.target.value)}
              className="w-full bg-adinkra-card text-adinkra-gold rounded-md px-4 py-2"
            >
              {articleTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <SponsorCard />

        {/* Mid-page Ad */}
        <div className="flex justify-center my-8">
          <AdsterraEmbed adKey="a298f58fd2749e1a84b4deecb8a1eeb3" width={300} height={250} />
        </div>

        {/* Articles Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {paginatedArticles.map((post) => {
            const { coverImage, summaryExcerpt, newsArticle, date, category, articleType } = post.fields;
            const cover = coverImage?.fields?.file?.url;
            const postDate = new Date(date).toLocaleDateString();
            const isRestricted = restrictedTypes.includes(articleType);
            const isLoginOnly = loginOnlyTypes.includes(articleType);

            return (
              <div key={post.sys.id} className="relative bg-adinkra-card rounded-xl border border-adinkra-highlight p-4 shadow-md overflow-hidden">
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

                {isLoginOnly && !isAuthenticated ? (
                  <div className="text-center">
                    <p className="text-sm text-adinkra-gold/70 mb-2">🔒 Log in to Read</p>
                    <button
                      onClick={() => loginWithRedirect()}
                      className="px-4 py-2 bg-adinkra-highlight text-black rounded font-semibold"
                    >
                      Log In
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleReadMore(post.sys.id)}
                    className="text-adinkra-highlight font-semibold hover:underline"
                  >
                    {isRestricted ? "Read Preview →" : "Read More →"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Inline ad after grid */}
        <div className="flex justify-center mt-12">
          <AdsterraEmbed adKey="b52e627e4eb7e7f56f4e92a8b2bb563e" width={336} height={280} />
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

        {/* Bottom Ads */}
        <div className="flex flex-col items-center space-y-4 mt-16">
          <div className="hidden md:block">
            <AdsterraEmbed adKey="dc7f5b8c67215c232e41e7b3172fcb35" width={468} height={60} />
          </div>
          <div className="block md:hidden">
            <AdsterraEmbed adKey="e8a9bc2af416d1c4c7eeaf7776c9d098" width={300} height={100} />
          </div>
        </div>

        <div id="subscribe-section" className="mt-20 text-center">
          <PayPalSubscribeButton />
        </div>
      </section>

      
    </div>
  );
}
