// src/pages/ShareDashboard.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";

const client = createClient({
  space: "8e41pkw4is56",
  accessToken: "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I",
});

export default function ShareDashboard() {
  const { id } = useParams();
  const [contributor, setContributor] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [sacredPosts, setSacredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .getEntry(id)
      .then((entry) => {
        setContributor({ ...entry.fields, id: entry.sys.id });
        return entry.fields;
      })
      .then((fields) => {
        const promises = [
          client.getEntries({
            content_type: "africanTrendingNews",
            "fields.author.sys.id": id,
          }),
          client.getEntries({
            content_type: "sacredAndSovereign",
            "fields.author": fields.name,
          }),
        ];
        return Promise.all(promises);
      })
      .then(([newsRes, sacredRes]) => {
        setTrendingArticles(newsRes.items);
        setSacredPosts(sacredRes.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-adinkra-bg text-adinkra-gold flex items-center justify-center">
        <p>Loading contributor profile...</p>
      </div>
    );
  }

  if (!contributor) {
    return (
      <div className="min-h-screen bg-adinkra-bg text-adinkra-gold flex items-center justify-center">
        <p>Contributor not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6 text-adinkra-highlight">
          Contributor Profile
        </h1>

        <div className="bg-adinkra-card p-6 rounded-lg shadow-md space-y-6">
          {contributor.photo?.fields?.file?.url && (
            <img
              src={`https:${contributor.photo.fields.file.url}`}
              alt={contributor.name}
              className="w-32 h-32 object-cover rounded-full border border-adinkra-highlight mb-4"
            />
          )}

          <p><strong>Name:</strong> {contributor.name}</p>
          <p><strong>Email:</strong> {contributor.email}</p>
          {contributor.bio && (
            <div>
              <strong>Bio:</strong>
              <div className="text-adinkra-gold/80 mt-1">
                {contributor.bio.content
                  .map((b) => b.content.map((t) => t.value).join("\n"))
                  .join("\n")}
              </div>
            </div>
          )}
          {contributor.skills && (
            <p><strong>Skills/Interests:</strong> {contributor.skills}</p>
          )}
          {contributor.dateJoined && (
            <p><strong>Date Joined:</strong> {new Date(contributor.dateJoined).toLocaleDateString()}</p>
          )}
        </div>

        {/* Trending News */}
        {trendingArticles.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-adinkra-highlight">
              Published News Articles
            </h2>
            <ul className="space-y-4">
              {trendingArticles.map((article) => (
                <li key={article.sys.id} className="p-4 bg-adinkra-bg border border-adinkra-highlight rounded-lg">
                  <h3 className="text-xl font-bold">{article.fields.newsArticle}</h3>
                  <p className="text-sm italic text-adinkra-gold/80">{new Date(article.fields.date).toLocaleDateString()} | {article.fields.category}</p>
                  <p className="mt-2">{article.fields.summaryExcerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sacred & Sovereign */}
        {sacredPosts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4 text-adinkra-highlight">
              Sacred & Sovereign Contributions
            </h2>
            <ul className="space-y-4">
              {sacredPosts.map((post) => (
                <li key={post.sys.id} className="p-4 bg-adinkra-bg border border-adinkra-highlight rounded-lg">
                  <h3 className="text-xl font-bold">{post.fields.title}</h3>
                  <p className="text-sm italic text-adinkra-gold/80">{new Date(post.fields.publishedDate).toLocaleDateString()}</p>
                  <p className="mt-2">{post.fields.excerpt}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    
    </div>
  );
}
