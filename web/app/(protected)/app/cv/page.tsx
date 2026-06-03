"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useFirstVisit } from "@/lib/hooks/use-first-visit";
import {
	Award,
	Briefcase,
	Check,
	ChevronDown,
	ChevronUp,
	Copy,
	Download,
	Edit3,
	FileText,
	Loader2,
	Save,
	Sparkles,
	User,
	X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { generateCvAction, type CvTemplate, type CvResult } from "@/lib/auth/action";
import DocumentTemplateSelector, { type CVTemplate } from "@/components/features/document-template-selector";
import DocumentPreview from "@/components/features/document-preview";
import { Eye } from "lucide-react";

const TEMPLATES: { value: CvTemplate; label: string; desc: string; badge?: string }[] = [
	{ value: "minimal-academic", label: "Minimal Academic", desc: "Clean STEM grad CV — education & research first" },
	{ value: "research-focused", label: "Research Focused", desc: "Research experience & publications lead", badge: "PhD" },
	{ value: "modern-professional", label: "Modern Professional", desc: "Summary-led, work experience, projects" },
	{ value: "scholarship-focused", label: "Scholarship Focused", desc: "Achievements & awards prominence", badge: "Scholarship" },
	{ value: "international-student", label: "International Student", desc: "Test scores & language proficiency featured" },
	{ value: "technical-engineering", label: "Technical / Engineering", desc: "Skills & projects lead, quantified impact" },
	{ value: "business-management", label: "Business / Management", desc: "Leadership, strategy, business metrics" },
	{ value: "clean-classic", label: "Clean Classic", desc: "Universal chronological format" },
	{ value: "compact-one-page", label: "Compact One-Page", desc: "Tight, all-essentials on one page" },
	{ value: "phd-research", label: "PhD Research Profile", desc: "Research trajectory & publications", badge: "PhD" },
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
	setDownloading: (v: boolean) => void,
) {
	setDownloading(true);
	try {
		const API = process.env.NEXT_PUBLIC_BACKEND_URL || "";
		const res = await fetch(`${API}/cv/download-pdf`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ content, template }),
		});
		if (!res.ok) throw new Error("Download failed");
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `CV-${new Date().toISOString().slice(0, 10)}.pdf`;
		a.click();
		URL.revokeObjectURL(url);
	} catch {
		const win = window.open("", "_blank");
		if (!win) return;
		const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.5;color:#000;padding:0.85in 1in}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${escaped}</pre><script>window.onload=function(){window.print()}<\/script></body></html>`);
		win.document.close();
	} finally {
		setDownloading(false);
	}
}

// ── Inline CV Editor ─────────────────────────────────────────────────────────

function InlineCvEditor({
	initialContent,
	onSave,
	onDiscard,
}: {
	initialContent: string;
	onSave: (text: string) => void;
	onDiscard: () => void;
}) {
	const [text, setText] = useState(initialContent);
	const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-2 rounded-lg border border-[#4A90D9]/25 bg-[#4A90D9]/5 px-3 py-2">
				<p className="text-xs text-[#4A90D9]">
					Editing your CV directly — changes won&rsquo;t affect the AI generation inputs.
					{" "}<span className="font-medium">{wordCount} words</span>
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={onDiscard}
						className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
					>
						<X className="h-3 w-3" /> Discard
					</button>
					<button
						type="button"
						onClick={() => onSave(text)}
						className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						<Save className="h-3 w-3" /> Save edits
					</button>
				</div>
			</div>
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="w-full min-h-[60vh] rounded-lg border border-border bg-background p-4 font-mono text-xs text-foreground leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-y"
				spellCheck
				placeholder="Your CV content..."
			/>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onDiscard}
					className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
				>
					<X className="h-3 w-3" /> Discard changes
				</button>
				<button
					type="button"
					onClick={() => onSave(text)}
					className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					<Save className="h-3 w-3" /> Save &amp; preview
				</button>
			</div>
		</div>
	);
}

