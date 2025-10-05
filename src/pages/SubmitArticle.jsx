// src/pages/SubmitArticle.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { createClient } from "contentful-management";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SPACE_ID = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const ENVIRONMENT = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || "master";
const MANAGEMENT_TOKEN = import.meta.env.VITE_CONTENTFUL_MANAGEMENT_TOKEN;

let client = null;

if (MANAGEMENT_TOKEN) {
  client = createClient({ accessToken: MANAGEMENT_TOKEN });
} else {
  console.warn("❌ VITE_CONTENTFUL_MANAGEMENT_TOKEN is missing.");
}

export default function SubmitArticle() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [contributor, setContributor] = useState(null);
  const [type, setType] = useState("africanTrendingNews");
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    body: "",
    category: "",
    tags: "",
    wisdomTakeaway: "",
    reflections: "",
    date: "",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [mediaAssets, setMediaAssets] = useState([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!user?.email) return;
    client
      .getSpace(SPACE_ID)
      .then((space) => space.getEnvironment(ENVIRONMENT))
      .then((env) =>
        env.getEntries({
          content_type: "contributor",
          "fields.email": user.email,
          limit: 1,
        })
      )
      .then((res) => {
        if (res.items.length > 0) {
          setContributor(res.items[0]);
        }
      })
      .catch((err) => console.error("Error fetching contributor:", err));
  }, [user?.email]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const uploadAsset = async (env, file) => {
    let asset = await env.createAssetFromFiles({
      fields: {
        title: { "en-US": file.name },
        file: {
          "en-US": {
            contentType: file.type,
            fileName: file.name,
            file,
          },
        },
      },
    });
    asset = await asset.processForAllLocales();
    asset = await env.getAsset(asset.sys.id);
    asset = await asset.publish();
    return asset;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contributor) {
      alert("Contributor profile not found.");
      return;
    }

    try {
      const space = await client.getSpace(SPACE_ID);
      const env = await space.getEnvironment(ENVIRONMENT);

      const coverAsset = coverImage ? await uploadAsset(env, coverImage) : null;
      const mediaAssetEntries =
        type === "africanTrendingNews"
          ? await Promise.all([...mediaAssets].map((file) => uploadAsset(env, file)))
          : [];

      // Build fields with exact case-sensitive field IDs from Contentful
      const fields = {
        slug: { "en-US": form.slug },
        date: { "en-US": form.date || new Date().toISOString() },
      };

      if (coverAsset) {
        fields.coverImage = {
          "en-US": {
            sys: {
              id: coverAsset.sys.id,
              linkType: "Asset",
              type: "Link",
            },
          },
        };
      }

      if (type === "africanTrendingNews") {
        fields.newsArticle = { "en-US": form.title };
        fields.summaryexcerpt = { "en-US": form.summary };
        fields.category = { "en-US": form.category };
        fields.tagscategory = { "en-US": form.tags };
        fields.BodyContent = {
          "en-US": {
            nodeType: "document",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                content: [{ nodeType: "text", value: form.body, marks: [], data: {} }],
                data: {},
              },
            ],
          },
        };
        fields.author = {
          "en-US": {
            sys: {
              id: contributor.sys.id,
              linkType: "Entry",
              type: "Link",
            },
          },
        };
        if (mediaAssetEntries.length > 0) {
          fields.mediaAssets = {
            "en-US": mediaAssetEntries.map((asset) => ({
              sys: {
                id: asset.sys.id,
                linkType: "Asset",
                type: "Link",
              },
            })),
          };
        }
      } else {
        // Sacred & Sovereign or other types: adjust accordingly
        fields.title = { "en-US": form.title };
        fields.summaryexcerpt = { "en-US": form.summary };
        fields.BodyContent = {
          "en-US": {
            nodeType: "document",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                content: [{ nodeType: "text", value: form.body, marks: [], data: {} }],
                data: {},
              },
            ],
          },
        };
        fields.wisdomTakeaway = { "en-US": form.wisdomTakeaway };
        fields.reflections = {
          "en-US": {
            nodeType: "document",
            data: {},
            content: [
              {
                nodeType: "paragraph",
                content: [{ nodeType: "text", value: form.reflections, marks: [], data: {} }],
                data: {},
              },
            ],
          },
        };
        fields.author = {
          "en-US": {
            sys: {
              id: contributor.sys.id,
              linkType: "Entry",
              type: "Link",
            },
          },
        };
      }

      const entry = await env.createEntry(type, { fields });
      await entry.publish();

      alert("Article submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. See console for details.");
    }
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <h1 className="text-3xl font-bold text-adinkra-highlight">Submit New Article</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
          >
            <option value="africanTrendingNews">African Trending News</option>
            <option value="sacredAndSovereign">Sacred & Sovereign</option>
          </select>

          <input
            name="title"
            onChange={handleInput}
            value={form.title}
            placeholder="Title"
            className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
            required
          />
          <input
            name="slug"
            onChange={handleInput}
            value={form.slug}
            placeholder="Slug"
            className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
            required
          />
          <textarea
            name="summary"
            onChange={handleInput}
            value={form.summary}
            placeholder="Summary/Excerpt"
            className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
          />

          {type === "africanTrendingNews" && (
            <>
              <input
                name="category"
                onChange={handleInput}
                value={form.category}
                placeholder="Category"
                className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
              />
              <input
                name="tags"
                onChange={handleInput}
                value={form.tags}
                placeholder="Tags/Category"
                className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
              />
            </>
          )}

          <textarea
            name="body"
            onChange={handleInput}
            value={form.body}
            placeholder="Body Content"
            className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold h-32"
            required
          />

          {type === "sacredAndSovereign" && (
            <>
              <input
                name="wisdomTakeaway"
                onChange={handleInput}
                value={form.wisdomTakeaway}
                placeholder="Wisdom Takeaway"
                className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold"
              />
              <textarea
                name="reflections"
                onChange={handleInput}
                value={form.reflections}
                placeholder="Reflections"
                className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold h-24"
              />
            </>
          )}

          <div>
            <label className="block mb-1">Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
          </div>

          {type === "africanTrendingNews" && (
            <div>
              <label className="block mb-1">Media Assets (multiple files)</label>
              <input
                type="file"
                accept="image/*,audio/*,video/*"
                multiple
                onChange={(e) => setMediaAssets(e.target.files)}
              />
            </div>
          )}

          <button
            type="submit"
            className="mt-4 px-6 py-2 rounded-full bg-adinkra-highlight text-black hover:bg-yellow-400 transition"
          >
            Submit Article
          </button>
        </form>
      </main>
      
    </div>
  );
}
