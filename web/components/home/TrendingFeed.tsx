"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { Clock, ExternalLink } from "lucide-react";
import type { FeedItem } from "@/lib/data/fetchEducationPulse";

const TOPIC_COLORS: Record<string, string> = {
  Scholarship: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Admissions:  "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Visa:        "bg-purple-500/15 text-purple-400 border-purple-500/25",
  Ranking:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Research:    "bg-rose-500/15 text-rose-400 border-rose-500/25",
  Career:      "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
};

const FILTERS = ["All", "Scholarships", "Admissions", "Visa", "Career"] as const;
type Filter = (typeof FILTERS)[number];

const topicToFilter: Record<string, Filter> = {
  Scholarship: "Scholarships",
  Admissions: "Admissions",
  Visa: "Visa",
  Career: "Career",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function TopicBadge({ topic }: { topic: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TOPIC_COLORS[topic] ?? "bg-muted text-muted-foreground border-border"}`}>
      {topic}
    </span>
  );
}

export default function TrendingFeed({ initialItems }: { initialItems: FeedItem[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const trending = initialItems.filter((i) => !i.isDigest);
  const digests  = initialItems.filter((i) => i.isDigest);

  const filtered = activeFilter === "All"
    ? trending
    : trending.filter((i) => topicToFilter[i.topic] === activeFilter);

  return (
    <section id="pulse" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal>
          <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Live Feed
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground">
                Global Education Pulse
              </h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                What&apos;s moving in universities, scholarships, visas, and admissions — updated weekly.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter education news">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  aria-pressed={activeFilter === f}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    activeFilter === f
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Trending list */}
          <div className="lg:col-span-2">
            <Reveal delay={0.1}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Trending Now
              </h3>
            </Reveal>
            <StaggerChildren className="flex flex-col divide-y divide-border" stagger={0.07}>
              {filtered.map((item) => (
                <StaggerItem key={item.id}>
                  <motion.article
                    className="group py-4"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <TopicBadge topic={item.topic} />
                            <span className="text-xs text-muted-foreground">{item.region}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.snippet}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{formatDate(item.publishedAt)}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" /> {item.readTime} min read
                            </span>
                            <span className="text-primary/70">{item.sourceName}</span>
                          </div>
                        </div>
                        <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  </motion.article>
                </StaggerItem>
              ))}
              {filtered.length === 0 && (
                <p className="py-8 text-sm text-center text-muted-foreground">No stories matching this filter.</p>
              )}
            </StaggerChildren>
          </div>

          {/* Right: Weekly Digest */}
          <div>
            <Reveal delay={0.15}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Weekly Digest
              </h3>
            </Reveal>
            <div className="flex flex-col gap-4">
              {digests.map((item, i) => (
                <Reveal key={item.id} delay={0.2 + i * 0.1}>
                  <motion.article
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
                  >
                    <a
                      href={item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <TopicBadge topic={item.topic} />
                      <h4 className="mt-2 font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{item.snippet}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{item.readTime} min read</span>
                        <span>·</span>
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                    </a>
                  </motion.article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
