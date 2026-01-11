import { useEffect, useState } from "react";
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
      <p className="mb-3 leading-relaxed text-sm">{children}</p>
    ),
  },
};

export default function Audio() {
  const [tracks, setTracks] = useState([]);
  const [likes, setLikes] = useState({});
  const [loadingLikes, setLoadingLikes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
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

  const allCategories = ["All", ...new Set(tracks.map((t) => t.fields.category || "Audio"))];
  const filteredTracks =
    selectedCategory === "All"
      ? tracks
      : tracks.filter((t) => t.fields.category === selectedCategory);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTracks = filteredTracks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen flex flex-col">
      <Header />

      {/* Original Hero — Fast & Clean */}
      <section className="relative w-full h-[70vh] bg-black overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/audio-hero-desktop.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
            Adinkra Audio
          </h1>
          <p className="text-lg md:text-xl max-w-2xl opacity-95 leading-relaxed">
            Explore royalty-free loops, melodies & FX — modern sounds inspired by African roots.
          </p>
        </div>
      </section>

      {/* Billboard */}
      <div className="my-12 px-6 max-w-7xl mx-auto">
        <SponsorAds />
      </div>

      {/* Modern Glass Category Pills */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap gap-4 justify-center">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-sm ${
                cat === selectedCategory
                  ? "bg-adinkra-highlight/90 text-adinkra-bg border-adinkra-highlight shadow-md"
                  : "bg-adinkra-highlight/10 text-adinkra-gold border-adinkra-highlight/30 hover:bg-adinkra-highlight/25"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Upgraded Grid — Beautiful but Performant */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
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
              className="group bg-adinkra-card/90 border border-adinkra-highlight/20 rounded-3xl overflow-hidden hover:-translate-y-2 hover:border-adinkra-highlight/50 hover:shadow-xl transition-all duration-500"
            >
              <div className="relative overflow-hidden">
                <img
                  src={`https:${cover}`}
                  alt={title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {f.freeDownload && (
                  <span className="absolute top-4 right-4 bg-adinkra-highlight text-adinkra-bg text-xs px-4 py-2 rounded-full font-bold shadow">
                    FREE
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-xl font-bold truncate">{title}</h3>
                  <p className="text-sm uppercase tracking-wider text-adinkra-gold/60 mt-1">
                    {f.category || "Audio"}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleLike(slug)}
                    disabled={loadingLikes[slug]}
                    className="flex items-center gap-2 text-sm bg-adinkra-highlight/20 px-4 py-2 rounded-full hover:bg-adinkra-highlight/40 transition-colors"
                  >
                    <span className="text-lg">❤️</span> {likes[slug] || 0}
                  </button>
                  <span className="text-lg font-bold">
                    {price ? `€${price}` : f.freeDownload ? "Free" : "Contact"}
                  </span>
                </div>

                {preview && (
                  <div className="mt-3">
                    <WaveformPlayer audioUrl={`https:${preview}`} />
                  </div>
                )}

                <div className="mt-4">
                  {f.freeDownload && download ? (
                    <button
                      onClick={() => window.open(`https:${download}`, "_blank")}
                      className="w-full bg-adinkra-highlight text-adinkra-bg font-semibold py-3 rounded-xl hover:bg-yellow-500 transition-colors"
                    >
                      ⬇ Free Download
                    </button>
                  ) : price ? (
                    <PayPalButton
                      price={price}
                      title={title}
                      onSuccess={() => {}}
                    />
                  ) : null}
                </div>

                {affiliateLinks && (
                  <div className="mt-4 pt-4 border-t border-adinkra-highlight/20 text-sm">
                    {documentToReactComponents(affiliateLinks, richTextOptions)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Clean Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-6 my-16">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-6 py-3 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
          >
            ← Prev
          </button>
          <span className="text-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-6 py-3 rounded-full bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
          >
            Next →
          </button>
        </div>
      )}

      <div className="mt-16 mb-12 px-6 max-w-4xl mx-auto">
        <AccordionFaq title="Adinkra Audio Licensing FAQ" faqs={licensingFaqs} />
      </div>

      <Footer />
    </div>
  );
}