// ... existing imports
import { useAuth0 } from "@auth0/auth0-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "contentful";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const client = createClient({
  space: SPACE_ID,
  accessToken: ACCESS_TOKEN,
});

export default function Dashboard() {
  const { isAuthenticated, user, logout, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [contributor, setContributor] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [sacredPosts, setSacredPosts] = useState([]);
  const [copied, setCopied] = useState(false); // NEW STATE

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user?.email) {
      client
        .getEntries({
          content_type: "contributor",
          "fields.email": user.email,
          limit: 1,
        })
        .then((res) => {
          if (res.items.length > 0) {
            const contributorEntry = res.items[0];
            setContributor({
              ...contributorEntry.fields,
              id: contributorEntry.sys.id,
            });
          }
          setLoadingProfile(false);
        })
        .catch((err) => {
          console.error("Error fetching contributor profile:", err);
          setLoadingProfile(false);
        });
    }
  }, [user?.email]);

  useEffect(() => {
    if (contributor?.id) {
      client
        .getEntries({
          content_type: "africanTrendingNews",
          "fields.author.sys.id": contributor.id,
        })
        .then((res) => setTrendingArticles(res.items))
        .catch((err) =>
          console.error("Error fetching Trending News:", err)
        );
    }

    if (contributor?.name) {
      client
        .getEntries({
          content_type: "sacredAndSovereign",
          "fields.author": contributor.name,
        })
        .then((res) => setSacredPosts(res.items))
        .catch((err) =>
          console.error("Error fetching Sacred & Sovereign posts:", err)
        );
    }
  }, [contributor?.id, contributor?.name]);

  const handleShare = () => {
    const url = `${window.location.origin}/contributor/${contributor.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-adinkra-bg text-adinkra-gold flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isApproved = contributor?.status === "Approved";

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      <section className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-6 text-adinkra-highlight">
          Welcome to your Dashboard
        </h1>

        {!contributor ? (
          <div className="bg-adinkra-card p-6 rounded-lg shadow-md">
            <p className="text-adinkra-gold/80 mb-4">
              You haven’t set up your contributor profile yet.
            </p>
            <p>Please contact Adinkra Media to finalize your onboarding.</p>
          </div>
        ) : !isApproved ? (
          <div className="bg-adinkra-card p-6 rounded-lg shadow-md">
            <p className="text-yellow-400 mb-4 font-semibold">
              Your application is still <strong>{contributor.status}</strong>.
            </p>
            <p>
              Once approved, you’ll get full access to submit articles and edit your profile.
            </p>
          </div>
        ) : (
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
            <p><strong>Status:</strong> <span className="text-green-400 font-semibold">{contributor.status}</span></p>

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

            <div className="space-y-1">
              {contributor.twitter && (
                <p><strong>Twitter:</strong> <a href={contributor.twitter} target="_blank" rel="noopener noreferrer" className="text-adinkra-highlight hover:underline">{contributor.twitter}</a></p>
              )}
              {contributor.linkedin && (
                <p><strong>LinkedIn:</strong> <a href={contributor.linkedin} target="_blank" rel="noopener noreferrer" className="text-adinkra-highlight hover:underline">{contributor.linkedin}</a></p>
              )}
              {contributor["website/portfolio"] && (
                <p><strong>Portfolio:</strong> <a href={contributor["website/portfolio"]} target="_blank" rel="noopener noreferrer" className="text-adinkra-highlight hover:underline">{contributor["website/portfolio"]}</a></p>
              )}
            </div>

            {contributor.dateJoined && (
              <p><strong>Date Joined:</strong> {new Date(contributor.dateJoined).toLocaleDateString()}</p>
            )}

            {/* 🔗 Share Button */}
            <div>
              <button
                onClick={handleShare}
                className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {copied ? "Link Copied!" : "Share My Dashboard"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 flex-wrap">
              <button
                onClick={() => navigate("/edit-profile")}
                className="px-6 py-2 rounded-full bg-adinkra-highlight text-adinkra-bg hover:bg-yellow-500 transition"
              >
                Edit Profile
              </button>

              <button
                onClick={() => navigate("/submit-article")}
                className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
              >
                Submit New Article
              </button>

              <button
                onClick={() => logout({ returnTo: window.location.origin })}
                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
              >
                Log Out
              </button>
            </div>

            {/* Trending News Section */}
            <div className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-adinkra-highlight">Your Trending News Articles</h2>
              {trendingArticles.length === 0 ? (
                <p className="text-adinkra-gold/70">You haven’t published any trending news articles yet.</p>
              ) : (
                <ul className="space-y-4">
                  {trendingArticles.map((article) => (
                    <li key={article.sys.id} className="p-4 bg-adinkra-bg border border-adinkra-highlight rounded-lg">
                      <h3 className="text-xl font-bold">{article.fields.newsArticle}</h3>
                      <p className="text-sm italic text-adinkra-gold/80">{new Date(article.fields.date).toLocaleDateString()} | {article.fields.category}</p>
                      <p className="mt-2">{article.fields.summaryExcerpt}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Sacred & Sovereign Section */}
            {sacredPosts.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4 text-adinkra-highlight">Your Sacred & Sovereign Posts</h2>
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
          </div>
        )}
      </section>
    </div>
  );
}
