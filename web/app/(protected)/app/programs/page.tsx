import Link from "next/link";
import { searchPrograms, getSavedPrograms } from "@/lib/auth/action";
import ProgramFilters from "./_components/ProgramFilters";
import SaveButton from "./_components/SaveButton";
import NlpSearchPanel from "./_components/NlpSearchPanel";
import type { Program, FreshnessStatus } from "@/types/auth.type";
import { ProgramsIllustration } from "@/components/illustrations";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { AlertTriangle } from "lucide-react";

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
	live:               { label: "Live",     className: "bg-green-500/15 text-green-700 dark:text-green-400" },
	recent:             { label: "Recent",   className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
	cached:             { label: "Cached",   className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
	stale:              { label: "Stale",    className: "bg-red-500/15 text-red-700 dark:text-red-400" },
	source_unavailable: { label: "Offline",  className: "bg-muted text-muted-foreground" },
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

export default async function ProgramsPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string>>;
}) {
	const params = await searchParams;
	const [result, saved] = await Promise.all([
		searchPrograms(params),
		getSavedPrograms(),
	]);

	const savedIds = new Set(saved.map((s) => s.programId));

	const buildPageUrl = (page: number) => {
		const p = new URLSearchParams({ ...params, page: String(page) });
		return `/app/programs?${p.toString()}`;
	};

	const hasStaleData = result?.hasStaleData ?? false;

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Programs</h1>
				<p className="mt-1 text-muted-foreground">
					Search university programmes worldwide.
				</p>
			</FadeIn>

			<NlpSearchPanel />

			<ProgramFilters current={params} />

			{/* Stale data warning */}
			{hasStaleData && (
				<FadeIn>
					<div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
						<AlertTriangle className="mt-0.5 size-4 shrink-0" />
						<div>
							<span className="font-semibold">Some data may be outdated.</span>{" "}
							{result?.staleCount ?? 0} programme{(result?.staleCount ?? 0) !== 1 ? "s" : ""} were last verified more than 30 days ago.
							Visit the official programme page to confirm current details before applying.
						</div>
					</div>
				</FadeIn>
			)}

			{result == null ? (
				<p className="mt-8 text-destructive">
					Failed to load programs. Please try again.
				</p>
			) : result.items.length === 0 ? (
				<div className="mt-12 flex flex-col items-center text-center">
					<ProgramsIllustration className="mb-3 h-32 w-auto text-primary opacity-75" />
					<p className="font-medium">No programs found</p>
					<p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters.</p>
				</div>
			) : (
				<>
					<p className="mb-4 text-sm text-muted-foreground">
						{result.total.toLocaleString()} program
						{result.total !== 1 ? "s" : ""} found
					</p>
					<StaggerChildren stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{result.items.map((program) => (
							<StaggerItem key={program.id}>
								<div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md h-full">
									{/* Accent band */}
									<div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30" />
									<div className="flex flex-col flex-1 p-5">
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
										<Link href={`/app/programs/${program.id}`} className="flex-1">
											<h2 className="font-semibold leading-snug transition-colors group-hover:text-primary">
												{program.title}
											</h2>
											<p className="mt-0.5 text-sm text-muted-foreground">
												{program.university.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{program.university.country.name}
												{program.university.city ? `, ${program.university.city}` : ""}
											</p>
										</Link>
										<div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
											<span className="font-medium">{tuitionRange(program)}</span>
											<span className="text-primary/70 font-medium group-hover:text-primary transition-colors">View →</span>
										</div>
									</div>
								</div>
						</StaggerItem>
					))}
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
