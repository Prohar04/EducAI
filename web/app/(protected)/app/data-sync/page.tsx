"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  Sparkles,
  GraduationCap,
  BookOpen,
  ArrowUpCircle,
  CalendarClock,
  ChevronDown,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  getDataSyncStatusAction,
  getDataSyncHistoryAction,
  triggerDataSyncAction,
  type SyncStatusResponse,
  type SyncRunResult,
  type SyncTarget,
} from "@/lib/auth/action";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Freshness Status ─────────────────────────────────────────────────────────

type FreshnessStatus = "fresh" | "stale" | "updating" | "issue" | "unknown";

function getFreshnessStatus(
  source: SyncStatusResponse["sources"][0],
  isActive: boolean,
): FreshnessStatus {
  if (isActive) return "updating";
  if (source.lastStatus === "failed") return "issue";
  if (source.isStale) return "stale";
  if (source.lastStatus === "success" || source.lastStatus === "partial_success") return "fresh";
  return "unknown";
}

const FRESHNESS_CONFIG: Record<
  FreshnessStatus,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }>; dot: string; cardBorder: string; iconBg: string; iconColor: string }
> = {
  fresh: {
    label: "Fresh",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: CheckCircle2,
    dot: "bg-emerald-500",
    cardBorder: "border-emerald-500/15",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  stale: {
    label: "Needs refresh",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    icon: Clock,
    dot: "bg-amber-500",
    cardBorder: "border-amber-500/20",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  updating: {
    label: "Refreshing…",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: Loader2,
    dot: "bg-blue-500",
    cardBorder: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  issue: {
    label: "Issue detected",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: AlertCircle,
    dot: "bg-red-500",
    cardBorder: "border-red-500/20",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
  },
  unknown: {
    label: "Not yet refreshed",
    badge: "bg-muted text-muted-foreground",
    icon: Clock,
    dot: "bg-muted-foreground",
    cardBorder: "border-border",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
};

function FreshnessBadge({ status }: { status: FreshnessStatus }) {
  const cfg = FRESHNESS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0",
        cfg.badge,
      )}
    >
      <Icon className={cn("h-3 w-3", status === "updating" && "animate-spin")} />
      {cfg.label}
    </span>
  );
}

// ─── Source helpers ───────────────────────────────────────────────────────────

function renderSourceIcon(key: string, className: string): React.ReactNode {
  if (key === "scholarships") return <BookOpen className={className} />;
  if (key === "programs") return <GraduationCap className={className} />;
  return <Sparkles className={className} />;
}

function sourceNiceLabel(key: string): string {
  if (key === "scholarships") return "Scholarships";
  if (key === "programs") return "University Programs";
  if (key === "all") return "All data";
  return key;
}

function sourceItemLabel(key: string): string {
  if (key === "scholarships") return "scholarships";
  return "programs";
}

// ─── Freshness Card ───────────────────────────────────────────────────────────

function FreshnessCard({
  source,
  isActiveSource,
  onRefresh,
  isRefreshing,
}: {
  source: SyncStatusResponse["sources"][0];
  isActiveSource: boolean;
  onRefresh: (key: SyncTarget) => void;
  isRefreshing: boolean;
}) {
  const status = getFreshnessStatus(source, isActiveSource);
  const cfg = FRESHNESS_CONFIG[status];

  return (
    <div className={cn("rounded-2xl border bg-card p-5 flex flex-col gap-4", cfg.cardBorder)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", cfg.iconBg)}>
            {renderSourceIcon(source.sourceKey, cn("h-5 w-5", cfg.iconColor))}
          </div>
          <div>
            <p className="text-sm font-semibold">{sourceNiceLabel(source.sourceKey)}</p>
            <p className="text-xs text-muted-foreground">
              {source.recordCount.toLocaleString()} {sourceItemLabel(source.sourceKey)} available
            </p>
          </div>
        </div>
        <FreshnessBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-muted/40 p-2.5">
          <p className="text-muted-foreground mb-0.5">Last refreshed</p>
          <p className="font-medium text-foreground">
            {source.lastSuccessAt ? timeAgo(source.lastSuccessAt) : "Never"}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-2.5">
          <p className="text-muted-foreground mb-0.5">Refresh time</p>
          <p className="font-medium text-foreground">
            {source.lastSuccessAt ? formatTime(source.lastSuccessAt) : "—"}
          </p>
        </div>
      </div>

      {status === "stale" && (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/5 rounded-lg px-3 py-2 border border-amber-500/10">
          Some information may be outdated. Refresh to get the latest data.
        </p>
      )}
      {status === "issue" && (
        <p className="text-xs text-red-700 dark:text-red-400 bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/10">
          The last refresh encountered an issue. Try refreshing again.
        </p>
      )}
      {status === "fresh" && (
        <p className="text-xs text-muted-foreground">
          {source.sourceKey === "scholarships"
            ? "Scholarship information is current and up to date."
            : "Program information is current and up to date."}
        </p>
      )}

      <Button
        variant={status === "stale" || status === "issue" ? "default" : "outline"}
        size="sm"
        onClick={() => onRefresh(source.sourceKey as SyncTarget)}
        disabled={isRefreshing || isActiveSource}
        className="gap-2 w-full mt-auto"
      >
        {isActiveSource ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        {isActiveSource ? "Refreshing…" : `Refresh ${sourceNiceLabel(source.sourceKey)}`}
      </Button>
    </div>
  );
}

// ─── Update History Row ───────────────────────────────────────────────────────

function outcomeLabel(run: SyncRunResult): string {
  if (run.status === "success") return "Completed";
  if (run.status === "partial_success") return "Completed with notes";
  if (run.status === "failed") return "Had issues";
  if (run.status === "cancelled") return "Cancelled";
  return "In progress";
}

function outcomeBadge(run: SyncRunResult): string {
  if (run.status === "success" || run.status === "partial_success")
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  if (run.status === "failed") return "bg-red-500/10 text-red-700 dark:text-red-400";
  if (run.status === "cancelled") return "bg-muted text-muted-foreground";
  return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
}

function changedSummary(run: SyncRunResult): string | null {
  const parts: string[] = [];
  if (run.recordsAdded > 0) parts.push(`${run.recordsAdded} new`);
  if (run.recordsUpdated > 0) parts.push(`${run.recordsUpdated} updated`);
  if (run.recordsProcessed > 0 && parts.length === 0) parts.push(`${run.recordsProcessed} items verified`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

function UpdateHistoryRow({ run }: { run: SyncRunResult }) {
  const summary = changedSummary(run);
  const iconClassName = cn(
    "h-3.5 w-3.5",
    run.status === "success" || run.status === "partial_success"
      ? "text-emerald-600 dark:text-emerald-400"
      : run.status === "failed"
      ? "text-red-500"
      : "text-muted-foreground",
  );

  return (
    <div className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-muted/20 transition-colors">
      <div
        className={cn(
          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
          run.status === "success" || run.status === "partial_success"
            ? "bg-emerald-500/10"
            : run.status === "failed"
            ? "bg-red-500/10"
            : "bg-muted",
        )}
      >
        {renderSourceIcon(run.target, iconClassName)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {sourceNiceLabel(run.target)} refreshed
        </p>
        {summary && <p className="text-xs text-muted-foreground">{summary}</p>}
      </div>
      <div className="text-right shrink-0">
        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", outcomeBadge(run))}>
          {outcomeLabel(run)}
        </span>
        <p className="text-[11px] text-muted-foreground mt-0.5">{timeAgo(run.startedAt)}</p>
      </div>
    </div>
  );
}

// ─── Refresh Progress Banner ──────────────────────────────────────────────────

function RefreshProgressBanner({
  activeJob,
}: {
  activeJob: SyncStatusResponse["activeJob"];
}) {
  if (!activeJob) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3.5">
      <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Refresh in progress</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {sourceNiceLabel(activeJob.sourceKey)} data is being refreshed. This usually takes a few seconds.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DataUpdatesPage() {
  const [status, setStatus] = useState<SyncStatusResponse | null>(null);
  const [history, setHistory] = useState<SyncRunResult[]>([]);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [isLoading, startLoading] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();
  const [isLoadingHistory, startHistoryLoad] = useTransition();

  const loadStatus = useCallback(() => {
    startLoading(async () => {
      setLoadError(null);
      const res = await getDataSyncStatusAction();
      if (res) setStatus(res);
      else setLoadError("Unable to load data status. Please try again.");
    });
  }, []);

  const loadHistory = useCallback(
    (limit: number) => {
      startHistoryLoad(async () => {
        const res = await getDataSyncHistoryAction(limit);
        if (res) setHistory(res.runs);
      });
    },
    [],
  );

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (showHistory) loadHistory(historyLimit);
  }, [showHistory, historyLimit, loadHistory]);

  // Auto-refresh while a sync is running
  useEffect(() => {
    if (!status?.activeJob) return;
    const t = setInterval(loadStatus, 4000);
    return () => clearInterval(t);
  }, [status?.activeJob, loadStatus]);

  function handleRefresh(target: SyncTarget = "all") {
    setConflictMsg(null);
    startRefresh(async () => {
      const res = await triggerDataSyncAction(target);
      if (!res) return;
      if ("error" in res) {
        const errRes = res as { error: string; status?: string };
        if (errRes.error.toLowerCase().includes("already running") || errRes.status === "409") {
          setConflictMsg("A refresh is already in progress. Please wait for it to finish.");
        } else {
          setConflictMsg("Could not start refresh. Please try again in a moment.");
        }
      } else {
        loadStatus();
        if (showHistory) loadHistory(historyLimit);
      }
    });
  }

  const allFresh =
    status !== null &&
    status.summary.staleSources === 0 &&
    status.summary.failedLastRun === 0;
  const hasIssues = (status?.summary.failedLastRun ?? 0) > 0;
  const hasStale = (status?.summary.staleSources ?? 0) > 0;

  const recentSuccessfulRun = status?.recentRuns.find(
    r => r.status === "success" || r.status === "partial_success",
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <FadeIn className="mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Data Freshness</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your program matches, scholarship eligibility, and AI recommendations are only as good as the underlying data.
              Keep it fresh to get the most accurate guidance.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadStatus}
            disabled={isLoading}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
            Check status
          </Button>
        </div>
      </FadeIn>

      {/* Error state */}
      {loadError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-6">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive flex-1">{loadError}</p>
          <Button variant="outline" size="sm" onClick={loadStatus}>
            Try again
          </Button>
        </div>
      )}

      {/* Already running notice */}
      {conflictMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
          <Clock className="h-5 w-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">{conflictMsg}</p>
        </div>
      )}

      {/* Initial loading */}
      {isLoading && !status && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {status && (
        <FadeIn className="space-y-5">
          {/* Active refresh banner */}
          {status.activeJob && <RefreshProgressBanner activeJob={status.activeJob} />}

          {/* Overall freshness summary */}
          {!status.activeJob && (
            <div
              className={cn(
                "rounded-xl border p-4 flex items-center gap-4",
                allFresh
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : hasIssues
                  ? "border-red-500/20 bg-red-500/5"
                  : hasStale
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-border bg-card",
              )}
            >
              <div
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  allFresh
                    ? "bg-emerald-500/15"
                    : hasIssues
                    ? "bg-red-500/15"
                    : "bg-amber-500/15",
                )}
              >
                {allFresh ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : hasIssues ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    allFresh
                      ? "text-emerald-700 dark:text-emerald-400"
                      : hasIssues
                      ? "text-red-700 dark:text-red-400"
                      : "text-amber-700 dark:text-amber-400",
                  )}
                >
                  {allFresh
                    ? "All data is up to date"
                    : hasIssues
                    ? "Some data needs attention"
                    : "Some data could use a refresh"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {allFresh
                    ? "Scholarship and program information is current."
                    : hasIssues
                    ? "One or more sources had issues during the last refresh. Try refreshing again."
                    : "Some information hasn't been refreshed recently. Refresh to get the latest updates."}
                </p>
              </div>
              {(hasIssues || hasStale) && (
                <Button
                  size="sm"
                  onClick={() => handleRefresh("all")}
                  disabled={isRefreshing || !!status.activeJob}
                  className="gap-2 shrink-0"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                  Refresh all
                </Button>
              )}
            </div>
          )}

          {/* Per-source freshness cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {status.sources.map(src => (
              <FreshnessCard
                key={src.sourceKey}
                source={src}
                isActiveSource={
                  !!status.activeJob &&
                  (status.activeJob.sourceKey === src.sourceKey ||
                    status.activeJob.sourceKey === "all")
                }
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ))}
            {status.sources.length === 0 && (
              <div className="col-span-2 text-sm text-muted-foreground text-center py-8">
                No data sources found. Trigger a refresh to initialize.
              </div>
            )}
          </div>

          {/* Live data provider status */}
          {status.providers && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Live Data Providers</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Live Provider: Serper Search</p>
                      <p className="text-xs text-muted-foreground">
                        Discovers new scholarships via web search
                      </p>
                    </div>
                  </div>
                  {status.providers.scholarshipLive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400 shrink-0">
                      <XCircle className="h-3 w-3" />
                      Not configured
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">AI Extraction: OpenAI / OpenRouter</p>
                      <p className="text-xs text-muted-foreground">
                        Extracts structured data from search results
                      </p>
                    </div>
                  </div>
                  {(typeof window !== "undefined"
                    ? false
                    : false) ||
                  status.providers.scholarshipLive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Programs Crawler: AI Server</p>
                      <p className="text-xs text-muted-foreground">
                        Firecrawl pipeline for program discovery
                      </p>
                    </div>
                  </div>
                  {status.providers.programsCrawler ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      Configured
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-700 dark:text-red-400 shrink-0">
                      <XCircle className="h-3 w-3" />
                      Not configured
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Latest update summary */}
          {recentSuccessfulRun && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpCircle className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">Latest Update</h2>
                <span className="ml-auto text-xs text-muted-foreground">
                  {timeAgo(recentSuccessfulRun.startedAt)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {recentSuccessfulRun.recordsAdded > 0 && (
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {recentSuccessfulRun.recordsAdded} new{" "}
                    {recentSuccessfulRun.target === "scholarships" ? "scholarships" : "items"} added
                  </p>
                )}
                {recentSuccessfulRun.recordsUpdated > 0 && (
                  <p className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                    {recentSuccessfulRun.recordsUpdated}{" "}
                    {recentSuccessfulRun.target === "scholarships" ? "scholarships" : "items"}{" "}
                    verified and updated
                  </p>
                )}
                {/* Per-source notes from this run */}
                {recentSuccessfulRun.sources.flatMap(s => s.notes).map((note, i) => (
                  <p key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                    {note}
                  </p>
                ))}
                {recentSuccessfulRun.recordsAdded === 0 &&
                  recentSuccessfulRun.recordsUpdated === 0 &&
                  recentSuccessfulRun.sources.flatMap(s => s.notes).length === 0 && (
                    <p className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {sourceNiceLabel(recentSuccessfulRun.target)} data was verified and is up to
                      date
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Automatic refresh info */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            <span>
              Data is automatically refreshed twice daily (06:00 and 18:00 UTC).{" "}
              <span className="font-medium text-foreground">
                Next automatic refresh: {formatTime(status.nextScheduledRun)}
              </span>
            </span>
          </div>

          {/* Manual refresh actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold mb-1">Refresh Your Data</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Pull the latest scholarship openings and program details right now so your eligibility scores,
              AI matches, and deadline alerts reflect current information.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleRefresh("all")}
                disabled={isRefreshing || !!status.activeJob}
                className="gap-2"
                size="sm"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Starting…" : "Refresh all data"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRefresh("scholarships")}
                disabled={isRefreshing || !!status.activeJob}
                size="sm"
                className="gap-2"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Scholarships
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRefresh("programs")}
                disabled={isRefreshing || !!status.activeJob}
                size="sm"
                className="gap-2"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                Programs
              </Button>
            </div>
          </div>

          {/* Update history (collapsible) */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHistory(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold hover:bg-muted/20 transition-colors"
            >
              <span>Update History</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  showHistory && "rotate-180",
                )}
              />
            </button>
            {showHistory && (
              <div className="border-t border-border">
                {isLoadingHistory && history.length === 0 && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isLoadingHistory && history.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No refresh history yet. Trigger a refresh to see updates here.
                  </div>
                )}
                <div className="p-2 space-y-0.5">
                  {history.map((run, i) => (
                    <UpdateHistoryRow key={run.jobId ?? i} run={run} />
                  ))}
                </div>
                {history.length > 0 && history.length >= historyLimit && (
                  <div className="px-4 py-3 border-t border-border flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const next = historyLimit + 10;
                        setHistoryLimit(next);
                        loadHistory(next);
                      }}
                      disabled={isLoadingHistory}
                      className="gap-1.5 text-xs"
                    >
                      {isLoadingHistory ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
