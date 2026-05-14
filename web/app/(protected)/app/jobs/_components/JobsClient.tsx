"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import HeaderBadge from "@/components/ui/header-badge";
import { useFirstVisit } from "@/lib/hooks/use-first-visit";
import {
  Briefcase,
  Clock,
  Globe,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  History,
  X,
  Loader2,
  DollarSign,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  STUDY_COUNTRIES,
  CITIES_BY_COUNTRY,
  FIELD_GROUPS,
  VISA_OPTIONS_BY_COUNTRY,
  type StudyCountry,
} from "@/lib/jobConstants";
import {
  searchJobsAction,
  getJobHistoryAction,
  getJobSuggestionsAction,
  getJobRefreshStatusAction,
  type JobListing,
  type JobSearchResult,
  type JobHistoryItem,
} from "@/lib/auth/action";

// ── Types ───────────────────────────────────────────────────────────────────

type JobType = "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "REMOTE";

const JOB_TYPES: { value: JobType; label: string; sub: string; icon: typeof Clock }[] = [
  { value: "PART_TIME", label: "Part-time", sub: "While studying", icon: Clock },
  { value: "FULL_TIME", label: "Full-time", sub: "After graduation", icon: Briefcase },
  { value: "INTERNSHIP", label: "Internship", sub: "Work experience", icon: GraduationCap },
  { value: "REMOTE", label: "Remote", sub: "Work from anywhere", icon: Globe },
];

const JOB_TYPE_COLORS: Record<JobType, string> = {
  PART_TIME: "bg-[#4A90D9]/10 text-[#4A90D9] border-[#4A90D9]/20",
  FULL_TIME: "bg-[#4A90D9]/10 text-[#4A90D9] border-[#4A90D9]/20",
  INTERNSHIP: "bg-[#4A90D9]/10 text-[#4A90D9] border-[#4A90D9]/20",
  REMOTE: "bg-[#4A90D9]/10 text-[#4A90D9] border-[#4A90D9]/20",
};

const LOADING_MESSAGES = [
  "Connecting to job boards...",
  "Fetching listings from Indeed & LinkedIn...",
  "Filtering visa-compatible jobs...",
  "Almost there...",
];

// ── Utility helpers ──────────────────────────────────────────────────────────

