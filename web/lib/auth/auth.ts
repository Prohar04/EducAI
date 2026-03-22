"use server";

import { redirect } from "next/navigation";
import {
	FormState,
	LoginFormSchema,
	SignupFormSchema,
	SignupFullSchema,
	SignupFullFormState,
	ForgotPasswordSchema,
	ResetPasswordSchema,
	ResetPasswordFormState,
	VerifyEmailFormState,
	GenericFormState,
} from "@/types/auth.type";
import { createSession, updateTokens } from "./session";
import { BACKEND_URL } from "@/constants/constants";

// ── SIGN UP (legacy simple form) ───────────────────────────────────

export async function signUp(
	state: FormState,
	formData: FormData,
): Promise<FormState> {
	const validationFields = SignupFormSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!validationFields.success) {
		return {
			error: validationFields.error.flatten().fieldErrors,
		};
	}

	try {
		const response = await fetch(`${BACKEND_URL}/auth/signup`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validationFields.data),
		});

		if (response.ok || response.status === 201) {
			// Redirect to a "check your email" page
			redirect("/auth/verify-email?pending=true");
		}

		if (response.status === 409) {
			return { message: "Email already in use." };
		}

		return {
			message: "Something went wrong. Please try again later.",
		};
	} catch (err) {
		// redirect() throws a special error — rethrow it
		throw err;
	}
}

// ── SIGN UP FULL (multi-step: account + profile in one) ────────────

export async function signUpFull(
	state: SignupFullFormState,
	formData: FormData,
): Promise<SignupFullFormState> {
	const raw = {
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		currentStage: formData.get("currentStage"),
		targetIntake: formData.get("targetIntake"),
		targetCountries: (() => {
			try { return JSON.parse(formData.get("targetCountries") as string); } catch { return []; }
		})(),
		intendedLevel: formData.get("intendedLevel"),
		intendedMajor: formData.get("intendedMajor"),
		gpa: formData.get("gpa") ? Number(formData.get("gpa")) : undefined,
		gpaScale: formData.get("gpaScale") || undefined,
		englishTestType: formData.get("englishTestType") || undefined,
		englishScore: formData.get("englishScore") ? Number(formData.get("englishScore")) : undefined,
		budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : undefined,
		budgetCurrency: formData.get("budgetCurrency") || undefined,
		workExpMonths: formData.get("workExpMonths") ? Number(formData.get("workExpMonths")) : undefined,
	};

	const validation = SignupFullSchema.safeParse(raw);
	if (!validation.success) {
		return { error: validation.error.flatten().fieldErrors as NonNullable<SignupFullFormState>["error"] };
	}

	try {
		const response = await fetch(`${BACKEND_URL}/auth/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: validation.data.name,
				email: validation.data.email,
				password: validation.data.password,
				profile: {
					currentStage: validation.data.currentStage,
					targetIntake: validation.data.targetIntake,
					targetCountries: validation.data.targetCountries,
					intendedLevel: validation.data.intendedLevel,
					intendedMajor: validation.data.intendedMajor,
					gpa: validation.data.gpa,
					gpaScale: validation.data.gpaScale,
					englishTestType: validation.data.englishTestType,
					englishScore: validation.data.englishScore,
					budgetMax: validation.data.budgetMax,
					budgetCurrency: validation.data.budgetCurrency ?? "USD",
					workExperienceMonths: validation.data.workExpMonths,
				},
			}),
		});

		if (response.ok || response.status === 201) {
			redirect("/auth/verify-email?pending=true");
		}

		if (response.status === 409) {
			return { message: "Email already in use." };
		}

		const data = await response.json().catch(() => null);
		return { message: data?.message ?? "Something went wrong. Please try again later." };
	} catch (err) {
		throw err;
	}
}

// ── SIGN IN (with rememberMe) ──────────────────────────────────────

export async function signIn(
	state: FormState,
	formData: FormData,
): Promise<FormState> {
	const validatedFields = LoginFormSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!validatedFields.success) {
		return {
			error: validatedFields.error.flatten().fieldErrors,
		};
	}

	const rememberMe = formData.get("rememberMe") === "on";

	try {
		const response = await fetch(`${BACKEND_URL}/auth/signin`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...validatedFields.data,
				rememberMe,
			}),
		});

		if (response.ok) {
			const result = await response.json();

			await createSession({
				user: {
					id: result.user.id,
					name: result.user.name,
					email: result.user.email,
					avatarUrl: result.user.avatar || undefined,
					isActive: result.user.isActive,
					emailVerified: result.user.emailVerified,
				},
				accessToken: result.accessToken,
				refreshToken: result.refreshToken,
				rememberMe,
			});
			redirect("/app");
		}

		const data = await response.json().catch(() => null);

		if (data?.code === "EMAIL_NOT_VERIFIED") {
			return {
				message: "Please verify your email before signing in.",
				code: "EMAIL_NOT_VERIFIED",
			};
		}

		if (data?.code === "ACCOUNT_LOCKED") {
			const mins = Math.ceil((data.retryAfterSeconds || 600) / 60);
			return {
				message: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.`,
				code: "ACCOUNT_LOCKED",
			};
		}

		return {
			message: data?.message || "Invalid credentials.",
		};
	} catch (err) {
		throw err;
	}
}

