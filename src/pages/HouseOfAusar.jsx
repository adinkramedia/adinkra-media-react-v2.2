import { useEffect, useState } from "react";
import { createClient } from "contentful";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const SPACE_ID = "8e41pkw4is56";
const ACCESS_TOKEN = "qM0FzdQIPkX6VF4rt8wXzzLiPdgbjmmNGzHarCK0l8I";

const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN });

export default function HouseOfAusar() {
  const [ausarPosts, setAusarPosts] = useState([]);
  const [sacredPosts, setSacredPosts] = useState([]);

  useEffect(() => {
    client
      .getEntries({ content_type: "houseOfAusar" })
      .then((res) => setAusarPosts(res.items))
      .catch(console.error);

    client
      .getEntries({ content_type: "sacredAndSovereign" })
      .then((res) => setSacredPosts(res.items))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full h-[70vh] bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/house-of-ausar-hero-desktop.jpg')" }}
        />
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center md:hidden"
          style={{ backgroundImage: "url('/house-of-ausar-hero-mobile.jpg')" }}
        />
        <div className="relative z-10 flex items-center justify-center h-full bg-black/50 text-center px-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-adinkra-gold mb-4">
              House of Ausar
            </h1>
            <p className="text-adinkra-gold/80 max-w-2xl mx-auto text-lg">
              Reflections, teachings, and sacred writings from the spiritual archive of Nubian wisdom.
            </p>
          </div>
        </div>
      </section>

      {/* House of Ausar Blog Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-8 text-adinkra-highlight">
          From the House of Ausar
        </h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {ausarPosts.map((post) => {
            const { title, excerpt, publishedDate, coverImage } = post.fields;
            const cover = coverImage?.fields?.file?.url;

            return (
              <div
                key={post.sys.id}
                className="bg-adinkra-card rounded-xl border border-adinkra-highlight p-4 shadow-md"
              >
                {cover && (
                  <div
                    className="h-48 bg-cover bg-center rounded mb-4"
                    style={{ backgroundImage: `url(https:${cover})` }}
                  />
                )}
                <h3 className="text-xl font-semibold mb-2 text-adinkra-gold">{title}</h3>
                <p className="text-sm mb-3 text-adinkra-gold/70">
                  {new Date(publishedDate).toLocaleDateString()}
                </p>
                <p className="text-sm mb-4 text-adinkra-gold/90">{excerpt}</p>
                <Link
                  to={`/house-article/${post.sys.id}`}
                  className="text-adinkra-highlight font-semibold hover:underline"
                >
                  Read More →
                </Link>
              </div>
            );
          })}
        </div>
      </section>
 
    </div>
  );
}
