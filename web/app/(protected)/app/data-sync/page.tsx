"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	ChevronDown,
	ChevronRight,
	Circle,
	Clock,
	Copy,
	Database,
	Layers,
	Loader2,
	Play,
	RefreshCw,
	RotateCcw,
	ServerCrash,
	Square,
	Terminal,
	TrendingUp,
	Wrench,
	XCircle,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
	getDataSyncStatusAction,
	getDataSyncHistoryAction,
	getJobDetailsAction,
	triggerDataSyncAction,
	retryDataSyncAction,
	cancelJobAction,
	type SyncStatusResponse,
	type SyncRunResult,
	type SyncSourceHealth,
	type SyncStatus,
	type SyncTarget,
	type CrawlerDetails,
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

function timeAgo(iso: string | null | undefined): string {
	if (!iso) return "Never";
	const diff = Date.now() - new Date(iso).getTime();
	if (diff < 60_000) return "just now";
	if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
	if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
	return `${Math.floor(diff / 86_400_000)}d ago`;
}

function shortId(id: string) {
	return id.slice(0, 8);
}

// ─── Status Config ────────────────────────────────────────────────────────────

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
				"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0",
				cfg.badge,
			)}
		>
			<Icon className={cn("h-2.5 w-2.5", status === "running" && "animate-spin")} />
			{cfg.label}
		</span>
	);
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
	const [copied, setCopied] = useState(false);
	function handleCopy() {
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		});
	}
	return (
		<button
			type="button"
			onClick={handleCopy}
			className={cn(
				"inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
				"bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
				className,
			)}
			title="Copy to clipboard"
		>
			<Copy className="h-2.5 w-2.5" />
			{copied ? "Copied" : "Copy"}
		</button>
	);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
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
					className={cn("h-4 w-4", highlight ? colors[highlight] : "text-muted-foreground")}
				/>
				<p className="text-xs font-medium text-muted-foreground">{label}</p>
			</div>
			<p className={cn("text-2xl font-bold", highlight && colors[highlight])}>{value}</p>
			<p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
		</div>
	);
}

// ─── Active Job Banner ────────────────────────────────────────────────────────

function ActiveJobBanner({
	job,
	onCancel,
	isCancelling,
}: {
	job: SyncStatusResponse["activeJob"];
	onCancel: (id: string) => void;
	isCancelling: boolean;
}) {
	if (!job) return null;
	return (
		<div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
			<Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-blue-700 dark:text-blue-400">
					Sync running — <span className="font-semibold">{job.sourceKey}</span>
					<span className="ml-2 text-xs font-normal opacity-70">
						Queue: {job.queueState ?? "running"}
					</span>
				</p>
				<p className="text-xs text-muted-foreground font-mono">
					Job ID: {job.jobId} · Started {timeAgo(job.startedAt)}
				</p>
			</div>
			<CopyButton text={job.jobId} />
			<Button
				variant="outline"
				size="sm"
				onClick={() => onCancel(job.jobId)}
				disabled={isCancelling}
				className="gap-1.5 text-xs h-7 shrink-0"
			>
				{isCancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : <Square className="h-3 w-3" />}
				Cancel
			</Button>
		</div>
	);
}

// ─── Source Health Card ───────────────────────────────────────────────────────

function SourceCard({
	source,
	onSync,
	isRunning,
	onSelectJob,
}: {
	source: SyncSourceHealth;
	onSync: (key: SyncTarget) => void;
	isRunning: boolean;
	onSelectJob?: (id: string) => void;
}) {
	const cfg = STATUS_CONFIG[source.lastStatus] ?? STATUS_CONFIG.idle;

	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex items-start justify-between gap-3 mb-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-0.5 flex-wrap">
						<div className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
						<span className="text-sm font-semibold">{source.label}</span>
						<StatusBadge status={source.lastStatus} />
						{source.isStale && source.lastStatus !== "running" && (
							<span className="rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-medium">
								stale
							</span>
						)}
					</div>
					<p className="text-[11px] text-muted-foreground ml-4 leading-relaxed">{source.description}</p>
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

			<div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] text-muted-foreground">
				<span>
					<span className="font-semibold text-foreground text-sm">
						{source.recordCount.toLocaleString()}
					</span>{" "}
					records
				</span>
				<span>
					Last run:{" "}
					<span className="font-medium text-foreground">{timeAgo(source.lastRunAt)}</span>
				</span>
				<span>
					Last success:{" "}
					<span className="font-medium text-foreground">{timeAgo(source.lastSuccessAt)}</span>
				</span>
				{source.isStale && source.staleSinceHours !== null && (
					<span className="text-amber-600 dark:text-amber-400 font-medium">
						Stale {source.staleSinceHours}h
					</span>
				)}
			</div>

			{source.lastRunId && onSelectJob && (
				<button
					type="button"
					onClick={() => onSelectJob(source.lastRunId!)}
					className="mt-3 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
				>
					Last job: {shortId(source.lastRunId)}… <ChevronRight className="h-3 w-3" />
				</button>
			)}
		</div>
	);
}

