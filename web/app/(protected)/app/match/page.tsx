"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { matchPrograms } from "@/lib/auth/action";
import type { MatchFormState, MatchResult } from "@/types/auth.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LEVELS = [
	{ value: "", label: "Any level" },
	{ value: "BSC", label: "Bachelor's" },
	{ value: "MSC", label: "Master's" },
	{ value: "PHD", label: "PhD" },
	{ value: "MBA", label: "MBA" },
	{ value: "DIPLOMA", label: "Diploma" },
];

const LEVEL_LABELS: Record<string, string> = {
	BSC: "Bachelor's",
	MSC: "Master's",
	PHD: "PhD",
	MBA: "MBA",
	DIPLOMA: "Diploma",
};

function ScoreBadge({ score }: { score: number }) {
	const color =
		score >= 80
			? "bg-green-500/10 text-green-600 dark:text-green-400"
			: score >= 50
				? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
				: "bg-muted text-muted-foreground";
	return (
		<span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${color}`}>
			{score}%
		</span>
	);
}

function ResultCard({ result }: { result: MatchResult }) {
	const s = result.programSummary;
	return (
		<div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
			<div className="mb-2 flex items-start justify-between gap-3">
				<span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
					{LEVEL_LABELS[s.level] ?? s.level}
				</span>
				<ScoreBadge score={result.score} />
			</div>
			<h3 className="font-semibold leading-snug">{s.title}</h3>
			<p className="mt-0.5 text-sm text-muted-foreground">{s.universityName}</p>
			<p className="text-xs text-muted-foreground">
				{s.country} · {s.field} · {s.tuitionRange}
			</p>
			{result.reasons.length > 0 && (
				<ul className="mt-3 space-y-1">
					{result.reasons.map((r, i) => (
						<li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
							<span className="size-1.5 shrink-0 rounded-full bg-primary/60" />
							{r}
						</li>
					))}
				</ul>
			)}
			<Link
				href={`/app/programs/${result.programId}`}
				className="mt-4 inline-block text-xs font-medium text-primary hover:underline"
			>
				View details →
			</Link>
		</div>
	);
}

export default function MatchPage() {
	const [state, formAction, pending] = useActionState<MatchFormState, FormData>(
		matchPrograms,
		undefined,
	);

	return (
		<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight">Match Programs</h1>
				<p className="mt-1 text-muted-foreground">
					Tell us your preferences and we&apos;ll score every programme for you.
				</p>
			</div>

			<form
				action={formAction}
				className="rounded-xl border border-border bg-card p-6 space-y-5"
			>
				<div className="grid gap-5 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="targetCountry">Target Country (code)</Label>
						<Input
							id="targetCountry"
							name="targetCountry"
							placeholder="US, GB, CA…"
							className="uppercase"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="level">Degree Level</Label>
						<select
							id="level"
							name="level"
							className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
						>
							{LEVELS.map((l) => (
								<option key={l.value} value={l.value}>
									{l.label}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="intendedField">Intended Field</Label>
						<Input
							id="intendedField"
							name="intendedField"
							placeholder="Computer Science, Finance…"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="budgetMaxUSD">Max Annual Tuition (USD)</Label>
						<Input
							id="budgetMaxUSD"
							name="budgetMaxUSD"
							type="number"
							min="0"
							step="1000"
							placeholder="e.g. 30000"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="gpa">GPA (4.0 scale)</Label>
						<Input
							id="gpa"
							name="gpa"
							type="number"
							min="0"
							max="4"
							step="0.01"
							placeholder="e.g. 3.5"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="ielts">IELTS Score</Label>
						<Input
							id="ielts"
							name="ielts"
							type="number"
							min="0"
							max="9"
							step="0.5"
							placeholder="e.g. 7.0"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="toefl">TOEFL Score</Label>
						<Input
							id="toefl"
							name="toefl"
							type="number"
							min="0"
							max="120"
							placeholder="e.g. 100"
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="gre">GRE Score</Label>
						<Input
							id="gre"
							name="gre"
							type="number"
							min="260"
							max="340"
							placeholder="e.g. 320"
						/>
					</div>
				</div>

				{state?.success === false && state.message && (
					<p className="text-sm text-destructive">{state.message}</p>
				)}

				<Button type="submit" disabled={pending} className="w-full sm:w-auto">
					{pending ? (
						<>
							<Loader2 className="size-4 animate-spin" />
							Matching…
						</>
					) : (
						"Find Matches"
					)}
				</Button>
			</form>

			{state?.success && state.results != null && (
				<div className="mt-10">
					<h2 className="mb-1 text-xl font-semibold">
						{state.results.length} Match{state.results.length !== 1 ? "es" : ""} Found
					</h2>
					{state.results.length === 0 ? (
						<p className="mt-4 text-muted-foreground">
							No programs matched your criteria. Try relaxing the filters.
						</p>
					) : (
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							{state.results.map((r) => (
								<ResultCard key={r.programId} result={r} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
