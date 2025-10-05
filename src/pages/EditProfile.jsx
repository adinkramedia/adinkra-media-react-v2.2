import { useEffect, useState } from "react";
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

export default function EditProfile() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();
  const [contributor, setContributor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
    twitter: "",
    linkedin: "",
    portfolio: "",
    photoFile: null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user?.email || !client) return;

    const fetchContributor = async () => {
      try {
        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT);
        const entries = await environment.getEntries({
          content_type: "contributor",
          "fields.email": user.email,
          limit: 1,
        });

        if (entries.items.length > 0) {
          const entry = entries.items[0];
          setContributor(entry);

          const { name, bio, skills, twitter, linkedin, website } = entry.fields;

          setForm((prev) => ({
            ...prev,
            name: name?.["en-US"] || "",
            bio: bio?.["en-US"]?.content?.[0]?.content?.[0]?.value || "",
            skills: skills?.["en-US"] || "",
            twitter: twitter?.["en-US"] || "",
            linkedin: linkedin?.["en-US"] || "",
            portfolio: website?.["en-US"] || "",
          }));
        }
      } catch (err) {
        console.error("❌ Error loading contributor:", err);
      }
    };

    fetchContributor();
  }, [user?.email]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "photoFile" ? files[0] : value,
    }));
  };

  const uploadPhotoAsset = async (environment, file) => {
    const asset = await environment.createAssetFromFiles({
      fields: {
        title: { "en-US": `${form.name}'s Profile Photo` },
        file: {
          "en-US": {
            contentType: file.type,
            fileName: file.name,
            file,
          },
        },
      },
    });

    const processed = await asset.processForAllLocales();
    return await processed.publish();
  };

  const handleSave = async () => {
    if (!contributor || !client) {
      alert("Contributor profile not loaded or Contentful token missing.");
      return;
    }

    setSaving(true);
    try {
      const space = await client.getSpace(SPACE_ID);
      const environment = await space.getEnvironment(ENVIRONMENT);

      contributor.fields.name = { "en-US": form.name };
      contributor.fields.bio = {
        "en-US": {
          nodeType: "document",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              content: [
                {
                  nodeType: "text",
                  value: form.bio,
                  marks: [],
                  data: {},
                },
              ],
              data: {},
            },
          ],
        },
      };
      contributor.fields.skills = { "en-US": form.skills };
      contributor.fields.twitter = { "en-US": form.twitter };
      contributor.fields.linkedin = { "en-US": form.linkedin };
      contributor.fields.website = { "en-US": form.portfolio };

      if (form.photoFile) {
        const uploadedAsset = await uploadPhotoAsset(environment, form.photoFile);
        contributor.fields.photo = {
          "en-US": {
            sys: {
              id: uploadedAsset.sys.id,
              linkType: "Asset",
              type: "Link",
            },
          },
        };
      }

      const updated = await contributor.update();
      await updated.publish();

      alert("Profile updated!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Failed to update contributor:", err);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-adinkra-bg text-adinkra-gold min-h-screen">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <h1 className="text-3xl font-bold text-adinkra-highlight">Edit Profile</h1>

        {!client && (
          <div className="bg-red-600 text-white p-4 rounded">
            Environment variables not loaded. Please check Netlify or Vite setup.
          </div>
        )}

        <div className="space-y-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold" />
          <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold h-32" />
          <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills" className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold" />
          <input name="twitter" value={form.twitter} onChange={handleChange} placeholder="Twitter URL" className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold" />
          <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold" />
          <input name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="Portfolio Website" className="w-full p-3 rounded bg-adinkra-card text-adinkra-gold" />
          <div>
            <label className="block text-sm text-adinkra-gold mb-1">Profile Photo</label>
            <input type="file" accept="image/*" name="photoFile" onChange={handleChange} className="block w-full text-adinkra-gold file:rounded file:border-0 file:p-2 file:bg-adinkra-highlight file:text-black" />
          </div>
          <button onClick={handleSave} disabled={saving} className="mt-4 px-6 py-2 rounded-full bg-adinkra-highlight text-black hover:bg-yellow-400 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
