import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "contentful";
import RSS from "rss";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  space: process.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: process.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

async function generateRSS() {
  try {
    const feed = new RSS({
      title: "Adinkra Media – African Trending News",
      description: "Latest news and commentary from Adinkra Media",
      site_url: "https://www.adinkramedia.com",
      feed_url: "https://www.adinkramedia.com/rss.xml",
      language: "en",
      pubDate: new Date().toUTCString(),
      generator: "Adinkra Media RSS Generator",
      ttl: 60,
      custom_namespaces: {
        dc: "http://purl.org/dc/elements/1.1/",
      },
    });

    const entries = await client.getEntries({
      content_type: "africanTrendingNews",
      order: "-fields.date",
      limit: 20,
    });

    if (!entries.items.length) {
      console.warn("⚠️ No news articles found.");
    }

    entries.items.forEach((item) => {
      const fields = item.fields;

      const title = fields.entryTitle?.trim() || "Untitled Article";
      const slug = fields.slug?.trim() || "";
      const excerpt = fields.summaryExcerpt?.trim() || "Visit Adinkra Media for the full story.";
      const publishedDate = fields.date ? new Date(fields.date).toUTCString() : new Date().toUTCString();
      const authorName = fields.author?.fields?.name || "Adinkra Media";

      feed.item({
        title,
        description: excerpt,
        url: `https://www.adinkramedia.com/news/${slug}`,
        guid: `https://www.adinkramedia.com/news/${slug}`,
        date: publishedDate,
        author: authorName,
      });
    });

    const xml = feed.xml({ indent: true });
    const outputPath = path.resolve(__dirname, "../public/rss.xml");
    fs.writeFileSync(outputPath, xml, "utf8");

    console.log(`✅ RSS feed generated with ${entries.items.length} items at public/rss.xml`);
  } catch (error) {
    console.error("❌ Failed to generate RSS feed:", error.message);
    console.error(error);
  }
}

generateRSS();
