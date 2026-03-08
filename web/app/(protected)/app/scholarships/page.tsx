import Link from "next/link";
import { ComingSoonIllustration } from "@/components/illustrations";

export default function ScholarshipsPage() {
	return (
		<div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
			<ComingSoonIllustration className="mb-2 h-32 w-auto text-primary" />
			<span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
				<span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
				Coming soon
			</span>
			<h1 className="text-2xl font-bold">Scholarships</h1>
			<p className="mt-3 text-muted-foreground">
				Scholarship discovery is coming soon. We&apos;re matching you with global
				funding opportunities based on your profile.
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Link
					href="/app/match"
					className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Match Programs
				</Link>
				<Link
					href="/app/programs"
					className="inline-flex h-9 items-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-accent transition-colors"
				>
					Browse Programs
				</Link>
			</div>
		</div>
	);
}
