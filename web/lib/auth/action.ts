"use server";

import { revalidatePath } from "next/cache";
import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "./authFetch";
import {
	UserProfile,
	Program,
	ProgramListResult,
	MatchFormState,
	SavedProgramItem,
} from "@/types/auth.type";

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

// ─── Module 1: Programs ──────────────────────────────────────────────────────

export const searchPrograms = async (
	params: Record<string, string> = {},
): Promise<ProgramListResult | null> => {
	const qs = new URLSearchParams(params).toString();
	const url = qs ? `${BACKEND_URL}/programs?${qs}` : `${BACKEND_URL}/programs`;
	const response = await authFetch(url);
	if (!response.ok) return null;
	return response.json();
};

export const getProgramById = async (id: string): Promise<Program | null> => {
	const response = await authFetch(`${BACKEND_URL}/programs/${encodeURIComponent(id)}`);
	if (!response.ok) return null;
	return response.json();
};

export const matchPrograms = async (
	_prev: MatchFormState,
	formData: FormData,
): Promise<MatchFormState> => {
	const body: Record<string, unknown> = {};
	const str = (k: string) => (formData.get(k) as string) || undefined;
	const num = (k: string) => {
		const v = formData.get(k);
		return v ? Number(v) : undefined;
	};
	body.targetCountry = str("targetCountry");
	body.level = str("level");
	body.intendedField = str("intendedField");
	body.gpa = num("gpa");
	body.ielts = num("ielts");
	body.toefl = num("toefl");
	body.gre = num("gre");
	body.budgetMaxUSD = num("budgetMaxUSD");

	const response = await authFetch(`${BACKEND_URL}/match/programs`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		return { success: false, message: "Matching failed. Please try again.", results: [] };
	}

	const data = await response.json();
	return { success: true, results: data.results ?? [] };
};

// ─── Module 1: Saved Programs ─────────────────────────────────────────────────

export const getSavedPrograms = async (): Promise<SavedProgramItem[]> => {
	const response = await authFetch(`${BACKEND_URL}/saved-programs`);
	if (!response.ok) return [];
	const data = await response.json();
	return data.savedPrograms ?? [];
};

export const saveProgram = async (programId: string): Promise<boolean> => {
	const response = await authFetch(`${BACKEND_URL}/saved-programs`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ programId }),
	});
	revalidatePath("/app/saved");
	return response.ok;
};

export const unsaveProgram = async (programId: string): Promise<boolean> => {
	const response = await authFetch(
		`${BACKEND_URL}/saved-programs/${encodeURIComponent(programId)}`,
		{ method: "DELETE" },
	);
	revalidatePath("/app/saved");
	return response.ok;
};

