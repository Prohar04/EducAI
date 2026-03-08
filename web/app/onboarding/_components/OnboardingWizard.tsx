"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
	GraduationCap, ArrowRight, ArrowLeft, Check,
	BookOpen, FlaskConical, Wallet, Globe,
	Info, AlertTriangle, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertUserProfile } from "@/lib/auth/action";
import { STAGES, TARGET_INTAKES, LEVELS } from "@/lib/data/stages";
import { COUNTRIES, COUNTRY_TESTS } from "@/lib/data/countries";
import { MAJORS } from "@/lib/data/majors";
import { TUITION_RANGES, PRIORITIES, CURRENCIES } from "@/lib/data/tuitionRanges";
import type { UserProfile, Session } from "@/types/auth.type";

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardValues = {
	// Step 1
	currentStage: string;
	targetIntake: string;
	targetCountries: string[];
	intendedLevel: string;
	// Step 2
	currentInstitution: string;
	majorOrTrack: string;
	gpa: string;
	gpaScale: string;
	graduationYear: string;
	backlogs: string;
	workExperienceMonths: string;
	// Step 3
	englishTestType: string;
	englishScore: string;
	gre: string;
	gmat: string;
	// Step 4
	budgetCurrency: string;
	budgetMax: string;
	fundingNeed: string;
	preferredCities: string;
	priorities: string[];
};

type StepProps = { values: WizardValues; set: <K extends keyof WizardValues>(k: K, v: WizardValues[K]) => void };

// ─── Step 1: Student Stage ────────────────────────────────────────────────────

