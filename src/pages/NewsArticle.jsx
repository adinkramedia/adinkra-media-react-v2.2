import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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

// ARTICLE TYPES LOGIC
const restrictedTypes = ["Opinion", "Analysis", "Deep Feature", "Exclusive Feature"];
const loginOnlyTypes = ["Breaking", "Deep Feature", "Feature", "Sports", "Exclusive Feature"];

// CONTENTFUL RENDERING OPTIONS
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
      const type = file.contentType;

      if (type.startsWith("image"))
        return (
          <figure className="my-4">
            <img src={url} alt={title} className="w-full rounded-md" />
            {description && (
              <figcaption className="text-gray-400 italic mt-2 text-sm">{description}</figcaption>
            )}
          </figure>
        );

      if (type.startsWith("video"))
        return <video src={url} controls className="w-full rounded-md my-4" />;

      if (type.startsWith("audio"))
        return <audio src={url} controls className="w-full my-4" />;

      return (
        <a href={url} className="text-adinkra-highlight underline" target="_blank">
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

  // RESTORE SCROLL POSITION
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("newsScrollPosition");
    if (savedScroll) window.scrollTo(0, parseInt(savedScroll));
  }, []);

  // FETCH ARTICLE BY SLUG
  useEffect(() => {
    async function fetchArticle() {
      const entries = await client.getEntries({
        content_type: "africanTrendingNews",
        "fields.slug": slug,
        limit: 1,
      });

      const entry = entries.items[0];
      if (!entry) return navigate("/404");

      setArticle(entry);

      // Load likes
      fetchLikes(slug);

      // Premium email access check
      const freeEmails = (entry.fields.freeAccessEmails || "")
        .split(/[,;\n]/)
        .map((x) => x.trim().toLowerCase());

      if (isAuthenticated && freeEmails.includes(user?.email?.toLowerCase())) {
        setHasFreeAccess(true);
      }
    }

    fetchArticle();
  }, [slug, isAuthenticated]);

  // FETCH LIKES
  const fetchLikes = async (slugValue) => {
    const { data } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slugValue)
      .maybeSingle();

    setLikeCount(data?.count || 0);
  };

  const handleLike = async () => {
    setLoadingLike(true);

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

    setLoadingLike(false);
  };

  if (!article) return <div className="text-center py-20">Loading...</div>;

  // FIELDS (FIXED FIELD ID)
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

  const coverUrl = coverImage?.fields?.file?.url
    ? `https:${coverImage.fields.file.url}`
    : "";

  const fullUrl = `https://adinkramedia.com/news/${slug}`;

  const isRestricted = restrictedTypes.includes(articleType);
  const isLoginOnly = loginOnlyTypes.includes(articleType);

  // LOGIN BLOCK
  if (isLoginOnly && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-3xl mb-4">🔒 Log in required</h2>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-adinkra-highlight text-black px-6 py-3 rounded-full"
        >
          Log In to Continue
        </button>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>{newsArticle} | Adinkra Media</title>
        <meta name="description" content={summaryExcerpt} />
        <meta property="og:title" content={newsArticle} />
        <meta property="og:description" content={summaryExcerpt} />
        <meta property="og:image" content={coverUrl} />
        <meta property="og:url" content={fullUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <button
          onClick={() => navigate("/news")}
          className="bg-adinkra-card text-adinkra-highlight px-4 py-2 rounded-full"
        >
          ← Back to News
        </button>

        {coverUrl && <img src={coverUrl} className="w-full rounded-lg my-6" />}

        <h1 className="text-4xl font-bold mb-2">{newsArticle}</h1>

        <p className="text-sm opacity-70 mb-6">
          {author?.fields?.name || "Adinkra Media"} •{" "}
          {date ? new Date(date).toLocaleDateString() : ""} • {category}
        </p>

        <SponsorCard />

        {/* BODY CONTENT — FIXED */}
        {bodyContent && (
          <div className="prose prose-lg prose-invert max-w-none mb-12">
            {isRestricted && !hasFreeAccess
              ? documentToReactComponents(
                  {
                    nodeType: "document",
                    content: bodyContent.content.slice(0, 2),
                  },
                  options
                )
              : documentToReactComponents(bodyContent, options)}
          </div>
        )}

        {isRestricted && !hasFreeAccess && (
          <div className="text-center border-t pt-8">
            <p className="mb-4">🔒 This is a premium article.</p>
            <PayPalArticleButton articleTitle={newsArticle} />
          </div>
        )}

        {/* LIKE + SHARE */}
        <div className="flex justify-between items-center mt-10 border-t pt-6">
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className="bg-adinkra-highlight text-black px-4 py-2 rounded-full"
          >
            👍 Like ({likeCount})
          </button>

          <div className="flex gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(newsArticle + " - " + fullUrl)}`}
              className="bg-green-600 px-3 py-2 rounded-full text-white"
              target="_blank"
            >
              WhatsApp
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
              className="bg-blue-600 px-3 py-2 rounded-full text-white"
              target="_blank"
            >
              Facebook
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(newsArticle)}&url=${encodeURIComponent(fullUrl)}`}
              className="bg-black px-3 py-2 rounded-full text-white"
              target="_blank"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </section>
    </HelmetProvider>
  );
}