function getCompanyColor(company: string): string {
  const colors = [
    "bg-[#4A90D9]", "bg-[#3D9970]", "bg-[#C49A3C]", "bg-[#7A8BA8]",
    "bg-[#C0392B]", "bg-[#3D4F6B]", "bg-[#4A90D9]", "bg-[#3D9970]",
  ];
  let hash = 0;
  for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function freshnessInfo(cachedAt?: string | null): { dot: string; text: string } {
  if (!cachedAt) return { dot: "bg-gray-400", text: "Just fetched" };
  const ageMin = (Date.now() - new Date(cachedAt).getTime()) / 60_000;
  if (ageMin < 5) return { dot: "bg-[#3D9970]", text: "Updated just now" };
  if (ageMin < 30) return { dot: "bg-[#3D9970]", text: `Updated ${Math.floor(ageMin)} min ago` };
  if (ageMin < 55) return { dot: "bg-[#C49A3C]", text: `Updated ${Math.floor(ageMin)} min ago` };
  return { dot: "bg-[#C0392B]", text: "Refreshing data..." };
}

// ── Combobox (reusable) ──────────────────────────────────────────────────────

function Combobox({
  id, label, placeholder, value, disabled, disabledReason, renderTrigger, children, open, onOpenChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  disabledReason?: string;
  renderTrigger?: () => React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
      <div className="relative">
        {disabled && disabledReason ? (
          <div title={disabledReason} className="flex h-9 w-full cursor-not-allowed items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
            <Lock className="mr-2 size-3.5" />
            {placeholder}
          </div>
        ) : (
          <DropdownMenu open={open} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
              <button
                id={id}
                type="button"
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-colors hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {renderTrigger ? renderTrigger() : (
                  <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
                )}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 w-72 overflow-y-auto p-1.5">
              {children}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// ── Job card ────────────────────────────────────────────────────────────────

function JobCard({
  listing,
  index,
  saved,
  onToggleSave,
}: {
  listing: JobListing;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const companyInitial = listing.company.charAt(0).toUpperCase();
  const colorClass = getCompanyColor(listing.company);
  const jobType = listing.job_type as JobType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -2, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.14)" }}
      className="rounded-xl border border-border bg-card p-4"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {listing.company_logo ? (
            <Image
              src={listing.company_logo}
              alt={listing.company}
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-lg object-contain border border-border bg-muted"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              unoptimized
            />
          ) : (
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-white text-lg font-semibold ${colorClass}`}>
              {companyInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground font-medium">{listing.company}</p>
            <h3 className="mt-0.5 text-[15px] font-semibold leading-snug line-clamp-2 break-words">{listing.title}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? "Remove from saved" : "Save job"}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {saved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
        </button>
      </div>

      {/* Middle row — badges */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3" />
          {listing.location}
        </span>
        {jobType && JOB_TYPE_COLORS[jobType] && (
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${JOB_TYPE_COLORS[jobType]}`}>
            {JOB_TYPES.find((t) => t.value === jobType)?.label ?? listing.job_type}
          </span>
        )}
        {listing.is_remote && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#4A90D9]/20 bg-[#4A90D9]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A90D9]">
            🌐 Remote
          </span>
        )}
      </div>

      {/* Salary */}
      {listing.salary && (
        <div className="mt-2 flex items-center gap-1 text-sm text-foreground/80">
          <DollarSign className="size-3.5 text-muted-foreground" />
          <span>{listing.salary}</span>
        </div>
      )}

      {/* Description */}
      {listing.description && (
        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{listing.description}</p>
      )}

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {listing.posted_at && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              {listing.posted_at}
            </span>
          )}
          {listing.visa_sponsorship === "Mentioned" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#3D9970]/20 bg-[#3D9970]/10 px-2 py-0.5 text-xs font-medium text-[#3D9970]">
              <Shield className="size-3" />
              Sponsorship mentioned
            </span>
          )}
        </div>
        {listing.apply_url ? (
          <a
            href={listing.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Apply Now
            <ExternalLink className="size-3" />
          </a>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#C49A3C]/20 bg-[#C49A3C]/10 px-3 py-1.5 text-xs font-medium text-[#C49A3C]">
            Search on job boards
          </span>
        )}
      </div>

      {/* Source / AI badge */}
      <div className="mt-2 flex justify-end gap-2">
        {listing.is_ai_generated ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#C49A3C]/20 bg-[#C49A3C]/10 px-2 py-0.5 text-[10px] font-medium text-[#C49A3C]">
            ✨ AI-generated example
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-[#3D9970] animate-pulse" />
            AI · Live
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const SAVED_JOBS_KEY = "educai_saved_jobs";
const LAST_SEARCH_KEY = "educai_last_job_search";

export default function JobsClient() {
  const isFirstVisit = useFirstVisit("jobs");
  // Form state
  const [selectedCountry, setSelectedCountry] = useState<StudyCountry | null>(null);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [jobType, setJobType] = useState<JobType | "">("");
  const [jobTitle, setJobTitle] = useState("");
  const [visaType, setVisaType] = useState("");

  // Combobox open state
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [visaOpen, setVisaOpen] = useState(false);

  // Filter inputs
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [fieldQuery, setFieldQuery] = useState("");

  // Results & UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<JobSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allListings, setAllListings] = useState<JobListing[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [workHourDismissed, setWorkHourDismissed] = useState(false);
  const [postGradOpen, setPostGradOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "saved">("results");
  const [historyOpen, setHistoryOpen] = useState(false);

  // Job title suggestions
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [jobTitleOpen, setJobTitleOpen] = useState(false);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  // History
  const [history, setHistory] = useState<JobHistoryItem[]>([]);

  // Saved jobs
  const [savedJobUrls, setSavedJobUrls] = useState<Set<string>>(new Set());

  // Filter chips
  const [filterJobType, setFilterJobType] = useState<string>("all");
  const [_filterPosted, setFilterPosted] = useState<string>("any");
  const [filterVisa, setFilterVisa] = useState<string>("any");

  const jobTitleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingMsgRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Load saved jobs from localStorage
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_JOBS_KEY) ?? "[]") as string[];
      setSavedJobUrls(new Set(saved));
    } catch {}

    // Load last search
    try {
      const lastSearch = JSON.parse(localStorage.getItem(LAST_SEARCH_KEY) ?? "null") as {
        country: StudyCountry; city: string; field: string; jobType: JobType;
      } | null;
      if (lastSearch) {
        setSelectedCountry(lastSearch.country);
        setSelectedCity(lastSearch.city);
        setSelectedField(lastSearch.field);
        setJobType(lastSearch.jobType);
      }
    } catch {}

    // Load history
    getJobHistoryAction().then((res) => {
      if (res?.ok) setHistory(res.data);
    }).catch(() => {});

    // Start polling for refresh status
    startPolling();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (loadingMsgRef.current) clearInterval(loadingMsgRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await getJobRefreshStatusAction();
        if (status?.ok && status.data.needsRefresh && !isRefreshing) {
          setIsRefreshing(true);
          // Silent refresh: just update the freshness indicator
          setTimeout(() => setIsRefreshing(false), 3000);
        }
      } catch {}
    }, 60_000);
  }

  // ── Saved jobs ────────────────────────────────────────────────────────────

  function toggleSaveJob(applyUrl: string) {
    setSavedJobUrls((prev) => {
      const next = new Set(prev);
      if (next.has(applyUrl)) next.delete(applyUrl);
      else next.add(applyUrl);
      try { localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  // ── Country select ────────────────────────────────────────────────────────

  function handleCountrySelect(country: StudyCountry) {
    setSelectedCountry(country);
    setSelectedCity("");
    setCountryOpen(false);
    setCountryQuery("");
  }

  // ── Field select ──────────────────────────────────────────────────────────

  function handleFieldSelect(field: string) {
    setSelectedField(field);
    setFieldOpen(false);
    setFieldQuery("");
    // Pre-fetch job title suggestions for this field
    if (field) {
      setIsSuggestLoading(true);
      getJobSuggestionsAction("jobtitle", "", field).then((s) => {
        setJobTitleSuggestions(s);
      }).finally(() => setIsSuggestLoading(false));
    }
  }

  // ── Job title suggestions (debounced) ─────────────────────────────────────

  function handleJobTitleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setJobTitle(val);
    if (jobTitleDebounceRef.current) clearTimeout(jobTitleDebounceRef.current);
    if (val.length >= 2) {
      setIsSuggestLoading(true);
      jobTitleDebounceRef.current = setTimeout(async () => {
        const suggestions = await getJobSuggestionsAction("jobtitle", val, selectedField || undefined);
        setJobTitleSuggestions(suggestions);
        setIsSuggestLoading(false);
        if (suggestions.length > 0) setJobTitleOpen(true);
      }, 400);
    } else {
      setJobTitleSuggestions([]);
      setIsSuggestLoading(false);
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────

  const canSearch = !!(selectedCountry && selectedCity && selectedField && jobType && !isLoading);

  async function handleSearch(page = 1) {
    if (!canSearch && page === 1) return;
    if (!selectedCountry || !selectedField || !selectedCity || !jobType) return;

    setIsLoading(true);
    setError(null);
    setLoadingMsg(0);
    if (page === 1) {
      setResult(null);
      setAllListings([]);
      setWorkHourDismissed(false);
      setPostGradOpen(false);
      setFilterJobType("all");
      setFilterPosted("any");
      setFilterVisa("any");
    }

    // Cycle loading messages
    loadingMsgRef.current = setInterval(() => {
      setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length);
    }, 1500);

    try {
      const payload = {
        country: selectedCountry.name,
        countryCode: selectedCountry.code,
        city: selectedCity,
        field: selectedField,
        jobType: jobType as "PART_TIME" | "FULL_TIME" | "INTERNSHIP" | "REMOTE",
        visaType: visaType || undefined,
        keyword: jobTitle.trim() || undefined,
        page,
      };

      const res = await searchJobsAction(payload);

      if (!res?.ok) {
        setError("Job search failed. Please try again in a moment.");
        return;
      }

      if (page === 1) {
        setResult(res.data);
        setAllListings(res.data.listings);
        setCurrentPage(1);
      } else {
        setAllListings((prev) => [...prev, ...res.data.listings]);
        setCurrentPage(page);
      }

      // Save last search
      try {
        localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify({
          country: selectedCountry, city: selectedCity, field: selectedField, jobType,
        }));
      } catch {}
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      if (loadingMsgRef.current) clearInterval(loadingMsgRef.current);
    }
  }

  function handleLoadMore() {
    handleSearch(currentPage + 1);
  }

  function handleHistorySearch(item: JobHistoryItem) {
    const country = STUDY_COUNTRIES.find((c) => c.code === item.countryCode);
    if (country) setSelectedCountry(country);
    setSelectedCity(item.city);
    setSelectedField(item.field);
    setJobType(item.jobType as JobType);
    setHistoryOpen(false);
    setTimeout(() => handleSearch(1), 100);
  }

  // ── Filtered listings ─────────────────────────────────────────────────────

  const filteredListings = allListings.filter((l) => {
    if (filterJobType !== "all" && l.job_type !== filterJobType) return false;
    if (filterVisa === "mentioned" && l.visa_sponsorship !== "Mentioned") return false;
    return true;
  });

  const savedFilteredListings = filteredListings.filter((l) => savedJobUrls.has(l.apply_url));

  // ── Filtered combobox options ─────────────────────────────────────────────

  const filteredCountries = countryQuery
    ? STUDY_COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(countryQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(countryQuery.toLowerCase()))
    : STUDY_COUNTRIES;

  const citiesForCountry = selectedCountry ? (CITIES_BY_COUNTRY[selectedCountry.code] ?? []) : [];
  const filteredCities = cityQuery
    ? citiesForCountry.filter((c) => c.toLowerCase().includes(cityQuery.toLowerCase()))
    : citiesForCountry;

  const filteredFieldGroups = FIELD_GROUPS.map((g) => ({
    ...g,
    fields: fieldQuery
      ? g.fields.filter((f) => f.toLowerCase().includes(fieldQuery.toLowerCase()))
      : g.fields,
  })).filter((g) => g.fields.length > 0);

  const visaOptions = selectedCountry ? (VISA_OPTIONS_BY_COUNTRY[selectedCountry.code] ?? []) : [];

  const freshness = freshnessInfo(result?.cachedAt);

  const showVisaField = jobType === "FULL_TIME" || jobType === "INTERNSHIP";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`${isFirstVisit ? "page-enter" : ""} min-h-screen pb-16`}>
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-[#4A90D9]/5 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <PageHeader
            animation="jobs"
            title={<>Find Your Perfect <span className="gradient-text">Job</span> Abroad</>}
            subtitle="Live listings from Indeed, LinkedIn & more — refreshed every hour"
            badges={
              <>
                <HeaderBadge>🌍 30 Countries</HeaderBadge>
                <HeaderBadge>💼 Updated Hourly</HeaderBadge>
                <HeaderBadge variant="outline">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#3D9970] inline-block" />
                  Live Data
                </HeaderBadge>
              </>
            }
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card shadow-lg"
        >
          <div className="p-5 sm:p-6">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Search Parameters
            </h2>

            {/* Row 1: Country + City */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Country */}
              <Combobox
                id="country"
                label="Country"
                placeholder="Select country"
                value={selectedCountry?.name ?? ""}
                open={countryOpen}
                onOpenChange={setCountryOpen}
                renderTrigger={() =>
                  selectedCountry ? (
                    <span className="flex items-center gap-2">
                      <span>{selectedCountry.flag}</span>
                      <span className="truncate">{selectedCountry.name}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Select country</span>
                  )
                }
              >
                <div className="p-1 pb-2">
                  <Input
                    placeholder="Search countries..."
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
                {filteredCountries.map((c) => (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => handleCountrySelect(c)}
                    className="cursor-pointer gap-2"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </DropdownMenuItem>
                ))}
              </Combobox>

              {/* City */}
              <Combobox
                id="city"
                label="City"
                placeholder="Select city"
                value={selectedCity}
                disabled={!selectedCountry}
                disabledReason="Select a country first"
                open={cityOpen}
                onOpenChange={setCityOpen}
              >
                <div className="p-1 pb-2">
                  <Input
                    placeholder="Search cities..."
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
                {filteredCities.map((city) => (
                  <DropdownMenuItem
                    key={city}
                    onClick={() => { setSelectedCity(city); setCityOpen(false); setCityQuery(""); }}
                    className="cursor-pointer"
                  >
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {city}
                  </DropdownMenuItem>
                ))}
                {filteredCities.length === 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No cities found</div>
                )}
              </Combobox>
            </div>

            {/* Row 2: Field of study */}
            <div className="mt-4">
              <Combobox
                id="field"
                label="Field of Study"
                placeholder="Select your field"
                value={selectedField}
                open={fieldOpen}
                onOpenChange={setFieldOpen}
              >
                <div className="p-1 pb-2">
                  <Input
                    placeholder="Search fields..."
                    value={fieldQuery}
                    onChange={(e) => setFieldQuery(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                </div>
                {filteredFieldGroups.map((group) => (
                  <div key={group.category}>
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                      {group.category}
                    </div>
                    {group.fields.map((f) => (
                      <DropdownMenuItem
                        key={f}
                        onClick={() => handleFieldSelect(f)}
                        className="cursor-pointer text-sm"
                      >
                        {f}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
                {filteredFieldGroups.length === 0 && (
                  <div className="px-3 py-3 text-sm text-muted-foreground">No field found. Try a different keyword.</div>
                )}
              </Combobox>
            </div>

            {/* Row 3: Job type segmented control */}
            <div className="mt-4 space-y-1.5">
              <Label className="text-sm font-medium">Job Type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {JOB_TYPES.map(({ value, label, sub, icon: Icon }) => {
                  const active = jobType === value;
                  return (
                    <motion.button
                      key={value}
                      type="button"
                      onClick={() => setJobType(value)}
                      animate={active ? { scale: 1.02 } : { scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className={`flex flex-col items-center gap-0.5 rounded-xl border py-3 text-xs font-medium transition-all ${
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="font-semibold">{label}</span>
                      <span className={`text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{sub}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Row 4: Job title + visa type */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Job title with suggestions */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Job Title (optional)</Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. Software Engineer, Data Analyst"
                    value={jobTitle}
                    onChange={handleJobTitleInput}
                    onFocus={() => { if (jobTitleSuggestions.length > 0) setJobTitleOpen(true); }}
                    onBlur={() => setTimeout(() => setJobTitleOpen(false), 150)}
                    className="pr-8"
                  />
                  {isSuggestLoading && (
                    <Loader2 className="absolute right-2.5 top-2.5 size-4 animate-spin text-muted-foreground" />
                  )}
                  <AnimatePresence>
                    {jobTitleOpen && jobTitleSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
                      >
                        {jobTitleSuggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                            onClick={() => { setJobTitle(s); setJobTitleOpen(false); }}
                          >
                            <Search className="size-3.5 text-muted-foreground" />
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Visa type — conditional */}
              <AnimatePresence>
                {showVisaField && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Combobox
                      id="visa"
                      label="Work Authorization (optional)"
                      placeholder="Select visa type"
                      value={visaType}
                      open={visaOpen}
                      onOpenChange={setVisaOpen}
                    >
                      {visaOptions.map((v) => (
                        <DropdownMenuItem
                          key={v}
                          onClick={() => { setVisaType(v); setVisaOpen(false); }}
                          className="cursor-pointer text-sm"
                        >
                          {v}
                        </DropdownMenuItem>
                      ))}
                      {visaOptions.length === 0 && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Select a country first</div>
                      )}
                    </Combobox>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search button */}
            <div className="mt-5">
              <Button
                onClick={() => handleSearch(1)}
                disabled={!canSearch}
                className="relative h-12 w-full overflow-hidden text-base font-semibold"
                title={!canSearch ? "Please fill in Country, City, Field and Job Type" : undefined}
              >
                {isLoading ? (
                  <motion.span
                    key={loadingMsg}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="size-4 animate-spin" />
                    {LOADING_MESSAGES[loadingMsg]}
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-2">
                    {!canSearch ? <Lock className="size-4" /> : <Search className="size-4" />}
                    Search Live Jobs
                  </span>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
              <button type="button" onClick={() => setError(null)} className="ml-auto">
                <X className="size-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Status bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/80 px-4 py-3 backdrop-blur">
                <span className="text-sm font-medium">
                  {result.total} jobs found
                  {selectedField && ` · ${selectedField}`}
                  {selectedCity && selectedCountry && ` · ${selectedCity}, ${selectedCountry.flag}`}
                </span>
                {result.source_used === "adzuna" && (
                  <span title="Live data from Adzuna — official job board partner" className="rounded-full border border-[#3D9970]/20 bg-[#3D9970]/10 px-2.5 py-0.5 text-xs font-medium text-[#3D9970]">
                    📋 Adzuna · Official Data
                  </span>
                )}
                {result.source_used === "jsearch" && (
                  <span title="Aggregated from Indeed, LinkedIn and Glassdoor via JSearch" className="rounded-full border border-[#4A90D9]/20 bg-[#4A90D9]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A90D9]">
                    🔍 JSearch · Indeed/LinkedIn
                  </span>
                )}
                {result.source_used === "adzuna+jsearch" && (
                  <span title="Combined results from Adzuna and JSearch" className="rounded-full border border-[#4A90D9]/20 bg-[#4A90D9]/10 px-2.5 py-0.5 text-xs font-medium text-[#4A90D9]">
                    📋🔍 Adzuna + JSearch
                  </span>
                )}
                {result.source_used === "ai_generated" && (
                  <span title="Generated by AI — job boards unavailable for this region" className="rounded-full border border-[#C49A3C]/20 bg-[#C49A3C]/10 px-2.5 py-0.5 text-xs font-medium text-[#C49A3C]">
                    🤖 AI Generated
                  </span>
                )}
                {!["adzuna", "jsearch", "adzuna+jsearch", "ai_generated"].includes(result.source_used) && (
                  <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    🔍 Live from Search
                  </span>
                )}
                <div className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={`size-2 shrink-0 rounded-full ${isRefreshing ? "bg-[#C49A3C] animate-pulse" : freshness.dot}`} />
                  {isRefreshing ? "Refreshing data..." : freshness.text}
                </div>
              </div>

              {/* Work hour limit alert */}
              <AnimatePresence>
                {result.work_hour_limit && !workHourDismissed && (jobType === "PART_TIME" || jobType === "INTERNSHIP") && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-[#C49A3C]/20 bg-[#C49A3C]/5 px-4 py-3"
                  >
                    <Clock className="mt-0.5 size-4 shrink-0 text-[#C49A3C]" />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-[#C49A3C]">
                        Work Hour Limit {selectedCountry && `· ${selectedCountry.flag} ${selectedCountry.name}`}
                      </p>
                      <p className="mt-0.5 text-[#C49A3C]/80">{result.work_hour_limit}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWorkHourDismissed(true)}
                      className="text-[#C49A3C] hover:text-[#C49A3C]/80"
                    >
                      <X className="size-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI fallback warning banner — always visible when AI-generated results shown */}
              {result.ai_fallback_used && (
                <div className="rounded-xl border border-[#C49A3C]/30 bg-[#C49A3C]/8 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#C49A3C]" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#C49A3C]">
                        ⚠️ AI-Generated Listings
                      </p>
                      <p className="mt-1 text-sm text-[#C49A3C]/80">
                        Live job boards are not available for {selectedCountry?.name ?? "this country"} right now.
                        These listings were generated by AI based on real market knowledge for{" "}
                        {selectedField} professionals in {selectedCity}. Always verify on official job boards before applying.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={`https://linkedin.com/jobs/search?keywords=${encodeURIComponent(selectedField)}&location=${encodeURIComponent(selectedCity)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#C49A3C]/30 bg-[#C49A3C]/10 px-3 py-1.5 text-xs font-semibold text-[#C49A3C] transition-colors hover:bg-[#C49A3C]/20"
                        >
                          Search on LinkedIn →
                        </a>
                        <a
                          href={`https://indeed.com/jobs?q=${encodeURIComponent(selectedField)}&l=${encodeURIComponent(selectedCity)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#C49A3C]/30 bg-[#C49A3C]/10 px-3 py-1.5 text-xs font-semibold text-[#C49A3C] transition-colors hover:bg-[#C49A3C]/20"
                        >
                          Search on Indeed →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Post-grad permit accordion */}
              <AnimatePresence>
                {result.post_grad_permit_steps && result.post_grad_permit_steps.length > 0 && jobType === "FULL_TIME" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-xl border border-[#4A90D9]/20 bg-[#4A90D9]/5"
                  >
                    <button
                      type="button"
                      onClick={() => setPostGradOpen((v) => !v)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <GraduationCap className="size-4 shrink-0 text-[#4A90D9]" />
                      <span className="flex-1 text-sm font-semibold text-[#4A90D9]">
                        🎓 Work Authorization After Your Masters/PhD{selectedCountry && ` in ${selectedCountry.name}`}
                      </span>
                      <motion.span animate={{ rotate: postGradOpen ? 180 : 0 }}>
                        <ChevronDown className="size-4 text-[#4A90D9]" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {postGradOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <ol className="space-y-2 px-4 pb-4">
                            {result.post_grad_permit_steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-[#4A90D9]/80">
                                <CheckCircle className="mt-0.5 size-4 shrink-0 text-[#4A90D9]" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab bar */}
              <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
                {(["results", "saved"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "results" ? `Results (${filteredListings.length})` : `Saved (${savedFilteredListings.length})`}
                  </button>
                ))}
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2">
                {/* Job type filter */}
                {["all", "PART_TIME", "FULL_TIME", "INTERNSHIP", "REMOTE"].map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFilterJobType(ft)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      filterJobType === ft
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ft === "all" ? "All types" : JOB_TYPES.find((t) => t.value === ft)?.label ?? ft}
                  </button>
                ))}
                <div className="mx-1 self-center text-border">|</div>
                {["any", "mentioned"].map((fv) => (
                  <button
                    key={fv}
                    type="button"
                    onClick={() => setFilterVisa(fv)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      filterVisa === fv
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {fv === "any" ? "Any visa" : "Sponsorship mentioned"}
                  </button>
                ))}
              </div>

              {/* Job cards */}
              {activeTab === "results" && (
                <>
                  {filteredListings.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl border border-border bg-card p-8 text-center"
                    >
                      <Briefcase className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                      <p className="font-medium">No jobs found for {selectedField} in {selectedCity}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search in a nearby city.</p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setFilterJobType("all"); setFilterVisa("any"); }}>
                          Clear filters
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setJobType("REMOTE")}>
                          Try Remote
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {filteredListings.map((listing, i) => (
                        <JobCard
                          key={`${listing.apply_url}-${i}`}
                          listing={listing}
                          index={i}
                          saved={savedJobUrls.has(listing.apply_url)}
                          onToggleSave={() => toggleSaveJob(listing.apply_url)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Load more */}
                  {filteredListings.length > 0 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" />Loading...</>
                      ) : (
                        <><ChevronDown className="mr-2 size-4" />Load more jobs</>
                      )}
                    </Button>
                  )}
                </>
              )}

              {activeTab === "saved" && (
                savedFilteredListings.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <Bookmark className="mx-auto mb-3 size-10 text-muted-foreground/40" />
                    <p className="font-medium">No saved jobs yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Click the bookmark icon on any job card to save it.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    {savedFilteredListings.map((listing, i) => (
                      <JobCard
                        key={`saved-${listing.apply_url}-${i}`}
                        listing={listing}
                        index={i}
                        saved
                        onToggleSave={() => toggleSaveJob(listing.apply_url)}
                      />
                    ))}
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent searches */}
        {history.length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                Recent Searches
              </span>
              <motion.span animate={{ rotate: historyOpen ? 180 : 0 }}>
                <ChevronDown className="size-4 text-muted-foreground" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {historyOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 border-t border-border p-2">
                    {history.slice(0, 5).map((item) => {
                      const country = STUDY_COUNTRIES.find((c) => c.code === item.countryCode);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleHistorySearch(item)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted/60"
                        >
                          <span className="text-lg">{country?.flag ?? "🌍"}</span>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{item.city}, {item.country}</p>
                            <p className="text-xs text-muted-foreground">{item.field}</p>
                          </div>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${JOB_TYPE_COLORS[item.jobType as JobType] ?? ""}`}>
                            {JOB_TYPES.find((t) => t.value === item.jobType)?.label ?? item.jobType}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
