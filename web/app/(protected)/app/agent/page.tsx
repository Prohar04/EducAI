import Link from "next/link";
import { Bot } from "lucide-react";

export const metadata = { title: "AI Agent · EducAI" };

export default function AgentPage() {
	return (
		<div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-24 text-center">
			<div className="mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
				<Bot className="size-8 text-primary" />
			</div>
			<h1 className="text-2xl font-bold">AI Agent</h1>
			<p className="mt-3 text-muted-foreground">
				Your personal AI admissions agent is coming soon. It will autonomously
				research programmes, draft documents, and manage your application tasks.
			</p>
			<div className="mt-8 flex flex-wrap justify-center gap-3">
				<Link
					href="/app/match"
					className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
				>
					Match Programs
				</Link>
				<Link
					href="/app"
					className="inline-flex h-9 items-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-accent"
				>
					Dashboard
				</Link>
			</div>
		</div>
	);
}
