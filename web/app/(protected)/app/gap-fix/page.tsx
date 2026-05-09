"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	ChevronDown,
	ChevronRight,
	CircleDashed,
	Clock,
	ExternalLink,
	FileText,
	Link2,
	Loader2,
	Minus,
	Paperclip,
	Plus,
	RefreshCw,
	Sparkles,
	TrendingDown,
	TrendingUp,
	Trash2,
	Upload,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/FadeIn";
import {
	analyzeGapFixAction,
	getGapFixSessionAction,
	updateGapStatusAction,
	addImprovementAction,
	addEvidenceLinkAction,
	uploadEvidenceAction,
	deleteEvidenceAction,
	reanalyzeGapFixAction,
	type GapFixSession,
	type GapFixRecommendation,
	type GapStatus,
	type GapFixEvidenceItem,
} from "@/lib/auth/action";

// ── constants ───────────────────────────────────────────────────────────────

const PRIORITY_BORDER = {
	high: "border-[#C0392B]/30 bg-[#C0392B]/5",
	medium: "border-[#C49A3C]/30 bg-[#C49A3C]/5",
	low: "border-[#3D9970]/30 bg-[#3D9970]/5",
};

const PRIORITY_BADGE = {
	high: "bg-[#C0392B]/10 text-[#C0392B] border-[#C0392B]/20",
	medium: "bg-[#C49A3C]/10 text-[#C49A3C] border-[#C49A3C]/20",
	low: "bg-[#3D9970]/10 text-[#3D9970] border-[#3D9970]/20",
};

const STATUS_CONFIG: Record<GapStatus, { label: string; color: string; icon: React.ReactNode }> = {
	not_started: {
		label: "Not started",
		color: "text-muted-foreground border-border",
		icon: <CircleDashed className="h-3.5 w-3.5" />,
	},
	in_progress: {
		label: "In progress",
		color: "text-[#C49A3C] border-[#C49A3C]/30 bg-[#C49A3C]/5",
		icon: <Clock className="h-3.5 w-3.5" />,
	},
	completed: {
		label: "Completed",
		color: "text-[#3D9970] border-[#3D9970]/30 bg-[#3D9970]/5",
		icon: <CheckCircle className="h-3.5 w-3.5" />,
	},
	skipped: {
		label: "Skipped",
		color: "text-muted-foreground/60 border-border/50",
		icon: <Minus className="h-3.5 w-3.5" />,
	},
};

const IMPROVEMENT_TYPES = [
	{ value: "test_score", label: "Improved test score" },
	{ value: "certification", label: "Added certification" },
	{ value: "internship", label: "Added internship / work experience" },
	{ value: "project", label: "Added new project" },
	{ value: "github_portfolio", label: "Added GitHub / portfolio" },
	{ value: "publication", label: "Added publication / research" },
	{ value: "volunteering", label: "Added volunteering / leadership" },
	{ value: "cv_sop", label: "Improved CV / SOP" },
	{ value: "scholarship_achievement", label: "Added scholarship achievement" },
	{ value: "other", label: "Other improvement" },
];

const EVIDENCE_TYPES = [
	{ value: "certificate", label: "Certificate (PDF / image)" },
	{ value: "cv", label: "CV / Resume" },
	{ value: "sop", label: "Statement of Purpose" },
	{ value: "transcript", label: "Transcript" },
	{ value: "internship_letter", label: "Internship / employment letter" },
	{ value: "link", label: "Portfolio / GitHub / LinkedIn link" },
	{ value: "publication", label: "Publication link" },
	{ value: "other", label: "Other" },
];

const TEST_TYPES = ["IELTS", "TOEFL", "PTE", "Duolingo", "GRE", "GMAT"];

// ── sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
	const radius = size * 0.4;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (score / 100) * circumference;
	const color = score >= 70 ? "#3D9970" : score >= 50 ? "#C49A3C" : "#C0392B";

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg width={size} height={size} className="-rotate-90">
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/30" />
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth={8}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					style={{ transition: "stroke-dashoffset 1s ease" }}
				/>
			</svg>
			<div className="absolute flex flex-col items-center">
				<span className="text-xl font-bold" style={{ color }}>{score}</span>
				<span className="text-[10px] text-muted-foreground">/100</span>
			</div>
		</div>
	);
}

