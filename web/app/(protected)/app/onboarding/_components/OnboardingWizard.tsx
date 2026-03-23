"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertUserProfile } from "@/lib/auth/action";
import { UserProfile } from "@/types/auth.type";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

type OnboardingWizardProps = {
	initialProfile: UserProfile | null;
};

const STEPS = [
	{ id: 1, title: "Student Stage", subtitle: "Tell us where you are" },
	{ id: 2, title: "Targets", subtitle: "Where do you want to go?" },
	{ id: 3, title: "Academic Background", subtitle: "Your education history" },
	{ id: 4, title: "Tests & Language", subtitle: "Standardized test scores" },
	{ id: 5, title: "Budget & Preferences", subtitle: "Financial and location preferences" },
];

const CURRENT_STAGES = [
	"High School/A-Levels",
	"Undergraduate",
	"Graduate",
	"Working Professional",
	"Gap Year",
];

const INTENDED_LEVELS = ["BSC", "MSC", "PHD"];

const COUNTRIES = [
	"United States",
	"United Kingdom",
	"Canada",
	"Australia",
	"Germany",
	"Netherlands",
	"Singapore",
	"Ireland",
	"France",
];

const ENGLISH_TESTS = ["IELTS", "TOEFL", "PTE", "Duolingo", "None"];

const PRIORITIES = [
	"Low tuition",
	"Ranking",
	"Scholarships",
	"Job outcome",
	"PR pathway",
];