// ─── Job Row (in Jobs table) ──────────────────────────────────────────────────

function JobRow({
	run,
	onSelect,
	onRetry,
	onCancel,
	isActing,
}: {
	run: SyncRunResult;
	onSelect: (run: SyncRunResult) => void;
	onRetry: (target: SyncTarget) => void;
	onCancel: (id: string) => void;
	isActing: boolean;
}) {
	const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.idle;

	return (
		<div className="flex items-center gap-3 py-2.5 px-3 hover:bg-muted/20 rounded-lg transition-colors group">
			<div className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />

			{/* Job ID */}
			<div className="w-28 shrink-0 flex items-center gap-1">
				<span
					className="text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
					title={run.jobId}
					onClick={() => onSelect(run)}
				>
					{shortId(run.jobId)}…
				</span>
				<CopyButton text={run.jobId} className="opacity-0 group-hover:opacity-100" />
			</div>

			{/* Source */}
			<span className="text-xs font-medium w-24 shrink-0 capitalize">{run.target}</span>

			{/* Status */}
			<StatusBadge status={run.status} />

			{/* Trigger */}
			<span className="hidden sm:block text-xs text-muted-foreground w-14 shrink-0">{run.triggerType}</span>

			{/* Records */}
			<div className="hidden md:flex items-center gap-1.5 text-[11px] flex-1 min-w-0">
				{run.recordsProcessed > 0 && (
					<span className="text-muted-foreground">
						<span className="font-medium text-foreground">{run.recordsProcessed}</span> processed
					</span>
				)}
				{run.recordsAdded > 0 && (
					<span className="text-emerald-600 dark:text-emerald-400">+{run.recordsAdded}</span>
				)}
				{run.recordsUpdated > 0 && (
					<span className="text-blue-600 dark:text-blue-400">~{run.recordsUpdated}</span>
				)}
			</div>

			{/* Started */}
			<span className="ml-auto text-xs text-muted-foreground shrink-0 hidden sm:block">
				{timeAgo(run.startedAt)}
			</span>

			{/* Duration */}
			<span className="text-xs text-muted-foreground w-16 text-right shrink-0">
				{formatDuration(run.durationMs)}
			</span>

			{/* Actions */}
			<div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onSelect(run)}
					className="h-6 w-6 p-0"
					title="View diagnostics"
				>
					<Terminal className="h-3 w-3" />
				</Button>
				{run.status === "failed" && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onRetry(run.target)}
						disabled={isActing}
						className="h-6 w-6 p-0 text-amber-500"
						title="Retry"
					>
						<RotateCcw className="h-3 w-3" />
					</Button>
				)}
				{run.status === "running" && (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onCancel(run.jobId)}
						disabled={isActing}
						className="h-6 w-6 p-0 text-red-500"
						title="Cancel"
					>
						<Square className="h-3 w-3" />
					</Button>
				)}
			</div>
		</div>
	);
}

// ─── Raw Log Panel ────────────────────────────────────────────────────────────

function LogLine({ line }: { line: string }) {
	const isError = line.includes("[ERROR]");
	const isWarn = line.includes("[WARN]");
	const isInfo = line.includes("[INFO]");
	const isSep = line.startsWith("---");

	return (
		<div
			className={cn(
				"font-mono text-[11px] leading-5 px-3 py-0.5",
				isError && "text-red-400 bg-red-500/5",
				isWarn && "text-amber-400",
				isInfo && "text-muted-foreground",
				isSep && "text-primary/60 font-semibold pt-2",
			)}
		>
			{line}
		</div>
	);
}

function RawLogsPanel({ logs }: { logs: string[] }) {
	const ref = useRef<HTMLDivElement>(null);

	if (logs.length === 0) {
		return (
			<div className="rounded-lg bg-muted/30 border border-border p-6 text-center text-xs text-muted-foreground">
				No logs available for this job. Logs are captured starting from the next run.
			</div>
		);
	}

	return (
		<div
			ref={ref}
			className="rounded-lg border border-border bg-[#0d0d0d] overflow-auto max-h-96 text-left"
		>
			<div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/10">
				<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
					<Terminal className="h-3 w-3" /> Raw Logs · {logs.length} lines
				</span>
				<CopyButton text={logs.join("\n")} />
			</div>
			<div>
				{logs.map((line, i) => (
					<LogLine key={i} line={line} />
				))}
			</div>
		</div>
	);
}

