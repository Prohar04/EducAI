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
  Eye,
  GraduationCap,
  Loader2,
  Sparkles,
  Target,
  User,
  Wrench,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StaggerChildren, StaggerItem } from "@/components/motion/FadeIn";
import { generateResumeAction, type ResumeTemplate, type ResumeResult } from "@/lib/auth/action";
import DocumentPreview from "@/components/features/document-preview";

export const dynamic = "force-dynamic";

// ── Template definitions ─────────────────────────────────────────────────────

const TEMPLATES: { value: ResumeTemplate; label: string; desc: string; badge?: string }[] = [
  { value: "ats-clean",             label: "ATS-Friendly Clean",   desc: "Optimized for applicant tracking systems — plain, structured" },
  { value: "google-faang",          label: "FAANG / Big Tech",     desc: "Google/Meta/Amazon STAR-format with impact metrics", badge: "Tech" },
  { value: "startup-tech",          label: "Startup / Tech",       desc: "Modern, ownership-driven, portfolio-forward", badge: "Tech" },
  { value: "executive-professional",label: "Executive / Senior",   desc: "Strategic scope, team sizes, P&L, board roles", badge: "Senior" },
  { value: "data-science",          label: "Data Science / ML",    desc: "ML stack, pipelines, model metrics, Kaggle/papers", badge: "DS/ML" },
  { value: "consulting-finance",    label: "Consulting / Finance", desc: "McKinsey/Goldman format — Education first, structured bullets" },
];

// ── Section toggle ────────────────────────────────────────────────────────────

