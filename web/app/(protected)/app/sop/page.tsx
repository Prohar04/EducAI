"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";

const SopAnimation = dynamic(
	() => import("@/components/animations/sop-animation"),
	{ ssr: false, loading: () => null },
);
import {
	Award,
	BookOpen,
	Briefcase,
	Check,
	ChevronDown,
	ChevronUp,
	Copy,
	Download,
	FileText,
	Loader2,
	RefreshCw,
	Sparkles,
	Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { generateSopAction, type SopTemplate, type SopResult } from "@/lib/auth/action";

const TEMPLATES: { value: SopTemplate; label: string; desc: string; badge?: string }[] = [
	{ value: "formal-academic", label: "Formal Academic", desc: "Professional, structured academic prose" },
	{ value: "research-focused", label: "Research Focused", desc: "Emphasizes research trajectory & curiosity", badge: "PhD" },
	{ value: "scholarship-focused", label: "Scholarship Focused", desc: "Merit, leadership, community impact", badge: "Scholarship" },
	{ value: "personal-story", label: "Personal Story Driven", desc: "Narrative-driven, defining moment hook" },
	{ value: "professional-career", label: "Professional / Career", desc: "Career goals & professional motivation" },
	{ value: "technical-engineering", label: "Technical / Engineering", desc: "Technical skills, projects, engineering focus" },
	{ value: "business-management", label: "Business / Management", desc: "Leadership, metrics, strategic thinking", badge: "MBA" },
	{ value: "compact-direct", label: "Compact & Direct", desc: "Under 500 words, crisp and to the point" },
	{ value: "highly-persuasive", label: "Highly Persuasive", desc: "Rhetorical, compelling, memorable" },
	{ value: "phd-proposal", label: "PhD Research Proposal", desc: "Research problem, methodology, supervisor fit", badge: "PhD" },
];

function SectionToggle({
	title,
	icon,
	children,
	defaultOpen = false,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	defaultOpen?: boolean;
}) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<div className="rounded-xl border border-border bg-card overflow-hidden">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
			>
				<div className="flex items-center gap-2">
					<span className="text-primary">{icon}</span>
					<span className="font-medium text-sm">{title}</span>
				</div>
				{open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
			</button>
			{open && <div className="px-5 pb-5 pt-1 space-y-3 border-t border-border">{children}</div>}
		</div>
	);
}

function FieldLabel({ children }: { children: React.ReactNode }) {
	return <label className="block text-xs text-muted-foreground mb-1">{children}</label>;
}

function TextArea({ value, onChange, placeholder, rows = 3 }: {
	value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
	return (
		<textarea
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			rows={rows}
			className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
		/>
	);
}

function downloadAsPdf(content: string, filename: string) {
	const win = window.open("", "_blank");
	if (!win) return;
	const escaped = content
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${filename}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.7; color: #000; background: #fff; }
  p { margin-bottom: 1em; text-align: justify; }
  pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: inherit; line-height: inherit; }
  @page { margin: 1in 1.1in; }
  @media print { body { margin: 0; } }
</style>
</head>
<body><pre>${escaped}</pre>
<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
	win.document.close();
}

