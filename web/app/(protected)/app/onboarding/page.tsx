"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertUserProfile } from "@/lib/auth/action";
import type { OnboardingFormState } from "@/types/auth.type";

// ─── Step definitions ────────────────────────────────────────────────────────

const LEVELS = ["BSc", "MSc", "PhD", "MBA", "Diploma"];
const BUDGET_RANGES = [
  "< $10,000",
  "$10,000 – $20,000",
  "$20,000 – $40,000",
  "$40,000 – $60,000",
  "> $60,000",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState<OnboardingFormState, FormData>(
    upsertUserProfile,
    undefined,
  );

  // Local form values so we can accumulate across steps
  const [values, setValues] = useState<FormValues>({
    targetCountry: "",
    level: "",
    budgetRange: "",
    intendedMajor: "",
    gpa: "",
    ielts: "",
    gre: "",
    toefl: "",
    sat: "",
  });

  const set = (k: keyof FormValues, v: string) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  // Redirect on success
  if (state?.success) {
    router.push("/app/home");
  }

  const steps = [
    // Step 0 — Target
    <StepTarget key={0} values={values} set={set} />,
    // Step 1 — Academic
    <StepAcademic key={1} values={values} set={set} />,
    // Step 2 — Test scores
    <StepScores key={2} values={values} set={set} />,
  ];

  const isLast = step === steps.length - 1;

  // Build flat FormData for the final submit
  const buildFormData = () => {
    const fd = new FormData();
    fd.append("targetCountry", values.targetCountry);
    fd.append("level", values.level);
    if (values.budgetRange) fd.append("budgetRange", values.budgetRange);
    if (values.intendedMajor) fd.append("intendedMajor", values.intendedMajor);
    if (values.gpa) fd.append("gpa", values.gpa);

    const scores: Record<string, number> = {};
    if (values.ielts) scores["IELTS"] = Number(values.ielts);
    if (values.toefl) scores["TOEFL"] = Number(values.toefl);
    if (values.gre) scores["GRE"] = Number(values.gre);
    if (values.sat) scores["SAT"] = Number(values.sat);
    if (Object.keys(scores).length > 0) fd.append("testScores", JSON.stringify(scores));

    return fd;
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 space-y-1 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Let&apos;s set up your profile</h1>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length} — we&apos;ll personalise your experience.
          </p>
        </div>

        {/* Progress dots */}
        <div className="mb-8 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/50" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        {/* Current step content */}
        <div className="mb-8">{steps[step]}</div>

        {/* Error from server */}
        {state && !state.success && state.message && (
          <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {state.message}
          </p>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={step === 0 || pending}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="mr-1 size-4" />
            Back
          </Button>

          {isLast ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() => formAction(buildFormData())}
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Finish setup"
              )}
            </Button>
          ) : (
            <Button type="button" onClick={() => setStep((s) => s + 1)}>
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step sub-components ──────────────────────────────────────────────────────

type FormValues = {
  targetCountry: string;
  level: string;
  budgetRange: string;
  intendedMajor: string;
  gpa: string;
  ielts: string;
  gre: string;
  toefl: string;
  sat: string;
};

function StepTarget({
  values,
  set,
}: {
  values: FormValues;
  set: (k: keyof FormValues, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="targetCountry">Target country *</Label>
        <Input
          id="targetCountry"
          placeholder="e.g. United States, Germany, Canada…"
          value={values.targetCountry}
          onChange={(e) => set("targetCountry", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Degree level *</Label>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => set("level", l)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                values.level === l
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Annual budget (USD)</Label>
        <div className="flex flex-wrap gap-2">
          {BUDGET_RANGES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => set("budgetRange", b)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                values.budgetRange === b
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepAcademic({
  values,
  set,
}: {
  values: FormValues;
  set: (k: keyof FormValues, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="intendedMajor">Intended major / field of study</Label>
        <Input
          id="intendedMajor"
          placeholder="e.g. Computer Science, Business…"
          value={values.intendedMajor}
          onChange={(e) => set("intendedMajor", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gpa">Current GPA (0 – 4.0 scale)</Label>
        <Input
          id="gpa"
          type="number"
          step="0.01"
          min="0"
          max="4"
          placeholder="e.g. 3.7"
          value={values.gpa}
          onChange={(e) => set("gpa", e.target.value)}
        />
      </div>
    </div>
  );
}

function StepScores({
  values,
  set,
}: {
  values: FormValues;
  set: (k: keyof FormValues, v: string) => void;
}) {
  const SCORE_FIELDS: { id: keyof FormValues; label: string; placeholder: string }[] = [
    { id: "ielts", label: "IELTS", placeholder: "0 – 9, e.g. 7.5" },
    { id: "toefl", label: "TOEFL iBT", placeholder: "0 – 120, e.g. 105" },
    { id: "gre", label: "GRE Total", placeholder: "260 – 340, e.g. 320" },
    { id: "sat", label: "SAT", placeholder: "400 – 1600, e.g. 1450" },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Enter only the tests you&apos;ve taken or plan to take. Leave others blank.
      </p>

      {SCORE_FIELDS.map(({ id, label, placeholder }) => (
        <div key={id} className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <Input
            id={id}
            type="number"
            placeholder={placeholder}
            value={values[id]}
            onChange={(e) => set(id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

