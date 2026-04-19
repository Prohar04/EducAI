"use client";

import { useState, useTransition, useEffect } from "react";
import {
	Activity,
	AlertCircle,
	CheckCircle,
	Clock,
	Database,
	Loader2,
	RefreshCw,
	Wrench,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
	getDataSyncStatusAction,
	triggerDataSyncAction,
	type SyncStatusResponse,
	type SyncRunResult,
} from "@/lib/auth/action";

function formatDate(iso: string | null | undefined) {
	if (!iso) return "Never";
	return new Date(iso).toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDuration(ms: number) {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}

const STATUS_STYLES = {
	success: { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: CheckCircle, color: "text-emerald-500" },
	partial: { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400", icon: AlertCircle, color: "text-amber-500" },
	failed: { badge: "bg-red-500/10 text-red-700 dark:text-red-400", icon: XCircle, color: "text-red-500" },
};

function RunCard({ run }: { run: SyncRunResult }) {
	const style = STATUS_STYLES[run.status];
	const Icon = style.icon;
	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex items-start gap-3">
				<Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.color}`} />
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1 flex-wrap">
						<span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${style.badge}`}>
							{run.status}
						</span>
						<span className="text-xs text-muted-foreground">{run.target} sync</span>
						<span className="text-xs text-muted-foreground">· triggered by {run.triggeredBy}</span>
						<span className="ml-auto text-xs text-muted-foreground">{formatDate(run.completedAt)}</span>
					</div>
					<div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
						<span>{run.recordsProcessed} processed</span>
						<span>{run.recordsUpdated} updated</span>
						{run.recordsCreated > 0 && <span>{run.recordsCreated} created</span>}
						{run.durationMs > 0 && <span>{formatDuration(run.durationMs)}</span>}
					</div>
					{run.errors.length > 0 && (
						<div className="mt-2 space-y-1">
							{run.errors.map((e, i) => (
								<p key={i} className="text-[11px] text-amber-700 dark:text-amber-400">⚠ {e}</p>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default function DataSyncPage() {
	const [status, setStatus] = useState<SyncStatusResponse | null>(null);
	const [lastRun, setLastRun] = useState<SyncRunResult | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [isLoading, startLoading] = useTransition();
	const [isRunning, startRun] = useTransition();
	const [syncTarget, setSyncTarget] = useState<"scholarships" | "programs" | "all">("all");

	function loadStatus() {
		startLoading(async () => {
			setLoadError(null);
			const res = await getDataSyncStatusAction();
			if (res) setStatus(res);
			else setLoadError("Could not load sync status. Make sure the server is running.");
		});
	}

	function handleRun() {
		startRun(async () => {
			const res = await triggerDataSyncAction(syncTarget);
			if (res) {
				setLastRun(res);
				loadStatus();
			}
		});
	}

	useEffect(() => {
		startLoading(async () => {
			const res = await getDataSyncStatusAction();
			if (res) setStatus(res);
			else setLoadError("Could not load sync status. Make sure the server is running.");
		});
	}, []);

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Wrench className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Data Sync Agent</h1>
						<p className="text-sm text-muted-foreground">
							Monitor and trigger data refresh pipelines for programs and scholarships
						</p>
					</div>
				</div>
			</FadeIn>

			<div className="space-y-6">
				{/* Data Freshness Overview */}
				{isLoading ? (
					<div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : loadError ? (
					<div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
						<AlertCircle className="h-5 w-5 text-destructive shrink-0" />
						<p className="text-sm text-destructive">{loadError}</p>
						<Button variant="outline" size="sm" onClick={loadStatus} className="ml-auto gap-1.5">
							<RefreshCw className="h-3.5 w-3.5" />
							Retry
						</Button>
					</div>
				) : status ? (
					<FadeIn>
						{/* Stats Grid */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
							{[
								{
									label: "Scholarships",
									value: status.dataFreshness.scholarships.count.toLocaleString(),
									sub: status.dataFreshness.scholarships.lastUpdated
										? `Updated ${formatDate(status.dataFreshness.scholarships.lastUpdated)}`
										: "Not synced yet",
									icon: Database,
								},
								{
									label: "Programs",
									value: status.dataFreshness.programs.count.toLocaleString(),
									sub: status.dataFreshness.programs.lastUpdated
										? `Updated ${formatDate(status.dataFreshness.programs.lastUpdated)}`
										: "Not synced yet",
									icon: Database,
								},
								{
									label: "Total Runs",
									value: status.totalRuns.toString(),
									sub: "Sync executions logged",
									icon: Activity,
								},
								{
									label: "Next Scheduled",
									value: "Daily 06:00 UTC",
									sub: formatDate(status.nextScheduledRun),
									icon: Clock,
								},
							].map(({ label, value, sub, icon: Icon }) => (
								<div key={label} className="rounded-xl border border-border bg-card p-4">
									<div className="flex items-center gap-2 mb-2">
										<Icon className="h-4 w-4 text-muted-foreground" />
										<p className="text-xs font-medium text-muted-foreground">{label}</p>
									</div>
									<p className="text-xl font-bold">{value}</p>
									<p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
								</div>
							))}
						</div>

						{/* Last Run */}
						{status.lastRun && (
							<div className="mb-4">
								<h3 className="mb-2 text-sm font-semibold">Last Sync Run</h3>
								<RunCard run={status.lastRun} />
							</div>
						)}
					</FadeIn>
				) : null}

				{/* Latest manual run result */}
				{lastRun && (
					<FadeIn>
						<div>
							<h3 className="mb-2 text-sm font-semibold">Latest Manual Run</h3>
							<RunCard run={lastRun} />
						</div>
					</FadeIn>
				)}

				{/* Trigger Panel */}
				<div className="rounded-xl border border-border bg-card p-5">
					<h3 className="mb-1 text-sm font-semibold">Manual Sync Trigger</h3>
					<p className="mb-4 text-xs text-muted-foreground">
						Manually trigger a data refresh. The sync runs automatically daily at 06:00 UTC via the scheduled workflow.
					</p>
					<div className="flex flex-col sm:flex-row gap-3">
						<div className="flex gap-2">
							{(["scholarships", "programs", "all"] as const).map((t) => (
								<button
									key={t}
									type="button"
									onClick={() => setSyncTarget(t)}
									className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
										syncTarget === t
											? "border-primary bg-primary/10 text-primary"
											: "border-border hover:border-primary/30 text-muted-foreground"
									}`}
								>
									{t}
								</button>
							))}
						</div>
						<Button
							onClick={handleRun}
							disabled={isRunning}
							className="gap-2 sm:ml-auto"
							size="sm"
						>
							{isRunning ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<RefreshCw className="h-3.5 w-3.5" />
							)}
							{isRunning ? "Running sync…" : `Run ${syncTarget} sync`}
						</Button>
					</div>
				</div>

				{/* Pipeline Documentation */}
				<div className="rounded-xl border border-border bg-card p-5">
					<h3 className="mb-3 text-sm font-semibold">Pipeline Architecture</h3>
					<div className="space-y-2 text-xs text-muted-foreground">
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0">Scholarships</span>
							<p>Database freshness check + expired deadline detection. Seed script: <code className="rounded bg-muted px-1">npm run seed:scholarships</code></p>
						</div>
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0">Programs</span>
							<p>Calls <code className="rounded bg-muted px-1">ai-server /api/v1/module1/sync</code> which triggers Firecrawl web scraping for relevant programs based on user profiles.</p>
						</div>
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0">Schedule</span>
							<p>GitHub Actions workflow runs daily at 06:00 UTC via <code className="rounded bg-muted px-1">.github/workflows/data-sync.yml</code></p>
						</div>
						<div className="flex items-start gap-2">
							<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0">Idempotent</span>
							<p>All sync runs are tracked in <code className="rounded bg-muted px-1">DataSourceMeta</code> table. Re-running is safe and will not create duplicates.</p>
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
					<p className="text-xs text-muted-foreground">
						Sync runs are logged to <code className="rounded bg-muted px-1">DataSourceMeta</code>. Program sync requires the ai-server to be running and <code className="rounded bg-muted px-1">MASTER_APIKEY</code> to be set. If the ai-server is offline, the sync will log a warning and skip gracefully.
					</p>
				</div>
			</div>
		</div>
	);
}
