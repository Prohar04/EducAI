"use client";

import { useState, useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SubmitButton from "@/components/ui/submitButton";
import { signUpFull } from "@/lib/auth/auth";
import Link from "next/link";
import { AlertCircle, ChevronRight, ChevronLeft, Check } from "lucide-react";
import type { SignupFullFormState } from "@/types/auth.type";

const STAGES = [
  "High School/A-Levels",
  "Undergraduate",
  "Graduate",
  "Working Professional",
  "Gap Year",
] as const;

const INTAKES = [
  "Fall 2025", "Spring 2026", "Fall 2026",
  "Spring 2027", "Fall 2027", "Spring 2028",
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "FR", name: "France" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "SE", name: "Sweden" },
];

const LEVELS = [
  { value: "BSC", label: "Bachelor's" },
  { value: "MSC", label: "Master's" },
  { value: "PHD", label: "PhD" },
];

const GPA_SCALES = ["4.0", "10", "5", "%"];
const ENGLISH_TESTS = ["IELTS", "TOEFL", "Duolingo", "None"];
const STEPS = ["Account", "Profile", "Preferences"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors
              ${i < current ? "bg-primary text-primary-foreground" : i === current ? "border-2 border-primary text-primary" : "border-2 border-border text-muted-foreground"}`}
          >
            {i < current ? <Check className="size-3.5" /> : i + 1}
          </div>
          <span className={`hidden text-xs sm:block ${i === current ? "font-medium" : "text-muted-foreground"}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-6 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="text-xs text-destructive mt-1">{errors[0]}</p>;
}

export default function SignUpForm() {
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState<SignupFullFormState, FormData>(signUpFull, undefined);

  // Step 0 local state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 1 local state
  const [currentStage, setCurrentStage] = useState("");
  const [targetIntake, setTargetIntake] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [intendedLevel, setIntendedLevel] = useState("");
  const [intendedMajor, setIntendedMajor] = useState("");
  const [gpa, setGpa] = useState("");
  const [gpaScale, setGpaScale] = useState("");

  const err = state?.error ?? {};

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const canProceedStep0 = name.trim().length >= 2 && email.includes("@") && password.length >= 8;
  const canProceedStep1 = currentStage && targetIntake && selectedCountries.length > 0 && intendedLevel && intendedMajor.trim().length > 0;

  return (
    <div>
      <StepIndicator current={step} />

      {state?.message && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
          <AlertCircle className="size-4 shrink-0" />
          {state.message}
        </div>
      )}

      {/* ─── STEP 0: Account ─── */}
      {step === 0 && (
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="s0-name">Full Name</Label>
            <Input
              id="s0-name"
              placeholder="Jane Doe"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError errors={err.name} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="s0-email">Email</Label>
            <Input
              id="s0-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FieldError errors={err.email} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="s0-password">Password</Label>
            <Input
              id="s0-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Min 8 chars, one letter, number, and special character.</p>
            <FieldError errors={err.password} />
          </div>
          <Button onClick={() => setStep(1)} disabled={!canProceedStep0} className="w-full">
            Continue <ChevronRight className="size-4 ml-1" />
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/80">Sign In</Link>
          </p>
        </div>
      )}

      {/* ─── STEP 1: Student Profile ─── */}
      {step === 1 && (
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="s1-stage">Current Stage</Label>
              <select
                id="s1-stage"
                value={currentStage}
                onChange={(e) => setCurrentStage(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <FieldError errors={err.currentStage} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s1-intake">Target Intake</Label>
              <select
                id="s1-intake"
                value={targetIntake}
                onChange={(e) => setTargetIntake(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {INTAKES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <FieldError errors={err.targetIntake} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Target Countries <span className="text-muted-foreground text-xs">(select all that apply)</span></Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {COUNTRIES.map((c) => (
                <label
                  key={c.code}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors
                    ${selectedCountries.includes(c.code) ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedCountries.includes(c.code)}
                    onChange={() => toggleCountry(c.code)}
                  />
                  {selectedCountries.includes(c.code) && <Check className="size-3 shrink-0" />}
                  {c.name}
                </label>
              ))}
            </div>
            {!selectedCountries.length && <FieldError errors={err.targetCountries} />}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="s1-level">Intended Degree</Label>
              <select
                id="s1-level"
                value={intendedLevel}
                onChange={(e) => setIntendedLevel(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select…</option>
                {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <FieldError errors={err.intendedLevel} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s1-major">Intended Major / Field</Label>
              <Input
                id="s1-major"
                placeholder="Computer Science…"
                value={intendedMajor}
                onChange={(e) => setIntendedMajor(e.target.value)}
              />
              <FieldError errors={err.intendedMajor} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="s1-gpa">GPA <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                id="s1-gpa"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 3.7"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s1-gpaScale">GPA Scale</Label>
              <select
                id="s1-gpaScale"
                value={gpaScale}
                onChange={(e) => setGpaScale(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Scale…</option>
                {GPA_SCALES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
              <ChevronLeft className="size-4 mr-1" /> Back
            </Button>
            <Button type="button" onClick={() => setStep(2)} disabled={!canProceedStep1} className="flex-1">
              Continue <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Preferences + Submit ─── */}
      {step === 2 && (
        <form
          action={(fd) => {
            fd.set("name", name);
            fd.set("email", email);
            fd.set("password", password);
            fd.set("currentStage", currentStage);
            fd.set("targetIntake", targetIntake);
            fd.set("targetCountries", JSON.stringify(selectedCountries));
            fd.set("intendedLevel", intendedLevel);
            fd.set("intendedMajor", intendedMajor);
            if (gpa) fd.set("gpa", gpa);
            if (gpaScale) fd.set("gpaScale", gpaScale);
            action(fd);
          }}
          className="grid gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="englishTestType">English Test</Label>
              <select
                id="englishTestType"
                name="englishTestType"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {ENGLISH_TESTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="englishScore">Score <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="englishScore" name="englishScore" type="number" min="0" step="0.5" placeholder="e.g. 7.5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="budgetMax">Max Annual Budget <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="budgetMax" name="budgetMax" type="number" min="0" step="1000" placeholder="e.g. 30000" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="budgetCurrency">Currency</Label>
              <select id="budgetCurrency" name="budgetCurrency" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="workExpMonths">Work Experience <span className="text-muted-foreground text-xs">(months, optional)</span></Label>
            <Input id="workExpMonths" name="workExpMonths" type="number" min="0" placeholder="e.g. 24" />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ChevronLeft className="size-4 mr-1" /> Back
            </Button>
            <SubmitButton disabled={pending} className="flex-1">
              Create Account
            </SubmitButton>
          </div>
        </form>
      )}
    </div>
  );
}

