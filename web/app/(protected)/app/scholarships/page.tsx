import Link from "next/link";
import { Award } from "lucide-react";

export default function ScholarshipsPage() {
	return (
		<div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
			<div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
				<Award className="size-8 text-primary" />
			</div>
			<h1 className="text-2xl font-bold">Scholarships</h1>
			<p className="mt-3 text-muted-foreground">
				Scholarship discovery is coming soon. We&apos;re working on matching you with
				funding opportunities worldwide.
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Link
					href="/app/match"
					className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Match Programs
				</Link>
				<Link
					href="/app/programs"
					className="inline-flex h-9 items-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-accent"
				>
					Browse Programs
				</Link>
			</div>
		</div>
	);
}
