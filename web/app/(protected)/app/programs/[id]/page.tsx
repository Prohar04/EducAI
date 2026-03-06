import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { getProgramById, getSavedPrograms } from "@/lib/auth/action";
import SaveButton from "../_components/SaveButton";

const LEVEL_LABELS: Record<string, string> = {
	BSC: "Bachelor's",
	MSC: "Master's",
	PHD: "PhD",
	MBA: "MBA",
	DIPLOMA: "Diploma",
};

export default async function ProgramDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const [program, saved] = await Promise.all([
		getProgramById(id),
		getSavedPrograms(),
	]);

	if (!program) notFound();

	const isSaved = saved.some((s) => s.programId === id);

	const tuitionRange =
		program.tuitionMinUSD != null
			? program.tuitionMaxUSD != null
				? `$${program.tuitionMinUSD.toLocaleString()} – $${program.tuitionMaxUSD.toLocaleString()}/yr`
				: `From $${program.tuitionMinUSD.toLocaleString()}/yr`
			: "Tuition not listed";

	return (
		<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			{/* Back link */}
			<Link
				href="/app/programs"
				className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Back to Programs
			</Link>

			{/* Header */}
			<div className="mt-4 flex items-start justify-between gap-4">
				<div>
					<span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						{LEVEL_LABELS[program.level] ?? program.level}
					</span>
					<h1 className="mt-2 text-2xl font-bold leading-snug">{program.title}</h1>
					<p className="mt-1 text-muted-foreground">
						{program.university.name}
						{program.university.city
							? `, ${program.university.city}`
							: ""},{" "}
						{program.university.country.name}
					</p>
				</div>
				<div className="shrink-0">
					<SaveButton programId={program.id} initialSaved={isSaved} />
				</div>
			</div>

			{/* Key info grid */}
			<div className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6 sm:grid-cols-2">
				<InfoRow label="Field" value={program.field} />
				<InfoRow label="Level" value={LEVEL_LABELS[program.level] ?? program.level} />
				<InfoRow label="Tuition" value={tuitionRange} />
				{program.durationMonths != null && (
					<InfoRow
						label="Duration"
						value={`${program.durationMonths} month${program.durationMonths !== 1 ? "s" : ""}`}
					/>
				)}
			</div>

			{/* Description */}
			{program.description && (
				<div className="mt-6">
					<h2 className="mb-2 font-semibold">About</h2>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{program.description}
					</p>
				</div>
			)}

			{/* Requirements */}
			{program.requirements && program.requirements.length > 0 && (
				<div className="mt-6">
					<h2 className="mb-3 font-semibold">Entry Requirements</h2>
					<ul className="space-y-2">
						{program.requirements.map((req) => (
							<li
								key={req.id}
								className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
							>
								<span className="font-medium">{req.key}</span>
								<span className="text-muted-foreground">{req.value}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Deadlines */}
			{program.deadlines && program.deadlines.length > 0 && (
				<div className="mt-6">
					<h2 className="mb-3 font-semibold">Application Deadlines</h2>
					<ul className="space-y-2">
						{program.deadlines.map((dl) => (
							<li
								key={dl.id}
								className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5 text-sm"
							>
								<span className="font-medium">{dl.term}</span>
								<span className="text-muted-foreground">
									{new Date(dl.deadline).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Apply link */}
			{program.applicationUrl && (
				<div className="mt-8">
					<a
						href={program.applicationUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Apply Now
						<ExternalLink className="size-4" />
					</a>
				</div>
			)}
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="mt-0.5 font-medium">{value}</dd>
		</div>
	);
}
