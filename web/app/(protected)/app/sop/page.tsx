"use client";

import { useState, useTransition } from "react";
import {
	BookOpen,
	Check,
	ChevronDown,
	Copy,
	Download,
	FileText,
	Loader2,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/FadeIn";
import { generateSopAction, type SopTone, type SopType, type SopResult } from "@/lib/auth/action";

const TONES: { value: SopTone; label: string; desc: string }[] = [
	{ value: "formal", label: "Formal Academic", desc: "Professional and structured" },
	{ value: "research", label: "Research Focused", desc: "Emphasizes academic rigor" },
	{ value: "personal", label: "Personal Narrative", desc: "Authentic and compelling" },
];

const TYPES: { value: SopType; label: string; icon: string }[] = [
	{ value: "general", label: "General Admission", icon: "🎓" },
	{ value: "scholarship", label: "Scholarship", icon: "🏆" },
	{ value: "research", label: "Research Program", icon: "🔬" },
];

export default function SOPPage() {
	const [tone, setTone] = useState<SopTone>("formal");
	const [sopType, setSopType] = useState<SopType>("general");
	const [targetProgram, setTargetProgram] = useState("");
	const [targetUniversity, setTargetUniversity] = useState("");
	const [targetCountry, setTargetCountry] = useState("");
	const [highlights, setHighlights] = useState("");
	const [result, setResult] = useState<SopResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleGenerate() {
		setError(null);
		startTransition(async () => {
			const res = await generateSopAction({
				tone,
				sopType,
				targetProgram: targetProgram || undefined,
				targetUniversity: targetUniversity || undefined,
				targetCountry: targetCountry || undefined,
				highlights: highlights || undefined,
			});
			if (!res) {
				setError("Generation failed. Please check your profile is complete and try again.");
				return;
			}
			setResult(res);
		});
	}

	function handleCopy() {
		if (!result) return;
		navigator.clipboard.writeText(result.sop).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleDownload() {
		if (!result) return;
		const blob = new Blob([result.sop], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `sop-${sopType}-${Date.now()}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<FileText className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">SOP Builder</h1>
						<p className="text-sm text-muted-foreground">
							AI-powered Statement of Purpose — profile-aware and tailored to your target
						</p>
					</div>
				</div>
			</FadeIn>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Configuration panel */}
				<div className="space-y-5 lg:col-span-2">
					{/* SOP Type */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">SOP Type</h2>
						<div className="space-y-2">
							{TYPES.map((t) => (
								<button
									key={t.value}
									type="button"
									onClick={() => setSopType(t.value)}
									className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
										sopType === t.value
											? "border-primary bg-primary/5 text-primary"
											: "border-border hover:border-primary/30 hover:bg-muted/50"
									}`}
								>
									<span className="text-base">{t.icon}</span>
									<span className="font-medium">{t.label}</span>
									{sopType === t.value && <Check className="ml-auto h-4 w-4" />}
								</button>
							))}
						</div>
					</section>

					{/* Tone */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">Writing Tone</h2>
						<div className="space-y-2">
							{TONES.map((t) => (
								<button
									key={t.value}
									type="button"
									onClick={() => setTone(t.value)}
									className={`w-full flex flex-col rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
										tone === t.value
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/30 hover:bg-muted/50"
									}`}
								>
									<span className={`font-medium ${tone === t.value ? "text-primary" : ""}`}>
										{t.label}
									</span>
									<span className="text-xs text-muted-foreground">{t.desc}</span>
								</button>
							))}
						</div>
					</section>

					{/* Target details */}
					<section className="rounded-xl border border-border bg-card p-5 space-y-3">
						<h2 className="text-sm font-semibold">Target Details</h2>
						<div>
							<label className="mb-1 block text-xs text-muted-foreground">Program name</label>
							<Input
								value={targetProgram}
								onChange={(e) => setTargetProgram(e.target.value)}
								placeholder="e.g. MS Computer Science"
								className="text-sm"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs text-muted-foreground">University</label>
							<Input
								value={targetUniversity}
								onChange={(e) => setTargetUniversity(e.target.value)}
								placeholder="e.g. TU Munich"
								className="text-sm"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs text-muted-foreground">Country</label>
							<Input
								value={targetCountry}
								onChange={(e) => setTargetCountry(e.target.value)}
								placeholder="e.g. Germany"
								className="text-sm"
							/>
						</div>
					</section>

					{/* Highlights */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-1 text-sm font-semibold">Key Highlights</h2>
						<p className="mb-3 text-xs text-muted-foreground">
							Talking points you want included (research, projects, goals)
						</p>
						<textarea
							value={highlights}
							onChange={(e) => setHighlights(e.target.value)}
							placeholder="e.g. Led a NLP research project at university, interested in LLM optimization..."
							rows={4}
							className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
						/>
					</section>

					<Button
						onClick={handleGenerate}
						disabled={isPending}
						className="w-full gap-2"
						size="lg"
					>
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Sparkles className="h-4 w-4" />
						)}
						{isPending ? "Generating…" : "Generate SOP"}
					</Button>

					{error && (
						<p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}

					<p className="text-center text-xs text-muted-foreground">
						Generated from your profile — complete your profile for better results
					</p>
				</div>

				{/* Output panel */}
				<div className="lg:col-span-3">
					{result ? (
						<FadeIn>
							<div className="rounded-xl border border-border bg-card p-5">
								<div className="mb-4 flex items-center justify-between gap-3">
									<div>
										<h2 className="font-semibold">Your Statement of Purpose</h2>
										<p className="text-xs text-muted-foreground">
											{result.wordCount} words · {result.tone} tone · {result.sopType} SOP
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={handleCopy}
											className="gap-1.5"
										>
											{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
											{copied ? "Copied!" : "Copy"}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={handleDownload}
											className="gap-1.5"
										>
											<Download className="h-3.5 w-3.5" />
											Download
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleGenerate}
											disabled={isPending}
											className="gap-1.5"
										>
											<RefreshCw className="h-3.5 w-3.5" />
											Regenerate
										</Button>
									</div>
								</div>
								<div className="rounded-lg border border-border bg-background p-4">
									<pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
										{result.sop}
									</pre>
								</div>
								<div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
									<p className="text-xs text-amber-700 dark:text-amber-400">
										Review and personalize this SOP before submitting. AI-generated content should be verified and tailored to each application.
									</p>
								</div>
							</div>
						</FadeIn>
					) : (
						<div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<BookOpen className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold">Your SOP will appear here</h3>
							<p className="max-w-xs text-sm text-muted-foreground">
								Configure your SOP options on the left, then click Generate to create a tailored Statement of Purpose.
							</p>
							<p className="mt-4 text-xs text-muted-foreground">
								Profile data is automatically injected for personalization
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
