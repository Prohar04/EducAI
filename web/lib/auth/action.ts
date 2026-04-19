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
	ScholarshipListResult,
	ScholarshipItem,
	EligibilityResult,
	ProbabilityResult,
	UpcomingDeadlineItem,
	EligibleScholarshipItem,
	AlertNotification,
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
		const errData = await response.json().catch(() => null);
		const msg = errData?.message ?? `Server error (${response.status}). Please try again.`;
		return { success: false, message: msg };
	}

	revalidatePath("/app");
	revalidatePath("/app/profile");
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

// ─── Module 2: Scholarships ──────────────────────────────────────────────────

export const searchScholarships = async (
	params: Record<string, string> = {},
): Promise<ScholarshipListResult | null> => {
	const qs = new URLSearchParams(params).toString();
	const url = qs
		? `${BACKEND_URL}/scholarships?${qs}`
		: `${BACKEND_URL}/scholarships`;
	const response = await authFetch(url);
	if (!response.ok) return null;
	return response.json();
};

export const getScholarshipById = async (id: string): Promise<ScholarshipItem | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/${encodeURIComponent(id)}`,
	);
	if (!response.ok) return null;
	return response.json();
};

export const getEligibleScholarships = async (): Promise<EligibleScholarshipItem[]> => {
	const response = await authFetch(`${BACKEND_URL}/scholarships/eligible`);
	if (!response.ok) return [];
	const data = await response.json();
	return data.items ?? [];
};

export const getUpcomingScholarshipDeadlines = async (
	daysAhead = 90,
): Promise<UpcomingDeadlineItem[]> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/deadlines?daysAhead=${daysAhead}`,
	);
	if (!response.ok) return [];
	const data = await response.json();
	return data.deadlines ?? [];
};

export const checkScholarshipEligibility = async (
	scholarshipId: string,
): Promise<EligibilityResult | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/${encodeURIComponent(scholarshipId)}/eligibility`,
		{ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
	);
	if (!response.ok) return null;
	return response.json();
};

export const getScholarshipProbability = async (
	scholarshipId: string,
): Promise<ProbabilityResult | null> => {
	const response = await authFetch(
		`${BACKEND_URL}/scholarships/${encodeURIComponent(scholarshipId)}/probability`,
		{ method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
	);
	if (!response.ok) return null;
	return response.json();
};

// ── Deadline Alerts ─────────────────────────────────────────────────────────

export const getAlertNotifications = async (): Promise<AlertNotification[]> => {
	const response = await authFetch(`${BACKEND_URL}/deadline-alerts/recent`);
	if (!response.ok) return [];
	const data = await response.json();
	return data.alerts ?? [];
};

export const getAlertCount = async (): Promise<number> => {
	const response = await authFetch(`${BACKEND_URL}/deadline-alerts/count`);
	if (!response.ok) return 0;
	const data = await response.json();
	return data.count ?? 0;
};

// ── Intelligent Search ────────────────────────────────────────────────────────

export interface IntelligentSearchResult {
	title: string;
	url: string;
	snippet: string;
}

export interface IntelligentSearchResponse {
	cacheHit: boolean;
	query: string;
	rewrites: string[];
	results: IntelligentSearchResult[];
	cachedAt: string | null;
	expiresAt: string | null;
}

export const intelligentSearchAction = async (
	query: string,
): Promise<IntelligentSearchResponse | null> => {
	if (!query.trim()) return null;
	const response = await authFetch(`${BACKEND_URL}/search/intelligent`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query }),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: SOP Builder ─────────────────────────────────────────────────────

export type SopTone = "formal" | "research" | "personal";
export type SopType = "general" | "scholarship" | "research";

export interface SopGenerateRequest {
	tone: SopTone;
	sopType: SopType;
	targetProgram?: string;
	targetUniversity?: string;
	targetCountry?: string;
	targetIntake?: string;
	highlights?: string;
}

export interface SopResult {
	sop: string;
	wordCount: number;
	tone: SopTone;
	sopType: SopType;
}

export const generateSopAction = async (req: SopGenerateRequest): Promise<SopResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/sop/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: CV Builder ──────────────────────────────────────────────────────

export type CvStyle = "academic" | "research" | "industry";

export interface CvGenerateRequest {
	cvStyle: CvStyle;
	highlights?: string;
}

export interface CvResult {
	cv: string;
	style: string;
	sections: string[];
}

export const generateCvAction = async (req: CvGenerateRequest): Promise<CvResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/cv/generate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(req),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: Professor Finder ────────────────────────────────────────────────

export interface ProfessorResult {
	name: string;
	title: string;
	university: string;
	department: string;
	researchAreas: string[];
	email: string | null;
	profileUrl: string | null;
	snippet: string;
	emailTemplate: string;
}

export interface ProfessorSearchResponse {
	query: string;
	results: ProfessorResult[];
	searchedAt: string;
}

export const searchProfessorsAction = async (
	researchInterest: string,
	university?: string,
	country?: string,
	level?: "phd" | "masters",
): Promise<ProfessorSearchResponse | null> => {
	if (!researchInterest.trim()) return null;
	const response = await authFetch(`${BACKEND_URL}/professors/search`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ researchInterest, university, country, level }),
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 3: Gap Fix Recommender ────────────────────────────────────────────

export interface GapFixRecommendation {
	category: string;
	priority: "high" | "medium" | "low";
	title: string;
	description: string;
	actions: string[];
	resources: string[];
	timelineWeeks: number;
}

export interface GapFixResult {
	profileScore: number;
	strengths: string[];
	weaknesses: string[];
	recommendations: GapFixRecommendation[];
	prioritySummary: string;
	generatedAt: string;
}

export const generateGapFixAction = async (): Promise<GapFixResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/gap-fix/analyze`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 4: Career Outcome Predictor ──────────────────────────────────────

