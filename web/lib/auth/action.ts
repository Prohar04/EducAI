"use server";

import { revalidatePath } from "next/cache";
import { BACKEND_URL } from "@/constants/constants";
import { authFetch } from "./authFetch";
import {
	UserProfile,
	Program,
	ProgramListResult,
	SavedProgramItem,
	MatchLatestResponse,
	MatchRunFormState,
} from "@/types/auth.type";

const HTTP_STATUS_TEXT: Record<number, string> = {
	400: "Bad request",
	401: "Unauthorised — please sign in again",
	403: "Forbidden",
	404: "Endpoint not found",
	429: "Too many requests — please wait a moment",
	500: "Server error",
	502: "Server unavailable",
	503: "Service unavailable",
};

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
		// Legacy
		targetCountry: (formData.get("targetCountry") as string) || undefined,
		level: (formData.get("level") as string) || undefined,
		budgetRange: (formData.get("budgetRange") as string) || undefined,
		intendedMajor: (formData.get("intendedMajor") as string) || undefined,
		gpa: formData.get("gpa") ? Number(formData.get("gpa")) : undefined,
		onboardingDone: formData.get("onboardingDone") === "true" ? true : undefined,
		// Step 1
		currentStage: (formData.get("currentStage") as string) || undefined,
		targetIntake: (formData.get("targetIntake") as string) || undefined,
		intendedLevel: (formData.get("intendedLevel") as string) || undefined,
		// Step 2
		currentInstitution: (formData.get("currentInstitution") as string) || undefined,
		majorOrTrack: (formData.get("majorOrTrack") as string) || undefined,
		gpaScale: (formData.get("gpaScale") as string) || undefined,
		graduationYear: formData.get("graduationYear") ? Number(formData.get("graduationYear")) : undefined,
		backlogs: formData.get("backlogs") ? Number(formData.get("backlogs")) : undefined,
		workExperienceMonths: formData.get("workExperienceMonths") ? Number(formData.get("workExperienceMonths")) : undefined,
		// Step 3
		englishTestType: (formData.get("englishTestType") as string) || undefined,
		englishScore: formData.get("englishScore") ? Number(formData.get("englishScore")) : undefined,
		gre: formData.get("gre") ? Number(formData.get("gre")) : undefined,
		gmat: formData.get("gmat") ? Number(formData.get("gmat")) : undefined,
		// Step 4
		budgetCurrency: (formData.get("budgetCurrency") as string) || undefined,
		budgetMax: formData.get("budgetMax") ? Number(formData.get("budgetMax")) : undefined,
		fundingNeed: formData.get("fundingNeed") !== null ? formData.get("fundingNeed") === "true" : undefined,
	};

	// JSON array fields
	const targetCountriesRaw = formData.get("targetCountries") as string;
	if (targetCountriesRaw) {
		try { body.targetCountries = JSON.parse(targetCountriesRaw); } catch { /* ignore */ }
	}
	const preferredCitiesRaw = formData.get("preferredCities") as string;
	if (preferredCitiesRaw) {
		try { body.preferredCities = JSON.parse(preferredCitiesRaw); } catch { /* ignore */ }
	}
	const prioritiesRaw = formData.get("priorities") as string;
	if (prioritiesRaw) {
		try { body.priorities = JSON.parse(prioritiesRaw); } catch { /* ignore */ }
	}
	const rawTestScores = formData.get("testScores") as string;
	if (rawTestScores) {
		try { body.testScores = JSON.parse(rawTestScores); } catch { /* ignore */ }
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

// matchPrograms removed — use triggerMatchRun() + getMatchLatest() for the
// background AI scrape-and-rank flow (POST /match/run → GET /match/latest).

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

// ─── Match Run ────────────────────────────────────────────────────────────────

export const triggerMatchRun = async (): Promise<MatchRunFormState> => {
	const response = await authFetch(`${BACKEND_URL}/match/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		const errData = await response.json().catch(() => null);
		const statusText = HTTP_STATUS_TEXT[response.status] ?? "Unexpected error";
		const msg =
			errData?.message ??
			`Match failed (${response.status}). ${statusText}.`;
		return { success: false, message: msg };
	}

	const data = await response.json();
	return { success: true, runId: data.runId };
};

export const getMatchLatest = async (): Promise<MatchLatestResponse | null> => {
	const response = await authFetch(`${BACKEND_URL}/match/latest`);
	if (!response.ok) return null;
	return response.json();
};

export const getMatchRunStatus = async (
	runId: string,
): Promise<import("@/types/auth.type").MatchRunStatus | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/match/run/${encodeURIComponent(runId)}/status`,
	);
	if (!response.ok) return null;
	return response.json();
};

export const updateUserProfile = async (
	profileData: Partial<import("@/types/auth.type").UserProfile>,
): Promise<{ success: boolean; message: string }> => {
	const response = await authFetch(`${BACKEND_URL}/users/me/profile`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(profileData),
	});

	if (!response.ok) {
		return { success: false, message: "Failed to update profile." };
	}

	// Trigger a new match run after profile update
	await authFetch(`${BACKEND_URL}/match/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({}),
	}).catch(() => null); // Don't fail if match trigger fails

	revalidatePath("/app/dashboard");
	revalidatePath("/app/match");
	return { success: true, message: "Profile updated. Refreshing matches…" };
};

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const getTimelineInputs = async (countryCode?: string) => {
	const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : "";
	const response = await authFetch(`${BACKEND_URL}/timeline/inputs${qs}`);
	if (!response.ok) return null;
	return response.json();
};

export const generateTimeline = async (
	countryCode: string,
	intake?: string,
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
	const response = await authFetch(`${BACKEND_URL}/timeline/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ countryCode, intake }),
	});
	if (!response.ok) {
		const err = await response.json().catch(() => null);
		return { success: false, message: err?.message ?? "Failed to generate timeline" };
	}
	const data = await response.json();
	revalidatePath("/app/timeline");
	return { success: true, data };
};

export const getLatestTimeline = async (countryCode?: string) => {
	const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : "";
	const response = await authFetch(`${BACKEND_URL}/timeline/latest${qs}`);
	if (!response.ok) return null;
	return response.json();
};

// ─── Strategy ─────────────────────────────────────────────────────────────────

export const generateStrategy = async (
	countryCode: string,
	intake?: string,
	focusProgramIds?: string[],
): Promise<{ success: boolean; data?: unknown; message?: string }> => {
	const response = await authFetch(`${BACKEND_URL}/strategy/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ countryCode, intake, focusProgramIds }),
	});
	if (!response.ok) {
		const err = await response.json().catch(() => null);
		return { success: false, message: err?.message ?? "Failed to generate strategy" };
	}
	const data = await response.json();
	revalidatePath("/app/strategy");
	return { success: true, data };
};

export const getLatestStrategy = async (countryCode?: string) => {
	const qs = countryCode ? `?countryCode=${encodeURIComponent(countryCode)}` : "";
	const response = await authFetch(`${BACKEND_URL}/strategy/latest${qs}`);
	if (!response.ok) return null;
	return response.json();
};

