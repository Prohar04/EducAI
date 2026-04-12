"use client";

import { useState, useTransition } from "react";
import {
	Briefcase,
	Check,
	Copy,
	Download,
	FileText,
	FlaskConical,
	GraduationCap,
	Loader2,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import { generateCvAction, type CvStyle, type CvResult } from "@/lib/auth/action";

const STYLES: { value: CvStyle; label: string; icon: React.ReactNode; desc: string }[] = [
	{
		value: "academic",
		label: "Academic CV",
		icon: <GraduationCap className="h-5 w-5" />,
		desc: "Education, research, publications, awards",
	},
	{
		value: "research",
		label: "Research CV",
		icon: <FlaskConical className="h-5 w-5" />,
		desc: "Research-first with projects and publications",
	},
	{
		value: "industry",
		label: "Industry CV",
		icon: <Briefcase className="h-5 w-5" />,
		desc: "ATS-optimized for industry positions",
	},
];

export default function CVPage() {
	const [cvStyle, setCvStyle] = useState<CvStyle>("academic");
	const [highlights, setHighlights] = useState("");
	const [result, setResult] = useState<CvResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isPending, startTransition] = useTransition();

	function handleGenerate() {
		setError(null);
		startTransition(async () => {
			const res = await generateCvAction({
				cvStyle,
				highlights: highlights || undefined,
			});
			if (!res) {
				setError("CV generation failed. Please ensure your profile is complete and try again.");
				return;
			}
			setResult(res);
		});
	}

	function handleCopy() {
		if (!result) return;
		navigator.clipboard.writeText(result.cv).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleDownload() {
		if (!result) return;
		const blob = new Blob([result.cv], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `cv-${cvStyle}-${Date.now()}.txt`;
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
						<h1 className="text-2xl font-bold tracking-tight">CV Builder</h1>
						<p className="text-sm text-muted-foreground">
							ATS-friendly academic CV generated from your profile
						</p>
					</div>
				</div>
			</FadeIn>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Config panel */}
				<div className="space-y-5 lg:col-span-2">
					{/* CV Style */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">CV Style</h2>
						<div className="space-y-2">
							{STYLES.map((s) => (
								<button
									key={s.value}
									type="button"
									onClick={() => setCvStyle(s.value)}
									className={`w-full flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
										cvStyle === s.value
											? "border-primary bg-primary/5"
											: "border-border hover:border-primary/30 hover:bg-muted/50"
									}`}
								>
									<span className={`mt-0.5 shrink-0 ${cvStyle === s.value ? "text-primary" : "text-muted-foreground"}`}>
										{s.icon}
									</span>
									<div>
										<p className={`font-medium text-sm ${cvStyle === s.value ? "text-primary" : ""}`}>
											{s.label}
										</p>
										<p className="text-xs text-muted-foreground">{s.desc}</p>
									</div>
									{cvStyle === s.value && <Check className="ml-auto h-4 w-4 text-primary shrink-0" />}
								</button>
							))}
						</div>
					</section>

					{/* Sections preview */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">Included Sections</h2>
						<div className="space-y-1.5">
							{STYLES.find(s => s.value === cvStyle)?.desc && (
								<>
									{cvStyle === "academic" && ["Education", "Research Experience", "Skills", "Test Scores", "Awards"].map(s => (
										<div key={s} className="flex items-center gap-2 text-sm">
											<Check className="h-3.5 w-3.5 text-emerald-500" />
											{s}
										</div>
									))}
									{cvStyle === "research" && ["Research Experience", "Publications", "Projects", "Technical Skills", "Education"].map(s => (
										<div key={s} className="flex items-center gap-2 text-sm">
											<Check className="h-3.5 w-3.5 text-emerald-500" />
											{s}
										</div>
									))}
									{cvStyle === "industry" && ["Summary", "Education", "Experience", "Technical Skills", "Certifications"].map(s => (
										<div key={s} className="flex items-center gap-2 text-sm">
											<Check className="h-3.5 w-3.5 text-emerald-500" />
											{s}
										</div>
									))}
								</>
							)}
						</div>
					</section>

					{/* Highlights */}
					<section className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-1 text-sm font-semibold">Additional Details</h2>
						<p className="mb-3 text-xs text-muted-foreground">
							Projects, publications, awards, or skills to highlight
						</p>
						<textarea
							value={highlights}
							onChange={(e) => setHighlights(e.target.value)}
							placeholder="e.g. Published paper on NLP at EMNLP 2025, 3 years Python experience, Dean's List..."
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
						{isPending ? "Building CV…" : "Build My CV"}
					</Button>

					{error && (
						<p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
							{error}
						</p>
					)}

					<p className="text-center text-xs text-muted-foreground">
						Profile data is automatically used — complete your profile for best results
					</p>
				</div>

				{/* Output panel */}
				<div className="lg:col-span-3">
					{result ? (
						<FadeIn>
							<div className="rounded-xl border border-border bg-card p-5">
								<div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
									<div>
										<h2 className="font-semibold">Your CV</h2>
										<p className="text-xs text-muted-foreground capitalize">
											{result.style} style · {result.sections.join(" · ")}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
											{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
											{copied ? "Copied!" : "Copy"}
										</Button>
										<Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
											<Download className="h-3.5 w-3.5" />
											.txt
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleGenerate}
											disabled={isPending}
											className="gap-1.5"
										>
											<RefreshCw className="h-3.5 w-3.5" />
											Rebuild
										</Button>
									</div>
								</div>
								<div className="rounded-lg border border-border bg-background p-4 font-mono">
									<pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
										{result.cv}
									</pre>
								</div>
								<div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
									<p className="text-xs text-amber-700 dark:text-amber-400">
										Review, edit, and personalize before submitting. Fill in any bracketed placeholders with your actual information.
									</p>
								</div>
							</div>
						</FadeIn>
					) : (
						<div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<FileText className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold">Your CV will appear here</h3>
							<p className="max-w-xs text-sm text-muted-foreground">
								Select your CV style and click Build to generate an ATS-friendly academic CV from your profile.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
