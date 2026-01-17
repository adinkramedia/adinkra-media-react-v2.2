import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";
import SponsorCard from "../components/SponsorAds";
import PayPalArticleButton from "../components/PayPalArticleButton";
import { useAuth0 } from "@auth0/auth0-react";
import { Helmet, HelmetProvider } from "react-helmet-async";

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const restrictedTypes = ["Opinion", "Analysis", "Deep Feature", "Exclusive Feature"];
const loginOnlyTypes = ["Breaking", "Deep Feature", "Feature", "Sports", "Exclusive Feature"];

const options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-bold">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-6 leading-relaxed text-lg">{children}</p>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields;
      const url = `https:${file.url}`;
      const type = file.contentType;

      if (type.startsWith("image"))
        return (
          <figure className="my-10">
            <img src={url} alt={title || "Article image"} className="w-full rounded-2xl shadow-xl" />
            {description && (
              <figcaption className="text-adinkra-gold/60 italic mt-3 text-center text-sm">
                {description}
              </figcaption>
            )}
          </figure>
        );

      if (type.startsWith("video"))
        return <video src={url} controls className="w-full rounded-2xl my-10 shadow-xl" />;

      if (type.startsWith("audio"))
        return (
          <div className="my-10 bg-black/30 rounded-2xl p-6">
            <audio src={url} controls className="w-full" />
          </div>
        );

      return (
        <a href={url} className="text-adinkra-highlight underline hover:text-yellow-400" target="_blank" rel="noreferrer">
          {title || file.fileName}
        </a>
      );
    },
  },
};

