"use client";

import { useState, useTransition } from "react";
import {
	AlertCircle,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	Clock,
	ExternalLink,
	Loader2,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { generateGapFixAction, type GapFixResult, type GapFixRecommendation } from "@/lib/auth/action";

const PRIORITY_STYLES = {
	high: "border-red-500/30 bg-red-500/5",
	medium: "border-amber-500/30 bg-amber-500/5",
	low: "border-emerald-500/30 bg-emerald-500/5",
};

const PRIORITY_BADGE = {
	high: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
	medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
	low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
};

function ScoreRing({ score }: { score: number }) {
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 100) * circumference;
	const color = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg width={100} height={100} className="-rotate-90">
				<circle cx={50} cy={50} r={radius} fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/30" />
				<circle
					cx={50}
					cy={50}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={8}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					style={{ transition: "stroke-dashoffset 1s ease" }}
				/>
			</svg>
			<div className="absolute flex flex-col items-center">
				<span className="text-xl font-bold" style={{ color }}>{score}</span>
				<span className="text-[10px] text-muted-foreground">/100</span>
			</div>
		</div>
	);
}

function RecommendationCard({ rec }: { rec: GapFixRecommendation }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className={`rounded-xl border p-4 transition-all ${PRIORITY_STYLES[rec.priority]}`}>
			<button
				type="button"
				onClick={() => setExpanded((v) => !v)}
				className="flex w-full items-start gap-3 text-left"
			>
				<div className="flex flex-col flex-1 gap-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_BADGE[rec.priority]}`}>
							{rec.priority} priority
						</span>
						<span className="text-[11px] text-muted-foreground">{rec.category}</span>
						<span className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1">
							<Clock className="h-3 w-3" />
							~{rec.timelineWeeks}w
						</span>
					</div>
					<p className="text-sm font-semibold">{rec.title}</p>
					<p className="text-xs text-muted-foreground line-clamp-2">{rec.description}</p>
				</div>
				{expanded ? (
					<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
				) : (
					<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
				)}
			</button>

			{expanded && (
				<div className="mt-4 space-y-3 border-t border-border/50 pt-3">
					{rec.actions.length > 0 && (
						<div>
							<p className="mb-1.5 text-xs font-semibold text-foreground">Action steps</p>
							<ul className="space-y-1">
								{rec.actions.map((action, i) => (
									<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
										<CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
										{action}
									</li>
								))}
							</ul>
						</div>
					)}
					{rec.resources.length > 0 && (
						<div>
							<p className="mb-1.5 text-xs font-semibold text-foreground">Recommended resources</p>
							<div className="flex flex-wrap gap-1.5">
								{rec.resources.map((r, i) => (
									<span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
										<ExternalLink className="h-3 w-3" />
										{r}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function GapFixPage() {
	const [result, setResult] = useState<GapFixResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleAnalyze() {
		setError(null);
		startTransition(async () => {
			const res = await generateGapFixAction();
			if (!res) {
				setError("Analysis failed. Please complete your profile first, then try again.");
				return;
			}
			setResult(res);
		});
	}

	const highPriority = result?.recommendations.filter((r) => r.priority === "high") ?? [];
	const otherPriority = result?.recommendations.filter((r) => r.priority !== "high") ?? [];

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Zap className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Gap Fix Recommender</h1>
						<p className="text-sm text-muted-foreground">
							AI analysis of your profile weaknesses with concrete improvement actions
						</p>
					</div>
				</div>
			</FadeIn>

			{!result ? (
				<div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<Sparkles className="h-8 w-8 text-primary" />
					</div>
					<h3 className="mb-2 font-semibold">Profile Gap Analysis</h3>
					<p className="max-w-sm text-sm text-muted-foreground mb-6">
						We&apos;ll analyze your academic profile, test scores, experience, and goals to identify weaknesses and give you a concrete improvement roadmap.
					</p>
					<Button onClick={handleAnalyze} disabled={isPending} size="lg" className="gap-2">
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
						{isPending ? "Analyzing your profile…" : "Analyze My Profile"}
					</Button>
					{error && (
						<div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</div>
					)}
					<p className="mt-4 text-xs text-muted-foreground">Complete your profile for the most accurate recommendations</p>
				</div>
			) : (
				<FadeIn>
					<div className="space-y-6">
						{/* Profile Score Overview */}
						<div className="rounded-xl border border-border bg-card p-6">
							<div className="flex flex-col sm:flex-row items-center gap-6">
								<ScoreRing score={result.profileScore} />
								<div className="flex-1 text-center sm:text-left">
									<h2 className="text-lg font-semibold mb-1">Profile Competitiveness Score</h2>
									<p className="text-sm text-muted-foreground mb-3">{result.prioritySummary}</p>
									<div className="flex flex-wrap gap-2 justify-center sm:justify-start">
										<span className="text-xs text-muted-foreground">
											{result.weaknesses.length} gap{result.weaknesses.length !== 1 ? "s" : ""} found
										</span>
										<span className="text-muted-foreground">·</span>
										<span className="text-xs text-muted-foreground">
											{result.recommendations.length} recommendation{result.recommendations.length !== 1 ? "s" : ""}
										</span>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleAnalyze}
									disabled={isPending}
									className="gap-1.5 shrink-0"
								>
									{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
									Re-analyze
								</Button>
							</div>
						</div>

						{/* Strengths & Weaknesses */}
						<div className="grid gap-4 sm:grid-cols-2">
							{result.strengths.length > 0 && (
								<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
									<h3 className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
										<CheckCircle className="h-4 w-4" />
										Strengths ({result.strengths.length})
									</h3>
									<ul className="space-y-1.5">
										{result.strengths.map((s, i) => (
											<li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
												<span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
												{s}
											</li>
										))}
									</ul>
								</div>
							)}
							{result.weaknesses.length > 0 && (
								<div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
									<h3 className="mb-3 text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
										<AlertCircle className="h-4 w-4" />
										Gaps Identified ({result.weaknesses.length})
									</h3>
									<ul className="space-y-1.5">
										{result.weaknesses.map((w, i) => (
											<li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
												<span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
												{w}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{/* High Priority First */}
						{highPriority.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
									<TrendingUp className="h-4 w-4 text-red-500" />
									High Priority Actions
								</h3>
								<div className="space-y-3">
									{highPriority.map((rec, i) => (
										<RecommendationCard key={i} rec={rec} />
									))}
								</div>
							</div>
						)}

						{/* Other priorities */}
						{otherPriority.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold">Additional Recommendations</h3>
								<div className="space-y-3">
									{otherPriority.map((rec, i) => (
										<RecommendationCard key={i} rec={rec} />
									))}
								</div>
							</div>
						)}

						<p className="text-xs text-muted-foreground text-center">
							AI-generated recommendations based on your profile — complete your profile for more accurate results
						</p>
					</div>
				</FadeIn>
			)}
		</div>
	);
}
