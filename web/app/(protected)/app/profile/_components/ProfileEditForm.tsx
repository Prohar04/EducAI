"use client";

import { useActionState } from "react";
import { upsertUserProfile } from "@/lib/auth/action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { UserProfile, OnboardingFormState } from "@/types/auth.type";

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGES = [
	"High School/A-Levels",
	"Undergraduate",
	"Graduate",
	"Working Professional",
	"Gap Year",
];

const LEVELS = ["BSc", "MSc", "PhD", "MBA", "Diploma"];

const INTAKES = [
	"Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027",
	"Fall 2028", "Spring 2028",
];

const ENGLISH_TESTS = ["None", "IELTS", "TOEFL", "PTE", "Duolingo"];

const CURRENCIES = ["USD", "GBP", "EUR", "AUD", "CAD", "INR"];

// ─── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5">
			<Label className="text-sm font-medium">{label}</Label>
			{children}
		</div>
	);
}

function Select({
	name,
	defaultValue,
	options,
	placeholder,
}: {
	name: string;
	defaultValue?: string | null;
	options: string[];
	placeholder?: string;
}) {
	return (
		<select
			name={name}
			defaultValue={defaultValue ?? ""}
			className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
		>
			{placeholder && <option value="">{placeholder}</option>}
			{options.map((o) => (
				<option key={o} value={o}>
					{o}
				</option>
			))}
		</select>
	);
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { initialProfile: UserProfile | null };

export default function ProfileEditForm({ initialProfile }: Props) {
	const p = initialProfile;

	const [state, formAction, isPending] = useActionState<OnboardingFormState, FormData>(
		upsertUserProfile,
		undefined,
	);

	// Current target countries as comma-separated string for the hidden input
	const defaultCountries = (() => {
		try {
			const raw = p?.targetCountries;
			if (Array.isArray(raw)) return JSON.stringify(raw);
			if (typeof raw === "string") return raw;
		} catch {}
		return "[]";
	})();

	return (
		<form action={formAction} className="space-y-8">
			{/* Mark onboarding complete on save */}
			<input type="hidden" name="onboardingDone" value="true" />

			{/* Pass back targetCountries as JSON (unchanged unless user edits) */}
			<input type="hidden" name="targetCountries" value={defaultCountries} />

			{/* ── Section 1: Academic Stage ── */}
			<section className="rounded-xl border border-border bg-card p-6 space-y-5">
				<h2 className="font-semibold text-base">Academic Stage</h2>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="Current stage">
						<Select
							name="currentStage"
							defaultValue={p?.currentStage}
							options={STAGES}
							placeholder="Select stage"
						/>
					</Field>
					<Field label="Target intake">
						<Select
							name="targetIntake"
							defaultValue={p?.targetIntake}
							options={INTAKES}
							placeholder="Select intake"
						/>
					</Field>
					<Field label="Target degree level">
						<Select
							name="intendedLevel"
							defaultValue={p?.intendedLevel ?? p?.level ?? ""}
							options={LEVELS}
							placeholder="Select level"
						/>
					</Field>
					<Field label="Intended major / field">
						<Input
							name="intendedMajor"
							defaultValue={p?.intendedMajor ?? p?.majorOrTrack ?? ""}
							placeholder="e.g. Computer Science"
						/>
					</Field>
				</div>
			</section>

			{/* ── Section 2: Academic record ── */}
			<section className="rounded-xl border border-border bg-card p-6 space-y-5">
				<h2 className="font-semibold text-base">Academic Record</h2>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="Current institution">
						<Input
							name="currentInstitution"
							defaultValue={p?.currentInstitution ?? ""}
							placeholder="University / school name"
						/>
					</Field>
					<Field label="Major / track">
						<Input
							name="majorOrTrack"
							defaultValue={p?.majorOrTrack ?? ""}
							placeholder="e.g. Computer Engineering"
						/>
					</Field>
					<Field label="GPA">
						<Input
							type="number"
							name="gpa"
							defaultValue={p?.gpa?.toString() ?? ""}
							placeholder="e.g. 3.7"
							step="0.01"
							min="0"
							max="10"
						/>
					</Field>
					<Field label="GPA scale (e.g. 4.0, 10.0)">
						<Input
							name="gpaScale"
							defaultValue={p?.gpaScale ?? ""}
							placeholder="4.0"
						/>
					</Field>
					<Field label="Graduation year">
						<Input
							type="number"
							name="graduationYear"
							defaultValue={p?.graduationYear?.toString() ?? ""}
							placeholder="e.g. 2025"
							min="2000"
							max="2035"
						/>
					</Field>
					<Field label="Work experience (months)">
						<Input
							type="number"
							name="workExperienceMonths"
							defaultValue={p?.workExperienceMonths?.toString() ?? ""}
							placeholder="0"
							min="0"
						/>
					</Field>
				</div>
			</section>

			{/* ── Section 3: Test Scores ── */}
			<section className="rounded-xl border border-border bg-card p-6 space-y-5">
				<h2 className="font-semibold text-base">Test Scores</h2>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="English test">
						<Select
							name="englishTestType"
							defaultValue={p?.englishTestType ?? ""}
							options={ENGLISH_TESTS}
							placeholder="None"
						/>
					</Field>
					<Field label="English test score">
						<Input
							type="number"
							name="englishScore"
							defaultValue={p?.englishScore?.toString() ?? ""}
							placeholder="e.g. 7.5"
							step="0.5"
							min="0"
						/>
					</Field>
					<Field label="GRE score">
						<Input
							type="number"
							name="gre"
							defaultValue={p?.gre?.toString() ?? ""}
							placeholder="e.g. 320"
							min="0"
							max="340"
						/>
					</Field>
					<Field label="GMAT score">
						<Input
							type="number"
							name="gmat"
							defaultValue={p?.gmat?.toString() ?? ""}
							placeholder="e.g. 680"
							min="0"
							max="800"
						/>
					</Field>
				</div>
			</section>

			{/* ── Section 4: Budget & Preferences ── */}
			<section className="rounded-xl border border-border bg-card p-6 space-y-5">
				<h2 className="font-semibold text-base">Budget &amp; Preferences</h2>
				<div className="grid gap-5 sm:grid-cols-2">
					<Field label="Currency">
						<Select
							name="budgetCurrency"
							defaultValue={p?.budgetCurrency ?? "USD"}
							options={CURRENCIES}
						/>
					</Field>
					<Field label="Max budget per year">
						<Input
							type="number"
							name="budgetMax"
							defaultValue={p?.budgetMax?.toString() ?? ""}
							placeholder="e.g. 30000"
							min="0"
						/>
					</Field>
					<Field label="Funding need">
						<select
							name="fundingNeed"
							defaultValue={p?.fundingNeed === true ? "true" : p?.fundingNeed === false ? "false" : ""}
							className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						>
							<option value="">Not specified</option>
							<option value="true">Yes, I need funding</option>
							<option value="false">No, self-funded</option>
						</select>
					</Field>
				</div>
			</section>

			{/* ── Status + Submit ── */}
			{state && !state.success && state.message && (
				<p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{state.message}
				</p>
			)}
			{state?.success && (
				<p className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
					<CheckCircle2 className="size-4 shrink-0" />
					Profile saved successfully.
				</p>
			)}

			<div className="flex items-center justify-end gap-3">
				<Button type="submit" disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 size-4 animate-spin" />
							Saving…
						</>
					) : (
						"Save profile"
					)}
				</Button>
			</div>
		</form>
	);
}
