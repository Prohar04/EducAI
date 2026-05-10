"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useFirstVisit } from "@/lib/hooks/use-first-visit";
import {
	Calendar, ChevronDown, ChevronRight, RefreshCw,
	BookOpen, Award, Plane, AlertCircle, CheckCircle2,
	Clock, MapPin, Loader2, Printer, Target,
	AlertTriangle, TrendingUp, Circle, CheckCheck,
	Info, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	generateTimeline,
	getLatestTimeline,
	getTimelineInputs,
	updateTaskStatus,
} from "@/lib/auth/action";
import { FadeIn } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import { COUNTRIES } from "@/lib/data/countries";

// ── Types ─────────────────────────────────────────────────────────────────────

type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
type TaskPriority = "critical" | "high" | "medium" | "low";
type RoadmapItemType = "preparation" | "application" | "scholarship" | "visa" | "deadline";
type FilterTab = "all" | "overdue" | "pending" | "completed";

interface RoadmapItem {
	id: string;
	type: RoadmapItemType;
	title: string;
	description: string;
	date?: string;
	sourceId?: string;
	status: TaskStatus;
	priority: TaskPriority;
	estimatedDuration?: string;
}

interface RoadmapMonth {
	month: string;
	label: string;
	items: RoadmapItem[];
}

interface UserRoadmap {
	id: string;
	countryCode: string;
	intake?: string;
	startMonth: string;
	endMonth: string;
	plan: RoadmapMonth[];
	createdAt: string;
}

