import { z } from "zod";

export type FormState =
	| {
			error?: {
				name?: string[];
				email?: string[];
				password?: string[];
			};
			message?: string;
			code?: string;
	  }
	| undefined;

export const SignupFormSchema = z.object({
	name: z
		.string()
		.min(2, {
			message: "Name must be at least 2 characters long.",
		})
		.trim(),
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z
		.string()
		.min(8, { message: "Be at least 8 characters long" })
		.regex(/[a-zA-Z]/, {
			message: "Contain at least one letter.",
		})
		.regex(/[0-9]/, {
			message: "Contain at least one number.",
		})
		.regex(/[^a-zA-Z0-9]/, {
			message: "Contain at least one special character.",
		})
		.trim(),
});

// Full signup schema used by the multi-step form
export const SignupFullSchema = z.object({
	// Step 1: Account
	name: z.string().min(2, { message: "Name must be at least 2 characters." }).trim(),
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z
		.string()
		.min(8, { message: "Be at least 8 characters long" })
		.regex(/[a-zA-Z]/, { message: "Contain at least one letter." })
		.regex(/[0-9]/, { message: "Contain at least one number." })
		.regex(/[^a-zA-Z0-9]/, { message: "Contain at least one special character." })
		.trim(),
	// Step 2: Student profile
	currentStage: z.enum([
		"High School/A-Levels",
		"Undergraduate",
		"Graduate",
		"Working Professional",
		"Gap Year",
	], { error: "Please select your current stage." }),
	targetIntake: z.string().min(1, { message: "Please select your target intake." }),
	targetCountries: z.array(z.string()).min(1, { message: "Select at least one target country." }),
	intendedLevel: z.enum(["BSC", "MSC", "PHD"], { error: "Please select an intended degree level." }),
	intendedMajor: z.string().min(1, { message: "Please enter your intended major." }).trim(),
	gpa: z.number().min(0).max(100).optional(),
	gpaScale: z.string().optional(),
	// Step 3: Optional extras
	englishTestType: z.string().optional(),
	englishScore: z.number().optional(),
	budgetMax: z.number().optional(),
	budgetCurrency: z.string().optional(),
	workExpMonths: z.number().optional(),
});

export type SignupFullData = z.infer<typeof SignupFullSchema>;

export type SignupFullFormState =
	| {
			error?: Partial<Record<keyof SignupFullData | "general", string[]>>;
			message?: string;
	  }
	| undefined;

export const LoginFormSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
	password: z.string().min(1, {
		message: "Password field must not be empty.",
	}),
});

export const ForgotPasswordSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email." }).trim(),
});

export const ResetPasswordSchema = z
	.object({
		token: z.string().min(1, { message: "Reset token is missing." }),
		password: z
			.string()
			.min(8, { message: "Be at least 8 characters long" })
			.regex(/[a-zA-Z]/, {
				message: "Contain at least one letter.",
			})
			.regex(/[0-9]/, {
				message: "Contain at least one number.",
			})
			.regex(/[^a-zA-Z0-9]/, {
				message: "Contain at least one special character.",
			})
			.trim(),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match.",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormState =
	| {
			error?: {
				password?: string[];
				confirmPassword?: string[];
				token?: string[];
			};
			message?: string;
			success?: boolean;
	  }
	| undefined;

export type VerifyEmailFormState =
	| {
			message?: string;
			success?: boolean;
	  }
	| undefined;

export type GenericFormState =
	| {
			message?: string;
			success?: boolean;
	  }
	| undefined;

export type Session = {
	user: {
		id: string;
		name: string;
		email: string;
		avatarUrl?: string;
		emailVerified: boolean;
		isActive: boolean;
	};
	accessToken: string;
	refreshToken: string;
        rememberMe?: boolean;
        lastActiveAt?: number; // unix ms timestamp
};

export interface UserProfile {
        userId: string;
        // Legacy fields
        targetCountry?: string | null;
        level?: string | null;
        budgetRange?: string | null;
        intendedMajor?: string | null;
        gpa?: number | null;
        testScores?: Record<string, number> | null;
        onboardingDone: boolean;
        // Step 1: Student Stage
        currentStage?: string | null;
        targetIntake?: string | null;
        targetCountries?: string[] | null;
        intendedLevel?: string | null;
        // Step 2: Academic Profile
        currentInstitution?: string | null;
        majorOrTrack?: string | null;
        gpaScale?: string | null;
        graduationYear?: number | null;
        backlogs?: number | null;
        workExperienceMonths?: number | null;
        // Step 3: Tests & Language
        englishTestType?: string | null;
        englishScore?: number | null;
        gre?: number | null;
        gmat?: number | null;
        // Step 4: Budget & Preferences
        budgetCurrency?: string | null;
        budgetMax?: number | null;
        fundingNeed?: boolean | null;
        preferredCities?: string[] | null;
        priorities?: string[] | null;
        createdAt?: string;
        updatedAt?: string;
}

export interface MatchRun {
        id: string;
        userId: string;
        status: "pending" | "running" | "done" | "error";
        progress: number;
        createdAt: string;
        updatedAt: string;
        error?: string | null;
        results?: MatchResultItem[];
}

export interface MatchRunStatus {
        id: string;
        status: "pending" | "running" | "done" | "error";
        progress: number;
        error?: string | null;
        updatedAt: string;
}

export interface MatchResultItem {
        id: string;
        runId: string;
        programId: string | null;
        score: number;
        reasons: string[]; // Array of reason strings
        rawData: Record<string, unknown> | null;
        createdAt: string;
}

export interface MatchLatestResponse {
        run: MatchRun | null;
}

export type MatchRunFormState =
        | { success?: boolean; message?: string; runId?: string }
        | undefined;

export interface ChatSource {
	type: "internal" | "web";
	title: string;
	id?: string;
	url?: string;
}

export interface ChatReply {
	answer: string;
	bullets: string[];
	nextSteps: string[];
	sources: ChatSource[];
	confidence: "high" | "medium" | "low";
}

export interface ChatApiResponse {
	reply: ChatReply;
}

export type OnboardingFormState =
	| {
			message?: string;
			success?: boolean;
			errors?: Partial<Record<keyof UserProfile, string[]>>;
	  }
	| undefined;

// ─── Module 1: University & Program Matching ────────────────────────────────

export interface Country {
	id: string;
	code: string;
	name: string;
}

export interface University {
	id: string;
	name: string;
	city?: string | null;
	website?: string | null;
	country: Country;
}

export interface ProgramRequirement {
	id: string;
	key: string;
	value: string;
}

export interface ProgramDeadline {
	id: string;
	term: string;
	deadline: string;
}

export interface Program {
	id: string;
	title: string;
	field: string;
	level: "BSC" | "MSC" | "PHD" | "MBA" | "DIPLOMA";
	durationMonths?: number | null;
	tuitionMinUSD?: number | null;
	tuitionMaxUSD?: number | null;
	description?: string | null;
	applicationUrl?: string | null;
	university: University;
	requirements?: ProgramRequirement[];
	deadlines?: ProgramDeadline[];
}

export interface ProgramListResult {
	items: Program[];
	page: number;
	limit: number;
	total: number;
}

export interface MatchResult {
	programId: string;
	score: number;
	reasons: string[];
	programSummary: {
		title: string;
		level: string;
		field: string;
		tuitionRange: string;
		universityName: string;
		country: string;
	};
}

export interface SavedProgramItem {
	id: string;
	programId: string;
	program: Program;
	createdAt: string;
}

export type MatchFormState =
	| {
			success?: boolean;
			message?: string;
			results?: MatchResult[];
	  }
	| undefined;