function ProgressBar({ completed, total }: { completed: number; total: number }) {
	const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
	return (
		<div className="flex items-center gap-3">
			<div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
				<div
					className="h-full rounded-full bg-[#3D9970] transition-all duration-700"
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span className="text-xs text-muted-foreground shrink-0">{completed}/{total} done</span>
		</div>
	);
}

function StatusPill({ status, onChange }: { status: GapStatus; onChange: (s: GapStatus) => void }) {
	const [open, setOpen] = useState(false);
	const cfg = STATUS_CONFIG[status];
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen(v => !v)}
				className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${cfg.color}`}
			>
				{cfg.icon}
				{cfg.label}
				<ChevronDown className="h-3 w-3 opacity-60" />
			</button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded-xl border border-border bg-card shadow-lg p-1">
					{(Object.keys(STATUS_CONFIG) as GapStatus[]).map(s => (
						<button
							key={s}
							type="button"
							className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-muted/50 transition-colors"
							onClick={() => { onChange(s); setOpen(false); }}
						>
							<span className={STATUS_CONFIG[s].color}>{STATUS_CONFIG[s].icon}</span>
							{STATUS_CONFIG[s].label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function EvidenceBadge({ ev, onDelete }: { ev: GapFixEvidenceItem; onDelete: () => void }) {
	const isLink = ev.status === "linked";
	return (
		<div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] group">
			{isLink ? <Link2 className="h-3 w-3 text-primary shrink-0" /> : <FileText className="h-3 w-3 text-primary shrink-0" />}
			<span className="text-muted-foreground truncate max-w-[120px]">{ev.label}</span>
			{ev.status === "uploaded" && (
				<span className="rounded-full bg-[#C49A3C]/10 text-[#C49A3C] border border-[#C49A3C]/20 px-1.5 py-0.5 text-[9px]">
					uploaded · unverified
				</span>
			)}
			{isLink && ev.url && (
				<a href={ev.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
					<ExternalLink className="h-3 w-3" />
				</a>
			)}
			<button
				type="button"
				onClick={onDelete}
				className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
			>
				<Trash2 className="h-3 w-3" />
			</button>
		</div>
	);
}

// ── ImprovementModal ─────────────────────────────────────────────────────────

function ImprovementModal({
	onClose,
	onSubmit,
}: {
	onClose: () => void;
	onSubmit: (data: {
		type: string;
		description: string;
		testType?: string;
		scoreValue?: number;
		applyToProfile?: boolean;
	}) => Promise<void>;
}) {
	const [type, setType] = useState("test_score");
	const [description, setDescription] = useState("");
	const [testType, setTestType] = useState("IELTS");
	const [scoreValue, setScoreValue] = useState("");
	const [applyToProfile, setApplyToProfile] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const isTestScore = type === "test_score";

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!description.trim()) return;
		setSubmitting(true);
		await onSubmit({
			type,
			description: description.trim(),
			testType: isTestScore ? testType : undefined,
			scoreValue: isTestScore && scoreValue ? Number(scoreValue) : undefined,
			applyToProfile: isTestScore ? applyToProfile : false,
		});
		setSubmitting(false);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-6">
				<h3 className="text-base font-semibold mb-1">Log an improvement</h3>
				<p className="text-xs text-muted-foreground mb-4">Record what you&apos;ve improved. Test score updates will be applied to your profile.</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Improvement type</label>
						<select
							value={type}
							onChange={e => setType(e.target.value)}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
						>
							{IMPROVEMENT_TYPES.map(t => (
								<option key={t.value} value={t.value}>{t.label}</option>
							))}
						</select>
					</div>

					{isTestScore && (
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Test</label>
								<select
									value={testType}
									onChange={e => setTestType(e.target.value)}
									className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
								>
									{TEST_TYPES.map(t => <option key={t}>{t}</option>)}
								</select>
							</div>
							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1.5 block">New score</label>
								<input
									type="number"
									step="0.1"
									value={scoreValue}
									onChange={e => setScoreValue(e.target.value)}
									placeholder="e.g. 7.5"
									className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</div>
						</div>
					)}

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							placeholder="Briefly describe what you improved..."
							rows={2}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
						/>
					</div>

					{isTestScore && (
						<label className="flex items-center gap-2 text-xs cursor-pointer select-none">
							<input
								type="checkbox"
								checked={applyToProfile}
								onChange={e => setApplyToProfile(e.target.checked)}
								className="rounded"
							/>
							<span className="text-muted-foreground">Apply score to my profile (used in re-analysis)</span>
						</label>
					)}

					<div className="flex gap-2 pt-1">
						<Button type="button" variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
						<Button type="submit" size="sm" disabled={!description.trim() || submitting} className="flex-1 gap-1.5">
							{submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
							Save improvement
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── EvidenceModal ────────────────────────────────────────────────────────────

function EvidenceModal({
	recTitle,
	onClose,
	onSubmitLink,
	onUploadFile,
}: {
	recTitle: string;
	onClose: () => void;
	onSubmitLink: (label: string, type: string, url: string) => Promise<void>;
	onUploadFile: (label: string, type: string, file: File) => Promise<void>;
}) {
	const [mode, setMode] = useState<"link" | "file">("link");
	const [evidenceType, setEvidenceType] = useState("link");
	const [label, setLabel] = useState("");
	const [url, setUrl] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!label.trim()) return;
		setSubmitting(true);
		if (mode === "link" && url.trim()) {
			await onSubmitLink(label.trim(), evidenceType, url.trim());
		} else if (mode === "file" && file) {
			await onUploadFile(label.trim(), evidenceType, file);
		}
		setSubmitting(false);
	}

	const canSubmit = label.trim() && (mode === "link" ? url.trim() : !!file);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-6">
				<h3 className="text-base font-semibold mb-1">Attach evidence</h3>
				<p className="text-xs text-muted-foreground mb-4 truncate">For: {recTitle}</p>

				<div className="flex gap-2 mb-4">
					{(["link", "file"] as const).map(m => (
						<button
							key={m}
							type="button"
							onClick={() => setMode(m)}
							className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
								mode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/30"
							}`}
						>
							{m === "link" ? <Link2 className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
							{m === "link" ? "Link" : "Upload file"}
						</button>
					))}
				</div>

				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Evidence type</label>
						<select
							value={evidenceType}
							onChange={e => setEvidenceType(e.target.value)}
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
						>
							{EVIDENCE_TYPES.map(t => (
								<option key={t.value} value={t.value}>{t.label}</option>
							))}
						</select>
					</div>

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Label</label>
						<input
							type="text"
							value={label}
							onChange={e => setLabel(e.target.value)}
							placeholder="e.g. IELTS certificate, GitHub profile"
							className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
						/>
					</div>

					{mode === "link" ? (
						<div>
							<label className="text-xs font-medium text-muted-foreground mb-1.5 block">URL</label>
							<input
								type="url"
								value={url}
								onChange={e => setUrl(e.target.value)}
								placeholder="https://..."
								className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
							/>
						</div>
					) : (
						<div>
							<label className="text-xs font-medium text-muted-foreground mb-1.5 block">File (PDF, image, Word — max 10 MB)</label>
							<div
								onClick={() => fileRef.current?.click()}
								className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-6 cursor-pointer hover:bg-muted/30 transition-colors"
							>
								{file ? (
									<>
										<FileText className="h-6 w-6 text-primary mb-1" />
										<span className="text-xs font-medium">{file.name}</span>
										<span className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
									</>
								) : (
									<>
										<Upload className="h-6 w-6 text-muted-foreground mb-1" />
										<span className="text-xs text-muted-foreground">Click to choose a file</span>
									</>
								)}
							</div>
							<input
								ref={fileRef}
								type="file"
								accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
								className="hidden"
								onChange={e => setFile(e.target.files?.[0] ?? null)}
							/>
							{mode === "file" && (
								<p className="mt-1.5 text-[11px] text-muted-foreground">
									Files are stored as-is and not parsed or verified.
								</p>
							)}
						</div>
					)}

					<div className="flex gap-2 pt-1">
						<Button type="button" variant="outline" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
						<Button type="submit" size="sm" disabled={!canSubmit || submitting} className="flex-1 gap-1.5">
							{submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
							Attach
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}

