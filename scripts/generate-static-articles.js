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
  accessToken: process.env.VITE_CONTENTFUL_ACCESS_TOKEN
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
// 🔥 TEMPLATE FOR STATIC HTML
// --------------------------
function generateHTML({ title, description, image, slug, type }) {
  const pageUrl = `https://adinkramedia.com/${type}/${slug}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>${title}</title>
<meta name="description" content="${description}" />

<!-- Open Graph -->
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:type" content="article" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />

</head>
<body>
  <div style="font-family: sans-serif; padding: 40px;">
    <h1>${title}</h1>
    <p>This is a static metadata page used for social sharing.</p>
    <p><a href="${pageUrl}" style="color: blue;">Click here to read the full article.</a></p>
  </div>
</body>
</html>
`;
}

// --------------------------
// 🔥 PROCESS CONTENTFUL ENTRIES
// --------------------------
async function generateStaticPages() {
  console.log("🔍 Fetching Contentful entries...");

  const TYPES = [
    { id: "newsArticle", path: "news" },
    { id: "houseArticle", path: "house-of-ausar" },
    { id: "sacredArticle", path: "sacred-and-sovereign" }
  ];

  for (const model of TYPES) {
    const entries = await client.getEntries({ content_type: model.id });

    console.log(`📌 Rendering ${entries.items.length} ${model.id} pages...`);

    for (const item of entries.items) {
      const title = item.fields.title || "Untitled";
      const slug = item.fields.slug;
      const summary = item.fields.summaryExcerpt || "Read this article on Adinkra Media.";
      const image = item.fields.coverImage?.fields?.file?.url
        ? "https:" + item.fields.coverImage.fields.file.url
        : "https://adinkramedia.com/default-og.jpg";

      const html = generateHTML({
        title,
        description: summary,
        image,
        slug,
        type: model.path
      });

      const articleDir = path.join(OUTPUT_DIR, model.path, slug);
      const articleFile = path.join(articleDir, "index.html");

      ensureDir(articleDir);
      fs.writeFileSync(articleFile, html);

      console.log(`✅ Static page generated: /static/${model.path}/${slug}/index.html`);
    }
  }

  console.log("🎉 ALL STATIC PAGES GENERATED SUCCESSFULLY!");
}

// --------------------------
generateStaticPages().catch(console.error);
