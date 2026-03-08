import { unstable_cache } from "next/cache";
import Parser from "rss-parser";
import staticFeed from "./educationFeed.json";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type FeedItem = {
  id: string;
  title: string;
  snippet: string;
  region: string;
  topic: string;
  publishedAt: string;
  readTime: number;
  sourceName: string;
  url: string;
  isDigest?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// RSS sources — education-focused, publicly accessible feeds
// ─────────────────────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  {
    url: "https://studyinternational.com/feed/",
    name: "Study International",
    region: "Global",
    topic: "Admissions",
  },
  {
    url: "https://www.universityworldnews.com/rss.php",
    name: "University World News",
    region: "Global",
    topic: "Research",
  },
  {
    url: "https://thepienews.com/feed/",
    name: "The PIE News",
    region: "Global",
    topic: "Visa",
  },
  {
    url: "https://www.scholarship-positions.com/feed/",
    name: "Scholarship Positions",
    region: "Global",
    topic: "Scholarship",
  },
  {
    url: "https://www.timeshighereducation.com/news/rss.xml",
    name: "Times Higher Education",
    region: "Global",
    topic: "Ranking",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function guessReadTime(text: string): number {
  return Math.max(1, Math.round(text.split(" ").length / 200));
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetcher (wrapped with unstable_cache for 24 h server-side caching)
// ─────────────────────────────────────────────────────────────────────────────

async function _fetchEducationPulse(): Promise<FeedItem[]> {
  const parser = new Parser({ timeout: 8_000 });
  const allItems: FeedItem[] = [];

  await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        feed.items.slice(0, 5).forEach((entry, i) => {
          const raw =
            entry.contentSnippet ?? entry.content ?? entry.summary ?? "";
          const snippet = stripHtml(raw).slice(0, 220);
          allItems.push({
            id: `${source.name}-${i}-${entry.isoDate ?? Date.now()}`,
            title: entry.title ?? "Untitled",
            snippet: snippet || "Click to read the full article.",
            region: source.region,
            topic: source.topic,
            publishedAt: entry.isoDate ?? new Date().toISOString(),
            readTime: guessReadTime(snippet),
            sourceName: source.name,
            url: entry.link ?? source.url,
          });
        });
      } catch {
        // Skip unresponsive source — fallback kicks in below if all fail
      }
    }),
  );

  // Sort newest-first
  allItems.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  // Fallback to bundled static data when no live feeds responded
  if (allItems.length === 0) {
    return (staticFeed as Array<Omit<FeedItem, "url"> & { url?: string }>).map(
      (item) => ({ ...item, url: item.url ?? "#" }),
    );
  }

  // First 10 → trending, next 4 → digest sidebar
  const trending = allItems.slice(0, 10).map((item) => ({
    ...item,
    isDigest: false,
  }));
  const digests = allItems.slice(10, 14).map((item) => ({
    ...item,
    isDigest: true,
  }));

  return [...trending, ...digests];
}

export const fetchEducationPulse = unstable_cache(
  _fetchEducationPulse,
  ["education-pulse"],
  { revalidate: 86_400 }, // 24 h
);
