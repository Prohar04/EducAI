"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen, Sparkles, Bookmark, Award,
  Pencil, Globe, AlertCircle, CheckCircle2,
  ChevronRight, Target, Calendar, TrendingUp,
} from "lucide-react";
import type { UserProfile } from "@/types/auth.type";
import QuickEditProfile from "./QuickEditProfile";

// ─── Serialisable types (plain JSON — safe to pass from Server Component) ─────

export type SuggestionIconType = "target" | "bookmark" | "trending" | "calendar";

export type SerializedSuggestion = {
  iconType: SuggestionIconType;
  title: string;
  body: string;
  tag: string;
  tagVariant: "warn" | "info" | "success";
  href?: string;
  hrefLabel?: string;
};

type CountryInfo = { code: string; name: string; flag: string };

type StageOption = { value: string; label: string; description: string; tip: string };

// ─── Static data (icons live here, not in the server component) ───────────────

const SUGGESTION_ICONS: Record<SuggestionIconType, React.ComponentType<{ className?: string }>> = {
  target:   Target,
  bookmark: Bookmark,
  trending: TrendingUp,
  calendar: Calendar,
};

const ACTION_CARDS = [
  {
    href: "/app/programs",
    icon: BookOpen,
    title: "Find Programmes",
    description: "Browse universities worldwide filtered by your profile.",
    color: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
  },
  {
    href: "/app/match",
    icon: Sparkles,
    title: "Match Programmes",
    description: "AI ranks every programme by your admission likelihood.",
    color: "from-violet-500/10 to-violet-500/5",
    border: "border-violet-500/20",
  },
  {
    href: "/app/saved",
    icon: Bookmark,
    title: "Saved",
    description: "Review and compare your bookmarked programmes.",
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
  },
  {
    href: "/app/scholarships",
    icon: Award,
    title: "Scholarships",
    description: "Funding opportunities for international students.",
    color: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
  },
] as const;

// ─── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const TAG_STYLES = {
  warn:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info:    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  success: "bg-green-500/10 text-green-600 dark:text-green-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomeAnimations({
  firstName,
  prof,
  targetCountries,
  stage,
  suggestions,
  savedCount,
  profileComplete,
}: {
  firstName: string;
  prof: UserProfile | null;
  targetCountries: CountryInfo[];
  stage?: StageOption;
  suggestions: SerializedSuggestion[];
  savedCount: number;
  profileComplete: boolean;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

      {/* ── Header ── */}
      <motion.div {...(reduced ? {} : fadeUp(0))}>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Continue your study-abroad plan. Here&apos;s what needs your attention today.
        </p>
      </motion.div>

      {/* ── Profile completion banner ── */}
      {!profileComplete && (
        <motion.div {...(reduced ? {} : fadeUp(0.05))}>
          <div className="flex items-start gap-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium">Your profile is incomplete</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add your GPA, major, and English test score to get accurate programme matches.
              </p>
            </div>
            <Link
              href="/app/onboarding?edit=true"
              className="shrink-0 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
            >
              Complete now
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.section
        variants={reduced ? undefined : staggerContainer}
        initial="initial"
        animate="animate"
      >
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.href} variants={reduced ? undefined : staggerItem}>
                <Link
                  href={card.href}
                  className={`group flex h-full flex-col rounded-xl border bg-gradient-to-br p-5 transition-all hover:shadow-md ${card.color} ${card.border} hover:border-opacity-60`}
                >
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-background/60">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <p className="font-semibold transition-colors group-hover:text-primary">{card.title}</p>
                  <p className="mt-1 flex-1 text-xs text-muted-foreground">{card.description}</p>
                  <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary">
                    Go <ChevronRight className="size-3" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* ── Profile Summary ── */}
        <motion.section {...(reduced ? {} : fadeUp(0.1))} className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Your Profile</h2>
              <Link
                href="/app/onboarding?edit=true"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil className="size-3" /> Edit
              </Link>
            </div>

            {stage && (
              <div className="mb-3 rounded-lg bg-primary/5 px-3 py-2.5">
                <p className="text-xs font-semibold text-primary">{stage.label}</p>
                <p className="text-xs text-muted-foreground">{stage.description}</p>
              </div>
            )}

            <dl className="space-y-2.5 text-sm">
              {prof?.targetIntake && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Target intake</dt>
                  <dd className="font-medium">{prof.targetIntake}</dd>
                </div>
              )}
              {prof?.intendedLevel && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Degree level</dt>
                  <dd className="font-medium">{prof.intendedLevel}</dd>
                </div>
              )}
              {prof?.majorOrTrack && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Major / Field</dt>
                  <dd className="max-w-[140px] truncate text-right font-medium">{prof.majorOrTrack}</dd>
                </div>
              )}
              {prof?.gpa && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">GPA</dt>
                  <dd className="font-medium">
                    {prof.gpa}{prof.gpaScale ? ` / ${prof.gpaScale}` : ""}
                  </dd>
                </div>
              )}
              {prof?.englishTestType && prof.englishTestType !== "None" && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{prof.englishTestType}</dt>
                  <dd className="font-medium">{prof.englishScore ?? "—"}</dd>
                </div>
              )}
            </dl>

            {targetCountries.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Globe className="mr-1 inline size-3" /> Target Countries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {targetCountries.map((c) => (
                    <span
                      key={c.code}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs"
                    >
                      {c.flag} {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!stage && !prof?.targetIntake && targetCountries.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No profile data yet.{" "}
                <Link href="/app/onboarding?edit=true" className="text-primary hover:underline">
                  Set it up →
                </Link>
              </p>
            )}
          </div>

          {/* Quick edit: major & English test */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold">Quick Update</h3>
            <QuickEditProfile
              majorOrTrack={prof?.majorOrTrack}
              englishTestType={prof?.englishTestType}
            />
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">{savedCount}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Saved programmes</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold text-primary">—</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Matches generated</p>
            </div>
          </div>
        </motion.section>

        {/* ── Next Steps / Suggestions ── */}
        <motion.section {...(reduced ? {} : fadeUp(0.15))} className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Next Steps</h2>
          {suggestions.length > 0 ? (
            <motion.div
              className="grid gap-4 sm:grid-cols-2"
              variants={reduced ? undefined : staggerContainer}
              initial="initial"
              animate="animate"
            >
              {suggestions.map((s, i) => {
                const Icon = SUGGESTION_ICONS[s.iconType];
                return (
                  <motion.div
                    key={i}
                    variants={reduced ? undefined : staggerItem}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <span className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${TAG_STYLES[s.tagVariant]}`}>
                        {s.tag}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                    </div>
                    {s.href && (
                      <Link href={s.href} className="mt-auto text-xs font-medium text-primary hover:underline">
                        {s.hrefLabel}
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-10 text-center">
              <CheckCircle2 className="mb-2 size-8 text-green-500" />
              <p className="font-medium">You&apos;re on track!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                No immediate actions needed. Keep exploring programmes.
              </p>
              <Link href="/app/programs" className="mt-4 text-sm font-medium text-primary hover:underline">
                Browse programmes →
              </Link>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
