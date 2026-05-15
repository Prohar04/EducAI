"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useFirstVisit } from "@/lib/hooks/use-first-visit";
import {
	Award,
	BookOpen,
	Briefcase,
	Check,
	ChevronDown,
	ChevronUp,
	Copy,
	Download,
	Loader2,
	Sparkles,
	Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { generateSopAction, type SopTemplate, type SopResult } from "@/lib/auth/action";
import DocumentTemplateSelector, { type SOPTemplate } from "@/components/features/document-template-selector";
import DocumentPreview from "@/components/features/document-preview";
import { Eye } from "lucide-react";

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

async function downloadAsPdf(
	content: string,
	template: string,
	targetUniversity: string,
	setDownloading: (v: boolean) => void,
) {
	setDownloading(true);
	try {
		const API = process.env.NEXT_PUBLIC_BACKEND_URL || "";
		const res = await fetch(`${API}/sop/download-pdf`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ content, template, targetUniversity }),
		});
		if (!res.ok) throw new Error("Download failed");
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `SOP-${new Date().toISOString().slice(0, 10)}.pdf`;
		a.click();
		URL.revokeObjectURL(url);
	} catch {
		// Fallback to browser print
		const win = window.open("", "_blank");
		if (!win) return;
		const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Georgia,serif;font-size:12pt;line-height:1.7;color:#000;padding:1in 1.1in}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${escaped}</pre><script>window.onload=function(){window.print()}<\/script></body></html>`);
		win.document.close();
	} finally {
		setDownloading(false);
	}
}

export default function SOPPage() {
	const isFirstVisit = useFirstVisit("sop");
	const [sopTemplate, setSopTemplate] = useState<SopTemplate>("formal-academic");
	const [docTemplate, setDocTemplate] = useState<SOPTemplate>("standard_academic");
	const [result, setResult] = useState<SopResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [previewMode, setPreviewMode] = useState<"draft" | "ai">("draft");

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

	function buildDraftSop(): string {
		const lines: string[] = [];
		if (targetProgram || targetUniversity) {
			lines.push(`Statement of Purpose — ${targetProgram || "Graduate Program"}${targetUniversity ? ` at ${targetUniversity}` : ""}${targetCountry ? `, ${targetCountry}` : ""}`);
			lines.push("─".repeat(60));
			lines.push("");
		}
		if (sopPurpose) { lines.push(sopPurpose); lines.push(""); }
		if (motivation) { lines.push(motivation); lines.push(""); }
		if (academicBackground) { lines.push(academicBackground); lines.push(""); }
		if (whySubject) { lines.push(whySubject); lines.push(""); }
		if (researchInterests) { lines.push(researchInterests); lines.push(""); }
		if (workExperience) { lines.push(workExperience); lines.push(""); }
		if (projects) { lines.push(projects); lines.push(""); }
		if (achievements) { lines.push(achievements); lines.push(""); }
		if (whyUniversity || whyCountry) {
			lines.push("Why this university / country");
			if (whyUniversity) lines.push(whyUniversity);
			if (whyCountry) lines.push(whyCountry);
			lines.push("");
		}
		if (careerGoals) { lines.push(careerGoals); lines.push(""); }
		if (challengesOvercome) { lines.push(challengesOvercome); lines.push(""); }
		if (scholarshipAngle) { lines.push(scholarshipAngle); lines.push(""); }
		if (highlights) { lines.push(highlights); lines.push(""); }
		return lines.join("\n");
	}

	function handleGenerate() {
		setError(null);
		setPreviewMode("ai");
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
		downloadAsPdf(result.sop, docTemplate, targetUniversity, setDownloading);
	}

	return (
		<div className={`${isFirstVisit ? "page-enter" : ""} mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8`}>
			<PageHeader
				animation="sop"
				title={<><span className="gradient-text">SOP</span> Builder</>}
				subtitle="10 professional templates — profile-aware and fully customizable"
			/>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Config panel */}
				<div className="space-y-4 lg:col-span-2">

					{/* Document style selector */}
					<div className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">Document Style</h2>
						<DocumentTemplateSelector mode="sop" selected={docTemplate} onSelect={(id) => setDocTemplate(id as SOPTemplate)} />
					</div>

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

				{/* Output panel — always visible with live draft or AI result */}
				<div className="lg:col-span-3">
					{(result || buildDraftSop().trim()) ? (
						<div className="rounded-xl border border-border bg-card p-5">
							<div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
								<div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
									<button
										type="button"
										onClick={() => setPreviewMode("draft")}
										className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${previewMode === "draft" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
									>
										<Eye className="h-3 w-3" /> Live Draft
									</button>
									{result && (
										<button
											type="button"
											onClick={() => setPreviewMode("ai")}
											className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${previewMode === "ai" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
										>
											<Sparkles className="h-3 w-3" /> AI Result
											{result && <span className="ml-1 text-muted-foreground">({result.wordCount}w)</span>}
										</button>
									)}
								</div>
								<div className="flex items-center gap-2 flex-wrap">
									{previewMode === "ai" && result && (
										<>
											<Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
												{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
												{copied ? "Copied!" : "Copy"}
											</Button>
											<Button variant="outline" size="sm" onClick={handleDownloadTxt} className="gap-1.5">
												<Download className="h-3.5 w-3.5" /> .txt
											</Button>
											<Button variant="default" size="sm" onClick={handleDownloadPdf} disabled={downloading} className="gap-1.5">
												{downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
												PDF
											</Button>
										</>
									)}
									<Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isPending} className="gap-1.5">
										{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
										{isPending ? "Generating…" : "Generate with AI"}
									</Button>
								</div>
							</div>
							<div className="rounded-lg border border-border bg-muted/30 max-h-[70vh] overflow-y-auto p-3">
								<DocumentPreview
									content={previewMode === "ai" && result ? result.sop : buildDraftSop()}
									template={sopTemplate}
									mode="sop"
								/>
							</div>
							{previewMode === "draft" && (
								<div className="mt-3 rounded-lg border border-[#4A90D9]/20 bg-[#4A90D9]/5 px-3 py-2">
									<p className="text-xs text-[#4A90D9]">
										Live draft from your inputs — click &ldquo;Generate with AI&rdquo; to produce a polished SOP.
									</p>
								</div>
							)}
							{previewMode === "ai" && result && (
								<div className="mt-3 rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-3 py-2">
									<p className="text-xs text-[#C49A3C]">
										AI-generated — review, personalize, and tailor to each application before submitting.
									</p>
								</div>
							)}
						</div>
					) : (
						<div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<BookOpen className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold">Start typing to see a live preview</h3>
							<p className="max-w-xs text-sm text-muted-foreground">
								Fill in the target application above — your SOP draft will appear here instantly.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
