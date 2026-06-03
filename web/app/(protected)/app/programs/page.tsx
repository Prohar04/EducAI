import Link from "next/link";
import { searchPrograms, getSavedPrograms, getUserProfile } from "@/lib/auth/action";
import { PageHeader } from "@/components/layout/page-header";
import HeaderBadge from "@/components/ui/header-badge";
import ProgramFilters from "./_components/ProgramFilters";
import SaveButton from "./_components/SaveButton";
import NlpSearchPanel from "./_components/NlpSearchPanel";
import FreshnessToggle from "./_components/FreshnessToggle";
import RefreshProgramsButton from "./_components/RefreshProgramsButton";
import type { Program, FreshnessStatus, UserProfile } from "@/types/auth.type";
import { ProgramsIllustration } from "@/components/illustrations";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { AlertTriangle, Database } from "lucide-react";

function levelLabel(level: string) {
	const map: Record<string, string> = {
		BSC: "Bachelor's",
		MSC: "Master's",
		PHD: "PhD",
		MBA: "MBA",
		DIPLOMA: "Diploma",
	};
	return map[level] ?? level;
}

function tuitionRange(program: Program) {
	if (program.tuitionMinUSD == null) return "Tuition N/A";
	const min = `$${program.tuitionMinUSD.toLocaleString()}`;
	const max = program.tuitionMaxUSD != null ? `$${program.tuitionMaxUSD.toLocaleString()}` : null;
	return max ? `${min} – ${max}/yr` : `From ${min}/yr`;
}

const FRESHNESS_CONFIG: Record<
	FreshnessStatus,
	{ label: string; className: string }
> = {
	live:               { label: "Live",     className: "bg-[#3D9970]/15 text-[#3D9970]" },
	recent:             { label: "Recent",   className: "bg-[#4A90D9]/15 text-[#4A90D9]" },
	cached:             { label: "Cached",   className: "bg-[#C49A3C]/15 text-[#C49A3C]" },
	stale:              { label: "Stale",    className: "bg-[#C0392B]/15 text-[#C0392B]" },
	source_unavailable: { label: "Offline",  className: "bg-muted text-muted-foreground" },
};

const STALE_CARD_BORDER: Partial<Record<FreshnessStatus, string>> = {
	cached: "border-[#C49A3C]/40",
	stale:  "border-[#C0392B]/40",
	source_unavailable: "border-muted",
};

function FreshnessBadge({ status }: { status: FreshnessStatus | undefined }) {
	if (!status) return null;
	const cfg = FRESHNESS_CONFIG[status];
	return (
		<span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
			{cfg.label}
		</span>
	);
}

// ── Profile-based ranking ────────────────────────────────────────────────────

interface RankedProgram extends Program {
	_score: number;
	_reasons: string[];
}

function rankByProfile(programs: Program[], profile: UserProfile | null): RankedProgram[] {
	if (!profile) return programs.map((p) => ({ ...p, _score: 0, _reasons: [] }));

	const targetCountries = new Set(
		(profile.targetCountries ?? (profile.targetCountry ? [profile.targetCountry] : [])).map((c) =>
			c.toUpperCase(),
		),
	);
	const intendedLevel = profile.intendedLevel ?? profile.level ?? null;
	const major = (profile.intendedMajor ?? profile.majorOrTrack ?? "").toLowerCase();

	return programs
		.map((program) => {
			let score = 0;
			const reasons: string[] = [];

			if (targetCountries.has(program.university.country.code.toUpperCase())) {
				score += 30;
				reasons.push(`Target country: ${program.university.country.name}`);
			}
			if (intendedLevel && program.level === intendedLevel) {
				score += 20;
				reasons.push(`Matches your degree level`);
			}
			if (major && program.field.toLowerCase().includes(major)) {
				score += 20;
				reasons.push(`Related to your field of interest`);
			}
			if (
				profile.budgetMax != null &&
				program.tuitionMaxUSD != null &&
				program.tuitionMaxUSD <= profile.budgetMax * 1.1
			) {
				score += 10;
				reasons.push(`Within your budget`);
			}

			return { ...program, _score: score, _reasons: reasons };
		})
		.sort((a, b) => b._score - a._score);
}

