"use client";

import { useState, useTransition } from "react";
import {
	AlertCircle,
	Briefcase,
	DollarSign,
	Globe,
	Loader2,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { predictCareerAction, type CareerResult } from "@/lib/auth/action";

const OUTLOOK_STYLES = {
	Excellent: { badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", bar: "bg-emerald-500" },
	Good: { badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30", bar: "bg-blue-500" },
	Moderate: { badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", bar: "bg-amber-500" },
	Challenging: { badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30", bar: "bg-red-500" },
};

const RATING_BADGE: Record<string, string> = {
	Strong: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	Good: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
	Moderate: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
	Weak: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const DEMAND_BADGE: Record<string, string> = {
	High: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	Medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
	Low: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export default function CareerPage() {
	const [result, setResult] = useState<CareerResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handlePredict() {
		setError(null);
		startTransition(async () => {
			const res = await predictCareerAction();
			if (!res) {
				setError("Prediction failed. Please complete your profile and try again.");
				return;
			}
			setResult(res);
		});
	}

	const outlookStyle = result ? OUTLOOK_STYLES[result.overallOutlook] : null;

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<TrendingUp className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Career Outcome Predictor</h1>
						<p className="text-sm text-muted-foreground">
							Job market outlook, employability factors, and career pathways for your field and target country
						</p>
					</div>
				</div>
			</FadeIn>

			{!result ? (
				<div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<TrendingUp className="h-8 w-8 text-primary" />
					</div>
					<h3 className="mb-2 font-semibold">Predict Your Career Outcomes</h3>
					<p className="max-w-sm text-sm text-muted-foreground mb-6">
						Get a data-grounded assessment of job market demand, salary ranges, career pathways, and employability factors based on your field and target country.
					</p>
					<Button onClick={handlePredict} disabled={isPending} size="lg" className="gap-2">
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
						{isPending ? "Analyzing career outlook…" : "Predict My Career Outcomes"}
					</Button>
					{error && (
						<div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</div>
					)}
					<p className="mt-4 text-xs text-muted-foreground">Based on your profile — complete your profile for more accurate predictions</p>
				</div>
			) : (
				<FadeIn>
					<div className="space-y-6">
						{/* Overall Outlook Card */}
						<div className="rounded-xl border border-border bg-card p-6">
							<div className="flex flex-col sm:flex-row gap-6 items-start">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<Globe className="h-5 w-5 text-muted-foreground" />
										<span className="text-sm text-muted-foreground">{result.topCountry}</span>
										<span className={`ml-auto rounded-full border px-3 py-1 text-xs font-semibold ${outlookStyle?.badge}`}>
											{result.overallOutlook} Outlook
										</span>
									</div>
									<h2 className="text-lg font-semibold mb-2">Employability Overview</h2>
									<p className="text-sm text-muted-foreground mb-4">{result.outlookSummary}</p>
									{/* Score bar */}
									<div>
										<div className="flex items-center justify-between mb-1.5">
											<span className="text-xs text-muted-foreground">Employability Score</span>
											<span className="text-sm font-semibold">{result.employabilityScore}/100</span>
										</div>
										<div className="h-2 rounded-full bg-muted overflow-hidden">
											<div
												className={`h-full rounded-full transition-all ${outlookStyle?.bar}`}
												style={{ width: `${result.employabilityScore}%` }}
											/>
										</div>
									</div>
								</div>
								<Button variant="outline" size="sm" onClick={handlePredict} disabled={isPending} className="gap-1.5 shrink-0">
									{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
									Re-analyze
								</Button>
							</div>
						</div>

						{/* Factors */}
						{result.factors.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold">Employability Factors</h3>
								<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{result.factors.map((f, i) => (
										<div key={i} className="rounded-xl border border-border bg-card p-4">
											<div className="flex items-center justify-between mb-2">
												<p className="text-xs font-semibold">{f.factor}</p>
												<span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${RATING_BADGE[f.rating] ?? RATING_BADGE.Moderate}`}>
													{f.rating}
												</span>
											</div>
											<p className="text-xs text-muted-foreground">{f.explanation}</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Career Pathways */}
						{result.pathways.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
									<Briefcase className="h-4 w-4 text-primary" />
									Career Pathways
								</h3>
								<div className="space-y-3">
									{result.pathways.map((p, i) => (
										<div key={i} className="rounded-xl border border-border bg-card p-4">
											<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
												<div className="flex-1">
													<p className="text-sm font-semibold">{p.role}</p>
													<p className="text-xs text-muted-foreground">{p.sector}</p>
												</div>
												<div className="flex items-center gap-3 flex-wrap">
													<span className="flex items-center gap-1 text-xs text-muted-foreground">
														<DollarSign className="h-3.5 w-3.5" />
														{p.salaryRangeUsd}
													</span>
													<span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${DEMAND_BADGE[p.demandLevel]}`}>
														{p.demandLevel} demand
													</span>
													<span className="text-xs text-muted-foreground">{p.timeToEntry}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Skills to Add */}
						{result.keySkillsToAdd.length > 0 && (
							<div className="rounded-xl border border-border bg-card p-5">
								<h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
									<Zap className="h-4 w-4 text-primary" />
									Key Skills to Add
								</h3>
								<div className="flex flex-wrap gap-2">
									{result.keySkillsToAdd.map((skill, i) => (
										<span key={i} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
											{skill}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Industry Trends */}
						{result.industryTrends.length > 0 && (
							<div className="rounded-xl border border-border bg-card p-5">
								<h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
									<TrendingUp className="h-4 w-4 text-primary" />
									Industry Trends
								</h3>
								<ul className="space-y-2">
									{result.industryTrends.map((trend, i) => (
										<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
											<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
											{trend}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
							<p className="text-xs text-amber-700 dark:text-amber-400">{result.disclaimer}</p>
						</div>
					</div>
				</FadeIn>
			)}
		</div>
	);
}
