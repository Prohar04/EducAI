"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
	Calendar, ChevronDown, ChevronRight, RefreshCw,
	BookOpen, Award, Plane, AlertCircle, CheckCircle2,
	Clock, MapPin, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	generateTimeline,
	getLatestTimeline,
	getTimelineInputs,
} from "@/lib/auth/action";
import { FadeIn } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import { COUNTRIES } from "@/lib/data/countries";

// ── Types ─────────────────────────────────────────────────────────────────────

type RoadmapItemType = "preparation" | "application" | "scholarship" | "visa" | "deadline";

interface RoadmapItem {
	type: RoadmapItemType;
	title: string;
	description: string;
	date?: string;
	sourceId?: string;
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
	savedPrograms: Array<{
		program?: {
			university?: {
				country?: {
					code?: string | null;
				} | null;
			} | null;
			deadlines?: Array<{
				deadline?: string;
			}>;
		} | null;
	}>;
	visaTemplateAvailable: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ITEM_ICONS: Record<RoadmapItemType, React.ElementType> = {
	preparation: BookOpen,
	application: CheckCircle2,
	scholarship: Award,
	visa: Plane,
	deadline: Clock,
};

const ITEM_ICON_COLOURS: Record<RoadmapItemType, string> = {
	preparation: "text-blue-500 bg-blue-500/15 border-blue-500/30",
	application: "text-primary bg-primary/15 border-primary/30",
	scholarship: "text-amber-500 bg-amber-500/15 border-amber-500/30",
	visa: "text-purple-500 bg-purple-500/15 border-purple-500/30",
	deadline: "text-red-500 bg-red-500/15 border-red-500/30",
};

const BADGE_COLOURS: Record<RoadmapItemType, string> = {
	preparation: "text-blue-400 bg-blue-500/20 border-blue-500/40",
	application: "text-primary bg-primary/20 border-primary/40",
	scholarship: "text-amber-400 bg-amber-500/20 border-amber-500/40",
	visa: "text-purple-400 bg-purple-500/20 border-purple-500/40",
	deadline: "text-red-400 bg-red-500/20 border-red-500/40",
};

const INTAKES = [
	"Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028",
];

function getTimelineContext(inputs: TimelineInputs | null, countryCode: string) {
	const savedProgramsCount = inputs?.savedProgramsCount ?? 0;
	const missingDeadlinesCount = inputs?.missingDeadlinesCount ?? 0;
	const visaTemplateAvailable = inputs?.visaTemplateAvailable ?? false;

	const countryPrograms = (inputs?.savedPrograms ?? []).filter(
		(savedProgram) =>
			savedProgram.program?.university?.country?.code === countryCode,
	);

	const countryHasDeadlines = countryPrograms.some(
		(savedProgram) =>
			(savedProgram.program?.deadlines?.length ?? 0) > 0,
	);

	return {
		savedProgramsCount,
		missingDeadlinesCount,
		hasCountryPrograms: countryPrograms.length > 0,
		hasCountryDeadlines: countryHasDeadlines,
		visaTemplateAvailable,
	};
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MonthCard({ month, defaultOpen = false }: { month: RoadmapMonth; defaultOpen?: boolean }) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
			>
				<div className="flex items-center gap-3">
					<Calendar className="size-4 text-primary shrink-0" />
					<span className="font-semibold">{month.label}</span>
					<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
						{month.items.length} task{month.items.length !== 1 ? "s" : ""}
					</span>
				</div>
				{open ? (
					<ChevronDown className="size-4 text-muted-foreground" />
				) : (
					<ChevronRight className="size-4 text-muted-foreground" />
				)}
			</button>

			{open && (
				<div className="divide-y divide-border border-t border-border">
					{month.items.map((item, i) => {
						const Icon = ITEM_ICONS[item.type] ?? BookOpen;
						const iconClass = ITEM_ICON_COLOURS[item.type] ?? "text-muted-foreground bg-muted border-muted";
						const badgeClass = BADGE_COLOURS[item.type] ?? "text-muted-foreground bg-muted/20 border-muted";
						return (
							<div key={i} className="flex items-start gap-3 px-5 py-3.5">
								<div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${iconClass}`}>
									<Icon className="size-3.5" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium leading-snug">{item.title}</p>
									{item.description && (
										<p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
									)}
									{item.date && (
										<p className="mt-1 text-xs text-muted-foreground/70">
											{new Date(item.date).toLocaleDateString("en-US", {
												day: "numeric", month: "short", year: "numeric",
											})}
										</p>
									)}
								</div>
								<span className={`mt-0.5 shrink-0 self-start rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide pointer-events-none select-none ${badgeClass}`}>
									{item.type}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

function SkeletonCard() {
	return (
		<div className="rounded-xl border border-border bg-card p-5 animate-pulse">
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

// ── Main component ───────────────────────────────────────────────────────────

export default function TimelinePlannerClient({
	initialRoadmap,
	initialInputs,
	defaultCountry,
}: {
	initialRoadmap: UserRoadmap | null;
	initialInputs: TimelineInputs | null;
	defaultCountry: string;
}) {
	const [roadmap, setRoadmap] = useState<UserRoadmap | null>(initialRoadmap);
	const [inputs, setInputs] = useState<TimelineInputs | null>(initialInputs);
	const [countryCode, setCountryCode] = useState(defaultCountry || "US");
	const [intake, setIntake] = useState(initialRoadmap?.intake ?? "");
	const [error, setError] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isCountryLoading, setIsCountryLoading] = useState(false);
	const [successToast, setSuccessToast] = useState<string | null>(null);

	useEffect(() => {
		if (!successToast) return;

		const timeout = window.setTimeout(() => {
			setSuccessToast(null);
		}, 2600);

		return () => window.clearTimeout(timeout);
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
			setSuccessToast(
				existingRoadmap
					? "Roadmap regenerated successfully."
					: "Roadmap generated successfully.",
			);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCountryChange = async (code: string) => {
		setCountryCode(code);
		setRoadmap(null);
		setError(null);
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

	const isPending = isGenerating || isCountryLoading;

	const plan = roadmap?.plan ?? [];
	const countryName = COUNTRIES.find((c) => c.code === countryCode)?.name ?? countryCode;
	const { savedProgramsCount, missingDeadlinesCount, hasCountryPrograms, hasCountryDeadlines, visaTemplateAvailable } =
		getTimelineContext(inputs, countryCode);
	const hasTimelineInputs = Boolean(inputs);

	// Determine empty state reason
	const hasNoPrograms = hasTimelineInputs && savedProgramsCount === 0;
	const hasProgramsButNotForCountry = hasTimelineInputs && savedProgramsCount > 0 && !hasCountryPrograms;
	const hasProgramsButNoDeadlines = hasTimelineInputs && hasCountryPrograms && !hasCountryDeadlines;
	const lacksDeadlineData = hasProgramsButNotForCountry || hasProgramsButNoDeadlines;
	const showRoadmapActions = !lacksDeadlineData && !hasNoPrograms;

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
			{/* Header */}
			<FadeIn className="mb-8">
				<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Application Timeline</h1>
						<p className="mt-1 text-muted-foreground">
							Your personalised month-by-month roadmap to studying abroad.
						</p>
					</div>
					{roadmap && (
						<p className="text-xs text-muted-foreground mt-1 sm:mt-2 shrink-0">
							Updated {new Date(roadmap.createdAt).toLocaleDateString("en-US", {
								day: "numeric", month: "short", year: "numeric",
							})}
						</p>
					)}
				</div>
			</FadeIn>

			{/* Filters */}
			<Reveal>
				<div className="mb-6 flex flex-wrap gap-3 rounded-xl border border-border bg-card px-5 py-4">
					<div className="flex flex-col gap-1 flex-1 min-w-[160px]">
						<label className="text-xs font-medium text-muted-foreground">Target Country</label>
						<select
							value={countryCode}
							onChange={(e) => handleCountryChange(e.target.value)}
							className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						>
							{COUNTRIES.map((c) => (
								<option key={c.code} value={c.code}>{c.flag} {c.name}</option>
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
							{INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
						</select>
					</div>
					<div className="flex items-end">
						{showRoadmapActions ? (
							<Button
								onClick={handleGenerate}
								disabled={isPending}
								className="gap-2 whitespace-nowrap"
							>
								{isPending ? (
									<><Loader2 className="size-4 animate-spin" /> Generating...</>
								) : roadmap ? (
									<><RefreshCw className="size-4" /> Regenerate Roadmap</>
								) : (
									<><RefreshCw className="size-4" /> Generate Roadmap</>
								)}
							</Button>
						) : (
							<Button asChild variant="outline" className="whitespace-nowrap">
								<Link href="/app/programs">Browse Programs</Link>
							</Button>
						)}
					</div>
				</div>
			</Reveal>

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
				</div>
			)}

			{!isPending && !error && !lacksDeadlineData && hasTimelineInputs && !visaTemplateAvailable && (
				<div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
					<AlertCircle className="mt-0.5 size-4 shrink-0" />
					<div>
						<p className="font-medium">Visa template unavailable for {countryName}</p>
						<p className="text-xs text-amber-700/80 dark:text-amber-300/80">
							We&apos;ll still build a generic roadmap from your saved application deadlines for now.
						</p>
					</div>
				</div>
			)}

			{/* Loading skeletons */}
			{isCountryLoading && (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
				</div>
			)}

			{/* Empty state: No saved programs at all */}
			{!isPending && !error && hasNoPrograms && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
						<Calendar className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">No programs saved yet</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							Save at least one program to generate a deadline-based roadmap.
						</p>
						<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
							<MapPin className="size-3.5" />
							Showing plan for <strong>{countryName}</strong>
						</div>
						<Button asChild className="mt-6">
							<Link href="/app/programs">Browse Programs</Link>
						</Button>
					</div>
				</Reveal>
			)}

			{/* Empty state: Programs exist but not for this country */}
			{!isPending && !error && hasProgramsButNotForCountry && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
						<Calendar className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">No programs for {countryName}</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							You have {savedProgramsCount} saved program{savedProgramsCount !== 1 ? "s" : ""}, but none for {countryName}.
							Try selecting a different country or save more programs.
						</p>
						<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
							<MapPin className="size-3.5" />
							Showing plan for <strong>{countryName}</strong>
						</div>
						<Button asChild className="mt-6">
							<Link href="/app/programs">Browse Programs</Link>
						</Button>
					</div>
				</Reveal>
			)}

			{/* Empty state: Programs exist but no deadlines */}
			{!isPending && !error && hasProgramsButNoDeadlines && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
						<Calendar className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">Add deadlines to your programs</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							You have saved programs for {countryName}, but they don't have application deadlines yet.
							Add deadlines to generate a timeline.
						</p>
						<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
							<MapPin className="size-3.5" />
							Showing plan for <strong>{countryName}</strong>
						</div>
						<Button asChild className="mt-6">
							<Link href="/app/programs">Browse Programs</Link>
						</Button>
					</div>
				</Reveal>
			)}

			{/* Empty state: Ready to generate */}
			{!isPending && !error && !lacksDeadlineData && !hasNoPrograms && plan.length === 0 && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
						<Calendar className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">Your roadmap is ready to generate</h2>
						<p className="mt-1 max-w-sm text-sm text-muted-foreground">
							Use your saved program deadlines to build a month-by-month application plan for {countryName}.
						</p>
						<Button onClick={handleGenerate} disabled={isPending} className="mt-6 gap-2">
							{isPending ? (
								<><Loader2 className="size-4 animate-spin" /> Generating...</>
							) : (
								<><RefreshCw className="size-4" /> Generate Roadmap</>
							)}
						</Button>
					</div>
				</Reveal>
			)}

			{/* Loading skeletons */}
			{isPending && (
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
				</div>
			)}

			{/* Roadmap months */}
			{!isPending && !lacksDeadlineData && !hasNoPrograms && plan.length > 0 && (
				<>
					<div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
						<MapPin className="size-4 shrink-0" />
						Roadmap for <strong>{countryName}</strong>
						{roadmap?.intake && <> · Intake: <strong>{roadmap.intake}</strong></>}
					</div>
					<div className="space-y-3">
						{plan.map((month, i) => (
							<MonthCard key={month.month} month={month} defaultOpen={i === 0} />
						))}
					</div>
				</>
			)}
		</div>
	);
}
