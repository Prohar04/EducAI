"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { ChevronRight, Zap, Clock, Hourglass } from "lucide-react";

const STATUS_CONFIG = {
  Now:  { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: Zap },
  Next: { color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock },
  Soon: { color: "bg-muted text-muted-foreground border-border", icon: Hourglass },
} as const;

type Status = keyof typeof STATUS_CONFIG;

const MODULES: {
  id: string;
  number: number;
  name: string;
  status: Status;
  tagline: string;
  bullets: string[];
}[] = [
  {
    id: "m1",
    number: 1,
    name: "Program Finder",
    status: "Now",
    tagline: "AI-matched universities & programs",
    bullets: [
      "Profile-based program matching",
      "Real-time scraping from 300+ universities",
      "GPA / test score fit scoring",
      "Budget & country filters",
    ],
  },
  {
    id: "m2",
    number: 2,
    name: "Scholarship Hunter",
    status: "Next",
    tagline: "Personalized scholarship discovery",
    bullets: [
      "Country + major targeting",
      "Deadline tracker with reminders",
      "Eligibility pre-screening",
      "Auto-generate essay starters",
    ],
  },
  {
    id: "m3",
    number: 3,
    name: "Application Planner",
    status: "Soon",
    tagline: "Timeline, docs, and contacts",
    bullets: [
      "Gantt-style application timeline",
      "Document checklist by school",
      "Professor cold-email drafts",
      "SOP builder with AI co-writer",
    ],
  },
  {
    id: "m4",
    number: 4,
    name: "Visa & Arrival Guide",
    status: "Soon",
    tagline: "Post-admission navigation",
    bullets: [
      "Country-specific visa checklists",
      "Cost-of-living estimator",
      "Community connect by destination",
      "First-week arrival briefing",
    ],
  },
];

export default function RoadmapCards() {
  return (
    <section id="roadmap" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Roadmap</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Upcoming in EducAI
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Four intelligent modules to guide you from decision to departure. Here&apos;s what&apos;s live, what&apos;s next, and what&apos;s shipping soon.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod, i) => {
            const statusCfg = STATUS_CONFIG[mod.status];
            const StatusIcon = statusCfg.icon;
            return (
              <Reveal key={mod.id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col rounded-xl border border-border bg-card p-6 h-full hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all"
                >
                  {/* Module number + status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {mod.number}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.color}`}>
                      <StatusIcon className="size-3" />
                      {mod.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-foreground text-base">{mod.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{mod.tagline}</p>

                  <ul className="mt-4 flex-1 space-y-2">
                    {mod.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-primary/60" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <a
                      href="mailto:hello@educai.app?subject=EducAI%20Waitlist"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Join waitlist updates
                    </a>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
