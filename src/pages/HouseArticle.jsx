import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { supabase } from "../lib/supabase";

const client = createClient({
  space: "8e41pkw4is56",
  accessToken: "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I",
});

const options = {
  renderNode: {
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="list-disc list-outside mb-6 pl-5">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="list-decimal list-outside mb-6 pl-5">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => (
      <li className="mb-2 leading-relaxed">{children}</li>
    ),
    [BLOCKS.HEADING_1]: (node, children) => (
      <h1 className="text-4xl font-bold mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (node, children) => (
      <h2 className="text-3xl font-semibold mb-5">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h3 className="text-2xl font-semibold mb-4">{children}</h3>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="mb-6 leading-relaxed">{children}</p>
    ),
    [BLOCKS.QUOTE]: (node, children) => (
      <blockquote className="border-l-4 border-adinkra-highlight pl-4 italic mb-6 text-adinkra-highlight">
        {children}
      </blockquote>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title } = node.data.target.fields;
      const mimeType = file.contentType;
      const url = file.url;

      if (mimeType.startsWith("image/")) {
        return (
          <img
            src={`https:${url}`}
            alt={title || "Embedded Image"}
            className="my-6 rounded-lg w-full max-w-xl mx-auto"
          />
        );
      }

      if (mimeType.startsWith("video/")) {
        return (
          <video
            src={`https:${url}`}
            controls
            className="my-6 rounded-lg w-full max-w-xl mx-auto"
          />
        );
      }

      if (mimeType.startsWith("audio/")) {
        return (
          <audio
            src={`https:${url}`}
            controls
            className="my-6 w-full"
          />
        );
      }

      return (
        <a
          href={`https:${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-adinkra-highlight underline"
        >
          Download File ({file.fileName})
        </a>
      );
    },
  },
};

export default function HouseArticle() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [loadingLike, setLoadingLike] = useState(false);

  useEffect(() => {
    client
      .getEntry(id)
      .then((entry) => {
        setArticle(entry);
        const slug = entry.fields.slug || entry.sys.id;
        fetchLikes(slug);
        updateMetaTags(entry);
      })
      .catch(console.error);
  }, [id]);

  const updateMetaTags = (entry) => {
    const title = entry.fields.title;
    const description = `Read from the House of Ausar on Adinkra Media.`;
    const image = entry.fields.coverImage?.fields?.file?.url
      ? `https:${entry.fields.coverImage.fields.file.url}`
      : "";
    const fullUrl = `https://adinkramedia.com/house-article/${entry.sys.id}`;

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

    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", image);
  };

  const fetchLikes = async (slug) => {
    const { data, error } = await supabase
      .from("likes")
      .select("count")
      .eq("slug", slug)
      .maybeSingle();

    if (data) setLikeCount(data.count || 0);
    else if (error && error.code !== "PGRST116") {
      console.error("Fetch error:", error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    const slug = article.fields.slug || article.sys.id;
    setLoadingLike(true);

    const { data: existing, error: fetchError } = await supabase
      .from("likes")
      .select("id, count")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing && fetchError && fetchError.code !== "PGRST116") {
      console.error("Fetch error:", fetchError);
      setLoadingLike(false);
      return;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("likes")
        .update({ count: existing.count + 1 })
        .eq("id", existing.id);

      if (!updateError) setLikeCount(existing.count + 1);
    } else {
      const { error: insertError } = await supabase
        .from("likes")
        .insert({ slug, type: "house", count: 1 });

      if (!insertError) setLikeCount(1);
    }

    setLoadingLike(false);
  };

  if (!article) return <div className="text-center py-20">Loading...</div>;

  const { title, bodyContent, coverImage, publishedDate, affiliateLinks } = article.fields;
  const coverUrl = coverImage?.fields?.file?.url;
  const fullUrl = `https://adinkramedia.com/house-article/${article.sys.id}`;
  const shareText = `${title} - ${new Date(publishedDate).toLocaleDateString()}`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${fullUrl}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${fullUrl}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + fullUrl)}`,
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-3xl mx-auto px-4 py-20">
        {coverUrl && (
          <img
            src={`https:${coverUrl}`}
            alt={title}
            className="w-full rounded-lg mb-6"
          />
        )}

        <h1 className="text-4xl font-bold mb-4">{title}</h1>

        <p className="text-sm text-adinkra-gold/70 mb-4">
          {new Date(publishedDate).toLocaleDateString()}
        </p>

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleLike}
            disabled={loadingLike}
            className="bg-adinkra-highlight text-black px-4 py-2 rounded-full hover:bg-yellow-400"
          >
            {loadingLike ? "Liking..." : "👍 Like"} ({likeCount})
          </button>
        </div>

        <div className="flex gap-3 flex-wrap mb-10">
          {Object.entries(shareLinks).map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-adinkra-card px-4 py-2 rounded-full text-adinkra-highlight hover:underline"
            >
              Share on {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </a>
          ))}
        </div>

        <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none">
          {bodyContent && documentToReactComponents(bodyContent, options)}
        </div>

        {/* Affiliate Links */}
        {affiliateLinks && (
          <div className="mt-16 pt-6 border-t border-adinkra-highlight/30">
            <h3 className="text-2xl font-semibold mb-4 text-adinkra-highlight">
              Featured Products
            </h3>
            <div className="prose prose-invert prose-lg text-adinkra-gold max-w-none">
              {documentToReactComponents(affiliateLinks, options)}
            </div>
          </div>
        )}
      </section>
   
    </div>
  );
}
