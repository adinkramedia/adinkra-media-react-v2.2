import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "contentful";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  space: process.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: process.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const OUTPUT_DIR = path.join(__dirname, "..", "dist", "static");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generateHTML({ title, summary, image, slug, type }) {
  const pageUrl = `https://adinkramedia.com/${type}/${slug}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${summary}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${summary}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${summary}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
  <div style="font-family: sans-serif; padding: 40px;">
    <h1>${title}</h1>
    <p>${summary}</p>
    <p><a href="${pageUrl}" style="color: blue;">Click here to read the full article.</a></p>
  </div>
</body>
</html>`;
}

async function generateStaticPages() {
  const TYPES = [
    {
      id: "africanTrendingNews",
      path: "news",
      titleField: "newsArticle",       // exact API ID
      summaryField: "summaryexcerpt",  // exact API ID (lowercase e)
    },
    {
      id: "houseOfAusar",
      path: "house-of-ausar",
      titleField: "title",
      summaryField: "excerpt",
    },
  ];

  for (const model of TYPES) {
    const entries = await client.getEntries({ content_type: model.id });
    console.log(`📌 Rendering ${entries.items.length} pages for ${model.id}...`);

    for (const item of entries.items) {
      const slug = item.fields.slug || "";
      if (!slug) continue;

      // Title
      let title = item.fields[model.titleField] || "Untitled";

      // Summary
      let summary = item.fields[model.summaryField] || "";
      if (!summary && item.fields.bodyContent?.content?.length) {
        const block = item.fields.bodyContent.content.find(b => b.content?.length);
        if (block) summary = block.content.map(c => c.value).join(" ").slice(0, 150);
      }
      if (!summary) summary = "Read this article on Adinkra Media.";

      // OG Image
      const image = item.fields.coverImage?.fields?.file?.url
        ? "https:" + item.fields.coverImage.fields.file.url
        : "https://adinkramedia.com/default-og.jpg";

      console.log(`✅ Generating: slug=${slug}, title="${title}"`);

      const html = generateHTML({ title, summary, image, slug, type: model.path });
      const articleDir = path.join(OUTPUT_DIR, model.path, slug);
      const articleFile = path.join(articleDir, "index.html");
      ensureDir(articleDir);
      fs.writeFileSync(articleFile, html);
    }
  }

  console.log("🎉 All static pages generated!");
}

generateStaticPages().catch(console.error);
