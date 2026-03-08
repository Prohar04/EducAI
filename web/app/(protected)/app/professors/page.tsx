import Link from "next/link";
import { Users } from "lucide-react";

export const metadata = { title: "Professor Finder · EducAI" };

export default function ProfessorsPage() {
	return (
		<div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
			<div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
				<Users className="size-8 text-primary" />
			</div>
			<h1 className="text-2xl font-bold">Professor Finder</h1>
			<p className="mt-3 text-muted-foreground">
				AI-assisted professor and supervisor matching is coming soon. We&apos;re
				building a tool to connect you with the right academics for your research
				interests.
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Link
					href="/app/programs"
					className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Browse Programs
				</Link>
				<Link
					href="/app/match"
					className="inline-flex h-9 items-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-accent"
				>
					Match Programs
				</Link>
			</div>
		</div>
	);
}