function Step1({ values, set }: StepProps) {
	const toggle = (code: string) => {
		const cur = values.targetCountries;
		set("targetCountries", cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]);
	};

	const selectedStage = STAGES.find((s) => s.value === values.currentStage);

	const recommendedTests = values.targetCountries.length > 0
		? [...new Set(values.targetCountries.flatMap((c) => COUNTRY_TESTS[c] ?? []))]
		: [];

	return (
		<div className="space-y-6">
			{/* Stage selection */}
			<div>
				<Label className="mb-3 block text-sm font-medium">Where are you in your academic journey? <span className="text-destructive">*</span></Label>
				<div className="grid gap-2 sm:grid-cols-2">
					{STAGES.map((s) => (
						<button
							key={s.value}
							type="button"
							onClick={() => set("currentStage", s.value)}
							className={`rounded-lg border px-4 py-3 text-left text-sm transition-all ${
								values.currentStage === s.value
									? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40"
									: "border-border bg-card hover:border-primary/40"
							}`}
						>
							<span className="font-medium">{s.label}</span>
							<span className="mt-0.5 block text-xs text-muted-foreground">{s.description}</span>
						</button>
					))}
				</div>
				{selectedStage && (
					<div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
						<Info className="mt-0.5 size-3.5 shrink-0" />
						{selectedStage.tip}
					</div>
				)}
			</div>

			{/* Intake + Level */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label className="mb-2 block text-sm font-medium">Target Intake <span className="text-destructive">*</span></Label>
					<select
						value={values.targetIntake}
						onChange={(e) => set("targetIntake", e.target.value)}
						className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">Select intake…</option>
						{TARGET_INTAKES.map((t) => <option key={t} value={t}>{t}</option>)}
					</select>
				</div>
				<div>
					<Label className="mb-2 block text-sm font-medium">Intended Degree Level <span className="text-destructive">*</span></Label>
					<div className="flex flex-wrap gap-2">
						{LEVELS.map((l) => (
							<button
								key={l}
								type="button"
								onClick={() => set("intendedLevel", l)}
								className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
									values.intendedLevel === l
										? "border-primary bg-primary text-primary-foreground"
										: "border-border hover:border-primary/40"
								}`}
							>
								{l}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Country multi-select */}
			<div>
				<Label className="mb-2 block text-sm font-medium">Target Countries <span className="text-destructive">*</span></Label>
				<div className="flex flex-wrap gap-2">
					{COUNTRIES.map((c) => (
						<button
							key={c.code}
							type="button"
							onClick={() => toggle(c.code)}
							className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all ${
								values.targetCountries.includes(c.code)
									? "border-primary bg-primary/10 text-primary font-medium"
									: "border-border hover:border-primary/30"
							}`}
						>
							<span>{c.flag}</span>
							<span>{c.name}</span>
						</button>
					))}
				</div>
				{recommendedTests.length > 0 && (
					<div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
						<Info className="mt-0.5 size-3.5 shrink-0" />
						Recommended tests for your destinations: <strong className="ml-1">{recommendedTests.join(", ")}</strong>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Step 2: Academic Profile ─────────────────────────────────────────────────

function Step2({ values, set }: StepProps) {
	const [showMajorSuggestions, setShowMajorSuggestions] = useState(false);

	const gpa4Estimate = () => {
		if (!values.gpa || !values.gpaScale) return null;
		const n = parseFloat(values.gpa);
		if (isNaN(n)) return null;
		if (values.gpaScale === "4.0") return null;
		if (values.gpaScale === "10") return (n / 10 * 4).toFixed(2);
		if (values.gpaScale === "5") return (n / 5 * 4).toFixed(2);
		if (values.gpaScale === "%") return (n / 100 * 4).toFixed(2);
		return null;
	};
	const estimate = gpa4Estimate();

	const majorSuggestions = showMajorSuggestions
		? MAJORS.filter((m) =>
				values.majorOrTrack && m.label.toLowerCase().includes(values.majorOrTrack.toLowerCase()),
		  ).slice(0, 5)
		: [];

	return (
		<div className="space-y-5">
			<div>
				<Label htmlFor="institution" className="mb-1.5 block text-sm font-medium">Current / Last Institution <span className="text-xs text-muted-foreground">(optional)</span></Label>
				<Input
					id="institution"
					placeholder="e.g. University of Dhaka"
					value={values.currentInstitution}
					onChange={(e) => set("currentInstitution", e.target.value)}
				/>
			</div>

			<div>
				<Label htmlFor="major" className="mb-1.5 block text-sm font-medium">Major / Field of Study <span className="text-destructive">*</span></Label>
				<Input
					id="major"
					placeholder="e.g. Computer Science, Economics…"
					value={values.majorOrTrack}
					onChange={(e) => {
						set("majorOrTrack", e.target.value);
						setShowMajorSuggestions(true);
					}}
					autoComplete="off"
				/>
				{majorSuggestions.length > 0 && values.majorOrTrack && showMajorSuggestions && (
					<div className="mt-1 overflow-hidden rounded-md border border-border bg-popover shadow-md">
						{majorSuggestions.map((m) => (
							<button
								key={m.value}
								type="button"
								className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
								onClick={() => {
									set("majorOrTrack", m.label);
									setShowMajorSuggestions(false);
								}}
							>
								<span className="font-medium">{m.label}</span>
								<span className="ml-2 text-xs text-muted-foreground">{m.field}</span>
							</button>
						))}
					</div>
				)}
			</div>

			{/* GPA */}
			<div>
				<Label className="mb-1.5 block text-sm font-medium">GPA / Grade</Label>
				<div className="flex gap-2">
					<Input
						placeholder="e.g. 3.7"
						value={values.gpa}
						onChange={(e) => set("gpa", e.target.value)}
						className="max-w-[120px]"
						type="number"
						step="0.01"
					/>
					<select
						value={values.gpaScale}
						onChange={(e) => set("gpaScale", e.target.value)}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="4.0">/ 4.0</option>
						<option value="10">/ 10</option>
						<option value="5">/ 5</option>
						<option value="%">%</option>
					</select>
				</div>
				{estimate && (
					<p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
						<Info className="size-3.5 text-blue-500" />
						Estimated 4.0-scale GPA: <strong className="text-blue-600 dark:text-blue-400">~{estimate}</strong> (estimate only)
					</p>
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="gradYear" className="mb-1.5 block text-sm font-medium">Graduation Year</Label>
					<Input
						id="gradYear"
						type="number"
						placeholder="e.g. 2025"
						value={values.graduationYear}
						onChange={(e) => set("graduationYear", e.target.value)}
					/>
				</div>
				<div>
					<Label htmlFor="backlogs" className="mb-1.5 block text-sm font-medium">Backlogs / Failed Subjects <span className="text-xs text-muted-foreground">(0 if none)</span></Label>
					<Input
						id="backlogs"
						type="number"
						placeholder="0"
						min="0"
						value={values.backlogs}
						onChange={(e) => set("backlogs", e.target.value)}
					/>
				</div>
			</div>

			<div>
				<Label htmlFor="workExp" className="mb-1.5 block text-sm font-medium">Work Experience <span className="text-xs text-muted-foreground">(months, 0 if none)</span></Label>
				<Input
					id="workExp"
					type="number"
					placeholder="e.g. 24"
					min="0"
					value={values.workExperienceMonths}
					onChange={(e) => set("workExperienceMonths", e.target.value)}
				/>
			</div>
		</div>
	);
}

// ─── Step 3: Tests & Language ─────────────────────────────────────────────────

const ENGLISH_THRESHOLDS: Record<string, { min: number; label: string }> = {
	IELTS: { min: 6.5, label: "Min 6.5 for most universities" },
	TOEFL: { min: 90, label: "Min 90 for most universities" },
	Duolingo: { min: 110, label: "Min 110 for most universities" },
};

function Step3({ values, set }: StepProps) {
	const threshold = values.englishTestType ? ENGLISH_THRESHOLDS[values.englishTestType] : null;
	const score = parseFloat(values.englishScore);
	const belowThreshold = threshold && !isNaN(score) && score < threshold.min;

	const recommendedTests = values.targetCountries
		? [...new Set((values as unknown as WizardValues).targetCountries.flatMap((c: string) => COUNTRY_TESTS[c] ?? []))]
		: [];

	return (
		<div className="space-y-5">
			{recommendedTests.length > 0 && (
				<div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs text-blue-600 dark:text-blue-400">
					<Info className="mt-0.5 size-3.5 shrink-0" />
					Based on your target countries, consider: <strong className="ml-1">{recommendedTests.join(", ")}</strong>
				</div>
			)}

			{/* English test */}
			<div>
				<Label className="mb-2 block text-sm font-medium">English Proficiency Test</Label>
				<div className="flex flex-wrap gap-2">
					{["IELTS", "TOEFL", "Duolingo", "PTE", "None"].map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => set("englishTestType", t)}
							className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
								values.englishTestType === t
									? "border-primary bg-primary text-primary-foreground"
									: "border-border hover:border-primary/40"
							}`}
						>
							{t}
						</button>
					))}
				</div>
			</div>

			{values.englishTestType && values.englishTestType !== "None" && (
				<div>
					<Label htmlFor="engScore" className="mb-1.5 block text-sm font-medium">
						{values.englishTestType} Score
					</Label>
					<Input
						id="engScore"
						type="number"
						step="0.5"
						placeholder={values.englishTestType === "IELTS" ? "e.g. 7.0" : "e.g. 100"}
						value={values.englishScore}
						onChange={(e) => set("englishScore", e.target.value)}
						className="max-w-[160px]"
					/>
					{threshold && (
						<p className={`mt-1.5 flex items-center gap-1.5 text-xs ${belowThreshold ? "text-amber-600" : "text-muted-foreground"}`}>
							{belowThreshold
								? <AlertTriangle className="size-3.5" />
								: <Info className="size-3.5" />}
							{threshold.label}
							{belowThreshold && " — your score may be below typical requirements."}
						</p>
					)}
				</div>
			)}

			{/* GRE / GMAT */}
			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<Label htmlFor="gre" className="mb-1.5 block text-sm font-medium">GRE Score <span className="text-xs text-muted-foreground">(optional)</span></Label>
					<Input
						id="gre"
						type="number"
						placeholder="e.g. 320"
						min="260"
						max="340"
						value={values.gre}
						onChange={(e) => set("gre", e.target.value)}
					/>
					<p className="mt-1 text-xs text-muted-foreground">Top programmes expect 320+</p>
				</div>
				<div>
					<Label htmlFor="gmat" className="mb-1.5 block text-sm font-medium">GMAT Score <span className="text-xs text-muted-foreground">(optional)</span></Label>
					<Input
						id="gmat"
						type="number"
						placeholder="e.g. 660"
						min="200"
						max="800"
						value={values.gmat}
						onChange={(e) => set("gmat", e.target.value)}
					/>
					<p className="mt-1 text-xs text-muted-foreground">MBA programmes typically require 600+</p>
				</div>
			</div>
		</div>
	);
}

// ─── Step 4: Budget & Preferences ────────────────────────────────────────────

function Step4({ values, set }: StepProps) {
	const togglePriority = (v: string) => {
		const cur = values.priorities;
		set("priorities", cur.includes(v) ? cur.filter((p) => p !== v) : [...cur, v]);
	};

	const relevantRanges = TUITION_RANGES.filter((r) =>
		values.targetCountries.includes(r.code),
	);

	const budgetNum = parseFloat(values.budgetMax);
	const lowBudget = !isNaN(budgetNum) && relevantRanges.some(
		(r) => budgetNum < (values.intendedLevel === "BSc" ? r.bscMin : r.mscMin),
	);

	return (
		<div className="space-y-5">
			{/* Budget */}
			<div>
				<Label className="mb-2 block text-sm font-medium">Annual Budget (tuition only)</Label>
				<div className="flex gap-2">
					<select
						value={values.budgetCurrency}
						onChange={(e) => {
							set("budgetCurrency", e.target.value);
							set("budgetMax", "");
						}}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					>
						{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
					</select>
					<Input
						type="number"
						placeholder="e.g. 35000"
						value={values.budgetMax}
						onChange={(e) => set("budgetMax", e.target.value)}
					/>
				</div>
				{lowBudget && (
					<div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
						<AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
						Your budget may be below the typical range for your target countries. Consider scholarships or Germany/Netherlands.
					</div>
				)}
			</div>

			{/* Tuition reference */}
			{relevantRanges.length > 0 && (
				<div className="rounded-lg border border-border bg-muted/40 p-4">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Typical Annual Tuition</p>
					<div className="space-y-1.5">
						{relevantRanges.map((r) => (
							<div key={r.code} className="flex items-center justify-between text-sm">
								<span>{COUNTRIES.find((c) => c.code === r.code)?.flag ?? ""} {r.country}</span>
								<span className="font-medium text-muted-foreground">
									{r.currency} {(values.intendedLevel === "BSc" ? r.bscMin : r.mscMin).toLocaleString()}–{(values.intendedLevel === "BSc" ? r.bscMax : r.mscMax).toLocaleString()}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Funding */}
			<div>
				<Label className="mb-2 block text-sm font-medium">Do you need scholarship / funding support?</Label>
				<div className="flex gap-3">
					{[{ v: "true", l: "Yes, I need funding" }, { v: "false", l: "No, self-funded" }].map(({ v, l }) => (
						<button
							key={v}
							type="button"
							onClick={() => set("fundingNeed", v)}
							className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
								values.fundingNeed === v
									? "border-primary bg-primary/10 text-primary"
									: "border-border hover:border-primary/40"
							}`}
						>
							{l}
						</button>
					))}
				</div>
				{values.fundingNeed === "true" && (
					<div className="mt-2 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-600 dark:text-green-400">
						<CheckCircle2 className="size-3.5 shrink-0" />
						Great — we&apos;ll highlight scholarship-eligible programmes for you.
					</div>
				)}
			</div>

			{/* Preferred cities */}
			<div>
				<Label htmlFor="cities" className="mb-1.5 block text-sm font-medium">Preferred Cities <span className="text-xs text-muted-foreground">(optional, comma-separated)</span></Label>
				<Input
					id="cities"
					placeholder="e.g. London, Berlin, Toronto"
					value={values.preferredCities}
					onChange={(e) => set("preferredCities", e.target.value)}
				/>
			</div>

			{/* Priorities */}
			<div>
				<Label className="mb-2 block text-sm font-medium">What matters most to you? <span className="text-xs text-muted-foreground">(pick up to 3)</span></Label>
				<div className="flex flex-wrap gap-2">
					{PRIORITIES.map((p) => (
						<button
							key={p.value}
							type="button"
							onClick={() => togglePriority(p.value)}
							disabled={!values.priorities.includes(p.value) && values.priorities.length >= 3}
							className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all disabled:opacity-40 ${
								values.priorities.includes(p.value)
									? "border-primary bg-primary/10 text-primary font-medium"
									: "border-border hover:border-primary/30"
							}`}
						>
							<span>{p.icon}</span>
							{p.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

// ─── Step 5: Review ───────────────────────────────────────────────────────────

function StepReview({ values }: { values: WizardValues }) {
	const countryNames = values.targetCountries
		.map((c) => COUNTRIES.find((x) => x.code === c)?.name ?? c)
		.join(", ");
	const stage = STAGES.find((s) => s.value === values.currentStage)?.label ?? "—";

	const rows: Array<[string, string]> = [
		["Stage", stage],
		["Target Intake", values.targetIntake || "—"],
		["Degree Level", values.intendedLevel || "—"],
		["Target Countries", countryNames || "—"],
		["Major", values.majorOrTrack || "—"],
		["GPA", values.gpa ? `${values.gpa} / ${values.gpaScale}` : "—"],
		["English Test", values.englishTestType && values.englishTestType !== "None"
			? `${values.englishTestType} ${values.englishScore || ""}`
			: values.englishTestType || "—"],
		["GRE", values.gre || "—"],
		["GMAT", values.gmat || "—"],
		["Annual Budget", values.budgetMax ? `${values.budgetCurrency} ${Number(values.budgetMax).toLocaleString()}` : "—"],
		["Funding needed", values.fundingNeed === "true" ? "Yes" : values.fundingNeed === "false" ? "No" : "—"],
		["Priorities", values.priorities.map((p) => PRIORITIES.find((x) => x.value === p)?.label ?? p).join(", ") || "—"],
	];

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Review your information before finalising. You can always update your profile later.
			</p>
			<div className="overflow-hidden rounded-xl border border-border">
				{rows.map(([label, value], i) => (
					<div
						key={label}
						className={`flex items-start justify-between gap-4 px-4 py-3 text-sm ${
							i % 2 === 0 ? "bg-muted/30" : "bg-card"
						}`}
					>
						<span className="font-medium text-muted-foreground w-40 shrink-0">{label}</span>
						<span className="text-right">{value}</span>
					</div>
				))}
			</div>
			<div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 text-xs text-green-600 dark:text-green-400">
				<CheckCircle2 className="size-3.5 shrink-0" />
				You&apos;re all set! Click &ldquo;Finish Setup&rdquo; to enter your workspace.
			</div>
		</div>
	);
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

const STEP_META = [
	{ title: "Student Stage",       icon: Globe,         description: "Tell us where you are in your journey." },
	{ title: "Academic Profile",    icon: BookOpen,      description: "Grades, institution, and experience." },
	{ title: "Tests & Language",    icon: FlaskConical,  description: "Proficiency and entrance exams." },
	{ title: "Budget & Goals",      icon: Wallet,        description: "Funding needs and preferences." },
	{ title: "Review & Finish",     icon: CheckCircle2,  description: "Confirm before we personalise your workspace." },
];

function buildPayload(values: WizardValues): FormData {
	const fd = new FormData();
	fd.append("currentStage", values.currentStage);
	fd.append("targetIntake", values.targetIntake);
	fd.append("targetCountries", JSON.stringify(values.targetCountries));
	fd.append("intendedLevel", values.intendedLevel);
	fd.append("level", values.intendedLevel); // legacy compat
	if (values.currentInstitution) fd.append("currentInstitution", values.currentInstitution);
	fd.append("majorOrTrack", values.majorOrTrack);
	fd.append("intendedMajor", values.majorOrTrack); // legacy compat
	if (values.gpa) { fd.append("gpa", values.gpa); fd.append("gpaScale", values.gpaScale); }
	if (values.graduationYear) fd.append("graduationYear", values.graduationYear);
	if (values.backlogs) fd.append("backlogs", values.backlogs);
	if (values.workExperienceMonths) fd.append("workExperienceMonths", values.workExperienceMonths);
	if (values.englishTestType) fd.append("englishTestType", values.englishTestType);
	if (values.englishScore) fd.append("englishScore", values.englishScore);
	if (values.gre) fd.append("gre", values.gre);
	if (values.gmat) fd.append("gmat", values.gmat);
	fd.append("budgetCurrency", values.budgetCurrency || "USD");
	if (values.budgetMax) fd.append("budgetMax", values.budgetMax);
	if (values.fundingNeed !== "") fd.append("fundingNeed", values.fundingNeed);
	if (values.preferredCities) {
		const cities = values.preferredCities.split(",").map((c) => c.trim()).filter(Boolean);
		fd.append("preferredCities", JSON.stringify(cities));
	}
	if (values.priorities.length > 0) fd.append("priorities", JSON.stringify(values.priorities));
	fd.append("onboardingDone", "true");
	return fd;
}

function canAdvance(step: number, values: WizardValues): boolean {
	if (step === 0) return !!(values.currentStage && values.targetIntake && values.intendedLevel && values.targetCountries.length > 0);
	if (step === 1) return !!values.majorOrTrack;
	return true;
}

export default function OnboardingWizard({
	user,
	initialProfile,
}: {
	user: Session["user"];
	initialProfile: UserProfile | null;
}) {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const [values, setValues] = useState<WizardValues>({
		currentStage: initialProfile?.currentStage ?? "",
		targetIntake: initialProfile?.targetIntake ?? "",
		targetCountries: (initialProfile?.targetCountries as string[]) ?? [],
		intendedLevel: initialProfile?.intendedLevel ?? initialProfile?.level ?? "",
		currentInstitution: initialProfile?.currentInstitution ?? "",
		majorOrTrack: initialProfile?.majorOrTrack ?? initialProfile?.intendedMajor ?? "",
		gpa: initialProfile?.gpa?.toString() ?? "",
		gpaScale: initialProfile?.gpaScale ?? "4.0",
		graduationYear: initialProfile?.graduationYear?.toString() ?? "",
		backlogs: initialProfile?.backlogs?.toString() ?? "",
		workExperienceMonths: initialProfile?.workExperienceMonths?.toString() ?? "",
		englishTestType: initialProfile?.englishTestType ?? "",
		englishScore: initialProfile?.englishScore?.toString() ?? "",
		gre: initialProfile?.gre?.toString() ?? "",
		gmat: initialProfile?.gmat?.toString() ?? "",
		budgetCurrency: initialProfile?.budgetCurrency ?? "USD",
		budgetMax: initialProfile?.budgetMax?.toString() ?? "",
		fundingNeed: initialProfile?.fundingNeed == null ? "" : String(initialProfile.fundingNeed),
		preferredCities: (initialProfile?.preferredCities as string[] | null)?.join(", ") ?? "",
		priorities: (initialProfile?.priorities as string[]) ?? [],
	});

	const set = <K extends keyof WizardValues>(k: K, v: WizardValues[K]) =>
		setValues((prev) => ({ ...prev, [k]: v }));

	const totalSteps = STEP_META.length;

	const handleNext = () => {
		if (step < totalSteps - 1) setStep((s) => s + 1);
	};

	const handleBack = () => {
		if (step > 0) setStep((s) => s - 1);
	};

	const handleFinish = () => {
		setError(null);
		startTransition(async () => {
			try {
				const fd = buildPayload(values);
				const result = await upsertUserProfile(undefined, fd);
				if (result?.success) {
					router.push("/app");
					router.refresh();
				} else {
					setError(result?.message ?? "Something went wrong.");
				}
			} catch {
				setError("Failed to save profile. Please try again.");
			}
		});
	};

	const currentMeta = STEP_META[step];
	const isLast = step === totalSteps - 1;
	const canGoNext = canAdvance(step, values);

	return (
		<div className="flex min-h-screen bg-background">
			{/* Sidebar */}
			<aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-muted/30 p-8 lg:flex">
				<div className="mb-8 flex items-center gap-2">
					<GraduationCap className="size-7 text-primary" />
					<span className="text-lg font-bold tracking-tight">
						Educ<span className="text-primary">AI</span>
					</span>
				</div>

				<div className="mb-6">
					<p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Profile Setup</p>
					<p className="mt-1 text-sm text-muted-foreground">Personalise your study-abroad experience</p>
				</div>

				<nav className="space-y-1">
					{STEP_META.map((meta, i) => {
						const Icon = meta.icon;
						const done = i < step;
						const active = i === step;
						return (
							<div
								key={i}
								className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${
									active ? "bg-primary/10" : done ? "opacity-70" : "opacity-40"
								}`}
							>
								<div className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${
									done ? "bg-primary text-primary-foreground" : active ? "border-2 border-primary text-primary" : "border border-border"
								}`}>
									{done ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
								</div>
								<div>
									<p className={`text-sm font-medium ${active ? "text-primary" : ""}`}>{meta.title}</p>
									{active && <p className="text-xs text-muted-foreground">{meta.description}</p>}
								</div>
							</div>
						);
					})}
				</nav>

				<div className="mt-auto rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
					<p className="font-medium">Hi, {user.name} 👋</p>
					<p className="mt-0.5">{user.email}</p>
				</div>
			</aside>

			{/* Main panel */}
			<main className="flex flex-1 flex-col">
				{/* Mobile header */}
				<div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
					<div className="flex items-center gap-2">
						<GraduationCap className="size-6 text-primary" />
						<span className="font-bold">Educ<span className="text-primary">AI</span></span>
					</div>
					<span className="text-sm text-muted-foreground">Step {step + 1} / {totalSteps}</span>
				</div>

				{/* Progress bar */}
				<div className="h-1 w-full bg-muted">
					<div
						className="h-full bg-primary transition-all duration-500"
						style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
					/>
				</div>

				<div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
					<div className="w-full max-w-2xl">
						{/* Step header */}
						<div className="mb-8">
							<div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
								<currentMeta.icon className="size-3.5" />
								Step {step + 1} of {totalSteps}
							</div>
							<h1 className="text-2xl font-bold tracking-tight">{currentMeta.title}</h1>
							<p className="mt-1 text-muted-foreground">{currentMeta.description}</p>
						</div>

						{/* Step content */}
						<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
							{step === 0 && <Step1 values={values} set={set} />}
							{step === 1 && <Step2 values={values} set={set} />}
							{step === 2 && <Step3 values={values} set={set as StepProps["set"]} />}
							{step === 3 && <Step4 values={values} set={set} />}
							{step === 4 && <StepReview values={values} />}
						</div>

						{/* Error */}
						{error && (
							<div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								<AlertTriangle className="size-4 shrink-0" />
								{error}
							</div>
						)}

						{/* Navigation */}
						<div className="mt-6 flex items-center justify-between">
							<Button
								variant="outline"
								onClick={handleBack}
								disabled={step === 0 || isPending}
							>
								<ArrowLeft className="mr-2 size-4" />
								Back
							</Button>

							{isLast ? (
								<Button onClick={handleFinish} disabled={isPending}>
									{isPending ? "Saving…" : "Finish Setup"}
									{!isPending && <Check className="ml-2 size-4" />}
								</Button>
							) : (
								<Button
									onClick={handleNext}
									disabled={!canGoNext}
									title={!canGoNext ? "Please fill in the required fields" : undefined}
								>
									Continue
									<ArrowRight className="ml-2 size-4" />
								</Button>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
