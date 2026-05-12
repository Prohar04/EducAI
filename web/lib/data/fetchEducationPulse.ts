import { unstable_cache } from "next/cache";
import { XMLParser } from "fast-xml-parser";
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

function toText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return toText(value[0]);
  if (value && typeof value === "object") {
    const node = value as Record<string, unknown>;
    if (typeof node["#text"] === "string") return node["#text"];
    if (typeof node.href === "string") return node.href;
  }
  return "";
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function extractItems(xml: string): Array<Record<string, unknown>> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    removeNSPrefix: true,
    parseTagValue: true,
    parseAttributeValue: true,
    trimValues: true,
  });

  const parsed = parser.parse(xml) as {
    rss?: { channel?: { item?: Record<string, unknown> | Record<string, unknown>[] } };
    feed?: { entry?: Record<string, unknown> | Record<string, unknown>[] };
  };

  return [
    ...toArray(parsed.rss?.channel?.item),
    ...toArray(parsed.feed?.entry),
  ];
}

async function fetchFeedItems(url: string): Promise<Array<Record<string, unknown>>> {
  const response = await fetch(url, {
    headers: {
      accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load feed: ${response.status}`);
  }

  const xml = await response.text();
  return extractItems(xml);
}

function getEntryUrl(entry: Record<string, unknown>): string {
  const link = entry.link;

  if (typeof link === "string") return link;
  if (Array.isArray(link)) return getEntryUrl({ link: link[0] as unknown as Record<string, unknown> });
  if (link && typeof link === "object") {
    const linkObject = link as Record<string, unknown>;
    if (typeof linkObject.href === "string") return linkObject.href;
    if (typeof linkObject.url === "string") return linkObject.url;
  }

  return "";
}

function getEntryDate(entry: Record<string, unknown>): string {
  return (
    toText(entry.isoDate) ||
    toText(entry.pubDate) ||
    toText(entry.published) ||
    toText(entry.updated) ||
    new Date().toISOString()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetcher (wrapped with unstable_cache for 24 h server-side caching)
// ─────────────────────────────────────────────────────────────────────────────

async function _fetchEducationPulse(): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];

  await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      try {
        const entries = await fetchFeedItems(source.url);

        entries.slice(0, 5).forEach((entry, i) => {
          const raw =
            toText(entry.contentSnippet) ||
            toText(entry.description) ||
            toText(entry.summary) ||
            toText(entry.content) ||
            "";
          const snippet = stripHtml(raw).slice(0, 220);
          allItems.push({
            id: `${source.name}-${i}-${getEntryDate(entry)}`,
            title: toText(entry.title) || "Untitled",
            snippet: snippet || "Click to read the full article.",
            region: source.region,
            topic: source.topic,
            publishedAt: getEntryDate(entry),
            readTime: guessReadTime(snippet),
            sourceName: source.name,
            url: getEntryUrl(entry) || source.url,
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
  { revalidate: 3600 }, // 1 hour - refreshed hourly
);
