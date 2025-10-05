// src/pages/Audio.jsx
import { useEffect, useState, useRef } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AccordionFaq from "../components/AccordionFaq";
import WaveformPlayer from "../components/WaveformPlayer";
import { useLocation, useNavigate } from "react-router-dom";
import SponsorAds from "../components/SponsorAds";
import PayPalButton from "../components/PayPalButton";

// ✅ Contentful client using environment variables
const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

// ✅ Licensing FAQ
const licensingFaqs = [
  {
    question: "Can I use these tracks commercially?",
    answer:
      "Yes. Unless stated otherwise, you may use Adinkra Audio in films, podcasts, games, or educational content with credit.",
  },
  {
    question: "What license do I get when I purchase?",
    answer:
      "You receive a royalty-free license for life. You're allowed to use it in multiple projects without paying again.",
  },
  {
    question: "What am I NOT allowed to do?",
    answer:
      "You can't resell or redistribute the raw audio as-is (e.g., upload to stock platforms, remix and sell, etc.).",
  },
];

// ✅ Rich Text rendering options
const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-3 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-inside mb-4">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => <li>{children}</li>,
  },
};

export default function Audio() {
  const [tracks, setTracks] = useState([]);
  const [likes, setLikes] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [purchasedTracks, setPurchasedTracks] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const initialPage = parseInt(query.get("page")) || 1;

  const itemsPerPage = 6;
  const audioRef = useRef(null);
  const [playingUrl, setPlayingUrl] = useState(null);

  // ✅ Set initial page from URL query
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // ✅ Fetch tracks from Contentful
  useEffect(() => {
    client
      .getEntries({ content_type: "audioTrack", order: "-sys.createdAt" })
      .then((res) => {
        setTracks(res.items);
        res.items.forEach((track) => {
          const slug = track.fields.slug || track.sys.id;
          fetchLikeCount(slug);
        });
      })
      .catch(console.error);
  }, []);

  // ✅ Fetch like count from Supabase
  const fetchLikeCount = async (slug) => {
    const { data, error } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      setLikes((prev) => ({ ...prev, [slug]: data.count || 0 }));
    } else if (error && error.code !== "PGRST116") {
      console.error("Fetch error:", error);
    }
  };

  // ✅ Handle Like button
  const handleLike = async (slug) => {
    setLoadingLikes((prev) => ({ ...prev, [slug]: true }));
    const { data: existing, error: fetchError } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing && fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);

      if (!updateError) {
        setLikes((prev) => ({ ...prev, [slug]: existing.count + 1 }));
      }
    } else {
      const { error: insertError } = await supabase
        .from("likes")
        .insert({ slug, type: "audio", count: 1 });

      if (!insertError) {
        setLikes((prev) => ({ ...prev, [slug]: 1 }));
      }
    }
    setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
  };

  // ✅ Categories & filtering
  const allCategories = ["All", ...new Set(tracks.map((t) => t.fields.category || "Audio"))];
  const filteredTracks = tracks.filter((item) => {
    const cat = item.fields.category || "Audio";
    return selectedCategory === "All" || cat === selectedCategory;
  });

  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);
  const paginatedTracks = filteredTracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    navigate(`?page=${page}`);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    navigate(`?page=1`);
  };

  // ✅ Waveform preview toggle
  const togglePreview = (url) => {
    if (playingUrl === url) {
      audioRef.current.pause();
      setPlayingUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingUrl(url);

      audioRef.current.onended = () => setPlayingUrl(null);
      audioRef.current.onerror = () => setPlayingUrl(null);
    }
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[70vh] bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center hidden md:block"
          style={{ backgroundImage: "url('/audio-hero-desktop.jpg')" }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/audio-hero-mobile.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl font-bold mb-4">Adinkra Audio</h1>
          <p className="text-lg max-w-xl">
            Explore royalty-free loops, soundtracks, and FX from Adinkra Media.
          </p>
        </div>
      </section>

      {/* Billboard Sponsor Ad */}
      <div className="my-10 px-6 max-w-6xl mx-auto">
        <SponsorAds />
      </div>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-6 pt-12 flex-grow">
        <div className="flex justify-center mb-12">
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="bg-adinkra-card border border-adinkra-highlight/30 text-adinkra-gold rounded-lg px-4 py-2 focus:ring-2 focus:ring-adinkra-highlight"
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Track Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {paginatedTracks.map((item) => {
            const f = item.fields;
            const slug = f.slug || item.sys.id;
            const title = f.trackTitle;
            const priceRaw = f.priceEuro ?? f.price ?? null;
            const price = f.freeDownload
              ? null
              : priceRaw !== null && !isNaN(priceRaw)
              ? parseFloat(priceRaw).toFixed(2)
              : null;
            const category = f.category || "Audio";
            const cover = f.coverImage?.fields?.file?.url;
            const preview = f.previewAudio?.fields?.file?.url;
            const download = f.fullDownloadFile?.fields?.file?.url;
            const affiliateLinks = f.affiliateLinks;

            return (
              <div
                key={item.sys.id}
                className="group bg-adinkra-card border border-adinkra-highlight/20 rounded-xl shadow hover:shadow-lg transition-all p-5 flex flex-col"
              >
                {/* Cover */}
                <div
                  className="w-full h-40 bg-cover bg-center rounded-lg mb-4 group-hover:scale-[1.02] transition-transform"
                  style={{ backgroundImage: `url(https:${cover})` }}
                />

                {/* Info */}
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-xs uppercase tracking-wide text-adinkra-gold/70 mb-2">
                  {category}
                </p>
                <p className="text-sm font-semibold mb-3">
                  {f.freeDownload
                    ? "Free Download"
                    : price
                    ? `€${price}`
                    : "Contact for Price"}
                </p>

                {/* Like */}
                <button
                  onClick={() => handleLike(slug)}
                  disabled={loadingLikes[slug]}
                  className="self-start mb-3 text-xs px-3 py-1 rounded-full bg-adinkra-highlight text-black hover:bg-yellow-400"
                >
                  {loadingLikes[slug]
                    ? "Liking..."
                    : `👍 Like (${likes[slug] || 0})`}
                </button>

                {/* Preview */}
                {preview && (
                  <div className="mb-3">
                    <WaveformPlayer audioUrl={`https:${preview}`} />
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto">
                  {f.freeDownload && download ? (
                    <button
                      onClick={() => window.open(`https:${download}`, "_blank")}
                      className="w-full py-2 rounded-lg bg-adinkra-highlight text-adinkra-bg font-semibold hover:bg-yellow-500 transition"
                    >
                      ⬇ Free Download
                    </button>
                  ) : price ? (
                    !purchasedTracks[slug] ? (
                      <PayPalButton
                        price={price}
                        title={title}
                        onSuccess={() =>
                          setPurchasedTracks((prev) => ({
                            ...prev,
                            [slug]: true,
                          }))
                        }
                      />
                    ) : (
                      <a
                        href={`https:${download}`}
                        download
                        className="block text-center py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Download {title}
                      </a>
                    )
                  ) : null}
                </div>

                {/* Affiliate Links */}
                {affiliateLinks && (
                  <div className="mt-5 text-xs bg-adinkra-highlight/10 border-t border-adinkra-highlight/20 pt-3 px-2 rounded">
                    {documentToReactComponents(affiliateLinks, richTextOptions)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-adinkra-highlight text-adinkra-bg rounded disabled:opacity-50"
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1.5 rounded ${
                  pageNum === currentPage
                    ? "bg-adinkra-highlight text-adinkra-bg font-semibold"
                    : "bg-adinkra-card text-adinkra-gold/70 hover:bg-adinkra-highlight/30"
                }`}
              >
                {pageNum}
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
      </section>

      {/* Licensing FAQ */}
      <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />

     
    </div>
  );
}
