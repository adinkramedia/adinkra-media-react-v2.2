// src/pages/HouseArticle.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
import SponsorCard from "../components/SponsorAds"; // assuming you want to keep this pattern
import { Helmet, HelmetProvider } from "react-helmet-async";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-6 leading-relaxed text-lg">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-outside mb-6 pl-6">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-outside mb-6 pl-6">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-3 leading-relaxed">{children}</li>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-bold mb-6 mt-12">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-semibold mb-5 mt-10">{children}</h3>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-adinkra-highlight pl-5 italic my-8 text-adinkra-gold/90">
        {children}
      </blockquote>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields;
      const url = `https:${file.url}`;
      const type = file.contentType;

      if (type.startsWith("image")) {
        return (
          <figure className="my-10">
            <img
              src={url}
              alt={title || "House content image"}
              className="w-full rounded-2xl shadow-xl"
            />
            {description && (
              <figcaption className="text-adinkra-gold/60 italic mt-3 text-center text-sm">
                {description}
              </figcaption>
            )}
          </figure>
        );
      }

      if (type.startsWith("video")) {
        return <video src={url} controls className="w-full rounded-2xl my-10 shadow-xl" />;
      }

      if (type.startsWith("audio")) {
        return (
          <div className="my-10 bg-black/30 rounded-2xl p-6">
            <audio src={url} controls className="w-full" />
          </div>
        );
      }

      return (
        <a
          href={url}
          className="text-adinkra-highlight underline hover:text-yellow-400"
          target="_blank"
          rel="noreferrer"
        >
          {title || file.fileName}
        </a>
      );
    },
  },
};

export default function HouseArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const entry = await client.getEntry(id);
        if (!entry) {
          navigate("/404");
          return;
        }

        setArticle(entry);

        // Use sys.id or slug for likes consistency
        const slug = entry.fields.slug || entry.sys.id;

        const { data } = await supabase
          .from("likes")
          .select("count")
          .eq("slug", slug)
          .maybeSingle();

        setLikeCount(data?.count || 0);
      } catch (err) {
        console.error(err);
        navigate("/404");
      }
    }

    fetchArticle();
  }, [id, navigate]);

  const handleLike = async () => {
    if (loadingLike || !article) return;
    setLoadingLike(true);

    const slug = article.fields.slug || article.sys.id;

    try {
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
        setLikeCount(existing.count + 1);
      } else {
        await supabase
          .from("likes")
          .insert({ slug, type: "house", count: 1 });
        setLikeCount(1);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-adinkra-gold/70">Loading article...</p>
      </div>
    );
  }

  const { title, bodyContent, coverImage, publishedDate, affiliateLinks } = article.fields;

  const rawCoverUrl = coverImage?.fields?.file?.url;
  const fullUrl = `https://adinkramedia.com/house-article/${id}`;

  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const metaDescription =
    "Wisdom, teachings, and insights from the House of Ausar — exclusive content on Adinkra Media.";

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title} | House of Ausar • Adinkra Media</title>
        <meta name="description" content={metaDescription} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="Adinkra Media" />

        {rawCoverUrl && (
          <>
            <meta
              property="og:image"
              content={`https:${rawCoverUrl}?w=1200&h=630&fit=fill&fm=jpg&q=85&fl=progressive`}
            />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/jpeg" />
          </>
        )}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        {rawCoverUrl && (
          <meta
            name="twitter:image"
            content={`https:${rawCoverUrl}?w=1200&h=630&fit=fill&fm=jpg&q=85&fl=progressive`}
          />
        )}
      </Helmet>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <button
          onClick={goBack}
          className="mb-10 text-adinkra-highlight font-semibold hover:underline flex items-center gap-2 text-lg"
        >
          ← Back
        </button>

        {rawCoverUrl && (
          <img
            src={`https:${rawCoverUrl}`}
            alt={title}
            className="w-full rounded-3xl shadow-2xl mb-12 object-cover max-h-[70vh]"
            loading="lazy"
          />
        )}

        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-adinkra-gold/70 mb-10">
          <span className="font-medium">House of Ausar</span>
          {formattedDate && (
            <>
              <span>•</span>
              <span>{formattedDate}</span>
            </>
          )}
        </div>

        <SponsorCard />

        <article className="prose prose-lg prose-invert max-w-none mt-12">
          {bodyContent && documentToReactComponents(bodyContent, options)}
        </article>

        {/* Affiliate / Featured Products Section */}
        {affiliateLinks && (
          <div className="mt-20 pt-10 border-t border-adinkra-highlight/30">
            <h2 className="text-3xl font-bold mb-8 text-center md:text-left">
              Featured Products & Recommendations
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              {documentToReactComponents(affiliateLinks, options)}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 mt-16 pt-10 border-t border-adinkra-highlight/30">
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 rounded-full transition text-lg font-medium disabled:opacity-50"
          >
            <span className="text-2xl">❤️</span> Like ({likeCount})
          </button>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(title + " — " + fullUrl)}`}
              className="bg-green-600 px-6 py-3 rounded-full text-white font-medium hover:bg-green-500 transition"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
              className="bg-blue-600 px-6 py-3 rounded-full text-white font-medium hover:bg-blue-500 transition"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`}
              className="bg-black px-6 py-3 rounded-full text-white font-medium hover:bg-gray-800 transition"
              target="_blank"
              rel="noreferrer"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </section>
    </HelmetProvider>
  );
}