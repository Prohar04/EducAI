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

const LEVEL_LABELS: Record<string, string> = {
  BSC: "Bachelor's",
  MSC: "Master's",
  PHD: "PhD",
  MBA: "MBA",
  DIPLOMA: "Diploma",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500/10 text-green-600 dark:text-green-400"
      : score >= 50
        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
        : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${color}`}>
      {score}%
    </span>
  );
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

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {level && (
            <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {LEVEL_LABELS[level.toUpperCase()] ?? level}
            </span>
          )}
          {country && (
            <span className="inline-block rounded-full bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {country}
            </span>
          )}
        </div>
        <ScoreBadge score={result.score} />
      </div>

      <h3 className="font-semibold leading-snug">{title}</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">{university}</p>
      {(field || tuition) && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {[field, tuition].filter(Boolean).join(" · ")}
        </p>
      )}
      {description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}

      {result.reasons.length > 0 && (
        <ul className="mt-3 space-y-1">
          {result.reasons.map((r, i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center gap-3">
        {applicationUrl && (
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ExternalLink className="size-3" />
            Open program
          </a>
        )}
        {result.programId && (
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
              saved
                ? "text-green-600 dark:text-green-400 cursor-default"
                : "text-muted-foreground hover:text-foreground"
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
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm">Loading results…</p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((r) => (
            <ResultCard
              key={r.id}
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
          ))}
        </div>
      )}

      {/* Done but empty */}
      {!loading && run?.status === "done" && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center flex flex-col items-center">
          <MatchIllustration className="mb-4 h-28 w-auto text-primary opacity-60" />
          <p className="text-muted-foreground">
            The scrape completed but found no matching programmes. Try updating your profile or re-running.
          </p>
        </div>
      )}
    </div>
  );
}

