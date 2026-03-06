"use server";

import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "./authFetch";
import { UserProfile } from "@/types/auth.type";

export const getProfile = async () => {
	const response = await authFetch(`${BACKEND_URL}/auth/me`);
	const result = await response.json();
	return result;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
	const response = await authFetch(`${BACKEND_URL}/users/me/profile`);
	if (!response.ok) return null;
	const result = await response.json();
	return result.profile;
};

export const upsertUserProfile = async (
	_prev: unknown,
	formData: FormData,
) => {
	const body: Partial<UserProfile> = {
		targetCountry: (formData.get("targetCountry") as string) || undefined,
		level: (formData.get("level") as string) || undefined,
		budgetRange: (formData.get("budgetRange") as string) || undefined,
		intendedMajor: (formData.get("intendedMajor") as string) || undefined,
		gpa: formData.get("gpa") ? Number(formData.get("gpa")) : undefined,
		onboardingDone: true,
	};

	const rawTestScores = formData.get("testScores") as string;
	if (rawTestScores) {
		try {
			body.testScores = JSON.parse(rawTestScores);
		} catch {
			// ignore malformed JSON
		}
	}

	const response = await authFetch(`${BACKEND_URL}/users/me/profile`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		return { success: false, message: "Failed to save profile. Please try again." };
	}

	return { success: true, message: "Profile saved!" };
};

