// scripts/generate-sitemap.js
import { createClient } from "contentful";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
  space: process.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: process.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const BASE_URL = "https://adinkramedia.com"; // Update to your live site domain

async function fetchAllEntries(contentType) {
  let allItems = [];
  let skip = 0;
  const pageSize = 100;
  let total = 0;

  do {
    const res = await client.getEntries({
      content_type: contentType,
      limit: pageSize,
      skip,
    });
    allItems = [...allItems, ...res.items];
    total = res.total;
    skip += pageSize;
  } while (skip < total);

  return allItems;
}

async function generateSitemap() {
  console.log("🗺️ Generating sitemap...");

  const urls = [];

  // Static pages
  const staticPages = [
    "",
    "news",
    "house-of-ausar",
    "audio",
    "adinkra-tv",
    "premium-tv",
    "about",
    "contact",
  ];
  staticPages.forEach((page) => urls.push(`${BASE_URL}/${page}`));

  // Contentful dynamic pages
  const contentTypes = [
    { id: "africanTrendingNews", path: "news-article" },
    { id: "houseOfAusar", path: "house-article" }, // ✅ corrected
    { id: "audioTrack", path: "audio" },
    { id: "album", path: "album" },
  ];

  for (const type of contentTypes) {
    try {
      console.log(`⏳ Fetching entries for content type: ${type.id}`);
      const entries = await fetchAllEntries(type.id);

      entries.forEach((entry) => {
        const slug = entry.fields.slug;
        if (slug) urls.push(`${BASE_URL}/${type.path}/${slug}`);
      });
    } catch (error) {
      console.warn(
        `⚠️ Skipping invalid content type: ${type.id} (${error.message})`
      );
    }
  }

  // Create sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  const filePath = path.resolve("public", "sitemap.xml");
  fs.writeFileSync(filePath, sitemap, "utf8");

  console.log(`✅ Sitemap generated with ${urls.length} URLs: ${filePath}`);
}

generateSitemap().catch((err) => {
  console.error("❌ Error generating sitemap:", err);
  process.exit(1);
});
