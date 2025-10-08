import { useEffect, useState, useRef } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AccordionFaq from "../components/AccordionFaq";
import WaveformPlayer from "../components/WaveformPlayer";
import SponsorAds from "../components/SponsorAds";
import PayPalButton from "../components/PayPalButton";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

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

const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-3 leading-relaxed">{children}</p>
    ),
  },
};

export default function Audio() {
  const [tracks, setTracks] = useState([]);
  const [likes, setLikes] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [purchasedTracks, setPurchasedTracks] = useState({});
  const [playingUrl, setPlayingUrl] = useState(null);
  const audioRef = useRef(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    client
      .getEntries({ content_type: "audioTrack", order: "-sys.createdAt" })
      .then((res) => {
        setTracks(res.items);
        res.items.forEach((track) => fetchLikeCount(track.fields.slug));
      })
      .catch(console.error);
  }, []);

  const fetchLikeCount = async (slug) => {
    const { data } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();
    if (data) setLikes((prev) => ({ ...prev, [slug]: data.count || 0 }));
  };

  const handleLike = async (slug) => {
    setLoadingLikes((prev) => ({ ...prev, [slug]: true }));
    const { data: existing } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
      setLikes((prev) => ({ ...prev, [slug]: existing.count + 1 }));
    } else {
      await supabase.from("likes").insert({ slug, type: "audio", count: 1 });
      setLikes((prev) => ({ ...prev, [slug]: 1 }));
    }
    setLoadingLikes((prev) => ({ ...prev, [slug]: false }));
  };

  // ✅ Categories
  const allCategories = ["All", ...new Set(tracks.map((t) => t.fields.category || "Audio"))];
  const filteredTracks =
    selectedCategory === "All"
      ? tracks
      : tracks.filter((t) => t.fields.category === selectedCategory);

  // ✅ Paginated tracks
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTracks = filteredTracks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative w-full h-[70vh] bg-black overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/audio-hero-desktop.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Adinkra Audio</h1>
          <p className="text-lg max-w-xl opacity-90">
            Explore royalty-free loops, melodies & FX — modern sounds inspired by African roots.
          </p>
        </div>
      </section>

      {/* Billboard */}
      <div className="my-10 px-6 max-w-6xl mx-auto">
        <SponsorAds />
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex flex-wrap gap-3 justify-center">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                cat === selectedCategory
                  ? "bg-adinkra-highlight text-adinkra-bg font-semibold"
                  : "bg-adinkra-highlight/20 text-adinkra-gold hover:bg-adinkra-highlight/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentTracks.map((item) => {
          const f = item.fields;
          const slug = f.slug || item.sys.id;
          const title = f.trackTitle;
          const cover = f.coverImage?.fields?.file?.url;
          const preview = f.previewAudio?.fields?.file?.url;
          const download = f.fullDownloadFile?.fields?.file?.url;
          const affiliateLinks = f.affiliateLinks;
          const priceRaw = f.priceEuro ?? f.price ?? null;
          const price = f.freeDownload
            ? null
            : priceRaw !== null && !isNaN(priceRaw)
            ? parseFloat(priceRaw).toFixed(2)
            : null;

          return (
            <div
              key={slug}
              className="bg-adinkra-card border border-adinkra-highlight/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-adinkra-highlight/40 transition-all"
            >
              <div className="relative">
                <img
                  src={`https:${cover}`}
                  alt={title}
                  className="w-full h-48 object-cover"
                />
                {f.freeDownload && (
                  <span className="absolute top-2 right-2 bg-adinkra-highlight text-adinkra-bg text-xs px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-lg truncate">{title}</h3>
                <p className="text-xs uppercase tracking-wide text-adinkra-gold/60">
                  {f.category || "Audio"}
                </p>

                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => handleLike(slug)}
                    disabled={loadingLikes[slug]}
                    className="text-xs bg-adinkra-highlight text-adinkra-bg px-2 py-1 rounded-full hover:bg-yellow-500"
                  >
                    👍 {likes[slug] || 0}
                  </button>
                  <span className="text-sm font-semibold">
                    {price ? `€${price}` : f.freeDownload ? "Free" : "Contact"}
                  </span>
                </div>

                {preview && (
                  <div className="mt-2">
                    <WaveformPlayer audioUrl={`https:${preview}`} />
                  </div>
                )}

                {/* PayPal or Download */}
                <div className="mt-3">
                  {f.freeDownload && download ? (
                    <button
                      onClick={() => window.open(`https:${download}`, "_blank")}
                      className="w-full bg-adinkra-highlight text-adinkra-bg text-sm py-2 rounded-lg hover:bg-yellow-500"
                    >
                      ⬇ Free Download
                    </button>
                  ) : price ? (
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
                  ) : null}
                </div>

                {/* Affiliate */}
                {affiliateLinks && (
                  <div className="mt-3 text-xs bg-adinkra-highlight/10 border-t border-adinkra-highlight/20 pt-2 px-2 rounded">
                    {documentToReactComponents(affiliateLinks, richTextOptions)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 my-10">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-adinkra-highlight/30 hover:bg-adinkra-highlight/60 disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-adinkra-highlight/30 hover:bg-adinkra-highlight/60 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}

      <div className="mt-16 mb-10">
        <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />
      </div>

      
    </div>
  );
}
