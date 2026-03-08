"use client";

import { useState, useTransition } from "react";
import {
	Target, RefreshCw, Loader2, AlertCircle,
	CheckSquare, Square, ShieldAlert, ListChecks,
	TrendingUp, Info, MapPin, ChevronDown, ChevronRight,
	FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateStrategy, getLatestStrategy } from "@/lib/auth/action";
import { FadeIn } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import { COUNTRIES } from "@/lib/data/countries";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Risk {
	risk: string;
	severity: "High" | "Medium" | "Low";
	mitigation: string;
}

interface Action {
	title: string;
	timeframe: string;
	steps: string[];
}

interface AdmissionChances {
	band: "High" | "Medium" | "Low";
	confidence: number;
	explanation: string;
}

interface StrategyReport {
	id: string;
	countryCode: string;
	intake?: string;
	report: {
		summary: string;
		whyThisCountryFits: string[];
		admissionChances: AdmissionChances;
		riskAssessment: Risk[];
		recommendedActions: Action[];
		documentChecklist: string[];
		disclaimer: string;
	};
	cacheKey: string;
	createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEVERITY_CLASSES: Record<string, string> = {
	High: "border-red-500/30 bg-red-500/10 text-red-500",
	Medium: "border-amber-500/30 bg-amber-500/10 text-amber-500",
	Low: "border-blue-500/30 bg-blue-500/10 text-blue-500",
};

const BAND_CLASSES: Record<string, string> = {
	High: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
	Medium: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
	Low: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
};

const INTAKES = [
	"Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionAccordion({ action }: { action: Action }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="rounded-lg border border-border bg-card overflow-hidden">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
			>
				<div className="flex items-center gap-2">
					<span className="font-medium text-sm">{action.title}</span>
					<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
						{action.timeframe}
					</span>
				</div>
				{open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
			</button>
			{open && (
				<ul className="border-t border-border divide-y divide-border">
					{action.steps.map((step, i) => (
						<li key={i} className="flex gap-2.5 px-4 py-2.5 text-sm">
							<span className="mt-px font-mono text-xs text-muted-foreground shrink-0">{i + 1}.</span>
							{step}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function Checklist({ items }: { items: string[] }) {
	const [checked, setChecked] = useState<Set<number>>(new Set());
	const toggle = (i: number) =>
		setChecked((prev) => {
			const next = new Set(prev);
			next.has(i) ? next.delete(i) : next.add(i);
			return next;
		});

	return (
		<ul className="space-y-2">
			{items.map((item, i) => (
				<li
					key={i}
					onClick={() => toggle(i)}
					className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted/30 transition-colors"
				>
					{checked.has(i) ? (
						<CheckSquare className="mt-0.5 size-4 shrink-0 text-primary" />
					) : (
						<Square className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
					)}
					<span className={checked.has(i) ? "line-through text-muted-foreground" : ""}>{item}</span>
				</li>
			))}
		</ul>
	);
}

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
	return (
		<div className="space-y-3 animate-pulse">
			{Array.from({ length: lines }).map((_, i) => (
				<div key={i} className="h-4 rounded bg-muted" style={{ width: `${70 + (i % 3) * 10}%` }} />
			))}
		</div>
	);
}

// ── Main component ───────────────────────────────────────────────────────────

export default function StrategyReportClient({
	initialReport,
	defaultCountry,
}: {
	initialReport: StrategyReport | null;
	defaultCountry: string;
}) {
	const [report, setReport] = useState<StrategyReport | null>(initialReport);
	const [countryCode, setCountryCode] = useState(defaultCountry || "US");
	const [intake, setIntake] = useState(initialReport?.intake ?? "");
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const handleGenerate = () => {
		setError(null);
		startTransition(async () => {
			const result = await generateStrategy(countryCode, intake || undefined);
			if (!result.success) {
				setError(result.message ?? "Unknown error");
				return;
			}
			const latest = await getLatestStrategy(countryCode);
			if (latest) setReport(latest as StrategyReport);
		});
	};

	const handleCountryChange = (code: string) => {
		setCountryCode(code);
		setReport(null);
		startTransition(async () => {
			const latest = await getLatestStrategy(code);
			if (latest) setReport(latest as StrategyReport);
		});
	};

	const r = report?.report;
	const countryName = COUNTRIES.find((c) => c.code === countryCode)?.name ?? countryCode;

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
			{/* Header */}
			<FadeIn className="mb-8">
				<div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Application Strategy</h1>
						<p className="mt-1 text-muted-foreground">
							AI-generated guidance tailored to your profile and target country.
						</p>
					</div>
					{report && (
						<p className="text-xs text-muted-foreground mt-1 sm:mt-2 shrink-0">
							Generated {new Date(report.createdAt).toLocaleDateString("en-US", {
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
						<Button
							onClick={handleGenerate}
							disabled={isPending}
							className="gap-2 whitespace-nowrap"
						>
							{isPending ? (
								<><Loader2 className="size-4 animate-spin" /> Generating...</>
							) : (
								<><RefreshCw className="size-4" /> Generate Strategy</>
							)}
						</Button>
					</div>
				</div>
			</Reveal>

			{/* Error */}
			{error && (
				<div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					<AlertCircle className="size-4 shrink-0" />
					{error}
				</div>
			)}

			{/* Empty state */}
			{!isPending && !error && !r && (
				<Reveal>
					<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
						<Target className="mb-4 size-12 text-muted-foreground/40" />
						<h2 className="text-lg font-semibold">No strategy yet</h2>
						<p className="mt-1 max-w-xs text-sm text-muted-foreground">
							Save programs to your shortlist, then click <strong>Generate Strategy</strong> for an AI-powered plan.
						</p>
						<div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
							<MapPin className="size-3.5" />
							For <strong>{countryName}</strong>
						</div>
					</div>
				</Reveal>
			)}

			{/* Loading */}
			{isPending && (
				<div className="space-y-5">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="rounded-xl border border-border bg-card p-5">
							<div className="mb-3 h-5 w-40 rounded bg-muted animate-pulse" />
							<SkeletonBlock lines={i % 2 === 0 ? 3 : 2} />
						</div>
					))}
				</div>
			)}

			{/* Report */}
			{!isPending && r && (
				<div className="space-y-5">
					{/* Country banner */}
					<div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
						<MapPin className="size-4 shrink-0" />
						Strategy for <strong>{countryName}</strong>
						{report?.intake && <> · Intake: <strong>{report.intake}</strong></>}
					</div>

					{/* Summary */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-2 flex items-center gap-2 font-semibold">
							<FileText className="size-4 text-primary" /> Summary
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
					</section>

					{/* Why this country */}
					{r.whyThisCountryFits?.length > 0 && (
						<section className="rounded-xl border border-border bg-card p-5">
							<h2 className="mb-3 flex items-center gap-2 font-semibold">
								<TrendingUp className="size-4 text-primary" /> Why {countryName} Fits You
							</h2>
							<ul className="space-y-2">
								{r.whyThisCountryFits.map((point, i) => (
									<li key={i} className="flex items-start gap-2 text-sm">
										<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
										{point}
									</li>
								))}
							</ul>
						</section>
					)}

					{/* Admission chances */}
					{r.admissionChances && (
						<section className="rounded-xl border border-border bg-card p-5">
							<h2 className="mb-3 flex items-center gap-2 font-semibold">
								<Target className="size-4 text-primary" /> Admission Chances
							</h2>
							<div className="flex items-start gap-4">
								<div className={`flex flex-col items-center rounded-xl border px-6 py-4 ${BAND_CLASSES[r.admissionChances.band] ?? ""}`}>
									<span className="text-2xl font-bold">{r.admissionChances.band}</span>
									<span className="text-xs font-medium opacity-80">
										{r.admissionChances.confidence}% confidence
									</span>
								</div>
								<p className="flex-1 text-sm leading-relaxed text-muted-foreground">
									{r.admissionChances.explanation}
								</p>
							</div>
						</section>
					)}

					{/* Risk assessment */}
					{r.riskAssessment?.length > 0 && (
						<section className="rounded-xl border border-border bg-card p-5">
							<h2 className="mb-3 flex items-center gap-2 font-semibold">
								<ShieldAlert className="size-4 text-primary" /> Risk Assessment
							</h2>
							<div className="overflow-auto">
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
											<th className="pb-2 pr-4">Risk</th>
											<th className="pb-2 pr-4">Severity</th>
											<th className="pb-2">Mitigation</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{r.riskAssessment.map((item, i) => (
											<tr key={i}>
												<td className="py-2.5 pr-4 align-top font-medium">{item.risk}</td>
												<td className="py-2.5 pr-4 align-top">
													<span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_CLASSES[item.severity] ?? ""}`}>
														{item.severity}
													</span>
												</td>
												<td className="py-2.5 align-top text-muted-foreground">{item.mitigation}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					)}

					{/* Recommended actions */}
					{r.recommendedActions?.length > 0 && (
						<section className="rounded-xl border border-border bg-card p-5">
							<h2 className="mb-3 flex items-center gap-2 font-semibold">
								<ListChecks className="size-4 text-primary" /> Action Plan
							</h2>
							<div className="space-y-2">
								{r.recommendedActions.map((action, i) => (
									<ActionAccordion key={i} action={action} />
								))}
							</div>
						</section>
					)}

					{/* Document checklist */}
					{r.documentChecklist?.length > 0 && (
						<section className="rounded-xl border border-border bg-card p-5">
							<h2 className="mb-3 flex items-center gap-2 font-semibold">
								<ListChecks className="size-4 text-primary" /> Document Checklist
							</h2>
							<Checklist items={r.documentChecklist} />
						</section>
					)}

					{/* Disclaimer */}
					{r.disclaimer && (
						<div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
							<Info className="mt-0.5 size-3.5 shrink-0" />
							{r.disclaimer}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
