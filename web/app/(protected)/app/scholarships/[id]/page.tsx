import Link from "next/link";
import { notFound } from "next/navigation";
import {
	ArrowLeft,
	Award,
	Calendar,
	CheckCircle,
	ExternalLink,
	Globe,
	ShieldCheck,
	XCircle,
} from "lucide-react";
import { getScholarshipById, checkScholarshipEligibility, getScholarshipProbability } from "@/lib/auth/action";
import { COUNTRIES } from "@/lib/data/countries";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ScholarshipItem } from "@/types/auth.type";

export const metadata = { title: "Scholarship Detail · EducAI" };

function countryName(code: string | null | undefined) {
	if (!code) return null;
	const c = COUNTRIES.find((x) => x.code === code.toUpperCase());
	return c ? `${c.flag} ${c.name}` : code;
}

function fundingBadge(type: ScholarshipItem["fundingType"]) {
	const map: Record<string, { label: string; cls: string }> = {
		full: { label: "Full Funding", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
		partial: { label: "Partial Funding", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
		living: { label: "Living Allowance", cls: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30" },
		research: { label: "Research Grant", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
	};
	return map[type ?? ""] ?? { label: type ?? "Funding", cls: "bg-muted/50 text-muted-foreground border-border" };
}

function levelLabel(level: ScholarshipItem["level"]) {
	const map: Record<string, string> = { BSC: "Bachelor's", MSC: "Master's", PHD: "PhD" };
	return level ? map[level] ?? level : null;
}

function formatDate(date: string) {
	return new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

function daysUntil(dateStr: string): number {
	return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function ScholarshipDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [scholarship, eligibility, probability] = await Promise.all([
		getScholarshipById(id),
		checkScholarshipEligibility(id),
		getScholarshipProbability(id),
	]);

	if (!scholarship) notFound();

	const badge = fundingBadge(scholarship.fundingType);
	const country = countryName(scholarship.countryCode);

	return (
		<div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn>
				{/* Back */}
				<Link
					href="/app/scholarships"
					className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Scholarships
				</Link>

				{/* Header */}
				<div className="mb-6 rounded-2xl border border-border bg-card p-6">
					<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
						<div className="flex-1">
							<h1 className="text-2xl font-bold leading-snug">{scholarship.title}</h1>
							{scholarship.provider && (
								<p className="mt-1 text-muted-foreground">by {scholarship.provider}</p>
							)}
						</div>
						<span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${badge.cls}`}>
							{badge.label}
						</span>
					</div>

					{/* Meta row */}
					<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
						{country && (
							<span className="flex items-center gap-1.5">
								<Globe className="h-4 w-4" />
								{country}
							</span>
						)}
						{scholarship.level && (
							<span className="flex items-center gap-1.5">
								<Award className="h-4 w-4" />
								{levelLabel(scholarship.level)}
							</span>
						)}
						{scholarship.field && (
							<span className="flex items-center gap-1.5">
								<ShieldCheck className="h-4 w-4" />
								{scholarship.field}
							</span>
						)}
						{scholarship.amount && (
							<span className="flex items-center gap-1.5 font-medium text-foreground">
								💰 {scholarship.amount}
							</span>
						)}
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main column */}
					<div className="space-y-6 lg:col-span-2">
						{/* Description */}
						{scholarship.description && (
							<section className="rounded-xl border border-border bg-card p-5">
								<h2 className="mb-3 font-semibold">About this Scholarship</h2>
								<p className="text-sm leading-relaxed text-muted-foreground">
									{scholarship.description}
								</p>
							</section>
						)}

						{/* Eligibility result */}
						{eligibility && (
							<section className="rounded-xl border border-border bg-card p-5">
								<h2 className="mb-3 font-semibold">Your Eligibility</h2>
								<div className="mb-4 flex items-center gap-3">
									{eligibility.status === "eligible" ? (
										<CheckCircle className="h-5 w-5 text-emerald-500" />
									) : eligibility.status === "partially_eligible" ? (
										<CheckCircle className="h-5 w-5 text-amber-500" />
									) : (
										<XCircle className="h-5 w-5 text-red-500" />
									)}
									<div>
										<span className={`font-medium ${
											eligibility.status === "eligible" ? "text-emerald-600 dark:text-emerald-400" :
											eligibility.status === "partially_eligible" ? "text-amber-600 dark:text-amber-400" :
											"text-red-500"
										}`}>
											{eligibility.status === "eligible" ? "Eligible" :
											 eligibility.status === "partially_eligible" ? "Partially Eligible" : "Not Eligible"}
										</span>
										<p className="text-xs text-muted-foreground">
											Score: {eligibility.score}/100 · {eligibility.confidence} confidence
										</p>
									</div>
								</div>

								{eligibility.metCriteria.length > 0 && (
									<div className="mb-3">
										<p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Met criteria</p>
										<ul className="space-y-1">
											{eligibility.metCriteria.map((c, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
													{c}
												</li>
											))}
										</ul>
									</div>
								)}

								{eligibility.missingCriteria.length > 0 && (
									<div className="mb-3">
										<p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Missing criteria</p>
										<ul className="space-y-1">
											{eligibility.missingCriteria.map((c, i) => (
												<li key={i} className="flex items-start gap-2 text-sm">
													<XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
													{c}
												</li>
											))}
										</ul>
									</div>
								)}

								{eligibility.improvementActions.length > 0 && (
									<div>
										<p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">How to improve</p>
										<ul className="space-y-1">
											{eligibility.improvementActions.map((a, i) => (
												<li key={i} className="text-sm text-muted-foreground">
													{i + 1}. {a}
												</li>
											))}
										</ul>
									</div>
								)}
							</section>
						)}

						{/* Probability */}
						{probability && (
							<section className="rounded-xl border border-border bg-card p-5">
								<h2 className="mb-3 font-semibold">Funding Probability</h2>
								<div className="mb-4 flex items-baseline gap-3">
									<span className={`text-3xl font-bold ${
										probability.probabilityBand === "High" ? "text-emerald-500" :
										probability.probabilityBand === "Medium" ? "text-amber-500" : "text-red-500"
									}`}>
										{probability.probabilityPct}%
									</span>
									<span className="text-sm text-muted-foreground">
										{probability.probabilityBand} probability
									</span>
								</div>

								{probability.factors.length > 0 && (
									<div className="mb-4 space-y-2">
										{probability.factors.map((f, i) => (
											<div key={i} className="flex items-center justify-between gap-2 text-sm">
												<span className="text-muted-foreground">{f.factor}</span>
												<div className="flex items-center gap-2">
													<div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
														<div
															className="h-full rounded-full bg-primary"
															style={{ width: `${f.score * 100}%` }}
														/>
													</div>
													<span className="w-8 text-right text-xs">{Math.round(f.score * 100)}%</span>
												</div>
											</div>
										))}
									</div>
								)}

								{probability.weaknesses.length > 0 && (
									<div>
										<p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Weak areas</p>
										<ul className="space-y-1">
											{probability.weaknesses.map((w, i) => (
												<li key={i} className="text-sm text-muted-foreground">• {w}</li>
											))}
										</ul>
									</div>
								)}
							</section>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-5">
						{/* Deadlines */}
						{scholarship.deadlines.length > 0 && (
							<section className="rounded-xl border border-border bg-card p-5">
								<h2 className="mb-3 font-semibold flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									Deadlines
								</h2>
								<ul className="space-y-2">
									{scholarship.deadlines.map((d) => {
										const days = daysUntil(d.deadline);
										return (
											<li key={d.id} className="flex flex-col text-sm">
												{d.term && <span className="text-xs text-muted-foreground">{d.term}</span>}
												<span className="font-medium">{formatDate(d.deadline)}</span>
												<span className={`text-xs ${days > 30 ? "text-muted-foreground" : days > 7 ? "text-amber-500" : "text-red-500"}`}>
													{days > 0 ? `${days} days away` : days === 0 ? "Today!" : "Passed"}
												</span>
											</li>
										);
									})}
								</ul>
							</section>
						)}

						{/* Requirements */}
						<section className="rounded-xl border border-border bg-card p-5">
							<h2 className="mb-3 font-semibold">Requirements</h2>
							<ul className="space-y-2 text-sm">
								{scholarship.minGpa && (
									<li className="flex justify-between">
										<span className="text-muted-foreground">Min GPA</span>
										<span className="font-medium">{scholarship.minGpa} / 4.0</span>
									</li>
								)}
								<li className="flex justify-between">
									<span className="text-muted-foreground">English test</span>
									<span className="font-medium">{scholarship.requiresEnglishTest ? "Required" : "Not required"}</span>
								</li>
								<li className="flex justify-between">
									<span className="text-muted-foreground">Financial need</span>
									<span className="font-medium">{scholarship.financialNeedRequired ? "Required" : "Not required"}</span>
								</li>
								{scholarship.eligibleNationalities && scholarship.eligibleNationalities.length > 0 && (
									<li>
										<span className="text-muted-foreground">Eligible nationalities</span>
										<p className="mt-0.5 text-xs">{scholarship.eligibleNationalities.join(", ")}</p>
									</li>
								)}
							</ul>
						</section>

						{/* Tags */}
						{scholarship.tags && scholarship.tags.length > 0 && (
							<section className="rounded-xl border border-border bg-card p-5">
								<h2 className="mb-3 font-semibold">Tags</h2>
								<div className="flex flex-wrap gap-1.5">
									{scholarship.tags.map((tag, i) => (
										<span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
											{tag}
										</span>
									))}
								</div>
							</section>
						)}

						{/* Source / Apply */}
						<div className="space-y-2">
							{scholarship.sourceUrl && (
								<a
									href={scholarship.sourceUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-accent"
								>
									<ExternalLink className="h-4 w-4" />
									Official Source
								</a>
							)}
							{scholarship.url && (
								<a
									href={scholarship.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
								>
									Apply Now
								</a>
							)}
						</div>

						{/* Data provenance */}
						{scholarship.lastVerified && (
							<p className="text-center text-xs text-muted-foreground">
								Last verified {formatDate(scholarship.lastVerified)}
							</p>
						)}
					</div>
				</div>
			</FadeIn>
		</div>
	);
}