// ─── Crawler Details Panel ────────────────────────────────────────────────────

function CrawlerDetailsPanel({ details }: { details: CrawlerDetails }) {
	return (
		<div className="rounded-lg border border-border bg-card p-4 space-y-3">
			<div className="flex items-center gap-2 mb-1">
				<Activity className="h-3.5 w-3.5 text-muted-foreground" />
				<span className="text-xs font-semibold">Crawler Details</span>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
				{details.taskId && (
					<div>
						<p className="text-muted-foreground mb-0.5">Task ID</p>
						<div className="flex items-center gap-2">
							<code className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
								{details.taskId}
							</code>
							<CopyButton text={details.taskId} />
						</div>
					</div>
				)}
				{details.pipelineStatus && (
					<div>
						<p className="text-muted-foreground mb-0.5">Pipeline Status</p>
						<span className="font-medium">{details.pipelineStatus}</span>
					</div>
				)}
				{details.aiServerUrl && (
					<div>
						<p className="text-muted-foreground mb-0.5">AI Server</p>
						<code className="font-mono text-[11px] text-foreground">{details.aiServerUrl}</code>
					</div>
				)}
				{details.programCountBefore !== undefined && (
					<div>
						<p className="text-muted-foreground mb-0.5">Programs Before</p>
						<span className="font-medium">{details.programCountBefore.toLocaleString()}</span>
					</div>
				)}
				{details.programCountAfter !== undefined && (
					<div>
						<p className="text-muted-foreground mb-0.5">Programs After</p>
						<span className="font-medium">{details.programCountAfter.toLocaleString()}</span>
						{details.programCountBefore !== undefined && details.programCountAfter > details.programCountBefore && (
							<span className="ml-2 text-emerald-500 text-[11px]">
								+{details.programCountAfter - details.programCountBefore}
							</span>
						)}
					</div>
				)}
			</div>

			{details.preferences && (
				<div className="border-t border-border pt-3">
					<p className="text-muted-foreground text-xs mb-2">Sync Preferences</p>
					<div className="flex flex-wrap gap-1.5">
						{details.preferences.countries.map(c => (
							<span key={c} className="bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
								{c}
							</span>
						))}
						{details.preferences.fields.map(f => (
							<span key={f} className="bg-purple-500/10 text-purple-700 dark:text-purple-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
								{f}
							</span>
						))}
						{details.preferences.levels.map(l => (
							<span key={l} className="bg-muted text-muted-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
								{l}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// ─── Diagnostics Panel ────────────────────────────────────────────────────────

function DiagnosticsPanel({
	run,
	onRetry,
	onCancel,
	isActing,
}: {
	run: SyncRunResult;
	onRetry: (target: SyncTarget) => void;
	onCancel: (id: string) => void;
	isActing: boolean;
}) {
	const [diagTab, setDiagTab] = useState<"summary" | "logs" | "errors" | "crawler">("summary");
	const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.idle;

	const hasErrors = !!run.errorSummary || run.sources.some(s => s.errors.length > 0);
	const hasCrawler = !!run.crawlerDetails && Object.keys(run.crawlerDetails).length > 0;
	const hasLogs = run.rawLogs.length > 0;

	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/10">
				<div className={cn("h-2 w-2 rounded-full shrink-0", cfg.dot)} />
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className="text-sm font-semibold capitalize">{run.target}</span>
						<StatusBadge status={run.status} />
						{run.queueState && run.queueState !== "done" && (
							<span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
								queue: {run.queueState}
							</span>
						)}
					</div>
					<div className="flex items-center gap-3 mt-0.5 flex-wrap">
						<span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
							{run.jobId}
							<CopyButton text={run.jobId} />
						</span>
						<span className="text-[11px] text-muted-foreground">
							{formatDate(run.startedAt)} · {formatDuration(run.durationMs)}
						</span>
						<span className="text-[11px] text-muted-foreground capitalize">
							{run.triggerType} by {run.triggeredBy.slice(0, 12)}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					{run.status === "failed" && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onRetry(run.target)}
							disabled={isActing}
							className="gap-1.5 text-xs h-7"
						>
							<RotateCcw className="h-3 w-3" />
							Retry
						</Button>
					)}
					{run.status === "running" && (
						<Button
							variant="outline"
							size="sm"
							onClick={() => onCancel(run.jobId)}
							disabled={isActing}
							className="gap-1.5 text-xs h-7 text-red-600"
						>
							<Square className="h-3 w-3" />
							Cancel
						</Button>
					)}
				</div>
			</div>

			{/* Stats row */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-border">
				{[
					{ label: "Processed", value: run.recordsProcessed, color: "" },
					{ label: "Added", value: run.recordsAdded, color: "text-emerald-500" },
					{ label: "Updated", value: run.recordsUpdated, color: "text-blue-500" },
					{ label: "Skipped", value: run.recordsSkipped, color: "text-muted-foreground" },
				].map((s, i) => (
					<div
						key={s.label}
						className={cn(
							"flex flex-col items-center py-3 px-4",
							i < 3 && "border-r border-border",
						)}
					>
						<span className={cn("text-xl font-bold", s.color)}>{s.value}</span>
						<span className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</span>
					</div>
				))}
			</div>

			{/* Diag tabs */}
			<div className="flex gap-0 border-b border-border">
				{(
					[
						{ id: "summary", label: "Summary" },
						{ id: "logs", label: `Logs${hasLogs ? ` (${run.rawLogs.length})` : ""}` },
						{ id: "errors", label: "Errors", alert: hasErrors },
						{ id: "crawler", label: "Crawler", hidden: !hasCrawler },
					] as Array<{ id: string; label: string; alert?: boolean; hidden?: boolean }>
				)
					.filter(t => !t.hidden)
					.map(t => (
						<button
							key={t.id}
							type="button"
							onClick={() => setDiagTab(t.id as typeof diagTab)}
							className={cn(
								"flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
								diagTab === t.id
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground",
							)}
						>
							{t.label}
							{t.alert && (
								<span className="h-1.5 w-1.5 rounded-full bg-red-500" />
							)}
						</button>
					))}
			</div>

			{/* Tab content */}
			<div className="p-4 space-y-4">
				{diagTab === "summary" && (
					<div className="space-y-3">
						{run.sources.map(src => (
							<div key={src.sourceKey} className="rounded-lg border border-border bg-muted/20 p-3">
								<div className="flex items-center gap-2 mb-2">
									<StatusBadge status={src.status} />
									<span className="text-xs font-semibold">{src.label}</span>
									<span className="text-xs text-muted-foreground ml-auto">
										{formatDuration(src.durationMs)}
									</span>
								</div>
								{src.notes.length > 0 && (
									<ul className="space-y-0.5 mb-2">
										{src.notes.map((n, i) => (
											<li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
												<span className="text-primary mt-0.5">›</span>
												{n}
											</li>
										))}
									</ul>
								)}
								{src.errors.length > 0 && (
									<ul className="space-y-0.5 mt-2 p-2 rounded bg-red-500/5 border border-red-500/10">
										{src.errors.map((e, i) => (
											<li key={i} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1.5">
												<AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
												{e}
											</li>
										))}
									</ul>
								)}
							</div>
						))}
						{run.sources.length === 0 && (
							<p className="text-xs text-muted-foreground text-center py-4">No source data recorded.</p>
						)}
					</div>
				)}

				{diagTab === "logs" && <RawLogsPanel logs={run.rawLogs} />}

				{diagTab === "errors" && (
					<div className="space-y-3">
						{run.stackTrace && (
							<div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
								<div className="flex items-center gap-2 mb-2">
									<ServerCrash className="h-3.5 w-3.5 text-red-500" />
									<span className="text-xs font-semibold text-red-600 dark:text-red-400">
										Stack Trace
									</span>
								</div>
								<pre className="text-[10px] font-mono text-red-400 whitespace-pre-wrap overflow-auto max-h-64 leading-5">
									{run.stackTrace}
								</pre>
								<CopyButton text={run.stackTrace} className="mt-2" />
							</div>
						)}
						{run.errorSummary && (
							<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
								<div className="flex items-center gap-2 mb-2">
									<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
									<span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
										Error Summary
									</span>
								</div>
								<p className="text-xs text-amber-700 dark:text-amber-300">{run.errorSummary}</p>
							</div>
						)}
						{run.sources
							.filter(s => s.errors.length > 0)
							.map(src => (
								<div key={src.sourceKey} className="rounded-lg border border-border p-3">
									<p className="text-xs font-semibold mb-2">{src.label} errors</p>
									{src.errors.map((e, i) => (
										<p key={i} className="text-xs text-red-600 dark:text-red-400 font-mono bg-red-500/5 rounded px-2 py-1 mb-1">
											{e}
										</p>
									))}
								</div>
							))}
						{!hasErrors && !run.stackTrace && (
							<div className="text-center py-8 text-xs text-muted-foreground">
								<CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
								No errors recorded for this run.
							</div>
						)}
					</div>
				)}

				{diagTab === "crawler" && hasCrawler && run.crawlerDetails && (
					<CrawlerDetailsPanel details={run.crawlerDetails} />
				)}
			</div>
		</div>
	);
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type TabId = "overview" | "sources" | "jobs" | "diagnostics";

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
	{ id: "overview", label: "Overview", icon: Activity },
	{ id: "sources", label: "Sources", icon: Database },
	{ id: "jobs", label: "Jobs", icon: Layers },
	{ id: "diagnostics", label: "Diagnostics", icon: Terminal },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DataSyncPage() {
	const [activeTab, setActiveTab] = useState<TabId>("overview");
	const [status, setStatus] = useState<SyncStatusResponse | null>(null);
	const [fullHistory, setFullHistory] = useState<SyncRunResult[]>([]);
	const [historyTotal, setHistoryTotal] = useState(0);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [conflictMsg, setConflictMsg] = useState<string | null>(null);
	const [selectedJob, setSelectedJob] = useState<SyncRunResult | null>(null);

	const [isLoading, startLoading] = useTransition();
	const [isRunning, startRun] = useTransition();
	const [isCancelling, startCancel] = useTransition();
	const [isLoadingHistory, startHistoryLoad] = useTransition();
	const [isLoadingJob, startJobLoad] = useTransition();

	const [syncTarget, setSyncTarget] = useState<SyncTarget>("all");
	const [historyLimit, setHistoryLimit] = useState(20);

	// ── Data loading ──

	const loadStatus = useCallback(() => {
		startLoading(async () => {
			setLoadError(null);
			const res = await getDataSyncStatusAction();
			if (res) setStatus(res);
			else setLoadError("Could not load sync status — check server is running.");
		});
	}, []);

	const loadHistory = useCallback((limit: number) => {
		startHistoryLoad(async () => {
			const res = await getDataSyncHistoryAction(limit);
			if (res) {
				setFullHistory(res.runs);
				setHistoryTotal(res.total);
			}
		});
	}, []);

	useEffect(() => { loadStatus(); }, [loadStatus]);
	useEffect(() => { if (activeTab === "jobs") loadHistory(historyLimit); }, [activeTab, historyLimit, loadHistory]);

	// Auto-refresh while running
	useEffect(() => {
		if (!status?.activeJob) return;
		const t = setInterval(loadStatus, 4000);
		return () => clearInterval(t);
	}, [status?.activeJob, loadStatus]);

	// ── Actions ──

	function handleRun(target: SyncTarget = syncTarget) {
		setConflictMsg(null);
		startRun(async () => {
			const res = await triggerDataSyncAction(target);
			if (!res) return;
			if ("error" in res) {
				setConflictMsg(res.error as string);
			} else {
				const result = res as SyncRunResult;
				setSelectedJob(result);
				setActiveTab("diagnostics");
				loadStatus();
			}
		});
	}

	function handleRetry(target: SyncTarget) {
		setConflictMsg(null);
		startRun(async () => {
			const res = await retryDataSyncAction(target);
			if (!res) return;
			if ("error" in res) {
				setConflictMsg(String((res as { error: string }).error));
			} else {
				setSelectedJob(res as SyncRunResult);
				setActiveTab("diagnostics");
				loadStatus();
			}
		});
	}

	function handleCancel(jobId: string) {
		startCancel(async () => {
			const res = await cancelJobAction(jobId);
			if (res?.ok) loadStatus();
		});
	}

	function handleSelectJob(run: SyncRunResult) {
		setSelectedJob(run);
		setActiveTab("diagnostics");
		// Load full details (with raw logs) in background
		startJobLoad(async () => {
			const full = await getJobDetailsAction(run.jobId);
			if (full) setSelectedJob(full);
		});
	}

	function handleSelectJobById(id: string) {
		startJobLoad(async () => {
			const full = await getJobDetailsAction(id);
			if (full) {
				setSelectedJob(full);
				setActiveTab("diagnostics");
			}
		});
	}

	// ── Freshness summaries for Overview ──

	function buildFreshnessSummaries(): string[] {
		if (!status) return [];
		const lines: string[] = [];
		for (const src of status.sources) {
			const recs = src.recordCount.toLocaleString();
			const when = src.lastSuccessAt ? timeAgo(src.lastSuccessAt) : "never";
			if (src.lastStatus === "failed") {
				lines.push(`⚠ ${src.label}: last run failed — ${recs} records on file`);
			} else if (src.isStale && src.staleSinceHours !== null) {
				lines.push(`${src.label}: ${recs} records · last refreshed ${when} (stale by ${src.staleSinceHours}h)`);
			} else {
				lines.push(`${src.label}: ${recs} records · refreshed ${when}`);
			}
		}
		return lines;
	}

	const freshnessSummaries = buildFreshnessSummaries();

	// ── Tab content ──

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			{/* Page header */}
			<FadeIn className="mb-6">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Wrench className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Data Operations</h1>
						<p className="text-sm text-muted-foreground">
							Monitor, control, and diagnose all data refresh pipelines
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

			{/* Tabs */}
			<div className="flex gap-0 border-b border-border mb-6 overflow-x-auto">
				{TABS.map(tab => {
					const Icon = tab.icon;
					const hasDot =
						tab.id === "diagnostics" && selectedJob
							? true
							: tab.id === "jobs" && (status?.summary.failedLastRun ?? 0) > 0
								? true
								: false;
					return (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
								activeTab === tab.id
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
							)}
						>
							<Icon className="h-3.5 w-3.5" />
							{tab.label}
							{hasDot && (
								<span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
							)}
						</button>
					);
				})}
			</div>

			{/* Global error */}
			{loadError && (
				<div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 mb-6">
					<AlertCircle className="h-5 w-5 text-destructive shrink-0" />
					<p className="text-sm text-destructive flex-1">{loadError}</p>
					<Button variant="outline" size="sm" onClick={loadStatus} className="gap-1.5">
						<RotateCcw className="h-3.5 w-3.5" />
						Retry
					</Button>
				</div>
			)}

			{/* Conflict / already running */}
			{conflictMsg && (
				<div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
					<AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
					<p className="text-sm text-amber-700 dark:text-amber-400 flex-1">{conflictMsg}</p>
				</div>
			)}

			{/* Initial loading */}
			{isLoading && !status && (
				<div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-16">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			)}

			{/* ── OVERVIEW TAB ── */}
			{activeTab === "overview" && status && (
				<FadeIn className="space-y-6">
					{/* Active job banner */}
					{status.activeJob && (
						<ActiveJobBanner
							job={status.activeJob}
							onCancel={handleCancel}
							isCancelling={isCancelling}
						/>
					)}

					{/* Summary cards */}
					<div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
						<StatCard
							label="Sources"
							value={status.summary.totalSources}
							sub="data pipelines"
							icon={Database}
						/>
						<StatCard
							label="Healthy"
							value={status.summary.healthySources}
							sub="up to date"
							icon={CheckCircle2}
							highlight={
								status.summary.healthySources === status.summary.totalSources ? "green" : undefined
							}
						/>
						<StatCard
							label="Stale"
							value={status.summary.staleSources}
							sub="need refresh"
							icon={Clock}
							highlight={status.summary.staleSources > 0 ? "amber" : undefined}
						/>
						<StatCard
							label="Failed"
							value={status.summary.failedLastRun}
							sub="last run failed"
							icon={XCircle}
							highlight={status.summary.failedLastRun > 0 ? "red" : undefined}
						/>
						<StatCard
							label="Success Rate"
							value={`${status.successRate}%`}
							sub={`last ${Math.min(status.totalRuns, 20)} runs`}
							icon={TrendingUp}
							highlight={
								status.successRate >= 80 ? "green" : status.successRate >= 50 ? "amber" : "red"
							}
						/>
						<StatCard
							label="Records"
							value={status.summary.totalRecordsManaged?.toLocaleString() ?? "—"}
							sub="total managed"
							icon={Activity}
						/>
					</div>

					{/* Freshness summaries */}
					{freshnessSummaries.length > 0 && (
						<div className="rounded-xl border border-border bg-card p-4">
							<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
								Data Freshness
							</h3>
							<ul className="space-y-2">
								{freshnessSummaries.map((line, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<span
											className={cn(
												"h-1.5 w-1.5 rounded-full mt-2 shrink-0",
												line.startsWith("⚠") ? "bg-red-500" : line.includes("stale") ? "bg-amber-500" : "bg-emerald-500",
											)}
										/>
										<span className={line.startsWith("⚠") ? "text-red-600 dark:text-red-400" : "text-foreground"}>
											{line.replace("⚠ ", "")}
										</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Schedule info */}
					<div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground flex-wrap gap-y-1">
						<Zap className="h-3.5 w-3.5 shrink-0" />
						<span>
							<span className="font-medium text-foreground">GitHub Actions</span> runs automatically every day at{" "}
							<span className="font-medium text-foreground">06:00 UTC</span>
						</span>
						<span className="ml-auto shrink-0">
							Next: <span className="font-medium text-foreground">{formatDate(status.nextScheduledRun)}</span>
						</span>
					</div>

					{/* Manual sync controls */}
					<div className="rounded-xl border border-border bg-card p-5">
						<h3 className="mb-1 text-sm font-semibold">Manual Sync</h3>
						<p className="mb-4 text-xs text-muted-foreground">
							Trigger a refresh for one or all sources. Concurrent runs are rejected — a second trigger while one is active returns 409.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 flex-wrap">
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

					{/* Recent runs mini table */}
					{status.recentRuns.length > 0 && (
						<div className="rounded-xl border border-border bg-card p-4">
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-semibold">Recent Runs</h3>
								<button
									type="button"
									onClick={() => setActiveTab("jobs")}
									className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
								>
									View all {status.totalRuns} <ChevronRight className="h-3 w-3" />
								</button>
							</div>
							<div className="space-y-0.5">
								{status.recentRuns.slice(0, 5).map(run => {
									const cfg2 = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.idle;
									return (
										<button
											key={run.jobId}
											type="button"
											onClick={() => handleSelectJob(run)}
											className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 text-left transition-colors"
										>
											<div className={cn("h-2 w-2 rounded-full shrink-0", cfg2.dot)} />
											<span className="text-xs font-medium capitalize w-20 shrink-0">{run.target}</span>
											<StatusBadge status={run.status} />
											<span className="ml-auto text-xs text-muted-foreground">{timeAgo(run.startedAt)}</span>
											<span className="text-xs text-muted-foreground w-14 text-right">{formatDuration(run.durationMs)}</span>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</FadeIn>
			)}

			{/* ── SOURCES TAB ── */}
			{activeTab === "sources" && (
				<FadeIn className="space-y-4">
					{status?.activeJob && (
						<ActiveJobBanner
							job={status.activeJob}
							onCancel={handleCancel}
							isCancelling={isCancelling}
						/>
					)}

					<div className="grid gap-4 sm:grid-cols-2">
						{status?.sources.map(src => (
							<SourceCard
								key={src.sourceKey}
								source={src}
								onSync={handleRun}
								isRunning={isRunning || !!status?.activeJob}
								onSelectJob={handleSelectJobById}
							/>
						))}
						{status && status.sources.length === 0 && (
							<div className="col-span-2 text-sm text-muted-foreground text-center py-12">
								No source health data yet — trigger a sync to see results.
							</div>
						)}
						{!status && (
							<div className="col-span-2 flex justify-center py-12">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						)}
					</div>

					{/* Architecture reference */}
					<div className="rounded-xl border border-border bg-muted/20 p-5">
						<h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Architecture</h3>
						<div className="space-y-3 text-xs text-muted-foreground">
							<div className="flex items-start gap-3">
								<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0">
									Scholarships
								</span>
								<p>
									Checks database freshness: counts active records, detects expired deadlines, flags staleness.
									Populate via <code className="rounded bg-muted px-1">npm run seed:scholarships</code>.
									Stale threshold: 48 hours.
								</p>
							</div>
							<div className="flex items-start gap-3">
								<span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium shrink-0">
									Programs
								</span>
								<p>
									Triggers <code className="rounded bg-muted px-1">ai-server /api/v1/module1/sync</code>{" "}
									with aggregated user preferences → Firecrawl scraping → structured data → ingested
									via <code className="rounded bg-muted px-1">/internal/module1/ingest</code>.
									Requires <code className="rounded bg-muted px-1">MASTER_APIKEY</code>. Stale threshold: 24 hours.
								</p>
							</div>
						</div>
					</div>
				</FadeIn>
			)}

			{/* ── JOBS TAB ── */}
			{activeTab === "jobs" && (
				<FadeIn className="space-y-4">
					<div className="rounded-xl border border-border bg-card overflow-hidden">
						<div className="flex items-center justify-between px-4 py-3 border-b border-border">
							<div className="flex items-center gap-2">
								<h3 className="text-sm font-semibold">Job History</h3>
								<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
									{historyTotal} total
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => loadHistory(historyLimit)}
								disabled={isLoadingHistory}
								className="gap-1.5 h-7 text-xs"
							>
								<RefreshCw className={cn("h-3 w-3", isLoadingHistory && "animate-spin")} />
								Reload
							</Button>
						</div>

						{/* Column headers */}
						<div className="hidden md:flex items-center gap-3 px-3 py-2 border-b border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
							<div className="w-2 shrink-0" />
							<span className="w-28 shrink-0">Job ID</span>
							<span className="w-24 shrink-0">Source</span>
							<span className="w-20 shrink-0">Status</span>
							<span className="w-14 shrink-0 hidden sm:block">Trigger</span>
							<span className="flex-1">Records</span>
							<span className="ml-auto shrink-0 hidden sm:block">Started</span>
							<span className="w-16 text-right shrink-0">Duration</span>
							<div className="w-16 shrink-0" />
						</div>

						<div className="p-2">
							{isLoadingHistory && fullHistory.length === 0 && (
								<div className="flex justify-center py-12">
									<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
								</div>
							)}
							{!isLoadingHistory && fullHistory.length === 0 && (
								<div className="text-sm text-muted-foreground text-center py-12">
									No job history yet. Trigger a sync to see results here.
								</div>
							)}
							{fullHistory.map(run => (
								<JobRow
									key={run.jobId}
									run={run}
									onSelect={handleSelectJob}
									onRetry={handleRetry}
									onCancel={handleCancel}
									isActing={isRunning || isCancelling}
								/>
							))}
						</div>

						{/* Load more */}
						{fullHistory.length > 0 && fullHistory.length >= historyLimit && (
							<div className="px-4 py-3 border-t border-border flex justify-center">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										const next = historyLimit + 20;
										setHistoryLimit(next);
										loadHistory(next);
									}}
									disabled={isLoadingHistory}
									className="gap-1.5 text-xs"
								>
									{isLoadingHistory ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronDown className="h-3 w-3" />}
									Load more
								</Button>
							</div>
						)}
					</div>
				</FadeIn>
			)}

			{/* ── DIAGNOSTICS TAB ── */}
			{activeTab === "diagnostics" && (
				<FadeIn className="space-y-4">
					{isLoadingJob && !selectedJob && (
						<div className="flex items-center justify-center py-16">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					)}

					{!selectedJob && !isLoadingJob && (
						<div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
							<Terminal className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
							<p className="text-sm font-medium mb-1">No job selected</p>
							<p className="text-xs text-muted-foreground mb-4">
								Select a job from the Jobs tab, or trigger a sync to see diagnostics here.
							</p>
							<div className="flex items-center justify-center gap-3">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setActiveTab("jobs")}
									className="gap-1.5"
								>
									<Layers className="h-3.5 w-3.5" />
									View Jobs
								</Button>
								<Button
									size="sm"
									onClick={() => handleRun()}
									disabled={isRunning || !!status?.activeJob}
									className="gap-1.5"
								>
									<Play className="h-3.5 w-3.5" />
									Run Sync
								</Button>
							</div>
						</div>
					)}

					{selectedJob && (
						<>
							{isLoadingJob && (
								<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
									<Loader2 className="h-3 w-3 animate-spin" />
									Loading full details…
								</div>
							)}
							<DiagnosticsPanel
								run={selectedJob}
								onRetry={handleRetry}
								onCancel={handleCancel}
								isActing={isRunning || isCancelling}
							/>
						</>
					)}

					{/* Recent jobs quick-select */}
					{status && status.recentRuns.length > 0 && (
						<div className="rounded-xl border border-border bg-card p-4">
							<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
								Recent Jobs
							</h3>
							<div className="space-y-0.5">
								{status.recentRuns.map(run => {
									const cfg2 = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.idle;
									const isSelected = selectedJob?.jobId === run.jobId;
									return (
										<button
											key={run.jobId}
											type="button"
											onClick={() => handleSelectJob(run)}
											className={cn(
												"w-full flex items-center gap-3 py-2 px-2 rounded-lg text-left transition-colors",
												isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30",
											)}
										>
											<div className={cn("h-2 w-2 rounded-full shrink-0", cfg2.dot)} />
											<span className="text-[11px] font-mono text-muted-foreground">{shortId(run.jobId)}…</span>
											<span className="text-xs font-medium capitalize">{run.target}</span>
											<StatusBadge status={run.status} />
											<span className="ml-auto text-xs text-muted-foreground">{timeAgo(run.startedAt)}</span>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</FadeIn>
			)}
		</div>
	);
}
