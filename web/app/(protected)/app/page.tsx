import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getUserProfile, getMatchLatest, getSavedPrograms } from "@/lib/auth/action";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Bookmark,
  Pencil,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { SavedProgramItem, MatchLatestResponse } from "@/types/auth.type";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { AcademiaIllustration } from "@/components/illustrations";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right truncate max-w-[180px]">{value}</dd>
    </div>
  );
}

function SavedCard({ item }: { item: SavedProgramItem }) {
  const program = item.program;
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

function MatchStatusBadge({ status }: { status: string }) {
  if (status === "done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
        <CheckCircle2 className="size-3" />
        Complete
      </span>
    );
  }
  if (status === "running" || status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
        <Loader2 className="size-3 animate-spin" />
        Running
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        <AlertCircle className="size-3" />
        Failed
      </span>
    );
  }
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AppDashboard() {
  const [session, profile, latestMatch, savedResult] = await Promise.all([
    getSession(),
    getUserProfile(),
    getMatchLatest().catch(() => null),
    getSavedPrograms().catch(() => [] as SavedProgramItem[]),
  ]);

  if (!session) redirect("/auth/signin");

  // If no profile yet, show a clean "get started" prompt instead of crashing
  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-4">
          <GraduationCap className="mx-auto size-10 text-muted-foreground" />
          <p className="font-medium">Your profile isn&apos;t set up yet.</p>
          <p className="text-sm text-muted-foreground">Complete your profile to unlock AI-powered matching and personalised recommendations.</p>
          <Link
            href="/app/profile"
            className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Set up profile →
          </Link>
        </div>
      </div>
    );
  }

  const saved = Array.isArray(savedResult) ? savedResult : [];
  const match = latestMatch as MatchLatestResponse | null;

  const LEVEL_DISPLAY: Record<string, string> = {
    BSC: "Bachelor's", MSC: "Master's", PHD: "PhD", MBA: "MBA", DIPLOMA: "Diploma",
    BSc: "Bachelor's", MSc: "Master's", PhD: "PhD",
  };

  const targetCountriesDisplay = (() => {
    try {
      const raw = profile.targetCountries;
      if (Array.isArray(raw)) return (raw as string[]).join(", ");
      if (typeof raw === "string") return JSON.parse(raw).join(", ");
    } catch {}
    return null;
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">

      {/* ── Header ── */}
      <FadeIn>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Your personalised overview.</p>
          </div>
          <AcademiaIllustration className="hidden sm:block h-20 w-auto text-primary opacity-60 shrink-0" />
        </div>
      </FadeIn>

      <StaggerChildren stagger={0.12} className="grid gap-8 lg:grid-cols-3">

        {/* ── Profile summary ── */}
        <StaggerItem className="rounded-xl border border-border bg-card p-6 lg:col-span-1 space-y-4 hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow]">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Profile</h2>
            <Link
              href="/app/profile"
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Pencil className="size-3" />
              Edit
            </Link>
          </div>

          <dl className="space-y-2.5 text-sm">
            {session.user.name && (
              <ProfileRow label="Name" value={session.user.name} />
            )}
            {profile.currentStage && (
              <ProfileRow label="Stage" value={profile.currentStage} />
            )}
            {(profile.intendedLevel ?? profile.level) && (
              <ProfileRow
                label="Target level"
                value={LEVEL_DISPLAY[profile.intendedLevel ?? profile.level ?? ""] ?? (profile.intendedLevel ?? profile.level ?? "")}
              />
            )}
            {(profile.intendedMajor ?? profile.majorOrTrack) && (
              <ProfileRow label="Major" value={profile.intendedMajor ?? profile.majorOrTrack ?? ""} />
            )}
            {targetCountriesDisplay && (
              <ProfileRow label="Countries" value={targetCountriesDisplay} />
            )}
            {profile.targetIntake && (
              <ProfileRow label="Intake" value={profile.targetIntake} />
            )}
            {profile.gpa != null && (
              <ProfileRow label="GPA" value={`${profile.gpa}${profile.gpaScale ? ` / ${profile.gpaScale}` : ""}`} />
            )}
            {profile.englishTestType && profile.englishScore != null && (
              <ProfileRow label={profile.englishTestType} value={String(profile.englishScore)} />
            )}
            {profile.budgetMax != null && (
              <ProfileRow
                label="Budget/yr"
                value={`${profile.budgetCurrency ?? "USD"} ${profile.budgetMax.toLocaleString()}`}
              />
            )}
          </dl>
        </StaggerItem>

        {/* ── Right column ── */}
        <StaggerItem className="space-y-8 lg:col-span-2">

          {/* Match status widget */}
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Match
              </h2>
              <Link href="/app/match" className="text-xs text-primary hover:underline">
                View results →
              </Link>
            </div>

            {match?.run ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Last run: {new Date(match.run.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <MatchStatusBadge status={match.run.status} />
                </div>
                {match.run.status === "done" && match.run.results && (
                  <p className="text-sm text-muted-foreground">
                    {match.run.results.length} programme{match.run.results.length !== 1 ? "s" : ""} matched from live scrape.{" "}
                    <Link href="/app/match" className="text-primary hover:underline">See them →</Link>
                  </p>
                )}
                {match.run.status === "error" && (
                  <p className="text-sm text-destructive">Match run failed. <Link href="/app/match" className="underline">Retry →</Link></p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-5 text-center">
                <GraduationCap className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-3">No match run yet. Let AI find the best programmes for your profile.</p>
                <Link
                  href="/app/match"
                  className="inline-flex h-8 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Run AI Match
                </Link>
              </div>
            )}
          </section>

          {/* Saved programs */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <Bookmark className="size-4 text-primary" />
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
                {saved.slice(0, 4).map((item) => (
                  <SavedCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No saved programmes yet.
                </p>
                <Link
                  href="/app/programs"
                  className="mt-3 inline-flex h-8 items-center rounded-md border border-border px-4 text-xs font-medium hover:bg-accent"
                >
                  <BookOpen className="mr-1.5 size-3.5" />
                  Browse programs
                </Link>
              </div>
            )}
          </section>

        </StaggerItem>

      </StaggerChildren>
    </div>
  );
}
