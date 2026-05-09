"use client";

import { useState, useTransition, useEffect } from "react";
import {
	AlertCircle,
	BookOpen,
	Check,
	CheckCircle,
	Copy,
	ExternalLink,
	GraduationCap,
	Info,
	Loader2,
	Mail,
	Search,
	User,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { SmartAutocomplete, type SuggestionItem } from "@/components/forms/SmartAutocomplete";
import { searchProfessorsAction, getUserProfile, type ProfessorResult } from "@/lib/auth/action";
import { COUNTRIES } from "@/lib/data/countries";

const RESEARCH_TOPIC_SUGGESTIONS: SuggestionItem[] = [
	{ value: "nlp", label: "Natural Language Processing" },
	{ value: "computer_vision", label: "Computer Vision" },
	{ value: "machine_learning", label: "Machine Learning" },
	{ value: "deep_learning", label: "Deep Learning" },
	{ value: "reinforcement_learning", label: "Reinforcement Learning" },
	{ value: "quantum_computing", label: "Quantum Computing" },
	{ value: "robotics", label: "Robotics & Automation" },
	{ value: "bioinformatics", label: "Bioinformatics" },
	{ value: "climate_science", label: "Climate Science / Sustainability" },
	{ value: "cybersecurity", label: "Cybersecurity" },
	{ value: "data_science", label: "Data Science & Analytics" },
	{ value: "fintech", label: "FinTech & Algorithmic Trading" },
	{ value: "public_health", label: "Public Health & Epidemiology" },
	{ value: "neuroscience", label: "Neuroscience" },
	{ value: "renewable_energy", label: "Renewable Energy" },
	{ value: "drug_discovery", label: "Drug Discovery & Biotech" },
];

function SkeletonCard() {
	return (
		<div className="animate-pulse rounded-xl border border-border bg-card p-5">
			<div className="mb-3 flex items-start gap-3">
				<div className="h-10 w-10 rounded-full bg-muted" />
				<div className="flex-1">
					<div className="h-4 w-1/2 rounded bg-muted mb-1" />
					<div className="h-3 w-1/3 rounded bg-muted" />
				</div>
			</div>
			<div className="space-y-2">
				<div className="h-3 w-full rounded bg-muted" />
				<div className="h-3 w-4/5 rounded bg-muted" />
			</div>
		</div>
	);
}

function EmailTemplateModal({
	professor,
	onClose,
}: {
	professor: ProfessorResult;
	onClose: () => void;
}) {
	const [copied, setCopied] = useState(false);

	function handleCopy() {
		navigator.clipboard.writeText(professor.emailTemplate).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
			<div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
				<div className="flex items-center justify-between border-b border-border px-5 py-4">
					<div>
						<h2 className="font-semibold">Email Template</h2>
						<p className="text-xs text-muted-foreground">For {professor.name}</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
							{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
							{copied ? "Copied!" : "Copy"}
						</Button>
						<button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
				<div className="overflow-y-auto p-5">
					<pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 rounded-lg p-4 text-foreground">
						{professor.emailTemplate}
					</pre>
					<p className="mt-3 text-xs text-muted-foreground">
						Personalize this template before sending — fill in your name, specific research interests, and relevant background.
					</p>
				</div>
			</div>
		</div>
	);
}

function ProfessorCard({
	professor,
	onViewEmail,
}: {
	professor: ProfessorResult;
	onViewEmail: (p: ProfessorResult) => void;
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md">
			<div className="mb-3 flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
					<User className="h-5 w-5 text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<h3 className="font-semibold leading-snug truncate">{professor.name}</h3>
						{professor.sourceVerified && (
							<span className="inline-flex items-center gap-1 rounded-full bg-[#3D9970]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#3D9970]">
								<CheckCircle className="h-2.5 w-2.5" />
								Source-backed
							</span>
						)}
					</div>
					<p className="text-sm text-muted-foreground truncate">{professor.title}</p>
					<p className="text-xs text-muted-foreground truncate">
						{professor.department} · {professor.university}
					</p>
				</div>
			</div>

			{professor.snippet && (
				<p className="mb-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
					{professor.snippet}
				</p>
			)}

			{professor.researchAreas.length > 0 && (
				<div className="mb-3 flex flex-wrap gap-1.5">
					{professor.researchAreas.slice(0, 4).map((area) => (
						<span
							key={area}
							className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
						>
							{area}
						</span>
					))}
				</div>
			)}

			<div className="flex items-center gap-2 flex-wrap">
				<Button
					size="sm"
					variant="outline"
					className="gap-1.5"
					onClick={() => onViewEmail(professor)}
				>
					<Mail className="h-3.5 w-3.5" />
					Email Template
				</Button>
				{professor.profileUrl && (
					<a
						href={professor.profileUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					>
						Profile <ExternalLink className="h-3 w-3" />
					</a>
				)}
				{professor.email && (
					<a
						href={`mailto:${professor.email}`}
						className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					>
						<Mail className="h-3 w-3" />
						{professor.email}
					</a>
				)}
			</div>
		</div>
	);
}

export default function ProfessorsPage() {
	const [researchInterest, setResearchInterest] = useState("");
	const [university, setUniversity] = useState("");
	const [country, setCountry] = useState("");
	const [level, setLevel] = useState<"phd" | "masters">("phd");
	const [results, setResults] = useState<ProfessorResult[] | null>(null);
	const [searchedQuery, setSearchedQuery] = useState("");
	const [warning, setWarning] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [emailModal, setEmailModal] = useState<ProfessorResult | null>(null);
	const [isPending, startTransition] = useTransition();

	// Pre-fill from user profile: intendedAbroadMajor + researchInterest
	useEffect(() => {
		getUserProfile().then(profile => {
			if (!profile) return;
			const p = profile as unknown as Record<string, unknown>;
			const intendedField =
				(p.intendedAbroadMajor as string | undefined)
				?? profile.intendedMajor
				?? undefined;
			const ri = (p.researchInterest as string | undefined) ?? undefined;
			// Build default research topic: combine intended field + research interest
			const defaultTopic = ri
				? ri
				: intendedField
				? intendedField
				: "";
			if (defaultTopic) setResearchInterest(defaultTopic);
			// Set level from profile
			const lvl = profile.intendedLevel ?? profile.level ?? "";
			if (lvl.toUpperCase().includes("PHD")) setLevel("phd");
			else if (lvl.toUpperCase().includes("MSC") || lvl.toUpperCase().includes("MASTER")) setLevel("masters");
		}).catch(() => {});
	}, []);

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		if (!researchInterest.trim()) return;
		setError(null);
		setWarning(null);

		startTransition(async () => {
			try {
				const res = await searchProfessorsAction(
					researchInterest.trim(),
					university || undefined,
					country || undefined,
					level,
				);
				if (!res) {
					setError("Search failed. Please try again.");
					return;
				}
				setResults(res.results);
				setSearchedQuery(res.query);
				if (res.warning) setWarning(res.warning);
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : "Search failed. Please try again.";
				setError(msg);
			}
		});
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			{emailModal && (
				<EmailTemplateModal
					professor={emailModal}
					onClose={() => setEmailModal(null)}
				/>
			)}

			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<GraduationCap className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Professor Finder</h1>
						<p className="text-sm text-muted-foreground">
							Source-backed professor search — only real, verified results shown
						</p>
					</div>
				</div>
			</FadeIn>

			{/* Search form */}
			<div className="mb-8 rounded-xl border border-border bg-card p-5">
				<form onSubmit={handleSearch} className="space-y-4">
					<div>
						<label className="mb-1 block text-sm font-medium">Research Interest *</label>
						<SmartAutocomplete
							value={researchInterest}
							onChange={setResearchInterest}
							placeholder="e.g. Natural Language Processing, Computer Vision, Quantum Computing"
							localSuggestions={RESEARCH_TOPIC_SUGGESTIONS}
							allowFreeText
						/>
					</div>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<div>
							<label className="mb-1 block text-xs text-muted-foreground">University (optional)</label>
							<SmartAutocomplete
								value={university}
								onChange={setUniversity}
								placeholder="e.g. MIT, Oxford, TU Munich"
								allowFreeText
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs text-muted-foreground">Country (optional)</label>
							<select
								value={country}
								onChange={(e) => setCountry(e.target.value)}
								className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
							>
								<option value="">Any country</option>
								{COUNTRIES.map((c) => (
									<option key={c.code} value={c.name}>
										{c.flag} {c.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="mb-1 block text-xs text-muted-foreground">Program level</label>
							<select
								value={level}
								onChange={(e) => setLevel(e.target.value as "phd" | "masters")}
								className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
							>
								<option value="phd">PhD</option>
								<option value="masters">Master&apos;s</option>
							</select>
						</div>
					</div>
					<Button
						type="submit"
						disabled={isPending || !researchInterest.trim()}
						className="w-full gap-2 sm:w-auto"
					>
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
						{isPending ? "Searching…" : "Find Professors"}
					</Button>
				</form>

				{error && (
					<div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
						<AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}
			</div>

			{/* Trust notice */}
			<div className="mb-6 flex items-start gap-2 rounded-lg border border-[#4A90D9]/20 bg-[#4A90D9]/5 px-4 py-3">
				<Info className="h-4 w-4 text-[#4A90D9] shrink-0 mt-0.5" />
				<p className="text-xs text-[#4A90D9]">
					This tool only shows professors it can find evidence for via live web search. If your search returns no results, the university name may not be indexed, or try broadening your research area.
				</p>
			</div>

			{/* Results */}
			{isPending && (
				<div className="grid gap-4 sm:grid-cols-2">
					{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
				</div>
			)}

			{!isPending && results !== null && (
				<>
					<div className="mb-4 flex items-center justify-between flex-wrap gap-2">
						<p className="text-sm text-muted-foreground">
							{results.length > 0
								? `${results.length} source-backed professor${results.length === 1 ? "" : "s"} found`
								: "No verified professors found"}
						</p>
						{searchedQuery && (
							<p className="text-xs text-muted-foreground hidden sm:block">
								Query: <em>&ldquo;{searchedQuery}&rdquo;</em>
							</p>
						)}
					</div>

					{warning && (
						<div className="mb-4 flex items-start gap-2 rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-3 py-2">
							<AlertCircle className="h-4 w-4 text-[#C49A3C] shrink-0 mt-0.5" />
							<p className="text-sm text-[#C49A3C]">{warning}</p>
						</div>
					)}

					{results.length > 0 && (
						<StaggerChildren stagger={0.08} className="grid gap-4 sm:grid-cols-2">
							{results.map((professor, i) => (
								<StaggerItem key={i}>
									<ProfessorCard
										professor={professor}
										onViewEmail={setEmailModal}
									/>
								</StaggerItem>
							))}
						</StaggerChildren>
					)}

					{results.length === 0 && (
						<div className="flex flex-col items-center py-12 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
								<BookOpen className="h-8 w-8 text-muted-foreground" />
							</div>
							<p className="font-medium">No verified professors found</p>
							<p className="mt-1 text-sm text-muted-foreground max-w-sm">
								We could not find source-backed matches for this search. We will not invent results — try the suggestions below.
							</p>
							<div className="mt-4 rounded-lg border border-border bg-card p-4 text-left text-sm space-y-1.5 max-w-sm">
								<p className="font-medium text-sm mb-2">Try these refinements:</p>
								<div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-[#3D9970] mt-0.5 shrink-0" /><span className="text-muted-foreground">Use a broader or alternative research area term</span></div>
								<div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-[#3D9970] mt-0.5 shrink-0" /><span className="text-muted-foreground">Check university name spelling (e.g. &ldquo;MIT&rdquo; not &ldquo;Massachusetts Inst&rdquo;)</span></div>
								<div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-[#3D9970] mt-0.5 shrink-0" /><span className="text-muted-foreground">Remove the university filter to search more broadly</span></div>
								<div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 text-[#3D9970] mt-0.5 shrink-0" /><span className="text-muted-foreground">Try related field terms (e.g. &ldquo;machine learning&rdquo; instead of &ldquo;AI&rdquo;)</span></div>
							</div>
						</div>
					)}

					{results.length > 0 && (
						<div className="mt-6 rounded-lg border border-border bg-muted/20 px-4 py-3">
							<p className="text-xs text-muted-foreground">
								Results are extracted from live web search results. Always verify professor details on official university websites before reaching out. Email templates are starting points — personalize them.
							</p>
						</div>
					)}
				</>
			)}

			{!isPending && results === null && (
				<div className="flex flex-col items-center py-16 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<GraduationCap className="h-8 w-8 text-primary" />
					</div>
					<h3 className="mb-2 font-semibold">Discover your research supervisors</h3>
					<p className="max-w-md text-sm text-muted-foreground">
						Enter your research interest to find professors whose work aligns with yours.
						Results are source-backed — we only show professors we can find real evidence for.
					</p>
				</div>
			)}
		</div>
	);
}
