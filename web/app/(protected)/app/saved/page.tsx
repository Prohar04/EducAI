import Link from "next/link";
import { getSavedPrograms } from "@/lib/auth/action";
import SaveButton from "../programs/_components/SaveButton";
import { SavedIllustration } from "@/components/illustrations";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";

const LEVEL_LABELS: Record<string, string> = {
	BSC: "Bachelor's",
	MSC: "Master's",
	PHD: "PhD",
	MBA: "MBA",
	DIPLOMA: "Diploma",
};

export default async function SavedProgramsPage() {
	const saved = await getSavedPrograms();

	return (
		<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Saved Programs</h1>
				<p className="mt-1 text-muted-foreground">
					Your bookmarked programmes.
				</p>
			</FadeIn>

			{saved.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center">
				<SavedIllustration className="mb-3 h-32 w-auto text-primary opacity-75" />
					<h2 className="text-lg font-semibold">Nothing saved yet</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						Browse programmes and click &quot;Save&quot; to bookmark them here.
					</p>
					<Link
						href="/app/programs"
						className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Browse Programs
					</Link>
				</div>
			) : (
				<StaggerChildren stagger={0.07} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{saved.map((item) => {
						const { program } = item;
						const tuition =
							program.tuitionMinUSD != null
								? program.tuitionMaxUSD != null
									? `$${program.tuitionMinUSD.toLocaleString()} – $${program.tuitionMaxUSD.toLocaleString()}/yr`
									: `From $${program.tuitionMinUSD.toLocaleString()}/yr`
								: "Tuition N/A";

						return (
							<StaggerItem key={item.id}>
								<div className="flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-md h-full">
								<div className="mb-2 flex items-start justify-between gap-2">
									<span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
										{LEVEL_LABELS[program.level] ?? program.level}
									</span>
									<SaveButton programId={program.id} initialSaved={true} />
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
										<span>{tuition}</span>
									</div>
								</Link>
								</div>
							</StaggerItem>
						);
					})}
				</StaggerChildren>
			)}
		</div>
	);
}
