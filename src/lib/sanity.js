import { createClient } from "@sanity/client";

export const sanity = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});