export default async function ProgramsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string>>;
}) {
	const params = await searchParams;
	const showStale = params.showStale === "true";

	const [result, saved, profile] = await Promise.all([
		searchPrograms(params),
		getSavedPrograms(),
		getUserProfile(),
	]);

	const savedIds = new Set(saved.map((s) => s.programId));
	const staleHiddenCount = result?.staleHiddenCount ?? 0;
	const freshOnlyMode = result?.freshOnlyMode ?? !showStale;

	const ranked = result ? rankByProfile(result.items, profile) : [];

	const buildPageUrl = (page: number) => {
		const p = new URLSearchParams({ ...params, page: String(page) });
		return `/app/programs?${p.toString()}`;
	};

	const isStaleCard = (s: FreshnessStatus | undefined) =>
		s === "cached" || s === "stale" || s === "source_unavailable";

	return (
		<div className="page-enter mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<PageHeader
				animation="programs"
				title={<>AI <span className="gradient-text">Program Match</span></>}
				subtitle="Find your perfect university programs ranked by fit score"
				badges={
					<>
						<HeaderBadge>{result ? `${result.total.toLocaleString()} Program${result.total !== 1 ? "s" : ""}` : "Programs"}</HeaderBadge>
						<HeaderBadge>Profile-Ranked</HeaderBadge>
						<HeaderBadge variant="outline">Live Data</HeaderBadge>
					</>
				}
				rightContent={<RefreshProgramsButton />}
			/>

			<NlpSearchPanel />

			<ProgramFilters current={params} />

			{result == null ? (
				<p className="mt-8 text-destructive">Failed to load programs. Please try again.</p>
			) : freshOnlyMode && result.items.length === 0 ? (
				/* No fresh data state */
				<FadeIn>
					<div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-12 text-center">
						<ProgramsIllustration className="h-28 w-auto text-primary opacity-60" />
						<div>
							<p className="font-semibold text-foreground">No fresh program data available right now</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Fresh results are programs verified within the last 7 days.
								{staleHiddenCount > 0 && (
									<>
										{" "}
										<span className="font-medium text-foreground">
											{staleHiddenCount} older program{staleHiddenCount !== 1 ? "s" : ""} {staleHiddenCount !== 1 ? "are" : "is"} available in the cache.
										</span>
									</>
								)}
							</p>
						</div>
						<div className="flex flex-wrap justify-center gap-2">
							<RefreshProgramsButton />
							{staleHiddenCount > 0 && (
								<FreshnessToggle showStale={false} staleHiddenCount={staleHiddenCount} />
							)}
						</div>
					</div>
				</FadeIn>
			) : result.items.length === 0 ? (
				<div className="mt-12 flex flex-col items-center text-center">
					<ProgramsIllustration className="mb-3 h-32 w-auto text-primary opacity-75" />
					<p className="font-medium">No programs found</p>
					<p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
				</div>
			) : (
				<>
					{/* Stale data banner — only when showing stale results */}
					{showStale && result.items.length > 0 && (
						<FadeIn>
							<div className="mb-4 flex items-start gap-3 rounded-xl border border-[#C49A3C]/40 bg-[#C49A3C]/10 px-4 py-3 text-sm text-[#C49A3C]">
								<AlertTriangle className="mt-0.5 size-4 shrink-0" />
								<div>
									<span className="font-semibold">Showing cached/stale programs.</span>{" "}
									These results may be outdated. Visit the official program page to confirm details before applying.
								</div>
							</div>
						</FadeIn>
					)}

					<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
						<p className="text-sm text-muted-foreground">
							{result.total.toLocaleString()} program{result.total !== 1 ? "s" : ""} found
							{profile && ranked.some((p) => p._score > 0) && (
								<span className="ml-1 text-primary/70">(ranked by your profile)</span>
							)}
						</p>
						<FreshnessToggle showStale={showStale} staleHiddenCount={staleHiddenCount} />
					</div>

					<StaggerChildren stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{ranked.map((program) => {
							const isStale = isStaleCard(program.freshnessStatus);
							const staleBorder = isStale ? (STALE_CARD_BORDER[program.freshnessStatus!] ?? "") : "";
							return (
								<StaggerItem key={program.id}>
									<div
										className={`group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md h-full ${staleBorder || "border-border"}`}
									>
										{/* Accent band — amber for stale */}
										<div
											className={`h-1 w-full bg-gradient-to-r ${
												isStale
													? "from-[#C49A3C]/30 via-[#C49A3C]/60 to-[#C49A3C]/30"
													: "from-primary/30 via-primary/60 to-primary/30"
											}`}
										/>
										<div className="flex flex-col flex-1 p-5">
											{/* Stale overlay label */}
											{isStale && showStale && (
												<div className="mb-2 flex items-center gap-1.5 rounded-lg border border-[#C49A3C]/30 bg-[#C49A3C]/10 px-2.5 py-1.5 text-xs font-semibold text-[#C49A3C]">
													<Database className="size-3" />
													Cached data — may be outdated
												</div>
											)}
											<div className="mb-2 flex items-start justify-between gap-2">
												<div className="flex flex-wrap gap-1.5">
													<span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
														{levelLabel(program.level)}
													</span>
													<span className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
														{program.field}
													</span>
													<FreshnessBadge status={program.freshnessStatus} />
												</div>
												<SaveButton
													programId={program.id}
													initialSaved={savedIds.has(program.id)}
												/>
											</div>
											<Link href={`/app/programs/${program.id}`} className="flex-1 min-w-0">
												<h2 className="break-words font-semibold leading-snug transition-colors group-hover:text-primary">
													{program.title}
												</h2>
												<p className="mt-0.5 break-words text-sm text-muted-foreground">
													{program.university.name}
												</p>
												<p className="break-words text-xs text-muted-foreground">
													{program.university.country.name}
													{program.university.city ? `, ${program.university.city}` : ""}
												</p>
											</Link>

											{/* Profile match reasons */}
											{program._reasons.length > 0 && (
												<div className="mt-2 flex flex-wrap gap-1">
													{program._reasons.map((r) => (
														<span
															key={r}
															className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary/80"
														>
															{r}
														</span>
													))}
												</div>
											)}

											<div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
												<span className="font-medium">{tuitionRange(program)}</span>
												<span className="text-primary/70 font-medium group-hover:text-primary transition-colors">View →</span>
											</div>
										</div>
									</div>
								</StaggerItem>
							);
						})}
					</StaggerChildren>

					{result.total > result.limit && (
						<div className="mt-8 flex items-center justify-center gap-3">
							{result.page > 1 && (
								<Link
									href={buildPageUrl(result.page - 1)}
									className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
								>
									← Previous
								</Link>
							)}
							<span className="text-sm text-muted-foreground">
								Page {result.page} of {Math.ceil(result.total / result.limit)}
							</span>
							{result.page * result.limit < result.total && (
								<Link
									href={buildPageUrl(result.page + 1)}
									className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
								>
									Next →
								</Link>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
}