function SectionToggle({
  title, icon, children, defaultOpen = false,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
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

// ── PDF download ──────────────────────────────────────────────────────────────

async function downloadAsPdf(content: string, template: string, setDownloading: (v: boolean) => void) {
  setDownloading(true);
  try {
    const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    const res = await fetch(`${API}/resume/download-pdf`, {
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
    a.download = `Resume-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    const win = window.open("", "_blank");
    if (!win) return;
    const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:10.5pt;line-height:1.45;color:#000;padding:0.7in 0.75in}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${escaped}</pre><script>window.onload=function(){window.print()}<\/script></body></html>`);
    win.document.close();
  } finally {
    setDownloading(false);
  }
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResumePage() {
  const isFirstVisit = useFirstVisit("resume");
  const [resumeTemplate, setResumeTemplate] = useState<ResumeTemplate>("ats-clean");
  const [result, setResult] = useState<ResumeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [previewMode, setPreviewMode] = useState<"draft" | "ai">("draft");

  // Contact
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Target
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [summary, setSummary] = useState("");

  // Experience
  const [workExperience, setWorkExperience] = useState("");
  const [internships, setInternships] = useState("");

  // Education
  const [education, setEducation] = useState("");

  // Skills
  const [technicalSkills, setTechnicalSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");

  // Extras
  const [projects, setProjects] = useState("");
  const [certifications, setCertifications] = useState("");
  const [achievements, setAchievements] = useState("");
  const [languages, setLanguages] = useState("");
  const [volunteering, setVolunteering] = useState("");
  const [highlights, setHighlights] = useState("");

  // ── Live draft builder ────────────────────────────────────────────────────

  function buildDraftResume(): string {
    const lines: string[] = [];
    lines.push("[Your Name — from profile]");
    const contact = [phone, location, linkedin, github, portfolio].filter(Boolean);
    if (contact.length) lines.push(contact.join("  |  "));
    lines.push("");
    if (targetRole || targetIndustry) {
      lines.push(`TARGET: ${[targetRole, targetIndustry, targetCompany].filter(Boolean).join(" · ")}`);
      lines.push("");
    }
    if (summary) {
      lines.push("PROFESSIONAL SUMMARY");
      lines.push("─".repeat(50));
      lines.push(summary);
      lines.push("");
    }
    if (workExperience || internships) {
      lines.push("EXPERIENCE");
      lines.push("─".repeat(50));
      if (workExperience) lines.push(workExperience);
      if (internships) { lines.push(""); lines.push(internships); }
      lines.push("");
    }
    if (education) {
      lines.push("EDUCATION");
      lines.push("─".repeat(50));
      lines.push(education);
      lines.push("");
    }
    if (technicalSkills || softSkills) {
      lines.push("SKILLS");
      lines.push("─".repeat(50));
      if (technicalSkills) lines.push(`Technical: ${technicalSkills}`);
      if (softSkills) lines.push(`Soft Skills: ${softSkills}`);
      lines.push("");
    }
    if (projects) {
      lines.push("PROJECTS");
      lines.push("─".repeat(50));
      lines.push(projects);
      lines.push("");
    }
    if (certifications || achievements) {
      lines.push("CERTIFICATIONS & ACHIEVEMENTS");
      lines.push("─".repeat(50));
      if (certifications) lines.push(certifications);
      if (achievements) lines.push(achievements);
      lines.push("");
    }
    if (languages || volunteering) {
      lines.push("ADDITIONAL");
      lines.push("─".repeat(50));
      if (languages) lines.push(`Languages: ${languages}`);
      if (volunteering) lines.push(volunteering);
      lines.push("");
    }
    if (highlights) {
      lines.push("HIGHLIGHTS");
      lines.push("─".repeat(50));
      lines.push(highlights);
    }
    return lines.join("\n");
  }

  // ── Generate ──────────────────────────────────────────────────────────────

  function handleGenerate() {
    setError(null);
    setPreviewMode("ai");
    startTransition(async () => {
      const res = await generateResumeAction({
        resumeTemplate,
        phone: phone || undefined,
        location: location || undefined,
        linkedin: linkedin || undefined,
        github: github || undefined,
        portfolio: portfolio || undefined,
        summary: summary || undefined,
        targetRole: targetRole || undefined,
        targetCompany: targetCompany || undefined,
        targetIndustry: targetIndustry || undefined,
        workExperience: workExperience || undefined,
        internships: internships || undefined,
        education: education || undefined,
        technicalSkills: technicalSkills || undefined,
        softSkills: softSkills || undefined,
        projects: projects || undefined,
        certifications: certifications || undefined,
        achievements: achievements || undefined,
        languages: languages || undefined,
        volunteering: volunteering || undefined,
        highlights: highlights || undefined,
      });
      if (!res) {
        setError("Resume generation failed. Please ensure your profile is complete and try again.");
        setPreviewMode("draft");
        return;
      }
      setResult(res);
    });
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.resume).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadTxt() {
    if (!result) return;
    const blob = new Blob([result.resume], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${resumeTemplate}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const draftContent = buildDraftResume();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`${isFirstVisit ? "page-enter" : ""} mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8`}>
      <PageHeader
        animation="cv"
        title={<><span className="gradient-text">Resume</span> Builder</>}
        subtitle="6 industry-focused templates — ATS-ready, FAANG, startup, executive, and more"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Left: Config & form ── */}
        <div className="space-y-4 lg:col-span-2">

          {/* Template selector */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Resume Template</h2>
            <StaggerChildren stagger={0.04} className="space-y-1.5">
              {TEMPLATES.map((t) => (
                <StaggerItem key={t.value}>
                  <motion.button
                    type="button"
                    onClick={() => setResumeTemplate(t.value)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.12 }}
                    className={`w-full flex items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      resumeTemplate === t.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-medium text-sm ${resumeTemplate === t.value ? "text-primary" : ""}`}>
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
                      {resumeTemplate === t.value && (
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

          {/* Contact */}
          <SectionToggle title="Contact & Links" icon={<User className="h-4 w-4" />} defaultOpen>
            <div>
              <FieldLabel>Phone</FieldLabel>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="text-sm" />
            </div>
            <div>
              <FieldLabel>LinkedIn URL</FieldLabel>
              <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname" className="text-sm" />
            </div>
            <div>
              <FieldLabel>GitHub / Portfolio</FieldLabel>
              <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="github.com/yourname" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Portfolio / Website</FieldLabel>
              <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="yourname.dev" className="text-sm" />
            </div>
          </SectionToggle>

          {/* Target */}
          <SectionToggle title="Target Role" icon={<Target className="h-4 w-4" />} defaultOpen>
            <div>
              <FieldLabel>Target Job Title</FieldLabel>
              <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Software Engineer" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Target Company (optional)</FieldLabel>
              <Input value={targetCompany} onChange={(e) => setTargetCompany(e.target.value)} placeholder="e.g. Google, McKinsey" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Target Industry</FieldLabel>
              <Input value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} placeholder="e.g. FinTech, Healthcare" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Professional Summary Notes</FieldLabel>
              <TextArea value={summary} onChange={setSummary} placeholder="Key value prop, years of experience, core strength..." rows={2} />
            </div>
          </SectionToggle>

          {/* Experience */}
          <SectionToggle title="Work Experience" icon={<Briefcase className="h-4 w-4" />} defaultOpen={false}>
            <div>
              <FieldLabel>Work Experience (most recent first)</FieldLabel>
              <TextArea value={workExperience} onChange={setWorkExperience} placeholder="Job title, company, dates, key achievements with numbers/impact..." rows={5} />
            </div>
            <div>
              <FieldLabel>Internships</FieldLabel>
              <TextArea value={internships} onChange={setInternships} placeholder="Internship role, company, outcomes..." rows={3} />
            </div>
          </SectionToggle>

          {/* Education */}
          <SectionToggle title="Education" icon={<GraduationCap className="h-4 w-4" />} defaultOpen={false}>
            <div>
              <FieldLabel>Education</FieldLabel>
              <TextArea value={education} onChange={setEducation} placeholder="Degree, institution, graduation year, GPA (if 3.5+), honours, relevant courses..." rows={3} />
            </div>
          </SectionToggle>

          {/* Skills */}
          <SectionToggle title="Skills" icon={<Wrench className="h-4 w-4" />} defaultOpen={false}>
            <div>
              <FieldLabel>Technical Skills</FieldLabel>
              <TextArea value={technicalSkills} onChange={setTechnicalSkills} placeholder="e.g. Python, React, AWS, PyTorch, SQL, Docker..." rows={2} />
            </div>
            <div>
              <FieldLabel>Soft Skills</FieldLabel>
              <TextArea value={softSkills} onChange={setSoftSkills} placeholder="e.g. Cross-functional leadership, stakeholder management..." rows={2} />
            </div>
          </SectionToggle>

          {/* Projects & Extras */}
          <SectionToggle title="Projects, Awards & Extras" icon={<Award className="h-4 w-4" />} defaultOpen={false}>
            <div>
              <FieldLabel>Projects / Open Source</FieldLabel>
              <TextArea value={projects} onChange={setProjects} placeholder="Project name, tech, outcome, GitHub link..." rows={3} />
            </div>
            <div>
              <FieldLabel>Certifications</FieldLabel>
              <TextArea value={certifications} onChange={setCertifications} placeholder="e.g. AWS Certified, PMP, CFA Level I..." rows={2} />
            </div>
            <div>
              <FieldLabel>Key Achievements</FieldLabel>
              <TextArea value={achievements} onChange={setAchievements} placeholder="e.g. 1st place hackathon, raised $X, built feature used by Y users..." rows={2} />
            </div>
            <div>
              <FieldLabel>Languages</FieldLabel>
              <Input value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="e.g. English (native), French (B2)" className="text-sm" />
            </div>
            <div>
              <FieldLabel>Volunteering / Leadership</FieldLabel>
              <TextArea value={volunteering} onChange={setVolunteering} placeholder="e.g. President of AI Club, Volunteer tutor..." rows={2} />
            </div>
          </SectionToggle>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-1 text-sm font-semibold">Additional Highlights</h2>
            <p className="mb-3 text-xs text-muted-foreground">Anything else to include</p>
            <TextArea value={highlights} onChange={setHighlights} placeholder="e.g. Patent pending, published article, speaking invitation..." rows={3} />
          </div>

          <Button onClick={handleGenerate} disabled={isPending} className="w-full gap-2" size="lg">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isPending ? "Building Resume…" : "Build with AI"}
          </Button>

          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Profile data is auto-injected — complete your profile for best results
          </p>
        </div>

        {/* ── Right: Preview ── */}
        <div className="lg:col-span-3">
          {draftContent.trim() ? (
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
                  {previewMode === "ai" && result && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="gap-1.5">
                        <Download className="h-3.5 w-3.5" /> .txt
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => downloadAsPdf(result.resume, resumeTemplate, setDownloading)}
                        disabled={downloading}
                        className="gap-1.5"
                      >
                        {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        PDF
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={isPending} className="gap-1.5">
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {isPending ? "Building…" : "Build with AI"}
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-[#f8f8f6] max-h-[70vh] overflow-y-auto p-3">
                <DocumentPreview
                  content={previewMode === "ai" && result ? result.resume : draftContent}
                  template={resumeTemplate}
                  mode="resume"
                />
              </div>

              {previewMode === "draft" && (
                <div className="mt-3 rounded-lg border border-[#4A90D9]/20 bg-[#4A90D9]/5 px-3 py-2">
                  <p className="text-xs text-[#4A90D9]">
                    Live draft from your inputs — click &ldquo;Build with AI&rdquo; to generate a polished, quantified resume.
                  </p>
                </div>
              )}
              {previewMode === "ai" && result && (
                <div className="mt-3 rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-3 py-2">
                  <p className="text-xs text-[#C49A3C]">
                    AI-generated — verify all details, fill any [PLACEHOLDER] markers, and tailor to each application.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Start typing to see a live preview</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                Fill in your target role and experience — your resume draft appears instantly.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 text-left max-w-xs w-full">
                {["6 industry templates", "PDF & TXT download", "Profile auto-injected", "ATS-optimized output"].map(f => (
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
