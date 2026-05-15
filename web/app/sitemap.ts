import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://educai-web.vercel.app";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

const COUNTRY_SLUGS = [
  "germany",
  "canada",
  "united-kingdom",
  "australia",
  "united-states",
  "netherlands",
  "france",
  "sweden",
  "ireland",
  "singapore",
];

async function fetchProgramIds(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/programs/ids`, {
      next: { revalidate: 86400 }, // revalidate once per day
    });
    if (!res.ok) return [];
    const data = await res.json() as { ids?: string[] };
    return data.ids ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/study-abroad`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/scholarships`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/visa`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/countries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const countryPages: MetadataRoute.Sitemap = COUNTRY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/countries/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  // Dynamic program pages — fetch IDs from API (fails gracefully if API is down)
  const programIds = await fetchProgramIds();
  const programPages: MetadataRoute.Sitemap = programIds.map((id) => ({
    url: `${BASE_URL}/app/programs/${id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...countryPages, ...programPages];
}
