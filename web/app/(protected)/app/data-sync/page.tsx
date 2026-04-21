"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
	Clock,
	Database,
	Loader2,
	Play,
	RefreshCw,
	RotateCcw,
	Timer,
	TrendingUp,
	Wrench,
	XCircle,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
	getDataSyncStatusAction,
	triggerDataSyncAction,
	type SyncStatusResponse,
	type SyncRunResult,
	type SyncSourceHealth,
	type SyncStatus,
	type SyncTarget,
} from "@/lib/auth/action";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined) {
	if (!iso) return "Never";
	return new Date(iso).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDuration(ms: number) {
	if (!ms || ms <= 0) return "—";
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`;
}

function timeAgo(iso: string | null | undefined) {
	if (!iso) return null;
	const diff = Date.now() - new Date(iso).getTime();
	if (diff < 60_000) return "just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
	return `${Math.floor(diff / 86_400_000)}d ago`;
}

// ─── Status Styling ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
	SyncStatus | "idle",
	{ label: string; badge: string; icon: React.ElementType; dot: string }
> = {
	idle: {
		label: "Idle",
		badge: "bg-muted text-muted-foreground",
		icon: Circle,
		dot: "bg-muted-foreground",
	},
	running: {
		label: "Running",
		badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
		icon: Loader2,
		dot: "bg-blue-500",
	},
	success: {
		label: "Success",
		badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
		icon: CheckCircle2,
		dot: "bg-emerald-500",
	},
	partial_success: {
		label: "Partial",
		badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
		icon: AlertTriangle,
		dot: "bg-amber-500",
	},
	failed: {
		label: "Failed",
		badge: "bg-red-500/10 text-red-700 dark:text-red-400",
		icon: XCircle,
		dot: "bg-red-500",
	},
	cancelled: {
		label: "Cancelled",
		badge: "bg-muted text-muted-foreground",
		icon: Circle,
		dot: "bg-muted-foreground",
	},
};

function StatusBadge({ status }: { status: SyncStatus | "idle" }) {
	const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
	const Icon = cfg.icon;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
				cfg.badge,
			)}
		>
			<Icon className={cn("h-2.5 w-2.5", status === "running" && "animate-spin")} />
			{cfg.label}
		</span>
	);
}

// ─── Overview Card ────────────────────────────────────────────────────────────

function OverviewCard({
	label,
	value,
	sub,
	icon: Icon,
	highlight,
}: {
	label: string;
	value: string | number;
	sub: string;
	icon: React.ElementType;
	highlight?: "green" | "amber" | "red" | "blue";
}) {
	const colors = {
		green: "text-emerald-500",
		amber: "text-amber-500",
		red: "text-red-500",
		blue: "text-blue-500",
	};
	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex items-center gap-2 mb-2">
				<Icon
					className={cn(
						"h-4 w-4",
						highlight ? colors[highlight] : "text-muted-foreground",
					)}
				/>
				<p className="text-xs font-medium text-muted-foreground">{label}</p>
			</div>
			<p className={cn("text-2xl font-bold", highlight && colors[highlight])}>{value}</p>
			<p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
		</div>
	);
}

// ─── Source Health Card ───────────────────────────────────────────────────────

function SourceCard({
	source,
	onSync,
	isRunning,
}: {
	source: SyncSourceHealth;
	onSync: (key: SyncTarget) => void;
	isRunning: boolean;
}) {
	const cfg = STATUS_CONFIG[source.lastStatus] ?? STATUS_CONFIG.idle;

	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex items-start justify-between gap-3 mb-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5">
						<div className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
						<span className="text-sm font-semibold">{source.label}</span>
						<StatusBadge status={source.lastStatus} />
						{source.isStale && source.lastStatus !== "running" && (
							<span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-medium">
								stale
							</span>
						)}
					</div>
					<p className="text-[11px] text-muted-foreground ml-4">{source.description}</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					disabled={isRunning || source.lastStatus === "running"}
					onClick={() => onSync(source.sourceKey as SyncTarget)}
					className="shrink-0 gap-1.5 text-xs h-7"
				>
					{source.lastStatus === "running" ? (
						<Loader2 className="h-3 w-3 animate-spin" />
					) : (
						<Play className="h-3 w-3" />
					)}
					Sync
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-muted-foreground">
				<span>
					<span className="font-medium text-foreground">{source.recordCount.toLocaleString()}</span>{" "}
					records
				</span>
				<span>
					Last run:{" "}
					<span className="font-medium text-foreground">
						{timeAgo(source.lastRunAt) ?? "Never"}
					</span>
				</span>
				<span>
					Last success:{" "}
					<span className="font-medium text-foreground">
						{timeAgo(source.lastSuccessAt) ?? "Never"}
					</span>
				</span>
				{source.isStale && source.staleSinceHours !== null && (
					<span className="text-amber-600 dark:text-amber-400">
						Stale {source.staleSinceHours}h
					</span>
				)}
			</div>
		</div>
	);
}

// ─── Run Row ──────────────────────────────────────────────────────────────────

function RunRow({ run }: { run: SyncRunResult }) {
	const [expanded, setExpanded] = useState(false);
	const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.idle;

	return (
		<div className="border-b border-border last:border-0">
			<button
				type="button"
				onClick={() => setExpanded(e => !e)}
				className="w-full flex items-center gap-3 py-2.5 px-1 hover:bg-muted/30 rounded transition-colors text-left"
			>
				<div className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
				<span className="text-xs font-medium w-20 shrink-0">{run.target}</span>
				<StatusBadge status={run.status} />
				<span className="text-xs text-muted-foreground ml-1 shrink-0">
					{run.triggerType}
				</span>
				<span className="ml-auto text-xs text-muted-foreground shrink-0">
					{formatDate(run.startedAt)}
				</span>
				<span className="text-xs text-muted-foreground w-16 text-right shrink-0">
					{formatDuration(run.durationMs)}
				</span>
				{expanded ? (
					<ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
				) : (
					<ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
				)}
			</button>

			{expanded && (
				<div className="pb-3 px-1 space-y-2">
					{/* Stats row */}
					<div className="flex gap-4 text-xs text-muted-foreground flex-wrap ml-5">
						<span>
							<span className="font-medium text-foreground">{run.recordsProcessed}</span> processed
						</span>
						{run.recordsAdded > 0 && (
							<span>
								<span className="font-medium text-emerald-600">{run.recordsAdded}</span> added
							</span>
						)}
						{run.recordsUpdated > 0 && (
							<span>
								<span className="font-medium text-blue-600">{run.recordsUpdated}</span> updated
							</span>
						)}
						{run.recordsSkipped > 0 && (
							<span>
								<span className="font-medium text-muted-foreground">{run.recordsSkipped}</span> skipped
							</span>
						)}
					</div>

					{/* Per-source details */}
					{run.sources.length > 0 && (
						<div className="ml-5 space-y-2">
							{run.sources.map(src => (
								<div key={src.sourceKey} className="rounded-lg bg-muted/40 p-2.5 text-xs">
									<div className="flex items-center gap-2 mb-1">
										<StatusBadge status={src.status} />
										<span className="font-medium">{src.label}</span>
										<span className="text-muted-foreground">{formatDuration(src.durationMs)}</span>
									</div>
									{src.notes.length > 0 && (
										<ul className="space-y-0.5">
											{src.notes.map((n, i) => (
												<li key={i} className="text-muted-foreground">
													{n}
												</li>
											))}
										</ul>
									)}
									{src.errors.length > 0 && (
										<ul className="space-y-0.5 mt-1">
											{src.errors.map((e, i) => (
												<li key={i} className="text-red-600 dark:text-red-400">
													⚠ {e}
												</li>
											))}
										</ul>
									)}
								</div>
							))}
						</div>
					)}

					{/* Error summary */}
					{run.errorSummary && !run.sources.some(s => s.errors.length > 0) && (
						<p className="ml-5 text-xs text-amber-700 dark:text-amber-400">⚠ {run.errorSummary}</p>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Active Job Banner ────────────────────────────────────────────────────────

function ActiveJobBanner({ job }: { job: SyncStatusResponse["activeJob"] }) {
	if (!job) return null;
	return (
		<div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
			<Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-blue-700 dark:text-blue-400">
					Sync running: <span className="font-semibold">{job.sourceKey}</span>
				</p>
				<p className="text-xs text-muted-foreground">
					Started {timeAgo(job.startedAt)} · Job ID: {job.jobId.slice(0, 8)}…
				</p>
			</div>
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DataSyncPage() {
	const [status, setStatus] = useState<SyncStatusResponse | null>(null);
	const [lastRunResult, setLastRunResult] = useState<SyncRunResult | null>(null);
	const [conflictMsg, setConflictMsg] = useState<string | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isLoading, startLoading] = useTransition();
	const [isRunning, startRun] = useTransition();
	const [syncTarget, setSyncTarget] = useState<SyncTarget>("all");

	const loadStatus = useCallback(() => {
		startLoading(async () => {
			setLoadError(null);
			const res = await getDataSyncStatusAction();
			if (res) setStatus(res);
			else setLoadError("Could not load sync status — make sure the server is running.");
		});
	}, []);

	useEffect(() => {
		loadStatus();
	}, [loadStatus]);

	// Auto-refresh while a job is running
	useEffect(() => {
		if (!status?.activeJob) return;
		const t = setInterval(loadStatus, 4000);
		return () => clearInterval(t);
	}, [status?.activeJob, loadStatus]);

	function handleRun(target: SyncTarget = syncTarget) {
		setConflictMsg(null);
		setLastRunResult(null);
		startRun(async () => {
			const res = await triggerDataSyncAction(target);
			if (!res) return;
			if ("error" in res) {
				setConflictMsg(res.error as string);
			} else {
				setLastRunResult(res as SyncRunResult);
				loadStatus();
			}
		});
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Wrench className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Data Sync</h1>
						<p className="text-sm text-muted-foreground">
							Monitor and control data refresh pipelines across all sources
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={loadStatus}
						disabled={isLoading}
						className="ml-auto gap-1.5"
					>
						<RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
						Refresh
					</Button>
				</div>
			</FadeIn>

			<div className="space-y-6">
				{/* Loading / Error states */}
				{isLoading && !status && (
					<div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-12">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				)}

				{loadError && (
					<div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
						<AlertCircle className="h-5 w-5 text-destructive shrink-0" />
						<p className="text-sm text-destructive flex-1">{loadError}</p>
						<Button variant="outline" size="sm" onClick={loadStatus} className="gap-1.5">
							<RotateCcw className="h-3.5 w-3.5" />
							Retry
						</Button>
					</div>
				)}

				{/* Active job banner */}
				{status?.activeJob && <ActiveJobBanner job={status.activeJob} />}

				{/* Conflict / already running */}
				{conflictMsg && (
					<div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
						<AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
						<p className="text-sm text-amber-700 dark:text-amber-400 flex-1">{conflictMsg}</p>
					</div>
				)}

				{status && (
					<FadeIn>
						{/* Overview cards */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
							<OverviewCard
								label="Total Sources"
								value={status.summary.totalSources}
								sub="data pipelines"
								icon={Database}
							/>
							<OverviewCard
								label="Healthy"
								value={status.summary.healthySources}
								sub="up-to-date sources"
								icon={CheckCircle2}
								highlight={
									status.summary.healthySources === status.summary.totalSources
										? "green"
										: undefined
								}
							/>
							<OverviewCard
								label="Stale"
								value={status.summary.staleSources}
								sub="need refresh"
								icon={Clock}
								highlight={status.summary.staleSources > 0 ? "amber" : undefined}
							/>
							<OverviewCard
								label="Failed"
								value={status.summary.failedLastRun}
								sub="last run failed"
								icon={XCircle}
								highlight={status.summary.failedLastRun > 0 ? "red" : undefined}
							/>
							<OverviewCard
								label="Success Rate"
								value={`${status.successRate}%`}
								sub={`over last ${Math.min(status.totalRuns, 20)} runs`}
								icon={TrendingUp}
								highlight={
									status.successRate >= 80
										? "green"
										: status.successRate >= 50
											? "amber"
											: "red"
								}
							/>
						</div>

						{/* Schedule info */}
						<div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5 mb-6 text-xs text-muted-foreground">
							<Zap className="h-3.5 w-3.5 shrink-0" />
							<span>
								<span className="font-medium text-foreground">GitHub Actions</span> runs this automatically every day at{" "}
								<span className="font-medium text-foreground">06:00 UTC</span>
							</span>
							<span className="ml-auto shrink-0">
								Next: <span className="font-medium text-foreground">{formatDate(status.nextScheduledRun)}</span>
							</span>
						</div>

						{/* Per-source cards */}
						<div className="mb-6">
							<h3 className="mb-3 text-sm font-semibold">Source Health</h3>
							<div className="grid gap-3 sm:grid-cols-2">
								{status.sources.map(src => (
									<SourceCard
										key={src.sourceKey}
										source={src}
										onSync={handleRun}
										isRunning={isRunning || !!status.activeJob}
									/>
								))}
								{status.sources.length === 0 && (
									<p className="text-sm text-muted-foreground col-span-2">
										No source health data yet — trigger a sync to see results.
									</p>
								)}
							</div>
						</div>
					</FadeIn>
				)}

				{/* Manual trigger panel */}
				<div className="rounded-xl border border-border bg-card p-5">
					<h3 className="mb-1 text-sm font-semibold">Manual Sync</h3>
					<p className="mb-4 text-xs text-muted-foreground">
						Manually trigger a refresh for one or all sources. Running jobs are deduplicated — a
						second trigger while one is active will be rejected.
					</p>
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="flex gap-2 flex-wrap">
							{(["all", "scholarships", "programs"] as const).map(t => (
								<button
									key={t}
									type="button"
									onClick={() => setSyncTarget(t)}
									className={cn(
										"rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors capitalize",
										syncTarget === t
											? "border-primary bg-primary/10 text-primary"
											: "border-border hover:border-primary/30 text-muted-foreground",
									)}
								>
									{t}
								</button>
							))}
						</div>
						<Button
							onClick={() => handleRun()}
							disabled={isRunning || !!status?.activeJob}
							className="gap-2 sm:ml-auto"
							size="sm"
						>
							{isRunning ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<Play className="h-3.5 w-3.5" />
							)}
							{isRunning ? "Starting…" : `Run ${syncTarget} sync`}
						</Button>
					</div>
				</div>

				{/* Latest triggered run result */}
				{lastRunResult && (
					<FadeIn>
						<div className="rounded-xl border border-border bg-card p-4">
							<h3 className="mb-3 text-sm font-semibold">Latest Triggered Run</h3>
							<RunRow run={lastRunResult} />
						</div>
					</FadeIn>
				)}

				{/* Run history */}
				{status && status.recentRuns.length > 0 && (
					<FadeIn>
						<div className="rounded-xl border border-border bg-card p-4">
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-semibold">Run History</h3>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<Activity className="h-3.5 w-3.5" />
									{status.totalRuns} total runs
								</div>
							</div>

							{/* Table header */}
							<div className="hidden sm:flex items-center gap-3 pb-2 border-b border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-1">
								<div className="w-2 shrink-0" />
								<span className="w-20 shrink-0">Source</span>
								<span className="w-20 shrink-0">Status</span>
								<span className="w-16 shrink-0">Trigger</span>
								<span className="ml-auto shrink-0">Started</span>
								<span className="w-16 text-right shrink-0">Duration</span>
								<div className="w-3.5 shrink-0" />
							</div>

							<div>
								{status.recentRuns.map(run => (
									<RunRow key={run.jobId} run={run} />
								))}
							</div>
						</div>
					</FadeIn>
				)}

				{/* Empty history state */}
				{status && status.recentRuns.length === 0 && (
					<div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
						<Timer className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
						<p className="text-sm font-medium mb-1">No sync runs yet</p>
						<p className="text-xs text-muted-foreground">
							Trigger a manual sync above, or wait for the daily scheduled run at 06:00 UTC.
						</p>
					</div>
				)}

				{/* Architecture docs */}
				<div className="rounded-xl border border-border bg-muted/20 p-5">
					<h3 className="mb-3 text-sm font-semibold text-muted-foreground">Pipeline Architecture</h3>
					<div className="space-y-2 text-xs text-muted-foreground">
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0 mt-0.5">
								Scholarships
							</span>
							<p>
								Checks database freshness: counts active records, detects expired deadlines, flags
								staleness. Populate via{" "}
								<code className="rounded bg-muted px-1">npm run seed:scholarships</code>.
							</p>
						</div>
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0 mt-0.5">
								Programs
							</span>
							<p>
								Triggers{" "}
								<code className="rounded bg-muted px-1">ai-server /api/v1/module1/sync</code>{" "}
								with aggregated user preferences → Firecrawl scraping → structured data → ingested
								via <code className="rounded bg-muted px-1">/internal/module1/ingest</code>.
								Requires <code className="rounded bg-muted px-1">MASTER_APIKEY</code> and running
								ai-server.
							</p>
						</div>
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0 mt-0.5">
								Jobs
							</span>
							<p>
								Every sync run is persisted in the{" "}
								<code className="rounded bg-muted px-1">sync_jobs</code> table with full
								stats, duration, and per-source breakdown. Concurrent runs are deduplicated
								(10-minute window).
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