export default function OnboardingWizard({ initialProfile }: OnboardingWizardProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [currentStep, setCurrentStep] = useState(1);
	const [error, setError] = useState<string | null>(null);
	const reduced = useReducedMotion();

	// Form state
	const [formData, setFormData] = useState({
		currentStage: initialProfile?.currentStage || "",
		targetIntake: initialProfile?.targetIntake || "",
		targetCountries: initialProfile?.targetCountries || [],
		intendedLevel: initialProfile?.intendedLevel || "",
		intendedMajor: initialProfile?.intendedMajor || "",
		currentInstitution: initialProfile?.currentInstitution || "",
		majorOrTrack: initialProfile?.majorOrTrack || "",
		gpa: initialProfile?.gpa?.toString() || "",
		gpaScale: initialProfile?.gpaScale || "4.0",
		graduationYear: initialProfile?.graduationYear?.toString() || "",
		backlogs: initialProfile?.backlogs?.toString() || "",
		workExperienceMonths: initialProfile?.workExperienceMonths?.toString() || "",
		englishTestType: initialProfile?.englishTestType || "",
		englishScore: initialProfile?.englishScore?.toString() || "",
		gre: initialProfile?.gre?.toString() || "",
		gmat: initialProfile?.gmat?.toString() || "",
		budgetCurrency: initialProfile?.budgetCurrency || "USD",
		budgetMax: initialProfile?.budgetMax?.toString() || "",
		fundingNeed: initialProfile?.fundingNeed !== null && initialProfile?.fundingNeed !== undefined ? initialProfile.fundingNeed.toString() : "",
		preferredCities: initialProfile?.preferredCities || [],
		priorities: initialProfile?.priorities || [],
	});

	const updateField = (field: string, value: unknown) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setError(null);
	};

	const toggleArrayItem = (field: "targetCountries" | "preferredCities" | "priorities", item: string) => {
		setFormData((prev) => {
			const array = prev[field] as string[];
			const exists = array.includes(item);
			return {
				...prev,
				[field]: exists ? array.filter((i) => i !== item) : [...array, item],
			};
		});
	};

	const validateStep = (step: number): boolean => {
		switch (step) {
			case 1:
				if (!formData.currentStage || !formData.targetIntake) {
					setError("Please fill in all required fields");
					return false;
				}
				return true;
			case 2:
				if (
					formData.targetCountries.length === 0 ||
					!formData.intendedLevel ||
					!formData.intendedMajor
				) {
					setError("Please fill in all required fields");
					return false;
				}
				return true;
			case 3:
			case 4:
			case 5:
				return true; // Optional fields
			default:
				return true;
		}
	};

	const handleNext = async () => {
		if (!validateStep(currentStep)) return;

		// Save current data per-step
		const fd = new FormData();
		Object.entries(formData).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				fd.append(key, JSON.stringify(value));
			} else if (value !== "" && value !== null && value !== undefined) {
				fd.append(key, value.toString());
			}
		});

		try {
			await upsertUserProfile(null, fd);
			if (currentStep < 5) {
				setCurrentStep(currentStep + 1);
			}
		} catch (err) {
			setError("Failed to save progress. Please try again.");
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			setError(null);
		}
	};

	const handleFinish = async () => {
		setError(null);
		const fd = new FormData();

		Object.entries(formData).forEach(([key, value]) => {
			if (Array.isArray(value)) {
				fd.append(key, JSON.stringify(value));
			} else if (value !== "" && value !== null && value !== undefined) {
				fd.append(key, value.toString());
			}
		});

		// Mark onboarding complete
		fd.append("onboardingDone", "true");

		startTransition(async () => {
			try {
				const result = await upsertUserProfile(null, fd);
				if (result.success) {
					router.push("/app");
				} else {
					setError(result.message || "Failed to complete onboarding");
				}
			} catch (err) {
				setError("An unexpected error occurred");
			}
		});
	};

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Progress Bar */}
			<div className="mb-10">
				<div className="mb-4 flex items-center justify-between">
					{STEPS.map((step, idx) => (
						<div key={step.id} className="flex flex-1 items-center">
							<div className="relative flex flex-col items-center">
								<motion.div
									className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors ${
										currentStep > step.id
											? "border-primary bg-primary text-primary-foreground"
											: currentStep === step.id
											? "border-primary bg-background text-primary"
											: "border-muted-foreground/30 bg-background text-muted-foreground"
									}`}
									initial={false}
									animate={
										currentStep > step.id
											? { scale: [1, 1.1, 1] }
											: {}
									}
									transition={{ duration: 0.3 }}
								>
									{currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
								</motion.div>
								<div className="mt-2 hidden text-center sm:block">
									<div className="text-xs font-medium">{step.title}</div>
								</div>
							</div>
							{idx < STEPS.length - 1 && (
								<div className="relative mx-2 h-[2px] flex-1 bg-muted">
									<motion.div
										className="absolute inset-y-0 left-0 bg-primary"
										initial={{ width: "0%" }}
										animate={{
											width: currentStep > step.id ? "100%" : "0%",
										}}
										transition={{ duration: 0.4 }}
									/>
								</div>
							)}
						</div>
					))}
				</div>
			</div>

			{/* Step Content */}
			<AnimatePresence mode="wait">
				<motion.div
					key={currentStep}
					initial={reduced ? undefined : { opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={reduced ? undefined : { opacity: 0, x: -20 }}
					transition={{ duration: reduced ? 0 : 0.3 }}
					className="rounded-lg border bg-card p-6 shadow-sm sm:p-8"
				>
					<div className="mb-6">
						<h2 className="text-2xl font-bold">{STEPS[currentStep - 1].title}</h2>
						<p className="text-sm text-muted-foreground">
							{STEPS[currentStep - 1].subtitle}
						</p>
					</div>

					{/* Step 1: Student Stage */}
					{currentStep === 1 && (
						<div className="space-y-6">
							<div>
								<Label htmlFor="currentStage" className="mb-2">
									Current Stage <span className="text-destructive">*</span>
								</Label>
								<select
									id="currentStage"
									value={formData.currentStage}
									onChange={(e) => updateField("currentStage", e.target.value)}
									className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								>
									<option value="">Select your current stage</option>
									{CURRENT_STAGES.map((stage) => (
										<option key={stage} value={stage}>
											{stage}
										</option>
									))}
								</select>
								<p className="mt-1 text-xs text-muted-foreground">
									Your current academic or professional status
								</p>
							</div>

							<div>
								<Label htmlFor="targetIntake" className="mb-2">
									Target Intake <span className="text-destructive">*</span>
								</Label>
								<Input
									id="targetIntake"
									type="text"
									placeholder="e.g., Fall 2026, Spring 2027"
									value={formData.targetIntake}
									onChange={(e) => updateField("targetIntake", e.target.value)}
								/>
								<p className="mt-1 text-xs text-muted-foreground">
									When do you plan to start your studies?
								</p>
							</div>
						</div>
					)}

					{/* Step 2: Targets */}
					{currentStep === 2 && (
						<div className="space-y-6">
							<div>
								<Label className="mb-2">
									Target Countries <span className="text-destructive">*</span>
								</Label>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
									{COUNTRIES.map((country) => (
										<button
											key={country}
											type="button"
											onClick={() => toggleArrayItem("targetCountries", country)}
											className={`rounded-md border px-3 py-2 text-sm transition-colors ${
												formData.targetCountries.includes(country)
													? "border-primary bg-primary/10 text-primary"
													: "border-input bg-background hover:bg-accent"
											}`}
										>
											{country}
										</button>
									))}
								</div>
								<p className="mt-2 text-xs text-muted-foreground">
									Select one or more countries
								</p>
							</div>

							<div>
								<Label htmlFor="intendedLevel" className="mb-2">
									Intended Degree Level <span className="text-destructive">*</span>
								</Label>
								<select
									id="intendedLevel"
									value={formData.intendedLevel}
									onChange={(e) => updateField("intendedLevel", e.target.value)}
									className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								>
									<option value="">Select degree level</option>
									{INTENDED_LEVELS.map((level) => (
										<option key={level} value={level}>
											{level}
										</option>
									))}
								</select>
							</div>

							<div>
								<Label htmlFor="intendedMajor" className="mb-2">
									Intended Major <span className="text-destructive">*</span>
								</Label>
								<Input
									id="intendedMajor"
									type="text"
									placeholder="e.g., Computer Science, Business Analytics"
									value={formData.intendedMajor}
									onChange={(e) => updateField("intendedMajor", e.target.value)}
								/>
							</div>
						</div>
					)}

					{/* Step 3: Academic Background */}
					{currentStep === 3 && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="currentInstitution" className="mb-2">
										Current Institution
									</Label>
									<Input
										id="currentInstitution"
										type="text"
										placeholder="University name"
										value={formData.currentInstitution}
										onChange={(e) => updateField("currentInstitution", e.target.value)}
									/>
								</div>

								<div>
									<Label htmlFor="majorOrTrack" className="mb-2">
										Major / Track
									</Label>
									<Input
										id="majorOrTrack"
										type="text"
										placeholder="Your current major"
										value={formData.majorOrTrack}
										onChange={(e) => updateField("majorOrTrack", e.target.value)}
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div>
									<Label htmlFor="gpa" className="mb-2">
										GPA
									</Label>
									<Input
										id="gpa"
										type="number"
										step="0.01"
										placeholder="e.g., 3.5"
										value={formData.gpa}
										onChange={(e) => updateField("gpa", e.target.value)}
									/>
								</div>

								<div>
									<Label htmlFor="gpaScale" className="mb-2">
										GPA Scale
									</Label>
									<select
										id="gpaScale"
										value={formData.gpaScale}
										onChange={(e) => updateField("gpaScale", e.target.value)}
										className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										<option value="4.0">4.0</option>
										<option value="5.0">5.0</option>
										<option value="10.0">10.0</option>
										<option value="100">100</option>
									</select>
								</div>

								<div>
									<Label htmlFor="graduationYear" className="mb-2">
										Graduation Year
									</Label>
									<Input
										id="graduationYear"
										type="number"
										placeholder="e.g., 2025"
										value={formData.graduationYear}
										onChange={(e) => updateField("graduationYear", e.target.value)}
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="backlogs" className="mb-2">
										Backlogs
									</Label>
									<Input
										id="backlogs"
										type="number"
										placeholder="Number of backlogs"
										value={formData.backlogs}
										onChange={(e) => updateField("backlogs", e.target.value)}
									/>
									<p className="mt-1 text-xs text-muted-foreground">
										Failed/pending courses
									</p>
								</div>

								<div>
									<Label htmlFor="workExperienceMonths" className="mb-2">
										Work Experience (months)
									</Label>
									<Input
										id="workExperienceMonths"
										type="number"
										placeholder="e.g., 24"
										value={formData.workExperienceMonths}
										onChange={(e) => updateField("workExperienceMonths", e.target.value)}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Step 4: Tests & Language */}
					{currentStep === 4 && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="englishTestType" className="mb-2">
										English Test Type
									</Label>
									<select
										id="englishTestType"
										value={formData.englishTestType}
										onChange={(e) => updateField("englishTestType", e.target.value)}
										className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										<option value="">Select test</option>
										{ENGLISH_TESTS.map((test) => (
											<option key={test} value={test}>
												{test}
											</option>
										))}
									</select>
								</div>

								<div>
									<Label htmlFor="englishScore" className="mb-2">
										English Test Score
									</Label>
									<Input
										id="englishScore"
										type="number"
										step="0.5"
										placeholder="e.g., 7.5 for IELTS"
										value={formData.englishScore}
										onChange={(e) => updateField("englishScore", e.target.value)}
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="gre" className="mb-2">
										GRE Score
									</Label>
									<Input
										id="gre"
										type="number"
										placeholder="e.g., 320"
										value={formData.gre}
										onChange={(e) => updateField("gre", e.target.value)}
									/>
									<p className="mt-1 text-xs text-muted-foreground">
										Out of 340
									</p>
								</div>

								<div>
									<Label htmlFor="gmat" className="mb-2">
										GMAT Score
									</Label>
									<Input
										id="gmat"
										type="number"
										placeholder="e.g., 700"
										value={formData.gmat}
										onChange={(e) => updateField("gmat", e.target.value)}
									/>
									<p className="mt-1 text-xs text-muted-foreground">
										Out of 800
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Step 5: Budget & Preferences */}
					{currentStep === 5 && (
						<div className="space-y-6">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<Label htmlFor="budgetCurrency" className="mb-2">
										Budget Currency
									</Label>
									<select
										id="budgetCurrency"
										value={formData.budgetCurrency}
										onChange={(e) => updateField("budgetCurrency", e.target.value)}
										className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										<option value="USD">USD</option>
										<option value="EUR">EUR</option>
										<option value="GBP">GBP</option>
										<option value="CAD">CAD</option>
										<option value="AUD">AUD</option>
										<option value="INR">INR</option>
									</select>
								</div>

								<div>
									<Label htmlFor="budgetMax" className="mb-2">
										Maximum Budget
									</Label>
									<Input
										id="budgetMax"
										type="number"
										placeholder="e.g., 50000"
										value={formData.budgetMax}
										onChange={(e) => updateField("budgetMax", e.target.value)}
									/>
									<p className="mt-1 text-xs text-muted-foreground">
										Total budget per year
									</p>
								</div>
							</div>

							<div>
								<Label className="mb-2">Need Funding / Scholarships?</Label>
								<div className="flex gap-4">
									<button
										type="button"
										onClick={() => updateField("fundingNeed", "true")}
										className={`flex-1 rounded-md border px-4 py-2 text-sm transition-colors ${
											formData.fundingNeed === "true"
												? "border-primary bg-primary/10 text-primary"
												: "border-input bg-background hover:bg-accent"
										}`}
									>
										Yes
									</button>
									<button
										type="button"
										onClick={() => updateField("fundingNeed", "false")}
										className={`flex-1 rounded-md border px-4 py-2 text-sm transition-colors ${
											formData.fundingNeed === "false"
												? "border-primary bg-primary/10 text-primary"
												: "border-input bg-background hover:bg-accent"
										}`}
									>
										No
									</button>
								</div>
							</div>

							<div>
								<Label className="mb-2">Preferred Cities (Optional)</Label>
								<Input
									type="text"
									placeholder="e.g., New York, London, Toronto"
									value={formData.preferredCities.join(", ")}
									onChange={(e) => {
										const cities = e.target.value
											.split(",")
											.map((c) => c.trim())
											.filter(Boolean);
										updateField("preferredCities", cities);
									}}
								/>
								<p className="mt-1 text-xs text-muted-foreground">
									Separate multiple cities with commas
								</p>
							</div>

							<div>
								<Label className="mb-2">Priorities (Optional)</Label>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
									{PRIORITIES.map((priority) => (
										<button
											key={priority}
											type="button"
											onClick={() => toggleArrayItem("priorities", priority)}
											className={`rounded-md border px-3 py-2 text-sm transition-colors ${
												formData.priorities.includes(priority)
													? "border-primary bg-primary/10 text-primary"
													: "border-input bg-background hover:bg-accent"
											}`}
										>
											{priority}
										</button>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
							{error}
						</div>
					)}

					{/* Navigation Buttons */}
					<div className="mt-8 flex items-center justify-between">
						<Button
							type="button"
							variant="outline"
							onClick={handleBack}
							disabled={currentStep === 1 || isPending}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>

						{currentStep < 5 ? (
							<Button type="button" onClick={handleNext} disabled={isPending}>
								Next
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						) : (
							<Button
								type="button"
								onClick={handleFinish}
								disabled={isPending}
								className="bg-primary px-6"
							>
								{isPending ? "Saving..." : "Complete Setup"}
								<Check className="ml-2 h-4 w-4" />
							</Button>
						)}
					</div>
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
