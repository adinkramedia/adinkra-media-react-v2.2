import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "contentful";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------
// 🔥 CONTENTFUL CLIENT
// --------------------------
const client = createClient({
  space: process.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: process.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

// --------------------------
// 🔥 OUTPUT DIRECTORY
// --------------------------
const OUTPUT_DIR = path.join(__dirname, "..", "dist", "static");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// --------------------------
// 🔥 STATIC HTML TEMPLATE
// --------------------------
function generateHTML({ title, summary, image, slug, type }) {
  const pageUrl = `https://adinkramedia.com/${type}/${slug}`;
  const ogImage = image || "https://adinkramedia.com/default-og.jpg";
  const pageTitle = title || "Untitled";
  const pageSummary = summary || "Read this article on Adinkra Media.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>${pageTitle}</title>
<meta name="description" content="${pageSummary}" />

<!-- Open Graph -->
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${pageSummary}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:type" content="article" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${pageSummary}" />
<meta name="twitter:image" content="${ogImage}" />

</head>
<body>
  <div style="font-family: sans-serif; padding: 40px;">
    <h1>${pageTitle}</h1>
    <p>${pageSummary}</p>
    <p><a href="${pageUrl}" style="color: blue;">Click here to read the full article.</a></p>
  </div>
</body>
</html>`;
}

// --------------------------
// 🔥 PROCESS CONTENTFUL ENTRIES
// --------------------------
async function generateStaticPages() {
  console.log("🔍 Fetching Contentful entries...");

  const TYPES = [
    { id: "africanTrendingNews", path: "news" },
    { id: "houseOfAusar", path: "house-of-ausar" },
  ];

  for (const model of TYPES) {
    try {
      const entries = await client.getEntries({ content_type: model.id });
      console.log(`📌 Rendering ${entries.items.length} ${model.id} pages...`);

      for (const item of entries.items) {
        const slug = item.fields.slug;
        if (!slug) continue;

        // Determine title & summary based on content type
        let title = "Untitled";
        let summary = "Read this article on Adinkra Media.";

        if (model.id === "africanTrendingNews") {
          title = item.fields.newsArticle || title;
          summary = item.fields.summaryExcerpt || summary;
        } else if (model.id === "houseOfAusar") {
          title = item.fields.title || title;
          summary = item.fields.summaryExcerpt || summary;
        }

        // Fallback: use first 150 chars of bodyContent if summary missing
        if ((!summary || summary === "Read this article on Adinkra Media.") &&
            item.fields.bodyContent?.content?.[0]?.content?.[0]?.value) {
          summary = item.fields.bodyContent.content[0].content[0].value.slice(0, 150);
        }

        // OG image fallback
        const image =
          item.fields.coverImage?.fields?.file?.url
            ? "https:" + item.fields.coverImage.fields.file.url
            : "https://adinkramedia.com/default-og.jpg";

        // ✅ Debug logging for title and summary
        console.log(`🔹 Generating page for slug: ${slug}`);
        console.log(`   Title: "${title}"`);
        console.log(`   Summary: "${summary}"`);
        console.log(`   Image: "${image}"`);

        const html = generateHTML({ title, summary, image, slug, type: model.path });

        const articleDir = path.join(OUTPUT_DIR, model.path, slug);
        const articleFile = path.join(articleDir, "index.html");

        ensureDir(articleDir);
        fs.writeFileSync(articleFile, html);

        console.log(`✅ Static page generated: /static/${model.path}/${slug}/index.html`);
      }
    } catch (err) {
      console.log(`❌ ERROR fetching ${model.id}`);
      console.error(err.message);
    }
  }

  console.log("🎉 ALL STATIC PAGES GENERATED SUCCESSFULLY!");
}

generateStaticPages().catch(console.error);
