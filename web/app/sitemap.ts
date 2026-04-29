import type { MetadataRoute } from "next";

const BASE_URL = "https://educai-web.vercel.app";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/study-abroad`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/scholarships`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/visa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/countries`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const countryPages: MetadataRoute.Sitemap = COUNTRY_SLUGS.map((slug) => ({
    url: `${BASE_URL}/countries/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...countryPages];
}