// ── GapCard ──────────────────────────────────────────────────────────────────

function GapCard({
	rec,
	status,
	evidences,
	onStatusChange,
	onAddImprovement,
	onAddEvidence,
	onDeleteEvidence,
}: {
	rec: GapFixRecommendation;
	status: GapStatus;
	evidences: GapFixEvidenceItem[];
	onStatusChange: (s: GapStatus) => void;
	onAddImprovement: () => void;
	onAddEvidence: () => void;
	onDeleteEvidence: (id: string) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const isCompleted = status === "completed";
	const isSkipped = status === "skipped";

	return (
		<div className={`rounded-xl border p-4 transition-all ${isCompleted ? "border-[#3D9970]/30 bg-[#3D9970]/5 opacity-80" : isSkipped ? "opacity-50 border-border" : PRIORITY_BORDER[rec.priority]}`}>
			<div className="flex items-start gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap mb-1">
						<span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_BADGE[rec.priority]}`}>
							{rec.priority}
						</span>
						<span className="text-[11px] text-muted-foreground">{rec.category}</span>
						<span className="ml-auto text-[11px] text-muted-foreground flex items-center gap-1">
							<Clock className="h-3 w-3" />~{rec.timelineWeeks}w
						</span>
					</div>
					<p className="text-sm font-semibold">{rec.title}</p>
					<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
				</div>
			</div>

			<div className="flex items-center gap-2 mt-3">
				<StatusPill status={status} onChange={onStatusChange} />
				<button
					type="button"
					onClick={() => setExpanded(v => !v)}
					className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
				>
					{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
					{expanded ? "Less" : "Details"}
				</button>
			</div>

			{expanded && (
				<div className="mt-4 space-y-4 border-t border-border/50 pt-3">
					{rec.actions.length > 0 && (
						<div>
							<p className="mb-2 text-xs font-semibold">Action steps</p>
							<ul className="space-y-1.5">
								{rec.actions.map((action, i) => (
									<li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
										<ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
										{action}
									</li>
								))}
							</ul>
						</div>
					)}

					{rec.resources.length > 0 && (
						<div>
							<p className="mb-2 text-xs font-semibold">Resources</p>
							<div className="flex flex-wrap gap-1.5">
								{rec.resources.map((r, i) => (
									<span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
										<ExternalLink className="h-3 w-3" />
										{r}
									</span>
								))}
							</div>
						</div>
					)}

					<div>
						<div className="flex items-center justify-between mb-2">
							<p className="text-xs font-semibold">Evidence & proof</p>
							<button
								type="button"
								onClick={onAddEvidence}
								className="flex items-center gap-1 text-[11px] text-primary hover:underline"
							>
								<Plus className="h-3 w-3" />
								Add
							</button>
						</div>
						{evidences.length === 0 ? (
							<p className="text-[11px] text-muted-foreground">No evidence attached yet.</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{evidences.map(ev => (
									<EvidenceBadge key={ev.id} ev={ev} onDelete={() => onDeleteEvidence(ev.id)} />
								))}
							</div>
						)}
					</div>

					<div className="pt-1">
						<button
							type="button"
							onClick={onAddImprovement}
							className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors w-full justify-center"
						>
							<TrendingUp className="h-3.5 w-3.5" />
							Log an improvement for this gap
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// ── BeforeAfterPanel ─────────────────────────────────────────────────────────

function BeforeAfterPanel({ session }: { session: GapFixSession }) {
	const { comparison, previousResult, result } = session;
	if (!comparison || !previousResult) return null;

	const improved = comparison.scoreImprovement > 0;
	const same = comparison.scoreImprovement === 0;

	return (
		<div className="rounded-xl border border-border bg-card p-5">
			<h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
				<RefreshCw className="h-4 w-4 text-primary" />
				Before vs After Re-analysis
			</h3>

			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
				<div className="text-center">
					<p className="text-xs text-muted-foreground mb-1">Previous score</p>
					<p className="text-2xl font-bold text-[#C49A3C]">{comparison.previousScore}</p>
				</div>
				<div className="text-center">
					<p className="text-xs text-muted-foreground mb-1">Current score</p>
					<p className={`text-2xl font-bold ${improved ? "text-[#3D9970]" : same ? "text-foreground" : "text-[#C0392B]"}`}>
						{comparison.currentScore}
					</p>
				</div>
				<div className="text-center">
					<p className="text-xs text-muted-foreground mb-1">Change</p>
					<div className="flex items-center justify-center gap-1">
						{improved ? <TrendingUp className="h-4 w-4 text-[#3D9970]" /> : same ? <Minus className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-[#C0392B]" />}
						<p className={`text-xl font-bold ${improved ? "text-[#3D9970]" : same ? "text-foreground" : "text-[#C0392B]"}`}>
							{improved ? "+" : ""}{comparison.scoreImprovement}
						</p>
					</div>
				</div>
				<div className="text-center">
					<p className="text-xs text-muted-foreground mb-1">Gaps resolved</p>
					<p className="text-2xl font-bold text-[#3D9970]">{comparison.resolvedGaps.length}</p>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				{comparison.resolvedGaps.length > 0 && (
					<div className="rounded-lg border border-[#3D9970]/20 bg-[#3D9970]/5 p-3">
						<p className="text-xs font-semibold text-[#3D9970] mb-2 flex items-center gap-1.5">
							<CheckCircle className="h-3.5 w-3.5" />
							Resolved gaps ({comparison.resolvedGaps.length})
						</p>
						<ul className="space-y-1">
							{comparison.resolvedGaps.map((g, i) => (
								<li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
									<span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#3D9970] shrink-0" />
									{g}
								</li>
							))}
						</ul>
					</div>
				)}

				{comparison.newStrengths.filter(s => !comparison.previousStrengths.includes(s)).length > 0 && (
					<div className="rounded-lg border border-[#4A90D9]/20 bg-[#4A90D9]/5 p-3">
						<p className="text-xs font-semibold text-[#4A90D9] mb-2 flex items-center gap-1.5">
							<Sparkles className="h-3.5 w-3.5" />
							New strengths
						</p>
						<ul className="space-y-1">
							{comparison.newStrengths.filter(s => !comparison.previousStrengths.includes(s)).map((s, i) => (
								<li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
									<span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#4A90D9] shrink-0" />
									{s}
								</li>
							))}
						</ul>
					</div>
				)}

				{comparison.remainingGaps.length > 0 && (
					<div className="rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/5 p-3">
						<p className="text-xs font-semibold text-[#C49A3C] mb-2 flex items-center gap-1.5">
							<AlertCircle className="h-3.5 w-3.5" />
							Remaining gaps ({comparison.remainingGaps.length})
						</p>
						<ul className="space-y-1">
							{comparison.remainingGaps.map((g, i) => (
								<li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
									<span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C49A3C] shrink-0" />
									{g}
								</li>
							))}
						</ul>
					</div>
				)}

				{comparison.newGaps.length > 0 && (
					<div className="rounded-lg border border-[#C0392B]/20 bg-[#C0392B]/5 p-3">
						<p className="text-xs font-semibold text-[#C0392B] mb-2 flex items-center gap-1.5">
							<AlertCircle className="h-3.5 w-3.5" />
							New gaps found ({comparison.newGaps.length})
						</p>
						<ul className="space-y-1">
							{comparison.newGaps.map((g, i) => (
								<li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
									<span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C0392B] shrink-0" />
									{g}
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Next best actions */}
			{result.recommendations.filter(r => r.priority === "high").length > 0 && (
				<div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
					<p className="text-xs font-semibold mb-2">Next best actions</p>
					<ul className="space-y-1">
						{result.recommendations.filter(r => r.priority === "high").slice(0, 3).map(r => (
							<li key={r.id} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
								<ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
								{r.title}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

// ── main page ────────────────────────────────────────────────────────────────

export default function GapFixPage() {
	const [session, setSession] = useState<GapFixSession | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [analyzing, startAnalyze] = useTransition();
	const [reanalyzing, startReanalyze] = useTransition();

	// Modals
	const [improvementModal, setImprovementModal] = useState<{ recId: string; recTitle: string } | null>(null);
	const [evidenceModal, setEvidenceModal] = useState<{ recId: string; recTitle: string } | null>(null);

	useEffect(() => {
		getGapFixSessionAction().then(s => {
			setSession(s);
			setLoading(false);
		});
	}, []);

	function handleAnalyze() {
		setError(null);
		startAnalyze(async () => {
			const result = await analyzeGapFixAction();
			if (result.error) {
				setError(result.error);
				return;
			}
			setSession(result.session);
		});
	}

	function handleReanalyze() {
		if (!session) return;
		startReanalyze(async () => {
			const s = await reanalyzeGapFixAction(session.id);
			if (!s) {
				setError("Re-analysis failed. Please try again.");
				return;
			}
			setSession(s);
		});
	}

	async function handleStatusChange(recId: string, status: GapStatus) {
		if (!session) return;
		const ok = await updateGapStatusAction(session.id, recId, status);
		if (ok) {
			setSession(prev => prev ? {
				...prev,
				gapStatuses: { ...prev.gapStatuses, [recId]: status },
			} : prev);
		}
	}

	async function handleAddImprovement(data: {
		type: string;
		description: string;
		testType?: string;
		scoreValue?: number;
		applyToProfile?: boolean;
	}) {
		if (!session) return;
		const updated = await addImprovementAction(session.id, data);
		if (updated) setSession(updated);
		setImprovementModal(null);
	}

	async function handleAddEvidenceLink(label: string, type: string, url: string) {
		if (!session || !evidenceModal) return;
		const ev = await addEvidenceLinkAction(session.id, evidenceModal.recId, label, type, url);
		if (ev) {
			setSession(prev => prev ? { ...prev, evidences: [...prev.evidences, ev] } : prev);
		}
		setEvidenceModal(null);
	}

	async function handleUploadFile(label: string, type: string, file: File) {
		if (!session || !evidenceModal) return;
		const fd = new FormData();
		fd.set("label", label);
		fd.set("type", type);
		fd.set("file", file, file.name);
		const ev = await uploadEvidenceAction(session.id, evidenceModal.recId, fd);
		if (ev) {
			setSession(prev => prev ? { ...prev, evidences: [...prev.evidences, ev] } : prev);
		}
		setEvidenceModal(null);
	}

	async function handleDeleteEvidence(evidenceId: string) {
		const ok = await deleteEvidenceAction(evidenceId);
		if (ok) {
			setSession(prev => prev ? { ...prev, evidences: prev.evidences.filter(e => e.id !== evidenceId) } : prev);
		}
	}

	// ── computed ───────────────────────────────────────────────────────────────

	const recs = session?.result.recommendations ?? [];
	const total = recs.length;
	const completedCount = recs.filter(r => (session?.gapStatuses[r.id] ?? "not_started") === "completed").length;
	const highPriority = recs.filter(r => r.priority === "high");
	const otherPriority = recs.filter(r => r.priority !== "high");
	const improvementsCount = session?.improvements.length ?? 0;

	// ── render states ──────────────────────────────────────────────────────────

	if (loading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
			{/* Header */}
			<FadeIn className="mb-8">
				<div className="flex items-center gap-3 mb-1">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
						<Zap className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight">Gap Fix</h1>
						<p className="text-sm text-muted-foreground">
							Track your improvement journey — analyze gaps, log progress, attach evidence, re-analyze.
						</p>
					</div>
				</div>
			</FadeIn>

			{/* No session — analyze CTA */}
			{!session ? (
				<div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
					<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
						<Sparkles className="h-8 w-8 text-primary" />
					</div>
					<h3 className="mb-2 font-semibold">Profile Gap Analysis</h3>
					<p className="max-w-sm text-sm text-muted-foreground mb-6">
						We&apos;ll analyze your academic profile, test scores, experience, and goals to identify weaknesses and give you a concrete improvement roadmap.
					</p>
					<Button onClick={handleAnalyze} disabled={analyzing} size="lg" className="gap-2">
						{analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
						{analyzing ? "Analyzing your profile…" : "Analyze My Profile"}
					</Button>
					{error && (
						<div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive max-w-sm text-left">
							<AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
							<div>
								{error}
								{(error.toLowerCase().includes("profile") || error.toLowerCase().includes("complete")) && (
									<div className="mt-1.5">
										<a href="/app/profile" className="underline underline-offset-2 font-medium">
											Go to profile settings
										</a>
									</div>
								)}
							</div>
						</div>
					)}
					<p className="mt-4 text-xs text-muted-foreground">
						<a href="/app/profile" className="underline underline-offset-2 hover:text-foreground transition-colors">
							Set up your profile
						</a>{" "}for the most accurate recommendations
					</p>
				</div>
			) : (
				<FadeIn>
					<div className="space-y-6">

						{/* Partial / minimal analysis notice */}
						{(session.analysisMode === "minimal" || session.analysisMode === "partial") && (
							<div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
								session.analysisMode === "minimal"
									? "border-[#C49A3C]/30 bg-[#C49A3C]/5 text-[#C49A3C]"
									: "border-[#4A90D9]/30 bg-[#4A90D9]/5 text-[#4A90D9]"
							}`}>
								<AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
								<div className="flex-1">
									{session.analysisMode === "minimal" ? (
										<>
											<span className="font-medium">Analysis based on limited data.</span>
											{" "}Your profile is not set up yet — these are general recommendations.{" "}
											<a href="/app/profile" className="underline underline-offset-2 font-medium hover:opacity-80 transition-opacity">
												Complete your profile
											</a>{" "}and re-analyze for personalized results.
										</>
									) : (
										<>
											<span className="font-medium">Partial analysis.</span>
											{" "}Some profile fields are missing — adding your degree level, GPA, and test scores will improve recommendation accuracy.{" "}
											<a href="/app/profile" className="underline underline-offset-2 font-medium hover:opacity-80 transition-opacity">
												Update your profile
											</a>{" "}then re-analyze.
										</>
									)}
								</div>
							</div>
						)}

						{/* Score overview + progress */}
						<div className="rounded-xl border border-border bg-card p-6">
							<div className="flex flex-col sm:flex-row items-center gap-6">
								<ScoreRing score={session.result.profileScore} />
								<div className="flex-1 text-center sm:text-left">
									<h2 className="text-lg font-semibold mb-1">Profile Competitiveness Score</h2>
									<p className="text-sm text-muted-foreground mb-3">{session.result.prioritySummary}</p>
									<div className="space-y-2">
										<ProgressBar completed={completedCount} total={total} />
										<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
											<span>{session.result.weaknesses.length} gap{session.result.weaknesses.length !== 1 ? "s" : ""} found</span>
											<span>·</span>
											<span>{improvementsCount} improvement{improvementsCount !== 1 ? "s" : ""} logged</span>
											<span>·</span>
											<span>{session.evidences.length} evidence attached</span>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-2 shrink-0">
									<Button
										variant="outline"
										size="sm"
										onClick={handleReanalyze}
										disabled={reanalyzing}
										className="gap-1.5"
									>
										{reanalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
										Re-analyze
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleAnalyze}
										disabled={analyzing}
										className="gap-1.5 text-muted-foreground"
									>
										{analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
										Fresh analysis
									</Button>
								</div>
							</div>
						</div>

						{error && (
							<div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
								<AlertCircle className="h-4 w-4 shrink-0" />
								{error}
							</div>
						)}

						{/* Before/After comparison (shown after re-analysis) */}
						{session.comparison && <BeforeAfterPanel session={session} />}

						{/* Strengths & Weaknesses */}
						{(session.result.strengths.length > 0 || session.result.weaknesses.length > 0) && (
							<div className="grid gap-4 sm:grid-cols-2">
								{session.result.strengths.length > 0 && (
									<div className="rounded-xl border border-[#3D9970]/20 bg-[#3D9970]/5 p-4">
										<h3 className="mb-3 text-sm font-semibold text-[#3D9970] flex items-center gap-2">
											<CheckCircle className="h-4 w-4" />
											Strengths ({session.result.strengths.length})
										</h3>
										<ul className="space-y-1.5">
											{session.result.strengths.map((s, i) => (
												<li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
													<span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#3D9970] shrink-0" />
													{s}
												</li>
											))}
										</ul>
									</div>
								)}
								{session.result.weaknesses.length > 0 && (
									<div className="rounded-xl border border-[#C0392B]/20 bg-[#C0392B]/5 p-4">
										<h3 className="mb-3 text-sm font-semibold text-[#C0392B] flex items-center gap-2">
											<AlertCircle className="h-4 w-4" />
											Gaps Identified ({session.result.weaknesses.length})
										</h3>
										<ul className="space-y-1.5">
											{session.result.weaknesses.map((w, i) => (
												<li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
													<span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C0392B] shrink-0" />
													{w}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}

						{/* High priority gap cards */}
						{highPriority.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold flex items-center gap-2">
									<TrendingUp className="h-4 w-4 text-[#C0392B]" />
									High Priority Actions
								</h3>
								<div className="space-y-3">
									{highPriority.map(rec => (
										<GapCard
											key={rec.id}
											rec={rec}
											status={session.gapStatuses[rec.id] ?? "not_started"}
											evidences={session.evidences.filter(e => e.recId === rec.id)}
											onStatusChange={s => handleStatusChange(rec.id, s)}
											onAddImprovement={() => setImprovementModal({ recId: rec.id, recTitle: rec.title })}
											onAddEvidence={() => setEvidenceModal({ recId: rec.id, recTitle: rec.title })}
											onDeleteEvidence={handleDeleteEvidence}
										/>
									))}
								</div>
							</div>
						)}

						{/* Other priority gap cards */}
						{otherPriority.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold">Additional Recommendations</h3>
								<div className="space-y-3">
									{otherPriority.map(rec => (
										<GapCard
											key={rec.id}
											rec={rec}
											status={session.gapStatuses[rec.id] ?? "not_started"}
											evidences={session.evidences.filter(e => e.recId === rec.id)}
											onStatusChange={s => handleStatusChange(rec.id, s)}
											onAddImprovement={() => setImprovementModal({ recId: rec.id, recTitle: rec.title })}
											onAddEvidence={() => setEvidenceModal({ recId: rec.id, recTitle: rec.title })}
											onDeleteEvidence={handleDeleteEvidence}
										/>
									))}
								</div>
							</div>
						)}

						{/* Improvements log */}
						{session.improvements.length > 0 && (
							<div className="rounded-xl border border-border bg-card p-5">
								<h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
									<TrendingUp className="h-4 w-4 text-primary" />
									Improvements Logged ({session.improvements.length})
								</h3>
								<div className="space-y-2">
									{session.improvements.map(imp => (
										<div key={imp.id} className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
											<CheckCircle className="h-4 w-4 text-[#3D9970] shrink-0 mt-0.5" />
											<div className="flex-1 min-w-0">
												<p className="text-xs font-medium">{imp.description}</p>
												{imp.testType && imp.scoreValue !== undefined && (
													<p className="text-[11px] text-muted-foreground mt-0.5">
														{imp.testType}: {imp.scoreValue}
														{imp.appliedToProfile && (
															<span className="ml-1.5 rounded-full bg-[#3D9970]/10 text-[#3D9970] border border-[#3D9970]/20 px-1.5 py-0.5 text-[9px]">
																applied to profile
															</span>
														)}
													</p>
												)}
											</div>
											<span className="text-[10px] text-muted-foreground shrink-0">
												{new Date(imp.addedAt).toLocaleDateString()}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						<p className="text-xs text-muted-foreground text-center">
							AI-generated analysis based on your profile — update your profile and re-analyze for fresh recommendations
						</p>
					</div>
				</FadeIn>
			)}

			{/* Modals */}
			{improvementModal && (
				<ImprovementModal
					onClose={() => setImprovementModal(null)}
					onSubmit={handleAddImprovement}
				/>
			)}

			{evidenceModal && (
				<EvidenceModal
					recTitle={evidenceModal.recTitle}
					onClose={() => setEvidenceModal(null)}
					onSubmitLink={handleAddEvidenceLink}
					onUploadFile={handleUploadFile}
				/>
			)}
		</div>
	);
}