// ── VERIFY EMAIL ───────────────────────────────────────────────────

export async function verifyEmail(
	token: string,
): Promise<VerifyEmailFormState> {
	try {
		const response = await fetch(`${BACKEND_URL}/auth/verify-email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ token }),
		});

		if (response.ok) {
			return {
				success: true,
				message: "Email verified successfully! You can now sign in.",
			};
		}

		const data = await response.json().catch(() => null);
		return {
			message:
				data?.message ||
				"Verification link is invalid or expired.",
		};
	} catch {
		return {
			message: "Unable to reach the server. Please try again later.",
		};
	}
}

// ── RESEND VERIFICATION ────────────────────────────────────────────

export async function resendVerification(
	state: GenericFormState,
	formData: FormData,
): Promise<GenericFormState> {
	const email = formData.get("email") as string;

	if (!email) {
		return { message: "Email is required." };
	}

	try {
		const response = await fetch(
			`${BACKEND_URL}/auth/resend-verification`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			},
		);

		const data = await response.json().catch(() => null);
		return {
			success: true,
			message:
				data?.message ||
				"If an account exists, we sent a verification email.",
		};
	} catch {
		return {
			message: "Unable to reach the server. Please try again later.",
		};
	}
}

// ── REFRESH TOKEN ──────────────────────────────────────────────────

export const refreshToken = async (oldRefreshToken: string) => {
	try {
		const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: `refreshToken=${oldRefreshToken}`,
			},
		});

		if (!response.ok) {
			throw new Error("Failed to refresh token" + response.statusText);
		}

		const { accessToken, refreshToken } = await response.json();

		await updateTokens({ accessToken, refreshToken });

		return accessToken;
	} catch (err) {
		console.error("Refresh Token failed:", err);
		return null;
	}
};

// ── REQUEST PASSWORD RESET ─────────────────────────────────────────

export async function requestPasswordReset(
	state: FormState,
	formData: FormData,
): Promise<FormState> {
	const validatedFields = ForgotPasswordSchema.safeParse({
		email: formData.get("email"),
	});

	if (!validatedFields.success) {
		return {
			error: validatedFields.error.flatten().fieldErrors,
		};
	}

	try {
		const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(validatedFields.data),
		});

		if (response.ok || response.status === 404) {
			return {
				message:
					"If an account exists for this email, we sent a password reset link.",
			};
		}

		return {
			message: "Something went wrong. Please try again later.",
		};
	} catch {
		return {
			message: "Unable to reach the server. Please try again later.",
		};
	}
}

// ── RESET PASSWORD ─────────────────────────────────────────────────

export async function resetPassword(
	state: ResetPasswordFormState,
	formData: FormData,
): Promise<ResetPasswordFormState> {
	const validatedFields = ResetPasswordSchema.safeParse({
		token: formData.get("token"),
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!validatedFields.success) {
		return {
			error: validatedFields.error.flatten().fieldErrors,
		};
	}

	try {
		const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token: validatedFields.data.token,
				password: validatedFields.data.password,
			}),
		});

		if (response.ok) {
			return {
				success: true,
				message:
					"Password updated successfully. Redirecting to sign in...",
			};
		}

		const data = await response.json().catch(() => null);
		return {
			message:
				data?.message ||
				"Failed to reset password. The link may have expired.",
		};
	} catch {
		return {
			message: "Unable to reach the server. Please try again later.",
		};
	}
}