interface TimelineInputs {
	savedProgramsCount: number;
	savedWithDeadlinesCount: number;
	missingDeadlinesCount: number;
	countryProgramsCount?: number;
	countryProgramsWithDeadlinesCount?: number;
	savedPrograms: Array<{
		program?: {
			university?: { country?: { code?: string | null } | null } | null;
			deadlines?: Array<{ deadline?: string }>;
		} | null;
	}>;
	visaTemplateAvailable: boolean;
	profile?: { targetIntake?: string | null } | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEM_ICONS: Record<RoadmapItemType, React.ComponentType<{ className?: string }>> = {
	preparation: BookOpen,
	application: CheckCircle2,
	scholarship: Award,
	visa: Plane,
	deadline: Clock,
};

const ITEM_ICON_COLOURS: Record<RoadmapItemType, string> = {
	preparation: "text-[#4A90D9] bg-[#4A90D9]/15 border-[#4A90D9]/30",
	application: "text-primary bg-primary/15 border-primary/30",
	scholarship: "text-[#C49A3C] bg-[#C49A3C]/15 border-[#C49A3C]/30",
	visa: "text-[#4A90D9] bg-[#4A90D9]/15 border-[#4A90D9]/30",
	deadline: "text-[#C0392B] bg-[#C0392B]/15 border-[#C0392B]/30",
};

const BADGE_COLOURS: Record<RoadmapItemType, string> = {
	preparation: "text-[#4A90D9] bg-[#4A90D9]/20 border-[#4A90D9]/40",
	application: "text-primary bg-primary/20 border-primary/40",
	scholarship: "text-[#C49A3C] bg-[#C49A3C]/20 border-[#C49A3C]/40",
	visa: "text-[#4A90D9] bg-[#4A90D9]/20 border-[#4A90D9]/40",
	deadline: "text-[#C0392B] bg-[#C0392B]/20 border-[#C0392B]/40",
};

const PRIORITY_COLOURS: Record<TaskPriority, string> = {
	critical: "text-[#C0392B]",
	high: "text-[#C49A3C]",
	medium: "text-[#7A8BA8]",
	low: "text-muted-foreground",
};

const INTAKES = [
	"Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028",
];

// ── Derived helpers ───────────────────────────────────────────────────────────

function getAllTasks(plan: RoadmapMonth[]): RoadmapItem[] {
	return plan.flatMap((m) => m.items);
}

function getCurrentMonthKey(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getProgressStats(plan: RoadmapMonth[]) {
	const all = getAllTasks(plan);
	const total = all.length;
	const completed = all.filter((t) => t.status === "completed").length;
	const overdue = all.filter((t) => t.status === "overdue").length;
	const inProgress = all.filter((t) => t.status === "in_progress").length;
	const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
	return { total, completed, overdue, inProgress, pct };
}

function filterPlan(plan: RoadmapMonth[], tab: FilterTab): RoadmapMonth[] {
	if (tab === "all") return plan;
	return plan
		.map((m) => ({
			...m,
			items: m.items.filter((item) => {
				if (tab === "overdue") return item.status === "overdue";
				if (tab === "pending") return item.status === "pending" || item.status === "in_progress";
				if (tab === "completed") return item.status === "completed";
				return true;
			}),
		}))
		.filter((m) => m.items.length > 0);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: TaskStatus }) {
	if (status === "completed") return <CheckCheck className="size-3.5 text-[#3D9970]" />;
	if (status === "overdue") return <XCircle className="size-3.5 text-[#C0392B]" />;
	if (status === "in_progress") return <TrendingUp className="size-3.5 text-[#4A90D9]" />;
	return <Circle className="size-3.5 text-muted-foreground/50" />;
}

function TaskItem({
	item,
	roadmapId,
	onStatusChange,
	updatingId,
}: {
	item: RoadmapItem;
	roadmapId: string;
	onStatusChange: (roadmapId: string, taskId: string, status: TaskStatus) => void;
	updatingId: string | null;
}) {
	const Icon = ITEM_ICONS[item.type] ?? BookOpen;
	const iconClass = ITEM_ICON_COLOURS[item.type] ?? "text-muted-foreground bg-muted border-muted";
	const badgeClass = BADGE_COLOURS[item.type] ?? "text-muted-foreground bg-muted/20 border-muted";
	const isUpdating = updatingId === item.id;
	const isDone = item.status === "completed";
	const isOverdue = item.status === "overdue";

	const nextStatus: TaskStatus = isDone ? "pending" : "completed";

	return (
		<div
			className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${isDone ? "opacity-60" : ""}`}
		>
			{/* Completion toggle */}
			<button
				type="button"
				disabled={isUpdating}
				onClick={() => onStatusChange(roadmapId, item.id, nextStatus)}
				className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all
					${isDone
						? "border-[#3D9970] bg-[#3D9970]/20 hover:bg-[#3D9970]/30"
						: isOverdue
							? "border-[#C0392B]/60 bg-[#C0392B]/10 hover:bg-[#C0392B]/15"
							: "border-border hover:border-primary/50 hover:bg-primary/5"
					}
				`}
				title={isDone ? "Mark as pending" : "Mark as completed"}
				aria-label={isDone ? "Mark as pending" : "Mark as completed"}
			>
				{isUpdating ? (
					<Loader2 className="size-3 animate-spin text-muted-foreground" />
				) : (
					<StatusIcon status={item.status} />
				)}
			</button>

			{/* Type icon */}
			<div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${iconClass}`}>
				<Icon className="size-3.5" />
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="flex items-start gap-2 flex-wrap">
					<p className={`text-sm font-medium leading-snug ${isDone ? "line-through text-muted-foreground" : ""}`}>
						{item.title}
					</p>
					{isOverdue && (
						<span className="inline-flex items-center gap-1 rounded border border-[#C0392B]/30 bg-[#C0392B]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C0392B]">
							<AlertTriangle className="size-2.5" /> Overdue
						</span>
					)}
					{item.status === "in_progress" && (
						<span className="inline-flex items-center gap-1 rounded border border-[#4A90D9]/30 bg-[#4A90D9]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4A90D9]">
							In Progress
						</span>
					)}
				</div>
				{item.description && (
					<p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
				)}
				<div className="mt-1 flex items-center gap-3 flex-wrap">
					{item.date && (
						<p className="text-xs text-muted-foreground/70">
							{new Date(item.date).toLocaleDateString("en-US", {
								day: "numeric", month: "short", year: "numeric",
							})}
						</p>
					)}
					{item.estimatedDuration && (
						<p className="text-xs text-muted-foreground/50">~ {item.estimatedDuration}</p>
					)}
					{item.priority === "critical" && !isDone && (
						<span className={`text-xs font-medium ${PRIORITY_COLOURS[item.priority]}`}>
							● Critical
						</span>
					)}
					{item.priority === "high" && !isDone && (
						<span className={`text-xs font-medium ${PRIORITY_COLOURS[item.priority]}`}>
							● High priority
						</span>
					)}
				</div>
			</div>

			{/* Type badge */}
			<span className={`mt-0.5 shrink-0 self-start rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide pointer-events-none select-none ${badgeClass}`}>
				{item.type}
			</span>
		</div>
	);
}

function MonthCard({
	month,
	roadmapId,
	defaultOpen = false,
	isCurrentMonth = false,
	onStatusChange,
	updatingId,
}: {
	month: RoadmapMonth;
	roadmapId: string;
	defaultOpen?: boolean;
	isCurrentMonth?: boolean;
	onStatusChange: (roadmapId: string, taskId: string, status: TaskStatus) => void;
	updatingId: string | null;
}) {
	const [open, setOpen] = useState(defaultOpen);
	const overdueCount = month.items.filter((i) => i.status === "overdue").length;
	const completedCount = month.items.filter((i) => i.status === "completed").length;
	const totalCount = month.items.length;

	return (
		<div className={`rounded-2xl border overflow-hidden transition-colors ${
			isCurrentMonth
				? "border-primary/40 bg-primary/5"
				: "border-border bg-card"
		}`}>
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
			>
				<div className="flex items-center gap-3 flex-wrap">
					<Calendar className={`size-4 shrink-0 ${isCurrentMonth ? "text-primary" : "text-muted-foreground"}`} />
					<span className="font-semibold">
						{month.label}
						{isCurrentMonth && (
							<span className="ml-2 text-xs font-normal text-primary">← This month</span>
						)}
					</span>
					<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
						{totalCount} task{totalCount !== 1 ? "s" : ""}
					</span>
					{overdueCount > 0 && (
						<span className="rounded-full bg-[#C0392B]/15 px-2 py-0.5 text-xs font-medium text-[#C0392B]">
							{overdueCount} overdue
						</span>
					)}
					{completedCount > 0 && completedCount < totalCount && (
						<span className="rounded-full bg-[#3D9970]/15 px-2 py-0.5 text-xs font-medium text-[#3D9970]">
							{completedCount}/{totalCount} done
						</span>
					)}
					{completedCount === totalCount && totalCount > 0 && (
						<span className="rounded-full bg-[#3D9970]/15 px-2 py-0.5 text-xs font-medium text-[#3D9970]">
							✓ All done
						</span>
					)}
				</div>
				{open ? (
					<ChevronDown className="size-4 text-muted-foreground shrink-0" />
				) : (
					<ChevronRight className="size-4 text-muted-foreground shrink-0" />
				)}
			</button>

			{open && (
				<div className="divide-y divide-border border-t border-border">
					{month.items.map((item) => (
						<TaskItem
							key={item.id ?? item.title}
							item={item}
							roadmapId={roadmapId}
							onStatusChange={onStatusChange}
							updatingId={updatingId}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function SkeletonCard() {
	return (
		<div className="rounded-2xl border border-border bg-card p-5 animate-pulse">
			<div className="flex items-center gap-3 mb-3">
				<div className="h-4 w-4 rounded bg-muted" />
				<div className="h-4 w-40 rounded bg-muted" />
				<div className="h-5 w-12 rounded-full bg-muted" />
			</div>
			<div className="space-y-2 pl-7">
				<div className="h-3 w-2/3 rounded bg-muted" />
				<div className="h-3 w-1/2 rounded bg-muted" />
			</div>
		</div>
	);
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TimelinePlannerClient({
	initialRoadmap,
	initialInputs,
	defaultCountry,
}: {
	initialRoadmap: UserRoadmap | null;
	initialInputs: TimelineInputs | null;
	defaultCountry: string;
}) {
	const isFirstVisit = useFirstVisit("timeline");
	const [roadmap, setRoadmap] = useState<UserRoadmap | null>(initialRoadmap);
	const [inputs, setInputs] = useState<TimelineInputs | null>(initialInputs);
	const [countryCode, setCountryCode] = useState(defaultCountry || "US");
	const [intake, setIntake] = useState(initialRoadmap?.intake ?? "");
	const [error, setError] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCountryLoading, setIsCountryLoading] = useState(false);
	const [successToast, setSuccessToast] = useState<string | null>(null);
	const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

	useEffect(() => {
		if (!successToast) return;
		const t = window.setTimeout(() => setSuccessToast(null), 2800);
		return () => window.clearTimeout(t);
	}, [successToast]);

	const handleGenerate = async () => {
		const existingRoadmap = Boolean(roadmap);
		setError(null);
		setIsGenerating(true);
		try {
			const result = await generateTimeline(countryCode, intake || undefined);
			if (!result.success) {
				setError(result.message ?? "Unknown error");
				return;
			}
			const [latest, nextInputs] = await Promise.all([
				getLatestTimeline(countryCode),
				getTimelineInputs(countryCode),
			]);
			setRoadmap((latest as UserRoadmap | null) ?? null);
			setInputs((nextInputs as TimelineInputs | null) ?? null);
			setActiveFilter("all");
			setSuccessToast(existingRoadmap ? "Roadmap regenerated." : "Roadmap generated!");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCountryChange = async (code: string) => {
		setCountryCode(code);
		setRoadmap(null);
		setError(null);
		setActiveFilter("all");
		setIsCountryLoading(true);
		try {
			const [latest, nextInputs] = await Promise.all([
				getLatestTimeline(code),
				getTimelineInputs(code),
			]);
			setRoadmap((latest as UserRoadmap | null) ?? null);
			setInputs((nextInputs as TimelineInputs | null) ?? null);
		} finally {
			setIsCountryLoading(false);
		}
	};

	const handleToggleTask = useCallback(
		async (rmId: string, taskId: string, newStatus: TaskStatus) => {
			if (updatingTaskId) return;
			setUpdatingTaskId(taskId);

			// Optimistic update
			setRoadmap((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					plan: prev.plan.map((month) => ({
						...month,
						items: month.items.map((item) =>
							item.id === taskId ? { ...item, status: newStatus } : item,
						),
					})),
				};
			});

			const result = await updateTaskStatus(rmId, taskId, newStatus);
			if (!result.success) {
				// Roll back on failure
				setRoadmap((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						plan: prev.plan.map((month) => ({
							...month,
							items: month.items.map((item) =>
								item.id === taskId
									? { ...item, status: newStatus === "completed" ? "pending" : "completed" }
									: item,
							),
						})),
					};
				});
				setError(result.message ?? "Failed to update task");
			}

			setUpdatingTaskId(null);
		},
		[updatingTaskId],
	);

	// ── Derived state ────────────────────────────────────────────────────────

	const isPending = isGenerating || isCountryLoading;
	const plan = roadmap?.plan ?? [];
	const countryName = COUNTRIES.find((c) => c.code === countryCode)?.name ?? countryCode;
	const currentMonthKey = getCurrentMonthKey();
	const stats = plan.length > 0 ? getProgressStats(plan) : null;
	const filteredPlan = filterPlan(plan, activeFilter);

	const savedProgramsCount = inputs?.savedProgramsCount ?? 0;
	const countryProgramsCount = inputs?.countryProgramsCount ?? 0;
	const countryProgramsWithDeadlines = inputs?.countryProgramsWithDeadlinesCount ?? 0;
	const hasTimelineInputs = Boolean(inputs);
	const visaTemplateAvailable = inputs?.visaTemplateAvailable ?? false;

	// Determine informational banner (not blocking — generation always allowed with profile)
	const infoMessage: string | null =
		hasTimelineInputs && savedProgramsCount === 0
			? "No programs saved yet. We'll build a generic roadmap based on your target intake. Add programs for deadline-based tasks."
			: hasTimelineInputs && countryProgramsCount === 0 && savedProgramsCount > 0
				? `You have ${savedProgramsCount} saved program${savedProgramsCount !== 1 ? "s" : ""} but none for ${countryName}. Roadmap will use your target intake as anchor.`
				: hasTimelineInputs && countryProgramsCount > 0 && countryProgramsWithDeadlines === 0
					? `Your ${countryName} programs don't have deadlines yet. Add deadlines for a more personalised roadmap.`
					: null;

	// No profile = hard block
	const hasNoProfile = hasTimelineInputs && !inputs?.profile;

	return (
		<div className={`${isFirstVisit ? "page-enter" : ""} mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8`}>
			<PageHeader
				animation="timeline"
				title={<>Application <span className="gradient-text">Timeline</span></>}
				subtitle="Month-by-month roadmap from first deadline to acceptance"
				metaText={roadmap ? `Updated ${new Date(roadmap.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : undefined}
				rightContent={
					plan.length > 0 ? (
						<button
							type="button"
							onClick={() => window.print()}
							className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors print:hidden"
							title="Print timeline"
						>
							<Printer className="size-3.5" />
							Print
						</button>
					) : undefined
				}
			/>

			{/* Controls */}
			<Reveal>
				<div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-border bg-card px-5 py-4">
					<div className="flex flex-col gap-1 flex-1 min-w-[160px]">
						<label className="text-xs font-medium text-muted-foreground">Target Country</label>
						<select
							value={countryCode}
							onChange={(e) => handleCountryChange(e.target.value)}
							className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						>
							{COUNTRIES.map((c) => (
								<option key={c.code} value={c.code}>
									{c.flag} {c.name}
								</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-1 flex-1 min-w-[160px]">
						<label className="text-xs font-medium text-muted-foreground">Target Intake</label>
						<select
							value={intake}
							onChange={(e) => setIntake(e.target.value)}
							className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						>
							<option value="">Auto-detect from profile</option>
							{INTAKES.map((i) => (
								<option key={i} value={i}>{i}</option>
							))}
						</select>
					</div>
					<div className="flex items-end">
						<Button
							onClick={handleGenerate}
							disabled={isPending || hasNoProfile}
							className="gap-2 whitespace-nowrap"
						>
							{isPending ? (
								<><Loader2 className="size-4 animate-spin" /> Generating…</>
							) : roadmap ? (
								<><RefreshCw className="size-4" /> Regenerate Roadmap</>
							) : (
								<><Target className="size-4" /> Generate Roadmap</>
							)}
						</Button>
					</div>
				</div>
			</Reveal>

			{/* Success toast */}
			{successToast && (
				<div className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-auto sm:right-6">
					<div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-background/95 px-4 py-3 text-sm text-foreground shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] backdrop-blur">
						<CheckCircle2 className="size-4 shrink-0 text-primary" />
						{successToast}
					</div>
				</div>
			)}

			{/* Error */}
			{error && (
				<div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					<AlertCircle className="size-4 shrink-0" />
					{error}
					<button
						type="button"
						className="ml-auto text-xs underline opacity-70 hover:opacity-100"
						onClick={() => setError(null)}
					>
						Dismiss
					</button>
				</div>
			)}

			{/* No profile state */}
			{!isPending && hasNoProfile && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
						<AlertCircle className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">Complete your profile first</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							Your profile is needed to generate a personalised roadmap with the right intake date and target countries.
						</p>
						<Button asChild className="mt-6">
							<Link href="/app/profile">Go to Profile</Link>
						</Button>
					</div>
				</Reveal>
			)}

			{/* Informational banner (non-blocking) */}
			{!isPending && !error && infoMessage && (
				<div className="mb-4 flex items-start gap-2 rounded-lg border border-[#C49A3C]/25 bg-[#C49A3C]/10 px-4 py-3 text-sm text-[#C49A3C]">
					<Info className="mt-0.5 size-4 shrink-0" />
					<p>{infoMessage}</p>
					<Button asChild variant="ghost" size="sm" className="ml-auto shrink-0 h-auto py-0 text-xs">
						<Link href="/app/programs">Browse Programs</Link>
					</Button>
				</div>
			)}

			{/* Visa template warning */}
			{!isPending && !error && !infoMessage && hasTimelineInputs && !visaTemplateAvailable && (
				<div className="mb-4 flex items-start gap-2 rounded-lg border border-[#C49A3C]/25 bg-[#C49A3C]/10 px-4 py-3 text-sm text-[#C49A3C]">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					<div>
						<p className="font-medium">No visa template for {countryName}</p>
						<p className="text-xs text-[#C49A3C]/80">
							Roadmap will be built from your program deadlines without country-specific visa milestones.
						</p>
					</div>
				</div>
			)}

			{/* Loading skeletons */}
			{isPending && (
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
				</div>
			)}

			{/* Empty state: ready to generate */}
			{!isPending && !hasNoProfile && plan.length === 0 && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
						<Calendar className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">Your roadmap is ready to build</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							Generate a personalised month-by-month study-abroad plan for <strong>{countryName}</strong>.
							{savedProgramsCount === 0 && " We'll use your target intake as the anchor until you add programs."}
						</p>
						<Button onClick={handleGenerate} disabled={isPending} className="mt-6 gap-2">
							{isPending ? (
								<><Loader2 className="size-4 animate-spin" /> Generating…</>
							) : (
								<><Target className="size-4" /> Generate Roadmap</>
							)}
						</Button>
					</div>
				</Reveal>
			)}

			{/* Roadmap display */}
			{!isPending && plan.length > 0 && (
				<>
					{/* Roadmap context banner */}
					<div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
						<MapPin className="size-4 shrink-0" />
						<span>
							Roadmap for <strong>{countryName}</strong>
							{roadmap?.intake && <> · Intake: <strong>{roadmap.intake}</strong></>}
						</span>
					</div>

					{/* Progress summary */}
					{stats && (
						<Reveal>
							<div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
								<div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
									<p className="text-2xl font-bold">{stats.total}</p>
									<p className="text-xs text-muted-foreground mt-0.5">Total tasks</p>
								</div>
								<div className="rounded-xl border border-[#3D9970]/20 bg-[#3D9970]/5 px-4 py-3 text-center">
									<p className="text-2xl font-bold text-[#3D9970]">{stats.completed}</p>
									<p className="text-xs text-muted-foreground mt-0.5">Completed</p>
								</div>
								<div className={`rounded-xl border px-4 py-3 text-center ${stats.overdue > 0 ? "border-[#C0392B]/20 bg-[#C0392B]/5" : "border-border bg-card"}`}>
									<p className={`text-2xl font-bold ${stats.overdue > 0 ? "text-[#C0392B]" : "text-muted-foreground"}`}>
										{stats.overdue}
									</p>
									<p className="text-xs text-muted-foreground mt-0.5">Overdue</p>
								</div>
								<div className="rounded-xl border border-border bg-card px-4 py-3 text-center">
									<p className="text-2xl font-bold">{stats.pct}%</p>
									<p className="text-xs text-muted-foreground mt-0.5">Progress</p>
								</div>
							</div>

							{/* Progress bar */}
							<div className="mb-6">
								<div className="flex justify-between text-xs text-muted-foreground mb-1.5">
									<span>{stats.completed} of {stats.total} tasks completed</span>
									<span>{stats.pct}%</span>
								</div>
								<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
									<div
										className="h-full rounded-full bg-primary transition-all duration-500"
										style={{ width: `${stats.pct}%` }}
									/>
								</div>
							</div>
						</Reveal>
					)}

					{/* Overdue callout */}
					{stats && stats.overdue > 0 && activeFilter === "all" && (
						<Reveal>
							<div className="mb-6 rounded-xl border border-[#C0392B]/25 bg-[#C0392B]/8 px-4 py-3">
								<div className="flex items-center gap-2 text-[#C0392B] font-medium text-sm">
									<AlertTriangle className="size-4 shrink-0" />
									{stats.overdue} overdue task{stats.overdue !== 1 ? "s" : ""} require attention
								</div>
								<p className="mt-1 text-xs text-muted-foreground">
									These tasks passed their target date. Complete them or they will carry over into your plan.
								</p>
								<button
									type="button"
									className="mt-2 text-xs font-medium text-[#C0392B] underline"
									onClick={() => setActiveFilter("overdue")}
								>
									View overdue tasks →
								</button>
							</div>
						</Reveal>
					)}

					{/* Filter tabs */}
					<div className="mb-4 flex gap-2 flex-wrap">
						{(["all", "overdue", "pending", "completed"] as FilterTab[]).map((tab) => {
							const count = tab === "all"
								? stats?.total
								: tab === "overdue"
									? stats?.overdue
									: tab === "pending"
										? (stats ? stats.total - stats.completed - stats.overdue : 0)
										: stats?.completed;
							return (
								<button
									key={tab}
									type="button"
									onClick={() => setActiveFilter(tab)}
									className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
										activeFilter === tab
											? "border-primary bg-primary/10 text-primary"
											: "border-border bg-card text-muted-foreground hover:bg-muted/60"
									}`}
								>
									{tab}{count !== undefined && count > 0 && ` (${count})`}
								</button>
							);
						})}
					</div>

					{/* Empty filtered state */}
					{filteredPlan.length === 0 && (
						<div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
							No {activeFilter === "all" ? "" : activeFilter} tasks found.
							{activeFilter !== "all" && (
								<button
									type="button"
									className="ml-1 underline"
									onClick={() => setActiveFilter("all")}
								>
									Show all
								</button>
							)}
						</div>
					)}

					{/* Month cards */}
					<div className="space-y-3">
						{filteredPlan.map((month, i) => (
							<MonthCard
								key={month.month}
								month={month}
								roadmapId={roadmap!.id}
								defaultOpen={i === 0 || month.month === currentMonthKey}
								isCurrentMonth={month.month === currentMonthKey}
								onStatusChange={handleToggleTask}
								updatingId={updatingTaskId}
							/>
						))}
					</div>
				</>
			)}
		</div>
	);
}
