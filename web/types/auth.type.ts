import { z } from "zod";

export type FormState =
	| {
			error?: {
				name?: string[];
				email?: string[];
				password?: string[];
			};
			message?: string;
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
