"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Search, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { intelligentSearchAction, type IntelligentSearchResult } from "@/lib/auth/action";

export default function NlpSearchPanel() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<IntelligentSearchResult[] | null>(null);
	const [rewrites, setRewrites] = useState<string[]>([]);
	const [cacheHit, setCacheHit] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		if (!query.trim()) return;
		setError(null);

		startTransition(async () => {
			const res = await intelligentSearchAction(query.trim());
			if (!res) {
				setError("Search failed. Please try again.");
				return;
			}
			setResults(res.results);
			setRewrites(res.rewrites);
			setCacheHit(res.cacheHit);
		});
	}

	function handleClear() {
		setQuery("");
		setResults(null);
		setRewrites([]);
		setError(null);
	}

	return (
		<div className="mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
			<div className="mb-3 flex items-center gap-2">
				<Sparkles className="h-4 w-4 text-primary" />
				<span className="text-sm font-medium">AI-Powered Program Search</span>
				<span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
					Beta
				</span>
			</div>

			<form onSubmit={handleSearch} className="flex gap-2">
				<Input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="e.g. affordable CS masters in Germany under $15k"
					className="flex-1 bg-background"
					disabled={isPending}
				/>
				<Button type="submit" size="sm" disabled={isPending || !query.trim()}>
					{isPending ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Search className="h-4 w-4" />
					)}
					<span className="ml-1.5 hidden sm:inline">
						{isPending ? "Searching…" : "Search"}
					</span>
				</Button>
				{results !== null && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleClear}
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</form>

			{error && (
				<p className="mt-3 text-sm text-destructive">{error}</p>
			)}

			{results !== null && (
				<div className="mt-4">
					<div className="mb-3 flex flex-wrap items-center gap-2">
						<span className="text-xs text-muted-foreground">
							{results.length} result{results.length !== 1 ? "s" : ""}
						</span>
						{cacheHit && (
							<span className="rounded-full bg-[#3D9970]/15 px-2 py-0.5 text-xs text-[#3D9970]">
								cached
							</span>
						)}
						{rewrites.length > 0 && (
							<span className="text-xs text-muted-foreground">
								· Searched: {rewrites.slice(0, 2).map(r => `"${r}"`).join(", ")}
								{rewrites.length > 2 ? " …" : ""}
							</span>
						)}
					</div>

					{results.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No results found. Try a different query or use the filters below.
						</p>
					) : (
						<div className="grid gap-2 sm:grid-cols-2">
							{results.map((r, i) => (
								<a
									key={i}
									href={r.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex flex-col rounded-lg border border-border bg-background p-3 text-sm transition-colors hover:border-primary/40 hover:bg-accent/50"
								>
									<div className="mb-1 flex items-start justify-between gap-2">
										<span className="font-medium leading-snug line-clamp-2">
											{r.title}
										</span>
										<ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
									</div>
									<p className="text-xs text-muted-foreground line-clamp-2">
										{r.snippet}
									</p>
									<p className="mt-1.5 text-xs text-primary/70 truncate">
										{r.url}
									</p>
								</a>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
