"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
	AlertCircle,
	Award,
	Bell,
	BookOpen,
	Calendar,
	Check,
	CircleDashed,
	ExternalLink,
	Globe,
	Loader2,
	RefreshCw,
	Search,
	ShieldCheck,
	SlidersHorizontal,
	TrendingUp,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import { COUNTRIES } from "@/lib/data/countries";
import type {
	EligibilityResult,
	EligibleScholarshipItem,
	ProbabilityResult,
	ScholarshipItem,
	ScholarshipListResult,
	UpcomingDeadlineItem,
} from "@/types/auth.type";
import {
	checkScholarshipEligibility,
	getScholarshipProbability,
	searchScholarships,
} from "@/lib/auth/action";

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
	const diff = new Date(dateStr).getTime() - Date.now();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDeadline(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-US", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function fundingBadgeClass(type: string | null | undefined) {
	switch (type) {
		case "full":
			return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
		case "partial":
			return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
		case "living":
			return "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30";
		case "research":
			return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
		default:
			return "bg-muted/50 text-muted-foreground border-border";
	}
}

function eligibilityBadgeClass(status: EligibilityResult["status"]) {
	switch (status) {
		case "eligible":
			return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
		case "partially_eligible":
			return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
		case "not_eligible":
			return "bg-red-500/15 text-red-500 border-red-500/30";
	}
}

function eligibilityLabel(status: EligibilityResult["status"]) {
	switch (status) {
		case "eligible":
			return "Eligible";
		case "partially_eligible":
			return "Partially Eligible";
		case "not_eligible":
			return "Not Eligible";
	}
}

function probabilityBandClass(band: ProbabilityResult["probabilityBand"]) {
	switch (band) {
		case "High":
			return "text-emerald-600 dark:text-emerald-400";
		case "Medium":
			return "text-amber-600 dark:text-amber-400";
		case "Low":
			return "text-red-500";
	}
}

function countryFlag(code: string | null | undefined) {
	if (!code) return "🌍";
	const c = COUNTRIES.find((x) => x.code === code || x.code === code.toUpperCase());
	return c?.flag ?? "🌍";
}

const LEVEL_LABELS: Record<string, string> = { BSC: "Bachelor's", MSC: "Master's", PHD: "PhD" };

// ── Sub-components ─────────────────────────────────────────────────────────────

function SkeletonCard() {
	return (
		<div className="animate-pulse rounded-2xl border border-border bg-card p-5">
			<div className="mb-3 flex items-start justify-between gap-3">
				<div className="h-5 w-2/3 rounded bg-muted" />
				<div className="h-5 w-16 rounded-full bg-muted" />
			</div>
			<div className="mb-3 h-3 w-1/3 rounded bg-muted" />
			<div className="space-y-2">
				<div className="h-3 w-full rounded bg-muted" />
				<div className="h-3 w-4/5 rounded bg-muted" />
			</div>
			<div className="mt-4 flex gap-2">
				<div className="h-8 w-24 rounded-lg bg-muted" />
				<div className="h-8 w-24 rounded-lg bg-muted" />
			</div>
		</div>
	);
}

// ── Eligibility Modal ──────────────────────────────────────────────────────────

