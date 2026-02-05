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
      <p className="mb-6 leading-relaxed text-base sm:text-lg">{children}</p>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title, description } = node.data.target.fields;
      const url = `https:${file.url}`;
      const type = file.contentType;

      if (type.startsWith("image")) {
        return (
          <figure className="my-8 sm:my-10">
            <img
              src={url}
              alt={title || "Article image"}
              className="w-full h-auto rounded-xl sm:rounded-2xl shadow-lg object-cover"
              loading="lazy"
            />
            {description && (
              <figcaption className="mt-3 text-center text-sm italic text-adinkra-gold/70">
                {description}
              </figcaption>
            )}
          </figure>
        );
      }

      // video/audio/fallback remain similar, just tighter spacing
      if (type.startsWith("video"))
        return <video src={url} controls className="w-full rounded-xl my-8 shadow-lg" />;

      if (type.startsWith("audio"))
        return (
          <div className="my-8 bg-black/30 rounded-xl p-4 sm:p-6">
            <audio src={url} controls className="w-full" />
          </div>
        );

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
    if (savedScroll) window.scrollTo(0, parseInt(savedScroll, 10));
  }, []);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const entries = await client.getEntries({
          content_type: "africanTrendingNews",
          "fields.slug": slug,
          limit: 1,
          include: 2,
        });

        const entry = entries.items[0];
        if (!entry) return navigate("/404");

        setArticle(entry);

        const { data } = await supabase
          .from("likes")
          .select("count")
          .eq("slug", slug)
          .maybeSingle();
        setLikeCount(data?.count || 0);

        const freeEmails = (entry.fields.freeAccessEmails || "")
          .split(/[,;\n]/)
          .map(e => e.trim().toLowerCase());

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
    setTimeout(() => window.scrollTo(0, parseInt(savedScroll, 10)), 150);
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-xl sm:text-2xl text-adinkra-gold/70">Loading article...</p>
      </div>
    );
  }

  const fields = article.fields;
  const {
    newsArticle: title,
    coverImage,
    summaryExcerpt,
    author,
    bodyContent,
    category,
    date,
    articleType,
    affiliateLinks,
  } = fields;

  const coverUrl = coverImage?.fields?.file?.url ? `https:${coverImage.fields.file.url}` : null;
  const coverDescription = coverImage?.fields?.description || "";

  const formattedDate = date
    ? new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : "";

  const fullUrl = `https://adinkramedia.com/news-article/${slug}`;
  const metaDescription = summaryExcerpt?.trim() || "Spiritually rooted African stories and Pan-African journalism from Adinkra Media.";

  const isRestricted = restrictedTypes.includes(articleType);
  const isLoginOnly = loginOnlyTypes.includes(articleType);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title} | Adinkra Media</title>
        <meta name="description" content={metaDescription} />
        {/* OG / Twitter tags unchanged – they are fine */}
        {/* ... your existing meta tags ... */}
      </Helmet>

      {isLoginOnly && !isAuthenticated ? (
        <section className="flex flex-col items-center justify-center min-h-screen text-center px-5 py-10 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">🔒 Premium Content</h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-adinkra-gold/80 max-w-xl">
            This is a premium article. Please log in to read the full content.
          </p>
          <button
            onClick={() => loginWithRedirect()}
            className="px-8 py-4 sm:px-10 sm:py-5 bg-adinkra-highlight text-adinkra-bg rounded-full text-lg sm:text-xl font-semibold hover:bg-yellow-500 transition shadow-lg touch-manipulation"
          >
            Log In to Read
          </button>
        </section>
      ) : (
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <button
            onClick={goBack}
            className="mb-6 sm:mb-10 text-adinkra-highlight font-semibold hover:underline flex items-center gap-2 text-base sm:text-lg"
          >
            ← Back to News
          </button>

          {coverUrl && (
            <figure className="mb-8 sm:mb-12">
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-auto rounded-2xl sm:rounded-3xl shadow-xl object-cover max-h-[50vh] sm:max-h-[70vh]"
                loading="lazy"
              />
              {coverDescription && (
                <figcaption className="mt-3 sm:mt-4 text-center text-sm sm:text-base italic text-adinkra-gold/60">
                  {coverDescription}
                </figcaption>
              )}
            </figure>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 sm:mb-6 leading-tight">{title}</h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-adinkra-gold/70 mb-6 sm:mb-10 text-sm sm:text-base">
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
              <span className="px-2.5 py-1 bg-adinkra-highlight/30 rounded-full text-xs sm:text-sm">
                {articleType}
              </span>
            )}
          </div>

          <div className="my-6 sm:my-8">
            <SponsorCard />
          </div>

          <article className="prose prose-sm sm:prose-base md:prose-lg prose-invert max-w-none mt-8 sm:mt-12">
            {bodyContent &&
              (isRestricted && !hasFreeAccess
                ? documentToReactComponents(
                    { nodeType: "document", content: bodyContent.content.slice(0, 3) },
                    options
                  )
                : documentToReactComponents(bodyContent, options))}
          </article>

          {affiliateLinks && (
            <div className="my-10 sm:my-12 p-5 sm:p-6 bg-gray-900/40 rounded-xl sm:rounded-2xl border border-adinkra-highlight/30">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-adinkra-highlight">
                Affiliate Links / Partners
              </h3>
              {typeof affiliateLinks === "string" ? (
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {affiliateLinks}
                </div>
              ) : (
                documentToReactComponents(affiliateLinks, options)
              )}
            </div>
          )}

          {isRestricted && !hasFreeAccess && (
            <div className="my-12 sm:my-16 text-center border-t border-adinkra-highlight/30 pt-8 sm:pt-12">
              <p className="text-xl sm:text-2xl mb-4 sm:mb-6">🔒 Unlock full article</p>
              <p className="text-base sm:text-lg text-adinkra-gold/80 mb-6 sm:mb-8 max-w-xl mx-auto">
                Support independent African journalism with a one-time contribution.
              </p>
              <PayPalArticleButton articleTitle={title} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-adinkra-highlight/30">
            <button
              onClick={handleLike}
              disabled={loadingLike}
              className="flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-adinkra-highlight/20 hover:bg-adinkra-highlight/40 rounded-full transition text-base sm:text-lg font-medium disabled:opacity-50 touch-manipulation w-full sm:w-auto"
            >
              <span className="text-xl sm:text-2xl">❤️</span> Like ({likeCount})
            </button>

            <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(title + " — " + fullUrl)}`}
                className="bg-green-600 px-5 sm:px-6 py-3 rounded-full text-white font-medium hover:bg-green-500 transition text-sm sm:text-base flex-1 sm:flex-none text-center touch-manipulation"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                className="bg-blue-600 px-5 sm:px-6 py-3 rounded-full text-white font-medium hover:bg-blue-500 transition text-sm sm:text-base flex-1 sm:flex-none text-center touch-manipulation"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`}
                className="bg-black px-5 sm:px-6 py-3 rounded-full text-white font-medium hover:bg-gray-800 transition text-sm sm:text-base flex-1 sm:flex-none text-center touch-manipulation"
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