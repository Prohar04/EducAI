import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile, searchPrograms, getSavedPrograms, matchPrograms } from "@/lib/auth/action";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Bookmark,
  Award,
  Pencil,
  ChevronRight,
} from "lucide-react";
import type { Program, SavedProgramItem, MatchResult } from "@/types/auth.type";

// ─── Quick-action cards ───────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    href: "/app/programs",
    icon: BookOpen,
    title: "Find Programs",
    description: "Browse and filter university programmes worldwide.",
    cta: "Browse",
  },
  {
    href: "/app/match",
    icon: Sparkles,
    title: "Match Programs",
    description: "Score every programme against your profile instantly.",
    cta: "Match",
  },
  {
    href: "/app/saved",
    icon: Bookmark,
    title: "Saved Programs",
    description: "Review your bookmarked programmes.",
    cta: "View saved",
  },
  {
    href: "/app/scholarships",
    icon: Award,
    title: "Scholarships",
    description: "Funding opportunities — coming soon.",
    cta: "Coming soon",
    disabled: true,
  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  cta,
  disabled = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  cta: string;
  disabled?: boolean;
}) {
  const inner = (
    <div
      className={`group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors ${
        disabled
          ? "opacity-60"
          : "hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
      }`}
    >
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h2 className={`font-semibold ${!disabled && "group-hover:text-primary"}`}>
        {title}
      </h2>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{description}</p>
      <span className="mt-4 text-xs font-medium text-primary">{cta} →</span>
    </div>
  );

  return disabled ? <div>{inner}</div> : <Link href={href}>{inner}</Link>;
}

