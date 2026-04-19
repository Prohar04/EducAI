"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import { triggerMatchRun, getMatchLatest, getMatchRunStatus, saveProgram } from "@/lib/auth/action";
import type { MatchLatestResponse } from "@/types/auth.type";
import { Button } from "@/components/ui/button";
import { MatchIllustration } from "@/components/illustrations";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";

const LEVEL_LABELS: Record<string, string> = {
  BSC: "Bachelor's",
  MSC: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  DIPLOMA: "Diploma",
};

function fitBand(score: number): { label: string; scoreColor: string; bandClass: string } {
  if (score >= 80) return {
    label: "Strong Match",
    scoreColor: "text-green-500 dark:text-green-400",
    bandClass: "from-green-500/40 via-green-500 to-green-500/30",
  };
  if (score >= 50) return {
    label: "Good Match",
    scoreColor: "text-amber-500 dark:text-amber-400",
    bandClass: "from-amber-500/40 via-amber-500 to-amber-500/30",
  };
  return {
    label: "Stretch",
    scoreColor: "text-muted-foreground",
    bandClass: "from-border via-muted-foreground/40 to-border",
  };
}

// ─ Individual program card ─────────────────────────────────────────────────

function ResultCard({
  result,
  onSave,
  saved,
}: {
  result: {
    id: string;
    score: number;
    reasons: string[];
    programId: string | null;
    rawData: Record<string, unknown> | null;
  };
  onSave: (id: string) => void;
  saved: boolean;
}) {
  const [saving, setSaving] = useState(false);

  // Prefer DB program data; fall back to rawData from scrape
  const raw = result.rawData ?? {};
  const title =
    (raw.program_title as string) ??
    (raw.title as string) ??
    "Unnamed Programme";
  const university =
    (raw.university_name as string) ??
    (raw.universityName as string) ??
    "Unknown University";
  const country = (raw.country as string) ?? "";
  const level =
    (raw.level as string) ?? "";
  const field =
    (raw.field as string) ??
    (raw.program_title as string) ??
    "";
  const tuitionRaw = raw.tuition_usd_per_year as number | null;
  const tuition = tuitionRaw != null ? `$${tuitionRaw.toLocaleString()}/yr` : null;
  const applicationUrl = (raw.application_url as string) ?? null;
  const description = (raw.description as string) ?? null;

  const handleSave = async () => {
    if (!result.programId || saved) return;
    setSaving(true);
    try {
      await saveProgram(result.programId);
      onSave(result.programId);
    } finally {
      setSaving(false);
    }
  };

  const { label, scoreColor, bandClass } = fitBand(result.score);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md h-full">
      {/* Score accent band */}
      <div className={`h-1 w-full bg-gradient-to-r ${bandClass}`} />

      <div className="flex flex-col flex-1 p-5">
        {/* Header: level/country badges + score */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {level && (
              <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {LEVEL_LABELS[level.toUpperCase()] ?? level}
              </span>
            )}
            {country && (
              <span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {country}
              </span>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className={`text-lg font-extrabold leading-none ${scoreColor}`}>
              {result.score}%
            </span>
            <span className={`mt-0.5 text-[10px] font-semibold ${scoreColor} opacity-80`}>
              {label}
            </span>
          </div>
        </div>

        {/* Title + university */}
        <h3 className="font-semibold leading-snug">{title}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{university}</p>
        {(field || tuition) && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {[field, tuition].filter(Boolean).join(" · ")}
          </p>
        )}
        {description && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">{description}</p>
        )}

        {/* Fit reasons */}
        {result.reasons.length > 0 && (
          <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 space-y-1.5">
            {result.reasons.slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {result.programId && (
            <Link
              href={`/app/programs/${result.programId}`}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              View details
            </Link>
          )}
          {applicationUrl && (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
            >
              <ExternalLink className="size-3" />
              Official page
            </a>
          )}
          {result.programId && (
            <button
              onClick={handleSave}
              disabled={saved || saving}
              className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                saved
                  ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
                  : "border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {saving ? (
                <Loader2 className="size-3 animate-spin" />
              ) : saved ? (
                <BookmarkCheck className="size-3" />
              ) : (
                <Bookmark className="size-3" />
              )}
              {saved ? "Saved" : "Save"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MatchPage() {
  const [latestMatch, setLatestMatch] = useState<MatchLatestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const loadLatest = useCallback(async () => {
    try {
      const data = await getMatchLatest();
      setLatestMatch(data);
      if (data?.run?.progress != null) setProgress(data.run.progress);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMatchLatest();
        if (!cancelled) {
          setLatestMatch(data);
          if (data?.run?.progress != null) setProgress(data.run.progress);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Efficient polling while run is pending/running:
  // Use lightweight status endpoint (no full DB join) every 1.5s.
  // Only fetch full results once status transitions to "done".
  useEffect(() => {
    const runId = latestMatch?.run?.id;
    const status = latestMatch?.run?.status;
    if (!runId || (status !== "running" && status !== "pending")) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const s = await getMatchRunStatus(runId);
        if (!s || cancelled) return;
        setProgress(s.progress ?? 0);
        if (s.status === "done" || s.status === "error") {
          clearInterval(interval);
          await loadLatest();
        } else {
          // Keep local run status in sync without full re-fetch
          setLatestMatch((prev) =>
            prev?.run
              ? { ...prev, run: { ...prev.run, status: s.status, progress: s.progress } }
              : prev,
          );
        }
      } catch {
        // silent — keep polling
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [latestMatch?.run?.id, latestMatch?.run?.status, loadLatest]);

  const handleRunMatch = () => {
    setError(null);
    setProgress(0);
    startTransition(async () => {
      const result = await triggerMatchRun();
      if (!result?.success) {
        setError(result?.message ?? "Failed to start match run.");
        return;
      }
      // Seed state with the returned runId so polling starts immediately
      if (result.runId) {
        setLatestMatch((prev) => ({
          run: {
            id: result.runId!,
            userId: "",
            status: "pending",
            progress: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            results: prev?.run?.results ?? [],
          },
        }));
      } else {
        await loadLatest();
      }
    });
  };

  const handleSaved = (programId: string) => {
    setSavedIds((prev) => new Set([...prev, programId]));
  };

  const run = latestMatch?.run;
  const results = run?.results ?? [];
  const isRunning = run?.status === "running" || run?.status === "pending" || isPending;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="size-7 text-primary" />
            AI Match
          </h1>
          <p className="mt-1 text-muted-foreground">
            Programmes scraped and ranked live against your profile.
          </p>
        </div>
        <Button
          onClick={handleRunMatch}
          disabled={isRunning}
          className="shrink-0"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Running…
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 size-4" />
              {run ? "Re-run Match" : "Run Match"}
            </>
          )}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Run status banner */}
      {run && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
            run.status === "done"
              ? "bg-green-500/5 border border-green-500/20 text-green-700 dark:text-green-400"
              : run.status === "error"
                ? "bg-destructive/5 border border-destructive/20 text-destructive"
                : "bg-blue-500/5 border border-blue-500/20 text-blue-700 dark:text-blue-400"
          }`}
        >
          {run.status === "done" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : run.status === "error" ? (
            <AlertCircle className="size-4 shrink-0" />
          ) : (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          )}
          <span>
            {run.status === "done"
              ? `${results.length} programme${results.length !== 1 ? "s" : ""} found · Last run: ${new Date(run.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}`
              : run.status === "error"
                ? `Match run failed${run.error ? `: ${run.error}` : ""}. Try again.`
                : `Scraping and ranking programmes… this may take a minute. (${progress}%)`}
          </span>
        </div>
      )}

      {/* Progress bar (visible while running) */}
      {(run?.status === "running" || run?.status === "pending") && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 w-12 rounded-full bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="mt-2 flex gap-2">
                <div className="h-3 w-20 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No run yet */}
      {!loading && !run && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center flex flex-col items-center">
          <MatchIllustration className="mb-4 h-32 w-auto text-primary opacity-75" />
          <p className="text-muted-foreground">
            No match results yet. Click <strong>Run Match</strong> to scrape live programmes tailored to your profile.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            Go to{" "}
            <Link href="/app/profile" className="text-primary hover:underline">
              your profile
            </Link>{" "}
            first to make sure all your preferences are set.
          </p>
        </div>
      )}

      {/* Results grid */}
      {!loading && run?.status === "done" && results.length > 0 && (
        <StaggerChildren stagger={0.07} className="grid gap-4 sm:grid-cols-2">
          {results.map((r) => (
            <StaggerItem key={r.id}>
              <ResultCard
                result={{
                  id: r.id,
                  score: r.score,
                  reasons: Array.isArray(r.reasons) ? (r.reasons as string[]) : [],
                  programId: r.programId ?? null,
                  rawData: r.rawData as Record<string, unknown> | null,
                }}
                onSave={handleSaved}
                saved={!!r.programId && savedIds.has(r.programId)}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      )}

      {/* Done but empty */}
      {!loading && run?.status === "done" && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center flex flex-col items-center gap-4">
          <MatchIllustration className="h-24 w-auto text-primary opacity-60" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">No programmes found for your profile</p>
            <p className="text-sm text-muted-foreground">
              The scraper searched but couldn&apos;t find strong matches. Try these fixes:
            </p>
          </div>
          <ul className="text-left text-sm text-muted-foreground space-y-2 max-w-xs">
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>
                <Link href="/app/profile" className="text-primary hover:underline font-medium">Update your profile</Link>
                {" "}— check major, level, and target countries are set.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>Increase your budget — some fields have higher average tuition.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>Try a broader major name (e.g. &ldquo;Computer Science&rdquo; instead of a sub-specialty).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>Re-run the match — search results vary each run.</span>
            </li>
          </ul>
          <Button variant="outline" onClick={handleRunMatch} disabled={isRunning} className="mt-2">
            <RefreshCw className="mr-2 size-4" />
            Re-run Match
          </Button>
        </div>
      )}
    </div>
  );
}