export default function CVPage() {
	const isFirstVisit = useFirstVisit("cv");
	const [cvTemplate, setCvTemplate] = useState<CvTemplate>("minimal-academic");
	const [docTemplate, setDocTemplate] = useState<CVTemplate>("us_standard");
	const [result, setResult] = useState<CvResult | null>(null);
	const [editedCv, setEditedCv] = useState<string | null>(null); // user-edited version
	const [editMode, setEditMode] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [previewMode, setPreviewMode] = useState<"draft" | "ai">("draft");

	// The active CV content: user edits override the AI result
	const activeCv = editedCv ?? result?.cv ?? "";
	const hasEdits = editedCv !== null && editedCv !== result?.cv;

	// Rich form state
	const [phone, setPhone] = useState("");
	const [linkedin, setLinkedin] = useState("");
	const [github, setGithub] = useState("");
	const [summary, setSummary] = useState("");
	const [targetDegree, setTargetDegree] = useState("");
	const [targetProgram, setTargetProgram] = useState("");
	const [targetUniversity, setTargetUniversity] = useState("");
	const [targetCountry, setTargetCountry] = useState("");
	const [thesisOrResearch, setThesisOrResearch] = useState("");
	const [publications, setPublications] = useState("");
	const [workExperience, setWorkExperience] = useState("");
	const [internships, setInternships] = useState("");
	const [technicalSkills, setTechnicalSkills] = useState("");
	const [softSkills, setSoftSkills] = useState("");
	const [projects, setProjects] = useState("");
	const [certifications, setCertifications] = useState("");
	const [awards, setAwards] = useState("");
	const [extracurriculars, setExtracurriculars] = useState("");
	const [volunteering, setVolunteering] = useState("");
	const [references, setReferences] = useState("");
	const [highlights, setHighlights] = useState("");

	// Build a client-side draft preview from form fields (no API call)
	function buildDraftCv(): string {
		const contactParts = [phone, linkedin, github].filter(Boolean);
		const lines: string[] = [];
		lines.push("[Your Name — from profile]");
		if (contactParts.length) lines.push(contactParts.join("  |  "));
		lines.push("");
		if (targetDegree || targetProgram || targetUniversity) {
			lines.push("TARGET APPLICATION");
			lines.push("──────────────────────────────");
			if (targetDegree) lines.push(`Degree: ${targetDegree}`);
			if (targetProgram) lines.push(`Program: ${targetProgram}`);
			if (targetUniversity) lines.push(`University: ${targetUniversity}`);
			if (targetCountry) lines.push(`Country: ${targetCountry}`);
			lines.push("");
		}
		if (summary) {
			lines.push("SUMMARY");
			lines.push("──────────────────────────────");
			lines.push(summary);
			lines.push("");
		}
		if (workExperience || internships) {
			lines.push("EXPERIENCE");
			lines.push("──────────────────────────────");
			if (workExperience) lines.push(workExperience);
			if (internships) { lines.push(""); lines.push(internships); }
			lines.push("");
		}
		if (technicalSkills || softSkills) {
			lines.push("SKILLS");
			lines.push("──────────────────────────────");
			if (technicalSkills) lines.push(`Technical: ${technicalSkills}`);
			if (softSkills) lines.push(`Soft: ${softSkills}`);
			lines.push("");
		}
		if (projects) {
			lines.push("PROJECTS");
			lines.push("──────────────────────────────");
			lines.push(projects);
			lines.push("");
		}
		if (thesisOrResearch || publications) {
			lines.push("RESEARCH & PUBLICATIONS");
			lines.push("──────────────────────────────");
			if (thesisOrResearch) lines.push(thesisOrResearch);
			if (publications) { lines.push(""); lines.push(publications); }
			lines.push("");
		}
		if (certifications || awards) {
			lines.push("AWARDS & CERTIFICATIONS");
			lines.push("──────────────────────────────");
			if (certifications) lines.push(certifications);
			if (awards) lines.push(awards);
			lines.push("");
		}
		if (extracurriculars || volunteering) {
			lines.push("ACTIVITIES");
			lines.push("──────────────────────────────");
			if (extracurriculars) lines.push(extracurriculars);
			if (volunteering) lines.push(volunteering);
			lines.push("");
		}
		if (highlights) {
			lines.push("ADDITIONAL");
			lines.push("──────────────────────────────");
			lines.push(highlights);
		}
		return lines.join("\n");
	}

	function handleGenerate() {
		setError(null);
		setPreviewMode("ai");
		startTransition(async () => {
			const res = await generateCvAction({
				cvTemplate,
				phone: phone || undefined,
				linkedin: linkedin || undefined,
				github: github || undefined,
				summary: summary || undefined,
				targetDegree: targetDegree || undefined,
				targetProgram: targetProgram || undefined,
				targetUniversity: targetUniversity || undefined,
				targetCountry: targetCountry || undefined,
				thesisOrResearch: thesisOrResearch || undefined,
				publications: publications || undefined,
				workExperience: workExperience || undefined,
				internships: internships || undefined,
				technicalSkills: technicalSkills || undefined,
				softSkills: softSkills || undefined,
				projects: projects || undefined,
				certifications: certifications || undefined,
				awards: awards || undefined,
				extracurriculars: extracurriculars || undefined,
				volunteering: volunteering || undefined,
				references: references || undefined,
				highlights: highlights || undefined,
			});
			if (!res) {
				setError("CV generation failed. Please ensure your profile is complete and try again.");
				return;
			}
			setResult(res);
			setEditedCv(null); // reset edits when regenerating
			setEditMode(false);
		});
	}

	function handleCopy() {
		if (!activeCv) return;
		navigator.clipboard.writeText(activeCv).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleDownloadTxt() {
		if (!activeCv) return;
		const blob = new Blob([activeCv], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `cv-${cvTemplate}-${Date.now()}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleDownloadPdf() {
		if (!activeCv) return;
		downloadAsPdf(activeCv, docTemplate, setDownloading);
	}

	function handleSaveEdit(text: string) {
		setEditedCv(text);
		setEditMode(false);
	}

	function handleDiscardEdit() {
		setEditedCv(null);
		setEditMode(false);
	}

	return (
		<div className={`${isFirstVisit ? "page-enter" : ""} mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8`}>
			<PageHeader
				animation="cv"
				title={<><span className="gradient-text">CV</span> Builder</>}
				subtitle="10 professional templates — profile-aware and fully customizable"
			/>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Config panel */}
				<div className="space-y-4 lg:col-span-2">

					{/* Document style selector */}
					<div className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">Document Style</h2>
						<DocumentTemplateSelector mode="cv" selected={docTemplate} onSelect={(id) => setDocTemplate(id as CVTemplate)} />
					</div>

					{/* Template selector */}
					<div className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">Template</h2>
						<StaggerChildren stagger={0.04} className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
							{TEMPLATES.map((t) => (
								<StaggerItem key={t.value}>
									<motion.button
										type="button"
										onClick={() => setCvTemplate(t.value)}
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
										transition={{ duration: 0.12 }}
										className={`w-full flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
											cvTemplate === t.value
												? "border-primary bg-primary/5"
												: "border-border hover:border-primary/30 hover:bg-muted/50"
										}`}
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-1.5">
												<span className={`font-medium text-sm ${cvTemplate === t.value ? "text-primary" : ""}`}>
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
											{cvTemplate === t.value && (
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

					{/* Rich form sections */}
					<SectionToggle title="Contact & Links" icon={<User className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Phone</FieldLabel>
							<Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="text-sm" />
						</div>
						<div>
							<FieldLabel>LinkedIn URL</FieldLabel>
							<Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname" className="text-sm" />
						</div>
						<div>
							<FieldLabel>GitHub / Portfolio</FieldLabel>
							<Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="github.com/yourname" className="text-sm" />
						</div>
					</SectionToggle>

					<SectionToggle title="Target Application" icon={<FileText className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Target Degree</FieldLabel>
							<Input value={targetDegree} onChange={(e) => setTargetDegree(e.target.value)} placeholder="e.g. MS, PhD, MBA" className="text-sm" />
						</div>
						<div>
							<FieldLabel>Target Program</FieldLabel>
							<Input value={targetProgram} onChange={(e) => setTargetProgram(e.target.value)} placeholder="e.g. Computer Science" className="text-sm" />
						</div>
						<div>
							<FieldLabel>Target University</FieldLabel>
							<Input value={targetUniversity} onChange={(e) => setTargetUniversity(e.target.value)} placeholder="e.g. TU Munich" className="text-sm" />
						</div>
						<div>
							<FieldLabel>Target Country</FieldLabel>
							<Input value={targetCountry} onChange={(e) => setTargetCountry(e.target.value)} placeholder="e.g. Germany" className="text-sm" />
						</div>
					</SectionToggle>

					<SectionToggle title="Summary & Research" icon={<FileText className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Profile Summary (2-3 sentences)</FieldLabel>
							<TextArea value={summary} onChange={setSummary} placeholder="Brief professional/academic profile statement..." rows={3} />
						</div>
						<div>
							<FieldLabel>Thesis / Research Work</FieldLabel>
							<TextArea value={thesisOrResearch} onChange={setThesisOrResearch} placeholder="e.g. Thesis on transformer efficiency in low-resource NLP..." rows={2} />
						</div>
						<div>
							<FieldLabel>Publications / Presentations</FieldLabel>
							<TextArea value={publications} onChange={setPublications} placeholder="e.g. Paper at EMNLP 2024: 'XYZ method for...' " rows={2} />
						</div>
					</SectionToggle>

					<SectionToggle title="Work & Internship Experience" icon={<Briefcase className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Work Experience</FieldLabel>
							<TextArea value={workExperience} onChange={setWorkExperience} placeholder="Job title, company, duration, key achievements..." rows={4} />
						</div>
						<div>
							<FieldLabel>Internships</FieldLabel>
							<TextArea value={internships} onChange={setInternships} placeholder="Internship role, organization, what you did..." rows={3} />
						</div>
					</SectionToggle>

					<SectionToggle title="Skills" icon={<Award className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Technical Skills</FieldLabel>
							<TextArea value={technicalSkills} onChange={setTechnicalSkills} placeholder="e.g. Python, PyTorch, Docker, SQL, React..." rows={2} />
						</div>
						<div>
							<FieldLabel>Soft Skills</FieldLabel>
							<TextArea value={softSkills} onChange={setSoftSkills} placeholder="e.g. Leadership, cross-functional collaboration..." rows={2} />
						</div>
					</SectionToggle>

					<SectionToggle title="Projects & Certifications" icon={<Award className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Projects</FieldLabel>
							<TextArea value={projects} onChange={setProjects} placeholder="Project name, description, tech stack, link..." rows={4} />
						</div>
						<div>
							<FieldLabel>Certifications</FieldLabel>
							<TextArea value={certifications} onChange={setCertifications} placeholder="e.g. AWS Certified, Google Data Analytics, PMP..." rows={2} />
						</div>
					</SectionToggle>

					<SectionToggle title="Awards, Activities & Extras" icon={<Award className="h-4 w-4" />} defaultOpen={false}>
						<div>
							<FieldLabel>Awards & Honours</FieldLabel>
							<TextArea value={awards} onChange={setAwards} placeholder="e.g. Dean's List, University Gold Medal, Merit Scholarship..." rows={2} />
						</div>
						<div>
							<FieldLabel>Extracurricular Activities</FieldLabel>
							<TextArea value={extracurriculars} onChange={setExtracurriculars} placeholder="e.g. President of AI Club, national debate team..." rows={2} />
						</div>
						<div>
							<FieldLabel>Volunteering</FieldLabel>
							<TextArea value={volunteering} onChange={setVolunteering} placeholder="e.g. Teaching assistant at NGO coding camp..." rows={2} />
						</div>
						<div>
							<FieldLabel>References</FieldLabel>
							<TextArea value={references} onChange={setReferences} placeholder="e.g. Available on request, or list referee names/roles..." rows={2} />
						</div>
					</SectionToggle>

					<div className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-1 text-sm font-semibold">Additional Highlights</h2>
						<p className="mb-3 text-xs text-muted-foreground">Anything else to include not covered above</p>
						<TextArea value={highlights} onChange={setHighlights} placeholder="e.g. Co-authored paper, won hackathon, Dean's List 3 years..." rows={3} />
					</div>

					<Button onClick={handleGenerate} disabled={isPending} className="w-full gap-2" size="lg">
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
						{isPending ? "Building CV…" : "Build My CV"}
					</Button>

					{error && (
						<p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
					)}

					<p className="text-center text-xs text-muted-foreground">
						Profile data is auto-injected — complete your profile for best results
					</p>
				</div>

				{/* Output panel — always visible, shows live draft or AI result */}
				<div className="lg:col-span-3">
					{(result || buildDraftCv().trim()) ? (
						<div className="rounded-xl border border-border bg-card p-5">
							{/* Tab switcher */}
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
										</button>
									)}
								</div>
								<div className="flex items-center gap-2 flex-wrap">
									{previewMode === "ai" && result && !editMode && (
										<>
											<Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-1.5">
												<Edit3 className="h-3.5 w-3.5" />
												{hasEdits ? "Edit again" : "Edit"}
											</Button>
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
									{!editMode && (
										<Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isPending} className="gap-1.5">
											{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
											{isPending ? "Building…" : "Build with AI"}
										</Button>
									)}
								</div>
							</div>

							{/* Inline edit mode */}
							{editMode && result ? (
								<InlineCvEditor
									initialContent={activeCv}
									onSave={handleSaveEdit}
									onDiscard={handleDiscardEdit}
								/>
							) : (
								<div className="rounded-lg border border-border bg-muted/30 max-h-[70vh] overflow-y-auto p-3">
									<DocumentPreview
										content={previewMode === "ai" && result ? activeCv : buildDraftCv()}
										template={cvTemplate}
										mode="cv"
									/>
								</div>
							)}

							{!editMode && previewMode === "draft" && (
								<div className="mt-3 rounded-lg border border-[#4A90D9]/20 bg-[#4A90D9]/5 px-3 py-2">
									<p className="text-xs text-[#4A90D9]">
										Live draft from your inputs — click &ldquo;Build with AI&rdquo; to generate a polished version.
									</p>
								</div>
							)}
							{!editMode && previewMode === "ai" && result && (
								<div className="mt-3 rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-3 py-2">
									<p className="text-xs text-[#C49A3C]">
										AI-generated — use the <strong>Edit</strong> button to refine any section before downloading.
										{hasEdits && <span className="ml-1 text-[#3D9970] font-medium">✓ Your edits are saved.</span>}
									</p>
								</div>
							)}
						</div>
					) : (
						<div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
								<FileText className="h-8 w-8 text-primary" />
							</div>
							<h3 className="mb-2 font-semibold">Your CV will appear here</h3>
							<p className="max-w-xs text-sm text-muted-foreground">
								Pick a template, fill in your details, and click Build.
							</p>
							<div className="mt-6 grid grid-cols-2 gap-2 text-left max-w-xs w-full">
								{["10 professional templates", "PDF & TXT download", "Profile auto-injected", "ATS-friendly format"].map(f => (
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
