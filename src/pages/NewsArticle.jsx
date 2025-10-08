// src/pages/NewsArticle.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
import SponsorCard from "../components/SponsorAds";
import PayPalArticleButton from "../components/PayPalArticleButton";
import { useAuth0 } from "@auth0/auth0-react";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const restrictedTypes = ["Opinion", "Analysis", "Deep Feature", "Exclusive Feature"];
const loginOnlyTypes = ["Breaking", "Deep Feature", "Feature", "Sports", "Exclusive Feature"];

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-5 leading-relaxed">{children}</p>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields;
      const url = `https:${file.url}`;
      const contentType = file.contentType;

      if (contentType.startsWith("image")) {
        return (
          <figure className="my-4">
            <img src={url} alt={title || "Asset"} className="w-full rounded-md" />
            {description && (
              <figcaption className="mt-2 text-sm text-gray-500 italic">
                {description}
              </figcaption>
            )}
          </figure>
        );
      }
      if (contentType.startsWith("video"))
        return <video src={url} controls className="w-full rounded-md my-4" />;
      if (contentType.startsWith("audio"))
        return <audio src={url} controls className="w-full my-4" />;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-adinkra-highlight underline"
        >
          {title || file.fileName}
        </a>
      );
    },
  },
};

export default function NewsArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [hasFreeAccess, setHasFreeAccess] = useState(false);
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();

  useEffect(() => {
    async function fetchArticle() {
      try {
        const entry = await client.getEntry(id);
        setArticle(entry);
        fetchLikes(entry.fields.slug || entry.sys.id);
        updateMetaTags(entry);

        // ✅ Check free access list
        const freeEmailsRaw = entry.fields.freeAccessEmails || "";
        const emailList = freeEmailsRaw
          .split(/[,;\n]/)
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        const userEmail = user?.email?.trim().toLowerCase();

        if (isAuthenticated && userEmail && emailList.includes(userEmail)) {
          setHasFreeAccess(true);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
      }
    }

    fetchArticle();
  }, [id, isAuthenticated, user]);

  const fetchLikes = async (slug) => {
    const { data } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();
    if (data) setLikeCount(data.count || 0);
  };

  const updateMetaTags = (entry) => {
    const title = entry.fields.newsArticle;
    const description = entry.fields.summaryExcerpt || "Adinkra Media article";
    const image = entry.fields.coverImage?.fields?.file?.url
      ? `https:${entry.fields.coverImage.fields.file.url}`
      : "";
    const fullUrl = `https://adinkramedia.com/news/${entry.sys.id}`;

    const setMeta = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:image", image);
    setMeta("og:url", fullUrl);
    setMeta("og:type", "article");
  };

  const handleLike = async () => {
    if (!article) return;
    const slug = article.fields.slug || article.sys.id;
    setLoadingLike(true);

    const { data: existing } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);
      if (!error) setLikeCount(existing.count + 1);
    } else {
      const { error } = await supabase
        .from("likes")
        .insert({ slug, type: "news", count: 1 });
      if (!error) setLikeCount(1);
    }
    setLoadingLike(false);
  };

  if (!article) return <div className="text-center py-20">Loading...</div>;

  const {
    newsArticle,
    coverImage,
    summaryExcerpt,
    author,
    BodyContent,
    category,
    date,
    articleType,
    mediaAssets, // ✅ new field
  } = article.fields || {};

  const coverUrl = coverImage?.fields?.file?.url;
  const isRestricted = restrictedTypes.includes(articleType);
  const isLoginOnly = loginOnlyTypes.includes(articleType);
  const currentUrl = window.location.href;

  // 🔒 LOGIN-ONLY
  if (isLoginOnly && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-adinkra-bg text-adinkra-gold text-center px-6">
        <h2 className="text-3xl font-bold mb-4">🔒 Log in required</h2>
        <p className="mb-6">You must be logged in to read this article.</p>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-adinkra-highlight text-black font-semibold px-6 py-3 rounded-full hover:bg-yellow-400 transition"
        >
          Log In to Continue
        </button>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-20 bg-adinkra-bg text-adinkra-gold">
      <div className="mb-6">
        <Link
          to="/news"
          className="inline-block bg-adinkra-card text-adinkra-highlight px-4 py-2 rounded-full border border-adinkra-highlight hover:bg-adinkra-highlight hover:text-black transition"
        >
          ← Back to News
        </Link>
      </div>

      {coverUrl && (
        <img src={`https:${coverUrl}`} alt={newsArticle} className="w-full rounded-lg mb-6" />
      )}

      <h1 className="text-4xl font-bold mb-2">{newsArticle}</h1>
      <p className="text-sm text-adinkra-gold/70 mb-6">
        {author?.fields?.name ? `By ${author.fields.name}` : "By Adinkra Media"} |{" "}
        {date ? new Date(date).toLocaleDateString() : ""} • {category}
      </p>

      <SponsorCard />

      {/* 📰 Main Article Body */}
      {BodyContent && (
        <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none mb-12">
          {isRestricted && !hasFreeAccess
            ? documentToReactComponents(
                {
                  nodeType: "document",
                  content: BodyContent.content.slice(0, 2),
                },
                options
              )
            : documentToReactComponents(BodyContent, options)}
        </div>
      )}

      {/* 🖼️ Media Assets Gallery */}
      {mediaAssets?.length > 0 && (
        <div className="border-t border-adinkra-highlight/30 pt-8 mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-adinkra-gold">
            Media Assets
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {mediaAssets.map((asset, idx) => {
              const file = asset.fields?.file;
              if (!file) return null;

              const url = `https:${file.url}`;
              const type = file.contentType;

              if (type.startsWith("image"))
                return (
                  <img
                    key={idx}
                    src={url}
                    alt={asset.fields.title || "Media"}
                    className="rounded-lg shadow-md"
                  />
                );

              if (type.startsWith("video"))
                return (
                  <video
                    key={idx}
                    src={url}
                    controls
                    className="rounded-lg shadow-md w-full"
                  />
                );

              if (type.startsWith("audio"))
                return (
                  <audio key={idx} src={url} controls className="w-full" />
                );

              return (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-adinkra-highlight"
                >
                  {asset.fields.title || file.fileName}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 🔒 Paywall */}
      {isRestricted && !hasFreeAccess && (
        <div className="text-center mt-8 border-t border-adinkra-highlight/30 pt-8">
          <p className="mb-4 text-adinkra-gold/80 text-lg">
            🔒 This is a premium article. Pay $0.29/R5 once to unlock the full story.
          </p>
          <PayPalArticleButton articleTitle={newsArticle} />
        </div>
      )}

      {/* 👍 Like + Share */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-10 border-t border-adinkra-highlight/30 pt-6">
        <button
          onClick={handleLike}
          disabled={loadingLike}
          className="bg-adinkra-highlight text-black px-4 py-2 rounded-full hover:bg-yellow-400"
        >
          {loadingLike ? "Liking..." : `👍 Like (${likeCount})`}
        </button>

        {/* 🌍 Share */}
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(newsArticle + " - " + currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 px-3 py-1.5 rounded-full text-white text-sm hover:bg-green-700"
          >
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 px-3 py-1.5 rounded-full text-white text-sm hover:bg-blue-700"
          >
            Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-700 px-3 py-1.5 rounded-full text-white text-sm hover:bg-sky-800"
          >
            LinkedIn
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              newsArticle
            )}&url=${encodeURIComponent(currentUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black px-3 py-1.5 rounded-full text-white text-sm hover:bg-gray-800"
          >
            X / Twitter
          </a>
        </div>
      </div>
    </section>
  );
}
