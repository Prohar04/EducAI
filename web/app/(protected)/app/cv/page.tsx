"use client";

import { useState, useTransition } from "react";
import {
	Award,
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
	User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/FadeIn";
import { generateCvAction, type CvTemplate, type CvResult } from "@/lib/auth/action";

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
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 11pt; line-height: 1.5; color: #000; background: #fff; }
  pre { white-space: pre-wrap; word-break: break-word; font-family: inherit; font-size: inherit; line-height: inherit; }
  @page { margin: 0.85in 1in; }
  @media print { body { margin: 0; } }
</style>
</head>
<body><pre>${escaped}</pre>
<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
	win.document.close();
}

export default function CVPage() {
	const [cvTemplate, setCvTemplate] = useState<CvTemplate>("minimal-academic");
	const [result, setResult] = useState<CvResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [isPending, startTransition] = useTransition();

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

	function handleGenerate() {
		setError(null);
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
		});
	}

	function handleCopy() {
		if (!result) return;
		navigator.clipboard.writeText(result.cv).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	function handleDownloadTxt() {
		if (!result) return;
		const blob = new Blob([result.cv], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `cv-${cvTemplate}-${Date.now()}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleDownloadPdf() {
		if (!result) return;
		downloadAsPdf(result.cv, `CV-${cvTemplate}`);
	}

	return (
		<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<FileText className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">CV Builder</h1>
						<p className="text-sm text-muted-foreground">
							10 professional templates — profile-aware and fully customizable
						</p>
					</div>
				</div>
			</FadeIn>

			<div className="grid gap-6 lg:grid-cols-5">
				{/* Config panel */}
				<div className="space-y-4 lg:col-span-2">

					{/* Template selector */}
					<div className="rounded-xl border border-border bg-card p-5">
						<h2 className="mb-3 text-sm font-semibold">Template</h2>
						<div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
							{TEMPLATES.map((t) => (
								<button
									key={t.value}
									type="button"
									onClick={() => setCvTemplate(t.value)}
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
									{cvTemplate === t.value && <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
								</button>
							))}
						</div>
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

				{/* Output panel */}
				<div className="lg:col-span-3">
					{result ? (
						<FadeIn>
							<div className="rounded-xl border border-border bg-card p-5">
								<div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
									<div>
										<h2 className="font-semibold">Your CV</h2>
										<p className="text-xs text-muted-foreground capitalize">
											{TEMPLATES.find(t => t.value === result.template)?.label ?? result.template} · {result.sections.join(" · ")}
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
											Rebuild
										</Button>
									</div>
								</div>
								<div className="rounded-lg border border-border bg-background p-4 font-mono max-h-[70vh] overflow-y-auto">
									<pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
										{result.cv}
									</pre>
								</div>
								<div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
									<p className="text-xs text-amber-700 dark:text-amber-400">
										AI-generated — review, edit, and fill in any [PLACEHOLDER] markers before submitting.
									</p>
								</div>
							</div>
						</FadeIn>
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
										<Check className="h-3 w-3 text-emerald-500 shrink-0" />
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
