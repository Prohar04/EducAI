"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";

const ImmigrationAnimation = dynamic(
	() => import("@/components/animations/immigration-animation"),
	{ ssr: false, loading: () => null },
);
import {
	AlertCircle,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	ExternalLink,
	Loader2,
	Plane,
	Sparkles,
	Star,
	XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
	getImmigrationGuideAction,
	type ImmigrationResult,
	type CountryPathway,
	type ImmigrationStep,
} from "@/lib/auth/action";

const FEASIBILITY_STYLES = {
	High: { badge: "bg-[#3D9970]/10 text-[#3D9970] border-[#3D9970]/30", dot: "bg-[#3D9970]" },
	Medium: { badge: "bg-[#C49A3C]/10 text-[#C49A3C] border-[#C49A3C]/30", dot: "bg-[#C49A3C]" },
	Low: { badge: "bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/30", dot: "bg-[#C0392B]" },
};

function StepCard({ step, index }: { step: ImmigrationStep; index: number }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative pl-8">
			{/* Timeline line */}
			<div className="absolute left-3 top-6 bottom-0 w-px bg-border" />
			{/* Circle */}
			<div className="absolute left-0 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-[11px] font-bold text-primary">
				{index + 1}
			</div>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-full rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 transition-colors"
			>
				<div className="flex items-start gap-3">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-0.5">
							<span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
								{step.phase}
							</span>
							<span className="text-xs text-muted-foreground">{step.typicalDuration}</span>
						</div>
						<p className="text-sm font-semibold">{step.title}</p>
						<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{step.description}</p>
					</div>
					{open ? (
						<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
					) : (
						<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
					)}
				</div>
				{open && (
					<div className="mt-4 space-y-3 border-t border-border/50 pt-3">
						<p className="text-xs text-muted-foreground">{step.description}</p>
						{step.keyCriteria.length > 0 && (
							<div>
								<p className="mb-1.5 text-xs font-semibold">Key criteria</p>
								<ul className="space-y-1">
									{step.keyCriteria.map((c, i) => (
										<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
											<CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#3D9970]" />
											{c}
										</li>
									))}
								</ul>
							</div>
						)}
						{step.pitfalls.length > 0 && (
							<div>
								<p className="mb-1.5 text-xs font-semibold">Common pitfalls</p>
								<ul className="space-y-1">
									{step.pitfalls.map((p, i) => (
										<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
											<XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#C0392B]" />
											{p}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				)}
			</button>
		</div>
	);
}

function PathwayCard({ pathway, isBest }: { pathway: CountryPathway; isBest: boolean }) {
	const [open, setOpen] = useState(false);
	const fs = FEASIBILITY_STYLES[pathway.overallFeasibility];

	return (
		<div className={`rounded-xl border ${isBest ? "border-primary/40 bg-primary/5" : "border-border bg-card"} overflow-hidden`}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="w-full p-5 text-left"
			>
				<div className="flex items-start gap-4">
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-2 flex-wrap">
							{isBest && (
								<span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
									<Star className="h-3 w-3" />
									Best Fit
								</span>
							)}
							<span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${fs.badge}`}>
								{pathway.overallFeasibility} Feasibility
							</span>
						</div>
						<h3 className="font-semibold">{pathway.countryName}</h3>
						<p className="text-xs text-muted-foreground mt-1">{pathway.feasibilityReason}</p>
					</div>
					{open ? (
						<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
					) : (
						<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground mt-1" />
					)}
				</div>
				<div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
					{[
						{ label: "Study Visa", value: pathway.studyVisaType },
						{ label: "Post-Study Work", value: pathway.postStudyWorkVisa },
						{ label: "Work Duration", value: pathway.postStudyWorkDuration },
						{ label: "PR Timeline", value: pathway.prTimeline },
					].map(({ label, value }) => (
						<div key={label}>
							<p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
							<p className="text-xs font-medium mt-0.5">{value}</p>
						</div>
					))}
				</div>
			</button>

			{open && (
				<div className="border-t border-border px-5 pb-5 space-y-5">
					{/* PR Pathway */}
					<div className="pt-4">
						<p className="text-xs font-semibold mb-1">PR Pathway</p>
						<p className="text-xs text-muted-foreground">{pathway.prPathway}</p>
					</div>

					{/* Steps */}
					{pathway.steps.length > 0 && (
						<div>
							<p className="text-xs font-semibold mb-3">Step-by-Step Pathway</p>
							<div className="space-y-3">
								{pathway.steps.map((step, i) => (
									<StepCard key={i} step={step} index={i} />
								))}
							</div>
						</div>
					)}

					{/* Advantages & Challenges */}
					<div className="grid sm:grid-cols-2 gap-4">
						{pathway.advantages.length > 0 && (
							<div>
								<p className="text-xs font-semibold mb-2 text-[#3D9970]">Advantages</p>
								<ul className="space-y-1">
									{pathway.advantages.map((a, i) => (
										<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
											<CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#3D9970]" />
											{a}
										</li>
									))}
								</ul>
							</div>
						)}
						{pathway.challenges.length > 0 && (
							<div>
								<p className="text-xs font-semibold mb-2 text-[#C49A3C]">Challenges</p>
								<ul className="space-y-1">
									{pathway.challenges.map((c, i) => (
										<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
											<AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#C49A3C]" />
											{c}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					<a
						href={pathway.officialSource}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
					>
						<ExternalLink className="h-3.5 w-3.5" />
						Official immigration source
					</a>
				</div>
			)}
		</div>
	);
}

export default function ImmigrationPage() {
	const [result, setResult] = useState<ImmigrationResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleGetGuide() {
		setError(null);
		startTransition(async () => {
			const res = await getImmigrationGuideAction();
			if (!res) {
				setError("Failed to generate guidance. Please complete your profile first.");
				return;
			}
			setResult(res);
		});
	}

	return (
		<div className="page-enter mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div style={{ position: "relative" }}>
					<div
						aria-hidden="true"
						className="hidden md:block"
						style={{
							position: "absolute",
							right: 0,
							top: "50%",
							transform: "translateY(-50%)",
							width: 340,
							height: 180,
							opacity: 0.65,
							pointerEvents: "none",
							zIndex: 0,
						}}
					>
						<ImmigrationAnimation />
					</div>
					<div
						className="flex items-center gap-3 mb-1"
						style={{ position: "relative", zIndex: 1 }}
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
							<Plane className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight">PR & Immigration Guide</h1>
							<p className="text-sm text-muted-foreground">
								Study visa, post-study work rights, and permanent residency pathways for your target countries
							</p>
						</div>
					</div>
				</div>
			</FadeIn>

			{!result ? (
				<div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<Plane className="h-8 w-8 text-primary" />
					</div>
					<h3 className="mb-2 font-semibold">Immigration Pathway Analysis</h3>
					<p className="max-w-sm text-sm text-muted-foreground mb-6">
						Get country-specific guidance on study visas, post-graduation work permits, and permanent residency pathways tailored to your profile and target countries.
					</p>
					<Button onClick={handleGetGuide} disabled={isPending} size="lg" className="gap-2">
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
						{isPending ? "Generating your guide…" : "Get Immigration Guide"}
					</Button>
					{error && (
						<div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</div>
					)}
					<p className="mt-4 text-xs text-muted-foreground">Set your target countries in your profile for personalized pathways</p>
				</div>
			) : (
				<FadeIn>
					<div className="space-y-6">
						{/* Best Fit Banner */}
						<div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
							<div className="flex items-start gap-3">
								<Star className="h-5 w-5 text-primary shrink-0 mt-0.5" />
								<div className="flex-1">
									<h2 className="font-semibold text-sm mb-1">Recommended: {result.bestFitCountry}</h2>
									<p className="text-xs text-muted-foreground">{result.bestFitReason}</p>
								</div>
								<Button variant="outline" size="sm" onClick={handleGetGuide} disabled={isPending} className="gap-1.5 shrink-0">
									{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
									Refresh
								</Button>
							</div>
						</div>

						{/* Country Pathways */}
						<div>
							<h3 className="mb-3 text-sm font-semibold">Country Pathways</h3>
							<div className="space-y-4">
								{result.pathways.map((pathway) => (
									<PathwayCard
										key={pathway.countryCode}
										pathway={pathway}
										isBest={pathway.countryName === result.bestFitCountry}
									/>
								))}
							</div>
						</div>

						{/* General Tips */}
						{result.generalTips.length > 0 && (
							<div className="rounded-xl border border-border bg-card p-5">
								<h3 className="mb-3 text-sm font-semibold">General Tips</h3>
								<ul className="space-y-2">
									{result.generalTips.map((tip, i) => (
										<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
											<CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
											{tip}
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-4 py-3">
							<p className="text-xs text-[#C49A3C]">
								<strong>Disclaimer:</strong> {result.disclaimer}
							</p>
						</div>
					</div>
				</FadeIn>
			)}
		</div>
	);
}