export default function SOPPage() {
	const [sopTemplate, setSopTemplate] = useState<SopTemplate>("formal-academic");
	const [result, setResult] = useState<SopResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isPending, startTransition] = useTransition();

	// Target fields
	const [targetProgram, setTargetProgram] = useState("");
	const [targetUniversity, setTargetUniversity] = useState("");
	const [targetCountry, setTargetCountry] = useState("");
	const [targetIntake, setTargetIntake] = useState("");
	const [degreeLevel, setDegreeLevel] = useState("");

	// Context fields
	const [sopPurpose, setSopPurpose] = useState("");
	const [academicBackground, setAcademicBackground] = useState("");
	const [motivation, setMotivation] = useState("");
	const [whySubject, setWhySubject] = useState("");
	const [whyUniversity, setWhyUniversity] = useState("");
	const [whyCountry, setWhyCountry] = useState("");
	const [careerGoals, setCareerGoals] = useState("");
	const [researchInterests, setResearchInterests] = useState("");
	const [achievements, setAchievements] = useState("");
	const [workExperience, setWorkExperience] = useState("");
	const [projects, setProjects] = useState("");
	const [challengesOvercome, setChallengesOvercome] = useState("");
	const [scholarshipAngle, setScholarshipAngle] = useState("");
	const [highlights, setHighlights] = useState("");

	function handleGenerate() {
		setError(null);
		startTransition(async () => {
			const res = await generateSopAction({
				sopTemplate,
				targetProgram: targetProgram || undefined,
				targetUniversity: targetUniversity || undefined,
				targetCountry: targetCountry || undefined,
				targetIntake: targetIntake || undefined,
				degreeLevel: degreeLevel || undefined,
				sopPurpose: sopPurpose || undefined,
				academicBackground: academicBackground || undefined,
				motivation: motivation || undefined,
				whySubject: whySubject || undefined,
				whyUniversity: whyUniversity || undefined,
				whyCountry: whyCountry || undefined,
				careerGoals: careerGoals || undefined,
				researchInterests: researchInterests || undefined,
				achievements: achievements || undefined,
				workExperience: workExperience || undefined,
				projects: projects || undefined,
				challengesOvercome: challengesOvercome || undefined,
				scholarshipAngle: sopTemplate === "scholarship-focused" ? (scholarshipAngle || undefined) : undefined,
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

	function handleDownloadTxt() {
		if (!result) return;
		const blob = new Blob([result.sop], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `sop-${sopTemplate}-${Date.now()}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleDownloadPdf() {
		if (!result) return;
		downloadAsPdf(result.sop, `SOP-${sopTemplate}`);
	}

	return (
		<div className="page-enter mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div style={{ position: "relative" }}>
					<div
						aria-hidden="true"
						className="hidden md:block"
						style={{
							position: "absolute",
							right: 0,
							top: "50%",
							transform: "translateY(-50%)",
							width: 340,
							height: 180,
							opacity: 0.65,
							pointerEvents: "none",
							zIndex: 0,
						}}
					>
						<SopAnimation />
					</div>
					<div
						className="flex items-center gap-3 mb-1"
						style={{ position: "relative", zIndex: 1 }}
					>
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
							<FileText className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-bold tracking-tight">SOP Builder</h1>
							<p className="text-sm text-muted-foreground">
								10 professional templates — profile-aware and fully customizable
							</p>
						</div>
					</div>
				</div>
			</FadeIn>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Config panel */}
				<div className="space-y-4 lg:col-span-2">

					{/* Template selector */}
					<div className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">SOP Template</h2>
						<StaggerChildren stagger={0.04} className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
							{TEMPLATES.map((t) => (
								<StaggerItem key={t.value}>
									<motion.button
										type="button"
										onClick={() => setSopTemplate(t.value)}
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										transition={{ duration: 0.12 }}
										className={`w-full flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
											sopTemplate === t.value
												? "border-primary bg-primary/5"
												: "border-border hover:border-primary/30 hover:bg-muted/50"
										}`}
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-1.5">
												<span className={`font-medium text-sm ${sopTemplate === t.value ? "text-primary" : ""}`}>
													{t.label}
												</span>
												{t.badge && (
													<span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
														{t.badge}
													</span>
												)}
											</div>
											<p className="text-xs text-muted-foreground truncate">{t.desc}</p>
										</div>
										<AnimatePresence>
											{sopTemplate === t.value && (
												<motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
													<Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
												</motion.span>
											)}
										</AnimatePresence>
									</motion.button>
								</StaggerItem>
							))}
						</StaggerChildren>
					</div>

					{/* Target details */}
					<SectionToggle title="Target Application" icon={<Target className="h-4 w-4" />} defaultOpen={true}>
						<div>
							<FieldLabel>Target Program</FieldLabel>
							<Input value={targetProgram} onChange={(e) => setTargetProgram(e.target.value)} placeholder="e.g. MS Computer Science" className="text-sm" />
						</div>
						<div>
							<FieldLabel>Target University</FieldLabel>
							<Input value={targetUniversity} onChange={(e) => setTargetUniversity(e.target.value)} placeholder="e.g. TU Munich" className="text-sm" />
						</div>
						<div>
							<FieldLabel>Target Country</FieldLabel>
							<Input value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} placeholder="e.g. Germany" className="text-sm" />
						</div>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<FieldLabel>Degree Level</FieldLabel>
								<Input value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value)} placeholder="MS / PhD / MBA" className="text-sm" />
							</div>
							<div>
								<FieldLabel>Intake</FieldLabel>
								<Input value={targetIntake} onChange={(e) => setTargetIntake(e.target.value)} placeholder="Fall 2026" className="text-sm" />
							</div>
						</div>
					</SectionToggle>

					{/* Motivation & Background */}
					<SectionToggle title="Motivation & Background" icon={<BookOpen className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>SOP Purpose / Angle</FieldLabel>
							<TextArea value={sopPurpose} onChange={setSopPurpose} placeholder="e.g. Scholarship application emphasizing rural development impact..." rows={2} />
						</div>
						<div>
							<FieldLabel>Core Motivation</FieldLabel>
							<TextArea value={motivation} onChange={setMotivation} placeholder="Why you want to pursue this degree..." rows={2} />
						</div>
						<div>
							<FieldLabel>Why This Subject?</FieldLabel>
							<TextArea value={whySubject} onChange={setWhySubject} placeholder="What draws you to this field specifically..." rows={2} />
						</div>
						<div>
							<FieldLabel>Academic Background Summary</FieldLabel>
							<TextArea value={academicBackground} onChange={setAcademicBackground} placeholder="Your academic history and relevant coursework..." rows={3} />
						</div>
					</SectionToggle>

					{/* Why This Place */}
					<SectionToggle title="Why This University / Country" icon={<Target className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Why This University?</FieldLabel>
							<TextArea value={whyUniversity} onChange={setWhyUniversity} placeholder="Specific programs, professors, labs, or resources that attract you..." rows={2} />
						</div>
						<div>
							<FieldLabel>Why This Country?</FieldLabel>
							<TextArea value={whyCountry} onChange={setWhyCountry} placeholder="Academic culture, research environment, career opportunities..." rows={2} />
						</div>
					</SectionToggle>

					{/* Goals & Research */}
					<SectionToggle title="Goals & Research" icon={<Sparkles className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Career Goals</FieldLabel>
							<TextArea value={careerGoals} onChange={setCareerGoals} placeholder="Short and long-term professional goals..." rows={2} />
						</div>
						<div>
							<FieldLabel>Research Interests</FieldLabel>
							<TextArea value={researchInterests} onChange={setResearchInterests} placeholder="Specific topics, questions, or methodologies you want to explore..." rows={2} />
						</div>
					</SectionToggle>

					{/* Experience & Achievements */}
					<SectionToggle title="Experience & Achievements" icon={<Briefcase className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Key Achievements</FieldLabel>
							<TextArea value={achievements} onChange={setAchievements} placeholder="Awards, publications, honours, test scores, notable accomplishments..." rows={3} />
						</div>
						<div>
							<FieldLabel>Work / Internship Experience</FieldLabel>
							<TextArea value={workExperience} onChange={setWorkExperience} placeholder="Roles, companies, what you did and learned..." rows={3} />
						</div>
						<div>
							<FieldLabel>Projects</FieldLabel>
							<TextArea value={projects} onChange={setProjects} placeholder="Research projects, personal projects, open-source contributions..." rows={2} />
						</div>
					</SectionToggle>

					{/* Personal & Extras */}
					<SectionToggle title="Personal & Additional" icon={<Award className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Challenges Overcome</FieldLabel>
							<TextArea value={challengesOvercome} onChange={setChallengesOvercome} placeholder="Personal or academic challenges that shaped your journey..." rows={2} />
						</div>
						{sopTemplate === "scholarship-focused" && (
							<div>
								<FieldLabel>Scholarship Angle</FieldLabel>
								<TextArea value={scholarshipAngle} onChange={setScholarshipAngle} placeholder="How you will contribute to society / community impact..." rows={2} />
							</div>
						)}
						<div>
							<FieldLabel>Additional Highlights</FieldLabel>
							<TextArea value={highlights} onChange={setHighlights} placeholder="Anything else you want included..." rows={2} />
						</div>
					</SectionToggle>

					<Button onClick={handleGenerate} disabled={isPending} className="w-full gap-2" size="lg">
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
						{isPending ? "Generating…" : "Generate SOP"}
					</Button>

					{error && (
						<p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
					)}

					<p className="text-center text-xs text-muted-foreground">
						Profile data is auto-injected — complete your profile for better results
					</p>
				</div>

				{/* Output panel */}
				<div className="lg:col-span-3">
					{result ? (
						<FadeIn>
							<div className="rounded-xl border border-border bg-card p-5">
								<div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
									<div>
										<h2 className="font-semibold">Your Statement of Purpose</h2>
										<p className="text-xs text-muted-foreground">
											{result.wordCount} words · {TEMPLATES.find(t => t.value === result.template)?.label ?? result.template}
										</p>
									</div>
									<div className="flex items-center gap-2 flex-wrap">
										<Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
											{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
											{copied ? "Copied!" : "Copy"}
										</Button>
										<Button variant="outline" size="sm" onClick={handleDownloadTxt} className="gap-1.5">
											<Download className="h-3.5 w-3.5" />
											.txt
										</Button>
										<Button variant="default" size="sm" onClick={handleDownloadPdf} className="gap-1.5">
											<Download className="h-3.5 w-3.5" />
											PDF
										</Button>
										<Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isPending} className="gap-1.5">
											<RefreshCw className="h-3.5 w-3.5" />
											Regenerate
										</Button>
									</div>
								</div>
								<div className="rounded-lg border border-border bg-background p-4 max-h-[70vh] overflow-y-auto">
									<pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
										{result.sop}
									</pre>
								</div>
								<div className="mt-4 rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-3 py-2">
									<p className="text-xs text-[#C49A3C]">
										AI-generated — review, personalize, and tailor to each application before submitting.
									</p>
								</div>
							</div>
						</FadeIn>
					) : (
						<div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<BookOpen className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold">Your SOP will appear here</h3>
							<p className="max-w-xs text-sm text-muted-foreground">
								Pick a template, fill in your context, and click Generate.
							</p>
							<div className="mt-6 grid grid-cols-2 gap-2 text-left max-w-xs w-full">
								{["10 professional templates", "PDF & TXT download", "Profile auto-injected", "600–850 words by default"].map(f => (
									<div key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<Check className="h-3 w-3 text-[#3D9970] shrink-0" />
										{f}
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
