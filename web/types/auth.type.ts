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
};

export type UserProfile = {
	userId: string;
	targetCountry?: string | null;
	level?: string | null;
	budgetRange?: string | null;
	intendedMajor?: string | null;
	gpa?: number | null;
	testScores?: Record<string, number> | null;
	onboardingDone: boolean;
};

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