function EligibilityModal({
	scholarship,
	onClose,
}: {
	scholarship: ScholarshipItem;
	onClose: () => void;
}) {
	const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
	const [probability, setProbability] = useState<ProbabilityResult | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"eligibility" | "probability">("eligibility");

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const [elig, prob] = await Promise.all([
					checkScholarshipEligibility(scholarship.id),
					getScholarshipProbability(scholarship.id),
				]);
				setEligibility(elig);
				setProbability(prob);
			} catch {
				setError("Failed to load eligibility details");
			} finally {
				setLoading(false);
			}
		};
		void load();
	}, [scholarship.id]);

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative z-10 flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
				{/* Header */}
				<div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
					<div>
						<h2 className="font-semibold leading-snug">{scholarship.title}</h2>
						<p className="text-sm text-muted-foreground">{scholarship.provider}</p>
					</div>
					<button
						onClick={onClose}
						className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
						aria-label="Close"
					>
						<X className="size-4" />
					</button>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-border">
					<button
						onClick={() => setActiveTab("eligibility")}
						className={`flex-1 px-5 py-3 text-sm font-medium transition-colors ${
							activeTab === "eligibility"
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Eligibility Check
					</button>
					<button
						onClick={() => setActiveTab("probability")}
						className={`flex-1 px-5 py-3 text-sm font-medium transition-colors ${
							activeTab === "probability"
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						Funding Probability
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto px-5 py-4">
					{loading && (
						<div className="flex items-center justify-center py-10">
							<Loader2 className="size-6 animate-spin text-primary" />
						</div>
					)}

					{error && !loading && (
						<div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							<AlertCircle className="size-4 shrink-0" />
							{error}
						</div>
					)}

					{!loading && !error && activeTab === "eligibility" && eligibility && (
						<div className="space-y-4">
							{/* Status banner */}
							<div
								className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${eligibilityBadgeClass(eligibility.status)}`}
							>
								<ShieldCheck className="size-5 shrink-0" />
								<div>
									<p className="font-semibold">{eligibilityLabel(eligibility.status)}</p>
									<p className="text-xs opacity-80">
										Match score: {eligibility.score}% · {eligibility.confidence} confidence
									</p>
								</div>
								<div className="ml-auto shrink-0">
									<span className="text-2xl font-bold">{eligibility.score}%</span>
								</div>
							</div>

							{/* Progress bar */}
							<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
								<div
									className={`h-full rounded-full transition-all duration-500 ${
										eligibility.score >= 80
											? "bg-emerald-500"
											: eligibility.score >= 50
											? "bg-amber-500"
											: "bg-red-500"
									}`}
									style={{ width: `${eligibility.score}%` }}
								/>
							</div>

							{/* Met criteria */}
							{eligibility.metCriteria.length > 0 && (
								<div>
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Met Criteria
									</h3>
									<ul className="space-y-1.5">
										{eligibility.metCriteria.map((c, i) => (
											<li key={i} className="flex items-start gap-2 text-sm">
												<Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
												{c}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Missing criteria */}
							{eligibility.missingCriteria.length > 0 && (
								<div>
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Missing Criteria
									</h3>
									<ul className="space-y-1.5">
										{eligibility.missingCriteria.map((c, i) => (
											<li key={i} className="flex items-start gap-2 text-sm">
												<X className="mt-0.5 size-4 shrink-0 text-red-500" />
												{c}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Improvement actions */}
							{eligibility.improvementActions.length > 0 && (
								<div className="rounded-xl border border-border bg-muted/30 p-4">
									<h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										<TrendingUp className="size-3.5" /> Improvement Actions
									</h3>
									<ul className="space-y-1.5">
										{eligibility.improvementActions.map((action, i) => (
											<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
												<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
												{action}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}

					{!loading && !error && activeTab === "probability" && probability && (
						<div className="space-y-4">
							{/* Band */}
							<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
								<div className="text-center">
									<p
										className={`text-4xl font-bold ${probabilityBandClass(probability.probabilityBand)}`}
									>
										{probability.probabilityPct}%
									</p>
									<p
										className={`text-sm font-semibold ${probabilityBandClass(probability.probabilityBand)}`}
									>
										{probability.probabilityBand} Chance
									</p>
								</div>
								<div className="flex-1">
									<p className="text-xs text-muted-foreground">
										{probability.confidence} confidence estimate based on your profile
									</p>
									<div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
										<div
											className={`h-full rounded-full transition-all duration-700 ${
												probability.probabilityPct >= 65
													? "bg-emerald-500"
													: probability.probabilityPct >= 40
													? "bg-amber-500"
													: "bg-red-500"
											}`}
											style={{ width: `${probability.probabilityPct}%` }}
										/>
									</div>
								</div>
							</div>

							{/* Factors */}
							{probability.factors.length > 0 && (
								<div>
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Scoring Factors
									</h3>
									<div className="space-y-2">
										{probability.factors.map((f, i) => (
											<div key={i} className="rounded-lg border border-border bg-card p-3">
												<div className="flex items-center justify-between mb-1.5">
													<span className="text-sm font-medium">{f.factor}</span>
													<span className="text-xs text-muted-foreground">
														{Math.round(f.score * 100)}% · weight {Math.round(f.weight * 100)}%
													</span>
												</div>
												<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
													<div
														className={`h-full rounded-full ${
															f.score >= 0.7
																? "bg-emerald-500"
																: f.score >= 0.45
																? "bg-amber-500"
																: "bg-red-500"
														}`}
														style={{ width: `${f.score * 100}%` }}
													/>
												</div>
												<p className="mt-1 text-xs text-muted-foreground">{f.note}</p>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Weaknesses */}
							{probability.weaknesses.length > 0 && (
								<div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
									<h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
										Weaknesses
									</h3>
									<ul className="space-y-1">
										{probability.weaknesses.map((w, i) => (
											<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
												<AlertCircle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
												{w}
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Improvement */}
							{probability.improvementActions.length > 0 && (
								<div className="rounded-xl border border-border bg-muted/30 p-4">
									<h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										<TrendingUp className="size-3.5" /> How to Improve
									</h3>
									<ul className="space-y-1.5">
										{probability.improvementActions.map((a, i) => (
											<li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
												<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
												{a}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t border-border px-5 py-3 flex items-center justify-between">
					{scholarship.url ? (
						<a
							href={scholarship.url}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
						>
							Official website <ExternalLink className="size-3.5" />
						</a>
					) : (
						<span />
					)}
					<Button variant="outline" size="sm" onClick={onClose}>
						Close
					</Button>
				</div>
			</div>
		</div>
	);
}

// ── Scholarship Card ───────────────────────────────────────────────────────────

function ScholarshipCard({
	scholarship,
	eligibility,
	onOpenDetails,
}: {
	scholarship: ScholarshipItem;
	eligibility?: EligibilityResult;
	onOpenDetails: (s: ScholarshipItem) => void;
}) {
	const nextDeadline = scholarship.deadlines?.[0];
	const daysLeft = nextDeadline ? daysUntil(nextDeadline.deadline) : null;
	const isUrgent = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
	const isPast = daysLeft !== null && daysLeft < 0;

	return (
		<div className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
			{/* Accent band */}
			<div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
			<div className="p-5">
			<div className="mb-3 flex items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
						{scholarship.title}
					</h3>
					{scholarship.provider && (
						<p className="mt-0.5 text-sm text-muted-foreground truncate">
							{scholarship.provider}
						</p>
					)}
				</div>
				<div className="flex shrink-0 flex-col items-end gap-1.5">
					{scholarship.fundingType && (
						<span
							className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${fundingBadgeClass(
								scholarship.fundingType,
							)}`}
						>
							{scholarship.fundingType}
						</span>
					)}
					{eligibility && (
						<span
							className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${eligibilityBadgeClass(
								eligibility.status,
							)}`}
						>
							{eligibilityLabel(eligibility.status)}
						</span>
					)}
				</div>
			</div>

			{/* Meta row */}
			<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
				{scholarship.countryCode && (
					<span className="flex items-center gap-1">
						{countryFlag(scholarship.countryCode)}
						{COUNTRIES.find((c) => c.code === scholarship.countryCode)?.name ??
							scholarship.countryCode}
					</span>
				)}
				{!scholarship.countryCode && (
					<span className="flex items-center gap-1">
						<Globe className="size-3" /> Global
					</span>
				)}
				{scholarship.level && (
					<span className="flex items-center gap-1">
						<BookOpen className="size-3" />
						{LEVEL_LABELS[scholarship.level] ?? scholarship.level}
					</span>
				)}
				{scholarship.field && scholarship.field !== "All Fields" && (
					<span className="truncate max-w-[120px]">{scholarship.field}</span>
				)}
			</div>

			{/* Amount */}
			{scholarship.amount && (
				<p className="mb-3 text-sm font-medium text-foreground/90 flex items-center gap-1.5">
					<Award className="size-3.5 shrink-0 text-primary" />
					{scholarship.amount}
				</p>
			)}

			{/* Description */}
			{scholarship.description && (
				<p className="mb-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">
					{scholarship.description}
				</p>
			)}

			{/* Tags */}
			{scholarship.tags && scholarship.tags.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-1.5">
					{(scholarship.tags as string[]).slice(0, 4).map((tag) => (
						<span
							key={tag}
							className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
						>
							{tag}
						</span>
					))}
				</div>
			)}

			{/* Deadline */}
			{nextDeadline && (
				<div
					className={`mb-4 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
						isPast
							? "border-border bg-muted/30 text-muted-foreground line-through"
							: isUrgent
							? "border-red-500/25 bg-red-500/8 text-red-600 dark:text-red-400"
							: "border-border bg-muted/30 text-muted-foreground"
					}`}
				>
					<Calendar className="size-3.5 shrink-0" />
					<span>{nextDeadline.term}: {formatDeadline(nextDeadline.deadline)}</span>
					{!isPast && daysLeft !== null && (
						<span className="ml-auto font-medium">
							{isUrgent ? `${daysLeft}d left` : `${daysLeft}d`}
						</span>
					)}
					{isPast && <span className="ml-auto">Closed</span>}
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center gap-2 flex-wrap">
				<Button
					size="sm"
					variant="outline"
					className="flex-1 gap-1.5"
					onClick={() => onOpenDetails(scholarship)}
				>
					<ShieldCheck className="size-3.5" />
					Check Eligibility
				</Button>
				<Link
					href={`/app/scholarships/${scholarship.id}`}
					className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
				>
					Details
				</Link>
				{scholarship.url && (
					<a
						href={scholarship.url}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					>
						Apply <ExternalLink className="size-3" />
					</a>
				)}
			</div>

			{/* Data provenance */}
			{scholarship.lastVerified && (
				<p className="mt-3 text-[10px] text-muted-foreground/60 border-t border-border/50 pt-2">
					Verified {new Date(scholarship.lastVerified).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
					{scholarship.sourceUrl && (
						<> · <a href={scholarship.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-muted-foreground">source</a></>
					)}
				</p>
			)}
			</div>
		</div>
	);
}

// ── Upcoming Deadlines Strip ───────────────────────────────────────────────────

function DeadlinesStrip({ deadlines }: { deadlines: UpcomingDeadlineItem[] }) {
	if (!deadlines.length) return null;

	return (
		<div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
			<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
				<Bell className="size-4" /> Upcoming Deadlines (next 90 days)
			</h2>
			<div className="space-y-2">
				{deadlines.slice(0, 5).map((d) => {
					const days = daysUntil(d.deadline);
					return (
						<div
							key={d.id}
							className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/15 bg-background/60 px-3 py-2.5 text-xs"
						>
							<div className="flex-1 min-w-0">
								<p className="font-medium truncate">{d.scholarship.title}</p>
								<p className="text-muted-foreground">
									{d.scholarship.provider} · {d.term ?? "Application"}
								</p>
							</div>
							<div className="shrink-0 text-right">
								<p className="font-semibold text-amber-700 dark:text-amber-400">
									{days <= 0 ? "Closed" : `${days}d left`}
								</p>
								<p className="text-muted-foreground">{formatDeadline(d.deadline)}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ── Main Component ────────────────────────────────────────────────────────────

const FUND_TYPES = [
	{ value: "", label: "All Funding" },
	{ value: "full", label: "Full Funding" },
	{ value: "partial", label: "Partial" },
	{ value: "living", label: "Living Allowance" },
	{ value: "research", label: "Research Grant" },
];

const LEVELS = [
	{ value: "", label: "All Levels" },
	{ value: "BSC", label: "Bachelor's" },
	{ value: "MSC", label: "Master's" },
	{ value: "PHD", label: "PhD" },
];

export interface ScholarshipsClientProps {
	initialDeadlines: UpcomingDeadlineItem[];
	initialEligible: EligibleScholarshipItem[];
}

export default function ScholarshipsClient({
	initialDeadlines,
	initialEligible,
}: ScholarshipsClientProps) {
	const [results, setResults] = useState<ScholarshipListResult | null>(null);
	const [deadlines] = useState<UpcomingDeadlineItem[]>(initialDeadlines);
	const [eligible] = useState<EligibleScholarshipItem[]>(initialEligible);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);

	// Filters
	const [q, setQ] = useState("");
	const [countryCode, setCountryCode] = useState("");
	const [level, setLevel] = useState("");
	const [fundingType, setFundingType] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	// Modal
	const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipItem | null>(null);

	// Active tab
	const [activeTab, setActiveTab] = useState<"all" | "eligible">("all");

	const inputRef = useRef<HTMLInputElement>(null);

	const fetchScholarships = useCallback(
		async (overridePage?: number) => {
			setLoading(true);
			setError(null);
			const params: Record<string, string> = {
				page: String(overridePage ?? page),
				limit: "18",
			};
			if (q.trim()) params.q = q.trim();
			if (countryCode) params.countryCode = countryCode;
			if (level) params.level = level;
			if (fundingType) params.fundingType = fundingType;

			try {
				const data = await searchScholarships(params);
				if (!data) throw new Error("Failed to fetch scholarships");
				setResults(data);
			} catch {
				setError("Failed to load scholarships. Please try again.");
			} finally {
				setLoading(false);
			}
		},
		[q, countryCode, level, fundingType, page],
	);

	// Initial load
	useEffect(() => {
		void fetchScholarships(1);
		setPage(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [countryCode, level, fundingType]);

	const handleSearch = async (e: FormEvent) => {
		e.preventDefault();
		setPage(1);
		await fetchScholarships(1);
	};

	const handlePageChange = async (newPage: number) => {
		setPage(newPage);
		await fetchScholarships(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const totalPages = results ? Math.ceil(results.total / results.limit) : 0;

	// Map eligible scholarships by ID for quick lookup
	const eligibleMap = new Map(
		eligible.map((e) => [e.scholarship.id, e.eligibility]),
	);

	return (
		<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
			{/* Header */}
			<FadeIn className="mb-8">
				<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
						<p className="mt-1 text-muted-foreground">
							Discover global funding opportunities matched to your profile.
						</p>
					</div>
					{results && (
						<p className="mt-1 text-xs text-muted-foreground sm:mt-2 shrink-0">
							{results.total.toLocaleString()} scholarships found
						</p>
					)}
				</div>
			</FadeIn>

			{/* Data freshness notice */}
			{results && results.items.length > 0 && (() => {
				const latestUpdate = results.items
					.map(s => s.updatedAt ? new Date(s.updatedAt).getTime() : 0)
					.reduce((a, b) => Math.max(a, b), 0);
				if (!latestUpdate) return null;
				const daysAgo = Math.floor((Date.now() - latestUpdate) / (1000 * 60 * 60 * 24));
				const label = daysAgo === 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo} days ago`;
				return (
					<div className="mb-4 flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-2.5">
						<RefreshCw className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
						<p className="text-xs text-blue-700 dark:text-blue-400">
							Scholarship data last synced <span className="font-medium">{label}</span>.
							Individual scholarship cards show source verification dates.
							Always confirm deadlines on the official scholarship website before applying.
						</p>
					</div>
				);
			})()}

			{/* Upcoming Deadlines */}
			{deadlines.length > 0 && (
				<Reveal className="mb-6">
					<DeadlinesStrip deadlines={deadlines} />
				</Reveal>
			)}

			{/* Search + filters */}
			<Reveal>
				<div className="mb-6 space-y-3">
					<form onSubmit={handleSearch} className="flex gap-2">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								ref={inputRef}
								value={q}
								onChange={(e) => setQ(e.target.value)}
								placeholder="Search scholarships by name, field, or provider..."
								className="pl-9"
							/>
						</div>
						<Button type="submit" disabled={loading} className="gap-2 shrink-0">
							{loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
							Search
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => setShowFilters((v) => !v)}
							className={showFilters ? "border-primary text-primary" : ""}
							aria-label="Toggle filters"
						>
							<SlidersHorizontal className="size-4" />
						</Button>
					</form>

					{showFilters && (
						<div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card px-4 py-3">
							<div className="flex flex-col gap-1 min-w-[160px]">
								<label className="text-xs font-medium text-muted-foreground">Country</label>
								<select
									value={countryCode}
									onChange={(e) => setCountryCode(e.target.value)}
									className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								>
									<option value="">All Countries</option>
									{COUNTRIES.map((c) => (
										<option key={c.code} value={c.code}>
											{c.flag} {c.name}
										</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-1 min-w-[140px]">
								<label className="text-xs font-medium text-muted-foreground">Level</label>
								<select
									value={level}
									onChange={(e) => setLevel(e.target.value)}
									className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								>
									{LEVELS.map((l) => (
										<option key={l.value} value={l.value}>
											{l.label}
										</option>
									))}
								</select>
							</div>
							<div className="flex flex-col gap-1 min-w-[150px]">
								<label className="text-xs font-medium text-muted-foreground">Funding Type</label>
								<select
									value={fundingType}
									onChange={(e) => setFundingType(e.target.value)}
									className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								>
									{FUND_TYPES.map((f) => (
										<option key={f.value} value={f.value}>
											{f.label}
										</option>
									))}
								</select>
							</div>
							{(countryCode || level || fundingType) && (
								<div className="flex items-end">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="gap-1.5 text-muted-foreground"
										onClick={() => {
											setCountryCode("");
											setLevel("");
											setFundingType("");
										}}
									>
										<X className="size-3.5" /> Clear filters
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			</Reveal>

			{/* Tabs */}
			<div className="mb-5 flex border-b border-border">
				<button
					onClick={() => setActiveTab("all")}
					className={`px-4 py-2.5 text-sm font-medium transition-colors ${
						activeTab === "all"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					All Scholarships
					{results && (
						<span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
							{results.total}
						</span>
					)}
				</button>
				<button
					onClick={() => setActiveTab("eligible")}
					className={`px-4 py-2.5 text-sm font-medium transition-colors ${
						activeTab === "eligible"
							? "border-b-2 border-primary text-primary"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					My Matches
					{eligible.length > 0 && (
						<span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
							{eligible.length}
						</span>
					)}
				</button>
			</div>

			{/* Error */}
			{error && (
				<div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					<AlertCircle className="size-4 shrink-0" />
					{error}
					<Button
						size="sm"
						variant="ghost"
						className="ml-auto"
						onClick={() => fetchScholarships(1)}
					>
						<RefreshCw className="size-3.5" />
					</Button>
				</div>
			)}

			{/* Loading skeletons */}
			{loading && (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
				</div>
			)}

			{/* All scholarships tab */}
			{!loading && activeTab === "all" && (
				<>
					{!results || results.items.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
							<CircleDashed className="mb-4 size-12 text-muted-foreground/40" />
							<h2 className="text-lg font-semibold">No scholarships found</h2>
							<p className="mt-1 max-w-sm text-sm text-muted-foreground">
								Try adjusting your search filters or clearing the query.
							</p>
							<Button
								variant="outline"
								className="mt-5"
								onClick={() => {
									setQ("");
									setCountryCode("");
									setLevel("");
									setFundingType("");
									setPage(1);
									void fetchScholarships(1);
								}}
							>
								Reset filters
							</Button>
						</div>
					) : (
						<>
							<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
								{results.items.map((s) => (
									<ScholarshipCard
										key={s.id}
										scholarship={s}
										eligibility={eligibleMap.get(s.id)}
										onOpenDetails={setSelectedScholarship}
									/>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="mt-8 flex items-center justify-center gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={page === 1}
										onClick={() => handlePageChange(page - 1)}
									>
										Previous
									</Button>
									<span className="text-sm text-muted-foreground">
										Page {page} of {totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										disabled={page >= totalPages}
										onClick={() => handlePageChange(page + 1)}
									>
										Next
									</Button>
								</div>
							)}
						</>
					)}
				</>
			)}

			{/* Eligible tab */}
			{!loading && activeTab === "eligible" && (
				<>
					{eligible.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
							<ShieldCheck className="mb-4 size-12 text-muted-foreground/40" />
							<h2 className="text-lg font-semibold">No matches yet</h2>
							<p className="mt-1 max-w-sm text-sm text-muted-foreground">
								Complete your profile with GPA, test scores, and funding preferences to see
								personalised eligibility matches.
							</p>
							<Button asChild className="mt-5">
								<a href="/app/profile">Update Profile</a>
							</Button>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{eligible.map(({ scholarship, eligibility }) => (
								<ScholarshipCard
									key={scholarship.id}
									scholarship={scholarship}
									eligibility={eligibility}
									onOpenDetails={setSelectedScholarship}
								/>
							))}
						</div>
					)}
				</>
			)}

			{/* Eligibility modal */}
			{selectedScholarship && (
				<EligibilityModal
					scholarship={selectedScholarship}
					onClose={() => setSelectedScholarship(null)}
				/>
			)}
		</div>
	);
}