function ProgramCard({ program }: { program: Program }) {
  const tuition =
    program.tuitionMinUSD != null
      ? `$${program.tuitionMinUSD.toLocaleString()}/yr`
      : null;
  return (
    <Link
      href={`/app/programs/${program.id}`}
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{program.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {program.university.name} · {program.university.country.name}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {tuition && <p className="text-xs text-muted-foreground">{tuition}</p>}
        <ChevronRight className="ml-auto size-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function MatchCard({ result }: { result: MatchResult }) {
  const s = result.programSummary;
  return (
    <Link
      href={`/app/programs/${result.programId}`}
      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{s.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {s.universityName} · {s.country}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            result.score >= 80
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : result.score >= 50
                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                : "bg-muted text-muted-foreground"
          }`}
        >
          {result.score}%
        </span>
      </div>
    </Link>
  );
}

function SavedCard({ item }: { item: SavedProgramItem }) {
  return <ProgramCard program={item.program} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AppDashboard() {
  const [session, profile] = await Promise.all([
    getSession(),
    getUserProfile(),
  ]);

  if (!session) redirect("/auth/signin");

  if (!profile || !profile.onboardingDone) {
    redirect("/app/onboarding");
  }

  // Build match input from profile for the recommendations widget
  const matchInput: Record<string, string> = {};
  if (profile.targetCountry) matchInput.targetCountry = profile.targetCountry;
  if (profile.level) matchInput.level = profile.level.toUpperCase();
  if (profile.intendedMajor) matchInput.intendedField = profile.intendedMajor;

  // Fire all data fetches in parallel; failures are swallowed for resilience
  const [recentResult, savedPrograms] = await Promise.allSettled([
    // If we have a profile, run match; otherwise fall back to a simple search
    Object.keys(matchInput).length > 0
      ? matchPrograms(undefined, (() => {
          const fd = new FormData();
          for (const [k, v] of Object.entries(matchInput)) fd.append(k, v);
          if (profile.gpa) fd.append("gpa", String(profile.gpa));
          return fd;
        })())
      : searchPrograms({ limit: "5" }),
    getSavedPrograms(),
  ]);

  const topMatches: MatchResult[] =
    recentResult.status === "fulfilled" && recentResult.value
      ? "results" in (recentResult.value as object)
        ? ((recentResult.value as { results?: MatchResult[] }).results ?? []).slice(0, 5)
        : []
      : [];

  const topPrograms: Program[] =
    recentResult.status === "fulfilled" && recentResult.value
      ? "items" in (recentResult.value as object)
        ? ((recentResult.value as { items?: Program[] }).items ?? []).slice(0, 5)
        : []
      : [];

  const saved: SavedProgramItem[] =
    savedPrograms.status === "fulfilled" ? savedPrograms.value : [];

  const userName = session.user.name?.split(" ")[0] ?? "there";

  const LEVEL_DISPLAY: Record<string, string> = {
    BSC: "Bachelor's", MSC: "Master's", PHD: "PhD", MBA: "MBA", DIPLOMA: "Diploma",
    BSc: "Bachelor's", MSc: "Master's", PhD: "PhD",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{userName}</span>! Here&apos;s your personalised overview.
        </p>
      </div>

      {/* ── Quick actions ── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <QuickActionCard key={a.href} {...a} />
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">

        {/* ── Profile summary (1/3) ── */}
        <section className="rounded-xl border border-border bg-card p-6 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Your Profile</h2>
            <Link
              href="/app/onboarding?edit=true"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3" />
              Edit
            </Link>
          </div>
          <dl className="space-y-2.5 text-sm">
            {profile.targetCountry && (
              <ProfileRow label="Target country" value={profile.targetCountry} />
            )}
            {profile.level && (
              <ProfileRow label="Level" value={LEVEL_DISPLAY[profile.level] ?? profile.level} />
            )}
            {profile.intendedMajor && (
              <ProfileRow label="Field" value={profile.intendedMajor} />
            )}
            {profile.budgetRange && (
              <ProfileRow label="Budget" value={profile.budgetRange} />
            )}
            {profile.gpa && (
              <ProfileRow label="GPA" value={String(profile.gpa)} />
            )}
            {!profile.targetCountry && !profile.level && !profile.intendedMajor && (
              <p className="text-muted-foreground text-xs">
                No profile data yet.{" "}
                <Link href="/app/onboarding?edit=true" className="text-primary hover:underline">
                  Complete your profile
                </Link>
              </p>
            )}
          </dl>
        </section>

        {/* ── Recommendations + Saved (2/3) ── */}
        <div className="space-y-8 lg:col-span-2">

          {/* Recommended / top matches */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">
                {topMatches.length > 0 ? "Top Matches" : "Recommended Programs"}
              </h2>
              <Link
                href={topMatches.length > 0 ? "/app/match" : "/app/programs"}
                className="text-xs text-primary hover:underline"
              >
                See all →
              </Link>
            </div>

            {topMatches.length > 0 ? (
              <div className="space-y-2">
                {topMatches.map((r) => (
                  <MatchCard key={r.programId} result={r} />
                ))}
              </div>
            ) : topPrograms.length > 0 ? (
              <div className="space-y-2">
                {topPrograms.map((p) => (
                  <ProgramCard key={p.id} program={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">No recommendations yet.</p>
                <Link
                  href="/app/match"
                  className="mt-3 inline-flex h-8 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Run matching
                </Link>
              </div>
            )}
          </section>

          {/* Saved programs */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">
                Saved Programs{saved.length > 0 ? ` (${saved.length})` : ""}
              </h2>
              {saved.length > 0 && (
                <Link href="/app/saved" className="text-xs text-primary hover:underline">
                  View all →
                </Link>
              )}
            </div>

            {saved.length > 0 ? (
              <div className="space-y-2">
                {saved.slice(0, 3).map((item) => (
                  <SavedCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t saved any programmes yet.
                </p>
                <Link
                  href="/app/programs"
                  className="mt-3 inline-flex h-8 items-center rounded-md border border-border px-4 text-xs font-medium hover:bg-accent"
                >
                  Browse programs
                </Link>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  );
}