export default function NewsArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();

  const [article, setArticle] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);
  const [hasFreeAccess, setHasFreeAccess] = useState(false);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("newsScrollPosition");
    if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }
  }, []);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const entries = await client.getEntries({
          content_type: "africanTrendingNews",
          "fields.slug": slug,
          limit: 1,
        });

        const entry = entries.items[0];
        if (!entry) {
          navigate("/404");
          return;
        }

        setArticle(entry);

        const { data } = await supabase
          .from("likes")
          .select("count")
          .eq("slug", slug)
          .maybeSingle();
        setLikeCount(data?.count || 0);

        const freeEmails = (entry.fields.freeAccessEmails || "")
          .split(/[,;\n]/)
          .map((e) => e.trim().toLowerCase());

        if (isAuthenticated && user?.email && freeEmails.includes(user.email.toLowerCase())) {
          setHasFreeAccess(true);
        }
      } catch (err) {
        console.error(err);
        navigate("/404");
      }
    }

    fetchArticle();
  }, [slug, isAuthenticated, navigate, user?.email]);

  const handleLike = async () => {
    if (loadingLike) return;
    setLoadingLike(true);

    try {
      const { data: existing } = await supabase
        .from("likes")
        .select("id, count")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        await supabase.from("likes").update({ count: existing.count + 1 }).eq("id", existing.id);
        setLikeCount(existing.count + 1);
      } else {
        await supabase.from("likes").insert({ slug, type: "news", count: 1 });
        setLikeCount(1);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLoadingLike(false);
    }
  };

  const goBack = () => {
    const lastPage = sessionStorage.getItem("newsLastPage") || "/news";
    const savedScroll = sessionStorage.getItem("newsScrollPosition") || "0";

    navigate(lastPage);

    setTimeout(() => {
      window.scrollTo(0, parseInt(savedScroll, 10));
    }, 150);
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-2xl text-adinkra-gold/70">Loading article...</p>
      </div>
    );
  }

  const {
    newsArticle,
    coverImage,
    summaryExcerpt,
    author,
    bodyContent,
    category,
    date,
    articleType,
  } = article.fields;

  const rawCoverUrl = coverImage?.fields?.file?.url;

  // Optimized OG/social image using Contentful Image API
  // Only used when cover image actually exists
  const socialImageUrl = rawCoverUrl
    ? `https:${rawCoverUrl}?w=1200&h=630&fit=fill&fm=jpg&q=85&fl=progressive`
    : undefined;

  // Safe meta description with fallback
  const metaDescription =
    summaryExcerpt?.trim() ||
    "Spiritually rooted African stories and Pan-African journalism from Adinkra Media.";

  const fullUrl = `https://adinkramedia.com/news-article/${slug}`;
  const isRestricted = restrictedTypes.includes(articleType);
  const isLoginOnly = loginOnlyTypes.includes(articleType);

  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <HelmetProvider>
      <Helmet>
        <title>{newsArticle} | Adinkra Media</title>
        <meta name="description" content={metaDescription} />

        <meta property="og:title" content={newsArticle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content="article" />

        {/* Only include OG image tags when we have a real image */}
        {socialImageUrl && (
          <>
            <meta property="og:image" content={socialImageUrl} />
            <meta property="og:image:secure_url" content={socialImageUrl} />
            <meta property="og:image:type" content="image/jpeg" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={newsArticle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={socialImageUrl} />
          </>
        )}
      </Helmet>

      {isLoginOnly && !isAuthenticated ? (
        <section className="flex flex-col items-center justify-center min-h-screen text-center px-6">
          <h2 className="text-4xl font-bold mb-6">🔒 Premium Content</h2>
          <p className="text-xl mb-8 text-adinkra-gold/80">
            Log in to read this article
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="px-8 py-4 bg-adinkra-highlight text-adinkra-bg rounded-full text-lg font-semibold hover:bg-yellow-500 transition"
          >
            Log In
          </button>
        </section>
      ) : (
        <section className="max-w-4xl mx-auto px-6 py-16">
          <button
            onClick={goBack}
            className="mb-10 text-adinkra-highlight font-semibold hover:underline flex items-center gap-2 text-lg"
          >
            ← Back to News
          </button>

          {rawCoverUrl && (
            <img
              src={`https:${rawCoverUrl}`}
              alt={newsArticle}
              className="w-full rounded-3xl shadow-2xl mb-12 object-cover max-h-[70vh]"
              loading="lazy"
            />
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{newsArticle}</h1>

          <div className="flex flex-wrap items-center gap-4 text-adinkra-gold/70 mb-10">
            <span className="font-medium">{author?.fields?.name || "Adinkra Media"}</span>
            {formattedDate && (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            )}
            {category && (
              <>
                <span>•</span>
                <span className="italic">{category}</span>
              </>
            )}
            {articleType && (
              <span className="px-3 py-1 bg-adinkra-highlight/30 rounded-full text-sm">
                {articleType}
              </span>
            )}
          </div>

          <SponsorCard />

          <article className="prose prose-lg prose-invert max-w-none mt-12">
            {bodyContent &&
              (isRestricted && !hasFreeAccess
                ? documentToReactComponents(
                    { nodeType: "document", content: bodyContent.content.slice(0, 3) },
                    options
                  )
                : documentToReactComponents(bodyContent, options))}
          </article>

          {isRestricted && !hasFreeAccess && (
            <div className="my-16 text-center border-t border-adinkra-highlight/30 pt-12">
              <p className="text-2xl mb-6">🔒 Unlock full article</p>
              <p className="text-lg text-adinkra-gold/80 mb-8 max-w-2xl mx-auto">
                Support independent African journalism with a one-time contribution.
              </p>
              <PayPalArticleButton articleTitle={newsArticle} />
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
                href={`https://wa.me/?text=${encodeURIComponent(newsArticle + " — " + fullUrl)}`}
                className="bg-green-600 px-6 py-3 rounded-full text-white font-medium hover:bg-green-500 transition"
                target="_blank"
                rel="noreferrer"
              >
                Share on WhatsApp
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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(newsArticle)}&url=${encodeURIComponent(fullUrl)}`}
                className="bg-black px-6 py-3 rounded-full text-white font-medium hover:bg-gray-800 transition"
                target="_blank"
                rel="noreferrer"
              >
                X / Twitter
              </a>
            </div>
          </div>
        </section>
      )}
    </HelmetProvider>
  );
}