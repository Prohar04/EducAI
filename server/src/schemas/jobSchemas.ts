import { z } from "zod";

export const jobSearchSchema = z.object({
  body: z.object({
    country: z.string().min(2).max(100),
    countryCode: z.string().length(2),
    city: z.string().min(2).max(100),
    field: z.string().min(2).max(100),
    jobType: z.enum(["PART_TIME", "FULL_TIME", "INTERNSHIP", "REMOTE"]),
    visaType: z.string().max(100).optional(),
    keyword: z.string().max(120).optional(),
    datePosted: z.enum(["today", "3days", "week", "month"]).optional(),
    page: z.number().int().min(1).default(1),
  }),
});

export type JobSearchBody = z.infer<typeof jobSearchSchema>["body"];

export type JobSearchAIResponse = {
  listings: {
    title: string;
    company: string;
    company_logo?: string | null;
    location: string;
    job_type: string;
    salary?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    currency?: string | null;
    posted_at?: string | null;
    visa_sponsorship?: string | null;
    apply_url: string;
    description?: string | null;
    source: string;
    is_remote?: boolean;
  }[];
  work_hour_limit?: string;
  post_grad_permit_steps?: string[];
  total: number;
  query_used: string;
  source_used: string;
  ai_fallback_used: boolean;
};

// Multi-country search: up to 4 countries, same field/type/keyword
export const multiCountryJobSearchSchema = z.object({
  body: z.object({
    countries: z.array(z.object({
      country: z.string().min(2).max(100),
      countryCode: z.string().length(2),
      city: z.string().min(2).max(100),
    })).min(1).max(4),
    field: z.string().min(2).max(100),
    jobType: z.enum(["PART_TIME", "FULL_TIME", "INTERNSHIP", "REMOTE"]),
    keyword: z.string().max(120).optional(),
    datePosted: z.enum(["today", "3days", "week", "month"]).optional(),
    page: z.number().int().min(1).default(1),
  }),
});

export type MultiCountryJobSearchBody = z.infer<typeof multiCountryJobSearchSchema>["body"];

export type CountryJobGroup = {
  countryCode: string;
  country: string;
  city: string;
  listings: JobSearchAIResponse["listings"];
  sourceUsed: string;
  total: number;
  workHourLimit?: string;
  postGradPermitSteps?: string[];
  error?: string;
  cachedAt?: string;
};

export const suggestQuerySchema = z.object({
  query: z.object({
    type: z.enum(["jobtitle", "city", "field", "country"]),
    query: z.string().min(1).max(60),
    context: z.string().optional(),
  }),
});