export interface CareerOutlookFactor {
	factor: string;
	rating: "Strong" | "Good" | "Moderate" | "Weak";
	explanation: string;
}

export interface CareerPathway {
	role: string;
	sector: string;
	salaryRangeUsd: string;
	demandLevel: "High" | "Medium" | "Low";
	timeToEntry: string;
}

export interface CareerResult {
	overallOutlook: "Excellent" | "Good" | "Moderate" | "Challenging";
	outlookSummary: string;
	employabilityScore: number;
	topCountry: string;
	factors: CareerOutlookFactor[];
	pathways: CareerPathway[];
	keySkillsToAdd: string[];
	industryTrends: string[];
	disclaimer: string;
	generatedAt: string;
}

export const predictCareerAction = async (): Promise<CareerResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/career/predict`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 4: PR & Immigration Engine ────────────────────────────────────────

export interface ImmigrationStep {
	phase: string;
	title: string;
	description: string;
	typicalDuration: string;
	keyCriteria: string[];
	pitfalls: string[];
}

export interface CountryPathway {
	countryCode: string;
	countryName: string;
	overallFeasibility: "High" | "Medium" | "Low";
	feasibilityReason: string;
	studyVisaType: string;
	postStudyWorkVisa: string;
	postStudyWorkDuration: string;
	prPathway: string;
	prTimeline: string;
	pointsRequired?: number;
	estimatedPoints?: number;
	steps: ImmigrationStep[];
	advantages: string[];
	challenges: string[];
	officialSource: string;
}

export interface ImmigrationResult {
	pathways: CountryPathway[];
	bestFitCountry: string;
	bestFitReason: string;
	generalTips: string[];
	disclaimer: string;
	lastUpdated: string;
	generatedAt: string;
}

export const getImmigrationGuideAction = async (): Promise<ImmigrationResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/immigration/guide`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: "{}",
	});
	if (!response.ok) return null;
	return response.json();
};

// ── Module 4: Data Sync Agent ─────────────────────────────────────────────────

export interface SyncRunResult {
	target: string;
	status: "success" | "partial" | "failed";
	recordsProcessed: number;
	recordsUpdated: number;
	recordsCreated: number;
	errors: string[];
	durationMs: number;
	triggeredBy: string;
	startedAt: string;
	completedAt: string;
}

export interface SyncStatusResponse {
	lastRun: SyncRunResult | null;
	totalRuns: number;
	successRate: number;
	nextScheduledRun: string;
	dataFreshness: {
		scholarships: { count: number; lastUpdated: string | null };
		programs: { count: number; lastUpdated: string | null };
	};
}

export const getDataSyncStatusAction = async (): Promise<SyncStatusResponse | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/status`);
	if (!response.ok) return null;
	return response.json();
};

export const triggerDataSyncAction = async (
	target: "scholarships" | "programs" | "all" = "all",
): Promise<SyncRunResult | null> => {
	const response = await authFetch(`${BACKEND_URL}/data-sync/run`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ target }),
	});
	if (!response.ok) return null;
	return response.json();
};

