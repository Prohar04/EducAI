import Link from "next/link";
import { searchPrograms, getSavedPrograms } from "@/lib/auth/action";
import ProgramFilters from "./_components/ProgramFilters";
import SaveButton from "./_components/SaveButton";
import type { Program } from "@/types/auth.type";

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

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Programs</h1>
				<p className="mt-1 text-muted-foreground">
					Search university programmes worldwide.
				</p>
			</div>

			<ProgramFilters current={params} />

			{result == null ? (
				<p className="mt-8 text-destructive">
					Failed to load programs. Please try again.
				</p>
			) : result.items.length === 0 ? (
				<div className="mt-12 text-center">
					<p className="text-muted-foreground">No programs found matching your filters.</p>
				</div>
			) : (
				<>
					<p className="mb-4 text-sm text-muted-foreground">
						{result.total.toLocaleString()} program
						{result.total !== 1 ? "s" : ""} found
					</p>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{result.items.map((program) => (
							<div
								key={program.id}
								className="flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
							>
								<div className="mb-2 flex items-start justify-between gap-2">
									<span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
										{levelLabel(program.level)}
									</span>
									<SaveButton
										programId={program.id}
										initialSaved={savedIds.has(program.id)}
									/>
								</div>
								<Link
									href={`/app/programs/${program.id}`}
									className="group flex-1"
								>
									<h2 className="font-semibold leading-snug group-hover:text-primary">
										{program.title}
									</h2>
									<p className="mt-0.5 text-sm text-muted-foreground">
										{program.university.name}
									</p>
									<p className="text-xs text-muted-foreground">
										{program.university.country.name}
										{program.university.city ? `, ${program.university.city}` : ""}
									</p>
									<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
										<span>{program.field}</span>
										<span>{tuitionRange(program)}</span>
									</div>
								</Link>
							</div>
						))}
					</div>

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
