var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/generated/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("node:buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}
var config;
var init_class = __esm({
  "src/generated/internal/class.ts"() {
    "use strict";
    config = {
      "previewFeatures": [],
      "clientVersion": "7.3.0",
      "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
      "activeProvider": "postgresql",
      "inlineSchema": `generator client {
  provider = "prisma-client"
  // previewFeatures = ["postgresqlExtensions"]
  // binaryTargets   = ["native",/[]\\ "linux-musl-openssl-3.0.x"]
  output   = "../src/generated"
}

datasource db {
  provider = "postgresql"
  // extensions = [vector]
}

model User {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String    @unique @db.VarChar(255)
  passwordHash  String?   @map("password_hash") @db.VarChar(255)
  name          String    @map("name") @db.VarChar(255)
  avatarUrl     String?   @map("avatar_url") @db.Text
  emailVerified Boolean   @default(false) @map("email_verified")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamp
  updatedAt     DateTime  @updatedAt @map("updated_at") @db.Timestamp
  deletedAt     DateTime? @map("deleted_at") @db.Timestamp

  // OAuth fields
  oauthProvider String? @map("oauth_provider") @db.VarChar(50) // 'google', 'facebook', etc.
  oauthId       String? @map("oauth_id") @db.VarChar(255)

  // Account lockout fields
  failedLoginCount  Int       @default(0) @map("failed_login_count")
  lockoutUntil      DateTime? @map("lockout_until") @db.Timestamp
  lastFailedLoginAt DateTime? @map("last_failed_login_at") @db.Timestamp

  // EducAI domain relations
  profile                 UserProfile?
  refreshTokens           RefreshToken[]
  sessions                UserSession[]
  passwordResetTokens     PasswordResetToken[]
  emailVerificationTokens EmailVerificationToken[]
  emailChangeTokens       EmailChangeToken[]
  savedPrograms           SavedProgram[]
  oauthCodes              OAuthCode[]
  matchRuns               MatchRun[]
  roadmaps                UserRoadmap[]
  strategyReports         StrategyReport[]
  scholarshipAlertLogs    ScholarshipAlertLog[]
  gapFixSessions          GapFixSession[]
  gapFixItems             GapFixItem[]
  jobSearches             JobSearch[]
  strategyActions         StrategyAction[]

  @@index([email])
  @@index([oauthProvider, oauthId])
  @@map("users")
}

model UserProfile {
  userId         String  @id @map("user_id") @db.Uuid
  // \u2500\u2500 Legacy fields (kept for backward compat) \u2500\u2500
  targetCountry  String? @map("target_country") @db.VarChar(100)
  level          String? @db.VarChar(20) // "BSc" | "MSc" | "PhD"
  budgetRange    String? @map("budget_range") @db.VarChar(50)
  intendedMajor  String? @map("intended_major") @db.VarChar(100)
  gpa            Float?  @db.Real
  testScores     Json?   @map("test_scores") // {"IELTS": 7.5, "GRE": 320}
  onboardingDone Boolean @default(false) @map("onboarding_done")

  // \u2500\u2500 Step 1: Student Stage \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  currentStage    String? @map("current_stage") @db.VarChar(50)
  targetIntake    String? @map("target_intake") @db.VarChar(30)
  targetCountries Json?   @map("target_countries") // string[]
  intendedLevel   String? @map("intended_level") @db.VarChar(20)

  // \u2500\u2500 Step 2: Academic Profile \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  currentInstitution   String? @map("current_institution") @db.VarChar(200)
  majorOrTrack         String? @map("major_or_track") @db.VarChar(100)
  gpaScale             String? @map("gpa_scale") @db.VarChar(10) // "4.0"|"10"|"5"|"%"
  graduationYear       Int?    @map("graduation_year")
  backlogs             Int?
  workExperienceMonths Int?    @map("work_experience_months")

  // \u2500\u2500 Step 3: Tests & Language \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  englishTestType String? @map("english_test_type") @db.VarChar(20)
  englishScore    Float?  @map("english_score") @db.Real
  gre             Float?  @db.Real
  gmat            Float?  @db.Real

  // \u2500\u2500 Intended Abroad Study (separate from current major) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // majorOrTrack = current academic major/program
  // intendedAbroadMajor = what the user wants to study abroad (primary signal for matching)
  intendedAbroadMajor String? @map("intended_abroad_major") @db.VarChar(100)
  careerGoal          String? @map("career_goal") @db.VarChar(200)
  researchInterest    String? @map("research_interest") @db.VarChar(200)

  // \u2500\u2500 Step 4: Budget & Preferences \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  budgetCurrency  String?  @default("USD") @map("budget_currency") @db.VarChar(10)
  budgetMax       Float?   @map("budget_max") @db.Real
  // Canonical USD-normalized budget for matching/filtering logic.
  // Computed from budgetMax + budgetCurrency using static fallback exchange rates.
  budgetAmountUSD Float?   @map("budget_amount_usd") @db.Real
  fundingNeed     Boolean? @map("funding_need")
  preferredCities Json?    @map("preferred_cities") // string[]
  priorities      Json? // string[]

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

model RefreshToken {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  token     String    @unique @db.Text
  expiresAt DateTime  @map("expires_at") @db.Timestamp
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp
  revokedAt DateTime? @map("revoked_at") @db.Timestamp
  ttlDays   Int?      @map("ttl_days") // Remember-me: stores original TTL for rotation

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

model PasswordResetToken {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @unique @map("token_hash") @db.Text
  expiresAt DateTime  @map("expires_at") @db.Timestamp
  usedAt    DateTime? @map("used_at") @db.Timestamp
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("password_reset_tokens")
}

model EmailVerificationToken {
  id        String    @id @default(cuid())
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @unique @map("token_hash") @db.Text
  expiresAt DateTime  @map("expires_at") @db.Timestamp
  usedAt    DateTime? @map("used_at") @db.Timestamp
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("email_verification_tokens")
}

model EmailChangeToken {
  id        String    @id @default(cuid())
  userId    String    @map("user_id") @db.Uuid
  newEmail  String    @map("new_email") @db.VarChar(255)
  tokenHash String    @unique @map("token_hash") @db.Text
  expiresAt DateTime  @map("expires_at") @db.Timestamp
  usedAt    DateTime? @map("used_at") @db.Timestamp
  createdAt DateTime  @default(now()) @map("created_at") @db.Timestamp

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([newEmail])
  @@map("email_change_tokens")
}

model UserSession {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String?  @map("user_id") @db.Uuid
  sessionId    String   @unique @map("session_id") @db.VarChar(255)
  userAgent    String?  @map("user_agent") @db.Text
  ipAddress    String?  @map("ip_address") @db.VarChar(45)
  data         String?  @db.Text // Session data
  lastActiveAt DateTime @default(now()) @map("last_active_at") @db.Timestamp
  expiresAt    DateTime @map("expires_at") @db.Timestamp
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamp

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionId])
  @@index([expiresAt])
  @@map("user_sessions")
}

// ============================================================================
// AUDIT LOG
// ============================================================================

model AuditLog {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  action     String   @db.VarChar(100) // e.g. "user.signin", "profile.update"
  entityType String   @map("entity_type") @db.VarChar(50)
  entityId   String?  @map("entity_id") @db.Uuid
  changes    Json?
  ipAddress  String?  @map("ip_address") @db.VarChar(45)
  userAgent  String?  @map("user_agent") @db.Text
  timestamp  DateTime @default(now()) @db.Timestamp

  @@index([userId, timestamp(sort: Desc)])
  @@index([entityType, entityId])
  @@index([action, timestamp(sort: Desc)])
  @@map("audit_logs")
}

// ============================================================
// MODULE 1: University & Program Matching
// ============================================================

model Country {
  id           String       @id @default(cuid())
  code         String       @unique @db.VarChar(10)
  name         String       @db.VarChar(100)
  createdAt    DateTime     @default(now()) @map("created_at") @db.Timestamp
  updatedAt    DateTime     @updatedAt @map("updated_at") @db.Timestamp
  universities University[]

  @@map("countries")
}

model University {
  id                   String    @id @default(cuid())
  name                 String    @db.VarChar(200)
  countryId            String    @map("country_id")
  city                 String?   @db.VarChar(100)
  website              String?   @db.Text
  description          String?   @db.Text
  sourceUrl            String?   @map("source_url") @db.Text
  ranking              String?   @db.VarChar(200)
  universityType       String?   @map("university_type") @db.VarChar(50)
  admissionsUrl        String?   @map("admissions_url") @db.Text
  tuitionUrl           String?   @map("tuition_url") @db.Text
  scholarshipsUrl      String?   @map("scholarships_url") @db.Text
  internationalUrl     String?   @map("international_url") @db.Text
  applicationPortalUrl String?   @map("application_portal_url") @db.Text
  lastVerifiedAt       DateTime? @map("last_verified_at") @db.Timestamp
  createdAt            DateTime  @default(now()) @map("created_at") @db.Timestamp
  updatedAt            DateTime  @updatedAt @map("updated_at") @db.Timestamp

  country  Country   @relation(fields: [countryId], references: [id], onDelete: Restrict)
  programs Program[]

  @@unique([countryId, name])
  @@index([countryId])
  @@index([name])
  @@map("universities")
}

enum ProgramLevel {
  BSC
  MSC
  PHD
}

model Program {
  id                    String       @id @default(cuid())
  universityId          String       @map("university_id")
  title                 String       @db.VarChar(200)
  field                 String       @db.VarChar(100)
  level                 ProgramLevel
  durationMonths        Int?         @map("duration_months")
  tuitionMinUSD         Int?         @map("tuition_min_usd")
  tuitionMaxUSD         Int?         @map("tuition_max_usd")
  description           String?      @db.Text
  sourceUrl             String?      @map("source_url") @db.Text
  applicationFeeUSD     Int?         @map("application_fee_usd")
  studyMode             String?      @map("study_mode") @db.VarChar(50)
  languageOfInstruction String?      @map("language_of_instruction") @db.VarChar(100)
  applicationPortalUrl  String?      @map("application_portal_url") @db.Text
  lastVerifiedAt        DateTime?    @map("last_verified_at") @db.Timestamp
  createdAt             DateTime     @default(now()) @map("created_at") @db.Timestamp
  updatedAt             DateTime     @updatedAt @map("updated_at") @db.Timestamp

  university   University           @relation(fields: [universityId], references: [id], onDelete: Cascade)
  requirements ProgramRequirement[]
  deadlines    ProgramDeadline[]
  savedBy      SavedProgram[]
  matchResults MatchResult[]

  @@unique([universityId, title, level])
  @@index([universityId])
  @@index([field])
  @@index([level])
  @@index([title])
  @@map("programs")
}

model ProgramRequirement {
  id        String   @id @default(cuid())
  programId String   @map("program_id")
  key       String   @db.VarChar(50)
  value     String   @db.VarChar(200)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  program Program @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@index([programId])
  @@map("program_requirements")
}

model ProgramDeadline {
  id        String   @id @default(cuid())
  programId String   @map("program_id")
  term      String   @db.VarChar(50)
  deadline  DateTime @db.Timestamp
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  program Program @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@index([programId])
  @@map("program_deadlines")
}

model SavedProgram {
  id        String   @id @default(cuid())
  userId    String   @map("user_id") @db.Uuid
  programId String   @map("program_id")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  program Program @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@unique([userId, programId])
  @@index([userId])
  @@index([programId])
  @@map("saved_programs")
}

// ============================================================
// MODULE 1: Match Runs & Results
// ============================================================

model MatchRun {
  id        String   @id @default(cuid())
  userId    String   @map("user_id") @db.Uuid
  status    String   @default("pending") @db.VarChar(20) // pending | running | done | error
  progress  Int      @default(0) // 0-100
  error     String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp

  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  results MatchResult[]

  @@index([userId, createdAt(sort: Desc)])
  @@index([status])
  @@map("match_runs")
}

// Cache metadata \u2014 prevents repeated scrapes for same (countries, major, level) within 24h
model DataSourceMeta {
  id            String   @id @default(cuid())
  cacheKey      String   @unique @map("cache_key") @db.VarChar(500)
  lastScrapedAt DateTime @map("last_scraped_at") @db.Timestamp
  parserVersion String   @default("1") @map("parser_version") @db.VarChar(20)
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamp

  @@map("data_source_meta")
}

// \u2500\u2500 SYNC JOBS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Tracks every data-sync execution for auditing, history, and health monitoring.
model SyncJob {
  id               String    @id @default(cuid())
  sourceKey        String    @map("source_key") @db.VarChar(100) // scholarships | programs | all
  status           String    @default("running") @db.VarChar(50) // running | success | partial_success | failed | cancelled
  triggerType      String    @map("trigger_type") @db.VarChar(50) // manual | cron | system
  triggeredBy      String?   @map("triggered_by") @db.VarChar(255)
  startedAt        DateTime  @map("started_at") @db.Timestamp
  finishedAt       DateTime? @map("finished_at") @db.Timestamp
  durationMs       Int?      @map("duration_ms")
  recordsProcessed Int       @default(0) @map("records_processed")
  recordsAdded     Int       @default(0) @map("records_added")
  recordsUpdated   Int       @default(0) @map("records_updated")
  recordsSkipped   Int       @default(0) @map("records_skipped")
  errorMessage     String?   @map("error_message") @db.Text
  summary          Json? // structured details per source (SourceResult[])
  rawLogs          String?   @map("raw_logs") @db.Text // newline-delimited structured log lines
  queueState       String?   @map("queue_state") @db.VarChar(50) // queued | running | done
  crawlerDetails   Json?     @map("crawler_details") // { taskId, preferences, programCountBefore, programCountAfter }
  stackTrace       String?   @map("stack_trace") @db.Text // unexpected error stack for debugging
  idempotencyKey   String?   @unique @map("idempotency_key") @db.VarChar(255)
  createdAt        DateTime  @default(now()) @map("created_at") @db.Timestamp

  @@index([sourceKey, status])
  @@index([createdAt])
  @@map("sync_jobs")
}

model MatchResult {
  id        String   @id @default(cuid())
  runId     String   @map("run_id")
  programId String?  @map("program_id") // null when program is AI-scraped, not yet in DB
  score     Float    @db.Real
  reasons   Json // string[]
  rawData   Json?    @map("raw_data") // scraped program data when no programId
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  run     MatchRun @relation(fields: [runId], references: [id], onDelete: Cascade)
  program Program? @relation(fields: [programId], references: [id], onDelete: SetNull)

  @@index([runId])
  @@index([programId])
  @@map("match_results")
}

// ============================================================
// MODULE 1: Timeline Planner & Strategy Generator
// ============================================================

model Scholarship {
  id          String        @id @default(cuid())
  title       String        @db.VarChar(300)
  provider    String?       @db.VarChar(200)
  countryCode String?       @map("country_code") @db.VarChar(10)
  level       ProgramLevel?
  field       String?       @db.VarChar(100)
  url         String?       @db.Text

  // Extended eligibility & display fields
  description           String?   @db.Text
  amount                String?   @db.VarChar(200) // e.g. "Full tuition + living allowance"
  fundingType           String?   @map("funding_type") @db.VarChar(50) // "full"|"partial"|"living"|"research"
  minGpa                Float?    @map("min_gpa") @db.Real
  requiresEnglishTest   Boolean   @default(false) @map("requires_english_test")
  financialNeedRequired Boolean   @default(false) @map("financial_need_required")
  eligibleNationalities Json?     @map("eligible_nationalities") // string[] \u2014 null means all nationalities
  tags                  Json? // string[]
  sourceUrl             String?   @map("source_url") @db.Text
  lastVerified          DateTime? @map("last_verified") @db.Timestamp
  isActive              Boolean   @default(true) @map("is_active")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp

  deadlines ScholarshipDeadline[]

  @@index([countryCode])
  @@index([level])
  @@index([isActive])
  @@map("scholarships")
}

model ScholarshipDeadline {
  id            String   @id @default(cuid())
  scholarshipId String   @map("scholarship_id")
  term          String?  @db.VarChar(50)
  deadline      DateTime @db.Timestamp
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamp

  scholarship Scholarship @relation(fields: [scholarshipId], references: [id], onDelete: Cascade)

  @@index([scholarshipId])
  @@index([deadline])
  @@map("scholarship_deadlines")
}

model VisaTimelineTemplate {
  id          String   @id @default(cuid())
  countryCode String   @unique @map("country_code") @db.VarChar(10)
  title       String   @db.VarChar(200)
  milestones  Json // [{key,label,offsetDays,notes}]
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamp

  @@map("visa_timeline_templates")
}

model UserRoadmap {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  countryCode String   @map("country_code") @db.VarChar(10)
  intake      String?  @db.VarChar(30)
  startMonth  String   @map("start_month") @db.VarChar(7) // "YYYY-MM"
  endMonth    String   @map("end_month") @db.VarChar(7)
  plan        Json // [{month,label,items:[{type,title,description,date?}]}]
  sources     Json? // {programIds,scholarshipIds,visaTemplateId}
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamp

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([countryCode])
  @@map("user_roadmaps")
}

model StrategyReport {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  countryCode String   @map("country_code") @db.VarChar(10)
  intake      String?  @db.VarChar(30)
  programIds  Json?    @map("program_ids")
  cacheKey    String   @map("cache_key") @db.VarChar(600)
  report      Json // structured {summary,whyThisCountryFits,admissionChances,riskAssessment,...}
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamp

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([countryCode])
  @@index([cacheKey])
  @@map("strategy_reports")
}

// \u2500\u2500 SCHOLARSHIP DEADLINE ALERT LOG \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Tracks which alerts have been dispatched to prevent duplicates.
model ScholarshipAlertLog {
  id             String   @id @default(cuid())
  userId         String   @map("user_id") @db.Uuid
  scholarshipId  String   @map("scholarship_id")
  deadlineId     String   @map("deadline_id")
  daysBeforeSent Int      @map("days_before_sent") // e.g. 30, 14, 7, 1
  sentAt         DateTime @default(now()) @map("sent_at") @db.Timestamp
  channel        String   @default("email") @db.VarChar(20) // "email" | "in_app"

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deadlineId, daysBeforeSent, channel])
  @@index([userId])
  @@index([sentAt])
  @@map("scholarship_alert_logs")
}

// \u2500\u2500 SEARCH CACHE \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// PostgreSQL-backed cache for LLM query-rewrite + Serper search results.
// Cache key = SHA-256 of the normalized user query string.
model SearchCache {
  id        String   @id @default(cuid())
  key       String   @unique @db.VarChar(64) // SHA-256 hex (64 chars)
  query     String   @db.Text // original user query
  rewrites  Json // string[] \u2014 LLM-generated rewritten queries
  results   Json // SearchResult[] \u2014 {title,url,snippet}[]
  expiresAt DateTime @map("expires_at") @db.Timestamp
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp

  @@index([key])
  @@index([expiresAt])
  @@map("search_cache")
}

// \u2500\u2500 GAP FIX SESSIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Persists a user's gap analysis result, per-gap progress, improvements, and evidence.
model GapFixSession {
  id                String  @id @default(cuid())
  userId            String  @map("user_id") @db.Uuid
  result            Json // GapFixResultWithIds \u2014 recommendations include stable \`id\` fields
  gapStatuses       Json    @default("{}") @map("gap_statuses") // { [recId]: "not_started" | "in_progress" | "completed" | "skipped" }
  improvements      Json    @default("[]") // ImprovementEntry[]
  profileSnapshot   Json    @map("profile_snapshot") // key profile fields at time of analysis
  previousSessionId String? @map("previous_session_id") // set after re-analysis

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  evidences GapFixEvidence[]

  @@index([userId, createdAt(sort: Desc)])
  @@map("gap_fix_sessions")
}

// Evidence attached to a specific recommendation inside a session.
model GapFixEvidence {
  id                String    @id @default(cuid())
  sessionId         String    @map("session_id")
  userId            String    @map("user_id") @db.Uuid
  recId             String    @map("rec_id") @db.VarChar(100) // matches GapFixRecommendation.id
  type              String    @db.VarChar(50) // certificate | cv | sop | transcript | internship_letter | link | publication | other
  label             String    @db.VarChar(200)
  url               String?   @db.Text // for links / portfolio / GitHub
  fileName          String?   @map("file_name") @db.VarChar(255)
  fileSize          Int?      @map("file_size")
  // Status: pending (default) | verified | rejected (system-controlled verification states)
  status            String    @default("pending") @db.VarChar(20)
  uploadedAt        DateTime  @default(now()) @map("uploaded_at") @db.Timestamp
  // Verification fields
  verificationNotes String?   @map("verification_notes") @db.Text
  verifiedAt        DateTime? @map("verified_at") @db.Timestamp

  session GapFixSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@index([userId])
  @@map("gap_fix_evidences")
}

// \u2500\u2500 GAP FIX ITEMS (V2 \u2014 AI-verified, per-item scoring) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
model GapFixItem {
  id          String @id @default(cuid())
  userId      String @db.Uuid
  gapType     String @db.VarChar(100)
  title       String @db.VarChar(300)
  description String @db.Text
  priority    String @default("medium") @db.VarChar(20)

  status String @default("not_started") @db.VarChar(40)
  // Allowed: not_started | in_progress | pending_verification | completed | skipped

  evidenceText   String? @db.Text
  evidenceUrl    String? @db.Text
  pdfUrl         String? @db.Text
  pdfStoragePath String? @map("pdf_storage_path") @db.Text

  aiVerified   Boolean   @default(false)
  aiConfidence Float?
  aiFeedback   String?   @db.Text
  aiVerifiedAt DateTime?

  resourceLinks String? @db.Text // JSON array: [{title, url, description}]

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamp
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamp

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, status])
  @@map("gap_fix_items")
}

// \u2500\u2500 JOB FINDER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
enum JobType {
  PART_TIME
  FULL_TIME
  INTERNSHIP
  REMOTE
}

model JobSearch {
  id          String      @id @default(cuid())
  userId      String      @map("user_id") @db.Uuid
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  country     String      @db.VarChar(100)
  countryCode String      @default("") @map("country_code") @db.VarChar(2)
  city        String      @db.VarChar(100)
  jobType     JobType     @map("job_type")
  field       String      @db.VarChar(100)
  visaType    String?     @map("visa_type") @db.VarChar(100)
  cachedAt    DateTime?   @map("cached_at") @db.Timestamp
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamp
  updatedAt   DateTime    @default(now()) @updatedAt @map("updated_at") @db.Timestamp
  results     JobResult[]

  @@index([userId])
  @@index([updatedAt])
  @@map("job_searches")
}

model JobResult {
  id              String    @id @default(cuid())
  jobSearchId     String    @map("job_search_id")
  jobSearch       JobSearch @relation(fields: [jobSearchId], references: [id], onDelete: Cascade)
  title           String    @db.VarChar(255)
  company         String    @db.VarChar(255)
  companyLogo     String?   @map("company_logo") @db.Text
  location        String    @db.VarChar(255)
  jobType         JobType   @map("job_type")
  salary          String?   @db.VarChar(200)
  salaryMin       Float?    @map("salary_min")
  salaryMax       Float?    @map("salary_max")
  currency        String?   @db.VarChar(10)
  postedAt        String?   @map("posted_at") @db.VarChar(100)
  visaSponsorship String?   @map("visa_sponsorship") @db.Text
  applyUrl        String    @map("apply_url") @db.Text
  description     String?   @db.Text
  source          String    @db.VarChar(100)
  isRemote        Boolean   @default(false) @map("is_remote")
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamp

  @@index([jobSearchId])
  @@map("job_results")
}

// \u2500\u2500 STRATEGY ACTION TRACKING \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
model StrategyAction {
  id         String    @id @default(cuid())
  userId     String    @map("user_id") @db.Uuid
  strategyId String    @map("strategy_id") @db.VarChar(100)
  actionText String    @map("action_text") @db.Text
  status     String    @default("not_started") @db.VarChar(30)
  // Status: not_started | in_progress | pending_verification | completed | skipped
  evidence   String?   @db.Text
  verifiedAt DateTime? @map("verified_at") @db.Timestamp
  aiVerified Boolean   @default(false) @map("ai_verified")
  aiFeedback String?   @map("ai_feedback") @db.Text
  createdAt  DateTime  @default(now()) @map("created_at") @db.Timestamp
  updatedAt  DateTime  @updatedAt @map("updated_at") @db.Timestamp

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, strategyId])
  @@map("strategy_actions")
}

// \u2500\u2500 DATA FRESHNESS TRACKING \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Tracks when each data source was last synced and its current status.
model DataFreshness {
  id           String    @id @default(cuid())
  source       String    @unique @db.VarChar(100)
  lastSyncAt   DateTime  @default(now()) @map("last_sync_at") @db.Timestamp
  status       String    @default("success") @db.VarChar(50)
  recordCount  Int       @default(0) @map("record_count")
  details      String?   @db.Text
  errorMessage String?   @map("error_message") @db.Text
  nextSyncAt   DateTime? @map("next_sync_at") @db.Timestamp
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamp

  @@index([source])
  @@map("data_freshness")
}

// \u2500\u2500 GOOGLE OAUTH ONE-TIME CODES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
model OAuthCode {
  id           String   @id @default(cuid())
  codeHash     String   @unique @map("code_hash") @db.Text
  userId       String   @map("user_id") @db.Uuid
  accessToken  String   @map("access_token") @db.Text
  refreshToken String   @map("refresh_token") @db.Text
  expiresAt    DateTime @map("expires_at") @db.Timestamp
  createdAt    DateTime @default(now()) @map("created_at") @db.Timestamp

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("oauth_codes")
}
`,
      "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
      }
    };
    config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"passwordHash","kind":"scalar","type":"String","dbName":"password_hash"},{"name":"name","kind":"scalar","type":"String","dbName":"name"},{"name":"avatarUrl","kind":"scalar","type":"String","dbName":"avatar_url"},{"name":"emailVerified","kind":"scalar","type":"Boolean","dbName":"email_verified"},{"name":"isActive","kind":"scalar","type":"Boolean","dbName":"is_active"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deletedAt","kind":"scalar","type":"DateTime","dbName":"deleted_at"},{"name":"oauthProvider","kind":"scalar","type":"String","dbName":"oauth_provider"},{"name":"oauthId","kind":"scalar","type":"String","dbName":"oauth_id"},{"name":"failedLoginCount","kind":"scalar","type":"Int","dbName":"failed_login_count"},{"name":"lockoutUntil","kind":"scalar","type":"DateTime","dbName":"lockout_until"},{"name":"lastFailedLoginAt","kind":"scalar","type":"DateTime","dbName":"last_failed_login_at"},{"name":"profile","kind":"object","type":"UserProfile","relationName":"UserToUserProfile"},{"name":"refreshTokens","kind":"object","type":"RefreshToken","relationName":"RefreshTokenToUser"},{"name":"sessions","kind":"object","type":"UserSession","relationName":"UserToUserSession"},{"name":"passwordResetTokens","kind":"object","type":"PasswordResetToken","relationName":"PasswordResetTokenToUser"},{"name":"emailVerificationTokens","kind":"object","type":"EmailVerificationToken","relationName":"EmailVerificationTokenToUser"},{"name":"emailChangeTokens","kind":"object","type":"EmailChangeToken","relationName":"EmailChangeTokenToUser"},{"name":"savedPrograms","kind":"object","type":"SavedProgram","relationName":"SavedProgramToUser"},{"name":"oauthCodes","kind":"object","type":"OAuthCode","relationName":"OAuthCodeToUser"},{"name":"matchRuns","kind":"object","type":"MatchRun","relationName":"MatchRunToUser"},{"name":"roadmaps","kind":"object","type":"UserRoadmap","relationName":"UserToUserRoadmap"},{"name":"strategyReports","kind":"object","type":"StrategyReport","relationName":"StrategyReportToUser"},{"name":"scholarshipAlertLogs","kind":"object","type":"ScholarshipAlertLog","relationName":"ScholarshipAlertLogToUser"},{"name":"gapFixSessions","kind":"object","type":"GapFixSession","relationName":"GapFixSessionToUser"},{"name":"gapFixItems","kind":"object","type":"GapFixItem","relationName":"GapFixItemToUser"},{"name":"jobSearches","kind":"object","type":"JobSearch","relationName":"JobSearchToUser"},{"name":"strategyActions","kind":"object","type":"StrategyAction","relationName":"StrategyActionToUser"}],"dbName":"users"},"UserProfile":{"fields":[{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"targetCountry","kind":"scalar","type":"String","dbName":"target_country"},{"name":"level","kind":"scalar","type":"String"},{"name":"budgetRange","kind":"scalar","type":"String","dbName":"budget_range"},{"name":"intendedMajor","kind":"scalar","type":"String","dbName":"intended_major"},{"name":"gpa","kind":"scalar","type":"Float"},{"name":"testScores","kind":"scalar","type":"Json","dbName":"test_scores"},{"name":"onboardingDone","kind":"scalar","type":"Boolean","dbName":"onboarding_done"},{"name":"currentStage","kind":"scalar","type":"String","dbName":"current_stage"},{"name":"targetIntake","kind":"scalar","type":"String","dbName":"target_intake"},{"name":"targetCountries","kind":"scalar","type":"Json","dbName":"target_countries"},{"name":"intendedLevel","kind":"scalar","type":"String","dbName":"intended_level"},{"name":"currentInstitution","kind":"scalar","type":"String","dbName":"current_institution"},{"name":"majorOrTrack","kind":"scalar","type":"String","dbName":"major_or_track"},{"name":"gpaScale","kind":"scalar","type":"String","dbName":"gpa_scale"},{"name":"graduationYear","kind":"scalar","type":"Int","dbName":"graduation_year"},{"name":"backlogs","kind":"scalar","type":"Int"},{"name":"workExperienceMonths","kind":"scalar","type":"Int","dbName":"work_experience_months"},{"name":"englishTestType","kind":"scalar","type":"String","dbName":"english_test_type"},{"name":"englishScore","kind":"scalar","type":"Float","dbName":"english_score"},{"name":"gre","kind":"scalar","type":"Float"},{"name":"gmat","kind":"scalar","type":"Float"},{"name":"intendedAbroadMajor","kind":"scalar","type":"String","dbName":"intended_abroad_major"},{"name":"careerGoal","kind":"scalar","type":"String","dbName":"career_goal"},{"name":"researchInterest","kind":"scalar","type":"String","dbName":"research_interest"},{"name":"budgetCurrency","kind":"scalar","type":"String","dbName":"budget_currency"},{"name":"budgetMax","kind":"scalar","type":"Float","dbName":"budget_max"},{"name":"budgetAmountUSD","kind":"scalar","type":"Float","dbName":"budget_amount_usd"},{"name":"fundingNeed","kind":"scalar","type":"Boolean","dbName":"funding_need"},{"name":"preferredCities","kind":"scalar","type":"Json","dbName":"preferred_cities"},{"name":"priorities","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserProfile"}],"dbName":"user_profiles"},"RefreshToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"token","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"revokedAt","kind":"scalar","type":"DateTime","dbName":"revoked_at"},{"name":"ttlDays","kind":"scalar","type":"Int","dbName":"ttl_days"},{"name":"user","kind":"object","type":"User","relationName":"RefreshTokenToUser"}],"dbName":"refresh_tokens"},"PasswordResetToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"tokenHash","kind":"scalar","type":"String","dbName":"token_hash"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"usedAt","kind":"scalar","type":"DateTime","dbName":"used_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"PasswordResetTokenToUser"}],"dbName":"password_reset_tokens"},"EmailVerificationToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"tokenHash","kind":"scalar","type":"String","dbName":"token_hash"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"usedAt","kind":"scalar","type":"DateTime","dbName":"used_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"EmailVerificationTokenToUser"}],"dbName":"email_verification_tokens"},"EmailChangeToken":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"newEmail","kind":"scalar","type":"String","dbName":"new_email"},{"name":"tokenHash","kind":"scalar","type":"String","dbName":"token_hash"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"usedAt","kind":"scalar","type":"DateTime","dbName":"used_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"EmailChangeTokenToUser"}],"dbName":"email_change_tokens"},"UserSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"sessionId","kind":"scalar","type":"String","dbName":"session_id"},{"name":"userAgent","kind":"scalar","type":"String","dbName":"user_agent"},{"name":"ipAddress","kind":"scalar","type":"String","dbName":"ip_address"},{"name":"data","kind":"scalar","type":"String"},{"name":"lastActiveAt","kind":"scalar","type":"DateTime","dbName":"last_active_at"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserSession"}],"dbName":"user_sessions"},"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"action","kind":"scalar","type":"String"},{"name":"entityType","kind":"scalar","type":"String","dbName":"entity_type"},{"name":"entityId","kind":"scalar","type":"String","dbName":"entity_id"},{"name":"changes","kind":"scalar","type":"Json"},{"name":"ipAddress","kind":"scalar","type":"String","dbName":"ip_address"},{"name":"userAgent","kind":"scalar","type":"String","dbName":"user_agent"},{"name":"timestamp","kind":"scalar","type":"DateTime"}],"dbName":"audit_logs"},"Country":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"universities","kind":"object","type":"University","relationName":"CountryToUniversity"}],"dbName":"countries"},"University":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"countryId","kind":"scalar","type":"String","dbName":"country_id"},{"name":"city","kind":"scalar","type":"String"},{"name":"website","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"sourceUrl","kind":"scalar","type":"String","dbName":"source_url"},{"name":"ranking","kind":"scalar","type":"String"},{"name":"universityType","kind":"scalar","type":"String","dbName":"university_type"},{"name":"admissionsUrl","kind":"scalar","type":"String","dbName":"admissions_url"},{"name":"tuitionUrl","kind":"scalar","type":"String","dbName":"tuition_url"},{"name":"scholarshipsUrl","kind":"scalar","type":"String","dbName":"scholarships_url"},{"name":"internationalUrl","kind":"scalar","type":"String","dbName":"international_url"},{"name":"applicationPortalUrl","kind":"scalar","type":"String","dbName":"application_portal_url"},{"name":"lastVerifiedAt","kind":"scalar","type":"DateTime","dbName":"last_verified_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"country","kind":"object","type":"Country","relationName":"CountryToUniversity"},{"name":"programs","kind":"object","type":"Program","relationName":"ProgramToUniversity"}],"dbName":"universities"},"Program":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"universityId","kind":"scalar","type":"String","dbName":"university_id"},{"name":"title","kind":"scalar","type":"String"},{"name":"field","kind":"scalar","type":"String"},{"name":"level","kind":"enum","type":"ProgramLevel"},{"name":"durationMonths","kind":"scalar","type":"Int","dbName":"duration_months"},{"name":"tuitionMinUSD","kind":"scalar","type":"Int","dbName":"tuition_min_usd"},{"name":"tuitionMaxUSD","kind":"scalar","type":"Int","dbName":"tuition_max_usd"},{"name":"description","kind":"scalar","type":"String"},{"name":"sourceUrl","kind":"scalar","type":"String","dbName":"source_url"},{"name":"applicationFeeUSD","kind":"scalar","type":"Int","dbName":"application_fee_usd"},{"name":"studyMode","kind":"scalar","type":"String","dbName":"study_mode"},{"name":"languageOfInstruction","kind":"scalar","type":"String","dbName":"language_of_instruction"},{"name":"applicationPortalUrl","kind":"scalar","type":"String","dbName":"application_portal_url"},{"name":"lastVerifiedAt","kind":"scalar","type":"DateTime","dbName":"last_verified_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"university","kind":"object","type":"University","relationName":"ProgramToUniversity"},{"name":"requirements","kind":"object","type":"ProgramRequirement","relationName":"ProgramToProgramRequirement"},{"name":"deadlines","kind":"object","type":"ProgramDeadline","relationName":"ProgramToProgramDeadline"},{"name":"savedBy","kind":"object","type":"SavedProgram","relationName":"ProgramToSavedProgram"},{"name":"matchResults","kind":"object","type":"MatchResult","relationName":"MatchResultToProgram"}],"dbName":"programs"},"ProgramRequirement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"programId","kind":"scalar","type":"String","dbName":"program_id"},{"name":"key","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"program","kind":"object","type":"Program","relationName":"ProgramToProgramRequirement"}],"dbName":"program_requirements"},"ProgramDeadline":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"programId","kind":"scalar","type":"String","dbName":"program_id"},{"name":"term","kind":"scalar","type":"String"},{"name":"deadline","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"program","kind":"object","type":"Program","relationName":"ProgramToProgramDeadline"}],"dbName":"program_deadlines"},"SavedProgram":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"programId","kind":"scalar","type":"String","dbName":"program_id"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"SavedProgramToUser"},{"name":"program","kind":"object","type":"Program","relationName":"ProgramToSavedProgram"}],"dbName":"saved_programs"},"MatchRun":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"status","kind":"scalar","type":"String"},{"name":"progress","kind":"scalar","type":"Int"},{"name":"error","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"MatchRunToUser"},{"name":"results","kind":"object","type":"MatchResult","relationName":"MatchResultToMatchRun"}],"dbName":"match_runs"},"DataSourceMeta":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"cacheKey","kind":"scalar","type":"String","dbName":"cache_key"},{"name":"lastScrapedAt","kind":"scalar","type":"DateTime","dbName":"last_scraped_at"},{"name":"parserVersion","kind":"scalar","type":"String","dbName":"parser_version"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"data_source_meta"},"SyncJob":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sourceKey","kind":"scalar","type":"String","dbName":"source_key"},{"name":"status","kind":"scalar","type":"String"},{"name":"triggerType","kind":"scalar","type":"String","dbName":"trigger_type"},{"name":"triggeredBy","kind":"scalar","type":"String","dbName":"triggered_by"},{"name":"startedAt","kind":"scalar","type":"DateTime","dbName":"started_at"},{"name":"finishedAt","kind":"scalar","type":"DateTime","dbName":"finished_at"},{"name":"durationMs","kind":"scalar","type":"Int","dbName":"duration_ms"},{"name":"recordsProcessed","kind":"scalar","type":"Int","dbName":"records_processed"},{"name":"recordsAdded","kind":"scalar","type":"Int","dbName":"records_added"},{"name":"recordsUpdated","kind":"scalar","type":"Int","dbName":"records_updated"},{"name":"recordsSkipped","kind":"scalar","type":"Int","dbName":"records_skipped"},{"name":"errorMessage","kind":"scalar","type":"String","dbName":"error_message"},{"name":"summary","kind":"scalar","type":"Json"},{"name":"rawLogs","kind":"scalar","type":"String","dbName":"raw_logs"},{"name":"queueState","kind":"scalar","type":"String","dbName":"queue_state"},{"name":"crawlerDetails","kind":"scalar","type":"Json","dbName":"crawler_details"},{"name":"stackTrace","kind":"scalar","type":"String","dbName":"stack_trace"},{"name":"idempotencyKey","kind":"scalar","type":"String","dbName":"idempotency_key"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"}],"dbName":"sync_jobs"},"MatchResult":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"runId","kind":"scalar","type":"String","dbName":"run_id"},{"name":"programId","kind":"scalar","type":"String","dbName":"program_id"},{"name":"score","kind":"scalar","type":"Float"},{"name":"reasons","kind":"scalar","type":"Json"},{"name":"rawData","kind":"scalar","type":"Json","dbName":"raw_data"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"run","kind":"object","type":"MatchRun","relationName":"MatchResultToMatchRun"},{"name":"program","kind":"object","type":"Program","relationName":"MatchResultToProgram"}],"dbName":"match_results"},"Scholarship":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"provider","kind":"scalar","type":"String"},{"name":"countryCode","kind":"scalar","type":"String","dbName":"country_code"},{"name":"level","kind":"enum","type":"ProgramLevel"},{"name":"field","kind":"scalar","type":"String"},{"name":"url","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"String"},{"name":"fundingType","kind":"scalar","type":"String","dbName":"funding_type"},{"name":"minGpa","kind":"scalar","type":"Float","dbName":"min_gpa"},{"name":"requiresEnglishTest","kind":"scalar","type":"Boolean","dbName":"requires_english_test"},{"name":"financialNeedRequired","kind":"scalar","type":"Boolean","dbName":"financial_need_required"},{"name":"eligibleNationalities","kind":"scalar","type":"Json","dbName":"eligible_nationalities"},{"name":"tags","kind":"scalar","type":"Json"},{"name":"sourceUrl","kind":"scalar","type":"String","dbName":"source_url"},{"name":"lastVerified","kind":"scalar","type":"DateTime","dbName":"last_verified"},{"name":"isActive","kind":"scalar","type":"Boolean","dbName":"is_active"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"deadlines","kind":"object","type":"ScholarshipDeadline","relationName":"ScholarshipToScholarshipDeadline"}],"dbName":"scholarships"},"ScholarshipDeadline":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"scholarshipId","kind":"scalar","type":"String","dbName":"scholarship_id"},{"name":"term","kind":"scalar","type":"String"},{"name":"deadline","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"scholarship","kind":"object","type":"Scholarship","relationName":"ScholarshipToScholarshipDeadline"}],"dbName":"scholarship_deadlines"},"VisaTimelineTemplate":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"countryCode","kind":"scalar","type":"String","dbName":"country_code"},{"name":"title","kind":"scalar","type":"String"},{"name":"milestones","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"visa_timeline_templates"},"UserRoadmap":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"countryCode","kind":"scalar","type":"String","dbName":"country_code"},{"name":"intake","kind":"scalar","type":"String"},{"name":"startMonth","kind":"scalar","type":"String","dbName":"start_month"},{"name":"endMonth","kind":"scalar","type":"String","dbName":"end_month"},{"name":"plan","kind":"scalar","type":"Json"},{"name":"sources","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserRoadmap"}],"dbName":"user_roadmaps"},"StrategyReport":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"countryCode","kind":"scalar","type":"String","dbName":"country_code"},{"name":"intake","kind":"scalar","type":"String"},{"name":"programIds","kind":"scalar","type":"Json","dbName":"program_ids"},{"name":"cacheKey","kind":"scalar","type":"String","dbName":"cache_key"},{"name":"report","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"StrategyReportToUser"}],"dbName":"strategy_reports"},"ScholarshipAlertLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"scholarshipId","kind":"scalar","type":"String","dbName":"scholarship_id"},{"name":"deadlineId","kind":"scalar","type":"String","dbName":"deadline_id"},{"name":"daysBeforeSent","kind":"scalar","type":"Int","dbName":"days_before_sent"},{"name":"sentAt","kind":"scalar","type":"DateTime","dbName":"sent_at"},{"name":"channel","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ScholarshipAlertLogToUser"}],"dbName":"scholarship_alert_logs"},"SearchCache":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"key","kind":"scalar","type":"String"},{"name":"query","kind":"scalar","type":"String"},{"name":"rewrites","kind":"scalar","type":"Json"},{"name":"results","kind":"scalar","type":"Json"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"}],"dbName":"search_cache"},"GapFixSession":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"result","kind":"scalar","type":"Json"},{"name":"gapStatuses","kind":"scalar","type":"Json","dbName":"gap_statuses"},{"name":"improvements","kind":"scalar","type":"Json"},{"name":"profileSnapshot","kind":"scalar","type":"Json","dbName":"profile_snapshot"},{"name":"previousSessionId","kind":"scalar","type":"String","dbName":"previous_session_id"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"GapFixSessionToUser"},{"name":"evidences","kind":"object","type":"GapFixEvidence","relationName":"GapFixEvidenceToGapFixSession"}],"dbName":"gap_fix_sessions"},"GapFixEvidence":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String","dbName":"session_id"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"recId","kind":"scalar","type":"String","dbName":"rec_id"},{"name":"type","kind":"scalar","type":"String"},{"name":"label","kind":"scalar","type":"String"},{"name":"url","kind":"scalar","type":"String"},{"name":"fileName","kind":"scalar","type":"String","dbName":"file_name"},{"name":"fileSize","kind":"scalar","type":"Int","dbName":"file_size"},{"name":"status","kind":"scalar","type":"String"},{"name":"uploadedAt","kind":"scalar","type":"DateTime","dbName":"uploaded_at"},{"name":"verificationNotes","kind":"scalar","type":"String","dbName":"verification_notes"},{"name":"verifiedAt","kind":"scalar","type":"DateTime","dbName":"verified_at"},{"name":"session","kind":"object","type":"GapFixSession","relationName":"GapFixEvidenceToGapFixSession"}],"dbName":"gap_fix_evidences"},"GapFixItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"gapType","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"priority","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"evidenceText","kind":"scalar","type":"String"},{"name":"evidenceUrl","kind":"scalar","type":"String"},{"name":"pdfUrl","kind":"scalar","type":"String"},{"name":"pdfStoragePath","kind":"scalar","type":"String","dbName":"pdf_storage_path"},{"name":"aiVerified","kind":"scalar","type":"Boolean"},{"name":"aiConfidence","kind":"scalar","type":"Float"},{"name":"aiFeedback","kind":"scalar","type":"String"},{"name":"aiVerifiedAt","kind":"scalar","type":"DateTime"},{"name":"resourceLinks","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"GapFixItemToUser"}],"dbName":"gap_fix_items"},"JobSearch":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"user","kind":"object","type":"User","relationName":"JobSearchToUser"},{"name":"country","kind":"scalar","type":"String"},{"name":"countryCode","kind":"scalar","type":"String","dbName":"country_code"},{"name":"city","kind":"scalar","type":"String"},{"name":"jobType","kind":"enum","type":"JobType","dbName":"job_type"},{"name":"field","kind":"scalar","type":"String"},{"name":"visaType","kind":"scalar","type":"String","dbName":"visa_type"},{"name":"cachedAt","kind":"scalar","type":"DateTime","dbName":"cached_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"results","kind":"object","type":"JobResult","relationName":"JobResultToJobSearch"}],"dbName":"job_searches"},"JobResult":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"jobSearchId","kind":"scalar","type":"String","dbName":"job_search_id"},{"name":"jobSearch","kind":"object","type":"JobSearch","relationName":"JobResultToJobSearch"},{"name":"title","kind":"scalar","type":"String"},{"name":"company","kind":"scalar","type":"String"},{"name":"companyLogo","kind":"scalar","type":"String","dbName":"company_logo"},{"name":"location","kind":"scalar","type":"String"},{"name":"jobType","kind":"enum","type":"JobType","dbName":"job_type"},{"name":"salary","kind":"scalar","type":"String"},{"name":"salaryMin","kind":"scalar","type":"Float","dbName":"salary_min"},{"name":"salaryMax","kind":"scalar","type":"Float","dbName":"salary_max"},{"name":"currency","kind":"scalar","type":"String"},{"name":"postedAt","kind":"scalar","type":"String","dbName":"posted_at"},{"name":"visaSponsorship","kind":"scalar","type":"String","dbName":"visa_sponsorship"},{"name":"applyUrl","kind":"scalar","type":"String","dbName":"apply_url"},{"name":"description","kind":"scalar","type":"String"},{"name":"source","kind":"scalar","type":"String"},{"name":"isRemote","kind":"scalar","type":"Boolean","dbName":"is_remote"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"}],"dbName":"job_results"},"StrategyAction":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"strategyId","kind":"scalar","type":"String","dbName":"strategy_id"},{"name":"actionText","kind":"scalar","type":"String","dbName":"action_text"},{"name":"status","kind":"scalar","type":"String"},{"name":"evidence","kind":"scalar","type":"String"},{"name":"verifiedAt","kind":"scalar","type":"DateTime","dbName":"verified_at"},{"name":"aiVerified","kind":"scalar","type":"Boolean","dbName":"ai_verified"},{"name":"aiFeedback","kind":"scalar","type":"String","dbName":"ai_feedback"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"StrategyActionToUser"}],"dbName":"strategy_actions"},"DataFreshness":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"source","kind":"scalar","type":"String"},{"name":"lastSyncAt","kind":"scalar","type":"DateTime","dbName":"last_sync_at"},{"name":"status","kind":"scalar","type":"String"},{"name":"recordCount","kind":"scalar","type":"Int","dbName":"record_count"},{"name":"details","kind":"scalar","type":"String"},{"name":"errorMessage","kind":"scalar","type":"String","dbName":"error_message"},{"name":"nextSyncAt","kind":"scalar","type":"DateTime","dbName":"next_sync_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"data_freshness"},"OAuthCode":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"codeHash","kind":"scalar","type":"String","dbName":"code_hash"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"accessToken","kind":"scalar","type":"String","dbName":"access_token"},{"name":"refreshToken","kind":"scalar","type":"String","dbName":"refresh_token"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"OAuthCodeToUser"}],"dbName":"oauth_codes"}},"enums":{},"types":{}}');
    config.compilerWasm = {
      getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
      getQueryCompilerWasmModule: async () => {
        const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
        return await decodeBase64AsWasm(wasm);
      },
      importName: "./query_compiler_fast_bg.js"
    };
  }
});

// src/generated/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext, NullTypes2, TransactionIsolationLevel, defineExtension;
var init_prismaNamespace = __esm({
  "src/generated/internal/prismaNamespace.ts"() {
    "use strict";
    getExtensionContext = runtime2.Extensions.getExtensionContext;
    NullTypes2 = {
      DbNull: runtime2.NullTypes.DbNull,
      JsonNull: runtime2.NullTypes.JsonNull,
      AnyNull: runtime2.NullTypes.AnyNull
    };
    TransactionIsolationLevel = runtime2.makeStrictEnum({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    defineExtension = runtime2.Extensions.defineExtension;
  }
});

// src/generated/enums.ts
var ProgramLevel;
var init_enums = __esm({
  "src/generated/enums.ts"() {
    "use strict";
    ProgramLevel = {
      BSC: "BSC",
      MSC: "MSC",
      PHD: "PHD"
    };
  }
});

// src/generated/client.ts
import * as path3 from "node:path";
import { fileURLToPath } from "node:url";
var PrismaClient;
var init_client = __esm({
  "src/generated/client.ts"() {
    "use strict";
    init_class();
    init_prismaNamespace();
    init_enums();
    init_enums();
    globalThis["__dirname"] = path3.dirname(fileURLToPath(import.meta.url));
    PrismaClient = getPrismaClientClass();
  }
});

// src/config/database.ts
var database_exports = {};
__export(database_exports, {
  default: () => database_default
});
import { PrismaPg } from "@prisma/adapter-pg";
function resolveConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (node_env === "development") {
    const url2 = process.env.DATABASE_URL_LOCAL;
    if (!url2) throw new Error("DATABASE_URL_LOCAL is required when NODE_ENV=development");
    return url2;
  }
  const url = process.env.DATABASE_URL_CLOUD;
  if (!url) throw new Error("DATABASE_URL_CLOUD is required in non-development environments");
  return url;
}
var node_env, connectionString, dbHost, adapter, prisma, database_default;
var init_database = __esm({
  "src/config/database.ts"() {
    "use strict";
    init_client();
    node_env = process.env.NODE_ENV;
    connectionString = resolveConnectionString();
    dbHost = (() => {
      try {
        return new URL(connectionString).hostname;
      } catch {
        return "<unparseable>";
      }
    })();
    console.log(`[db] connecting to host=${dbHost} NODE_ENV=${node_env ?? "unset"}`);
    adapter = new PrismaPg({
      connectionString,
      // Keep connections alive across the process
      // Prevents "Error { kind: Closed }" on long-running background jobs
      keepAlive: true,
      keepAliveInitialDelayMillis: 1e4,
      idleTimeoutMillis: 6e4,
      // Release unused connections after 60s
      connectionTimeoutMillis: 1e4,
      // Fail fast if can't acquire connection
      max: 5
      // Max 5 connections (reasonable for serverless)
    });
    prisma = new PrismaClient({ adapter });
    database_default = prisma;
  }
});

// src/config/arcjet.ts
var arcjet_exports = {};
__export(arcjet_exports, {
  default: () => arcjet_default
});
import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
var ajKey, aj, arcjet_default;
var init_arcjet = __esm({
  "src/config/arcjet.ts"() {
    "use strict";
    ajKey = process.env.ARCJET_KEY;
    if (!ajKey) {
      throw new Error("ARCJET_KEY environment variable is required");
    }
    aj = arcjet({
      key: ajKey,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"]
        }),
        slidingWindow({
          mode: "LIVE",
          interval: "2s",
          max: 5
        })
      ]
    });
    arcjet_default = aj;
  }
});

// src/vercel.ts
import "dotenv/config";

// src/app.ts
import express from "express";

// src/config/logger.ts
import fs from "node:fs";
import path2 from "node:path";
import winston from "winston";

// src/config/paths.ts
import os from "node:os";
import path from "node:path";
function getGapFixUploadDir() {
  const envDir = process.env.GAPFIX_UPLOAD_DIR || process.env.UPLOAD_DIR;
  if (envDir) return envDir;
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "educai", "uploads", "gap-fix");
  }
  return path.join(process.cwd(), "uploads", "gap-fix");
}
function getLogDir() {
  return process.env.LOG_DIR || path.join(os.tmpdir(), "educai", "logs");
}

// src/config/logger.ts
var enableFileLogging = process.env.ENABLE_FILE_LOGGING === "true";
var logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "acquisition-api" },
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"]
    })
  ]
});
if (enableFileLogging) {
  const logDir = getLogDir();
  fs.mkdirSync(logDir, { recursive: true });
  logger.add(
    new winston.transports.File({
      filename: path2.join(logDir, "error.log"),
      level: "error"
    })
  );
  logger.add(
    new winston.transports.File({
      filename: path2.join(logDir, "combined.log")
    })
  );
}
var logger_default = logger;

// src/app.ts
init_database();
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport3 from "passport";

// src/utils/jwt/tokens.ts
import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
var ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
var REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_JWT_SECRET);
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}
var ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "5m";
var REFRESH_EXPIRES_IN = process.env.REFRESH_JWT_EXPIRES_IN || "15d";
var generateTokens = async (userId, opts) => {
  const refreshExpiry = opts?.refreshTtlDays ? `${opts.refreshTtlDays}d` : REFRESH_EXPIRES_IN;
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(userId),
    generateRefreshToken(userId, refreshExpiry)
  ]);
  return { accessToken, refreshToken };
};
var generateAccessToken = (userId) => {
  return new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(ACCESS_EXPIRES_IN).sign(ACCESS_SECRET);
};
var verifyAccessToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload.userId;
  } catch (error) {
    return null;
  }
};
var generateRefreshToken = (userId, expiresIn = REFRESH_EXPIRES_IN) => {
  return new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresIn).sign(REFRESH_SECRET);
};
var verifyRefreshToken = async (token) => {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload?.userId || null;
  } catch (error) {
    return null;
  }
};
var clearTokens = (res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("accessToken");
};
var saveToCookie = async (res, refreshToken, accessToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "strict"
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.COOKIE_SAME_SITE || "strict"
  });
};
function hashTokenCrypto(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// src/services/user.service.ts
init_database();
async function findUserByEmail(email) {
  try {
    const user2 = await database_default.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    return user2;
  } catch (err) {
    console.error("User Not Found:", err);
    throw err;
  }
}
async function findUserById(id) {
  try {
    const user2 = await database_default.user.findUnique({
      where: { id }
    });
    return user2;
  } catch (err) {
    console.error("User Not Found:", err);
    throw err;
  }
}
async function createUser(data) {
  try {
    const { email, name, passwordHash, avatarUrl } = data;
    const user2 = await database_default.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        avatarUrl
      }
    });
    const newUser = {
      id: user2.id,
      email: user2.email,
      name: user2.name,
      avatar: user2.avatarUrl || void 0,
      emailVerified: user2.emailVerified,
      isActive: user2.isActive
    };
    return newUser;
  } catch (err) {
    console.error("Error in creating user:", err);
    throw err;
  }
}
async function updateUserPassword(userId, passwordHash) {
  try {
    await database_default.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  } catch (err) {
    console.error("Error updating user password:", err);
    throw err;
  }
}
async function incrementFailedLogin(userId) {
  const user2 = await database_default.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: { increment: 1 },
      lastFailedLoginAt: /* @__PURE__ */ new Date()
    }
  });
  if (user2.failedLoginCount >= 5) {
    await database_default.user.update({
      where: { id: userId },
      data: {
        lockoutUntil: new Date(Date.now() + 10 * 60 * 1e3),
        failedLoginCount: 0
      }
    });
  }
}
async function resetFailedLogin(userId) {
  await database_default.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockoutUntil: null
    }
  });
}

// src/middlewares/authenticate.ts
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const userid = await verifyAccessToken(token);
    if (!userid || typeof userid !== "string") {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    const user2 = await findUserById(userid);
    if (!user2 || !user2.isActive) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }
    req.userId = userid;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// src/routes/auth.router.ts
import { Router } from "express";

// src/utils/exchangeRates.ts
var FALLBACK_RATES_TO_USD = {
  USD: 1,
  EUR: 1.09,
  GBP: 1.27,
  CAD: 0.73,
  AUD: 0.65,
  SGD: 0.74,
  INR: 0.012,
  BDT: 83e-4,
  SEK: 0.096
};
function toUSD(amount, currency) {
  const rate = FALLBACK_RATES_TO_USD[currency.toUpperCase()];
  if (rate == null) return null;
  return Math.round(amount * rate);
}

// src/controllers/auth.controller.ts
import crypto2 from "crypto";
import passport2 from "passport";

// src/config/google.config.ts
init_database();
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import passport from "passport";

// src/services/google.service.ts
init_database();
async function CreateGoogleUser(profile) {
  try {
    const user2 = await database_default.user.create({
      data: {
        email: profile.emails[0].value.toLowerCase(),
        name: profile.displayName,
        avatarUrl: profile.photos[0].value,
        passwordHash: null,
        isActive: true,
        emailVerified: true,
        oauthProvider: "google",
        oauthId: profile.id
      }
    });
    return user2;
  } catch (err) {
    console.error("Error in creating user:", err);
    throw err;
  }
}

// src/config/google.config.ts
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/auth/google/callback";
var GOOGLE_OAUTH_ENABLED = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
if (!GOOGLE_OAUTH_ENABLED) {
  console.warn(
    "[google.config] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set \u2014 Google OAuth disabled"
  );
}
if (GOOGLE_OAUTH_ENABLED) passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new Error("No email returned from Google."), null);
        }
        let user2 = await findUserByEmail(email);
        if (user2) {
          if (user2.oauthProvider === "google") {
            if (!user2.oauthId) {
              user2 = await database_default.user.update({
                where: { id: user2.id },
                data: { oauthId: profile.id }
              });
            } else if (user2.oauthId !== profile.id) {
              console.warn(
                `[google.config] oauthId mismatch for user ${user2.id}: stored="${user2.oauthId}" vs profile="${profile.id}". Keeping stored value.`
              );
            }
            return done(null, user2);
          } else if (!user2.oauthProvider) {
            const updatedUser = await database_default.user.update({
              where: { id: user2.id },
              data: {
                oauthProvider: "google",
                oauthId: profile.id,
                emailVerified: true,
                avatarUrl: user2.avatarUrl || profile.photos?.[0]?.value || null,
                name: user2.name || profile.displayName || null
              }
            });
            return done(null, updatedUser);
          } else {
            return done(
              new Error(
                "Account exists with another provider. Use that method."
              ),
              null
            );
          }
        } else {
          user2 = await CreateGoogleUser(profile);
          return done(null, user2);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
passport.serializeUser((user2, done) => {
  done(null, user2.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user2 = await findUserById(id);
    done(null, user2);
  } catch (err) {
    done(err, null);
  }
});

// src/services/token.service.ts
init_database();
var DEFAULT_REFRESH_TTL_DAYS = 15;
async function saveRefreshToken(userId, refreshToken, ttlDays = DEFAULT_REFRESH_TTL_DAYS) {
  try {
    await database_default.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1e3),
        ttlDays
      }
    });
  } catch (err) {
    console.error("Error in saving refresh token:", err);
    throw err;
  }
}
async function findRefreshToken(token) {
  try {
    const refreshToken = await database_default.refreshToken.findUnique({
      where: { token }
    });
    return refreshToken;
  } catch (err) {
    console.error("Refresh Token Not Found:", err);
    throw err;
  }
}
async function deleteRefreshToken(token) {
  try {
    await database_default.refreshToken.deleteMany({ where: { token } });
  } catch (err) {
    console.error("Error in deleting refresh token:", err);
    throw err;
  }
}
async function deleteUserRefreshTokens(userId) {
  try {
    await database_default.refreshToken.deleteMany({ where: { userId } });
  } catch (err) {
    console.error("Error in deleting user refresh tokens:", err);
    throw err;
  }
}

// src/services/passwordReset.service.ts
init_database();
async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  try {
    return await database_default.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    });
  } catch (err) {
    console.error("Error creating password reset token:", err);
    throw err;
  }
}
async function findPasswordResetToken(tokenHash) {
  try {
    return await database_default.passwordResetToken.findUnique({
      where: { tokenHash }
    });
  } catch (err) {
    console.error("Error finding password reset token:", err);
    throw err;
  }
}
async function markPasswordResetTokenUsed(tokenId) {
  try {
    return await database_default.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: /* @__PURE__ */ new Date() }
    });
  } catch (err) {
    console.error("Error marking password reset token as used:", err);
    throw err;
  }
}

// src/config/nodemailer.config.ts
import nodemailer from "nodemailer";
var host = process.env.SMTP_HOST;
var port = parseInt(process.env.SMTP_PORT || "587", 10);
var secure = process.env.SMTP_SECURE === "true";
var user = process.env.SMTP_USER || process.env.EMAIL_USER;
var pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
var frontendUrl = process.env.FRONTEND_URL;
var emailFrom = process.env.EMAIL_FROM;
var EMAIL_CONFIGURED = false;
var transporter;
console.log("\n[nodemailer] Email configuration status:");
console.log(`  SMTP provider configured: ${!!(host && user && pass) || !!(user && pass) ? "yes" : "no"}`);
console.log(`  SMTP host: ${host || "(not set)"}`);
console.log(`  SMTP port: ${port}`);
console.log(`  SMTP secure: ${secure}`);
console.log(`  SMTP user: ${user || "(not set)"}`);
console.log(`  SMTP_PASS configured: ${!!pass ? "yes" : "no"}`);
console.log(`  EMAIL_FROM: ${emailFrom || "(not set)"}`);
console.log(`  FRONTEND_URL: ${frontendUrl || "(not set)"}`);
console.log(`  Timeouts: connection=10s, greeting=10s, socket=15s`);
var IS_PRODUCTION = process.env.NODE_ENV === "production";
if (IS_PRODUCTION) {
  const missingVars = [];
  if (!host) missingVars.push("SMTP_HOST");
  if (!user) missingVars.push("SMTP_USER");
  if (!pass) missingVars.push("SMTP_PASS");
  if (!emailFrom) missingVars.push("EMAIL_FROM");
  if (!frontendUrl) missingVars.push("FRONTEND_URL");
  if (missingVars.length > 0) {
    console.error(`[nodemailer] \u26A0\uFE0F  PRODUCTION ERROR: Missing required environment variables: ${missingVars.join(", ")}`);
    console.error("[nodemailer] Email verification will fail. Signup and password reset will not work.");
  }
}
if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    // false for port 587 (STARTTLS), true for 465 (SSL)
    auth: { user, pass },
    family: 4,
    // Force IPv4 — Render free tier has no outbound IPv6
    connectionTimeout: 1e4,
    greetingTimeout: 1e4,
    socketTimeout: 15e3
  });
  EMAIL_CONFIGURED = true;
  console.log(`[nodemailer] \u2713 Using custom SMTP: ${host}:${port} (user=${user})
`);
} else if (user && pass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    family: 4,
    // Force IPv4 — Render free tier has no outbound IPv6
    connectionTimeout: 1e4,
    greetingTimeout: 1e4,
    socketTimeout: 15e3
  });
  EMAIL_CONFIGURED = true;
  console.log("[nodemailer] \u2713 Using Gmail service transport\n");
} else {
  console.warn(
    "[nodemailer] \u26A0  No SMTP credentials found (SMTP_HOST + SMTP_USER + SMTP_PASS). Email sending is DISABLED. Set EMAIL_PROVIDER=console to suppress this in development.\n"
  );
  transporter = nodemailer.createTransport({ jsonTransport: true });
}
var EMAIL_FROM = emailFrom || `EducAI <${user || "noreply@example.com"}>`;
var nodemailer_config_default = transporter;

// src/services/email.service.ts
var EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "smtp";
var IS_DEV = process.env.NODE_ENV !== "production";
async function sendMail(opts, action) {
  const startTime = Date.now();
  if (EMAIL_PROVIDER === "console") {
    console.log(`
[EMAIL \u2192 ${opts.to}] ${opts.subject}
${opts.text}
`);
    const durationMs = Date.now() - startTime;
    return { success: true, provider: "console", messageId: "console-log", durationMs };
  }
  if (!EMAIL_CONFIGURED) {
    const msg = "SMTP not configured \u2014 set SMTP_HOST, SMTP_USER, SMTP_PASS in environment";
    const durationMs = Date.now() - startTime;
    console.error(`[email] ${msg} | action: ${action || "send"} | recipient: ${opts.to} | duration: ${durationMs}ms`);
    if (IS_DEV) {
      console.log(`
[EMAIL (no-creds dev fallback) \u2192 ${opts.to}] ${opts.subject}
${opts.text}
`);
      return { success: true, provider: "console-fallback", messageId: "no-creds-dev", error: msg, durationMs };
    }
    return { success: false, provider: "none", error: msg, durationMs };
  }
  try {
    const info = await nodemailer_config_default.sendMail({ from: EMAIL_FROM, ...opts });
    const durationMs = Date.now() - startTime;
    console.log(
      `[email] \u2713 Sent successfully | action: ${action || "send"} | recipient: ${opts.to} | subject: "${opts.subject}" | provider: ${EMAIL_PROVIDER} | messageId: ${info.messageId} | duration: ${durationMs}ms`
    );
    return { success: true, provider: EMAIL_PROVIDER, messageId: info.messageId, durationMs };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const error = err;
    const errorName = error.name || "Error";
    const errorMessage = error.message;
    const errorCode = error.code;
    console.error(
      `[email] \u2717 Failed to send | action: ${action || "send"} | recipient: ${opts.to} | subject: "${opts.subject}" | provider: ${EMAIL_PROVIDER} | error: ${errorName}${errorCode ? ` (${errorCode})` : ""} - ${errorMessage} | duration: ${durationMs}ms`
    );
    let userMessage = errorMessage;
    if (errorCode === "ETIMEDOUT") {
      userMessage = "Email service timeout. Please try again later.";
    } else if (errorCode === "ECONNREFUSED") {
      userMessage = "Unable to connect to email service. Please try again later.";
    } else if (errorCode === "EAUTH" || errorCode === "ENOTFOUND") {
      userMessage = "Email service configuration error. Please contact support.";
    }
    if (IS_DEV) {
      console.log(`
[EMAIL (SMTP error fallback) \u2192 ${opts.to}] ${opts.subject}
${opts.text}
`);
      return { success: true, provider: "console-fallback", error: userMessage, durationMs };
    }
    return { success: false, provider: EMAIL_PROVIDER, error: userMessage, durationMs };
  }
}
async function sendVerificationEmail(toEmail, verifyUrl) {
  const subject = "Verify your EducAI email";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Verify Your Email</h2>
      <p>Thanks for creating an EducAI account! Please verify your email address to get started.</p>
      <p>Click the button below to verify. This link will expire in 24 hours.</p>
      <a
        href="${verifyUrl}"
        style="display: inline-block; padding: 12px 24px; margin: 16px 0;
               background-color: #4f46e5; color: #fff; text-decoration: none;
               border-radius: 6px; font-weight: bold;"
      >
        Verify Email
      </a>
      <p style="color: #666; font-size: 14px;">
        If you didn&rsquo;t create this account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">EducAI &mdash; Your AI-powered learning platform</p>
    </div>
  `;
  const text = `Verify your EducAI email

Click the link below to verify your email (expires in 24 hours):
${verifyUrl}

If you didn't create this account, you can safely ignore this email.`;
  return sendMail({ to: toEmail, subject, html, text }, "email-verification");
}
async function sendPasswordResetEmail(toEmail, resetUrl) {
  const subject = "Reset your EducAI password";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #111;">Reset Your Password</h2>
      <p>You requested a password reset for your EducAI account.</p>
      <p>Click the button below to set a new password. This link will expire in 30 minutes.</p>
      <a
        href="${resetUrl}"
        style="display: inline-block; padding: 12px 24px; margin: 16px 0;
               background-color: #4f46e5; color: #fff; text-decoration: none;
               border-radius: 6px; font-weight: bold;"
      >
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">EducAI &mdash; Your AI-powered learning platform</p>
    </div>
  `;
  const text = `Reset your EducAI password

Click the link below to set a new password (expires in 30 minutes):
${resetUrl}

If you didn't request this, you can safely ignore this email.`;
  return sendMail({ to: toEmail, subject, html, text }, "password-reset");
}
async function sendScholarshipDeadlineAlert(toEmail, userName, alerts) {
  if (alerts.length === 0) return;
  const appUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const scholarshipsUrl = `${appUrl}/app/scholarships`;
  const itemRows = alerts.map(
    (a) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;">
            <strong>${a.scholarshipTitle}</strong>${a.provider ? `<br/><span style="color:#666;font-size:13px;">${a.provider}</span>` : ""}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;white-space:nowrap;">
            ${a.deadlineDate}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;">
            <span style="background:${a.daysLeft <= 7 ? "#fee2e2" : a.daysLeft <= 14 ? "#fef3c7" : "#dcfce7"};
                         color:${a.daysLeft <= 7 ? "#dc2626" : a.daysLeft <= 14 ? "#d97706" : "#16a34a"};
                         border-radius:9999px;padding:2px 10px;font-size:13px;font-weight:600;">
              ${a.daysLeft}d left
            </span>
          </td>
          ${a.scholarshipUrl ? `<td style="padding:12px 8px;border-bottom:1px solid #eee;"><a href="${a.scholarshipUrl}" style="color:#4f46e5;">Apply</a></td>` : '<td style="padding:12px 8px;border-bottom:1px solid #eee;"></td>'}
        </tr>
      `
  ).join("");
  const subject = alerts.length === 1 ? `Scholarship deadline in ${alerts[0].daysLeft} days \u2014 ${alerts[0].scholarshipTitle}` : `${alerts.length} scholarship deadlines coming up \u2014 EducAI`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#111;">Scholarship Deadline Alert</h2>
      <p>Hi ${userName},</p>
      <p>You have ${alerts.length === 1 ? "a scholarship deadline" : `${alerts.length} scholarship deadlines`} coming up soon. Don't miss out!</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="text-align:left;padding:10px 8px;font-size:13px;color:#666;">Scholarship</th>
            <th style="text-align:left;padding:10px 8px;font-size:13px;color:#666;">Deadline</th>
            <th style="text-align:center;padding:10px 8px;font-size:13px;color:#666;">Time Left</th>
            <th style="padding:10px 8px;font-size:13px;color:#666;">Link</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <a href="${scholarshipsUrl}"
         style="display:inline-block;padding:12px 24px;margin:16px 0;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
        View All Scholarships
      </a>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
      <p style="color:#999;font-size:12px;">EducAI &mdash; Your AI-powered study abroad platform</p>
    </div>
  `;
  const textLines = alerts.map((a) => `\u2022 ${a.scholarshipTitle} (${a.provider ?? "Unknown"}) \u2014 deadline ${a.deadlineDate}, ${a.daysLeft} days left`);
  const text = `Scholarship Deadline Alert

Hi ${userName},

You have upcoming scholarship deadlines:
${textLines.join("\n")}

View all: ${scholarshipsUrl}`;
  await sendMail({ to: toEmail, subject, html, text }, "scholarship-alert");
}
async function sendWelcomeEmail(toEmail, userName, appUrl) {
  const subject = "Welcome to EducAI \u{1F393}";
  const dashboardUrl = `${appUrl}/app`;
  const profileUrl = `${appUrl}/onboarding?edit=true`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #080D18; color: #E8EEF8; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #0D1526 0%, #1A2744 100%); padding: 32px 32px 24px;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #fff;">Welcome to EducAI</h1>
        <p style="margin: 8px 0 0; color: #7A8BA8; font-size: 15px;">Your AI-powered study abroad platform</p>
      </div>
      <div style="padding: 28px 32px;">
        <p style="margin: 0 0 18px; font-size: 15px; color: #B8CCE8;">Hi ${userName},</p>
        <p style="margin: 0 0 18px; font-size: 15px; color: #B8CCE8;">
          Your email is verified and your account is ready. Here's what you can do next:
        </p>
        <div style="background: rgba(74,144,217,0.08); border: 1px solid rgba(74,144,217,0.2); border-radius: 8px; padding: 18px; margin-bottom: 20px;">
          <ul style="margin: 0; padding-left: 18px; color: #B8CCE8; font-size: 14px; line-height: 1.8;">
            <li>Complete your profile to get personalised program matches</li>
            <li>Browse 30,000+ university programs worldwide</li>
            <li>Discover scholarships you're eligible for</li>
            <li>Generate your AI application strategy</li>
            <li>Build your SOP and CV with AI assistance</li>
          </ul>
        </div>
        <a href="${dashboardUrl}"
          style="display: inline-block; padding: 13px 28px; background: #4A90D9; color: #fff;
                 text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Go to Dashboard \u2192
        </a>
        <p style="margin: 24px 0 0; font-size: 13px; color: #3D4F6B;">
          Questions? Reply to this email or reach us at
          <a href="mailto:support.educai@gmail.com" style="color: #4A90D9;">support.educai@gmail.com</a>
        </p>
      </div>
      <div style="padding: 16px 32px; border-top: 1px solid rgba(255,255,255,0.06);">
        <p style="margin: 0; font-size: 12px; color: #3D4F6B;">
          EducAI &mdash; AI-powered study abroad platform &nbsp;|&nbsp;
          <a href="${appUrl}/privacy" style="color: #3D4F6B;">Privacy</a> &nbsp;|&nbsp;
          <a href="${appUrl}/terms" style="color: #3D4F6B;">Terms</a>
        </p>
      </div>
    </div>
  `;
  const text = `Welcome to EducAI, ${userName}!

Your email is verified. Get started at: ${dashboardUrl}

What you can do:
- Complete your profile
- Browse 30,000+ university programs
- Discover scholarships
- Generate your AI strategy

Questions? support.educai@gmail.com`;
  await sendMail({ to: toEmail, subject, html, text }, "welcome");
}

// src/services/emailVerification.service.ts
init_database();
async function createEmailVerificationToken(userId, tokenHash, expiresAt) {
  return await database_default.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt
    }
  });
}
async function findEmailVerificationToken(tokenHash) {
  return await database_default.emailVerificationToken.findUnique({
    where: { tokenHash }
  });
}
async function markEmailVerificationTokenUsed(tokenId) {
  return await database_default.emailVerificationToken.update({
    where: { id: tokenId },
    data: { usedAt: /* @__PURE__ */ new Date() }
  });
}

// src/utils/auth/hash.ts
import { hash, verify } from "argon2";
var hashing = async (password) => {
  const hashedPass = await hash(password);
  return hashedPass;
};
var verifyHash = async (hashedPassword, password) => {
  try {
    const isValid = await verify(hashedPassword, password);
    return isValid;
  } catch (err) {
    console.error("Error in verifying password:", err);
    throw err;
  }
};

// src/controllers/auth.controller.ts
init_database();
var LOCKOUT_DURATION_MS = 10 * 60 * 1e3;
var DEFAULT_REFRESH_TTL_DAYS2 = 15;
var REMEMBER_ME_TTL_DAYS = 30;
async function sendVerification(userId, email) {
  const rawToken = crypto2.randomBytes(32).toString("hex");
  const tokenHash = hashTokenCrypto(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
  await createEmailVerificationToken(userId, tokenHash, expiresAt);
  const frontendUrl2 = process.env.FRONTEND_URL || "http://localhost:3000";
  const verifyUrl = `${frontendUrl2}/auth/verify-email?token=${rawToken}`;
  console.log(`[auth] Sending verification email to ${email} | tokenId: ${rawToken.slice(0, 8)}...`);
  const result = await sendVerificationEmail(email, verifyUrl);
  if (result.success) {
    console.log(`[auth] Verification email sent successfully to ${email} | provider: ${result.provider} | messageId: ${result.messageId}`);
  } else {
    console.error(`[auth] Failed to send verification email to ${email} | provider: ${result.provider} | error: ${result.error}`);
    throw new Error(`Email delivery failed: ${result.error}`);
  }
}
var refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Refresh token missing" });
  }
  const userId = await verifyRefreshToken(token);
  if (!userId) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
  const hashRT = hashTokenCrypto(token);
  const storedToken = await findRefreshToken(hashRT);
  if (!storedToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }
  if (/* @__PURE__ */ new Date() > storedToken.expiresAt) {
    await deleteRefreshToken(hashRT);
    return res.status(401).json({ message: "Refresh token expired" });
  }
  const ttlDays = storedToken.ttlDays || DEFAULT_REFRESH_TTL_DAYS2;
  await deleteRefreshToken(hashRT);
  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(userId, { refreshTtlDays: ttlDays });
  const hashedRefreshToken = hashTokenCrypto(newRefreshToken);
  await saveRefreshToken(userId, hashedRefreshToken, ttlDays);
  await saveToCookie(res, newRefreshToken, accessToken);
  res.status(200).json({ accessToken, refreshToken: newRefreshToken, message: "Token refreshed" });
};
var signup = async (req, res) => {
  const t0 = Date.now();
  try {
    const { email, password, name, avatarUrl, profile } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password and name are required" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(422).json({ message: "Password must be at least 8 characters long" });
    }
    if (!/[a-zA-Z]/.test(password)) {
      return res.status(422).json({ message: "Password must contain at least one letter" });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(422).json({ message: "Password must contain at least one number" });
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return res.status(422).json({ message: "Password must contain at least one special character" });
    }
    const tValidation = Date.now();
    console.log(`[signup] validation done in ${tValidation - t0}ms`);
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(409).json({ message: "Email already in use" });
      }
      sendVerification(existingUser.id, existingUser.email).catch(
        (e) => console.error("Resend verification email failed:", e)
      );
      return res.status(200).json({ message: "Account created. Please check your email to verify." });
    }
    const tDbLookup = Date.now();
    console.log(`[signup] db lookup done in ${tDbLookup - tValidation}ms`);
    const hashedPassword = await hashing(password);
    const tHash = Date.now();
    console.log(`[signup] password hashing done in ${tHash - tDbLookup}ms`);
    const newUser = await createUser({
      email: email.toLowerCase(),
      name,
      avatarUrl,
      passwordHash: hashedPassword
    });
    if (profile && typeof profile === "object") {
      await database_default.userProfile.upsert({
        where: { userId: newUser.id },
        update: {
          currentStage: profile.currentStage ?? void 0,
          targetIntake: profile.targetIntake ?? void 0,
          targetCountries: profile.targetCountries ?? void 0,
          intendedLevel: profile.intendedLevel ?? void 0,
          intendedMajor: profile.intendedMajor ?? void 0,
          gpa: profile.gpa ?? void 0,
          gpaScale: profile.gpaScale ?? void 0,
          englishTestType: profile.englishTestType ?? void 0,
          englishScore: profile.englishScore ?? void 0,
          budgetMax: profile.budgetMax ?? void 0,
          budgetCurrency: profile.budgetCurrency ?? "USD",
          budgetAmountUSD: profile.budgetMax != null && profile.budgetCurrency != null ? toUSD(profile.budgetMax, profile.budgetCurrency) ?? void 0 : void 0,
          workExperienceMonths: profile.workExperienceMonths ?? void 0,
          onboardingDone: false
        },
        create: {
          userId: newUser.id,
          currentStage: profile.currentStage ?? void 0,
          targetIntake: profile.targetIntake ?? void 0,
          targetCountries: profile.targetCountries ?? void 0,
          intendedLevel: profile.intendedLevel ?? void 0,
          intendedMajor: profile.intendedMajor ?? void 0,
          gpa: profile.gpa ?? void 0,
          gpaScale: profile.gpaScale ?? void 0,
          englishTestType: profile.englishTestType ?? void 0,
          englishScore: profile.englishScore ?? void 0,
          budgetMax: profile.budgetMax ?? void 0,
          budgetCurrency: profile.budgetCurrency ?? "USD",
          budgetAmountUSD: profile.budgetMax != null && profile.budgetCurrency != null ? toUSD(profile.budgetMax, profile.budgetCurrency) ?? void 0 : void 0,
          workExperienceMonths: profile.workExperienceMonths ?? void 0,
          onboardingDone: false
        }
      }).catch((e) => console.error("Profile creation at signup failed (non-fatal):", e));
    }
    const tUserCreate = Date.now();
    console.log(`[signup] user created in ${tUserCreate - tHash}ms | userId=${newUser.id}`);
    try {
      await sendVerification(newUser.id, newUser.email);
      const tEmail = Date.now();
      console.log(`[signup] email sent in ${tEmail - tUserCreate}ms | total=${tEmail - t0}ms`);
    } catch (emailError) {
      await database_default.user.delete({ where: { id: newUser.id } });
      console.error("[auth] Signup failed \u2014 rolled back user creation. Email error:", emailError.message);
      return res.status(503).json({
        message: "Account creation failed. Email service is unavailable. Please try again later.",
        code: "EMAIL_SERVICE_UNAVAILABLE"
      });
    }
    res.status(201).json({ message: "Account created. Please check your email to verify." });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ message: "User creation failed" });
  }
};
var verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Verification token is required" });
    }
    const tokenHash = hashTokenCrypto(token);
    const record = await findEmailVerificationToken(tokenHash);
    if (!record || record.usedAt || /* @__PURE__ */ new Date() > record.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }
    const verifiedUser = await database_default.user.update({
      where: { id: record.userId },
      data: { emailVerified: true, isActive: true },
      select: { email: true, name: true }
    });
    await markEmailVerificationTokenUsed(record.id);
    const appUrl = process.env.FRONTEND_URL ?? "https://educai-web.vercel.app";
    sendWelcomeEmail(verifiedUser.email, verifiedUser.name ?? "there", appUrl).catch(
      (e) => console.error("[auth] Welcome email failed (non-fatal):", e)
    );
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const genericMessage = "If an account exists, we sent a verification email.";
    if (!email || typeof email !== "string") {
      return res.status(200).json({ message: genericMessage });
    }
    const user2 = await findUserByEmail(email);
    if (user2 && !user2.emailVerified) {
      try {
        await sendVerification(user2.id, user2.email);
      } catch (emailError) {
        console.error("[auth] Resend verification failed:", emailError.message);
        return res.status(503).json({
          message: "Email service unavailable. Please try again later.",
          code: "EMAIL_SERVICE_UNAVAILABLE"
        });
      }
    }
    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error("Error in resendVerification:", error);
    res.status(200).json({ message: "If an account exists, we sent a verification email." });
  }
};
var signin = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user2 = await findUserByEmail(email?.toLowerCase());
    if (!user2 || !user2.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user2.lockoutUntil && user2.lockoutUntil > /* @__PURE__ */ new Date()) {
      const retryAfterSeconds = Math.ceil(
        (user2.lockoutUntil.getTime() - Date.now()) / 1e3
      );
      return res.status(423).json({
        code: "ACCOUNT_LOCKED",
        message: "Too many failed attempts. Try again later.",
        retryAfterSeconds
      });
    }
    const isPasswordValid = await verifyHash(user2.passwordHash, password);
    if (!isPasswordValid) {
      await incrementFailedLogin(user2.id);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user2.emailVerified) {
      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before signing in."
      });
    }
    await resetFailedLogin(user2.id);
    const ttlDays = rememberMe ? REMEMBER_ME_TTL_DAYS : DEFAULT_REFRESH_TTL_DAYS2;
    const { accessToken, refreshToken } = await generateTokens(user2.id, {
      refreshTtlDays: ttlDays
    });
    const hashedRefreshToken = hashTokenCrypto(refreshToken);
    await saveRefreshToken(user2.id, hashedRefreshToken, ttlDays);
    await saveToCookie(res, refreshToken, accessToken);
    const secureUser = {
      id: user2.id,
      email: user2.email,
      name: user2.name,
      avatar: user2.avatarUrl || void 0,
      emailVerified: user2.emailVerified,
      isActive: user2.isActive
    };
    res.status(200).json({
      message: "Signin successful",
      user: secureUser,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error("Error in signin:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var me = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user2 = await findUserById(req.userId);
    if (!user2) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user2.id,
      email: user2.email,
      name: user2.name,
      avatarUrl: user2.avatarUrl || void 0,
      emailVerified: user2.emailVerified,
      isActive: user2.isActive
    });
  } catch (error) {
    console.error("Error in me:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var signout = async (req, res) => {
  const { userId } = req;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  await deleteUserRefreshTokens(userId);
  await clearTokens(res);
  if (typeof req.logout === "function") {
    req.logout((err) => {
      if (err) console.error("Logout error:", err);
    });
  }
  if (req.session) {
    req.session.destroy(() => {
    });
  }
  res.status(200).json({ message: "Signed out" });
};
var _googleAuthDisabled = (_req, res) => res.status(503).json({ message: "Google OAuth is not configured on this server." });
var googleAuth = GOOGLE_OAUTH_ENABLED ? passport2.authenticate("google", { scope: ["email", "profile"] }) : _googleAuthDisabled;
var googleAuthCallback = GOOGLE_OAUTH_ENABLED ? [
  (req, res, next) => {
    passport2.authenticate("google", { session: false }, (err, user2, info) => {
      if (err) {
        console.error("[google callback] passport error:", err);
      }
      if (!user2) {
        console.warn("[google callback] no user returned, info:", info);
        const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
        return res.redirect(`${frontend}/auth/signin?error=oauth_failed`);
      }
      req.user = user2;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      const user2 = req.user;
      if (!user2) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      const { accessToken, refreshToken } = await generateTokens(user2.id);
      const hashedRefreshToken = hashTokenCrypto(refreshToken);
      await saveRefreshToken(user2.id, hashedRefreshToken);
      const rawCode = crypto2.randomBytes(32).toString("hex");
      const codeHash = hashTokenCrypto(rawCode);
      const expiresAt = new Date(Date.now() + 12e4);
      await database_default.oAuthCode.create({
        data: { codeHash, userId: user2.id, accessToken, refreshToken, expiresAt }
      });
      const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
      console.log(`[google callback] code issued for user ${user2.id}, expires ${expiresAt.toISOString()}`);
      return res.redirect(`${frontend}/api/auth/google/callback?code=${rawCode}`);
    } catch (error) {
      console.error("Error in Google auth callback:", error);
      const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontend}/auth/signin?error=oauth_failed`);
    }
  }
] : [_googleAuthDisabled];
var googleExchange = async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "Missing code" });
  }
  const codeHash = hashTokenCrypto(code);
  const entry = await database_default.oAuthCode.findUnique({ where: { codeHash } });
  if (!entry) {
    console.warn("[google exchange] code not found (hash:", codeHash.slice(0, 8), "...)");
    return res.status(401).json({ message: "Invalid or expired code" });
  }
  if (entry.expiresAt < /* @__PURE__ */ new Date()) {
    await database_default.oAuthCode.delete({ where: { codeHash } });
    console.warn("[google exchange] code expired for user", entry.userId);
    return res.status(401).json({ message: "Invalid or expired code" });
  }
  await database_default.oAuthCode.delete({ where: { codeHash } });
  const user2 = await findUserById(entry.userId);
  if (!user2) {
    return res.status(404).json({ message: "User not found" });
  }
  console.log(`[google exchange] tokens issued for user ${user2.id} (${user2.email})`);
  return res.status(200).json({
    accessToken: entry.accessToken,
    refreshToken: entry.refreshToken,
    user: {
      id: user2.id,
      email: user2.email,
      name: user2.name,
      avatarUrl: user2.avatarUrl ?? null,
      emailVerified: user2.emailVerified,
      isActive: user2.isActive
    }
  });
};
var googleAuthFailure = async (req, res) => {
  const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
  res.redirect(`${frontend}/auth/signin?error=oauth_failed`);
};
var forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(422).json({ message: "Email is required" });
    }
    const genericMessage = "If an account exists for this email, a password reset link has been sent.";
    const user2 = await findUserByEmail(email);
    if (!user2) {
      return res.status(200).json({ message: genericMessage });
    }
    const rawToken = crypto2.randomBytes(32).toString("hex");
    const tokenHash = hashTokenCrypto(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1e3);
    await createPasswordResetToken(user2.id, tokenHash, expiresAt);
    const frontendUrl2 = process.env.FRONTEND_URL || "http://localhost:3000";
    const resetUrl = `${frontendUrl2}/auth/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl);
    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Reset token is required" });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(422).json({ message: "Password must be at least 8 characters long" });
    }
    if (!/[a-zA-Z]/.test(password)) {
      return res.status(422).json({ message: "Password must contain at least one letter" });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(422).json({ message: "Password must contain at least one number" });
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return res.status(422).json({
        message: "Password must contain at least one special character"
      });
    }
    const tokenHash = hashTokenCrypto(token);
    const resetToken = await findPasswordResetToken(tokenHash);
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
    if (resetToken.usedAt) {
      return res.status(400).json({ message: "This reset link has already been used" });
    }
    if (/* @__PURE__ */ new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    const hashedPassword = await hashing(password);
    await updateUserPassword(resetToken.userId, hashedPassword);
    await markPasswordResetTokenUsed(resetToken.id);
    await deleteUserRefreshTokens(resetToken.userId);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorised" });
    await database_default.user.delete({ where: { id: userId } });
    const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" };
    res.clearCookie("accessToken", cookieOpts);
    res.clearCookie("refreshToken", cookieOpts);
    res.status(200).json({ message: "Account permanently deleted" });
  } catch (error) {
    console.error("Error in deleteAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
var exportUserData = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorised" });
    const [user2, profile, savedPrograms, matchRuns, roadmaps, strategies, gapFix, jobSearches] = await Promise.all([
      database_default.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, createdAt: true, emailVerified: true, oauthProvider: true }
      }),
      database_default.userProfile.findUnique({ where: { userId } }),
      database_default.savedProgram.findMany({ where: { userId }, include: { program: { select: { title: true } } } }),
      database_default.matchRun.findMany({ where: { userId }, select: { id: true, status: true, createdAt: true } }),
      database_default.userRoadmap.findMany({ where: { userId }, select: { id: true, countryCode: true, intake: true, createdAt: true } }),
      database_default.strategyReport.findMany({ where: { userId }, select: { id: true, countryCode: true, createdAt: true } }),
      database_default.gapFixSession.findMany({ where: { userId }, select: { id: true, createdAt: true } }),
      database_default.jobSearch.findMany({ where: { userId }, select: { id: true, countryCode: true, city: true, field: true, createdAt: true } })
    ]);
    const exportData = {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      account: user2,
      profile,
      savedPrograms: savedPrograms.map((s) => ({ savedAt: s.createdAt, program: s.program?.title })),
      matchRuns,
      roadmaps,
      strategies,
      gapFixSessions: gapFix,
      jobSearches
    };
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="educai-data-export-${userId}.json"`);
    res.status(200).json(exportData);
  } catch (error) {
    console.error("Error in exportUserData:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// src/middlewares/rateLimit.ts
var IS_TEST = process.env.NODE_ENV === "test";
async function applyArcjet(ruleType, req, res, next) {
  if (IS_TEST) return next();
  try {
    const { default: aj2 } = await Promise.resolve().then(() => (init_arcjet(), arcjet_exports));
    const { slidingWindow: slidingWindow2 } = await import("@arcjet/node");
    const instance = ruleType === "forgotPassword" ? aj2.withRule(slidingWindow2({ mode: "LIVE", interval: "1h", max: 5 })) : aj2.withRule(slidingWindow2({ mode: "LIVE", interval: "15m", max: 10 }));
    const decision = await instance.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({
          message: "Too many attempts. Please wait before trying again.",
          code: "RATE_LIMIT_EXCEEDED"
        });
        return;
      }
      res.status(403).json({ message: "Request blocked.", code: "FORBIDDEN" });
      return;
    }
    next();
  } catch {
    next();
  }
}
function authRateLimit(req, res, next) {
  return applyArcjet("auth", req, res, next);
}
function forgotPasswordRateLimit(req, res, next) {
  return applyArcjet("forgotPassword", req, res, next);
}

// src/routes/auth.router.ts
var router = Router();
router.get("/google", googleAuth);
router.get("/google/callback", googleAuthCallback);
router.get("/google/exchange", googleExchange);
router.get("/google/failure", googleAuthFailure);
router.post("/signup", authRateLimit, signup);
router.post("/signin", authRateLimit, signin);
router.post("/verify-email", authRateLimit, verifyEmail);
router.post("/resend-verification", authRateLimit, resendVerification);
router.post("/refresh", refresh);
router.get("/refresh", refresh);
router.post("/signout", authMiddleware, signout);
router.get("/signout", authMiddleware, signout);
router.get("/me", authMiddleware, me);
router.post("/forgot-password", forgotPasswordRateLimit, forgotPassword);
router.post("/reset-password", authRateLimit, resetPassword);
router.delete("/account", authMiddleware, deleteAccount);
router.get("/export-data", authMiddleware, exportUserData);
var auth_router_default = router;

// src/routes/user.router.ts
import { Router as Router2 } from "express";

// src/controllers/user.controller.ts
init_database();
var getUserProfile = async (req, res) => {
  try {
    const profile = await database_default.userProfile.findUnique({
      where: { userId: req.userId }
    });
    res.status(200).json({ profile: profile ?? null });
  } catch (err) {
    logger_default.error(`[user:profile] Failed to fetch profile: ${err}`);
    res.status(500).json({ message: "Unable to load your profile. Please try again." });
  }
};
var upsertUserProfile = async (req, res) => {
  try {
    const body = req.body;
    const data = {
      // Legacy
      ...body.targetCountry !== void 0 && { targetCountry: body.targetCountry },
      ...body.level !== void 0 && { level: body.level },
      ...body.budgetRange !== void 0 && { budgetRange: body.budgetRange },
      ...body.intendedMajor !== void 0 && { intendedMajor: body.intendedMajor },
      ...body.gpa !== void 0 && { gpa: body.gpa },
      ...body.testScores !== void 0 && { testScores: body.testScores },
      ...body.onboardingDone !== void 0 && { onboardingDone: body.onboardingDone },
      // Step 1
      ...body.currentStage !== void 0 && { currentStage: body.currentStage },
      ...body.targetIntake !== void 0 && { targetIntake: body.targetIntake },
      ...body.targetCountries !== void 0 && { targetCountries: body.targetCountries },
      ...body.intendedLevel !== void 0 && { intendedLevel: body.intendedLevel },
      // Step 2
      ...body.currentInstitution !== void 0 && { currentInstitution: body.currentInstitution },
      ...body.majorOrTrack !== void 0 && { majorOrTrack: body.majorOrTrack },
      ...body.gpaScale !== void 0 && { gpaScale: body.gpaScale },
      ...body.graduationYear !== void 0 && { graduationYear: body.graduationYear },
      ...body.backlogs !== void 0 && { backlogs: body.backlogs },
      ...body.workExperienceMonths !== void 0 && { workExperienceMonths: body.workExperienceMonths },
      // Step 3
      ...body.englishTestType !== void 0 && { englishTestType: body.englishTestType },
      ...body.englishScore !== void 0 && { englishScore: body.englishScore },
      ...body.gre !== void 0 && { gre: body.gre },
      ...body.gmat !== void 0 && { gmat: body.gmat },
      // Intended abroad program
      ...body.intendedAbroadMajor !== void 0 && { intendedAbroadMajor: body.intendedAbroadMajor },
      ...body.careerGoal !== void 0 && { careerGoal: body.careerGoal },
      ...body.researchInterest !== void 0 && { researchInterest: body.researchInterest },
      // Step 4
      ...body.budgetCurrency !== void 0 && { budgetCurrency: body.budgetCurrency },
      ...body.budgetMax !== void 0 && { budgetMax: body.budgetMax },
      // Canonical USD-normalized budget — computed whenever both fields are present.
      // Only included in the update when we have a valid amount + currency pair.
      ...body.budgetMax != null && body.budgetCurrency != null ? (() => {
        const usd = toUSD(body.budgetMax, body.budgetCurrency);
        return usd != null ? { budgetAmountUSD: usd } : {};
      })() : {},
      ...body.fundingNeed !== void 0 && { fundingNeed: body.fundingNeed },
      ...body.preferredCities !== void 0 && { preferredCities: body.preferredCities },
      ...body.priorities !== void 0 && { priorities: body.priorities }
    };
    const profile = await database_default.userProfile.upsert({
      where: { userId: req.userId },
      update: data,
      create: {
        userId: req.userId,
        onboardingDone: false,
        ...data
      }
    });
    res.status(200).json({ profile });
  } catch (err) {
    logger_default.error(`[user:upsert] Failed to save profile: ${err}`);
    res.status(500).json({ message: "Could not save your profile. Please check your input and try again." });
  }
};

// src/routes/user.router.ts
var router2 = Router2();
router2.get("/me/profile", authMiddleware, getUserProfile);
router2.post("/me/profile", authMiddleware, upsertUserProfile);
router2.put("/me/profile", authMiddleware, upsertUserProfile);
var user_router_default = router2;

// src/routes/university.router.ts
import { Router as Router3 } from "express";

// src/controllers/university.controller.ts
init_database();
var searchUniversities = async (req, res) => {
  try {
    const { country, q, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const where = {};
    if (country) where.country = { code: country.toUpperCase() };
    if (q) where.name = { contains: q, mode: "insensitive" };
    const [items, total] = await Promise.all([
      database_default.university.findMany({
        where,
        skip,
        take: limitNum,
        include: { country: true },
        orderBy: { name: "asc" }
      }),
      database_default.university.count({ where })
    ]);
    const noDataMessage = total === 0 ? "No data available yet. Run sync." : void 0;
    res.status(200).json({ items, page: pageNum, limit: limitNum, total, ...noDataMessage && { noDataMessage } });
  } catch {
    res.status(500).json({ message: "Failed to search universities" });
  }
};

// src/routes/university.router.ts
var router3 = Router3();
router3.get("/", searchUniversities);
var university_router_default = router3;

// src/routes/program.router.ts
import { Router as Router4 } from "express";

// src/controllers/program.controller.ts
init_database();
init_client();
function computeFreshnessStatus(lastVerifiedAt, updatedAt) {
  const ref = lastVerifiedAt ?? updatedAt;
  const diffDays = (Date.now() - ref.getTime()) / (1e3 * 60 * 60 * 24);
  if (diffDays < 1) return "live";
  if (diffDays < 7) return "recent";
  if (diffDays < 30) return "cached";
  return "stale";
}
function attachFreshness(program) {
  return { ...program, freshnessStatus: computeFreshnessStatus(program.lastVerifiedAt, program.updatedAt) };
}
var searchPrograms = async (req, res) => {
  try {
    const { country, level, field, q, page = "1", limit = "20", showStale = "false" } = req.query;
    const freshOnly = showStale !== "true";
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
    const baseWhere = {};
    if (country) baseWhere.university = { country: { code: country.toUpperCase() } };
    if (level && Object.values(ProgramLevel).includes(level)) {
      baseWhere.level = level;
    }
    if (field) baseWhere.field = { contains: field, mode: "insensitive" };
    if (q) {
      baseWhere.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { field: { contains: q, mode: "insensitive" } },
        { university: { name: { contains: q, mode: "insensitive" } } }
      ];
    }
    const freshFilter = {
      OR: [
        { lastVerifiedAt: { gte: sevenDaysAgo } },
        { AND: [{ lastVerifiedAt: null }, { updatedAt: { gte: sevenDaysAgo } }] }
      ]
    };
    const staleFilter = {
      OR: [
        { AND: [{ lastVerifiedAt: { not: null } }, { lastVerifiedAt: { lt: sevenDaysAgo } }] },
        { AND: [{ lastVerifiedAt: null }, { updatedAt: { lt: sevenDaysAgo } }] }
      ]
    };
    const where = freshOnly ? { AND: [baseWhere, freshFilter] } : baseWhere;
    const [items, total, staleHiddenCount] = await Promise.all([
      database_default.program.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          university: { include: { country: true } }
        },
        orderBy: [{ university: { name: "asc" } }, { title: "asc" }]
      }),
      database_default.program.count({ where }),
      freshOnly ? database_default.program.count({ where: { AND: [baseWhere, staleFilter] } }) : Promise.resolve(0)
    ]);
    const enriched = items.map(attachFreshness);
    const shownStaleCount = enriched.filter(
      (p) => p.freshnessStatus === "stale" || p.freshnessStatus === "cached" || p.freshnessStatus === "source_unavailable"
    ).length;
    const hasStaleData = shownStaleCount > 0 && !freshOnly;
    res.status(200).json({
      items: enriched,
      page: pageNum,
      limit: limitNum,
      total,
      freshOnlyMode: freshOnly,
      staleHiddenCount,
      hasStaleData,
      staleCount: shownStaleCount
    });
  } catch {
    res.status(500).json({ message: "Failed to search programs" });
  }
};
var getProgramById = async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const program = await database_default.program.findUnique({
      where: { id },
      include: {
        university: { include: { country: true } },
        requirements: { orderBy: { key: "asc" } },
        deadlines: { orderBy: { deadline: "asc" } }
      }
    });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.status(200).json(attachFreshness(program));
  } catch {
    res.status(500).json({ message: "Failed to fetch program" });
  }
};

// src/routes/program.router.ts
init_database();
var router4 = Router4();
router4.get("/", searchPrograms);
router4.get("/ids", async (_req, res) => {
  try {
    const programs = await database_default.program.findMany({ select: { id: true }, take: 5e4 });
    res.json({ ids: programs.map((p) => p.id), total: programs.length });
  } catch {
    res.status(500).json({ ids: [], total: 0 });
  }
});
router4.get("/:id", getProgramById);
var program_router_default = router4;

// src/routes/match.router.ts
import { Router as Router5 } from "express";

// src/controllers/match.controller.ts
init_database();

// src/services/ingest.service.ts
init_database();
var LEVEL_MAP = {
  BSC: "BSC",
  MSC: "MSC",
  PHD: "PHD",
  BACHELOR: "BSC",
  BACHELORS: "BSC",
  UNDERGRADUATE: "BSC",
  MASTER: "MSC",
  MASTERS: "MSC",
  GRADUATE: "MSC",
  POSTGRADUATE: "MSC",
  DOCTORATE: "PHD",
  DOCTORAL: "PHD"
};
function normalizeLevel(raw2) {
  return LEVEL_MAP[raw2.toUpperCase().replace(/[^A-Z]/g, "")] ?? null;
}
async function performIngest(countries, _runId) {
  const counts = { countries: 0, universities: 0, programs: 0 };
  for (const c of countries) {
    if (!c.code || !c.name) continue;
    const country = await database_default.country.upsert({
      where: { code: c.code.toUpperCase() },
      create: { code: c.code.toUpperCase(), name: c.name },
      update: { name: c.name }
    });
    counts.countries++;
    for (const u of c.universities ?? []) {
      if (!u.name) continue;
      const now = /* @__PURE__ */ new Date();
      const university = await database_default.university.upsert({
        where: { countryId_name: { countryId: country.id, name: u.name } },
        create: {
          name: u.name,
          countryId: country.id,
          city: u.city ?? null,
          website: u.website ?? null,
          description: u.description ?? null,
          sourceUrl: u.sourceUrl ?? null,
          ranking: u.ranking ?? null,
          universityType: u.universityType ?? null,
          admissionsUrl: u.admissionsUrl ?? null,
          tuitionUrl: u.tuitionUrl ?? null,
          scholarshipsUrl: u.scholarshipsUrl ?? null,
          internationalUrl: u.internationalUrl ?? null,
          applicationPortalUrl: u.applicationPortalUrl ?? null,
          lastVerifiedAt: now
        },
        update: {
          city: u.city ?? void 0,
          website: u.website ?? void 0,
          description: u.description ?? void 0,
          sourceUrl: u.sourceUrl ?? void 0,
          ranking: u.ranking ?? void 0,
          universityType: u.universityType ?? void 0,
          admissionsUrl: u.admissionsUrl ?? void 0,
          tuitionUrl: u.tuitionUrl ?? void 0,
          scholarshipsUrl: u.scholarshipsUrl ?? void 0,
          internationalUrl: u.internationalUrl ?? void 0,
          applicationPortalUrl: u.applicationPortalUrl ?? void 0,
          lastVerifiedAt: now
        }
      });
      counts.universities++;
      const batchSize = 50;
      const programList = u.programs ?? [];
      for (let i = 0; i < programList.length; i += batchSize) {
        const batch = programList.slice(i, i + batchSize);
        for (const p of batch) {
          if (!p.title || !p.field || !p.level) continue;
          const level = normalizeLevel(p.level);
          if (!level) continue;
          const program = await database_default.program.upsert({
            where: {
              universityId_title_level: {
                universityId: university.id,
                title: p.title,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                level
              }
            },
            create: {
              universityId: university.id,
              title: p.title,
              field: p.field,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              level,
              durationMonths: p.durationMonths ?? null,
              tuitionMinUSD: p.tuitionMinUSD ?? null,
              tuitionMaxUSD: p.tuitionMaxUSD ?? null,
              description: p.description ?? null,
              sourceUrl: p.sourceUrl ?? null,
              applicationFeeUSD: p.applicationFeeUSD ?? null,
              studyMode: p.studyMode ?? null,
              languageOfInstruction: p.languageOfInstruction ?? null,
              applicationPortalUrl: p.applicationPortalUrl ?? null,
              lastVerifiedAt: now
            },
            update: {
              field: p.field,
              durationMonths: p.durationMonths ?? void 0,
              tuitionMinUSD: p.tuitionMinUSD ?? void 0,
              tuitionMaxUSD: p.tuitionMaxUSD ?? void 0,
              description: p.description ?? void 0,
              sourceUrl: p.sourceUrl ?? void 0,
              applicationFeeUSD: p.applicationFeeUSD ?? void 0,
              studyMode: p.studyMode ?? void 0,
              languageOfInstruction: p.languageOfInstruction ?? void 0,
              applicationPortalUrl: p.applicationPortalUrl ?? void 0,
              lastVerifiedAt: now
            }
          });
          counts.programs++;
          if (p.requirements !== void 0) {
            await database_default.programRequirement.deleteMany({ where: { programId: program.id } });
            if (p.requirements.length > 0) {
              await database_default.programRequirement.createMany({
                data: p.requirements.map((r) => ({
                  programId: program.id,
                  key: r.key,
                  value: r.value
                }))
              });
            }
          }
          if (p.deadlines !== void 0) {
            await database_default.programDeadline.deleteMany({ where: { programId: program.id } });
            const valid = p.deadlines.filter((d) => d.term && d.deadline && d.deadline.toLowerCase() !== "rolling").flatMap((d) => {
              const date = new Date(d.deadline);
              return isNaN(date.getTime()) ? [] : [{ programId: program.id, term: d.term, deadline: date }];
            });
            if (valid.length > 0) {
              await database_default.programDeadline.createMany({ data: valid });
            }
          }
        }
      }
    }
  }
  return counts;
}

// src/controllers/match.controller.ts
var AI_SERVER_URL = process.env.AI_SERVER_URL ?? "http://localhost:8001";
var AI_SERVER_API_KEY = process.env.AI_SERVER_API_KEY ?? "";
var CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
var AI_TIMEOUT_MS = 12e4;
var AI_MAX_RETRIES = 3;
var AI_RETRY_BASE_MS = 1e3;
var MAJOR_SYNONYMS = {
  "computer science": ["cs", "computing", "software engineering", "information technology", "it"],
  "artificial intelligence": ["ai", "machine learning", "ml", "deep learning", "neural networks", "data science"],
  "cybersecurity": ["information security", "network security", "cyber security", "digital forensics", "infosec"],
  "data science": ["data analytics", "big data", "machine learning", "ml", "statistics", "business analytics"],
  "software engineering": ["cs", "computer science", "software development", "information technology"],
  "electrical engineering": ["ee", "electronics", "power systems", "telecommunications"],
  "mechanical engineering": ["me", "manufacturing", "aerospace engineering", "thermal engineering"],
  "civil engineering": ["structural engineering", "environmental engineering", "geotechnical"],
  "chemical engineering": ["process engineering", "materials engineering"],
  "biomedical engineering": ["bioengineering", "medical engineering", "biomed", "biotechnology"],
  "engineering": ["mechanical", "electrical", "civil", "chemical", "engineering management"],
  "business administration": ["mba", "business management", "management", "business studies"],
  "finance": ["financial management", "fintech", "banking", "investment management"],
  "accounting": ["auditing", "tax", "financial accounting", "management accounting"],
  "economics": ["econometrics", "financial economics", "applied economics"],
  "marketing": ["digital marketing", "brand management", "advertising"],
  "law": ["legal studies", "jurisprudence", "llm", "llb", "international law"],
  "public health": ["epidemiology", "global health", "health policy", "mph", "community health"],
  "medicine": ["mbbs", "medical science", "clinical medicine", "healthcare"],
  "nursing": ["healthcare", "clinical nursing", "nurse practitioner"],
  "pharmacy": ["pharmaceutical sciences", "pharmacology", "clinical pharmacy"],
  "psychology": ["cognitive science", "behavioral science", "clinical psychology", "counseling"],
  "political science": ["international relations", "governance", "public policy", "public administration"],
  "international relations": ["diplomacy", "foreign policy", "global studies", "political science"],
  "environmental science": ["environmental studies", "sustainability", "ecology", "climate science"],
  "architecture": ["urban planning", "interior design", "urban design"],
  "design": ["graphic design", "ux design", "product design", "user experience"],
  "media": ["media studies", "journalism", "communications", "mass communication"],
  "biotechnology": ["bioinformatics", "molecular biology", "genetic engineering", "life sciences"],
  "mathematics": ["applied mathematics", "statistics", "actuarial science", "math"]
};
function getMajorTerms(major) {
  const lower = major.toLowerCase().trim();
  const termSet = /* @__PURE__ */ new Set();
  if (MAJOR_SYNONYMS[lower]) {
    termSet.add(lower);
    for (const s of MAJOR_SYNONYMS[lower]) termSet.add(s);
  } else {
    let found = false;
    for (const [canonical, synonyms] of Object.entries(MAJOR_SYNONYMS)) {
      if (synonyms.includes(lower)) {
        termSet.add(canonical);
        for (const s of synonyms) termSet.add(s);
        found = true;
        break;
      }
    }
    if (!found) {
      const queryWords = lower.split(/\s+/).filter((w) => w.length > 2);
      for (const [canonical, synonyms] of Object.entries(MAJOR_SYNONYMS)) {
        const canonWords = canonical.split(/\s+/);
        if (queryWords.some((w) => canonWords.includes(w))) {
          termSet.add(canonical);
          for (const s of synonyms) termSet.add(s);
        }
      }
      termSet.add(lower);
    }
  }
  const words = /* @__PURE__ */ new Set();
  for (const term of termSet) {
    for (const w of term.split(/\s+/)) {
      if (w.length > 1) words.add(w);
    }
  }
  return [...words];
}
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function fetchAiWithRetry(url, init, log) {
  let lastErr;
  for (let attempt = 1; attempt <= AI_MAX_RETRIES; attempt += 1) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(AI_TIMEOUT_MS) });
      if (res.ok) return res;
      if (res.status >= 500 && res.status < 600) {
        const body = await res.text().catch(() => "");
        lastErr = new Error(`AI server ${res.status}: ${body.slice(0, 200)}`);
      } else {
        return res;
      }
    } catch (err) {
      lastErr = err;
    }
    if (attempt < AI_MAX_RETRIES) {
      const backoff = AI_RETRY_BASE_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 250);
      log(`AI server retry ${attempt}/${AI_MAX_RETRIES} in ${backoff + jitter}ms`);
      await sleep(backoff + jitter);
    }
  }
  throw lastErr;
}
var runMatch = async (req, res) => {
  const userId = req.userId;
  const profile = await database_default.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    res.status(400).json({ message: "Profile not found. Complete your profile first." });
    return;
  }
  const existing = await database_default.matchRun.findFirst({
    where: { userId, status: { in: ["pending", "running"] } },
    orderBy: { createdAt: "desc" }
  });
  if (existing) {
    res.status(200).json({ runId: existing.id, status: existing.status, message: "Run already in progress." });
    return;
  }
  const run = await database_default.matchRun.create({
    data: { userId, status: "pending", progress: 0 }
  });
  res.status(200).json({ runId: run.id, status: "pending" });
  setImmediate(() => {
    void runMatchBackground(run.id, userId, profile);
  });
};
async function runMatchBackground(runId, userId, profile) {
  const log = (msg) => console.log(`[match:${runId}] ${msg}`);
  const setProgress = (n) => database_default.matchRun.update({ where: { id: runId }, data: { progress: n } }).catch(() => {
  });
  const markError = (err) => database_default.matchRun.update({
    where: { id: runId },
    data: { status: "error", error: String(err).slice(0, 500), progress: 0 }
  }).catch(() => {
  });
  try {
    await database_default.matchRun.update({ where: { id: runId }, data: { status: "running", progress: 10 } });
    log("started");
    const targetCountries = Array.isArray(profile.targetCountries) ? profile.targetCountries : [];
    const intendedLevel = profile.intendedLevel ?? profile.level ?? "MSc";
    const intendedMajor = profile.intendedAbroadMajor ?? profile.intendedMajor ?? profile.majorOrTrack ?? "Computer Science";
    const cacheKey = `${[...targetCountries].sort().join(",")}:${intendedMajor}:${intendedLevel}`;
    const cacheMeta = await database_default.dataSourceMeta.findUnique({ where: { cacheKey } });
    const isFresh = cacheMeta && Date.now() - cacheMeta.lastScrapedAt.getTime() < CACHE_TTL_MS;
    let ranked = [];
    if (isFresh) {
      log("cache hit \u2014 ranking from DB");
      await setProgress(50);
      ranked = await rankFromDB(profile, targetCountries, intendedLevel, intendedMajor);
      await setProgress(90);
    } else {
      log("cache miss \u2014 calling AI server");
      await setProgress(20);
      const aiPayload = {
        user_id: userId,
        run_id: runId,
        target_countries: targetCountries,
        intended_level: intendedLevel,
        intended_major: intendedMajor,
        // Use pre-normalized USD value; fall back to on-the-fly conversion; then default.
        budget_max_usd: profile.budgetAmountUSD ?? (profile.budgetMax != null ? toUSD(profile.budgetMax, profile.budgetCurrency ?? "USD") ?? 3e4 : 3e4),
        gpa: profile.gpa ?? 0,
        english_test_type: profile.englishTestType ?? null,
        english_score: profile.englishScore ?? null
      };
      let aiData = null;
      try {
        const aiRes = await fetchAiWithRetry(`${AI_SERVER_URL}/api/v1/module1/scrape-match`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...AI_SERVER_API_KEY ? { "X-API-KEY": AI_SERVER_API_KEY } : {}
          },
          body: JSON.stringify(aiPayload)
        }, log);
        if (!aiRes.ok) {
          const txt = await aiRes.text().catch(() => "");
          throw new Error(`AI server ${aiRes.status}: ${txt.slice(0, 200)}`);
        }
        aiData = await aiRes.json();
      } catch (err) {
        log(`AI server failed: ${err}`);
        aiData = null;
      }
      if (aiData) {
        await setProgress(60);
        log(`AI returned ${aiData.ranked?.length ?? 0} ranked items`);
        const normalizedCountries = aiData.normalized?.countries ?? [];
        if (normalizedCountries.length > 0) {
          try {
            const counts = await performIngest(normalizedCountries, runId);
            log(`ingest done: ${JSON.stringify(counts)}`);
          } catch (err) {
            log(`ingest non-fatal: ${err}`);
          }
          await database_default.dataSourceMeta.upsert({
            where: { cacheKey },
            create: { cacheKey, lastScrapedAt: /* @__PURE__ */ new Date(), parserVersion: "1" },
            update: { lastScrapedAt: /* @__PURE__ */ new Date() }
          }).catch(() => {
          });
        }
        await setProgress(80);
        ranked = await mapAiRankedToIds(aiData.ranked ?? []);
      } else {
        log("AI unavailable \u2014 falling back to cached DB ranking");
        await setProgress(60);
        ranked = await rankFromDB(profile, targetCountries, intendedLevel, intendedMajor);
        await setProgress(80);
      }
    }
    await setProgress(95);
    if (ranked.length > 0) {
      await database_default.matchResult.createMany({
        data: ranked.map((r) => ({
          runId,
          programId: r.programId ?? null,
          score: r.score,
          reasons: r.reasons,
          rawData: r.rawData ?? null
        }))
      });
    }
    await database_default.matchRun.update({
      where: { id: runId },
      data: {
        status: "done",
        progress: 100,
        error: ranked.length === 0 ? "No programmes found for your profile. Try adjusting your preferences." : null
      }
    });
    log(`done \u2014 ${ranked.length} results`);
  } catch (err) {
    console.error(`[match:${runId}] unhandled:`, err);
    await markError(err);
  }
}
async function mapAiRankedToIds(aiRanked) {
  if (!aiRanked.length) return [];
  const codes = [...new Set(aiRanked.map((r) => r.program_key.country_code.toUpperCase()))];
  const countries = await database_default.country.findMany({ where: { code: { in: codes } } });
  const countryMap = new Map(countries.map((c) => [c.code, c.id]));
  const uniKeySeen = /* @__PURE__ */ new Set();
  const uniConds = [];
  for (const r of aiRanked) {
    const cid = countryMap.get(r.program_key.country_code.toUpperCase());
    if (!cid) continue;
    const k = `${cid}:${r.program_key.university_name}`;
    if (!uniKeySeen.has(k)) {
      uniKeySeen.add(k);
      uniConds.push({ countryId: cid, name: r.program_key.university_name });
    }
  }
  const universities = uniConds.length ? await database_default.university.findMany({ where: { OR: uniConds } }) : [];
  const uniMap = new Map(universities.map((u) => [`${u.countryId}:${u.name}`, u.id]));
  const progKeySeen = /* @__PURE__ */ new Set();
  const progConds = [];
  for (const r of aiRanked) {
    const cid = countryMap.get(r.program_key.country_code.toUpperCase());
    const uniId = cid ? uniMap.get(`${cid}:${r.program_key.university_name}`) : void 0;
    const lvl = normalizeLevel(r.program_key.level);
    if (!uniId || !lvl) continue;
    const k = `${uniId}:${r.program_key.program_title}:${lvl}`;
    if (!progKeySeen.has(k)) {
      progKeySeen.add(k);
      progConds.push({ universityId: uniId, title: r.program_key.program_title, level: lvl });
    }
  }
  const programs = progConds.length ? await database_default.program.findMany({ where: { OR: progConds } }) : [];
  const progMap = new Map(programs.map((p) => [`${p.universityId}:${p.title}:${p.level}`, p.id]));
  return aiRanked.map((r) => {
    const cid = countryMap.get(r.program_key.country_code.toUpperCase());
    const uniId = cid ? uniMap.get(`${cid}:${r.program_key.university_name}`) : void 0;
    const lvl = normalizeLevel(r.program_key.level);
    const progId = uniId && lvl ? progMap.get(`${uniId}:${r.program_key.program_title}:${lvl}`) ?? null : null;
    return { score: r.score, reasons: r.reasons, programId: progId, rawData: progId ? null : { ...r.program_key } };
  });
}
async function rankFromDB(profile, targetCountries, levelRaw, major) {
  const level = normalizeLevel(levelRaw);
  if (!level) return [];
  let uniIds;
  if (targetCountries.length) {
    const countries = await database_default.country.findMany({
      where: { code: { in: targetCountries.map((c) => c.toUpperCase()) } },
      select: { id: true }
    });
    if (!countries.length) return [];
    uniIds = (await database_default.university.findMany({
      where: { countryId: { in: countries.map((c) => c.id) } },
      select: { id: true }
    })).map((u) => u.id);
  } else {
    uniIds = (await database_default.university.findMany({ select: { id: true }, take: 500 })).map((u) => u.id);
  }
  if (!uniIds.length) return [];
  const terms = getMajorTerms(major);
  const programs = await database_default.program.findMany({
    where: {
      universityId: { in: uniIds },
      level,
      OR: terms.length ? [
        ...terms.map((t) => ({ field: { contains: t, mode: "insensitive" } })),
        ...terms.map((t) => ({ title: { contains: t, mode: "insensitive" } }))
      ] : void 0
    },
    include: {
      university: { include: { country: true } },
      requirements: true
    },
    take: 50,
    orderBy: { createdAt: "desc" }
  });
  const budgetMax = profile.budgetAmountUSD ?? (profile.budgetMax != null ? toUSD(profile.budgetMax, profile.budgetCurrency ?? "USD") ?? Infinity : Infinity);
  const userGpa = profile.gpa ?? 0;
  return programs.map((p) => {
    let score = 0;
    const reasons = [];
    score += 25;
    reasons.push(`Located in ${p.university.country.name}`);
    score += 20;
    reasons.push(`${level} level match`);
    const fld = p.field.toLowerCase();
    if (terms.some((t) => fld.includes(t))) {
      score += 20;
      reasons.push(`Field match: ${p.field}`);
    }
    if (p.tuitionMinUSD !== null && p.tuitionMinUSD <= budgetMax) {
      score += 20;
      reasons.push(`Within budget ($${p.tuitionMinUSD.toLocaleString()}\u2013$${(p.tuitionMaxUSD ?? p.tuitionMinUSD).toLocaleString()}/yr)`);
    }
    const gpaReq = p.requirements.find((r) => r.key === "GPA");
    if (gpaReq && userGpa >= parseFloat(gpaReq.value)) {
      score += 15;
      reasons.push(`GPA meets minimum`);
    }
    return { score: Math.min(100, score), reasons, programId: p.id, rawData: null };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 20);
}
var getLatestMatch = async (req, res) => {
  const userId = req.userId;
  try {
    const run = await database_default.matchRun.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        results: {
          orderBy: { score: "desc" },
          include: {
            program: {
              include: {
                university: { include: { country: true } },
                deadlines: { orderBy: { deadline: "asc" }, take: 3 }
              }
            }
          }
        }
      }
    });
    if (!run) {
      res.status(200).json({ run: null });
      return;
    }
    const results = run.results.map((r) => ({
      id: r.id,
      runId: r.runId,
      programId: r.programId,
      score: r.score,
      reasons: r.reasons,
      createdAt: r.createdAt,
      rawData: r.program ? {
        program_title: r.program.title,
        university_name: r.program.university.name,
        country: r.program.university.country.name,
        country_code: r.program.university.country.code,
        city: r.program.university.city ?? null,
        university_website: r.program.university.website ?? null,
        university_description: r.program.university.description ?? null,
        level: r.program.level,
        field: r.program.field,
        duration_months: r.program.durationMonths ?? null,
        tuition_usd_per_year: r.program.tuitionMinUSD ?? null,
        tuition_max_usd: r.program.tuitionMaxUSD ?? null,
        application_url: r.program.sourceUrl ?? null,
        description: r.program.description ?? null,
        next_deadline: r.program.deadlines[0]?.deadline ?? null,
        next_deadline_term: r.program.deadlines[0]?.term ?? null,
        updated_at: r.program.updatedAt
      } : r.rawData
    }));
    res.status(200).json({
      run: {
        id: run.id,
        userId: run.userId,
        status: run.status,
        progress: run.progress,
        error: run.error,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        results
      }
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch latest match" });
  }
};
var getRunStatus = async (req, res) => {
  const userId = req.userId;
  const { runId } = req.params;
  try {
    const run = await database_default.matchRun.findFirst({
      where: { id: runId, userId },
      select: { id: true, status: true, progress: true, error: true, updatedAt: true }
    });
    if (!run) {
      res.status(404).json({ message: "Run not found." });
      return;
    }
    res.status(200).json(run);
  } catch {
    res.status(500).json({ message: "Failed to fetch run status" });
  }
};

// src/routes/match.router.ts
var router5 = Router5();
router5.post("/run", authMiddleware, runMatch);
router5.get("/latest", authMiddleware, getLatestMatch);
router5.get("/run/:runId/status", authMiddleware, getRunStatus);
var match_router_default = router5;

// src/routes/savedProgram.router.ts
import { Router as Router6 } from "express";

// src/controllers/savedProgram.controller.ts
init_database();
var getSavedPrograms = async (req, res) => {
  try {
    const saved = await database_default.savedProgram.findMany({
      where: { userId: req.userId },
      include: {
        program: {
          include: {
            university: { include: { country: true } },
            requirements: true,
            deadlines: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ savedPrograms: saved });
  } catch {
    res.status(500).json({ message: "Failed to fetch saved programs" });
  }
};
var saveProgram = async (req, res) => {
  try {
    const { programId } = req.body;
    if (!programId) {
      return res.status(400).json({ message: "programId is required" });
    }
    const program = await database_default.program.findUnique({ where: { id: programId } });
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    const saved = await database_default.savedProgram.upsert({
      where: { userId_programId: { userId: req.userId, programId } },
      update: {},
      create: { userId: req.userId, programId }
    });
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to save program" });
  }
};
var unsaveProgram = async (req, res) => {
  try {
    const programId = Array.isArray(req.params.programId) ? req.params.programId[0] : req.params.programId;
    await database_default.savedProgram.deleteMany({
      where: { userId: req.userId, programId }
    });
    res.status(200).json({ message: "Program removed from saved list" });
  } catch {
    res.status(500).json({ message: "Failed to unsave program" });
  }
};

// src/routes/savedProgram.router.ts
var router6 = Router6();
router6.get("/", authMiddleware, getSavedPrograms);
router6.post("/", authMiddleware, saveProgram);
router6.delete("/:programId", authMiddleware, unsaveProgram);
var savedProgram_router_default = router6;

// src/routes/ingest.router.ts
import { Router as Router7 } from "express";

// src/controllers/ingest.controller.ts
init_database();
var CONFIGURED_KEY = process.env.INGEST_API_KEY;
function verifyIngestKey(req, res) {
  if (!CONFIGURED_KEY) {
    res.status(503).json({ error: "INGEST_API_KEY is not configured on this server" });
    return false;
  }
  const provided = req.headers["x-ingest-key"];
  if (!provided || provided !== CONFIGURED_KEY) {
    res.status(401).json({ error: "Unauthorized: missing or invalid X-INGEST-KEY header" });
    return false;
  }
  return true;
}
var ingestModule1 = async (req, res) => {
  if (!verifyIngestKey(req, res)) return;
  const body = req.body;
  if (!Array.isArray(body?.countries) || body.countries.length === 0) {
    res.status(400).json({ error: "payload.countries must be a non-empty array" });
    return;
  }
  try {
    const counts = await performIngest(body.countries, body.runId);
    res.status(200).json({ ok: true, upserted: counts, runId: body.runId });
  } catch (err) {
    console.error("[ingest] error:", err);
    res.status(500).json({ ok: false, error: "Ingestion failed", details: String(err) });
  }
};
var getModule1Stats = async (req, res) => {
  if (!verifyIngestKey(req, res)) return;
  try {
    const [countries, universities, programs, requirements, deadlines, matchRuns, matchResults] = await Promise.all([
      database_default.country.count(),
      database_default.university.count(),
      database_default.program.count(),
      database_default.programRequirement.count(),
      database_default.programDeadline.count(),
      database_default.matchRun.count(),
      database_default.matchResult.count()
    ]);
    res.status(200).json({ countries, universities, programs, requirements, deadlines, matchRuns, matchResults });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", details: String(err) });
  }
};

// src/routes/ingest.router.ts
var router7 = Router7();
router7.post("/module1/ingest", ingestModule1);
router7.get("/module1/stats", getModule1Stats);
var ingest_router_default = router7;

// src/routes/timeline.router.ts
import { Router as Router8 } from "express";

// src/controllers/timeline.controller.ts
init_database();
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function toYYYYMM(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function makeTaskId(monthKey, qualifier) {
  const slug = qualifier.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
  return `${monthKey}_${slug}`;
}
function resolveStatus(date, now) {
  if (!date) return "pending";
  return date < now ? "overdue" : "pending";
}
function buildRoadmap(anchorDate, programDeadlines, scholarshipDeadlines, visaMilestones, previousStatuses) {
  const now = /* @__PURE__ */ new Date();
  const start = addMonths(anchorDate, -13);
  const end = addMonths(anchorDate, 3);
  const monthMap = /* @__PURE__ */ new Map();
  let cur = new Date(start);
  while (cur <= end) {
    const key = toYYYYMM(cur);
    monthMap.set(key, {
      month: key,
      label: cur.toLocaleString("en-US", { month: "long", year: "numeric" }),
      items: []
    });
    cur = addMonths(cur, 1);
  }
  const pushItem = (date, item) => {
    const key = toYYYYMM(date);
    const slot = monthMap.get(key);
    if (!slot) return;
    const stored = previousStatuses.get(item.id);
    const status = stored ?? resolveStatus(date, now);
    slot.items.push({ ...item, status });
  };
  const phases = [
    {
      offsetMonths: -13,
      items: [
        {
          type: "preparation",
          title: "Define your study-abroad goals",
          description: "Clarify your target degree level, field, countries, and budget to focus your planning efforts.",
          priority: "medium",
          estimatedDuration: "1 week"
        },
        {
          type: "preparation",
          title: "Research funding and scholarships",
          description: "Identify scholarship opportunities and financial aid early \u2014 many deadlines run months before admission.",
          priority: "high",
          estimatedDuration: "2 weeks"
        }
      ]
    },
    {
      offsetMonths: -12,
      items: [
        {
          type: "preparation",
          title: "Shortlist target programs",
          description: "Research programs aligned with your profile, budget, and career goals across your target countries.",
          priority: "high",
          estimatedDuration: "2\u20133 weeks"
        },
        {
          type: "preparation",
          title: "Start IELTS / TOEFL preparation",
          description: "Enrol in a test prep course if needed. Target 7.0+ IELTS or 100+ TOEFL for competitive programs.",
          priority: "high",
          estimatedDuration: "2\u20133 months"
        }
      ]
    },
    {
      offsetMonths: -10,
      items: [
        {
          type: "preparation",
          title: "Start GRE / GMAT preparation",
          description: "Begin prep for any quantitative tests required by your target programs.",
          priority: "high",
          estimatedDuration: "2\u20133 months"
        },
        {
          type: "preparation",
          title: "Contact referees for LOR",
          description: "Reach out to professors or managers who will write your Letters of Recommendation. Give them 3+ months.",
          priority: "high",
          estimatedDuration: "1 week"
        },
        {
          type: "preparation",
          title: "Request official transcripts",
          description: "Start the transcript retrieval process from your institution \u2014 it can take weeks.",
          priority: "high",
          estimatedDuration: "2\u20134 weeks"
        }
      ]
    },
    {
      offsetMonths: -8,
      items: [
        {
          type: "preparation",
          title: "Take English proficiency test",
          description: "Sit IELTS, TOEFL, or equivalent to have official scores ready before applications open.",
          priority: "critical",
          estimatedDuration: "1 day"
        },
        {
          type: "preparation",
          title: "Take GRE / GMAT",
          description: "Sit the required quantitative test and ensure scores will be delivered to your target universities.",
          priority: "critical",
          estimatedDuration: "1 day"
        },
        {
          type: "preparation",
          title: "Draft SOP outline",
          description: "Create a structured outline for your Statement of Purpose covering motivation, background, and goals.",
          priority: "high",
          estimatedDuration: "1\u20132 weeks"
        }
      ]
    },
    {
      offsetMonths: -6,
      items: [
        {
          type: "application",
          title: "Finalise SOP & personal statement",
          description: "Complete polished, tailored SOPs for each program. Have them reviewed by a mentor or advisor.",
          priority: "critical",
          estimatedDuration: "2\u20134 weeks"
        },
        {
          type: "application",
          title: "Update CV / r\xE9sum\xE9",
          description: "Tailor your academic or professional CV to match each program's expectations.",
          priority: "critical",
          estimatedDuration: "1 week"
        },
        {
          type: "application",
          title: "Open university application portals",
          description: "Create accounts on each university's application system and begin filling out forms.",
          priority: "critical",
          estimatedDuration: "1\u20132 weeks"
        }
      ]
    },
    {
      offsetMonths: -4,
      items: [
        {
          type: "application",
          title: "Submit all applications",
          description: "Submit before each deadline. Follow up with referees on LOR submissions. Keep confirmation records.",
          priority: "critical",
          estimatedDuration: "1\u20132 weeks"
        },
        {
          type: "scholarship",
          title: "Submit scholarship applications",
          description: "Many scholarship deadlines fall before or at the same time as admission deadlines. Prioritise these.",
          priority: "critical",
          estimatedDuration: "1\u20132 weeks"
        },
        {
          type: "preparation",
          title: "Follow up on outstanding LORs",
          description: "Check that all referees have submitted their letters to your target universities.",
          priority: "high",
          estimatedDuration: "1\u20132 days"
        }
      ]
    },
    {
      offsetMonths: -2,
      items: [
        {
          type: "visa",
          title: "Gather visa documents",
          description: "Collect bank statements, financial guarantees, proof of admission, passport, and medical records as required.",
          priority: "critical",
          estimatedDuration: "2\u20133 weeks"
        },
        {
          type: "preparation",
          title: "Research and apply for housing",
          description: "Apply for university accommodation or shortlist private housing in your target city.",
          priority: "medium",
          estimatedDuration: "1\u20132 weeks"
        },
        {
          type: "preparation",
          title: "Plan pre-departure finances",
          description: "Arrange a travel-friendly bank card, health insurance, and initial living expenses for arrival.",
          priority: "medium",
          estimatedDuration: "1 week"
        }
      ]
    },
    {
      offsetMonths: -1,
      items: [
        {
          type: "visa",
          title: "Book and attend visa appointment",
          description: "Schedule a visa appointment at the consulate. Prepare for biometrics, interview, and document verification.",
          priority: "critical",
          estimatedDuration: "1\u20132 weeks"
        },
        {
          type: "preparation",
          title: "Book flights",
          description: "Confirm travel dates and book flights to arrive before orientation.",
          priority: "high",
          estimatedDuration: "1\u20132 days"
        }
      ]
    },
    {
      offsetMonths: 0,
      items: [
        {
          type: "preparation",
          title: "Arrive and complete pre-registration",
          description: "Complete all university arrival formalities, accommodation check-in, and document verification before intake.",
          priority: "critical",
          estimatedDuration: "1 week"
        }
      ]
    },
    {
      offsetMonths: 1,
      items: [
        {
          type: "preparation",
          title: "University orientation & course registration",
          description: "Attend orientation, register for courses, set up student services, and open a local bank account.",
          priority: "low",
          estimatedDuration: "1\u20132 weeks"
        }
      ]
    }
  ];
  for (const phase of phases) {
    const phaseDate = addMonths(anchorDate, phase.offsetMonths);
    const monthKey = toYYYYMM(phaseDate);
    for (const item of phase.items) {
      const id = makeTaskId(monthKey, item.title);
      pushItem(phaseDate, { ...item, id, date: phaseDate.toISOString() });
    }
  }
  for (const pd of programDeadlines) {
    const monthKey = toYYYYMM(pd.deadline);
    const id = makeTaskId(monthKey, `deadline_${pd.programId}`);
    pushItem(pd.deadline, {
      id,
      type: "deadline",
      title: `Application deadline \u2014 ${pd.programTitle}`,
      description: `Deadline (${pd.term}) for ${pd.programTitle} at ${pd.university}. Submit before this date.`,
      date: pd.deadline.toISOString(),
      sourceId: pd.programId,
      priority: "critical"
    });
  }
  for (const sd of scholarshipDeadlines) {
    const monthKey = toYYYYMM(sd.deadline);
    const id = makeTaskId(monthKey, `scholarship_${sd.scholarshipId}`);
    pushItem(sd.deadline, {
      id,
      type: "scholarship",
      title: `Scholarship deadline \u2014 ${sd.title}`,
      description: `Deadline${sd.term ? ` (${sd.term})` : ""} for ${sd.title}. Prepare materials well in advance.`,
      date: sd.deadline.toISOString(),
      sourceId: sd.scholarshipId,
      priority: "critical"
    });
  }
  const VISA_MILESTONE_PRIORITY = {
    shortlist: "medium",
    tests: "high",
    documents: "high",
    apply: "critical",
    scholarships: "critical",
    visa_docs: "critical",
    visa_submit: "critical",
    interview: "critical",
    housing: "medium"
  };
  for (const vm of visaMilestones) {
    const vmDate = new Date(anchorDate.getTime() + vm.offsetDays * 24 * 60 * 60 * 1e3);
    const monthKey = toYYYYMM(vmDate);
    const id = makeTaskId(monthKey, `visa_${vm.key}`);
    pushItem(vmDate, {
      id,
      type: "visa",
      title: vm.label,
      description: vm.notes ?? "",
      date: vmDate.toISOString(),
      sourceId: vm.key,
      priority: VISA_MILESTONE_PRIORITY[vm.key] ?? "medium"
    });
  }
  return Array.from(monthMap.values()).filter((m) => m.items.length > 0);
}
var getTimelineInputs = async (req, res) => {
  const userId = req.userId;
  const countryCode = req.query.countryCode ?? null;
  try {
    const [profile, savedPrograms, visaTemplate, scholarships] = await Promise.all([
      database_default.userProfile.findUnique({ where: { userId } }),
      database_default.savedProgram.findMany({
        where: { userId },
        include: {
          program: {
            include: {
              university: { include: { country: true } },
              deadlines: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      countryCode ? database_default.visaTimelineTemplate.findUnique({ where: { countryCode } }) : null,
      countryCode ? database_default.scholarship.findMany({
        where: { countryCode },
        include: { deadlines: true },
        take: 20
      }) : []
    ]);
    const savedProgramsCount = savedPrograms.length;
    const countryPrograms = countryCode ? savedPrograms.filter((sp) => sp.program.university.country.code === countryCode) : [];
    const savedWithDeadlinesCount = savedPrograms.filter(
      (sp) => sp.program.deadlines.length > 0
    ).length;
    const missingDeadlinesCount = savedProgramsCount - savedWithDeadlinesCount;
    res.json({
      savedProgramsCount,
      savedWithDeadlinesCount,
      missingDeadlinesCount,
      savedPrograms,
      countryProgramsCount: countryPrograms.length,
      countryProgramsWithDeadlinesCount: countryPrograms.filter(
        (sp) => sp.program.deadlines.length > 0
      ).length,
      visaTemplateAvailable: Boolean(visaTemplate),
      profile,
      scholarships
    });
  } catch (err) {
    console.error("[timeline/inputs]", err);
    res.status(500).json({ message: "Failed to fetch timeline inputs" });
  }
};
var generateTimeline = async (req, res) => {
  const userId = req.userId;
  const { countryCode, intake } = req.body;
  if (!countryCode) {
    res.status(400).json({ message: "countryCode is required" });
    return;
  }
  try {
    const [profile, savedPrograms, scholarships, visaTemplate, prevRoadmap] = await Promise.all([
      database_default.userProfile.findUnique({ where: { userId } }),
      database_default.savedProgram.findMany({
        where: { userId },
        include: {
          program: {
            include: {
              university: { include: { country: true } },
              deadlines: true
            }
          }
        }
      }),
      database_default.scholarship.findMany({
        where: { countryCode },
        include: { deadlines: true },
        take: 20
      }),
      database_default.visaTimelineTemplate.findUnique({ where: { countryCode } }),
      database_default.userRoadmap.findFirst({
        where: { userId, countryCode },
        orderBy: { createdAt: "desc" }
      })
    ]);
    if (!profile) {
      res.status(400).json({ message: "Profile not found. Complete your profile first." });
      return;
    }
    const previousStatuses = /* @__PURE__ */ new Map();
    if (prevRoadmap) {
      const prevPlan = prevRoadmap.plan;
      for (const month of prevPlan) {
        for (const item of month.items) {
          if (item.id && (item.status === "completed" || item.status === "in_progress")) {
            previousStatuses.set(item.id, item.status);
          }
        }
      }
    }
    const countryPrograms = savedPrograms.filter(
      (sp) => sp.program.university.country.code === countryCode
    );
    const programDeadlines = countryPrograms.flatMap(
      (sp) => sp.program.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline,
        programTitle: sp.program.title,
        university: sp.program.university.name,
        programId: sp.program.id
      }))
    );
    let anchorDate;
    if (programDeadlines.length > 0) {
      const sorted = [...programDeadlines].sort(
        (a, b) => a.deadline.getTime() - b.deadline.getTime()
      );
      anchorDate = sorted[0].deadline;
    } else {
      const intakeStr = intake ?? profile.targetIntake ?? "";
      const fallMatch = intakeStr.match(/Fall\s+(\d{4})/i);
      const springMatch = intakeStr.match(/Spring\s+(\d{4})/i);
      const winterMatch = intakeStr.match(/Winter\s+(\d{4})/i);
      const summerMatch = intakeStr.match(/Summer\s+(\d{4})/i);
      if (fallMatch) {
        anchorDate = new Date(parseInt(fallMatch[1]), 8, 1);
      } else if (springMatch) {
        anchorDate = new Date(parseInt(springMatch[1]), 1, 1);
      } else if (winterMatch) {
        anchorDate = new Date(parseInt(winterMatch[1]), 0, 1);
      } else if (summerMatch) {
        anchorDate = new Date(parseInt(summerMatch[1]), 5, 1);
      } else {
        anchorDate = addMonths(/* @__PURE__ */ new Date(), 12);
      }
    }
    const scholarshipDeadlines = scholarships.flatMap(
      (s) => s.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline,
        title: s.title,
        scholarshipId: s.id
      }))
    );
    const visaMilestones = visaTemplate ? visaTemplate.milestones : [];
    const plan = buildRoadmap(
      anchorDate,
      programDeadlines,
      scholarshipDeadlines,
      visaMilestones,
      previousStatuses
    );
    const programIds = countryPrograms.map((sp) => sp.program.id);
    const scholarshipIds = scholarships.map((s) => s.id);
    const roadmap = await database_default.userRoadmap.create({
      data: {
        userId,
        countryCode,
        intake: intake ?? profile.targetIntake ?? null,
        startMonth: plan.length > 0 ? plan[0].month : toYYYYMM(addMonths(anchorDate, -13)),
        endMonth: plan.length > 0 ? plan[plan.length - 1].month : toYYYYMM(addMonths(anchorDate, 3)),
        plan,
        sources: {
          programIds,
          scholarshipIds,
          visaTemplateId: visaTemplate?.id ?? null,
          anchorDate: anchorDate.toISOString(),
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      }
    });
    res.json(roadmap);
  } catch (err) {
    console.error("[timeline/generate]", err);
    res.status(500).json({ message: "Failed to generate timeline" });
  }
};
var getLatestTimeline = async (req, res) => {
  const userId = req.userId;
  const countryCode = req.query.countryCode;
  try {
    const where = countryCode ? { userId, countryCode } : { userId };
    const roadmap = await database_default.userRoadmap.findFirst({
      where,
      orderBy: { createdAt: "desc" }
    });
    if (!roadmap) {
      res.status(404).json({ message: "No roadmap found. Generate one first." });
      return;
    }
    res.json(roadmap);
  } catch (err) {
    console.error("[timeline/latest]", err);
    res.status(500).json({ message: "Failed to fetch roadmap" });
  }
};
var updateTaskStatus = async (req, res) => {
  const userId = req.userId;
  const { roadmapId, taskId, status } = req.body;
  const VALID_STATUSES = ["pending", "in_progress", "completed", "overdue"];
  if (!roadmapId || !taskId || !status) {
    res.status(400).json({ message: "roadmapId, taskId, and status are required" });
    return;
  }
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
    return;
  }
  try {
    const roadmap = await database_default.userRoadmap.findFirst({
      where: { id: roadmapId, userId }
    });
    if (!roadmap) {
      res.status(404).json({ message: "Roadmap not found" });
      return;
    }
    const plan = roadmap.plan;
    let found = false;
    for (const month of plan) {
      for (const item of month.items) {
        if (item.id === taskId) {
          item.status = status;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) {
      res.status(404).json({ message: "Task not found in roadmap" });
      return;
    }
    const updated = await database_default.userRoadmap.update({
      where: { id: roadmapId },
      data: { plan }
    });
    res.json(updated);
  } catch (err) {
    console.error("[timeline/tasks]", err);
    res.status(500).json({ message: "Failed to update task status" });
  }
};

// src/routes/timeline.router.ts
var router8 = Router8();
router8.get("/inputs", authMiddleware, getTimelineInputs);
router8.post("/generate", authMiddleware, generateTimeline);
router8.get("/latest", authMiddleware, getLatestTimeline);
router8.patch("/tasks", authMiddleware, updateTaskStatus);
var timeline_router_default = router8;

// src/routes/strategy.router.ts
import { Router as Router9 } from "express";

// src/controllers/strategy.controller.ts
init_database();
import { createHash } from "crypto";
var AI_SERVER_URL2 = process.env.AI_SERVER_URL ?? "http://localhost:8888";
var AI_SERVER_API_KEY2 = process.env.AI_SERVER_API_KEY ?? "";
function buildCacheKey(userId, countryCode, intake, profileUpdatedAt, savedProgramsHash) {
  const raw2 = `${userId}:${countryCode}:${intake}:${profileUpdatedAt.toISOString()}:${savedProgramsHash}`;
  return createHash("sha256").update(raw2).digest("hex");
}
function hashProgramIds(ids) {
  return createHash("md5").update([...ids].sort().join(",")).digest("hex");
}
var generateStrategy = async (req, res) => {
  const userId = req.userId;
  const { countryCode, intake, focusProgramIds } = req.body;
  if (!countryCode) {
    res.status(400).json({ message: "countryCode is required" });
    return;
  }
  try {
    const [profile, savedPrograms] = await Promise.all([
      database_default.userProfile.findUnique({ where: { userId } }),
      database_default.savedProgram.findMany({
        where: { userId },
        include: {
          program: {
            include: {
              university: { include: { country: true } },
              requirements: true,
              deadlines: true
            }
          }
        }
      })
    ]);
    if (!profile) {
      res.status(400).json({ message: "Profile not found. Complete your profile first." });
      return;
    }
    const intakeStr = intake ?? profile.targetIntake ?? "";
    const countryPrograms = savedPrograms.filter(
      (sp) => sp.program.university.country.code === countryCode
    );
    const focusList = focusProgramIds?.length ? countryPrograms.filter((sp) => focusProgramIds.includes(sp.program.id)) : countryPrograms;
    const programIds = focusList.map((sp) => sp.program.id);
    const cacheKey = buildCacheKey(
      userId,
      countryCode,
      intakeStr,
      profile.updatedAt,
      hashProgramIds(programIds)
    );
    const cached = await database_default.strategyReport.findFirst({
      where: { userId, cacheKey },
      orderBy: { createdAt: "desc" }
    });
    if (cached) {
      res.json({ ...cached, cached: true });
      return;
    }
    const programsPayload = focusList.map((sp) => ({
      title: sp.program.title,
      university: sp.program.university.name,
      field: sp.program.field,
      level: sp.program.level,
      tuitionMinUSD: sp.program.tuitionMinUSD,
      tuitionMaxUSD: sp.program.tuitionMaxUSD,
      deadlines: sp.program.deadlines.map((d) => ({
        term: d.term,
        deadline: d.deadline.toISOString()
      })),
      requirements: sp.program.requirements.map((r) => ({ key: r.key, value: r.value }))
    }));
    const aiPayload = {
      profile: {
        currentStage: profile.currentStage,
        intendedLevel: profile.intendedLevel,
        majorOrTrack: profile.majorOrTrack,
        intendedMajor: profile.intendedMajor,
        // Primary signal: what the user wants to study abroad
        intendedAbroadMajor: profile.intendedAbroadMajor,
        careerGoal: profile.careerGoal,
        researchInterest: profile.researchInterest,
        gpa: profile.gpa,
        gpaScale: profile.gpaScale,
        englishTestType: profile.englishTestType,
        englishScore: profile.englishScore,
        gre: profile.gre,
        gmat: profile.gmat,
        budgetCurrency: profile.budgetCurrency,
        budgetMax: profile.budgetMax,
        fundingNeed: profile.fundingNeed,
        targetIntake: profile.targetIntake,
        workExperienceMonths: profile.workExperienceMonths
      },
      countryCode,
      intake: intakeStr,
      programs: programsPayload,
      savedCount: savedPrograms.length
    };
    const aiRes = await fetch(`${AI_SERVER_URL2}/api/v1/module1/strategy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": AI_SERVER_API_KEY2
      },
      body: JSON.stringify(aiPayload)
    });
    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => "unknown error");
      console.error("[strategy/generate] ai-server error:", aiRes.status, errText);
      res.status(502).json({ message: "AI server error. Please try again." });
      return;
    }
    const report = await aiRes.json();
    const saved = await database_default.strategyReport.create({
      data: {
        userId,
        countryCode,
        intake: intakeStr || null,
        programIds,
        cacheKey,
        report
      }
    });
    res.json({ ...saved, cached: false });
  } catch (err) {
    console.error("[strategy/generate]", err);
    res.status(500).json({ message: "Failed to generate strategy" });
  }
};
var getLatestStrategy = async (req, res) => {
  const userId = req.userId;
  const countryCode = req.query.countryCode;
  try {
    const where = countryCode ? { userId, countryCode } : { userId };
    const report = await database_default.strategyReport.findFirst({
      where,
      orderBy: { createdAt: "desc" }
    });
    if (!report) {
      res.status(404).json({ message: "No strategy report found. Generate one first." });
      return;
    }
    res.json(report);
  } catch (err) {
    console.error("[strategy/latest]", err);
    res.status(500).json({ message: "Failed to fetch strategy report" });
  }
};

// src/routes/strategy.router.ts
var router9 = Router9();
router9.post("/generate", authMiddleware, generateStrategy);
router9.get("/latest", authMiddleware, getLatestStrategy);
var strategy_router_default = router9;

// src/routes/chat.router.ts
import { Router as Router10 } from "express";

// src/controllers/chat.controller.ts
import { z } from "zod";

// src/services/chat.service.ts
init_database();
var AI_SERVER_URL3 = process.env.AI_SERVER_URL ?? "http://localhost:8001";
var AI_SERVER_API_KEY3 = process.env.AI_SERVER_API_KEY ?? "";
var CHAT_RATE_LIMIT_PER_MIN = Number(process.env.CHAT_RATE_LIMIT_PER_MIN ?? "0");
var OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
var GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
var OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
var ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";
var GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
var DIRECT_LLM_TIMEOUT = 28e3;
var RATE_LIMIT_WINDOW_MS = 6e4;
var CONTEXT_CACHE_TTL_MS = 5 * 6e4;
var rateLimitByUser = /* @__PURE__ */ new Map();
var contextCache = /* @__PURE__ */ new Map();
function getCachedContext(userId) {
  const entry = contextCache.get(userId);
  if (!entry || Date.now() > entry.expiresAt) {
    contextCache.delete(userId);
    return null;
  }
  return entry.ctx;
}
function setCachedContext(userId, ctx) {
  contextCache.set(userId, { ctx, expiresAt: Date.now() + CONTEXT_CACHE_TTL_MS });
  if (contextCache.size > 500) {
    const now = Date.now();
    for (const [key, val] of contextCache.entries()) {
      if (now > val.expiresAt) contextCache.delete(key);
    }
  }
}
var savedProgramInclude = {
  program: {
    include: {
      university: {
        include: {
          country: true
        }
      },
      deadlines: {
        orderBy: { deadline: "asc" },
        take: 3
      },
      requirements: {
        orderBy: { key: "asc" },
        take: 4
      }
    }
  }
};
var matchRunInclude = {
  results: {
    take: 10,
    orderBy: { score: "desc" },
    include: {
      program: {
        include: {
          university: {
            include: {
              country: true
            }
          }
        }
      }
    }
  }
};
var ChatServiceError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ChatServiceError";
  }
  statusCode;
};
function normalizeStringArray(value, limit = 5) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => typeof item === "string" ? item.trim() : "").filter(Boolean).slice(0, limit);
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function pickString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}
function pickNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function buildProfileContext(profile) {
  if (!profile) return null;
  const testScores = asRecord(profile.testScores);
  const tests = {};
  const maybeAssign = (key, value) => {
    const numberValue = pickNumber(value);
    const stringValue = pickString(value);
    if (numberValue !== null) tests[key] = numberValue;
    else if (stringValue !== null) tests[key] = stringValue;
  };
  if (testScores) {
    for (const [key, value] of Object.entries(testScores)) {
      maybeAssign(key, value);
    }
  }
  maybeAssign("englishTestType", profile.englishTestType);
  maybeAssign("englishScore", profile.englishScore);
  maybeAssign("GRE", profile.gre);
  maybeAssign("GMAT", profile.gmat);
  const targetCountries = Array.isArray(profile.targetCountries) ? profile.targetCountries.filter((country) => typeof country === "string") : [];
  return {
    sourceId: `profile:${profile.userId}`,
    stage: profile.currentStage ?? null,
    targetIntake: profile.targetIntake ?? null,
    targetCountries,
    level: profile.intendedLevel ?? profile.level ?? null,
    currentMajor: profile.majorOrTrack ?? null,
    // intendedAbroadMajor = what user wants to study abroad (primary signal)
    major: profile.intendedAbroadMajor ?? profile.intendedMajor ?? profile.majorOrTrack ?? null,
    careerGoal: profile.careerGoal ?? null,
    researchInterest: profile.researchInterest ?? null,
    budget: {
      currency: profile.budgetCurrency ?? null,
      max: profile.budgetMax ?? null
    },
    academics: {
      gpa: profile.gpa ?? null,
      gpaScale: profile.gpaScale ?? null,
      graduationYear: profile.graduationYear ?? null,
      backlogs: profile.backlogs ?? null,
      workExperienceMonths: profile.workExperienceMonths ?? null
    },
    tests,
    fundingNeed: profile.fundingNeed ?? null
  };
}
function summarizeTimelinePlan(planValue) {
  if (!Array.isArray(planValue)) return [];
  const highlights = [];
  for (const month of planValue) {
    const monthRecord = asRecord(month);
    const items = monthRecord ? monthRecord.items : null;
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      const itemRecord = asRecord(item);
      const title = itemRecord ? pickString(itemRecord.title) : null;
      if (title) highlights.push(title);
      if (highlights.length >= 6) return highlights;
    }
  }
  return highlights;
}
function summarizeStrategyReport(reportValue) {
  const report = asRecord(reportValue);
  if (!report) {
    return {
      summary: null,
      admissionBand: null,
      recommendedActions: [],
      risks: []
    };
  }
  const admissionChances = asRecord(report.admissionChances);
  const recommendedActions = Array.isArray(report.recommendedActions) ? report.recommendedActions.map((item) => {
    const record = asRecord(item);
    return record ? pickString(record.title) : null;
  }).filter((value) => Boolean(value)).slice(0, 4) : [];
  const risks = Array.isArray(report.riskAssessment) ? report.riskAssessment.map((item) => {
    const record = asRecord(item);
    return record ? pickString(record.risk) : null;
  }).filter((value) => Boolean(value)).slice(0, 4) : [];
  return {
    summary: pickString(report.summary),
    admissionBand: admissionChances ? pickString(admissionChances.band) : null,
    recommendedActions,
    risks
  };
}
function buildCompactUserContext(data) {
  const savedPrograms = data.savedPrograms.map((item) => ({
    sourceId: `program:${item.program.id}`,
    programId: item.program.id,
    title: item.program.title,
    university: item.program.university.name,
    countryCode: item.program.university.country.code,
    country: item.program.university.country.name,
    level: item.program.level,
    field: item.program.field,
    tuitionUSD: {
      min: item.program.tuitionMinUSD ?? null,
      max: item.program.tuitionMaxUSD ?? null
    },
    deadlines: item.program.deadlines.map((deadline) => ({
      term: deadline.term,
      deadline: deadline.deadline.toISOString()
    })),
    requirements: item.program.requirements.map((requirement) => ({
      key: requirement.key,
      value: requirement.value
    })),
    sourceUrl: item.program.sourceUrl ?? item.program.university.website ?? null
  }));
  const matchTop = data.latestMatchRun?.results.map((result) => {
    const rawData = asRecord(result.rawData);
    return {
      sourceId: result.programId ? `program:${result.programId}` : `match:${result.id}`,
      resultId: result.id,
      programId: result.programId,
      title: result.program?.title ?? pickString(rawData?.program_title) ?? pickString(rawData?.programTitle) ?? "Matched program",
      university: result.program?.university.name ?? pickString(rawData?.university_name) ?? pickString(rawData?.universityName),
      countryCode: result.program?.university.country.code ?? pickString(rawData?.country_code) ?? pickString(rawData?.countryCode),
      score: result.score,
      reasons: normalizeStringArray(result.reasons, 4)
    };
  }) ?? [];
  const latestRoadmap = data.latestRoadmap ? {
    sourceId: `roadmap:${data.latestRoadmap.id}`,
    roadmapId: data.latestRoadmap.id,
    countryCode: data.latestRoadmap.countryCode,
    intake: data.latestRoadmap.intake ?? null,
    range: {
      startMonth: data.latestRoadmap.startMonth,
      endMonth: data.latestRoadmap.endMonth
    },
    highlights: summarizeTimelinePlan(data.latestRoadmap.plan)
  } : null;
  const strategySnapshot = data.latestStrategy ? summarizeStrategyReport(data.latestStrategy.report) : null;
  const latestStrategy = data.latestStrategy ? {
    sourceId: `strategy:${data.latestStrategy.id}`,
    strategyId: data.latestStrategy.id,
    countryCode: data.latestStrategy.countryCode,
    intake: data.latestStrategy.intake ?? null,
    summary: strategySnapshot?.summary ?? null,
    admissionBand: strategySnapshot?.admissionBand ?? null,
    recommendedActions: strategySnapshot?.recommendedActions ?? [],
    risks: strategySnapshot?.risks ?? []
  } : null;
  return {
    profile: buildProfileContext(data.profile),
    savedPrograms,
    matchTop,
    timelineSummary: latestRoadmap,
    strategySummary: latestStrategy
  };
}
function applyRateLimit(userId) {
  if (!Number.isFinite(CHAT_RATE_LIMIT_PER_MIN) || CHAT_RATE_LIMIT_PER_MIN <= 0) return;
  const now = Date.now();
  const existing = rateLimitByUser.get(userId);
  if (!existing || now - existing.windowStartedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimitByUser.set(userId, { count: 1, windowStartedAt: now });
    return;
  }
  if (existing.count >= CHAT_RATE_LIMIT_PER_MIN) {
    throw new ChatServiceError(429, "Rate limit reached. Try again in a minute.");
  }
  existing.count += 1;
  rateLimitByUser.set(userId, existing);
}
function parseChatReply(payload) {
  const data = asRecord(payload);
  const sources = [];
  if (Array.isArray(data?.sources)) {
    for (const source of data.sources) {
      const record = asRecord(source);
      const type = record?.type === "web" ? "web" : record?.type === "internal" ? "internal" : null;
      const title = pickString(record?.title);
      if (!type || !title) continue;
      sources.push({
        type,
        title,
        id: pickString(record?.id) ?? void 0,
        url: pickString(record?.url) ?? void 0
      });
      if (sources.length >= 6) break;
    }
  }
  const confidenceValue = pickString(data?.confidence);
  const confidence = confidenceValue === "high" || confidenceValue === "medium" || confidenceValue === "low" ? confidenceValue : "medium";
  const answer = pickString(data?.answer);
  if (!answer) {
    throw new ChatServiceError(502, "Assistant service returned an invalid response.");
  }
  return {
    answer,
    bullets: normalizeStringArray(data?.bullets, 6),
    nextSteps: normalizeStringArray(data?.nextSteps, 6),
    sources,
    confidence
  };
}
async function loadCompactUserContext(userId) {
  const [profile, savedProgramsRaw, latestMatchRunRaw, latestRoadmap, latestStrategy] = await Promise.all([
    database_default.userProfile.findUnique({
      where: { userId }
    }),
    database_default.savedProgram.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: savedProgramInclude
    }),
    database_default.matchRun.findFirst({
      where: {
        userId,
        results: {
          some: {}
        }
      },
      orderBy: { createdAt: "desc" },
      include: matchRunInclude
    }),
    database_default.userRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    }),
    database_default.strategyReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    })
  ]);
  const savedPrograms = savedProgramsRaw;
  const latestMatchRun = latestMatchRunRaw;
  return buildCompactUserContext({
    profile,
    savedPrograms,
    latestMatchRun,
    latestRoadmap,
    latestStrategy
  });
}
function formatContextForPrompt(ctx) {
  const parts = [];
  if (ctx.profile) {
    const p = ctx.profile;
    const budgetStr = p.budget.max ? `${p.budget.currency ?? "USD"} ${p.budget.max.toLocaleString()}/yr` : "Not set";
    const gpaStr = p.academics.gpa ? `${p.academics.gpa}${p.academics.gpaScale ? `/${p.academics.gpaScale}` : ""}` : "Not set";
    const testStr = Object.entries(p.tests).map(([k, v]) => `${k}: ${v}`).join(", ") || "None";
    parts.push(
      `[STUDENT PROFILE]`,
      `Stage: ${p.stage ?? "\u2014"} | Intake: ${p.targetIntake ?? "\u2014"} | Countries: ${p.targetCountries.join(", ") || "\u2014"} | Level: ${p.level ?? "\u2014"}`,
      `Intended Abroad Program: ${p.major ?? "\u2014"} | Current Major: ${p.currentMajor ?? "\u2014"}`,
      `Career Goal: ${p.careerGoal ?? "\u2014"} | Research Interest: ${p.researchInterest ?? "\u2014"}`,
      `GPA: ${gpaStr} | Tests: ${testStr} | Budget: ${budgetStr} | Funding needed: ${p.fundingNeed === true ? "Yes" : p.fundingNeed === false ? "No" : "\u2014"}`
    );
  }
  if (ctx.savedPrograms.length > 0) {
    parts.push(`
[SAVED PROGRAMS \u2014 ${ctx.savedPrograms.length}]`);
    ctx.savedPrograms.slice(0, 8).forEach((sp, i) => {
      const tuition = sp.tuitionUSD.min ? `$${sp.tuitionUSD.min.toLocaleString()}\u2013$${(sp.tuitionUSD.max ?? sp.tuitionUSD.min).toLocaleString()}/yr` : "Tuition not listed";
      const deadlineStr = sp.deadlines.slice(0, 2).map((d) => `${d.term}: ${d.deadline.slice(0, 10)}`).join(", ");
      parts.push(`${i + 1}. ${sp.title} \u2014 ${sp.university} \u2014 ${sp.country}`);
      parts.push(`   ${tuition}${deadlineStr ? ` | Deadlines: ${deadlineStr}` : ""}`);
    });
  }
  if (ctx.matchTop.length > 0) {
    parts.push(`
[AI MATCH RESULTS \u2014 top ${Math.min(ctx.matchTop.length, 6)}]`);
    ctx.matchTop.slice(0, 6).forEach((m) => {
      const reason = m.reasons.slice(0, 2).join(", ");
      parts.push(`[${m.score}] ${m.title} \u2014 ${m.university ?? "?"} (${m.countryCode ?? "?"})${reason ? `: ${reason}` : ""}`);
    });
  }
  if (ctx.timelineSummary) {
    const t = ctx.timelineSummary;
    const hl = t.highlights.slice(0, 4).join(", ");
    parts.push(`
[TIMELINE \u2014 ${t.countryCode}, ${t.intake ?? "unknown intake"}]`);
    if (hl) parts.push(`Milestones: ${hl}`);
  }
  if (ctx.strategySummary) {
    const s = ctx.strategySummary;
    parts.push(`
[STRATEGY \u2014 ${s.countryCode}]`);
    if (s.admissionBand) parts.push(`Band: ${s.admissionBand}`);
    if (s.recommendedActions.length) parts.push(`Actions: ${s.recommendedActions.slice(0, 3).join("; ")}`);
    if (s.risks.length) parts.push(`Risks: ${s.risks.slice(0, 3).join("; ")}`);
  }
  return parts.join("\n");
}
var DIRECT_SYSTEM_PROMPT = `You are EducAI's study-abroad admissions consultant. Help users plan international education \u2014 universities, programs, visas, scholarships, admission requirements, and funding.

Rules:
- Be specific, actionable, and grounded in the user's data when available
- Use the user's profile context to personalise answers
- Never guarantee admission outcomes or visa approval
- For time-sensitive topics (visa rules, deadlines, fee changes), note the info may need verification
- confidence: "high" = specific data available; "medium" = general guidance; "low" = uncertain/general info

Respond ONLY with valid JSON in exactly this schema:
{
  "answer": "Main response in 1-3 sentences \u2014 direct and specific",
  "bullets": ["Key point 1", "Key point 2", "Key point 3"],
  "nextSteps": ["Actionable step 1", "Actionable step 2"],
  "confidence": "high|medium|low"
}`;
function buildLLMMessages(contextText, question, history) {
  const messages = [{ role: "system", content: DIRECT_SYSTEM_PROMPT }];
  for (const h of history.slice(-8)) {
    messages.push({ role: h.role, content: h.content });
  }
  const userContent = contextText ? `${contextText}

[QUESTION]
${question}` : question;
  messages.push({ role: "user", content: userContent });
  return messages;
}
function extractJSON(raw2) {
  try {
    return JSON.parse(raw2);
  } catch {
  }
  const stripped = raw2.replace(/^```(?:json)?\s*/m, "").replace(/\s*```\s*$/m, "").trim();
  try {
    return JSON.parse(stripped);
  } catch {
  }
  const match = raw2.match(/\{[\s\S]*\}/);
  if (match) try {
    return JSON.parse(match[0]);
  } catch {
  }
  throw new Error(`Cannot parse LLM response as JSON: ${raw2.slice(0, 200)}`);
}
function normalizeLLMReply(raw2) {
  const data = extractJSON(raw2);
  const answer = pickString(data.answer) ?? (Array.isArray(data.bullets) ? String(data.bullets[0] ?? "") : "");
  if (!answer) throw new ChatServiceError(502, "LLM returned an empty answer.");
  const confidence = ["high", "medium", "low"].includes(String(data.confidence)) ? data.confidence : "medium";
  return {
    answer,
    bullets: normalizeStringArray(data.bullets, 5),
    nextSteps: normalizeStringArray(data.nextSteps, 4),
    sources: [],
    confidence
  };
}
async function callOpenAICompatible(messages, baseUrl, apiKey, model) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.2, max_tokens: 900, response_format: { type: "json_object" } }),
    signal: AbortSignal.timeout(DIRECT_LLM_TIMEOUT)
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    if (res.status === 429) throw new ChatServiceError(429, "Rate limit reached. Try again in a minute.");
    throw new Error(`${baseUrl} error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty content from provider");
  return content;
}
async function callAnthropicDirect(messages) {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const convo = messages.filter((m) => m.role !== "system");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      system,
      messages: convo
    }),
    signal: AbortSignal.timeout(DIRECT_LLM_TIMEOUT)
  });
  if (!res.ok) {
    if (res.status === 429) throw new ChatServiceError(429, "Rate limit reached. Try again in a minute.");
    throw new Error(`Anthropic error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Empty content from Anthropic");
  return text;
}
async function callGeminiDirect(messages) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const userMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const body = {
    contents: [{ role: "user", parts: [{ text: userMsg }] }],
    systemInstruction: system ? { parts: [{ text: system }] } : void 0,
    generationConfig: { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: 900 }
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(DIRECT_LLM_TIMEOUT)
  });
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty content from Gemini");
  return text;
}
async function callDirectLLM(input, ctx) {
  const contextText = formatContextForPrompt(ctx);
  const messages = buildLLMMessages(contextText, input.message, input.history ?? []);
  const chain = [];
  if (OPENAI_API_KEY) chain.push(() => callOpenAICompatible(messages, "https://api.openai.com/v1", OPENAI_API_KEY, "gpt-4o-mini"));
  if (GROQ_API_KEY) chain.push(() => callOpenAICompatible(messages, "https://api.groq.com/openai/v1", GROQ_API_KEY, "llama-3.3-70b-versatile"));
  if (OPENROUTER_API_KEY) chain.push(() => callOpenAICompatible(messages, "https://openrouter.ai/api/v1", OPENROUTER_API_KEY, "meta-llama/llama-3.3-70b-instruct:free"));
  if (ANTHROPIC_API_KEY) chain.push(() => callAnthropicDirect(messages));
  if (GEMINI_API_KEY) chain.push(() => callGeminiDirect(messages));
  if (chain.length === 0) throw new Error("No direct LLM provider configured");
  let lastErr = new Error("No LLM provider configured");
  let allRateLimited = true;
  for (const call of chain) {
    try {
      const raw2 = await call();
      return normalizeLLMReply(raw2);
    } catch (err) {
      lastErr = err;
      const is429 = err instanceof ChatServiceError && err.statusCode === 429;
      if (!is429) allRateLimited = false;
      console.warn(`[chat/direct] provider failed (${is429 ? "429" : err.message?.slice(0, 80) ?? "unknown"}), trying next`);
    }
  }
  if (allRateLimited) {
    throw new ChatServiceError(429, "The assistant is temporarily busy. Please wait a moment and try again.");
  }
  throw lastErr;
}
async function answerChatMessage(input) {
  applyRateLimit(input.userId);
  const cachedCtx = getCachedContext(input.userId);
  const userContext = cachedCtx ?? await loadCompactUserContext(input.userId);
  if (!cachedCtx) setCachedContext(input.userId, userContext);
  const hasDirectProvider = !!(OPENAI_API_KEY || GROQ_API_KEY || OPENROUTER_API_KEY || ANTHROPIC_API_KEY || GEMINI_API_KEY);
  if (hasDirectProvider) {
    try {
      return await callDirectLLM(input, userContext);
    } catch (err) {
      if (err instanceof ChatServiceError && err.statusCode === 429) throw err;
      console.warn("[chat/service] direct LLM failed, falling back to ai-server", err.message);
    }
  }
  let aiResponse;
  try {
    aiResponse = await fetch(`${AI_SERVER_URL3}/api/v1/chat/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AI_SERVER_API_KEY3 ? { "X-API-Key": AI_SERVER_API_KEY3 } : {}
      },
      body: JSON.stringify({
        message: input.message,
        userContext,
        conversation: {
          id: input.conversationId ?? `user:${input.userId}`,
          history: input.history?.slice(-6) ?? []
        }
      }),
      signal: AbortSignal.timeout(35e3)
      // 35s — reduced from 45s
    });
  } catch (error) {
    console.error("[chat/service] ai-server unavailable", error);
    if (hasDirectProvider) {
      throw new ChatServiceError(502, "The AI provider encountered an error. Please try again in a moment.");
    }
    throw new ChatServiceError(
      502,
      "No AI provider is configured. Add OPENAI_API_KEY to enable the assistant."
    );
  }
  if (!aiResponse.ok) {
    const errorPayload = await aiResponse.json().catch(() => null);
    const errorMessage = pickString(asRecord(errorPayload)?.detail) ?? pickString(asRecord(errorPayload)?.message) ?? "Failed to generate a reply.";
    if (aiResponse.status === 429) {
      throw new ChatServiceError(429, "Rate limit reached. Try again in a minute.");
    }
    throw new ChatServiceError(
      aiResponse.status >= 500 ? 502 : aiResponse.status,
      aiResponse.status >= 500 ? "The AI provider is temporarily unavailable. Please try again shortly." : errorMessage
    );
  }
  const payload = await aiResponse.json();
  return parseChatReply(payload);
}

// src/controllers/chat.controller.ts
var chatHistorySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4e3)
});
var chatRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4e3, "Message is too long"),
  conversationId: z.string().trim().min(1).max(200).optional(),
  history: z.array(chatHistorySchema).max(8).optional()
});
var postChat = async (req, res) => {
  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const { message, conversationId, history } = chatRequestSchema.parse(req.body);
    const reply = await answerChatMessage({
      userId: req.userId,
      message,
      conversationId,
      history
    });
    res.status(200).json({ reply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0]?.message ?? "Invalid chat request";
      res.status(400).json({ message: firstIssue });
      return;
    }
    if (error instanceof ChatServiceError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }
    console.error("[chat/post]", error);
    res.status(500).json({ message: "Failed to answer chat request" });
  }
};

// src/routes/chat.router.ts
var router10 = Router10();
router10.post("/", authMiddleware, postChat);
var chat_router_default = router10;

// src/routes/scholarship.router.ts
import { Router as Router11 } from "express";

// src/controllers/scholarship.controller.ts
import { z as z2 } from "zod";

// src/services/scholarship.service.ts
init_database();
function normalizeGpa(gpa, scale) {
  if (!gpa) return null;
  const scaleStr = (scale ?? "4.0").toString();
  if (scaleStr === "4.0") return gpa;
  if (scaleStr === "10") return gpa / 10 * 4;
  if (scaleStr === "5") return gpa / 5 * 4;
  if (scaleStr === "%") return gpa / 100 * 4;
  return gpa;
}
function gpaLabel(gpa, scale) {
  if (!gpa) return "N/A";
  return `${gpa} / ${scale ?? "4.0"}`;
}
function computeMatchScore(scholarship, profile) {
  let score = 0;
  const reasons = [];
  const profileLevel = (profile.intendedLevel ?? "").toUpperCase();
  if (scholarship.level && profileLevel && scholarship.level === profileLevel) {
    score += 30;
    reasons.push(`Matches your degree level (${scholarship.level})`);
  } else if (!scholarship.level) {
    score += 15;
    reasons.push("Open to all degree levels");
  }
  const targetCountries = profile.targetCountries ?? [];
  if (scholarship.countryCode && targetCountries.includes(scholarship.countryCode)) {
    score += 35;
    reasons.push(`In your target country`);
  } else if (!scholarship.countryCode) {
    score += 20;
    reasons.push("Global scholarship \u2014 open to your target country");
  }
  if (scholarship.fundingType === "full" && profile.fundingNeed === true) {
    score += 20;
    reasons.push("Full funding matches your stated financial need");
  } else if (scholarship.fundingType === "full") {
    score += 10;
    reasons.push("Full funding available");
  }
  const profileMajor = (profile.intendedAbroadMajor ?? profile.majorOrTrack ?? profile.intendedMajor ?? "").toLowerCase();
  const schField = (scholarship.field ?? "").toLowerCase();
  if (schField && profileMajor && (schField.includes(profileMajor) || profileMajor.includes(schField) || schField === "all fields")) {
    score += 15;
    if (schField !== "all fields") reasons.push(`Field matches your major (${scholarship.field})`);
  }
  const normGpa = normalizeGpa(profile.gpa, profile.gpaScale);
  if (scholarship.minGpa && normGpa !== null && normGpa >= scholarship.minGpa) {
    score += 10;
    reasons.push("Your GPA meets the minimum requirement");
  }
  return { score, reasons };
}
async function searchScholarships(filters) {
  const { q, countryCode, level, field, fundingType, financialNeed, page = 1, limit = 20, userProfile } = filters;
  const skip = (page - 1) * limit;
  const now = /* @__PURE__ */ new Date();
  const andClauses = [
    { isActive: true },
    {
      OR: [
        { deadlines: { some: { deadline: { gte: now } } } },
        { deadlines: { none: {} } }
      ]
    }
  ];
  if (countryCode) {
    andClauses.push({ OR: [{ countryCode }, { countryCode: null }] });
  }
  if (level) {
    andClauses.push({ level: level.toUpperCase() });
  }
  if (field) {
    andClauses.push({ field: { contains: field, mode: "insensitive" } });
  }
  if (fundingType) {
    andClauses.push({ fundingType: fundingType.toLowerCase() });
  }
  if (financialNeed === true) {
    andClauses.push({ financialNeedRequired: true });
  }
  if (q) {
    andClauses.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { provider: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { field: { contains: q, mode: "insensitive" } }
      ]
    });
  }
  const where = andClauses.length === 1 ? andClauses[0] : { AND: andClauses };
  const fetchLimit = userProfile ? Math.max(limit * 3, 60) : limit;
  const fetchSkip = userProfile ? 0 : skip;
  const [rawItems, total] = await Promise.all([
    database_default.scholarship.findMany({
      where,
      include: {
        deadlines: {
          orderBy: { deadline: "asc" },
          take: 3
        }
      },
      orderBy: { createdAt: "desc" },
      skip: fetchSkip,
      take: fetchLimit
    }),
    database_default.scholarship.count({ where })
  ]);
  if (userProfile) {
    const annotated = rawItems.map((item) => {
      const { score, reasons } = computeMatchScore(item, userProfile);
      return { ...item, userMatchScore: score, matchReasons: reasons };
    });
    annotated.sort((a, b) => {
      if (b.userMatchScore !== a.userMatchScore) return b.userMatchScore - a.userMatchScore;
      const aDeadline = a.deadlines[0]?.deadline?.getTime() ?? Infinity;
      const bDeadline = b.deadlines[0]?.deadline?.getTime() ?? Infinity;
      return aDeadline - bDeadline;
    });
    const pageItems = annotated.slice(skip, skip + limit);
    return { items: pageItems, total, page, limit, personalised: true };
  }
  return { items: rawItems, total, page, limit, personalised: false };
}
async function getScholarshipById(id) {
  return database_default.scholarship.findUnique({
    where: { id },
    include: {
      deadlines: {
        orderBy: { deadline: "asc" }
      }
    }
  });
}
async function getUpcomingDeadlines(daysAhead = 90) {
  const now = /* @__PURE__ */ new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1e3);
  return database_default.scholarshipDeadline.findMany({
    where: {
      deadline: { gte: now, lte: cutoff },
      scholarship: { isActive: true }
    },
    include: {
      scholarship: {
        select: {
          id: true,
          title: true,
          provider: true,
          countryCode: true,
          level: true,
          amount: true,
          fundingType: true,
          url: true
        }
      }
    },
    orderBy: { deadline: "asc" },
    take: 20
  });
}
async function checkEligibility(scholarshipId, profile) {
  const scholarship = await database_default.scholarship.findUnique({
    where: { id: scholarshipId },
    include: { deadlines: { orderBy: { deadline: "asc" }, take: 1 } }
  });
  if (!scholarship) {
    return {
      scholarshipId,
      status: "not_eligible",
      score: 0,
      metCriteria: [],
      missingCriteria: ["Scholarship not found"],
      improvementActions: [],
      confidence: "low"
    };
  }
  const met = [];
  const missing = [];
  const actions = [];
  let totalWeight = 0;
  let earnedWeight = 0;
  if (scholarship.minGpa) {
    totalWeight += 30;
    const normalised = normalizeGpa(profile.gpa, profile.gpaScale);
    if (normalised !== null && normalised >= scholarship.minGpa) {
      met.push(`GPA meets minimum (${gpaLabel(profile.gpa, profile.gpaScale)} \u2265 ${scholarship.minGpa}/4.0)`);
      earnedWeight += 30;
    } else {
      const needed = scholarship.minGpa;
      missing.push(`GPA below minimum (need \u2265 ${needed}/4.0, have ${gpaLabel(profile.gpa, profile.gpaScale)})`);
      actions.push(`Aim to raise your GPA to at least ${needed}/4.0 before applying`);
    }
  } else {
    met.push("No minimum GPA requirement");
    totalWeight += 10;
    earnedWeight += 10;
  }
  if (scholarship.level) {
    totalWeight += 20;
    const profileLevel = (profile.intendedLevel ?? profile.level ?? "").toUpperCase();
    if (profileLevel === scholarship.level.toString()) {
      met.push(`Degree level matches (${scholarship.level})`);
      earnedWeight += 20;
    } else {
      missing.push(`Degree level mismatch (scholarship is for ${scholarship.level}, you are targeting ${profileLevel || "unknown"})`);
      actions.push(`This scholarship is specifically for ${scholarship.level} programmes`);
    }
  }
  const eligibleNats = scholarship.eligibleNationalities;
  if (eligibleNats && eligibleNats.length > 0) {
    totalWeight += 25;
    const profileCountries = profile.targetCountries ?? [];
    met.push("Nationality eligibility: verify you are from an eligible country");
    earnedWeight += 12;
    actions.push(`Confirm your nationality is in the eligible list: ${eligibleNats.slice(0, 5).join(", ")}${eligibleNats.length > 5 ? "..." : ""}`);
  } else {
    met.push("Open to all nationalities");
    totalWeight += 25;
    earnedWeight += 25;
  }
  if (scholarship.requiresEnglishTest) {
    totalWeight += 15;
    if (profile.englishTestType && profile.englishScore) {
      met.push(`English test provided (${profile.englishTestType}: ${profile.englishScore})`);
      earnedWeight += 15;
    } else {
      missing.push("English proficiency test required (IELTS/TOEFL)");
      actions.push("Take IELTS or TOEFL and achieve the required score before applying");
    }
  }
  if (scholarship.financialNeedRequired) {
    totalWeight += 10;
    if (profile.fundingNeed === true) {
      met.push("Financial need requirement met (you indicated funding need)");
      earnedWeight += 10;
    } else {
      missing.push("This scholarship requires demonstrated financial need");
      actions.push("Prepare financial need documentation (income statements, bank statements)");
    }
  }
  const score = totalWeight > 0 ? Math.round(earnedWeight / totalWeight * 100) : 50;
  let status;
  if (missing.length === 0) {
    status = "eligible";
  } else if (score >= 50) {
    status = "partially_eligible";
  } else {
    status = "not_eligible";
  }
  const confidence = totalWeight >= 50 ? "high" : totalWeight >= 20 ? "medium" : "low";
  return {
    scholarshipId,
    status,
    score,
    metCriteria: met,
    missingCriteria: missing,
    improvementActions: actions,
    confidence
  };
}
async function predictFundingProbability(scholarshipId, profile) {
  const scholarship = await database_default.scholarship.findUnique({ where: { id: scholarshipId } });
  if (!scholarship) {
    return {
      scholarshipId,
      probabilityBand: "Low",
      probabilityPct: 0,
      factors: [],
      weaknesses: ["Scholarship not found"],
      improvementActions: [],
      confidence: "low"
    };
  }
  const factors = [];
  const weaknesses = [];
  const actions = [];
  const normalizedGpa = normalizeGpa(profile.gpa, profile.gpaScale);
  const minGpa = scholarship.minGpa ?? 2.5;
  let gpaScore = 0;
  if (normalizedGpa !== null) {
    gpaScore = Math.min(1, Math.max(0, (normalizedGpa - minGpa) / (4 - minGpa)));
    if (normalizedGpa < minGpa) {
      weaknesses.push(`GPA of ${profile.gpa} is below the ${minGpa}/4.0 minimum`);
      actions.push("Improve your academic record or look for scholarships with lower GPA requirements");
    }
  } else {
    gpaScore = 0.5;
  }
  factors.push({
    factor: "Academic Standing (GPA)",
    weight: 0.3,
    score: parseFloat(gpaScore.toFixed(2)),
    note: normalizedGpa !== null ? `${gpaLabel(profile.gpa, profile.gpaScale)} (min required: ${minGpa}/4.0)` : "GPA not provided \u2014 assumed neutral"
  });
  let englishScore = 0.5;
  if (scholarship.requiresEnglishTest) {
    if (profile.englishTestType && profile.englishScore) {
      if (profile.englishTestType === "IELTS") {
        englishScore = profile.englishScore >= 7.5 ? 1 : profile.englishScore >= 7 ? 0.85 : profile.englishScore >= 6.5 ? 0.65 : 0.3;
      } else if (profile.englishTestType === "TOEFL") {
        englishScore = profile.englishScore >= 105 ? 1 : profile.englishScore >= 95 ? 0.85 : profile.englishScore >= 80 ? 0.65 : 0.3;
      } else {
        englishScore = 0.7;
      }
    } else {
      englishScore = 0.1;
      weaknesses.push("English proficiency test not provided");
      actions.push("Take IELTS \u2265 7.0 or TOEFL \u2265 95 to strengthen your application");
    }
  } else {
    englishScore = profile.englishTestType ? 0.8 : 0.6;
  }
  factors.push({
    factor: "English Proficiency",
    weight: 0.2,
    score: parseFloat(englishScore.toFixed(2)),
    note: profile.englishTestType ? `${profile.englishTestType}: ${profile.englishScore}` : "No test score provided"
  });
  const profileFields = [
    profile.gpa,
    profile.englishTestType,
    profile.majorOrTrack ?? profile.intendedMajor,
    profile.workExperienceMonths,
    profile.fundingNeed
  ];
  const filled = profileFields.filter((f) => f !== null && f !== void 0).length;
  const completenessScore = filled / profileFields.length;
  if (completenessScore < 0.6) {
    weaknesses.push("Incomplete profile reduces match accuracy");
    actions.push("Complete your profile (GPA, test scores, major, work experience) for a more accurate assessment");
  }
  factors.push({
    factor: "Profile Completeness",
    weight: 0.15,
    score: parseFloat(completenessScore.toFixed(2)),
    note: `${filled}/${profileFields.length} key fields completed`
  });
  const workMonths = profile.workExperienceMonths ?? 0;
  let workScore = 0;
  if (workMonths >= 24) workScore = 1;
  else if (workMonths >= 12) workScore = 0.75;
  else if (workMonths >= 6) workScore = 0.5;
  else if (workMonths > 0) workScore = 0.25;
  else workScore = 0.2;
  factors.push({
    factor: "Work / Research Experience",
    weight: 0.15,
    score: parseFloat(workScore.toFixed(2)),
    note: workMonths > 0 ? `${workMonths} months` : "No work experience listed"
  });
  let needScore = 0.5;
  if (scholarship.financialNeedRequired) {
    needScore = profile.fundingNeed === true ? 1 : 0.2;
    if (profile.fundingNeed !== true) {
      weaknesses.push("Financial need required but not indicated in your profile");
      actions.push("If you have financial need, update your profile and prepare supporting documentation");
    }
  } else {
    needScore = 0.7;
  }
  factors.push({
    factor: "Financial Need Alignment",
    weight: 0.1,
    score: parseFloat(needScore.toFixed(2)),
    note: scholarship.financialNeedRequired ? profile.fundingNeed ? "Aligned \u2014 need indicated" : "Required but not indicated" : "No financial need requirement"
  });
  let levelScore = 0.5;
  if (scholarship.level) {
    const pLevel = (profile.intendedLevel ?? profile.level ?? "").toUpperCase();
    levelScore = pLevel === scholarship.level.toString() ? 1 : 0.1;
    if (levelScore < 0.5) {
      weaknesses.push(`Level mismatch: scholarship is for ${scholarship.level}`);
    }
  } else {
    levelScore = 0.75;
  }
  factors.push({
    factor: "Degree Level Match",
    weight: 0.1,
    score: parseFloat(levelScore.toFixed(2)),
    note: scholarship.level ? `Scholarship for ${scholarship.level}, your target: ${profile.intendedLevel ?? profile.level ?? "unknown"}` : "Open to all degree levels"
  });
  const rawPct = factors.reduce((acc, f) => acc + f.weight * f.score * 100, 0);
  const probabilityPct = Math.round(Math.min(95, Math.max(5, rawPct)));
  const probabilityBand = probabilityPct >= 65 ? "High" : probabilityPct >= 40 ? "Medium" : "Low";
  const confidence = filled >= 4 ? "high" : filled >= 2 ? "medium" : "low";
  return {
    scholarshipId,
    probabilityBand,
    probabilityPct,
    factors,
    weaknesses,
    improvementActions: actions,
    confidence
  };
}
async function getEligibleScholarships(profile, limit = 10) {
  const now = /* @__PURE__ */ new Date();
  const scholarships = await database_default.scholarship.findMany({
    where: {
      isActive: true,
      OR: [
        { deadlines: { some: { deadline: { gte: now } } } },
        { deadlines: { none: {} } }
      ]
    },
    include: { deadlines: { orderBy: { deadline: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const results = await Promise.all(
    scholarships.map(async (s) => {
      const eligibility = await checkEligibility(s.id, profile);
      return { scholarship: s, eligibility };
    })
  );
  return results.filter((r) => r.eligibility.status !== "not_eligible").sort((a, b) => b.eligibility.score - a.eligibility.score).slice(0, limit);
}

// src/services/liveScholarship.service.ts
init_database();
function isLiveRefreshAvailable() {
  return !!process.env.SERPER_API_KEY;
}
function getOpenAIConfig() {
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini"
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      apiKey: process.env.OPENROUTER_API_KEY,
      baseUrl: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini"
    };
  }
  return null;
}
function buildSearchQueries(options) {
  const { countryCodes = ["US", "UK", "CA", "AU", "DE"], levels = ["MSC", "PHD"], fields = [] } = options;
  const queries = [];
  for (const country of countryCodes.slice(0, 3)) {
    for (const level of levels.slice(0, 2)) {
      const levelLabel = level === "BSC" ? "undergraduate" : level === "MSC" ? "masters" : "PhD";
      queries.push(
        `international scholarships 2025 2026 for ${levelLabel} students in ${country} deadline`
      );
    }
  }
  for (const field of fields.slice(0, 2)) {
    const country = countryCodes[0] ?? "international";
    queries.push(`fully funded scholarships ${field} ${country} 2025 apply`);
  }
  if (queries.length < 3) {
    queries.push("fully funded international scholarships 2025 2026 masters PhD deadline apply");
    queries.push("scholarship opportunities international students 2025 no application fee deadline");
  }
  return queries.slice(0, 5);
}
async function searchSerper(query, apiKey) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey
    },
    body: JSON.stringify({ q: query, num: 10 }),
    signal: AbortSignal.timeout(15e3)
  });
  if (!response.ok) {
    throw new Error(`Serper returned HTTP ${response.status}`);
  }
  const data = await response.json();
  const organic = (data.organic ?? []).map((r) => ({
    title: String(r.title ?? ""),
    snippet: String(r.snippet ?? ""),
    link: String(r.link ?? "")
  }));
  return organic;
}
async function extractScholarship(result, config2) {
  const systemPrompt = `You are a scholarship data extractor. Extract only what the source explicitly states. Never invent data. Use null for unknown values. Respond with valid JSON only, no markdown.`;
  const userContent = `Extract scholarship data from this search result.

Title: ${result.title}
Snippet: ${result.snippet}
URL: ${result.link}

Return JSON matching this exact schema:
{
  "title": "string (scholarship name)",
  "provider": "string or null",
  "countryCode": "ISO-2 country code or null if global",
  "level": "BSC" or "MSC" or "PHD" or null,
  "field": "string or null",
  "amount": "string or null (e.g. 'Full tuition + living allowance')",
  "fundingType": "full" or "partial" or "living" or "research" or null,
  "deadline": "ISO date string (YYYY-MM-DD) or null",
  "url": "string or null",
  "description": "1-2 sentences or null",
  "confidence": "high" or "medium" or "low"
}

Set confidence to "high" if title, provider, and deadline are all clear. "medium" if some data is inferred. "low" if very uncertain.`;
  const response = await fetch(`${config2.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config2.apiKey}`
    },
    body: JSON.stringify({
      model: config2.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      temperature: 0,
      max_tokens: 400,
      response_format: { type: "json_object" }
    }),
    signal: AbortSignal.timeout(2e4)
  });
  if (!response.ok) {
    throw new Error(`LLM API returned HTTP ${response.status}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) return null;
  const parsed = JSON.parse(content);
  if (!parsed.title || typeof parsed.title !== "string" || parsed.title.trim() === "") {
    return null;
  }
  return {
    title: parsed.title.trim().slice(0, 300),
    provider: parsed.provider ? String(parsed.provider).slice(0, 200) : null,
    countryCode: parsed.countryCode ? String(parsed.countryCode).toUpperCase().slice(0, 10) : null,
    level: ["BSC", "MSC", "PHD"].includes(parsed.level ?? "") ? parsed.level : null,
    field: parsed.field ? String(parsed.field).slice(0, 100) : null,
    amount: parsed.amount ? String(parsed.amount).slice(0, 200) : null,
    fundingType: ["full", "partial", "living", "research"].includes(parsed.fundingType ?? "") ? parsed.fundingType : null,
    deadline: parsed.deadline ?? null,
    url: parsed.url ? String(parsed.url) : result.link,
    description: parsed.description ? String(parsed.description).slice(0, 1e3) : null,
    confidence: ["high", "medium", "low"].includes(parsed.confidence ?? "") ? parsed.confidence : "low"
  };
}
async function upsertScholarship(extracted, sourceUrl) {
  if (extracted.confidence === "low") return "skipped";
  const titleNorm = extracted.title.toLowerCase().trim();
  const existing = await database_default.scholarship.findFirst({
    where: {
      title: { equals: extracted.title, mode: "insensitive" },
      ...extracted.provider ? { provider: { equals: extracted.provider, mode: "insensitive" } } : {}
    },
    select: { id: true, tags: true }
  });
  const existingTags = Array.isArray(existing?.tags) ? existing.tags : [];
  const newTags = Array.from(/* @__PURE__ */ new Set([...existingTags, "live-sourced"]));
  let deadlineDate = null;
  if (extracted.deadline) {
    const d = new Date(extracted.deadline);
    if (!isNaN(d.getTime()) && d > /* @__PURE__ */ new Date()) {
      deadlineDate = d;
    }
  }
  const sharedData = {
    provider: extracted.provider,
    countryCode: extracted.countryCode,
    level: extracted.level,
    field: extracted.field,
    amount: extracted.amount,
    fundingType: extracted.fundingType,
    description: extracted.description,
    url: extracted.url,
    sourceUrl,
    lastVerified: /* @__PURE__ */ new Date(),
    isActive: true,
    tags: newTags
  };
  if (existing) {
    await database_default.scholarship.update({
      where: { id: existing.id },
      data: sharedData
    });
    if (deadlineDate) {
      await upsertScholarshipDeadline(existing.id, deadlineDate);
    }
    return "updated";
  }
  const created = await database_default.scholarship.create({
    data: {
      title: extracted.title,
      ...sharedData
    }
  });
  if (deadlineDate) {
    await upsertScholarshipDeadline(created.id, deadlineDate);
  }
  return "created";
}
async function upsertScholarshipDeadline(scholarshipId, deadline) {
  const existing = await database_default.scholarshipDeadline.findFirst({
    where: {
      scholarshipId,
      deadline: {
        gte: new Date(deadline.getTime() - 7 * 24 * 60 * 60 * 1e3),
        // ± 7 days tolerance
        lte: new Date(deadline.getTime() + 7 * 24 * 60 * 60 * 1e3)
      }
    }
  });
  if (!existing) {
    await database_default.scholarshipDeadline.create({
      data: {
        scholarshipId,
        deadline,
        term: "Application Deadline"
      }
    });
  }
}
async function wasRecentlyRefreshed(withinHours = 6) {
  const cutoff = new Date(Date.now() - withinHours * 60 * 60 * 1e3);
  const recentlyVerified = await database_default.scholarship.count({
    where: {
      isActive: true,
      lastVerified: { gte: cutoff },
      tags: { array_contains: ["live-sourced"] }
    }
  });
  return recentlyVerified > 0;
}
async function runLiveScholarshipRefresh(options = {}) {
  const start = Date.now();
  const result = {
    discovered: 0,
    upserted: 0,
    skipped: 0,
    errors: [],
    sourcesUsed: [],
    durationMs: 0
  };
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) {
    result.errors.push("SERPER_API_KEY not configured");
    result.durationMs = Date.now() - start;
    return result;
  }
  if (!options.force) {
    try {
      const fresh = await wasRecentlyRefreshed(6);
      if (fresh) {
        result.errors.push("Recently refreshed, skipping (set force=true to bypass)");
        result.durationMs = Date.now() - start;
        return result;
      }
    } catch {
    }
  }
  result.sourcesUsed.push("Serper");
  const llmConfig = getOpenAIConfig();
  if (llmConfig) {
    result.sourcesUsed.push(process.env.OPENAI_API_KEY ? "OpenAI" : "OpenRouter");
  } else {
    logger_default.warn("[liveScholarship] No LLM API key \u2014 extraction skipped, search attempted");
  }
  let queryOptions = options;
  if (!options.countryCodes || options.countryCodes.length === 0) {
    try {
      const profiles = await database_default.userProfile.findMany({
        select: { targetCountries: true, intendedMajor: true, intendedLevel: true },
        take: 30
      });
      const countries = [...new Set(
        profiles.flatMap((p) => p.targetCountries ?? []).filter(Boolean)
      )].slice(0, 5);
      const fields = [...new Set(profiles.map((p) => p.intendedMajor).filter(Boolean))].slice(0, 3);
      const levels = [...new Set(profiles.map((p) => p.intendedLevel).filter(Boolean))].slice(0, 3);
      queryOptions = {
        ...options,
        countryCodes: countries.length > 0 ? countries : ["US", "UK", "CA", "AU", "DE"],
        fields: fields.length > 0 ? fields : [],
        levels: levels.length > 0 ? levels : ["MSC", "PHD"]
      };
    } catch {
    }
  }
  const queries = buildSearchQueries(queryOptions);
  logger_default.info(`[liveScholarship] running ${queries.length} queries`);
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
    }
    let searchResults = [];
    try {
      searchResults = await searchSerper(query, serperKey);
      logger_default.info(`[liveScholarship] query="${query.slice(0, 60)}\u2026" \u2192 ${searchResults.length} results`);
    } catch (err) {
      const msg = `Serper search failed for query "${query.slice(0, 60)}": ${String(err)}`;
      result.errors.push(msg);
      logger_default.warn(`[liveScholarship] ${msg}`);
      continue;
    }
    result.discovered += searchResults.length;
    if (!llmConfig) {
      result.skipped += searchResults.length;
      continue;
    }
    for (const searchResult of searchResults) {
      try {
        const extracted = await extractScholarship(searchResult, llmConfig);
        if (!extracted) {
          result.skipped++;
          continue;
        }
        const outcome = await upsertScholarship(extracted, searchResult.link);
        if (outcome === "created" || outcome === "updated") {
          result.upserted++;
        } else {
          result.skipped++;
        }
      } catch (err) {
        const msg = `Failed to process result "${searchResult.title?.slice(0, 60)}": ${String(err)}`;
        result.errors.push(msg);
        result.skipped++;
        logger_default.warn(`[liveScholarship] ${msg}`);
      }
    }
  }
  result.durationMs = Date.now() - start;
  logger_default.info(
    `[liveScholarship] done \u2014 discovered=${result.discovered} upserted=${result.upserted} skipped=${result.skipped} errors=${result.errors.length} duration=${result.durationMs}ms`
  );
  return result;
}

// src/controllers/scholarship.controller.ts
init_database();
async function getUserProfile2(userId) {
  return database_default.userProfile.findUnique({ where: { userId } });
}
var SearchQuerySchema = z2.object({
  q: z2.string().optional(),
  countryCode: z2.string().max(10).optional(),
  level: z2.enum(["BSC", "MSC", "PHD"]).optional(),
  field: z2.string().max(100).optional(),
  fundingType: z2.enum(["full", "partial", "living", "research"]).optional(),
  financialNeed: z2.string().optional(),
  // "true" | "false"
  page: z2.coerce.number().int().min(1).optional().default(1),
  limit: z2.coerce.number().int().min(1).max(50).optional().default(20)
});
async function listScholarships(req, res) {
  const parsed = SearchQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters", errors: parsed.error.flatten() });
    return;
  }
  const { q, countryCode, level, field, fundingType, financialNeed, page, limit } = parsed.data;
  try {
    const userProfile = req.userId ? await getUserProfile2(req.userId) : null;
    const result = await searchScholarships({
      q,
      countryCode,
      level,
      field,
      fundingType,
      financialNeed: financialNeed === "true" ? true : void 0,
      page,
      limit,
      userProfile: userProfile ? {
        intendedLevel: userProfile.intendedLevel,
        intendedAbroadMajor: userProfile.intendedAbroadMajor,
        intendedMajor: userProfile.intendedMajor,
        majorOrTrack: userProfile.majorOrTrack,
        targetCountries: userProfile.targetCountries,
        fundingNeed: userProfile.fundingNeed,
        gpa: userProfile.gpa,
        gpaScale: userProfile.gpaScale
      } : null
    });
    res.status(200).json({ ...result, fetchedAt: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    console.error("[scholarship:list]", err);
    res.status(500).json({ message: "Failed to fetch scholarships" });
  }
}
async function getScholarship(req, res) {
  const id = String(req.params.id);
  try {
    const scholarship = await getScholarshipById(id);
    if (!scholarship) {
      res.status(404).json({ message: "Scholarship not found" });
      return;
    }
    res.status(200).json(scholarship);
  } catch (err) {
    console.error("[scholarship:get]", err);
    res.status(500).json({ message: "Failed to fetch scholarship" });
  }
}
async function listUpcomingDeadlines(req, res) {
  const daysAhead = Number(req.query.daysAhead ?? 90);
  try {
    const deadlines = await getUpcomingDeadlines(isNaN(daysAhead) ? 90 : daysAhead);
    res.status(200).json({ deadlines });
  } catch (err) {
    console.error("[scholarship:deadlines]", err);
    res.status(500).json({ message: "Failed to fetch upcoming deadlines" });
  }
}
async function listEligibleScholarships(req, res) {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }
  try {
    const profile = await getUserProfile2(userId);
    if (!profile) {
      res.status(200).json({ items: [], message: "Complete your profile for personalised eligibility" });
      return;
    }
    const results = await getEligibleScholarships({
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishTestType: profile.englishTestType,
      englishScore: profile.englishScore,
      fundingNeed: profile.fundingNeed,
      level: profile.level,
      intendedLevel: profile.intendedLevel,
      intendedAbroadMajor: profile.intendedAbroadMajor,
      majorOrTrack: profile.majorOrTrack,
      intendedMajor: profile.intendedMajor,
      workExperienceMonths: profile.workExperienceMonths,
      graduationYear: profile.graduationYear,
      targetCountries: profile.targetCountries
    });
    res.status(200).json({ items: results });
  } catch (err) {
    console.error("[scholarship:eligible]", err);
    res.status(500).json({ message: "Failed to compute eligible scholarships" });
  }
}
var EligibilityBodySchema = z2.object({
  profileOverride: z2.object({
    gpa: z2.number().optional(),
    gpaScale: z2.string().optional(),
    englishTestType: z2.string().optional(),
    englishScore: z2.number().optional(),
    fundingNeed: z2.boolean().optional(),
    intendedLevel: z2.string().optional()
  }).optional()
});
async function checkScholarshipEligibility(req, res) {
  const id = String(req.params.id);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }
  const parsed = EligibilityBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });
    return;
  }
  try {
    const profile = await getUserProfile2(userId);
    const mergedProfile = {
      gpa: parsed.data.profileOverride?.gpa ?? profile?.gpa,
      gpaScale: parsed.data.profileOverride?.gpaScale ?? profile?.gpaScale,
      englishTestType: parsed.data.profileOverride?.englishTestType ?? profile?.englishTestType,
      englishScore: parsed.data.profileOverride?.englishScore ?? profile?.englishScore,
      fundingNeed: parsed.data.profileOverride?.fundingNeed ?? profile?.fundingNeed,
      level: profile?.level,
      intendedLevel: parsed.data.profileOverride?.intendedLevel ?? profile?.intendedLevel,
      intendedAbroadMajor: profile?.intendedAbroadMajor,
      majorOrTrack: profile?.majorOrTrack,
      intendedMajor: profile?.intendedMajor,
      workExperienceMonths: profile?.workExperienceMonths,
      graduationYear: profile?.graduationYear,
      targetCountries: profile?.targetCountries
    };
    const result = await checkEligibility(id, mergedProfile);
    res.status(200).json(result);
  } catch (err) {
    console.error("[scholarship:eligibility]", err);
    res.status(500).json({ message: "Failed to check eligibility" });
  }
}
async function refreshScholarships(req, res) {
  try {
    const result = await runLiveScholarshipRefresh({ force: true });
    res.status(200).json(result);
  } catch (err) {
    console.error("[scholarship:refresh]", err);
    res.status(500).json({ message: "Live scholarship refresh failed" });
  }
}
async function getScholarshipProbability(req, res) {
  const id = String(req.params.id);
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorised" });
    return;
  }
  try {
    const profile = await getUserProfile2(userId);
    if (!profile) {
      res.status(200).json({
        scholarshipId: id,
        probabilityBand: "Low",
        probabilityPct: 20,
        factors: [],
        weaknesses: ["Complete your profile for a real assessment"],
        improvementActions: ["Go to Settings \u2192 Profile to fill in your academic details"],
        confidence: "low"
      });
      return;
    }
    const result = await predictFundingProbability(id, {
      gpa: profile.gpa,
      gpaScale: profile.gpaScale,
      englishTestType: profile.englishTestType,
      englishScore: profile.englishScore,
      fundingNeed: profile.fundingNeed,
      level: profile.level,
      intendedLevel: profile.intendedLevel,
      intendedAbroadMajor: profile.intendedAbroadMajor,
      majorOrTrack: profile.majorOrTrack,
      intendedMajor: profile.intendedMajor,
      workExperienceMonths: profile.workExperienceMonths,
      graduationYear: profile.graduationYear,
      targetCountries: profile.targetCountries
    });
    res.status(200).json(result);
  } catch (err) {
    console.error("[scholarship:probability]", err);
    res.status(500).json({ message: "Failed to compute funding probability" });
  }
}

// src/routes/scholarship.router.ts
var router11 = Router11();
router11.use(authMiddleware);
router11.get("/", listScholarships);
router11.get("/eligible", listEligibleScholarships);
router11.get("/deadlines", listUpcomingDeadlines);
router11.post("/refresh/live", refreshScholarships);
router11.get("/:id", getScholarship);
router11.post("/:id/eligibility", checkScholarshipEligibility);
router11.post("/:id/probability", getScholarshipProbability);
var scholarship_router_default = router11;

// src/routes/deadlineAlert.router.ts
import { Router as Router12 } from "express";

// src/middlewares/authenticateCron.ts
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
function authenticateCron(req, res, next) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[cron-auth] CRON_SECRET not set - allowing in non-production");
      next();
      return;
    }
    console.error("[cron-auth] CRON_SECRET is not configured on the server");
    res.status(500).json({ error: "Cron authentication is not configured" });
    return;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization header missing" });
    return;
  }
  const token = authHeader.slice(7);
  if (!timingSafeEqual(token, cronSecret)) {
    res.status(401).json({ error: "Invalid authorization token" });
    return;
  }
  next();
}

// src/services/deadlineAlert.service.ts
init_database();
var ALERT_WINDOWS_DAYS = [30, 14, 7, 1];
function daysUntil(date) {
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1e3 * 60 * 60 * 24));
}
function formatDate(date) {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
async function findPendingAlerts() {
  const now = /* @__PURE__ */ new Date();
  const cutoff = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
  const upcomingDeadlines = await database_default.scholarshipDeadline.findMany({
    where: {
      deadline: { gte: now, lte: cutoff },
      scholarship: { isActive: true }
    },
    include: {
      scholarship: { select: { id: true, title: true, provider: true, url: true, sourceUrl: true, amount: true } }
    },
    orderBy: { deadline: "asc" }
  });
  if (upcomingDeadlines.length === 0) return [];
  const users = await database_default.user.findMany({
    where: { emailVerified: true, isActive: true },
    select: { id: true, email: true, name: true }
  });
  const pending = [];
  for (const user2 of users) {
    for (const dl of upcomingDeadlines) {
      const daysLeft = daysUntil(dl.deadline);
      for (const window of ALERT_WINDOWS_DAYS) {
        if (daysLeft > window || daysLeft < window - 1) continue;
        const alreadySent = await database_default.scholarshipAlertLog.findFirst({
          where: {
            userId: user2.id,
            deadlineId: dl.id,
            daysBeforeSent: window,
            channel: "email"
          }
        });
        if (!alreadySent) {
          pending.push({
            userId: user2.id,
            email: user2.email,
            userName: user2.name,
            scholarshipId: dl.scholarship.id,
            scholarshipTitle: dl.scholarship.title,
            provider: dl.scholarship.provider,
            deadlineId: dl.id,
            deadline: dl.deadline,
            daysLeft,
            daysWindow: window,
            scholarshipUrl: dl.scholarship.sourceUrl ?? dl.scholarship.url,
            amount: dl.scholarship.amount
          });
        }
      }
    }
  }
  return pending;
}
async function runDeadlineAlertJob() {
  const result = {
    usersProcessed: 0,
    alertsSent: 0,
    alertsSkipped: 0,
    errors: []
  };
  const pending = await findPendingAlerts();
  if (pending.length === 0) return result;
  const byUser = /* @__PURE__ */ new Map();
  for (const alert of pending) {
    const arr = byUser.get(alert.userId) ?? [];
    arr.push(alert);
    byUser.set(alert.userId, arr);
  }
  for (const [userId, alerts] of byUser) {
    result.usersProcessed++;
    const items = alerts.map((a) => ({
      scholarshipTitle: a.scholarshipTitle,
      provider: a.provider,
      deadlineDate: formatDate(a.deadline),
      daysLeft: a.daysLeft,
      scholarshipUrl: a.scholarshipUrl,
      amount: a.amount
    }));
    try {
      await sendScholarshipDeadlineAlert(alerts[0].email, alerts[0].userName, items);
      await database_default.scholarshipAlertLog.createMany({
        data: alerts.map((a) => ({
          userId,
          scholarshipId: a.scholarshipId,
          deadlineId: a.deadlineId,
          daysBeforeSent: a.daysWindow,
          channel: "email"
        })),
        skipDuplicates: true
      });
      result.alertsSent += alerts.length;
    } catch (err) {
      result.errors.push(`User ${userId}: ${err.message}`);
      result.alertsSkipped += alerts.length;
    }
  }
  return result;
}
async function getRecentAlertCount(userId, withinDays = 30) {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1e3);
  return database_default.scholarshipAlertLog.count({
    where: { userId, sentAt: { gte: since } }
  });
}
async function getRecentAlerts(userId, limit = 20) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
  const logs = await database_default.scholarshipAlertLog.findMany({
    where: { userId, sentAt: { gte: since } },
    orderBy: { sentAt: "desc" },
    take: limit
  });
  const scholarshipIds = [...new Set(logs.map((l) => l.scholarshipId))];
  const scholarships = await database_default.scholarship.findMany({
    where: { id: { in: scholarshipIds } },
    select: { id: true, title: true, provider: true, url: true, sourceUrl: true }
  });
  const schMap = new Map(scholarships.map((s) => [s.id, s]));
  return logs.map((log) => {
    const s = schMap.get(log.scholarshipId);
    return {
      id: log.id,
      scholarshipId: log.scholarshipId,
      scholarshipTitle: s?.title ?? "Unknown Scholarship",
      provider: s?.provider ?? null,
      scholarshipUrl: s?.sourceUrl ?? s?.url ?? null,
      daysBeforeSent: log.daysBeforeSent,
      sentAt: log.sentAt.toISOString(),
      channel: log.channel
    };
  });
}

// src/controllers/deadlineAlert.controller.ts
var triggerAlertRun = async (req, res) => {
  try {
    const result = await runDeadlineAlertJob();
    console.info("[deadline-alerts:run] completed", result);
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    console.error("[deadline-alerts:run]", err);
    res.status(500).json({ message: "Alert job failed", error: err.message });
  }
};
var listPendingAlerts = async (req, res) => {
  const userId = req.userId;
  try {
    const all = await findPendingAlerts();
    const forUser = all.filter((a) => a.userId === userId).map((a) => ({
      scholarshipId: a.scholarshipId,
      scholarshipTitle: a.scholarshipTitle,
      provider: a.provider,
      deadlineDate: a.deadline.toISOString(),
      daysLeft: a.daysLeft,
      alertWindow: a.daysWindow,
      scholarshipUrl: a.scholarshipUrl,
      amount: a.amount
    }));
    res.status(200).json({ alerts: forUser });
  } catch (err) {
    console.error("[deadline-alerts:pending]", err);
    res.status(500).json({ message: "Failed to fetch pending alerts" });
  }
};
var listRecentAlerts = async (req, res) => {
  const userId = req.userId;
  try {
    const alerts = await getRecentAlerts(userId);
    res.status(200).json({ alerts });
  } catch (err) {
    console.error("[deadline-alerts:recent]", err);
    res.status(500).json({ message: "Failed to fetch recent alerts" });
  }
};
var getAlertCount = async (req, res) => {
  const userId = req.userId;
  try {
    const count = await getRecentAlertCount(userId);
    res.status(200).json({ count });
  } catch (err) {
    console.error("[deadline-alerts:count]", err);
    res.status(500).json({ count: 0 });
  }
};

// src/routes/deadlineAlert.router.ts
var router12 = Router12();
router12.post("/run", authenticateCron, triggerAlertRun);
router12.get("/pending", authMiddleware, listPendingAlerts);
router12.get("/recent", authMiddleware, listRecentAlerts);
router12.get("/count", authMiddleware, getAlertCount);
var deadlineAlert_router_default = router12;

// src/routes/search.router.ts
import { Router as Router13 } from "express";

// src/services/search.service.ts
init_database();
import crypto3 from "node:crypto";
var CACHE_TTL_MS2 = 24 * 60 * 60 * 1e3;
var MAX_RESULTS_PER_QUERY = 5;
var SERPER_URL = "https://google.serper.dev/search";
var OPENAI_URL = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
function normalizeQuery(query) {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}
function hashQuery(normalized) {
  return crypto3.createHash("sha256").update(normalized).digest("hex");
}
async function rewriteQuery(query) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL : OPENROUTER_URL;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  if (!apiKey) {
    return [query];
  }
  const prompt = `You are a search query optimizer for a university and education search engine.
Given a user's natural language query, generate exactly 3 precise, distinct search queries that will return the most relevant results from Google.

User query: "${query}"

Return ONLY a JSON array of 3 strings (search queries), no explanation, no markdown:
["query 1", "query 2", "query 3"]`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 200
      }),
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      return [query];
    }
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 3).map(String);
    }
    return [query];
  } catch {
    return [query];
  }
}
async function serperSearch(query) {
  const apiKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  if (!apiKey) return [];
  try {
    const response = await fetch(SERPER_URL, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: query, num: MAX_RESULTS_PER_QUERY }),
      signal: AbortSignal.timeout(8e3)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.organic ?? []).map((item) => ({
      title: item.title ?? "",
      url: item.link ?? "",
      snippet: item.snippet ?? ""
    }));
  } catch {
    return [];
  }
}
function deduplicateResults(results) {
  const seen = /* @__PURE__ */ new Set();
  return results.filter((r) => {
    if (!r.url || seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });
}
async function intelligentSearch(rawQuery) {
  const normalized = normalizeQuery(rawQuery);
  const cacheKey = hashQuery(normalized);
  const cached = await database_default.searchCache.findFirst({
    where: {
      key: cacheKey,
      expiresAt: { gt: /* @__PURE__ */ new Date() }
    }
  });
  if (cached) {
    return {
      cacheHit: true,
      query: cached.query,
      rewrites: cached.rewrites,
      results: cached.results,
      cachedAt: cached.createdAt.toISOString(),
      expiresAt: cached.expiresAt.toISOString()
    };
  }
  const rewrites = await rewriteQuery(normalized);
  const searchPromises = rewrites.map((q) => serperSearch(q));
  const rawResults = (await Promise.all(searchPromises)).flat();
  const results = deduplicateResults(rawResults);
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS2);
  await database_default.searchCache.upsert({
    where: { key: cacheKey },
    create: {
      key: cacheKey,
      query: rawQuery,
      // JSON.parse(JSON.stringify(...)) strips TypeScript types → plain JSON-compatible value
      rewrites: JSON.parse(JSON.stringify(rewrites)),
      results: JSON.parse(JSON.stringify(results)),
      expiresAt
    },
    update: {
      query: rawQuery,
      rewrites: JSON.parse(JSON.stringify(rewrites)),
      results: JSON.parse(JSON.stringify(results)),
      expiresAt
    }
  });
  return {
    cacheHit: false,
    query: rawQuery,
    rewrites,
    results,
    cachedAt: (/* @__PURE__ */ new Date()).toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}
async function getRecentSearches(limit = 20) {
  const rows = await database_default.searchCache.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { query: true, createdAt: true, expiresAt: true, results: true }
  });
  return rows.map((r) => ({
    query: r.query,
    cachedAt: r.createdAt.toISOString(),
    expiresAt: r.expiresAt.toISOString(),
    resultCount: Array.isArray(r.results) ? r.results.length : 0
  }));
}

// src/controllers/search.controller.ts
async function intelligentSearchHandler(req, res) {
  const { query } = req.body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    res.status(400).json({ error: "query is required and must be a non-empty string" });
    return;
  }
  if (query.length > 500) {
    res.status(400).json({ error: "query must be 500 characters or fewer" });
    return;
  }
  try {
    logger_default.info(`[search] intelligent search: "${query.substring(0, 100)}"`);
    const result = await intelligentSearch(query.trim());
    logger_default.info(`[search] ${result.cacheHit ? "CACHE HIT" : "CACHE MISS"} for query="${query.substring(0, 60)}..." results=${result.results.length}`);
    res.status(200).json(result);
  } catch (err) {
    logger_default.error(`[search] intelligent search error: ${err}`);
    res.status(500).json({ error: "Search service temporarily unavailable" });
  }
}
async function listCachedSearches(req, res) {
  const limit = Math.min(parseInt(req.query.limit ?? "20", 10), 100);
  try {
    const searches = await getRecentSearches(isNaN(limit) ? 20 : limit);
    res.status(200).json({ count: searches.length, searches });
  } catch (err) {
    logger_default.error(`[search] list cached searches error: ${err}`);
    res.status(500).json({ error: "Failed to fetch cached searches" });
  }
}

// src/routes/search.router.ts
var router13 = Router13();
router13.use(authMiddleware);
router13.post("/intelligent", intelligentSearchHandler);
router13.get("/cached", listCachedSearches);
var search_router_default = router13;

// src/routes/sop.router.ts
import { Router as Router14 } from "express";

// src/services/sop.service.ts
var OPENAI_URL2 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL2 = "https://openrouter.ai/api/v1/chat/completions";
var TEMPLATE_CONFIG = {
  "formal-academic": {
    label: "Formal Academic",
    instruction: "Write in formal, professional academic prose. Use precise language. Avoid contractions and informal phrasing.",
    structure: ["Opening motivation", "Academic background", "Why this program", "Research/career goals", "Closing statement"]
  },
  "research-focused": {
    label: "Research Focused",
    instruction: "Emphasize intellectual curiosity and research trajectory. Discuss specific research questions, methodologies, and how this program advances the research agenda.",
    structure: ["Research question/problem", "Academic and research background", "Alignment with faculty/program", "Proposed research direction", "Long-term impact"]
  },
  "scholarship-focused": {
    label: "Scholarship Focused",
    instruction: "Emphasize merit, leadership, community impact, and future contribution. Quantify achievements where possible. Link academic excellence to societal impact.",
    structure: ["Opening with strongest achievement", "Academic excellence", "Leadership and impact", "Why this scholarship/program", "Future contribution to society"]
  },
  "personal-story": {
    label: "Personal Story Driven",
    instruction: "Use a compelling personal narrative. Open with a defining moment or challenge. Weave the story through academic and professional growth. Keep it authentic and emotionally resonant.",
    structure: ["Defining moment/hook", "Journey and growth", "How it shaped academic goals", "Why this program fits", "Vision for the future"]
  },
  "professional-career": {
    label: "Professional / Career Oriented",
    instruction: "Focus on career trajectory and professional impact. Connect work experience to academic goals. Show clear professional motivation for graduate study.",
    structure: ["Professional background", "Career motivation for graduate study", "Academic qualifications", "Program alignment with career goals", "Future professional impact"]
  },
  "technical-engineering": {
    label: "Technical / Engineering",
    instruction: "Emphasize technical skills, engineering projects, and quantified results. Mention specific tools, methodologies, and technical problems solved. Keep it crisp and evidence-driven.",
    structure: ["Technical background summary", "Key engineering projects", "Gaps that graduate study fills", "Why this specific program/lab", "Technical career goals"]
  },
  "business-management": {
    label: "Business / Management",
    instruction: "Focus on leadership, strategic thinking, and business impact. Use metrics and business outcomes where possible. Emphasize management potential and business vision.",
    structure: ["Leadership profile", "Business experience and impact", "Why MBA/management education now", "Program-specific fit", "Post-degree business vision"]
  },
  "compact-direct": {
    label: "Compact & Direct",
    instruction: "Write a concise, direct SOP under 500 words. One strong sentence per idea. No filler. Every sentence must earn its place. No lengthy background \u2014 jump to the point.",
    structure: ["One-sentence motivation hook", "Brief academic/work background", "Why this program specifically", "Concrete goals", "One-line closing"]
  },
  "highly-persuasive": {
    label: "Highly Persuasive",
    instruction: "Write a highly persuasive SOP that builds a compelling case. Use rhetorical techniques \u2014 build from problem to solution, show unique perspective, use vivid examples, end with a memorable closing.",
    structure: ["Compelling opening claim", "Evidence and credibility", "Unique perspective/value-add", "Program as the necessary step", "Memorable, forward-looking close"]
  },
  "phd-proposal": {
    label: "PhD Research Proposal Tone",
    instruction: "Write in academic proposal style. State a clear research problem, demonstrate familiarity with the literature, describe planned methodology, and explain how the supervisors/program are uniquely positioned to support this work.",
    structure: ["Research problem statement", "Literature positioning", "Prior research background", "Proposed research direction/methodology", "Fit with program/supervisor", "Contribution to field"]
  }
};
async function generateSop(req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL2 : OPENROUTER_URL2;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const templateConfig = TEMPLATE_CONFIG[req.sopTemplate] ?? TEMPLATE_CONFIG["formal-academic"];
  const sopType = req.sopType ?? (req.sopTemplate === "scholarship-focused" ? "scholarship" : req.sopTemplate === "research-focused" || req.sopTemplate === "phd-proposal" ? "research" : "general");
  const profileLines = [
    req.name && `Name: ${req.name}`,
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.majorOrTrack && `Current major: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ""}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`
  ].filter(Boolean).join("\n");
  const targetLines = [
    req.targetProgram && `Target program: ${req.targetProgram}`,
    req.targetUniversity && `Target university: ${req.targetUniversity}`,
    req.targetCountry && `Target country: ${req.targetCountry}`,
    req.targetIntake && `Target intake: ${req.targetIntake}`,
    req.degreeLevel && `Degree level: ${req.degreeLevel}`
  ].filter(Boolean).join("\n");
  const contextLines = [
    req.sopPurpose && `SOP purpose/angle: ${req.sopPurpose}`,
    req.academicBackground && `Academic background: ${req.academicBackground}`,
    req.motivation && `Core motivation: ${req.motivation}`,
    req.whySubject && `Why this subject: ${req.whySubject}`,
    req.whyUniversity && `Why this university: ${req.whyUniversity}`,
    req.whyCountry && `Why this country: ${req.whyCountry}`,
    req.careerGoals && `Career goals: ${req.careerGoals}`,
    req.researchInterests && `Research interests: ${req.researchInterests}`,
    req.achievements && `Key achievements: ${req.achievements}`,
    req.workExperience && `Work/internship experience: ${req.workExperience}`,
    req.projects && `Projects: ${req.projects}`,
    req.challengesOvercome && `Challenges overcome: ${req.challengesOvercome}`,
    req.scholarshipAngle && `Scholarship angle: ${req.scholarshipAngle}`,
    req.highlights && `Additional highlights: ${req.highlights}`
  ].filter(Boolean).join("\n");
  const wordTarget = req.sopTemplate === "compact-direct" ? "400-500 words" : "600-850 words";
  const prompt = `You are an expert academic writing coach specializing in graduate admissions.

Template: ${templateConfig.label}
Style instruction: ${templateConfig.instruction}

Suggested structure:
${templateConfig.structure.map((s, i) => `${i + 1}. ${s}`).join("\n")}

--- Student Profile ---
${profileLines || "Profile not fully provided."}

--- Application Target ---
${targetLines || "Target not specified \u2014 write a general SOP."}

--- Student-Provided Context ---
${contextLines || "No additional context provided."}

Write a complete Statement of Purpose (${wordTarget}). Follow the template style strictly. Make it genuinely personalized using the provided details. Do NOT invent specific institutions, professors, awards, or experiences that were not mentioned.

Write ONLY the SOP text. No headings, no metadata, no word count markers. Just the SOP.`;
  if (!apiKey) {
    return {
      sop: `[Configure OPENAI_API_KEY or OPENROUTER_API_KEY to enable AI-generated SOP]

Statement of Purpose

I am writing to express my strong interest in the ${req.intendedLevel ?? "graduate"} program in ${req.intendedMajor ?? req.majorOrTrack ?? "the selected field"} at ${req.targetUniversity ?? "your esteemed institution"}.

[Full SOP will be generated once an AI key is configured.]`,
      wordCount: 0,
      template: req.sopTemplate,
      sopType
    };
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.65,
      max_tokens: 1400
    }),
    signal: AbortSignal.timeout(3e4)
  });
  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }
  const data = await response.json();
  const sop = data?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!sop) throw new Error("Empty LLM response");
  return {
    sop,
    wordCount: sop.split(/\s+/).length,
    template: req.sopTemplate,
    sopType
  };
}

// src/controllers/sop.controller.ts
init_database();
var VALID_TEMPLATES = [
  "formal-academic",
  "research-focused",
  "scholarship-focused",
  "personal-story",
  "professional-career",
  "technical-engineering",
  "business-management",
  "compact-direct",
  "highly-persuasive",
  "phd-proposal"
];
async function sopGenerateHandler(req, res) {
  const userId = req.userId;
  const {
    sopTemplate = "formal-academic",
    targetProgram,
    targetUniversity,
    targetCountry,
    targetIntake,
    degreeLevel,
    highlights,
    // Rich user-provided context
    sopPurpose,
    academicBackground,
    motivation,
    whySubject,
    whyUniversity,
    whyCountry,
    careerGoals,
    researchInterests,
    achievements,
    workExperience,
    projects,
    challengesOvercome,
    scholarshipAngle,
    // Legacy
    tone,
    sopType
  } = req.body;
  if (!VALID_TEMPLATES.includes(sopTemplate)) {
    res.status(400).json({ error: `sopTemplate must be one of: ${VALID_TEMPLATES.join(" | ")}` });
    return;
  }
  try {
    const profileRecord = await database_default.userProfile.findUnique({ where: { userId } });
    logger_default.info(`[sop] generating for userId=${userId} template=${sopTemplate}`);
    const profileIntendedAbroadMajor = profileRecord.intendedAbroadMajor ?? profileRecord?.intendedMajor ?? void 0;
    const result = await generateSop({
      currentDegree: profileRecord?.currentStage ?? void 0,
      gpa: profileRecord?.gpa ?? void 0,
      gpaScale: profileRecord?.gpaScale ?? void 0,
      majorOrTrack: profileRecord?.majorOrTrack ?? void 0,
      intendedMajor: profileIntendedAbroadMajor,
      intendedLevel: profileRecord?.intendedLevel ?? void 0,
      workExperienceMonths: profileRecord?.workExperienceMonths ?? void 0,
      englishTestType: profileRecord?.englishTestType ?? void 0,
      englishScore: profileRecord?.englishScore ?? void 0,
      // Default targetProgram to intendedAbroadMajor if not explicitly provided
      targetProgram: targetProgram ?? profileIntendedAbroadMajor,
      targetUniversity,
      targetCountry: targetCountry ?? profileRecord?.targetCountries?.[0],
      targetIntake: targetIntake ?? profileRecord?.targetIntake ?? void 0,
      degreeLevel: degreeLevel ?? profileRecord?.intendedLevel ?? void 0,
      sopTemplate,
      highlights,
      sopPurpose,
      academicBackground,
      motivation,
      whySubject,
      whyUniversity,
      whyCountry,
      // Inject careerGoal and researchInterest from profile if not provided by caller
      careerGoals: careerGoals ?? profileRecord.careerGoal ?? void 0,
      researchInterests: researchInterests ?? profileRecord.researchInterest ?? void 0,
      achievements,
      workExperience,
      projects,
      challengesOvercome,
      scholarshipAngle,
      tone,
      sopType
    });
    logger_default.info(`[sop] generated ${result.wordCount} words for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger_default.error(`[sop] generation failed: ${err}`);
    res.status(502).json({ error: "SOP generation failed. Please try again." });
  }
}

// src/services/pdfGeneratorService.ts
function buildSOPHtml(opts) {
  const paragraphs = opts.content.split("\n\n").map((p) => p.trim()).filter(Boolean).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("\n");
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #1a1a1a;
    padding: 72pt 72pt 72pt 72pt;
  }
  .header {
    text-align: right;
    margin-bottom: 36pt;
    font-size: 10pt;
    color: #444;
  }
  .title {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    margin-bottom: 24pt;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .target {
    text-align: center;
    font-size: 11pt;
    color: #444;
    margin-bottom: 32pt;
  }
  .content p {
    margin-bottom: 16pt;
    text-align: justify;
    text-indent: 24pt;
  }
  .content p:first-child { text-indent: 0; }
  .footer {
    margin-top: 48pt;
    font-size: 10pt;
    color: #666;
    text-align: right;
  }
</style>
</head>
<body>
  <div class="header">Statement of Purpose</div>
  <div class="title">Statement of Purpose</div>
  ${opts.targetUniversity ? `<div class="target">${opts.targetUniversity}</div>` : ""}
  <div class="content">${paragraphs}</div>
  <div class="footer">${opts.authorName} \xB7 ${(/* @__PURE__ */ new Date()).getFullYear()}</div>
</body>
</html>`;
}
function _isSectionHeader(line) {
  const t = line.trim();
  if (!t) return false;
  if (t.length >= 3 && t === t.toUpperCase() && /^[A-Z\s\/&()\-─]+$/.test(t)) return true;
  if (/^[A-Z][A-Za-z\s&\/\-()]{2,39}:$/.test(t)) return true;
  return false;
}
function _isContactLine(line) {
  const t = line.trim();
  return t.includes("@") || t.includes("|") || /\+?[\d\s()\-]{8,}/.test(t) || t.startsWith("http");
}
function _isUnderlineSep(line) {
  return /^[=\-─]{3,}$/.test(line.trim());
}
function buildCVHtml(opts) {
  const templateStyles = {
    "minimal-academic": { font: "Georgia, 'Times New Roman', serif", accentColor: "#4A90D9", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.55" },
    "research-focused": { font: "Georgia, serif", accentColor: "#3D6B9F", nameSize: "17pt", bodySize: "10.5pt", lineHeight: "1.6" },
    "modern-professional": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "20pt", bodySize: "10.5pt", lineHeight: "1.5" },
    "scholarship-focused": { font: "Georgia, serif", accentColor: "#2563EB", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.6" },
    "technical-engineering": { font: "Arial, Helvetica, sans-serif", accentColor: "#475569", nameSize: "18pt", bodySize: "10pt", lineHeight: "1.45" },
    "business-management": { font: "Arial, Helvetica, sans-serif", accentColor: "#2563EB", nameSize: "20pt", bodySize: "10.5pt", lineHeight: "1.5" },
    "clean-classic": { font: "'Times New Roman', Georgia, serif", accentColor: "#374151", nameSize: "18pt", bodySize: "11pt", lineHeight: "1.55" },
    "compact-one-page": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "16pt", bodySize: "9.5pt", lineHeight: "1.4" },
    "phd-research": { font: "Georgia, serif", accentColor: "#3D6B9F", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.6" },
    "international-student": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.5" }
  };
  const s = templateStyles[opts.template] ?? templateStyles["modern-professional"];
  const lines = opts.content.split("\n");
  const htmlLines = [];
  let nameAdded = false;
  for (let i = 0; i < lines.length; i++) {
    const raw2 = lines[i];
    const trimmed = raw2.trim();
    if (!trimmed) {
      htmlLines.push("<div style='height:6pt'></div>");
      continue;
    }
    if (_isUnderlineSep(trimmed)) continue;
    if (!nameAdded && !_isSectionHeader(trimmed) && !_isContactLine(trimmed)) {
      nameAdded = true;
      htmlLines.push(`<div style="text-align:center;font-size:${s.nameSize};font-weight:700;color:#0f172a;margin-bottom:4pt">${trimmed}</div>`);
      continue;
    }
    if (!nameAdded) nameAdded = true;
    if (_isContactLine(trimmed) && i < 5) {
      htmlLines.push(`<div style="text-align:center;font-size:9.5pt;color:#475569;margin-bottom:2pt">${trimmed}</div>`);
      continue;
    }
    if (_isSectionHeader(trimmed)) {
      htmlLines.push(`<div style="margin-top:12pt;margin-bottom:4pt;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0f172a;border-bottom:1.5pt solid ${s.accentColor};padding-bottom:2pt">${trimmed.replace(/:$/, "")}</div>`);
      continue;
    }
    if (/^\s{2,}[-•*]/.test(raw2) || /^\s{4,}/.test(raw2)) {
      htmlLines.push(`<div style="display:flex;gap:6pt;padding-left:16pt;margin-bottom:1.5pt"><span style="color:${s.accentColor};font-weight:700">\u2013</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`);
      continue;
    }
    if (/^[-•*]\s/.test(trimmed)) {
      htmlLines.push(`<div style="display:flex;gap:6pt;padding-left:6pt;margin-bottom:1.5pt"><span style="color:${s.accentColor};font-weight:700">\xB7</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`);
      continue;
    }
    htmlLines.push(`<div style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b;margin-bottom:2pt">${trimmed}</div>`);
  }
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${s.font};
    font-size: ${s.bodySize};
    line-height: ${s.lineHeight};
    color: #1e293b;
    padding: 52pt 58pt;
    background: #ffffff;
  }
</style>
</head>
<body>
  ${htmlLines.join("\n  ")}
</body>
</html>`;
}
function buildResumeHtml(opts) {
  const resumeStyles = {
    "ats-clean": { font: "Arial, Helvetica, sans-serif", accentColor: "#374151", nameSize: "18pt", bodySize: "10pt", lineHeight: "1.45", headerStyle: "border" },
    "google-faang": { font: "Arial, Helvetica, sans-serif", accentColor: "#1A73E8", nameSize: "19pt", bodySize: "10.5pt", lineHeight: "1.5", headerStyle: "border" },
    "startup-tech": { font: "Arial, Helvetica, sans-serif", accentColor: "#4A90D9", nameSize: "20pt", bodySize: "10.5pt", lineHeight: "1.5", headerStyle: "underline" },
    "executive-professional": { font: "Georgia, 'Times New Roman', serif", accentColor: "#1e3a5f", nameSize: "20pt", bodySize: "11pt", lineHeight: "1.55", headerStyle: "bg" },
    "data-science": { font: "Arial, Helvetica, sans-serif", accentColor: "#0F4C81", nameSize: "18pt", bodySize: "10pt", lineHeight: "1.45", headerStyle: "border" },
    "consulting-finance": { font: "'Times New Roman', Georgia, serif", accentColor: "#1e3a5f", nameSize: "18pt", bodySize: "10.5pt", lineHeight: "1.5", headerStyle: "bg" }
  };
  const s = resumeStyles[opts.template] ?? resumeStyles["ats-clean"];
  const sectionHeaderHtml = (text) => {
    switch (s.headerStyle) {
      case "bg":
        return `<div style="margin-top:10pt;margin-bottom:4pt;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;background:${s.accentColor};color:#fff;padding:3pt 6pt">${text}</div>`;
      case "underline":
        return `<div style="margin-top:10pt;margin-bottom:4pt;font-size:10pt;font-weight:700;color:${s.accentColor};border-bottom:2pt solid ${s.accentColor};padding-bottom:2pt">${text}</div>`;
      default:
        return `<div style="margin-top:10pt;margin-bottom:4pt;font-size:9pt;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#0f172a;border-bottom:1.5pt solid ${s.accentColor};padding-bottom:2pt">${text}</div>`;
    }
  };
  const lines = opts.content.split("\n");
  const htmlLines = [];
  let nameAdded = false;
  for (let i = 0; i < lines.length; i++) {
    const raw2 = lines[i];
    const trimmed = raw2.trim();
    if (!trimmed) {
      htmlLines.push("<div style='height:5pt'></div>");
      continue;
    }
    if (_isUnderlineSep(trimmed)) continue;
    if (!nameAdded && !_isSectionHeader(trimmed) && !_isContactLine(trimmed)) {
      nameAdded = true;
      htmlLines.push(`<div style="font-size:${s.nameSize};font-weight:700;color:#0f172a;margin-bottom:3pt">${trimmed}</div>`);
      continue;
    }
    if (!nameAdded) nameAdded = true;
    if (_isContactLine(trimmed) && i < 5) {
      htmlLines.push(`<div style="font-size:9pt;color:#475569;margin-bottom:1.5pt">${trimmed}</div>`);
      continue;
    }
    if (_isSectionHeader(trimmed)) {
      htmlLines.push(sectionHeaderHtml(trimmed.replace(/:$/, "")));
      continue;
    }
    if (/^\s{2,}[-•*]/.test(raw2) || /^\s{4,}/.test(raw2)) {
      htmlLines.push(`<div style="display:flex;gap:5pt;padding-left:14pt;margin-bottom:1.5pt"><span style="color:${s.accentColor}">\u2013</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`);
      continue;
    }
    if (/^[-•*]\s/.test(trimmed)) {
      htmlLines.push(`<div style="display:flex;gap:5pt;padding-left:5pt;margin-bottom:1.5pt"><span style="color:${s.accentColor}">\u2022</span><span style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b">${trimmed.replace(/^[-•*]\s*/, "")}</span></div>`);
      continue;
    }
    htmlLines.push(`<div style="font-size:${s.bodySize};line-height:${s.lineHeight};color:#1e293b;margin-bottom:1.5pt">${trimmed}</div>`);
  }
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>* { margin:0; padding:0; box-sizing:border-box; } body { font-family:${s.font}; font-size:${s.bodySize}; line-height:${s.lineHeight}; color:#1e293b; padding:48pt 52pt; background:#fff; }</style>
</head>
<body>${htmlLines.join("\n")}</body>
</html>`;
}
async function generatePDF(opts) {
  const html = opts.documentType === "sop" ? buildSOPHtml(opts) : opts.documentType === "resume" ? buildResumeHtml(opts) : buildCVHtml(opts);
  const htmlPdf = await import("html-pdf-node");
  const file = { content: html };
  return new Promise((resolve, reject) => {
    htmlPdf.default.generatePdf(file, {
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" }
    }, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });
}

// src/routes/sop.router.ts
var router14 = Router14();
router14.use(authMiddleware);
router14.post("/generate", sopGenerateHandler);
router14.post("/download-pdf", async (req, res) => {
  try {
    const { content, template = "standard_academic", targetUniversity } = req.body;
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const userId = req.userId;
    const user2 = await Promise.resolve().then(() => (init_database(), database_exports)).then(
      (m) => m.default.user.findUnique({ where: { id: userId }, select: { name: true } })
    );
    const pdfBuffer = await generatePDF({
      content,
      documentType: "sop",
      template,
      authorName: user2?.name ?? "Student",
      targetUniversity
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="SOP-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf"`,
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});
var sop_router_default = router14;

// src/routes/cv.router.ts
import { Router as Router15 } from "express";

// src/services/cv.service.ts
var OPENAI_URL3 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL3 = "https://openrouter.ai/api/v1/chat/completions";
var TEMPLATE_CONFIG2 = {
  "minimal-academic": {
    label: "Minimal Academic",
    instruction: "Create a clean, minimal academic CV. Use: Education, Research Experience, Technical Skills, Test Scores, Awards. No decorative elements. Tight spacing. Prioritize academic credentials.",
    sections: ["Education", "Research Experience", "Technical Skills", "Test Scores", "Awards"]
  },
  "research-focused": {
    label: "Research Focused",
    instruction: "Create a research-first CV. Lead with Research Experience and Publications. Sections: Research Experience, Publications & Presentations, Projects, Technical Skills, Education, Awards.",
    sections: ["Research Experience", "Publications", "Projects", "Technical Skills", "Education"]
  },
  "modern-professional": {
    label: "Modern Professional",
    instruction: "Create a modern professional CV with a brief profile summary at the top. Sections: Professional Summary, Education, Work Experience, Projects, Skills, Certifications.",
    sections: ["Summary", "Education", "Work Experience", "Projects", "Skills", "Certifications"]
  },
  "scholarship-focused": {
    label: "Scholarship Focused",
    instruction: "Create a scholarship-oriented CV emphasizing merit, leadership, and community impact. Lead with Achievements and Awards. Sections: Profile, Academic Excellence, Awards & Honours, Leadership, Research, Community Service, Skills.",
    sections: ["Profile", "Academic Excellence", "Awards", "Leadership", "Research", "Community Service"]
  },
  "international-student": {
    label: "International Student Profile",
    instruction: "Create an international student CV. Include language proficiency, test scores prominently, and study/work abroad experience. Sections: Profile, Education, Language Proficiency & Tests, Research/Projects, Work Experience, Skills.",
    sections: ["Profile", "Education", "Language & Tests", "Research/Projects", "Work Experience", "Skills"]
  },
  "technical-engineering": {
    label: "Technical / Engineering",
    instruction: "Create a technical CV for engineering/CS applicants. Lead with Technical Skills and Projects. Sections: Technical Skills, Projects & Open Source, Work/Internship Experience, Education, Certifications, Publications.",
    sections: ["Technical Skills", "Projects", "Work Experience", "Education", "Certifications"]
  },
  "business-management": {
    label: "Business / Management",
    instruction: "Create a business-oriented CV emphasizing leadership, strategy, and impact metrics. Sections: Executive Summary, Education, Professional Experience, Leadership & Activities, Skills, Certifications.",
    sections: ["Executive Summary", "Education", "Professional Experience", "Leadership", "Skills"]
  },
  "clean-classic": {
    label: "Clean Classic",
    instruction: "Create a classic chronological CV, clean and universally readable. Sections: Contact, Objective, Education, Experience, Skills, Awards, References.",
    sections: ["Objective", "Education", "Experience", "Skills", "Awards"]
  },
  "compact-one-page": {
    label: "Compact One-Page",
    instruction: "Create a compact one-page CV. Every section must be concise. Use bullet points sparingly. Sections: Summary, Education, Key Experience, Core Skills, Selected Achievements. Keep it under 500 words.",
    sections: ["Summary", "Education", "Key Experience", "Core Skills", "Selected Achievements"]
  },
  "phd-research": {
    label: "PhD Research Proposal",
    instruction: "Create a PhD application CV. Lead with Research Interests and Research Experience. Include Publications, Conference Presentations if any. Sections: Research Interests, Education, Research Experience, Publications & Talks, Technical Skills, Fellowships & Awards.",
    sections: ["Research Interests", "Education", "Research Experience", "Publications", "Skills", "Awards"]
  }
};
async function generateCv(req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL3 : OPENROUTER_URL3;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const templateConfig = TEMPLATE_CONFIG2[req.cvTemplate] ?? TEMPLATE_CONFIG2["minimal-academic"];
  const profileLines = [
    req.name && `Full Name: ${req.name}`,
    req.email && `Email: ${req.email}`,
    req.phone && `Phone: ${req.phone}`,
    req.linkedin && `LinkedIn: ${req.linkedin}`,
    req.github && `GitHub/Portfolio: ${req.github}`,
    req.summary && `Profile Summary: ${req.summary}`,
    "--- Academic Background ---",
    req.currentDegree && `Current degree: ${req.currentDegree}`,
    req.currentInstitution && `Institution: ${req.currentInstitution}`,
    req.majorOrTrack && `Major/Track: ${req.majorOrTrack}`,
    req.gpa && `GPA: ${req.gpa}${req.gpaScale ? `/${req.gpaScale}` : ""}`,
    req.graduationYear && `Expected graduation: ${req.graduationYear}`,
    req.thesisOrResearch && `Thesis/Research: ${req.thesisOrResearch}`,
    req.publications && `Publications: ${req.publications}`,
    "--- Target Application ---",
    req.targetDegree && `Target degree: ${req.targetDegree}`,
    req.targetProgram && `Target program: ${req.targetProgram}`,
    req.targetUniversity && `Target university: ${req.targetUniversity}`,
    req.targetCountry && `Target country: ${req.targetCountry}`,
    "--- Tests ---",
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.gre && `GRE: ${req.gre}`,
    req.gmat && `GMAT: ${req.gmat}`,
    "--- Experience ---",
    req.workExperienceMonths && `Work experience: ${Math.floor(req.workExperienceMonths / 12)}y ${req.workExperienceMonths % 12}m`,
    req.workExperience && `Work Experience Details:
${req.workExperience}`,
    req.internships && `Internships:
${req.internships}`,
    "--- Skills ---",
    req.technicalSkills && `Technical Skills: ${req.technicalSkills}`,
    req.softSkills && `Soft Skills: ${req.softSkills}`,
    "--- Extras ---",
    req.projects && `Projects:
${req.projects}`,
    req.certifications && `Certifications: ${req.certifications}`,
    req.awards && `Awards/Honours: ${req.awards}`,
    req.extracurriculars && `Extracurriculars: ${req.extracurriculars}`,
    req.volunteering && `Volunteering: ${req.volunteering}`,
    req.references && `References: ${req.references}`,
    req.highlights && `Additional highlights:
${req.highlights}`
  ].filter(Boolean).join("\n");
  const prompt = `You are an expert academic CV writer specializing in graduate school and scholarship applications.

Template: ${templateConfig.label}
${templateConfig.instruction}

Student Profile:
${profileLines || "Limited profile provided \u2014 create a template CV with clear [PLACEHOLDER] markers."}

Instructions:
- Write a complete, ATS-friendly CV in plain text format.
- Use clear section headers in ALL CAPS followed by a line of dashes.
- Use consistent spacing and bullet points where appropriate.
- Where specific data is not provided, use [PLACEHOLDER] markers.
- Adapt content emphasis to match the template type.
- Do NOT invent specific achievements, publications, or institutions that were not mentioned.

Write ONLY the CV text. No commentary, no explanations, no markdown.`;
  if (!apiKey) {
    const header = [
      req.name?.toUpperCase() ?? "YOUR NAME",
      req.email ?? "your.email@example.com",
      req.phone ?? "",
      req.linkedin ?? ""
    ].filter(Boolean).join(" | ");
    return {
      cv: `[Configure OPENAI_API_KEY or OPENROUTER_API_KEY to enable AI-generated CV]

${header}

EDUCATION
----------
${req.currentDegree ?? "[Degree]"} in ${req.majorOrTrack ?? "[Major]"}
${req.currentInstitution ?? "[Institution]"}

[Complete your profile and configure an AI key for a full generated CV.]`,
      template: req.cvTemplate,
      sections: templateConfig.sections
    };
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2e3
    }),
    signal: AbortSignal.timeout(3e4)
  });
  if (!response.ok) {
    throw new Error(`LLM error: ${response.status}`);
  }
  const data = await response.json();
  const cv = data?.choices?.[0]?.message?.content?.trim() ?? "";
  if (!cv) throw new Error("Empty LLM response");
  return { cv, template: req.cvTemplate, sections: templateConfig.sections };
}

// src/controllers/cv.controller.ts
init_database();
var VALID_TEMPLATES2 = [
  "minimal-academic",
  "research-focused",
  "modern-professional",
  "scholarship-focused",
  "international-student",
  "technical-engineering",
  "business-management",
  "clean-classic",
  "compact-one-page",
  "phd-research"
];
async function cvGenerateHandler(req, res) {
  const userId = req.userId;
  const {
    cvTemplate = "minimal-academic",
    highlights,
    // Rich user-provided fields
    phone,
    linkedin,
    github,
    summary,
    thesisOrResearch,
    publications,
    workExperience,
    internships,
    technicalSkills,
    softSkills,
    projects,
    certifications,
    awards,
    extracurriculars,
    volunteering,
    references,
    targetDegree,
    targetCountry: bodyTargetCountry,
    targetUniversity,
    targetProgram
  } = req.body;
  if (!VALID_TEMPLATES2.includes(cvTemplate)) {
    res.status(400).json({ error: `cvTemplate must be one of: ${VALID_TEMPLATES2.join(" | ")}` });
    return;
  }
  try {
    const [profile, user2] = await Promise.all([
      database_default.userProfile.findUnique({ where: { userId } }),
      database_default.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
    ]);
    logger_default.info(`[cv] generating for userId=${userId} template=${cvTemplate}`);
    const intendedAbroadMajor = profile.intendedAbroadMajor ?? profile?.intendedMajor ?? void 0;
    const result = await generateCv({
      name: user2?.name ?? void 0,
      email: user2?.email ?? void 0,
      phone,
      linkedin,
      github,
      summary,
      targetDegree: targetDegree ?? profile?.intendedLevel ?? void 0,
      targetCountry: bodyTargetCountry ?? profile?.targetCountries?.[0] ?? void 0,
      targetUniversity,
      // Default targetProgram to intendedAbroadMajor if not explicitly provided
      targetProgram: targetProgram ?? intendedAbroadMajor,
      currentDegree: profile?.currentStage ?? void 0,
      currentInstitution: profile?.currentInstitution ?? void 0,
      majorOrTrack: profile?.majorOrTrack ?? void 0,
      gpa: profile?.gpa ?? void 0,
      gpaScale: profile?.gpaScale ?? void 0,
      graduationYear: profile?.graduationYear ?? void 0,
      thesisOrResearch,
      publications,
      englishTestType: profile?.englishTestType ?? void 0,
      englishScore: profile?.englishScore ?? void 0,
      gre: profile?.gre ?? void 0,
      gmat: profile?.gmat ?? void 0,
      workExperienceMonths: profile?.workExperienceMonths ?? void 0,
      workExperience,
      internships,
      technicalSkills,
      softSkills,
      projects,
      certifications,
      awards,
      extracurriculars,
      volunteering,
      references,
      intendedLevel: profile?.intendedLevel ?? void 0,
      intendedMajor: intendedAbroadMajor,
      highlights,
      cvTemplate
    });
    logger_default.info(`[cv] generated for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger_default.error(`[cv] generation failed: ${err}`);
    res.status(502).json({ error: "CV generation failed. Please try again." });
  }
}

// src/routes/cv.router.ts
var router15 = Router15();
router15.use(authMiddleware);
router15.post("/generate", cvGenerateHandler);
router15.post("/download-pdf", async (req, res) => {
  try {
    const { content, template = "us_standard" } = req.body;
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const pdfBuffer = await generatePDF({
      content,
      documentType: "cv",
      template,
      authorName: "Student"
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="CV-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf"`,
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error("CV PDF generation error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});
var cv_router_default = router15;

// src/routes/resume.router.ts
import { Router as Router16 } from "express";

// src/services/resume.service.ts
var OPENAI_URL4 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL4 = "https://openrouter.ai/api/v1/chat/completions";
var TEMPLATE_CONFIG3 = {
  "ats-clean": {
    label: "ATS-Friendly Clean",
    instruction: `Create a clean ATS-optimised resume. Use plain text section headers (no icons or decorations). Order: Contact, Professional Summary (3 lines max), Work Experience (reverse chronological, quantified bullet points with numbers/percentages), Education, Technical Skills (comma-separated lists), Certifications. Keep to 1\u20132 pages. Use action verbs. Quantify every achievement where possible.`,
    sections: ["Professional Summary", "Work Experience", "Education", "Technical Skills", "Certifications"]
  },
  "google-faang": {
    label: "FAANG / Big Tech",
    instruction: `Create a Big Tech resume following Google/Meta/Amazon conventions. Sections: Contact, Summary (2\u20133 lines, impact-focused), Experience (STAR-format bullets: Situation\u2192Task\u2192Action\u2192Result with metrics), Education (GPA if above 3.5), Technical Skills (languages, frameworks, tools, cloud), Projects (with GitHub/links if available), Publications (if any). Every bullet must show impact: "Led X, achieved Y by doing Z." Keep crisp.`,
    sections: ["Summary", "Experience", "Education", "Technical Skills", "Projects"]
  },
  "startup-tech": {
    label: "Startup / Tech",
    instruction: `Create a modern startup-style resume. Bold, action-oriented. Sections: Contact (include portfolio/GitHub prominently), Headline (one-line role + value prop), Experience (ownership, speed, breadth of impact), Side Projects & Open Source, Education, Skills & Stack. Show initiative and range. One page preferred. Use conversational yet professional tone.`,
    sections: ["Headline", "Experience", "Side Projects", "Skills & Stack", "Education"]
  },
  "executive-professional": {
    label: "Executive / Senior",
    instruction: `Create an executive-level resume for senior professionals. Sections: Contact, Executive Profile (4\u20135 lines highlighting leadership philosophy and key impact areas), Core Competencies (a 3-column grid of 9\u201312 skills), Career History (outcomes-based, strategic scope, team sizes, budgets, P&L), Board/Advisory Roles, Education & Credentials. Tone: authoritative, strategic, results-driven. 2 pages.`,
    sections: ["Executive Profile", "Core Competencies", "Career History", "Education & Credentials"]
  },
  "data-science": {
    label: "Data Science / ML",
    instruction: `Create a Data Science/ML resume. Sections: Contact, Summary (highlight ML stack, domain, and scale of data worked with), Technical Skills (ML frameworks, languages, tools, cloud/infra \u2014 grouped), Experience (focus on models shipped, data pipelines built, business impact of predictions), Projects & Research (Kaggle, papers, notebooks), Education (GPA, relevant coursework, thesis if any), Publications/Talks. Be specific about model types and metrics.`,
    sections: ["Summary", "Technical Skills", "Experience", "Projects & Research", "Education"]
  },
  "consulting-finance": {
    label: "Consulting / Finance",
    instruction: `Create a consulting/finance resume following McKinsey/Goldman Sachs format conventions. Crisp, structured, no wasted space. Sections: Contact, Education (GPA, honours \u2014 goes FIRST in consulting resumes), Experience (bullet points showing structured problem-solving, quantified impact, client context), Leadership & Activities (clubs, societies, competitions), Skills (languages, software, certifications). Every bullet: Action + Method + Result. Formal tone. 1 page.`,
    sections: ["Education", "Experience", "Leadership & Activities", "Skills"]
  }
};
async function generateResume(req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL4 : OPENROUTER_URL4;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const config2 = TEMPLATE_CONFIG3[req.resumeTemplate] ?? TEMPLATE_CONFIG3["ats-clean"];
  const profileLines = [
    req.name && `Full Name: ${req.name}`,
    req.email && `Email: ${req.email}`,
    req.phone && `Phone: ${req.phone}`,
    req.location && `Location: ${req.location}`,
    req.linkedin && `LinkedIn: ${req.linkedin}`,
    req.github && `GitHub: ${req.github}`,
    req.portfolio && `Portfolio: ${req.portfolio}`,
    req.targetRole && `Target Role: ${req.targetRole}`,
    req.targetCompany && `Target Company: ${req.targetCompany}`,
    req.targetIndustry && `Target Industry: ${req.targetIndustry}`,
    req.summary && `Professional Summary Notes: ${req.summary}`,
    req.workExperience && `Work Experience: ${req.workExperience}`,
    req.internships && `Internships: ${req.internships}`,
    req.education && `Education: ${req.education}`,
    req.technicalSkills && `Technical Skills: ${req.technicalSkills}`,
    req.softSkills && `Soft Skills: ${req.softSkills}`,
    req.projects && `Projects: ${req.projects}`,
    req.certifications && `Certifications: ${req.certifications}`,
    req.achievements && `Key Achievements: ${req.achievements}`,
    req.languages && `Languages: ${req.languages}`,
    req.volunteering && `Volunteering: ${req.volunteering}`,
    req.highlights && `Additional Highlights: ${req.highlights}`
  ].filter(Boolean).join("\n");
  const systemPrompt = `You are a professional resume writer specialising in the ${config2.label} format. You write resumes that get interviews. Use only the information provided \u2014 never invent facts, companies, degrees, or metrics. If data is missing for a field, omit that field rather than fabricating. Output ONLY the resume text \u2014 no commentary, no markdown code fences, no explanations.`;
  const userPrompt = `${config2.instruction}

CANDIDATE INFORMATION:
${profileLines}

Write the complete resume now. Use the exact section order specified above. Use ALL-CAPS for section headers. Use plain bullet points (\u2022 or -). Do not use markdown formatting. Output the resume only.`;
  if (!apiKey) {
    throw new Error("No LLM API key configured (OPENAI_API_KEY or OPENROUTER_API_KEY)");
  }
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 1800
    }),
    signal: AbortSignal.timeout(6e4)
  });
  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText);
    throw new Error(`LLM API error ${response.status}: ${err}`);
  }
  const data = await response.json();
  const resumeText = data.choices[0]?.message?.content?.trim() ?? "";
  if (!resumeText) throw new Error("LLM returned empty response");
  return {
    resume: resumeText,
    template: req.resumeTemplate,
    sections: config2.sections
  };
}

// src/controllers/resume.controller.ts
init_database();
var VALID_TEMPLATES3 = [
  "ats-clean",
  "google-faang",
  "startup-tech",
  "executive-professional",
  "data-science",
  "consulting-finance"
];
async function resumeGenerateHandler(req, res) {
  const userId = req.userId;
  const {
    resumeTemplate = "ats-clean",
    location,
    phone,
    linkedin,
    github,
    portfolio,
    summary,
    targetRole,
    targetCompany,
    targetIndustry,
    workExperience,
    internships,
    education,
    technicalSkills,
    softSkills,
    projects,
    certifications,
    achievements,
    languages,
    volunteering,
    highlights
  } = req.body;
  if (!VALID_TEMPLATES3.includes(resumeTemplate)) {
    res.status(400).json({ error: `resumeTemplate must be one of: ${VALID_TEMPLATES3.join(" | ")}` });
    return;
  }
  try {
    const [profile, user2] = await Promise.all([
      database_default.userProfile.findUnique({ where: { userId } }),
      database_default.user.findUnique({ where: { id: userId }, select: { name: true, email: true } })
    ]);
    logger_default.info(`[resume] generating for userId=${userId} template=${resumeTemplate}`);
    const result = await generateResume({
      name: user2?.name ?? void 0,
      email: user2?.email ?? void 0,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      summary,
      targetRole,
      targetCompany,
      targetIndustry,
      workExperience,
      internships,
      education: education ?? (profile?.currentInstitution ? `${profile.majorOrTrack ?? ""} at ${profile.currentInstitution}` : void 0),
      technicalSkills,
      softSkills,
      projects,
      certifications,
      achievements,
      languages,
      volunteering,
      highlights,
      resumeTemplate
    });
    logger_default.info(`[resume] generated for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger_default.error(`[resume] generation failed: ${err}`);
    res.status(502).json({ error: "Resume generation failed. Please try again." });
  }
}
async function resumeDownloadPdfHandler(req, res) {
  try {
    const { content, template = "ats-clean" } = req.body;
    if (!content || typeof content !== "string") {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const pdfBuffer = await generatePDF({
      content,
      documentType: "resume",
      template,
      authorName: "Applicant"
    });
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Resume-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.pdf"`,
      "Content-Length": pdfBuffer.length
    });
    res.send(pdfBuffer);
  } catch (err) {
    logger_default.error(`[resume] PDF generation failed: ${err}`);
    res.status(500).json({ error: "PDF generation failed" });
  }
}

// src/routes/resume.router.ts
var router16 = Router16();
router16.use(authMiddleware);
router16.post("/generate", resumeGenerateHandler);
router16.post("/download-pdf", resumeDownloadPdfHandler);
var resume_router_default = router16;

// src/routes/professors.router.ts
import { Router as Router17 } from "express";

// src/services/professors.service.ts
var SERPER_URL2 = "https://google.serper.dev/search";
var OPENAI_URL5 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL5 = "https://openrouter.ai/api/v1/chat/completions";
var ACADEMIC_DOMAINS = [
  ".edu",
  ".ac.uk",
  ".ac.in",
  ".ac.au",
  ".ac.nz",
  ".ac.za",
  ".ac.jp",
  ".ac.kr",
  ".uni-",
  "university",
  "institute",
  "college",
  "scholar.google",
  "researchgate.net",
  "academia.edu",
  "orcid.org",
  "dblp.org",
  "semanticscholar.org",
  "pubmed",
  "faculty",
  "staff",
  "people",
  "lab.",
  "-lab",
  "research"
];
var PROFILE_SIGNALS = [
  "/faculty/",
  "/staff/",
  "/people/",
  "/person/",
  "/researcher/",
  "/professor/",
  "/user/",
  "/member/",
  "/profile/",
  "/about/",
  "~"
  // e.g. cs.mit.edu/~jdoe
];
var LISTING_SIGNALS = [
  "/faculty",
  "/faculty-list",
  "/directory",
  "/search",
  "/browse",
  "/members",
  "/team",
  "/professors",
  "/researchers",
  "/all-faculty",
  "/index",
  "/list",
  "/catalog",
  "page=",
  "query=",
  "?search"
];
var PROFILE_TITLE_SIGNALS = [
  "professor",
  "associate professor",
  "assistant professor",
  "faculty",
  "researcher",
  "ph.d",
  "phd",
  "research interests",
  "publications",
  "lab director",
  "curriculum vitae",
  "biography",
  "bio"
];
var LISTING_TITLE_SIGNALS = [
  "faculty directory",
  "faculty list",
  "faculty members",
  "our faculty",
  "all professors",
  "search results",
  "browse faculty",
  "department faculty",
  "academic staff",
  "meet our",
  "faculty & staff"
];
function isAcademicUrl(url) {
  const lower = url.toLowerCase();
  return ACADEMIC_DOMAINS.some((d) => lower.includes(d));
}
function scoreProfileLikelihood(result) {
  const urlLower = result.link.toLowerCase();
  const titleLower = result.title.toLowerCase();
  const snippetLower = result.snippet.toLowerCase();
  let score = 50;
  if (isAcademicUrl(result.link)) score += 15;
  for (const sig of PROFILE_SIGNALS) {
    if (urlLower.includes(sig)) {
      score += 20;
      break;
    }
  }
  for (const sig of LISTING_SIGNALS) {
    if (urlLower.includes(sig)) {
      score -= 25;
      break;
    }
  }
  if (urlLower.endsWith(".pdf")) score -= 30;
  const titleProfileMatches = PROFILE_TITLE_SIGNALS.filter((s) => titleLower.includes(s)).length;
  score += titleProfileMatches * 5;
  const titleListingMatches = LISTING_TITLE_SIGNALS.filter((s) => titleLower.includes(s)).length;
  score -= titleListingMatches * 20;
  if (snippetLower.includes("@") && snippetLower.includes(".edu")) score += 10;
  if (snippetLower.includes("research interest")) score += 8;
  if (snippetLower.includes("ph.d") || snippetLower.includes("phd")) score += 5;
  if (snippetLower.includes("publication")) score += 5;
  if (urlLower.includes("researchgate.net/profile/")) score += 25;
  if (urlLower.includes("orcid.org/")) score += 20;
  if (urlLower.includes("scholar.google")) score += 10;
  if (urlLower.includes("semanticscholar.org/author/")) score += 15;
  return Math.max(0, Math.min(100, score));
}
function isValidQuery(text) {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  const hasVowel = /[aeiouAEIOU]/.test(trimmed);
  const wordCount = trimmed.split(/\s+/).length;
  if (!hasVowel && wordCount === 1 && trimmed.length < 6) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}
async function serperSearch2(query, numResults = 10) {
  const apiKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  if (!apiKey) return [];
  try {
    const response = await fetch(SERPER_URL2, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: numResults }),
      signal: AbortSignal.timeout(8e3)
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.organic ?? []).map((r) => ({ title: r.title ?? "", link: r.link ?? "", snippet: r.snippet ?? "" }));
  } catch {
    return [];
  }
}
async function extractProfessors(searchResults, req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL5 : OPENROUTER_URL5;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  if (!apiKey || searchResults.length === 0) return [];
  const scored = searchResults.map((r) => ({ ...r, profileScore: scoreProfileLikelihood(r) })).sort((a, b) => b.profileScore - a.profileScore);
  const highConfidence = scored.filter((r) => r.profileScore >= 55);
  const fallback = scored.filter((r) => r.profileScore < 55);
  const resultsToProcess = highConfidence.length >= 2 ? highConfidence.slice(0, 8) : [...highConfidence, ...fallback].slice(0, 8);
  const resultsJson = JSON.stringify(
    resultsToProcess.map((r) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
      profileScore: r.profileScore
    })),
    null,
    2
  );
  const universityFilter = req.university ? `IMPORTANT: Only extract professors who are explicitly from "${req.university}". Reject any professor from a different institution.` : "";
  const countryFilter = req.country ? `IMPORTANT: Only extract professors from institutions in "${req.country}". Reject professors from other countries.` : "";
  const prompt = `You are a strict academic data extractor. Extract professor information ONLY from the provided search results.

Research interest: "${req.researchInterest}"
${universityFilter}
${countryFilter}

Search results (sorted by profile-likelihood score, higher = more likely a personal professor profile):
${resultsJson}

STRICT RULES:
1. Only extract a professor if their name, institution, and research area are CLEARLY mentioned in the result.
2. PREFER results with high profileScore \u2014 those are more likely to be actual professor profile pages.
3. AVOID extracting from listing/directory pages (where multiple professors appear on one page). If a result looks like a faculty directory listing, only extract ONE professor from it at most, and only if their name is clearly in the title or snippet.
4. Do NOT invent, guess, or extrapolate any professor not explicitly present in the results.
5. Do NOT fill in placeholder names like "Professor X" or "Faculty Member".
6. If a result is not about a real, named professor, skip it.
7. If you cannot confidently identify ANY real professor, return an empty array [].
8. The profileUrl MUST be the actual URL from the result \u2014 never a made-up URL.
9. Prefer the URL that is most likely the professor's own profile page, not a listing page.
10. Email can only be included if it appears verbatim in the snippet.

Return ONLY a JSON array (may be empty []):
[
  {
    "name": "Exact full name as found in results",
    "title": "Title as found (Professor/Associate Professor/etc) or null",
    "university": "University name as found in results",
    "department": "Department if mentioned, otherwise null",
    "researchAreas": ["area from results", "..."],
    "email": "exact email if found verbatim, otherwise null",
    "profileUrl": "the best URL for this professor's own profile page",
    "snippet": "1-2 sentence summary of their work from the results",
    "isProfilePage": true/false \u2014 whether the URL appears to be the professor's own profile vs a listing page
  }
]

Return ONLY the JSON array. No explanation, no markdown.`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 1500
      }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) return [];
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = content.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    const extracted = parsed.filter((p) => {
      const name = String(p.name ?? "").trim();
      if (!name || name.toLowerCase().startsWith("professor ") || name === "Unknown Professor") return false;
      if (!p.profileUrl) return false;
      return true;
    }).map((p) => ({
      name: String(p.name),
      title: p.title ? String(p.title) : "Faculty",
      university: String(p.university ?? req.university ?? "University"),
      department: p.department ? String(p.department) : req.researchInterest,
      researchAreas: Array.isArray(p.researchAreas) ? p.researchAreas.map(String) : [req.researchInterest],
      email: p.email ? String(p.email) : null,
      profileUrl: p.profileUrl ? String(p.profileUrl) : null,
      snippet: String(p.snippet ?? ""),
      sourceVerified: true,
      isProfilePage: p.isProfilePage === true,
      emailTemplate: buildEmailTemplate({
        name: String(p.name),
        university: String(p.university ?? req.university ?? "their university"),
        researchInterest: req.researchInterest,
        level: req.level ?? "phd"
      }),
      _profileScore: scoreProfileLikelihood({
        title: "",
        link: String(p.profileUrl ?? ""),
        snippet: String(p.snippet ?? "")
      })
    }));
    extracted.sort((a, b) => {
      const aScore = (a.isProfilePage ? 30 : 0) + a._profileScore;
      const bScore = (b.isProfilePage ? 30 : 0) + b._profileScore;
      return bScore - aScore;
    });
    return extracted.slice(0, 5).map(({ _profileScore: _, isProfilePage: __, ...rest }) => rest);
  } catch {
    return [];
  }
}
function buildEmailTemplate(opts) {
  return `Subject: Inquiry About ${opts.level === "phd" ? "PhD" : "Research"} Opportunities in ${opts.researchInterest}

Dear ${opts.name},

I hope this email finds you well. My name is [Your Name], and I am a [Your Degree] student at [Your Institution] with a strong background in [Your Field]. I came across your work on ${opts.researchInterest} and found it closely aligned with my research interests.

I am writing to inquire about potential ${opts.level === "phd" ? "PhD" : "research"} positions in your group for [intake term, e.g., Fall 2027]. I am particularly interested in [specific aspect of their research].

My academic profile:
- GPA: [Your GPA]
- Research experience: [Brief mention]
- Relevant skills: [Key skills]

I have attached my CV and would be delighted to discuss potential research directions. Please find my research statement attached as well.

Thank you for your time and consideration.

Warm regards,
[Your Name]
[Your Email]
[Your University]`;
}
function getProviderStatus() {
  const serperKey = process.env.SERPER_APIKEY || process.env.SERPER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const missingKeys = [];
  if (!serperKey) missingKeys.push("SERPER_API_KEY");
  if (!openaiKey && !openrouterKey) missingKeys.push("OPENAI_API_KEY or OPENROUTER_API_KEY");
  return {
    searchReady: !!serperKey,
    extractReady: !!(openaiKey || openrouterKey),
    missingKeys
  };
}
async function searchProfessors(req) {
  const { searchReady, extractReady, missingKeys } = getProviderStatus();
  if (!searchReady || !extractReady) {
    const missing = missingKeys.join(", ");
    throw new Error(
      `Professor search is not configured for this deployment. Missing env vars: ${missing}. Set these in your server environment to enable professor search.`
    );
  }
  const profileQuery = buildProfileQuery(req);
  const broadQuery = buildBroadQuery(req);
  const [profileResults, broadResults] = await Promise.all([
    serperSearch2(profileQuery, 8),
    serperSearch2(broadQuery, 6)
  ]);
  const seen = /* @__PURE__ */ new Set();
  const combined = [];
  for (const r of [...profileResults, ...broadResults]) {
    if (r.link && !seen.has(r.link)) {
      seen.add(r.link);
      combined.push(r);
    }
  }
  const professors = await extractProfessors(combined, req);
  const warning = professors.length === 0 && combined.length === 0 ? "No web results found. Check your search terms or try a different university name." : professors.length === 0 && combined.length > 0 ? "Search returned results but no verified professors could be extracted. Try a more specific research area or university name." : void 0;
  return {
    query: profileQuery,
    results: professors,
    searchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    warning
  };
}
function buildProfileQuery(req) {
  const parts = [];
  if (req.university) {
    const uniSlug = req.university.toLowerCase().replace(/\s+/g, "");
    parts.push(`(site:${uniSlug}.edu OR site:${uniSlug}.ac.uk OR "${req.university}")`);
    parts.push("professor faculty profile");
  } else {
    parts.push("professor faculty profile page");
  }
  parts.push(`"${req.researchInterest}"`);
  if (req.country) parts.push(req.country);
  parts.push("(inurl:faculty OR inurl:people OR inurl:staff OR inurl:profile OR inurl:researcher)");
  return parts.join(" ");
}
function buildBroadQuery(req) {
  const parts = [];
  if (req.university) {
    parts.push(`"${req.university}" professor`);
  } else {
    parts.push("professor");
  }
  parts.push(`"${req.researchInterest}"`);
  if (req.country) parts.push(req.country);
  parts.push("faculty research");
  return parts.join(" ");
}

// src/controllers/professors.controller.ts
async function searchProfessorsHandler(req, res) {
  const { researchInterest, university, country, level } = req.body;
  if (!researchInterest || typeof researchInterest !== "string" || researchInterest.trim().length === 0) {
    res.status(400).json({ error: "researchInterest is required" });
    return;
  }
  if (researchInterest.length > 200) {
    res.status(400).json({ error: "researchInterest must be 200 characters or fewer" });
    return;
  }
  if (!isValidQuery(researchInterest)) {
    res.status(400).json({ error: 'Please enter a real research area (e.g. "Natural Language Processing", "Quantum Computing")' });
    return;
  }
  if (university && !isValidQuery(university)) {
    res.status(400).json({ error: "Please enter a valid university name" });
    return;
  }
  try {
    logger_default.info(`[professors] searching for "${researchInterest}" university=${university ?? "any"} country=${country ?? "any"}`);
    const result = await searchProfessors({
      researchInterest: researchInterest.trim(),
      university: university?.trim() || void 0,
      country: country?.trim() || void 0,
      level: level === "masters" ? "masters" : "phd"
    });
    logger_default.info(`[professors] found ${result.results.length} verified professors`);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("not configured") || message.includes("Missing env vars")) {
      logger_default.warn(`[professors] provider not configured: ${message}`);
      res.status(503).json({
        error: "Professor search is not available in this deployment.",
        detail: "The search provider (SERPER_API_KEY) or AI extractor (OPENAI_API_KEY / OPENROUTER_API_KEY) is not configured. Contact the site administrator."
      });
      return;
    }
    logger_default.error(`[professors] search failed: ${message}`);
    res.status(502).json({ error: "Professor search failed. Please try again." });
  }
}

// src/routes/professors.router.ts
var router17 = Router17();
router17.use(authMiddleware);
router17.post("/search", searchProfessorsHandler);
var professors_router_default = router17;

// src/routes/gapfix.router.ts
import fs3 from "node:fs";
import { Router as Router18 } from "express";
import multer from "multer";

// src/controllers/gapfix.controller.ts
import path4 from "node:path";
import fs2 from "node:fs";

// src/services/gapfix.service.ts
var OPENAI_URL6 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL6 = "https://openrouter.ai/api/v1/chat/completions";
function computeGapFixComparison(prev, current) {
  return {
    previousScore: prev.profileScore,
    currentScore: current.profileScore,
    scoreImprovement: current.profileScore - prev.profileScore,
    previousStrengths: prev.strengths,
    newStrengths: current.strengths,
    resolvedGaps: prev.weaknesses.filter((w) => !current.weaknesses.some((cw) => cw === w)),
    remainingGaps: current.weaknesses.filter((w) => prev.weaknesses.some((pw) => pw === w)),
    newGaps: current.weaknesses.filter((w) => !prev.weaknesses.some((pw) => pw === w))
  };
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function assignRecommendationIds(recs) {
  const seen = /* @__PURE__ */ new Map();
  return recs.map((rec) => {
    const base = slugify(rec.category);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return { ...rec, id: count === 0 ? base : `${base}-${count}` };
  });
}
function assessProfileWeaknesses(req) {
  const weaknesses = [];
  const strengths = [];
  let score = 50;
  if (req.gpa !== void 0 && req.gpaScale) {
    const normalised = req.gpaScale === "4.0" ? req.gpa : req.gpaScale === "10" ? req.gpa / 10 * 4 : req.gpaScale === "5" ? req.gpa / 5 * 4 : req.gpa;
    if (normalised < 2.5) {
      weaknesses.push("GPA is significantly below competitive thresholds (< 2.5/4.0)");
      score -= 15;
    } else if (normalised < 3) {
      weaknesses.push("GPA is below competitive range for top programs (< 3.0/4.0)");
      score -= 8;
    } else if (normalised >= 3.5) {
      strengths.push(`Strong GPA: ${req.gpa}/${req.gpaScale}`);
      score += 10;
    } else {
      strengths.push(`Adequate GPA: ${req.gpa}/${req.gpaScale}`);
      score += 4;
    }
  } else {
    weaknesses.push("GPA not provided \u2014 required for most graduate applications");
    score -= 5;
  }
  if (req.backlogs && req.backlogs > 0) {
    weaknesses.push(`${req.backlogs} academic backlog(s) noted \u2014 may raise admissions concerns`);
    score -= req.backlogs > 3 ? 12 : 5;
  }
  if (!req.englishTestType || !req.englishScore) {
    if (req.intendedLevel && req.intendedLevel !== "BSC") {
      weaknesses.push("No English proficiency test score (IELTS/TOEFL) provided");
      score -= 10;
    }
  } else {
    const isStrong = req.englishTestType === "IELTS" && req.englishScore >= 7 || req.englishTestType === "TOEFL" && req.englishScore >= 95;
    if (isStrong) {
      strengths.push(`Strong English test: ${req.englishTestType} ${req.englishScore}`);
      score += 8;
    } else {
      weaknesses.push(`English test score is below competitive range (${req.englishTestType}: ${req.englishScore})`);
      score -= 5;
    }
  }
  if ((req.intendedLevel === "MSC" || req.intendedLevel === "PHD") && !req.gre && !req.gmat) {
    weaknesses.push("No GRE/GMAT score \u2014 many competitive programs require or prefer it");
    score -= 5;
  } else if (req.gre) {
    if (req.gre >= 320) {
      strengths.push(`Strong GRE score: ${req.gre}`);
      score += 8;
    } else if (req.gre < 300) {
      weaknesses.push(`GRE score is below competitive range (${req.gre} < 300)`);
      score -= 5;
    }
  }
  const workMonths = req.workExperienceMonths ?? 0;
  if (workMonths === 0 && req.intendedLevel === "MSC") {
    weaknesses.push("No work/research experience \u2014 competitive programs value practical experience");
    score -= 5;
  } else if (workMonths >= 12) {
    strengths.push(`Solid work experience: ${Math.floor(workMonths / 12)} year(s)`);
    score += 5;
  }
  if (req.intendedLevel === "PHD" && workMonths < 6) {
    weaknesses.push("Limited research/work experience for PhD applications \u2014 research background is critical");
    score -= 10;
  }
  if (req.fundingNeed && score < 60) {
    weaknesses.push("Funding is needed but profile competitiveness may limit scholarship options");
  }
  return { weaknesses, strengths, score: Math.min(100, Math.max(10, score)) };
}
async function generateGapFix(req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL6 : OPENROUTER_URL6;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const { weaknesses, strengths, score } = assessProfileWeaknesses(req);
  const profileSummary = [
    req.currentStage && `Current stage: ${req.currentStage}`,
    req.intendedLevel && `Target level: ${req.intendedLevel}`,
    req.intendedMajor && `Intended major: ${req.intendedMajor}`,
    req.targetCountries?.length && `Target countries: ${req.targetCountries.join(", ")}`,
    req.targetIntake && `Target intake: ${req.targetIntake}`,
    req.gpa && `GPA: ${req.gpa}/${req.gpaScale ?? "4.0"}`,
    req.backlogs && `Backlogs: ${req.backlogs}`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.gre && `GRE: ${req.gre}`,
    req.gmat && `GMAT: ${req.gmat}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.fundingNeed && "Needs scholarship/funding"
  ].filter(Boolean).join("\n");
  const weaknessSummary = weaknesses.length > 0 ? `Identified weaknesses:
${weaknesses.map((w) => `- ${w}`).join("\n")}` : "No critical weaknesses detected.";
  const prompt = `You are an expert graduate admissions counselor helping a student strengthen their application profile.

Student Profile:
${profileSummary || "Limited profile information provided."}

${weaknessSummary}

Provide a structured gap analysis with CONCRETE, actionable recommendations. For each gap, provide specific resources (platform names, course names, certifications).

Return a JSON object with this exact structure:
{
  "recommendations": [
    {
      "category": "Academic Performance | English Proficiency | Standardized Tests | Research Experience | Technical Skills | Portfolio/Projects | Professional Experience | Publications | Soft Skills",
      "priority": "high | medium | low",
      "title": "Short title",
      "description": "2-3 sentences explaining the gap and its impact",
      "actions": ["specific action 1", "specific action 2", "specific action 3"],
      "resources": ["Resource name 1 (platform)", "Resource name 2 (course/cert)"],
      "timelineWeeks": 4
    }
  ],
  "prioritySummary": "2-3 sentence summary of the most important things to focus on given their goals and timeline"
}

Provide 3-6 recommendations. Focus on what's most impactful for their specific target (${req.intendedLevel ?? "graduate"} in ${req.intendedMajor ?? "their field"} in ${req.targetCountries?.join("/") ?? "target country"}).
Return ONLY valid JSON. No markdown, no explanation.`;
  if (!apiKey) {
    return buildFallbackResult(req, score, weaknesses, strengths);
  }
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(3e4)
    });
    if (!response.ok) throw new Error(`LLM error: ${response.status}`);
    const data = await response.json();
    const raw2 = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw2) throw new Error("Empty LLM response");
    const parsed = JSON.parse(raw2);
    return {
      profileScore: score,
      strengths,
      weaknesses,
      recommendations: assignRecommendationIds((parsed.recommendations ?? []).slice(0, 6)),
      prioritySummary: parsed.prioritySummary ?? "Focus on your highest-priority gaps first.",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return buildFallbackResult(req, score, weaknesses, strengths);
  }
}
function buildFallbackResult(req, score, weaknesses, strengths) {
  const recs = [];
  const gpa = req.gpa ? req.gpaScale === "4.0" ? req.gpa : req.gpaScale === "10" ? req.gpa / 10 * 4 : req.gpa : null;
  if (gpa !== null && gpa < 3) {
    recs.push({
      category: "Academic Performance",
      priority: "high",
      title: "Strengthen your academic record",
      description: "Your GPA is below competitive thresholds for most graduate programs. Consider retaking weak courses, completing additional coursework, or applying to programs with more flexible admission bands.",
      actions: [
        "Retake your lowest-scoring courses to replace grades where allowed",
        "Enroll in advanced online courses in your field to demonstrate capability",
        "Write a strong GPA explanation in your SOP if improvement is not possible"
      ],
      resources: ["Coursera Specializations", "edX MicroMasters", "MIT OpenCourseWare"],
      timelineWeeks: 12
    });
  }
  if (!req.englishTestType || !req.englishScore) {
    recs.push({
      category: "English Proficiency",
      priority: "high",
      title: "Take an English proficiency test",
      description: "IELTS or TOEFL scores are required by most graduate programs in English-speaking countries and increasingly by programs in Germany, Netherlands, and other European destinations.",
      actions: [
        "Register for IELTS Academic (target 7.0+) or TOEFL iBT (target 95+)",
        "Complete a 4\u20138 week structured preparation course",
        "Practice with official past papers and timed mock tests"
      ],
      resources: ["IELTS.org official prep", "ETS TOEFL prep", "Magoosh IELTS/TOEFL", "British Council online courses"],
      timelineWeeks: 8
    });
  }
  if ((req.intendedLevel === "MSC" || req.intendedLevel === "PHD") && !req.gre && !req.gmat) {
    recs.push({
      category: "Standardized Tests",
      priority: "medium",
      title: "Consider taking the GRE",
      description: "A strong GRE score (320+) significantly improves competitiveness for top MS/PhD programs, especially in the US and Canada. Some programs require it; others use it as a differentiator.",
      actions: [
        "Review GRE requirements for your specific target programs",
        "Complete a structured 6\u20138 week GRE preparation plan",
        "Target Verbal \u2265 155, Quant \u2265 165 for STEM fields"
      ],
      resources: ["Magoosh GRE", "Manhattan Prep GRE", "ETS official GRE prep", "Khan Academy for math"],
      timelineWeeks: 8
    });
  }
  if ((req.workExperienceMonths ?? 0) < 6 && req.intendedLevel === "PHD") {
    recs.push({
      category: "Research Experience",
      priority: "high",
      title: "Build research credentials before applying",
      description: "PhD programs expect applicants to demonstrate research ability. Without research experience, your application will be at a significant disadvantage regardless of other profile strengths.",
      actions: [
        "Apply for a research assistant position at your current or nearby institution",
        "Contact professors working in your area of interest for volunteer research opportunities",
        "Complete a replication study or mini-research project and document it on GitHub/portfolio",
        "Aim to co-author or contribute to a conference paper within 6 months"
      ],
      resources: ["ResearchGate", "Academia.edu", "GitHub for open research", "Google Scholar to find target professors"],
      timelineWeeks: 16
    });
  }
  if (req.intendedMajor?.toLowerCase().includes("computer") || req.intendedMajor?.toLowerCase().includes("data") || req.intendedMajor?.toLowerCase().includes("ai")) {
    recs.push({
      category: "Technical Skills",
      priority: "medium",
      title: "Build a technical project portfolio",
      description: "A strong GitHub portfolio with 2\u20133 relevant projects significantly strengthens CS/Data Science/AI applications. Admissions committees and potential advisors actively review GitHub profiles.",
      actions: [
        "Build and document 2\u20133 original projects in your target field",
        "Contribute to an open-source project in your research area",
        "Complete a Kaggle competition and write up your approach",
        "Deploy at least one project with a live demo link"
      ],
      resources: ["GitHub", "Kaggle", "Hugging Face for AI/ML", "fast.ai courses", "Papers with Code"],
      timelineWeeks: 10
    });
  }
  recs.push({
    category: "Professional Experience",
    priority: "medium",
    title: "Strengthen your resume with relevant experience",
    description: "Internships, part-time work, or project-based experience in your intended field demonstrates practical competence and makes your application narrative more compelling.",
    actions: [
      "Apply for relevant internships or co-op positions in your field",
      "Volunteer for NGOs, research labs, or companies in your sector",
      "Document all relevant projects and achievements in your CV/resume"
    ],
    resources: ["LinkedIn Jobs", "Internshala", "Indeed", "Glassdoor", "University career center"],
    timelineWeeks: 12
  });
  return {
    profileScore: score,
    strengths,
    weaknesses,
    recommendations: assignRecommendationIds(recs.slice(0, 5)),
    prioritySummary: weaknesses.length > 0 ? `Focus on: ${weaknesses.slice(0, 2).join("; ")}. Your profile score is ${score}/100 \u2014 addressing high-priority gaps can significantly improve your competitiveness.` : `Your profile looks strong with a score of ${score}/100. Focus on rounding out the medium-priority areas to maximize your chances.`,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/controllers/gapfix.controller.ts
init_database();
function param(p) {
  return Array.isArray(p) ? p[0] : p;
}
function buildProfileSnapshot(p) {
  return {
    gpa: p.gpa ?? null,
    gpaScale: p.gpaScale ?? null,
    backlogs: p.backlogs ?? null,
    graduationYear: p.graduationYear ?? null,
    englishTestType: p.englishTestType ?? null,
    englishScore: p.englishScore ?? null,
    gre: p.gre ?? null,
    gmat: p.gmat ?? null,
    workExperienceMonths: p.workExperienceMonths ?? null,
    intendedLevel: p.intendedLevel ?? null,
    intendedMajor: p.intendedMajor ?? null,
    targetCountries: p.targetCountries ?? [],
    targetIntake: p.targetIntake ?? null,
    currentStage: p.currentStage ?? null,
    fundingNeed: p.fundingNeed ?? null
  };
}
async function getSessionWithDetails(sessionId, userId) {
  const session2 = await database_default.gapFixSession.findFirst({
    where: { id: sessionId, userId },
    include: { evidences: { orderBy: { uploadedAt: "asc" } } }
  });
  if (!session2) return null;
  let previousResult = null;
  if (session2.previousSessionId) {
    const prev = await database_default.gapFixSession.findUnique({ where: { id: session2.previousSessionId } });
    if (prev) previousResult = prev.result;
  }
  const result = session2.result;
  const comparison = previousResult ? computeGapFixComparison(previousResult, result) : null;
  return { ...session2, previousResult, comparison };
}
async function getLatestSessionWithDetails(userId) {
  const session2 = await database_default.gapFixSession.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { evidences: { orderBy: { uploadedAt: "asc" } } }
  });
  if (!session2) return null;
  let previousResult = null;
  if (session2.previousSessionId) {
    const prev = await database_default.gapFixSession.findUnique({ where: { id: session2.previousSessionId } });
    if (prev) previousResult = prev.result;
  }
  const result = session2.result;
  const comparison = previousResult ? computeGapFixComparison(previousResult, result) : null;
  return { ...session2, previousResult, comparison };
}
async function gapFixGetSessionHandler(req, res) {
  const userId = req.userId;
  try {
    const session2 = await getLatestSessionWithDetails(userId);
    if (!session2) {
      res.status(404).json({ error: "No session found" });
      return;
    }
    res.status(200).json(session2);
  } catch (err) {
    logger_default.error(`[gapfix] getSession failed for userId=${userId}: ${err}`);
    res.status(500).json({ error: "Failed to fetch session" });
  }
}
async function gapFixGenerateHandler(req, res) {
  const userId = req.userId;
  try {
    const profileRecord = await database_default.userProfile.findUnique({ where: { userId } });
    const hasGoalData = !!(profileRecord?.intendedLevel || profileRecord?.intendedMajor || profileRecord?.majorOrTrack || profileRecord?.targetCountries);
    const hasAcademicData = !!(profileRecord?.gpa || profileRecord?.englishTestType);
    const analysisMode = !profileRecord ? "minimal" : hasGoalData && hasAcademicData ? "full" : "partial";
    logger_default.info(`[gapfix] generating recommendations for userId=${userId} mode=${analysisMode}`);
    const result = await generateGapFix({
      gpa: profileRecord?.gpa ?? void 0,
      gpaScale: profileRecord?.gpaScale ?? void 0,
      backlogs: profileRecord?.backlogs ?? void 0,
      graduationYear: profileRecord?.graduationYear ?? void 0,
      englishTestType: profileRecord?.englishTestType ?? void 0,
      englishScore: profileRecord?.englishScore ?? void 0,
      gre: profileRecord?.gre ?? void 0,
      gmat: profileRecord?.gmat ?? void 0,
      workExperienceMonths: profileRecord?.workExperienceMonths ?? void 0,
      intendedLevel: profileRecord?.intendedLevel ?? void 0,
      // Priority: intendedAbroadMajor (study abroad target) → intendedMajor → majorOrTrack
      intendedMajor: profileRecord.intendedAbroadMajor ?? profileRecord?.intendedMajor ?? profileRecord?.majorOrTrack ?? void 0,
      targetCountries: profileRecord?.targetCountries ?? void 0,
      targetIntake: profileRecord?.targetIntake ?? void 0,
      currentStage: profileRecord?.currentStage ?? void 0,
      fundingNeed: profileRecord?.fundingNeed ?? void 0
    });
    const initialStatuses = {};
    for (const rec of result.recommendations) {
      initialStatuses[rec.id] = "not_started";
    }
    const profileSnap = profileRecord ? { ...buildProfileSnapshot(profileRecord), analysisMode } : { analysisMode };
    const session2 = await database_default.gapFixSession.create({
      data: {
        userId,
        result,
        gapStatuses: initialStatuses,
        improvements: [],
        profileSnapshot: profileSnap
      },
      include: { evidences: true }
    });
    logger_default.info(`[gapfix] session=${session2.id} score=${result.profileScore} mode=${analysisMode} for userId=${userId}`);
    res.status(200).json({ ...session2, previousResult: null, comparison: null, analysisMode });
  } catch (err) {
    logger_default.error(`[gapfix] analyze failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: "Gap analysis failed. Please try again." });
  }
}
async function gapFixUpdateGapStatusHandler(req, res) {
  const userId = req.userId;
  const sessionId = param(req.params.id);
  const { recId, status } = req.body;
  const allowed = ["not_started", "in_progress", "completed", "skipped"];
  if (!recId || !allowed.includes(status)) {
    res.status(400).json({ error: "Invalid recId or status" });
    return;
  }
  try {
    const session2 = await database_default.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session2) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const statuses = { ...session2.gapStatuses ?? {} };
    statuses[recId] = status;
    await database_default.gapFixSession.update({
      where: { id: sessionId },
      data: { gapStatuses: statuses }
    });
    res.status(200).json({ ok: true, recId, status });
  } catch (err) {
    logger_default.error(`[gapfix] updateStatus failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: "Failed to update status" });
  }
}
async function gapFixAddImprovementHandler(req, res) {
  const userId = req.userId;
  const sessionId = param(req.params.id);
  const body = req.body;
  if (!body.type || !body.description) {
    res.status(400).json({ error: "type and description are required" });
    return;
  }
  try {
    const session2 = await database_default.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session2) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const entry = {
      id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: body.type,
      description: body.description,
      testType: body.testType,
      scoreValue: body.scoreValue,
      addedAt: (/* @__PURE__ */ new Date()).toISOString(),
      appliedToProfile: false
    };
    if (body.applyToProfile && body.testType && body.scoreValue !== void 0) {
      const testType = body.testType.toUpperCase();
      const profilePatch = {};
      if (["IELTS", "TOEFL", "PTE", "DUOLINGO"].includes(testType)) {
        profilePatch.englishTestType = body.testType;
        profilePatch.englishScore = body.scoreValue;
      } else if (testType === "GRE") {
        profilePatch.gre = body.scoreValue;
      } else if (testType === "GMAT") {
        profilePatch.gmat = body.scoreValue;
      }
      if (Object.keys(profilePatch).length > 0) {
        await database_default.userProfile.updateMany({ where: { userId }, data: profilePatch });
        entry.appliedToProfile = true;
      }
    }
    const existing = session2.improvements ?? [];
    const improvements = [...existing, entry];
    await database_default.gapFixSession.update({
      where: { id: sessionId },
      data: { improvements }
    });
    const full = await getSessionWithDetails(sessionId, userId);
    res.status(200).json(full);
  } catch (err) {
    logger_default.error(`[gapfix] addImprovement failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: "Failed to add improvement" });
  }
}
async function gapFixAddEvidenceHandler(req, res) {
  const userId = req.userId;
  const sessionId = param(req.params.id);
  const body = req.body;
  const uploadedFile = req.file;
  if (!body.recId || !body.type || !body.label) {
    res.status(400).json({ error: "recId, type, and label are required" });
    return;
  }
  try {
    const session2 = await database_default.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session2) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const isLink = !uploadedFile && !!body.url;
    const evidence = await database_default.gapFixEvidence.create({
      data: {
        sessionId,
        userId,
        recId: body.recId,
        type: body.type,
        label: body.label,
        url: isLink ? body.url ?? void 0 : void 0,
        fileName: uploadedFile?.originalname ?? void 0,
        fileSize: uploadedFile?.size ?? void 0,
        status: uploadedFile ? "uploaded" : "linked"
      }
    });
    res.status(201).json(evidence);
  } catch (err) {
    logger_default.error(`[gapfix] addEvidence failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: "Failed to add evidence" });
  }
}
async function gapFixDeleteEvidenceHandler(req, res) {
  const userId = req.userId;
  const evidenceId = param(req.params.evidenceId);
  try {
    const ev = await database_default.gapFixEvidence.findFirst({ where: { id: evidenceId, userId } });
    if (!ev) {
      res.status(404).json({ error: "Evidence not found" });
      return;
    }
    if (ev.fileName && !ev.url) {
      const UPLOAD_DIR2 = getGapFixUploadDir();
      const files = fs2.existsSync(UPLOAD_DIR2) ? fs2.readdirSync(UPLOAD_DIR2) : [];
      const match = files.find((f) => f.endsWith(`-${ev.fileName}`));
      if (match) fs2.unlinkSync(path4.join(UPLOAD_DIR2, match));
    }
    await database_default.gapFixEvidence.delete({ where: { id: evidenceId } });
    res.status(200).json({ ok: true });
  } catch (err) {
    logger_default.error(`[gapfix] deleteEvidence failed evidenceId=${evidenceId}: ${err}`);
    res.status(500).json({ error: "Failed to delete evidence" });
  }
}
async function gapFixVerifyEvidenceHandler(req, res) {
  const userId = req.userId;
  const evidenceId = param(req.params.evidenceId);
  const { status, notes } = req.body;
  const allowedStatuses = ["pending", "verified", "rejected"];
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status. Must be pending, verified, or rejected" });
    return;
  }
  try {
    const ev = await database_default.gapFixEvidence.findFirst({ where: { id: evidenceId, userId } });
    if (!ev) {
      res.status(404).json({ error: "Evidence not found" });
      return;
    }
    if (!ev.url && !ev.fileName) {
      res.status(400).json({ error: "Cannot verify evidence without URL or file" });
      return;
    }
    const updateData = { status };
    if (status === "verified") {
      updateData.verifiedAt = /* @__PURE__ */ new Date();
    }
    if (notes) {
      updateData.verificationNotes = notes;
    }
    const updated = await database_default.gapFixEvidence.update({
      where: { id: evidenceId },
      data: updateData
    });
    logger_default.info(`[gapfix] evidence=${evidenceId} status=${status} by userId=${userId}`);
    res.status(200).json(updated);
  } catch (err) {
    logger_default.error(`[gapfix] verifyEvidence failed evidenceId=${evidenceId}: ${err}`);
    res.status(500).json({ error: "Failed to verify evidence" });
  }
}
async function gapFixGetEvidenceStatusHandler(req, res) {
  const userId = req.userId;
  const sessionId = param(req.params.id);
  try {
    const session2 = await database_default.gapFixSession.findFirst({ where: { id: sessionId, userId } });
    if (!session2) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    const evidences = await database_default.gapFixEvidence.findMany({
      where: { sessionId },
      select: { id: true, recId: true, status: true, type: true, label: true }
    });
    const statusByRecId = {};
    for (const ev of evidences) {
      if (!statusByRecId[ev.recId]) {
        statusByRecId[ev.recId] = { pending: 0, verified: 0, rejected: 0 };
      }
      if (ev.status === "verified") statusByRecId[ev.recId].verified++;
      else if (ev.status === "rejected") statusByRecId[ev.recId].rejected++;
      else statusByRecId[ev.recId].pending++;
    }
    const allVerified = Object.values(statusByRecId).every(
      (counts) => counts.verified > 0 && counts.pending === 0 && counts.rejected === 0
    );
    res.status(200).json({
      evidences,
      statusByRecId,
      canRecalculateScore: allVerified
    });
  } catch (err) {
    logger_default.error(`[gapfix] getEvidenceStatus failed sessionId=${sessionId}: ${err}`);
    res.status(500).json({ error: "Failed to get evidence status" });
  }
}
async function gapFixReanalyzeHandler(req, res) {
  const userId = req.userId;
  const previousSessionId = param(req.params.id);
  try {
    const previousSession = await database_default.gapFixSession.findFirst({ where: { id: previousSessionId, userId } });
    if (!previousSession) {
      res.status(404).json({ error: "Previous session not found" });
      return;
    }
    const profileRecord = await database_default.userProfile.findUnique({ where: { userId } });
    if (!profileRecord) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    logger_default.info(`[gapfix] re-analyzing userId=${userId} previousSession=${previousSessionId}`);
    const newResult = await generateGapFix({
      gpa: profileRecord.gpa ?? void 0,
      gpaScale: profileRecord.gpaScale ?? void 0,
      backlogs: profileRecord.backlogs ?? void 0,
      graduationYear: profileRecord.graduationYear ?? void 0,
      englishTestType: profileRecord.englishTestType ?? void 0,
      englishScore: profileRecord.englishScore ?? void 0,
      gre: profileRecord.gre ?? void 0,
      gmat: profileRecord.gmat ?? void 0,
      workExperienceMonths: profileRecord.workExperienceMonths ?? void 0,
      intendedLevel: profileRecord.intendedLevel ?? void 0,
      // Priority: intendedAbroadMajor (study abroad target) → intendedMajor → majorOrTrack
      intendedMajor: profileRecord.intendedAbroadMajor ?? profileRecord.intendedMajor ?? profileRecord.majorOrTrack ?? void 0,
      targetCountries: profileRecord.targetCountries ?? void 0,
      targetIntake: profileRecord.targetIntake ?? void 0,
      currentStage: profileRecord.currentStage ?? void 0,
      fundingNeed: profileRecord.fundingNeed ?? void 0
    });
    const prevStatuses = previousSession.gapStatuses ?? {};
    const newStatuses = {};
    for (const rec of newResult.recommendations) {
      newStatuses[rec.id] = prevStatuses[rec.id] ?? "not_started";
    }
    const newSession = await database_default.gapFixSession.create({
      data: {
        userId,
        result: newResult,
        gapStatuses: newStatuses,
        improvements: [],
        profileSnapshot: buildProfileSnapshot(profileRecord),
        previousSessionId
      },
      include: { evidences: true }
    });
    const previousResult = previousSession.result;
    const comparison = computeGapFixComparison(previousResult, newResult);
    logger_default.info(`[gapfix] re-analysis session=${newSession.id} score ${previousResult.profileScore} \u2192 ${newResult.profileScore}`);
    res.status(200).json({ ...newSession, previousResult, comparison });
  } catch (err) {
    logger_default.error(`[gapfix] reanalyze failed userId=${userId}: ${err}`);
    res.status(502).json({ error: "Re-analysis failed. Please try again." });
  }
}

// src/routes/gapfix.router.ts
var UPLOAD_DIR = getGapFixUploadDir();
if (!fs3.existsSync(UPLOAD_DIR)) fs3.mkdirSync(UPLOAD_DIR, { recursive: true });
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    cb(null, allowed.includes(file.mimetype));
  }
});
var router18 = Router18();
router18.use(authMiddleware);
router18.post("/analyze", gapFixGenerateHandler);
router18.get("/session", gapFixGetSessionHandler);
router18.patch("/session/:id/status", gapFixUpdateGapStatusHandler);
router18.post("/session/:id/improvement", gapFixAddImprovementHandler);
router18.post("/session/:id/reanalyze", gapFixReanalyzeHandler);
router18.post("/session/:id/evidence", upload.single("file"), gapFixAddEvidenceHandler);
router18.delete("/evidence/:evidenceId", gapFixDeleteEvidenceHandler);
router18.patch("/evidence/:evidenceId/verify", gapFixVerifyEvidenceHandler);
router18.get("/session/:id/evidence-status", gapFixGetEvidenceStatusHandler);
var gapfix_router_default = router18;

// src/routes/gapFixRoutes.ts
import { Router as Router19 } from "express";
import multer2 from "multer";
init_database();

// src/services/supabaseStorageService.ts
import { createClient } from "@supabase/supabase-js";
var BUCKET_NAME = process.env.SUPABASE_EVIDENCE_BUCKET || "evidence";
var SIGNED_URL_TTL_SECONDS = 604800;
var _client = null;
var _configured = false;
function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    if (!_configured) {
      console.warn("[supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not configured. Upload will fail.");
      _configured = true;
    }
    return null;
  }
  if (!_client) {
    _client = createClient(url, key);
  }
  return _client;
}
async function uploadEvidencePDF(userId, evidenceId, fileBuffer, fileName) {
  const supabase = getClient();
  if (!supabase) {
    throw new Error("Evidence storage is currently unavailable. Please try again later or contact support if the problem persists.");
  }
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const storagePath = `gap-evidence/${userId}/${evidenceId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, fileBuffer, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);
  const { data: signedData, error: signError } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);
  if (signError || !signedData?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${signError?.message ?? "unknown error"}`);
  }
  return { signedUrl: signedData.signedUrl, storagePath };
}
async function deleteEvidencePDF(storagePath) {
  const supabase = getClient();
  if (!supabase) {
    console.warn("[supabase] Cannot delete - storage not configured");
    return;
  }
  try {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  } catch {
  }
}

// src/routes/gapFixRoutes.ts
var router19 = Router19();
router19.use(authMiddleware);
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  }
});
var AI_URL = process.env.AI_SERVER_URL || "http://localhost:8001";
var AI_KEY = process.env.AI_SERVER_API_KEY || "";
async function callAI(path5, body) {
  const res = await fetch(`${AI_URL}${path5}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": AI_KEY },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3e4)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI server error ${res.status}: ${text}`);
  }
  return res.json();
}
function calculateScore(items) {
  if (!items.length) return 0;
  let totalWeight = 0;
  let earnedWeight = 0;
  const WEIGHTS = { high: 3, medium: 2, low: 1 };
  for (const item of items) {
    const w = WEIGHTS[item.priority] ?? 2;
    totalWeight += w;
    if (item.aiVerified && item.status === "completed") earnedWeight += w;
    else if (item.aiVerified && item.status === "in_progress") earnedWeight += w * 0.5;
  }
  return totalWeight > 0 ? Math.round(earnedWeight / totalWeight * 100) : 0;
}
function parseResourceLinks(raw2) {
  if (!raw2) return [];
  try {
    return JSON.parse(raw2);
  } catch {
    return [];
  }
}
router19.get("/", async (req, res) => {
  const userId = req.userId;
  try {
    const items = await database_default.gapFixItem.findMany({
      where: { userId },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }]
    });
    const score = calculateScore(items);
    res.json({
      items: items.map((i) => ({ ...i, resourceLinks: parseResourceLinks(i.resourceLinks) })),
      score,
      totalItems: items.length,
      completedItems: items.filter((i) => i.aiVerified && i.status === "completed").length
    });
  } catch {
    res.status(500).json({ error: "Failed to load gap fix data" });
  }
});
router19.post("/analyze", async (req, res) => {
  const userId = req.userId;
  const { profile, targetCountries, targetField } = req.body;
  if (!profile) {
    res.status(400).json({ error: "Profile data required" });
    return;
  }
  try {
    const analysis = await callAI("/api/v1/gap-fix/analyze", {
      profile,
      target_countries: targetCountries ?? [],
      target_field: targetField ?? "General"
    });
    const gaps = analysis.gaps ?? [];
    const saved = [];
    for (const gap of gaps) {
      const existing = await database_default.gapFixItem.findFirst({
        where: { userId, gapType: gap.gapType, title: gap.title }
      });
      if (!existing) {
        const item = await database_default.gapFixItem.create({
          data: {
            userId,
            gapType: gap.gapType,
            title: gap.title,
            description: gap.description,
            priority: gap.priority ?? "medium",
            status: "not_started",
            resourceLinks: JSON.stringify(gap.resourceLinks ?? [])
          }
        });
        saved.push(item);
      } else {
        saved.push(existing);
      }
    }
    const score = calculateScore(saved);
    res.json({
      items: saved.map((i) => ({ ...i, resourceLinks: parseResourceLinks(i.resourceLinks) })),
      score,
      totalItems: saved.length,
      completedItems: 0,
      overall_competitiveness: analysis.overall_competitiveness,
      top_strength: analysis.top_strength,
      critical_gap: analysis.critical_gap
    });
  } catch (err) {
    console.error("Gap Fix analyze error:", err);
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});
router19.post("/:id/upload-pdf", upload2.single("pdf"), async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  if (!req.file) {
    res.status(400).json({ error: "No PDF file uploaded" });
    return;
  }
  const item = await database_default.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) {
    res.status(404).json({ error: "Gap item not found" });
    return;
  }
  try {
    const { signedUrl, storagePath } = await uploadEvidencePDF(userId, id, req.file.buffer, req.file.originalname);
    const updated = await database_default.gapFixItem.update({
      where: { id },
      data: { pdfUrl: signedUrl, pdfStoragePath: storagePath, status: "pending_verification", aiVerified: false }
    });
    res.json({
      success: true,
      pdfUrl: signedUrl,
      status: updated.status,
      message: "PDF uploaded. Click 'Verify with AI' to verify your evidence."
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    const errorMessage = err instanceof Error ? err.message : "PDF upload failed";
    res.status(500).json({ error: errorMessage });
  }
});
router19.post("/:id/verify", async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const { evidenceText, evidenceUrl } = req.body;
  const item = await database_default.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) {
    res.status(404).json({ error: "Gap item not found" });
    return;
  }
  const hasText = Boolean(evidenceText?.trim());
  const hasUrl = Boolean(evidenceUrl?.trim());
  const hasPdf = Boolean(item.pdfUrl);
  if (!hasText && !hasUrl && !hasPdf) {
    res.status(400).json({
      error: "No evidence provided",
      message: "Please provide at least one: written description, URL, or uploaded PDF."
    });
    return;
  }
  try {
    const verification = await callAI("/api/v1/gap-fix/verify-evidence", {
      gap_id: id,
      gap_type: item.gapType,
      gap_title: item.title,
      gap_description: item.description,
      evidence_text: evidenceText?.trim() || item.evidenceText || null,
      evidence_url: evidenceUrl?.trim() || item.evidenceUrl || null,
      pdf_url: item.pdfUrl || null,
      current_status: item.status
    });
    const updated = await database_default.gapFixItem.update({
      where: { id },
      data: {
        evidenceText: evidenceText?.trim() || item.evidenceText,
        evidenceUrl: evidenceUrl?.trim() || item.evidenceUrl,
        aiVerified: Boolean(verification.verified),
        aiConfidence: typeof verification.confidence === "number" ? verification.confidence : null,
        aiFeedback: String(verification.feedback ?? ""),
        status: String(verification.new_status ?? "not_started"),
        aiVerifiedAt: verification.verified ? /* @__PURE__ */ new Date() : null
      }
    });
    const allItems = await database_default.gapFixItem.findMany({ where: { userId } });
    const newScore = calculateScore(allItems);
    res.json({
      success: true,
      verified: verification.verified,
      confidence: verification.confidence,
      feedback: verification.feedback,
      new_status: verification.new_status,
      score_impact: verification.score_impact,
      new_score: newScore,
      item: { ...updated, resourceLinks: parseResourceLinks(updated.resourceLinks) }
    });
  } catch (err) {
    console.error("Gap Fix verify error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});
router19.patch("/:id/skip", async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const item = await database_default.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await database_default.gapFixItem.update({ where: { id }, data: { status: "skipped", aiVerified: false } });
  const allItems = await database_default.gapFixItem.findMany({ where: { userId } });
  res.json({ success: true, new_score: calculateScore(allItems) });
});
router19.delete("/:id", async (req, res) => {
  const userId = req.userId;
  const id = req.params.id;
  const item = await database_default.gapFixItem.findFirst({ where: { id, userId } });
  if (!item) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (item.pdfStoragePath) {
    deleteEvidencePDF(item.pdfStoragePath).catch(
      (err) => console.warn("[gap-fix] Failed to delete Supabase file:", err)
    );
  }
  await database_default.gapFixItem.delete({ where: { id } });
  const allItems = await database_default.gapFixItem.findMany({ where: { userId } });
  res.json({ success: true, new_score: calculateScore(allItems) });
});
var gapFixRoutes_default = router19;

// src/routes/career.router.ts
import { Router as Router20 } from "express";

// src/services/career.service.ts
var OPENAI_URL7 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL7 = "https://openrouter.ai/api/v1/chat/completions";
var COUNTRY_JOB_MARKET = {
  US: { name: "United States", strength: "Largest tech & finance job market globally. High salaries but competitive visa (H-1B lottery).", visa: "OPT (3yr STEM extension) \u2192 H-1B lottery" },
  CA: { name: "Canada", strength: "Strong demand in tech, healthcare, engineering. Express Entry provides clear PR pathway.", visa: "PGWP (up to 3yr) \u2192 Express Entry PR" },
  UK: { name: "United Kingdom", strength: "Strong finance, consulting, and tech hubs. Graduate Visa allows 2yr post-study work.", visa: "Graduate Visa (2yr) \u2192 Skilled Worker visa" },
  DE: { name: "Germany", strength: "Engineering and manufacturing hub. Strong demand for STEM graduates. EU Blue Card available.", visa: "Job Seeker Visa (6mo) \u2192 EU Blue Card" },
  AU: { name: "Australia", strength: "Growing tech and healthcare sector. TSS/Skilled Migration visa pathways are accessible.", visa: "Post-Study Work Visa (2-4yr) \u2192 Skilled Migration" },
  NL: { name: "Netherlands", strength: "Major EU tech hub (ASML, Philips, Booking.com). Orientation Year permit for graduates.", visa: "Orientation Year (1yr) \u2192 Highly Skilled Migrant permit" },
  SE: { name: "Sweden", strength: "Thriving startup ecosystem (Spotify, Klarna). Attractive for tech and engineering roles.", visa: "Work permit (employer-sponsored)" },
  SG: { name: "Singapore", strength: "Asia-Pacific fintech and tech hub. Strong demand for data, AI, and finance professionals.", visa: "Employment Pass (EP) or S Pass" }
};
async function predictCareerOutcome(req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL7 : OPENROUTER_URL7;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const primaryCountry = req.targetCountries?.[0] ?? "US";
  const countryInfo = COUNTRY_JOB_MARKET[primaryCountry] ?? { name: primaryCountry, strength: "Active graduate job market", visa: "Work permit required" };
  const profileSummary = [
    req.intendedMajor && `Field: ${req.intendedMajor}`,
    req.intendedLevel && `Degree level: ${req.intendedLevel}`,
    req.targetCountries?.length && `Target countries: ${req.targetCountries.join(", ")}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.gpa && `GPA: ${req.gpa}/${req.gpaScale ?? "4.0"}`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.currentStage && `Current stage: ${req.currentStage}`
  ].filter(Boolean).join("\n");
  const prompt = `You are a career counselor specializing in international graduate employment outcomes.

Student Profile:
${profileSummary || "Profile not provided."}

Primary target country: ${countryInfo.name}
Job market context: ${countryInfo.strength}
Typical visa pathway: ${countryInfo.visa}

Provide a realistic, data-grounded career outcome prediction for this student. Be honest about competitive realities.

Return a JSON object with this exact structure:
{
  "overallOutlook": "Excellent | Good | Moderate | Challenging",
  "outlookSummary": "3-4 sentence realistic summary of career prospects in their field/country combination",
  "employabilityScore": 72,
  "topCountry": "${countryInfo.name}",
  "factors": [
    {
      "factor": "Field Demand",
      "rating": "Strong | Good | Moderate | Weak",
      "explanation": "Brief explanation of this factor"
    }
  ],
  "pathways": [
    {
      "role": "Software Engineer",
      "sector": "Technology",
      "salaryRangeUsd": "$90,000\u2013$130,000",
      "demandLevel": "High | Medium | Low",
      "timeToEntry": "0\u20136 months post-graduation"
    }
  ],
  "keySkillsToAdd": ["Python", "AWS", "SQL"],
  "industryTrends": ["AI/ML roles growing 30% YoY", "Remote-first hiring expanding market access"],
  "disclaimer": "Career outcomes are estimates based on current market conditions and may change. Individual results depend on networking, skill development, and economic factors."
}

Include 4-5 factors, 3-4 career pathways, 4-5 key skills, and 2-3 industry trends.
Return ONLY valid JSON. No markdown, no explanation.`;
  if (!apiKey) {
    return buildFallbackCareer(req, countryInfo, primaryCountry);
  }
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(3e4)
    });
    if (!response.ok) throw new Error(`LLM error: ${response.status}`);
    const data = await response.json();
    const raw2 = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw2) throw new Error("Empty LLM response");
    const parsed = JSON.parse(raw2);
    return {
      overallOutlook: parsed.overallOutlook ?? "Moderate",
      outlookSummary: parsed.outlookSummary ?? "Career outlook depends on your specific field and skill set.",
      employabilityScore: Math.min(100, Math.max(10, parsed.employabilityScore ?? 60)),
      topCountry: parsed.topCountry ?? countryInfo.name,
      factors: parsed.factors ?? [],
      pathways: parsed.pathways ?? [],
      keySkillsToAdd: parsed.keySkillsToAdd ?? [],
      industryTrends: parsed.industryTrends ?? [],
      disclaimer: parsed.disclaimer ?? "Career outcomes are estimates based on current market conditions.",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return buildFallbackCareer(req, countryInfo, primaryCountry);
  }
}
function buildFallbackCareer(req, countryInfo, primaryCountry) {
  const isStem = ["computer", "data", "engineering", "math", "physics", "ai", "machine learning"].some((kw) => (req.intendedMajor ?? "").toLowerCase().includes(kw));
  const isPhd = req.intendedLevel === "PHD";
  const score = isStem ? 72 : 58;
  return {
    overallOutlook: isStem ? "Good" : "Moderate",
    outlookSummary: `${countryInfo.name} offers ${isStem ? "strong" : "moderate"} demand for ${req.intendedMajor ?? "graduates"} at the ${req.intendedLevel ?? "graduate"} level. ${countryInfo.strength} ${isPhd ? "PhD holders typically enter research, academia, or senior technical roles." : "Most international graduates find employment within 6-12 months of graduation."}`,
    employabilityScore: score,
    topCountry: countryInfo.name,
    factors: [
      { factor: "Field Demand", rating: isStem ? "Strong" : "Moderate", explanation: `${req.intendedMajor ?? "Your field"} has ${isStem ? "high and growing" : "steady"} demand in ${countryInfo.name}.` },
      { factor: "Degree Level", rating: isPhd ? "Strong" : "Good", explanation: `${req.intendedLevel ?? "Graduate"} degree is ${isPhd ? "highly valued for research and senior technical roles" : "the standard requirement for most professional roles"}.` },
      { factor: "Work Experience", rating: (req.workExperienceMonths ?? 0) >= 12 ? "Good" : "Moderate", explanation: `${(req.workExperienceMonths ?? 0) >= 12 ? "Relevant experience strengthens" : "Limited experience may weigh on"} employer competitiveness.` },
      { factor: "English Proficiency", rating: req.englishTestType ? "Good" : "Moderate", explanation: req.englishTestType ? `Verified English ability (${req.englishTestType}: ${req.englishScore}) meets employer expectations.` : "Demonstrating English fluency is important for most professional roles." },
      { factor: "Visa Pathway", rating: ["CA", "AU", "DE"].includes(primaryCountry) ? "Good" : "Moderate", explanation: countryInfo.visa }
    ],
    pathways: isStem ? [
      { role: "Software Engineer", sector: "Technology", salaryRangeUsd: "$85,000\u2013$130,000", demandLevel: "High", timeToEntry: "0\u20136 months post-graduation" },
      { role: "Data Analyst / Scientist", sector: "Technology / Finance", salaryRangeUsd: "$75,000\u2013$120,000", demandLevel: "High", timeToEntry: "0\u20136 months post-graduation" },
      { role: "ML/AI Engineer", sector: "Technology", salaryRangeUsd: "$100,000\u2013$160,000", demandLevel: "High", timeToEntry: "6\u201312 months post-graduation" },
      { role: "Research Scientist", sector: "Academia / R&D", salaryRangeUsd: "$80,000\u2013$110,000", demandLevel: "Medium", timeToEntry: "3\u201312 months post-graduation" }
    ] : [
      { role: "Management Trainee", sector: "Business / Consulting", salaryRangeUsd: "$50,000\u2013$80,000", demandLevel: "Medium", timeToEntry: "0\u20136 months post-graduation" },
      { role: "Research Associate", sector: "Academia / NGO", salaryRangeUsd: "$45,000\u2013$70,000", demandLevel: "Medium", timeToEntry: "3\u20139 months post-graduation" },
      { role: "Project Coordinator", sector: "Cross-sector", salaryRangeUsd: "$45,000\u2013$65,000", demandLevel: "Medium", timeToEntry: "0\u20139 months post-graduation" }
    ],
    keySkillsToAdd: isStem ? ["Python or R", "Cloud platforms (AWS/GCP/Azure)", "SQL and data pipelines", "System design", "Communication and stakeholder management"] : ["Data analysis and visualization", "Project management (PMP/Agile)", "Strategic communication", "Industry-specific certifications", "Networking and LinkedIn presence"],
    industryTrends: [
      `AI and automation are reshaping ${isStem ? "engineering and data roles" : "most professional sectors"} globally`,
      `${countryInfo.name} continues to attract international talent for shortage-occupation roles`,
      "Remote and hybrid work has expanded the effective job market for international graduates"
    ],
    disclaimer: "Career outcomes are estimates based on publicly available market data and general trends. Individual results vary significantly based on networking, specific skills, economic conditions, and employer preferences. This is not professional career advice.",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/controllers/career.controller.ts
init_database();
async function careerPredictHandler(req, res) {
  const userId = req.userId;
  try {
    const profileRecord = await database_default.userProfile.findUnique({ where: { userId } });
    if (!profileRecord) {
      res.status(404).json({ error: "Profile not found. Please complete your profile first." });
      return;
    }
    logger_default.info(`[career] predicting outcome for userId=${userId}`);
    const result = await predictCareerOutcome({
      intendedMajor: profileRecord.intendedMajor ?? void 0,
      intendedLevel: profileRecord.intendedLevel ?? void 0,
      targetCountries: profileRecord.targetCountries ?? void 0,
      workExperienceMonths: profileRecord.workExperienceMonths ?? void 0,
      gpa: profileRecord.gpa ?? void 0,
      gpaScale: profileRecord.gpaScale ?? void 0,
      englishTestType: profileRecord.englishTestType ?? void 0,
      englishScore: profileRecord.englishScore ?? void 0,
      currentStage: profileRecord.currentStage ?? void 0
    });
    logger_default.info(`[career] outlook=${result.overallOutlook} score=${result.employabilityScore} for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger_default.error(`[career] prediction failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: "Career prediction failed. Please try again." });
  }
}

// src/routes/career.router.ts
var router20 = Router20();
router20.use(authMiddleware);
router20.post("/predict", careerPredictHandler);
var career_router_default = router20;

// src/routes/immigration.router.ts
import { Router as Router21 } from "express";

// src/services/immigration.service.ts
var OPENAI_URL8 = "https://api.openai.com/v1/chat/completions";
var OPENROUTER_URL8 = "https://openrouter.ai/api/v1/chat/completions";
var PATHWAY_TEMPLATES = {
  CA: {
    countryCode: "CA",
    countryName: "Canada",
    studyVisaType: "Study Permit",
    postStudyWorkVisa: "Post-Graduation Work Permit (PGWP)",
    postStudyWorkDuration: "Up to 3 years (STEM: up to 5 years)",
    prPathway: "Express Entry (CEC / FSW) or Provincial Nominee Program (PNP)",
    prTimeline: "2\u20134 years after graduation",
    pointsRequired: 67,
    advantages: [
      "PGWP allows up to 3\u20135 years of Canadian work experience",
      "Express Entry CRS is accessible with Canadian work experience",
      "Pathway to citizenship after 3 of 5 years as PR",
      "Provincial nominee programs offer additional routes",
      "Healthcare and family-friendly policies"
    ],
    challenges: [
      "CRS score cutoffs fluctuate (often 480\u2013530); check current draws",
      "Some provinces have specific occupation and language requirements",
      "Cost of living is high in major cities (Toronto, Vancouver)"
    ],
    officialSource: "https://www.canada.ca/en/immigration-refugees-citizenship.html"
  },
  US: {
    countryCode: "US",
    countryName: "United States",
    studyVisaType: "F-1 Student Visa",
    postStudyWorkVisa: "OPT (Optional Practical Training) + STEM OPT Extension",
    postStudyWorkDuration: "12 months OPT + 24 months STEM extension = up to 36 months",
    prPathway: "H-1B visa (employer-sponsored) \u2192 EB-2/EB-3 Green Card",
    prTimeline: "5\u201315+ years (heavily backlogged for most nationalities)",
    advantages: [
      "World-class research universities and industry networks",
      "STEM OPT provides 3 years of work authorization",
      "Top salaries globally, especially in tech and finance",
      "Entrepreneurial ecosystem (startup visas, O-1 options)"
    ],
    challenges: [
      "H-1B visa is lottery-based (capped at 85,000/year) \u2014 no guaranteed path",
      "Green Card backlogs are severe for Indian and Chinese nationals (10\u201350+ years)",
      "No stable post-study PR route; immigration path is employer-dependent",
      "Political volatility around immigration policy"
    ],
    officialSource: "https://travel.state.gov/content/travel/en/us-visas/study.html"
  },
  UK: {
    countryCode: "UK",
    countryName: "United Kingdom",
    studyVisaType: "Student Visa (Tier 4)",
    postStudyWorkVisa: "Graduate Visa",
    postStudyWorkDuration: "2 years (PhD: 3 years)",
    prPathway: "Skilled Worker Visa \u2192 Indefinite Leave to Remain (ILR)",
    prTimeline: "5 years of continuous lawful residence",
    advantages: [
      "Graduate Visa allows 2\u20133 years of open work authorization (no employer sponsorship)",
      "No language test needed for Graduate Visa if studied in English",
      "Strong finance, consulting, and tech job markets",
      "ILR after 5 years with Skilled Worker visa"
    ],
    challenges: [
      "Skilled Worker Visa requires employer sponsorship and salary thresholds (\xA338,700+)",
      "Salary requirements exclude many entry-level roles",
      "Post-Brexit EU talent competition has increased",
      "NHS surcharge adds significant upfront cost"
    ],
    officialSource: "https://www.gov.uk/student-visa"
  },
  AU: {
    countryCode: "AU",
    countryName: "Australia",
    studyVisaType: "Student Visa (Subclass 500)",
    postStudyWorkVisa: "Temporary Graduate Visa (Subclass 485)",
    postStudyWorkDuration: "2\u20134 years depending on qualification and location",
    prPathway: "Skilled Independent (189) / Skilled Nominated (190) / Regional (491)",
    prTimeline: "2\u20135 years after graduation",
    advantages: [
      "485 visa provides 2\u20134 years of work rights without employer sponsorship",
      "Points-based skilled migration is transparent and achievable",
      "STEM, healthcare, engineering, and trades are in high demand",
      "Regional study can increase points allocation"
    ],
    challenges: [
      "State nomination invitation cutoffs can be competitive",
      "Points requirement (65+) means profile must be carefully optimized",
      "Invitation rounds for skilled migration can be irregular"
    ],
    officialSource: "https://immi.homeaffairs.gov.au/"
  },
  DE: {
    countryCode: "DE",
    countryName: "Germany",
    studyVisaType: "Student Visa (Nationales Visum)",
    postStudyWorkVisa: "Job Seeker Visa (18-month job search period)",
    postStudyWorkDuration: "18 months job search + open-ended work permit upon employment",
    prPathway: "Settlement Permit (Niederlassungserlaubnis) after 2\u20135 years of work",
    prTimeline: "4\u20138 years (2 years with EU Blue Card in shortage occupations)",
    advantages: [
      "Tuition is free or very low even for international students",
      "EU Blue Card is accessible with a relevant job offer and degree",
      "Accelerated settlement permit after just 2 years with EU Blue Card in shortage occupations",
      "Strong engineering, automotive, and manufacturing industries"
    ],
    challenges: [
      "German language skills (B1/B2) are often required for full integration and settlement",
      "Finding English-language jobs outside major cities can be difficult",
      "Bureaucracy around visa extensions can be complex"
    ],
    officialSource: "https://www.make-it-in-germany.com/en/"
  }
};
async function getImmigrationGuidance(req) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const apiKey = openaiKey || openrouterKey;
  const apiUrl = openaiKey ? OPENAI_URL8 : OPENROUTER_URL8;
  const model = openaiKey ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const targetCodes = (req.targetCountries ?? ["CA", "UK"]).filter((c) => PATHWAY_TEMPLATES[c]);
  if (targetCodes.length === 0) targetCodes.push("CA", "UK");
  const profileSummary = [
    req.intendedLevel && `Degree level: ${req.intendedLevel}`,
    req.intendedMajor && `Major: ${req.intendedMajor}`,
    req.workExperienceMonths && `Work experience: ${req.workExperienceMonths} months`,
    req.englishTestType && req.englishScore && `${req.englishTestType}: ${req.englishScore}`,
    req.currentStage && `Current stage: ${req.currentStage}`
  ].filter(Boolean).join("\n");
  const prompt = `You are an immigration guidance specialist helping international students understand PR and visa pathways.

Student Profile:
${profileSummary || "Profile not fully provided."}

Target countries: ${targetCodes.join(", ")}

For each country, assess feasibility and provide a step-by-step pathway. Consider:
- English proficiency requirement match
- Work experience and degree level relevance
- Points/criteria likely achievable by this profile
- Realistic timeline

Return a JSON object with this structure:
{
  "pathways": [
    {
      "countryCode": "CA",
      "feasibilityAssessment": {
        "rating": "High | Medium | Low",
        "reason": "2-3 sentence explanation specific to this student's profile"
      },
      "estimatedPoints": 75,
      "steps": [
        {
          "phase": "Study Phase",
          "title": "Obtain Study Permit",
          "description": "Apply for study permit 3-6 months before program start",
          "typicalDuration": "3-6 months processing",
          "keyCriteria": ["Acceptance letter", "Proof of funds", "Valid passport"],
          "pitfalls": ["Late application", "Insufficient financial evidence"]
        }
      ]
    }
  ],
  "bestFitCountry": "CA",
  "bestFitReason": "2-3 sentences why this is the best option for this student",
  "generalTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Provide 3-5 steps per country. Be specific to the student's profile.
Return ONLY valid JSON. No markdown.`;
  const basePathways = targetCodes.slice(0, 3).map((code) => {
    const template = PATHWAY_TEMPLATES[code];
    return {
      ...template,
      overallFeasibility: "Medium",
      feasibilityReason: "Feasibility depends on your specific profile details.",
      estimatedPoints: void 0,
      steps: buildDefaultSteps(code)
    };
  });
  if (!apiKey) {
    return buildFallbackImmigration(targetCodes, basePathways);
  }
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2e3,
        response_format: { type: "json_object" }
      }),
      signal: AbortSignal.timeout(3e4)
    });
    if (!response.ok) throw new Error(`LLM error: ${response.status}`);
    const data = await response.json();
    const raw2 = data?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw2) throw new Error("Empty LLM response");
    const parsed = JSON.parse(raw2);
    const enrichedPathways = basePathways.map((base) => {
      const llmData = parsed.pathways?.find((p) => p.countryCode === base.countryCode);
      return {
        ...base,
        overallFeasibility: llmData?.feasibilityAssessment?.rating ?? "Medium",
        feasibilityReason: llmData?.feasibilityAssessment?.reason ?? base.feasibilityReason,
        estimatedPoints: llmData?.estimatedPoints ?? base.estimatedPoints,
        steps: llmData?.steps ?? base.steps
      };
    });
    const bestFit = parsed.bestFitCountry ?? targetCodes[0];
    const bestFitTemplate = PATHWAY_TEMPLATES[bestFit];
    return {
      pathways: enrichedPathways,
      bestFitCountry: bestFitTemplate?.countryName ?? bestFit,
      bestFitReason: parsed.bestFitReason ?? `${bestFitTemplate?.countryName ?? bestFit} offers the clearest pathway for your profile.`,
      generalTips: parsed.generalTips ?? defaultTips(),
      disclaimer: "Immigration policies change frequently. This guidance is for informational purposes only and does not constitute legal or immigration advice. Always verify current requirements with official government sources or a registered immigration consultant before making decisions.",
      lastUpdated: "2025-01",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch {
    return buildFallbackImmigration(targetCodes, basePathways);
  }
}
function buildDefaultSteps(countryCode) {
  const steps = {
    CA: [
      { phase: "Pre-Arrival", title: "Obtain Study Permit", description: "Apply for a Canadian study permit from your home country at least 3 months before your program starts.", typicalDuration: "4\u201312 weeks processing", keyCriteria: ["Offer letter from DLI", "Proof of financial support", "Biometrics"], pitfalls: ["Incomplete financial documentation", "Applying too close to start date"] },
      { phase: "During Study", title: "Maintain Full-Time Enrollment", description: "Remain enrolled full-time and maintain legal status throughout your studies to preserve PGWP eligibility.", typicalDuration: "Full program duration", keyCriteria: ["Full-time enrollment", "Good academic standing", "Valid study permit"], pitfalls: ["Dropping to part-time without authorization", "Letting permit expire"] },
      { phase: "Post-Graduation", title: "Apply for PGWP", description: "Apply for a Post-Graduation Work Permit within 180 days of receiving your final marks. PGWP length matches program length (max 3 years).", typicalDuration: "4\u20138 weeks processing", keyCriteria: ["Graduation confirmation", "Valid passport", "Biometrics"], pitfalls: ["Missing 180-day window", "Incorrect application type"] },
      { phase: "Work Phase", title: "Build Canadian Work Experience", description: "Work in your field for 1 year to qualify for Canadian Experience Class (CEC) under Express Entry.", typicalDuration: "12+ months", keyCriteria: ["NOC 0/A/B skill level job", "Full-time work", "Minimum wages"], pitfalls: ["Working in a low-skill NOC category", "Not documenting work properly for IRCC"] },
      { phase: "PR Application", title: "Apply for Permanent Residence via Express Entry", description: "Create an Express Entry profile, receive an ITA, and submit a complete PR application.", typicalDuration: "6\u201312 months from ITA to PR", keyCriteria: ["Comprehensive Ranking System (CRS) score above draw cutoff", "Language test", "Educational credential assessment"], pitfalls: ["Low CRS score due to unverified credentials", "Missing documents in application"] }
    ],
    UK: [
      { phase: "Pre-Arrival", title: "Obtain Student Visa", description: "Apply for a UK Student Visa (formerly Tier 4) at least 3 months before your course starts. You need a CAS from your university.", typicalDuration: "3\u20134 weeks processing", keyCriteria: ["CAS from university", "Proof of English (IELTS UKVI 5.5+)", "Proof of maintenance funds"], pitfalls: ["Using standard IELTS instead of IELTS UKVI", "Insufficient maintenance funds"] },
      { phase: "Post-Graduation", title: "Switch to Graduate Visa", description: "Apply to switch to the Graduate Visa within your Student Visa validity period. No employer sponsorship required.", typicalDuration: "8 weeks processing", keyCriteria: ["UK degree completion", "Valid Student Visa at time of application"], pitfalls: ["Applying after Student Visa expiry", "Not completing the full UK course"] },
      { phase: "Work Phase", title: "Find Skilled Work and Switch to Skilled Worker Visa", description: "Find a sponsored role paying above the salary threshold and apply to switch from Graduate Visa to Skilled Worker Visa.", typicalDuration: "8\u201312 weeks per application", keyCriteria: ["Licensed sponsor employer", "Salary \u2265 \xA338,700 (general threshold)", "Certificate of Sponsorship (CoS)"], pitfalls: ["Employer not on UKVI sponsor register", "Salary below threshold after allowances"] },
      { phase: "PR Application", title: "Apply for Indefinite Leave to Remain (ILR)", description: "After 5 years of continuous lawful residence (Skilled Worker or other eligible visa), apply for ILR.", typicalDuration: "2\u20136 months processing", keyCriteria: ["5 years continuous residence", "Life in the UK test (75% pass rate)", "English language", "No serious criminal record"], pitfalls: ["Gaps in continuous residence", "Absences exceeding 180 days/year"] }
    ],
    AU: [
      { phase: "Pre-Arrival", title: "Obtain Student Visa (Subclass 500)", description: "Apply for an Australian Student Visa with a CoE from your institution. Health insurance (OSHC) is mandatory.", typicalDuration: "4\u20138 weeks processing", keyCriteria: ["Confirmation of Enrolment (CoE)", "OSHC insurance", "Genuine Temporary Entrant requirement"], pitfalls: ["Insufficient financial evidence", "Not meeting genuine temporary entrant criteria"] },
      { phase: "Post-Graduation", title: "Apply for Temporary Graduate Visa (Subclass 485)", description: "Apply for the 485 visa within 6 months of graduation. Duration depends on your qualification (2\u20134 years).", typicalDuration: "4\u20138 weeks processing", keyCriteria: ["Eligible qualification", "English: IELTS 6.0+", "Skills assessment (for some streams)"], pitfalls: ["Applying outside the 6-month window", "Not meeting English requirement"] },
      { phase: "Skill Assessment", title: "Get Skills Assessed by Relevant Body", description: "For skilled migration, have your qualifications assessed by the relevant assessing authority for your occupation.", typicalDuration: "4\u201312 weeks depending on body", keyCriteria: ["Relevant degree/occupation match", "Work experience documentation"], pitfalls: ["Choosing wrong assessing authority", "Incomplete documentation for assessment"] },
      { phase: "EOI Phase", title: "Submit Expression of Interest (SkillSelect)", description: "Submit an EOI in SkillSelect. You need 65+ points to be eligible. Invitation rounds occur regularly.", typicalDuration: "Variable \u2014 depends on points score and occupation in demand", keyCriteria: ["65+ points minimum", "Skills assessment completed", "Occupation on relevant list"], pitfalls: ["Points miscalculation", "Not maximising available points (regional study, NAATI, etc.)"] }
    ],
    DE: [
      { phase: "Pre-Arrival", title: "Obtain Student Visa", description: "Apply for a German student visa at your local German embassy. A blocked account (\u20AC11,208/year) is required.", typicalDuration: "4\u201312 weeks processing", keyCriteria: ["University admission letter", "Blocked account (Sperrkonto)", "German or English language proficiency for program"], pitfalls: ["Late visa application", "Incorrect blocked account amount"] },
      { phase: "Post-Graduation", title: "Obtain Job Seeker Visa (Aufenthaltserlaubnis zur Jobsuche)", description: "Apply for an 18-month job seeker visa to find employment in Germany after graduation.", typicalDuration: "4\u20138 weeks at local Foreigners Registration Office", keyCriteria: ["German degree or equivalent recognition", "Financial means for 18 months", "Registered address"], pitfalls: ["Degree not recognised without anabin/ENIC check", "Insufficient funds documentation"] },
      { phase: "Employment", title: "Obtain Work Permit or EU Blue Card", description: "With a job offer meeting salary threshold (EU Blue Card: \u20AC45,300+; shortage occupations: \u20AC35,100+), switch to work permit.", typicalDuration: "4\u201312 weeks", keyCriteria: ["Job offer from German employer", "Recognised degree", "Salary above threshold"], pitfalls: ["Degree recognition delays", "Salary below EU Blue Card threshold"] },
      { phase: "PR Application", title: "Apply for Settlement Permit (Niederlassungserlaubnis)", description: "After 4 years of employment (or 2 years with EU Blue Card in shortage occupations), apply for permanent settlement.", typicalDuration: "1\u20133 months", keyCriteria: ["Language: German B1 (general) or B2 (some routes)", "Pension contributions", "Secure livelihood"], pitfalls: ["Insufficient German language level", "Gaps in employment/pension contributions"] }
    ]
  };
  return steps[countryCode] ?? [];
}
function buildFallbackImmigration(codes, pathways) {
  const best = codes.includes("CA") ? "Canada" : pathways[0]?.countryName ?? codes[0];
  return {
    pathways,
    bestFitCountry: best,
    bestFitReason: `${best} offers a structured and transparent pathway for international graduates, with clear post-study work and permanent residency routes accessible within 3\u20135 years of graduation.`,
    generalTips: defaultTips(),
    disclaimer: "Immigration policies change frequently. This guidance is for informational purposes only and does not constitute legal or immigration advice. Always verify current requirements with official government sources or a registered immigration consultant before making decisions.",
    lastUpdated: "2025-01",
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function defaultTips() {
  return [
    "Start your visa application at least 3\u20136 months before your intended arrival date",
    "Keep all immigration documents organized and track every visa expiry date",
    "Ensure your qualifications are recognized/assessed in your target country early",
    "Build language proficiency above minimums \u2014 higher scores expand your options significantly",
    "Consider regional or smaller cities where PR points and job competition may be more favorable",
    "Consult a registered immigration consultant or lawyer for complex cases or appeals"
  ];
}

// src/controllers/immigration.controller.ts
init_database();
async function immigrationGuideHandler(req, res) {
  const userId = req.userId;
  try {
    const profileRecord = await database_default.userProfile.findUnique({ where: { userId } });
    if (!profileRecord) {
      res.status(404).json({ error: "Profile not found. Please complete your profile first." });
      return;
    }
    logger_default.info(`[immigration] generating guidance for userId=${userId}`);
    const result = await getImmigrationGuidance({
      targetCountries: profileRecord.targetCountries ?? void 0,
      intendedLevel: profileRecord.intendedLevel ?? void 0,
      intendedMajor: profileRecord.intendedMajor ?? void 0,
      workExperienceMonths: profileRecord.workExperienceMonths ?? void 0,
      englishTestType: profileRecord.englishTestType ?? void 0,
      englishScore: profileRecord.englishScore ?? void 0,
      currentStage: profileRecord.currentStage ?? void 0,
      fundingNeed: profileRecord.fundingNeed ?? void 0
    });
    logger_default.info(`[immigration] bestFit=${result.bestFitCountry} pathways=${result.pathways.length} for userId=${userId}`);
    res.status(200).json(result);
  } catch (err) {
    logger_default.error(`[immigration] failed for userId=${userId}: ${err}`);
    res.status(502).json({ error: "Immigration guidance generation failed. Please try again." });
  }
}

// src/routes/immigration.router.ts
var router21 = Router21();
router21.use(authMiddleware);
router21.post("/guide", immigrationGuideHandler);
var immigration_router_default = router21;

// src/routes/dataSync.router.ts
import { Router as Router22 } from "express";

// src/services/dataSync.service.ts
init_database();
var SOURCES = [
  {
    key: "scholarships",
    label: "Scholarships",
    description: "Expires scholarships with past deadlines, updates lastVerified on active records",
    staleHours: 24,
    category: "Funding"
  },
  {
    key: "programs",
    label: "University Programs",
    description: "Triggers ai-server Firecrawl pipeline to discover and ingest new programs",
    staleHours: 24,
    category: "Academic"
  }
];
function makeLogger(lines) {
  return {
    info: (msg) => {
      const line = `[${(/* @__PURE__ */ new Date()).toISOString()}] [INFO]  ${msg}`;
      lines.push(line);
      logger_default.info(msg);
    },
    warn: (msg) => {
      const line = `[${(/* @__PURE__ */ new Date()).toISOString()}] [WARN]  ${msg}`;
      lines.push(line);
      logger_default.warn(msg);
    },
    error: (msg) => {
      const line = `[${(/* @__PURE__ */ new Date()).toISOString()}] [ERROR] ${msg}`;
      lines.push(line);
      logger_default.error(msg);
    }
  };
}
async function runScholarshipsSync(log) {
  const start = Date.now();
  const rawLogs = [];
  const srcLog = makeLogger(rawLogs);
  const result = {
    sourceKey: "scholarships",
    label: "Scholarships",
    status: "success",
    recordsProcessed: 0,
    recordsAdded: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    notes: [],
    errors: [],
    durationMs: 0,
    rawLogs
  };
  try {
    srcLog.info("Starting scholarship freshness check and expiry sweep");
    log.info("[scholarships] starting freshness check");
    const now = /* @__PURE__ */ new Date();
    const totalBefore = await database_default.scholarship.count();
    const activeBefore = await database_default.scholarship.count({ where: { isActive: true } });
    srcLog.info(`Before sweep \u2014 total=${totalBefore} active=${activeBefore}`);
    log.info(`[scholarships] before sweep: total=${totalBefore} active=${activeBefore}`);
    if (totalBefore === 0) {
      srcLog.error("No scholarships found in database");
      srcLog.warn("Populate via: npm run seed:scholarships");
      result.errors.push("No scholarships in database \u2014 run `npm run seed:scholarships` to populate");
      result.status = "failed";
      result.durationMs = Date.now() - start;
      return result;
    }
    const toExpire = await database_default.scholarship.findMany({
      where: {
        isActive: true,
        deadlines: { some: {} },
        NOT: { deadlines: { some: { deadline: { gte: now } } } }
      },
      select: { id: true, title: true }
    });
    let expiredCount = 0;
    if (toExpire.length > 0) {
      await database_default.scholarship.updateMany({
        where: { id: { in: toExpire.map((s) => s.id) } },
        data: { isActive: false }
      });
      expiredCount = toExpire.length;
      srcLog.warn(`Expired ${expiredCount} scholarships (all deadlines past): ${toExpire.slice(0, 3).map((s) => s.title).join(", ")}${toExpire.length > 3 ? "..." : ""}`);
      log.info(`[scholarships] expired ${expiredCount} scholarships`);
      result.notes.push(`${expiredCount} scholarships marked inactive \u2014 all application deadlines have passed`);
    } else {
      srcLog.info("No scholarships to expire \u2014 all active scholarships have at least one future deadline");
    }
    const verifyResult = await database_default.scholarship.updateMany({
      where: { isActive: true },
      data: { lastVerified: now }
    });
    srcLog.info(`Updated lastVerified on ${verifyResult.count} active scholarships`);
    log.info(`[scholarships] verified ${verifyResult.count} active scholarships`);
    const [activeAfter, withFutureDeadlines, noDeadlines] = await Promise.all([
      database_default.scholarship.count({ where: { isActive: true } }),
      database_default.scholarship.count({
        where: { isActive: true, deadlines: { some: { deadline: { gte: now } } } }
      }),
      database_default.scholarship.count({
        where: { isActive: true, deadlines: { none: {} } }
      })
    ]);
    srcLog.info(`After sweep \u2014 active=${activeAfter} withFutureDeadlines=${withFutureDeadlines} noDeadlines=${noDeadlines}`);
    result.recordsProcessed = totalBefore;
    result.recordsUpdated = verifyResult.count + expiredCount;
    result.recordsSkipped = noDeadlines;
    result.notes.push(`${activeAfter} active scholarships (${withFutureDeadlines} with upcoming deadlines)`);
    if (noDeadlines > 0) {
      result.notes.push(`${noDeadlines} active scholarships have no deadline listed \u2014 deadline unknown`);
    }
    if (expiredCount > 0) {
      result.notes.push(`${expiredCount} scholarships removed from active listings (all deadlines past)`);
    }
    result.status = "success";
    srcLog.info(`Scholarship sweep complete \u2014 expired=${expiredCount} verified=${verifyResult.count} status=success`);
    if (isLiveRefreshAvailable()) {
      srcLog.info("Live refresh available \u2014 running Serper search + LLM extraction");
      log.info("[scholarships] starting live scholarship refresh");
      try {
        const liveResult = await runLiveScholarshipRefresh({ force: false });
        if (liveResult.errors.length === 1 && liveResult.errors[0]?.includes("Recently refreshed")) {
          srcLog.info("Live refresh skipped \u2014 data was refreshed recently");
          result.notes.push("Live refresh skipped \u2014 scholarship data was already refreshed within the last 6 hours");
        } else {
          srcLog.info(`Live refresh done \u2014 discovered=${liveResult.discovered} upserted=${liveResult.upserted} skipped=${liveResult.skipped} duration=${liveResult.durationMs}ms`);
          result.notes.push(
            `Live search: ${liveResult.discovered} results discovered via ${liveResult.sourcesUsed.join(" + ")}`
          );
          result.notes.push(`Live upsert: ${liveResult.upserted} scholarships added/updated from live search`);
          result.recordsAdded += liveResult.upserted;
          if (liveResult.errors.length > 0) {
            result.notes.push(`Live refresh encountered ${liveResult.errors.length} non-fatal errors`);
          }
        }
      } catch (liveErr) {
        const msg = `Live scholarship refresh error: ${String(liveErr)}`;
        srcLog.warn(msg);
        result.notes.push(msg);
      }
    } else {
      srcLog.info("Live refresh not configured (SERPER_API_KEY missing) \u2014 using cached DB data only");
      result.notes.push("Live refresh not configured (SERPER_API_KEY missing) \u2014 using cached DB data only");
    }
  } catch (err) {
    const msg = `Scholarship sync failed: ${String(err)}`;
    result.errors.push(msg);
    result.status = "failed";
    srcLog.error(msg);
    log.error(`[scholarships] ${msg}`);
  }
  result.durationMs = Date.now() - start;
  srcLog.info(`Finished in ${result.durationMs}ms`);
  return result;
}
async function runProgramsSync(log) {
  const start = Date.now();
  const rawLogs = [];
  const srcLog = makeLogger(rawLogs);
  const result = {
    sourceKey: "programs",
    label: "University Programs",
    status: "success",
    recordsProcessed: 0,
    recordsAdded: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    notes: [],
    errors: [],
    durationMs: 0,
    rawLogs,
    crawlerDetails: {}
  };
  const aiServerUrl = process.env.AI_SERVER_URL ?? "http://localhost:8000";
  const masterKey = process.env.MASTER_APIKEY;
  srcLog.info(`Starting programs pipeline sync \u2014 aiServerUrl=${aiServerUrl}`);
  log.info(`[programs] starting pipeline sync target=${aiServerUrl}`);
  if (!masterKey) {
    const msg = "MASTER_APIKEY not configured \u2014 ai-server pipeline cannot be triggered";
    result.errors.push(msg);
    result.status = "failed";
    result.durationMs = Date.now() - start;
    srcLog.error(msg);
    log.error("[programs] " + msg);
    result.crawlerDetails = { aiServerUrl, pipelineStatus: "not_configured" };
    return result;
  }
  try {
    srcLog.info("Collecting user preferences from profiles (max 50)");
    const profiles = await database_default.userProfile.findMany({
      select: { targetCountries: true, intendedMajor: true, intendedLevel: true },
      take: 50
    });
    const countries = [...new Set(
      profiles.flatMap((p) => p.targetCountries ?? []).filter(Boolean)
    )];
    const fields = [...new Set(profiles.map((p) => p.intendedMajor).filter(Boolean))];
    const levels = [...new Set(profiles.map((p) => p.intendedLevel).filter(Boolean))];
    const preferences = {
      countries: countries.length > 0 ? countries.slice(0, 5) : ["US", "UK", "CA"],
      fields: fields.length > 0 ? fields.slice(0, 3) : ["Computer Science"],
      levels: levels.length > 0 ? levels.slice(0, 3) : ["MSC"]
    };
    srcLog.info(`Aggregated preferences \u2014 countries=[${preferences.countries.join(",")}] fields=[${preferences.fields.join(",")}] levels=[${preferences.levels.join(",")}]`);
    srcLog.info(`User profiles sampled: ${profiles.length}`);
    log.info(`[programs] preferences=${JSON.stringify(preferences)}`);
    const syncPayload = { ...preferences, triggeredBy: "sync" };
    result.notes.push(
      `Triggering pipeline for ${preferences.countries.join(", ")} \xB7 ${preferences.fields.join(", ")} \xB7 ${preferences.levels.join(", ")}`
    );
    const programCountBefore = await database_default.program.count();
    srcLog.info(`Programs in database before sync: ${programCountBefore}`);
    result.crawlerDetails = {
      aiServerUrl,
      preferences,
      programCountBefore,
      pipelineStatus: "triggering"
    };
    srcLog.info(`POST ${aiServerUrl}/api/v1/module1/sync`);
    log.info(`[programs] triggering ai-server pipeline`);
    const response = await fetch(`${aiServerUrl}/api/v1/module1/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": masterKey
      },
      body: JSON.stringify(syncPayload),
      signal: AbortSignal.timeout(3e4)
    });
    srcLog.info(`ai-server response: HTTP ${response.status}`);
    log.info(`[programs] ai-server HTTP ${response.status}`);
    if (response.status === 202) {
      const body = await response.json();
      const taskId = body.task_id ?? "unknown";
      result.crawlerDetails.taskId = taskId;
      result.crawlerDetails.pipelineStatus = "queued";
      result.notes.push(`Pipeline queued (task_id: ${taskId}) \u2014 data will arrive via ingest callback`);
      result.status = "success";
      result.recordsProcessed = 1;
      srcLog.info(`Pipeline accepted \u2014 task_id=${taskId} status=queued`);
      srcLog.info("Data will arrive asynchronously via /internal/module1/ingest");
      log.info(`[programs] pipeline queued task_id=${taskId}`);
    } else if (response.ok) {
      const body = await response.json();
      result.recordsAdded = body.created ?? 0;
      result.recordsUpdated = body.updated ?? 0;
      result.recordsProcessed = result.recordsAdded + result.recordsUpdated;
      result.crawlerDetails.pipelineStatus = "completed_sync";
      result.status = "success";
      srcLog.info(`Pipeline returned sync \u2014 created=${result.recordsAdded} updated=${result.recordsUpdated}`);
    } else {
      const text = await response.text().catch(() => "");
      const msg = `ai-server returned HTTP ${response.status}: ${text.slice(0, 300)}`;
      result.errors.push(msg);
      result.status = "failed";
      result.crawlerDetails.pipelineStatus = "http_error";
      srcLog.error(msg);
      log.error(`[programs] ${msg}`);
    }
    const programCountAfter = await database_default.program.count();
    result.crawlerDetails.programCountAfter = programCountAfter;
    result.notes.push(`${programCountAfter} programs currently in database`);
    srcLog.info(`Programs in database after sync: ${programCountAfter}`);
  } catch (err) {
    const msg = String(err);
    if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed") || msg.includes("ENOTFOUND")) {
      const errMsg = "ai-server is not reachable \u2014 ensure it is running and AI_SERVER_URL is correct";
      result.errors.push(errMsg);
      srcLog.error(`Connection refused to ${aiServerUrl}`);
      srcLog.error(errMsg);
    } else if (msg.includes("TimeoutError") || msg.includes("AbortError")) {
      const errMsg = "ai-server request timed out after 30s \u2014 pipeline may still be running in background";
      result.errors.push(errMsg);
      srcLog.warn(`Request timed out after 30s`);
      srcLog.warn(errMsg);
    } else {
      const errMsg = `Program pipeline error: ${msg}`;
      result.errors.push(errMsg);
      srcLog.error(errMsg);
    }
    result.status = "failed";
    if (result.crawlerDetails) result.crawlerDetails.pipelineStatus = "error";
    log.error(`[programs] error: ${msg}`);
  }
  result.durationMs = Date.now() - start;
  srcLog.info(`Finished in ${result.durationMs}ms status=${result.status}`);
  return result;
}
async function getActiveJob(sourceKey) {
  return database_default.syncJob.findFirst({
    where: {
      status: "running",
      startedAt: { gte: new Date(Date.now() - 10 * 6e4) },
      ...sourceKey !== "all" ? { sourceKey: { in: [sourceKey, "all"] } } : {}
    },
    select: { id: true, startedAt: true }
  });
}
function jobToRunResult(j) {
  const rawLogText = j.rawLogs ?? "";
  return {
    jobId: j.id,
    target: j.sourceKey,
    status: j.status,
    queueState: j.queueState ?? "done",
    triggerType: j.triggerType,
    triggeredBy: j.triggeredBy ?? "unknown",
    startedAt: j.startedAt.toISOString(),
    finishedAt: j.finishedAt?.toISOString() ?? "",
    durationMs: j.durationMs ?? 0,
    recordsProcessed: j.recordsProcessed,
    recordsAdded: j.recordsAdded,
    recordsUpdated: j.recordsUpdated,
    recordsSkipped: j.recordsSkipped,
    sources: j.summary ?? [],
    errorSummary: j.errorMessage ?? null,
    rawLogs: rawLogText ? rawLogText.split("\n").filter(Boolean) : [],
    crawlerDetails: j.crawlerDetails ?? null,
    stackTrace: j.stackTrace ?? null
  };
}
async function runDataSync(target = "all", triggerType = "manual", triggeredBy = "unknown") {
  const active = await getActiveJob(target);
  if (active) {
    const waitingSecs = Math.round((Date.now() - active.startedAt.getTime()) / 1e3);
    return {
      jobId: active.id,
      target,
      status: "running",
      queueState: "running",
      triggerType,
      triggeredBy,
      startedAt: active.startedAt.toISOString(),
      finishedAt: "",
      durationMs: 0,
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      sources: [],
      errorSummary: `A ${target} sync is already running (started ${waitingSecs}s ago). Please wait.`,
      rawLogs: [],
      crawlerDetails: null,
      stackTrace: null
    };
  }
  const startedAt = /* @__PURE__ */ new Date();
  const globalLogs = [];
  const log = makeLogger(globalLogs);
  const job = await database_default.syncJob.create({
    data: {
      sourceKey: target,
      status: "running",
      queueState: "queued",
      triggerType,
      triggeredBy,
      startedAt
    }
  });
  await database_default.syncJob.update({ where: { id: job.id }, data: { queueState: "running" } });
  log.info(`Job created \u2014 id=${job.id} target=${target} trigger=${triggerType} by=${triggeredBy}`);
  logger_default.info(`[dataSync] job=${job.id} target=${target} triggerType=${triggerType} triggeredBy=${triggeredBy}`);
  const sourceResults = [];
  let stackTrace = null;
  let crawlerDetails = null;
  try {
    if (target === "scholarships" || target === "all") {
      log.info(`Starting source: scholarships`);
      const r = await runScholarshipsSync(log);
      sourceResults.push(r);
      log.info(`Source scholarships done \u2014 status=${r.status} processed=${r.recordsProcessed} errors=${r.errors.length}`);
      logger_default.info(`[dataSync] scholarships status=${r.status} processed=${r.recordsProcessed}`);
    }
    if (target === "programs" || target === "all") {
      log.info(`Starting source: programs`);
      const r = await runProgramsSync(log);
      sourceResults.push(r);
      if (r.crawlerDetails) crawlerDetails = r.crawlerDetails;
      log.info(`Source programs done \u2014 status=${r.status} processed=${r.recordsProcessed} errors=${r.errors.length}`);
      logger_default.info(`[dataSync] programs status=${r.status} processed=${r.recordsProcessed}`);
    }
  } catch (unexpectedErr) {
    const errStr = String(unexpectedErr);
    stackTrace = unexpectedErr instanceof Error ? unexpectedErr.stack ?? errStr : errStr;
    log.error(`Unexpected error in job=${job.id}: ${errStr}`);
    logger_default.error(`[dataSync] unexpected error in job=${job.id}: ${unexpectedErr}`);
    sourceResults.push({
      sourceKey: target,
      label: target,
      status: "failed",
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      notes: [],
      errors: [`Unexpected error: ${errStr}`],
      durationMs: 0
    });
  }
  const finishedAt = /* @__PURE__ */ new Date();
  const durationMs = finishedAt.getTime() - startedAt.getTime();
  const totalProcessed = sourceResults.reduce((s, r) => s + r.recordsProcessed, 0);
  const totalAdded = sourceResults.reduce((s, r) => s + r.recordsAdded, 0);
  const totalUpdated = sourceResults.reduce((s, r) => s + r.recordsUpdated, 0);
  const totalSkipped = sourceResults.reduce((s, r) => s + r.recordsSkipped, 0);
  const allErrors = sourceResults.flatMap((r) => r.errors);
  const anySuccess = sourceResults.some((r) => r.status === "success" || r.status === "partial_success");
  const finalStatus = allErrors.length === 0 ? "success" : anySuccess ? "partial_success" : "failed";
  const errorSummary = allErrors.length > 0 ? allErrors.join(" | ") : null;
  log.info(`Job complete \u2014 status=${finalStatus} duration=${durationMs}ms records=${totalProcessed}`);
  if (errorSummary) log.error(`Error summary: ${errorSummary}`);
  const summaryForPersist = sourceResults.map((r) => {
    const { rawLogs: _, ...rest } = r;
    return rest;
  });
  const allRawLogs = [...globalLogs];
  for (const r of sourceResults) {
    if (r.rawLogs && r.rawLogs.length > 0) {
      allRawLogs.push(`--- Source: ${r.label} ---`);
      allRawLogs.push(...r.rawLogs);
    }
  }
  await database_default.syncJob.update({
    where: { id: job.id },
    data: {
      status: finalStatus,
      queueState: "done",
      finishedAt,
      durationMs,
      recordsProcessed: totalProcessed,
      recordsAdded: totalAdded,
      recordsUpdated: totalUpdated,
      recordsSkipped: totalSkipped,
      errorMessage: errorSummary,
      summary: summaryForPersist,
      rawLogs: allRawLogs.join("\n"),
      crawlerDetails: crawlerDetails !== null ? crawlerDetails : void 0,
      stackTrace
    }
  });
  logger_default.info(`[dataSync] job=${job.id} done status=${finalStatus} durationMs=${durationMs}`);
  return {
    jobId: job.id,
    target,
    status: finalStatus,
    queueState: "done",
    triggerType,
    triggeredBy,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs,
    recordsProcessed: totalProcessed,
    recordsAdded: totalAdded,
    recordsUpdated: totalUpdated,
    recordsSkipped: totalSkipped,
    sources: sourceResults.map((r) => ({ ...r, rawLogs: r.rawLogs ?? [] })),
    errorSummary,
    rawLogs: allRawLogs,
    crawlerDetails,
    stackTrace
  };
}
async function getSyncHistory(limit = 20) {
  const jobs = await database_default.syncJob.findMany({
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return jobs.map(jobToRunResult);
}
async function getJobDetails(id) {
  const job = await database_default.syncJob.findUnique({ where: { id } });
  if (!job) return null;
  return jobToRunResult(job);
}
async function cancelJob(id) {
  const job = await database_default.syncJob.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!job) return { ok: false, message: "Job not found" };
  if (job.status !== "running") return { ok: false, message: `Job is ${job.status}, cannot cancel` };
  await database_default.syncJob.update({
    where: { id },
    data: { status: "cancelled", queueState: "done", finishedAt: /* @__PURE__ */ new Date() }
  });
  logger_default.info(`[dataSync] job=${id} manually cancelled`);
  return { ok: true, message: "Job marked as cancelled" };
}
async function getSyncStatus() {
  try {
    const [scholarshipCount, programCount, totalRuns, recentJobs, activeJobRow] = await Promise.all([
      database_default.scholarship.count(),
      database_default.program.count(),
      database_default.syncJob.count(),
      database_default.syncJob.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      database_default.syncJob.findFirst({
        where: { status: "running", startedAt: { gte: new Date(Date.now() - 10 * 6e4) } },
        orderBy: { createdAt: "desc" }
      })
    ]);
    const now = /* @__PURE__ */ new Date();
    const candidate06 = new Date(now);
    candidate06.setUTCHours(6, 0, 0, 0);
    const candidate18 = new Date(now);
    candidate18.setUTCHours(18, 0, 0, 0);
    let nextRun;
    if (candidate06 > now) {
      nextRun = candidate06;
    } else if (candidate18 > now) {
      nextRun = candidate18;
    } else {
      nextRun = new Date(candidate06);
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }
    const sourceHealthList = await Promise.all(
      SOURCES.map(async (src) => {
        const lastJob = await database_default.syncJob.findFirst({
          where: { sourceKey: { in: [src.key, "all"] } },
          orderBy: { createdAt: "desc" }
        });
        const lastSuccess = await database_default.syncJob.findFirst({
          where: { sourceKey: { in: [src.key, "all"] }, status: { in: ["success", "partial_success"] } },
          orderBy: { finishedAt: "desc" }
        });
        const recordCount = src.key === "scholarships" ? scholarshipCount : programCount;
        const staleCutoff = new Date(Date.now() - src.staleHours * 36e5);
        const lastSuccessAt = lastSuccess?.finishedAt ?? null;
        const isStale = !lastSuccessAt || lastSuccessAt < staleCutoff;
        const staleSinceHours = lastSuccessAt ? Math.round((Date.now() - lastSuccessAt.getTime()) / 36e5) : null;
        return {
          sourceKey: src.key,
          label: src.label,
          description: src.description,
          lastRunAt: lastJob?.startedAt.toISOString() ?? null,
          lastSuccessAt: lastSuccessAt?.toISOString() ?? null,
          lastStatus: lastJob?.status ?? "idle",
          isStale,
          staleSinceHours,
          recordCount,
          lastRunId: lastJob?.id ?? null
        };
      })
    );
    const last20 = recentJobs.slice(0, 20);
    const succeeded = last20.filter((j) => j.status === "success" || j.status === "partial_success").length;
    const successRate = last20.length > 0 ? Math.round(succeeded / last20.length * 100) : 100;
    const recentRuns = recentJobs.map(jobToRunResult);
    return {
      sources: sourceHealthList,
      activeJob: activeJobRow ? {
        jobId: activeJobRow.id,
        sourceKey: activeJobRow.sourceKey,
        startedAt: activeJobRow.startedAt.toISOString(),
        queueState: activeJobRow.queueState ?? "running"
      } : null,
      recentRuns,
      totalRuns,
      successRate,
      nextScheduledRun: nextRun.toISOString(),
      summary: {
        totalSources: SOURCES.length,
        healthySources: sourceHealthList.filter((s) => !s.isStale && s.lastStatus !== "failed").length,
        staleSources: sourceHealthList.filter((s) => s.isStale).length,
        failedLastRun: sourceHealthList.filter((s) => s.lastStatus === "failed").length,
        running: activeJobRow ? 1 : 0,
        totalRecordsManaged: scholarshipCount + programCount
      },
      providers: {
        scholarshipLive: isLiveRefreshAvailable(),
        programsCrawler: !!process.env.AI_SERVER_URL
      }
    };
  } catch (err) {
    logger_default.error(`[dataSync] getSyncStatus failed: ${err}`);
    const now = /* @__PURE__ */ new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(6, 0, 0, 0);
    if (nextRun <= now) nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    return {
      sources: [],
      activeJob: null,
      recentRuns: [],
      totalRuns: 0,
      successRate: 0,
      nextScheduledRun: nextRun.toISOString(),
      summary: { totalSources: 0, healthySources: 0, staleSources: 0, failedLastRun: 0, running: 0, totalRecordsManaged: 0 },
      providers: {
        scholarshipLive: isLiveRefreshAvailable(),
        programsCrawler: !!process.env.AI_SERVER_URL
      }
    };
  }
}

// src/controllers/dataSync.controller.ts
async function dataSyncRunHandler(req, res) {
  const { target = "all" } = req.body;
  const validTargets = ["scholarships", "programs", "all"];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: "target must be scholarships | programs | all" });
    return;
  }
  logger_default.info(`[dataSync] trigger type=cron target=${target} by=cron`);
  try {
    const result = await runDataSync(target, "cron", "cron");
    if (result.status === "running" && !result.finishedAt) {
      res.status(409).json(result);
      return;
    }
    const httpStatus = result.status === "failed" ? 207 : 200;
    res.status(httpStatus).json(result);
  } catch (err) {
    logger_default.error(`[dataSync] unexpected error: ${err}`);
    res.status(500).json({ error: "Sync failed unexpectedly. Check server logs." });
  }
}
async function dataSyncStatusHandler(req, res) {
  try {
    const status = await getSyncStatus();
    res.status(200).json(status);
  } catch (err) {
    logger_default.error(`[dataSync] status check failed: ${err}`);
    res.status(500).json({ error: "Failed to retrieve sync status." });
  }
}
async function dataSyncHistoryHandler(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);
    const history = await getSyncHistory(limit);
    res.status(200).json({ runs: history, total: history.length });
  } catch (err) {
    logger_default.error(`[dataSync] history fetch failed: ${err}`);
    res.status(500).json({ error: "Failed to retrieve sync history." });
  }
}
async function dataSyncJobDetailsHandler(req, res) {
  try {
    const id = String(req.params.id ?? "");
    if (!id) {
      res.status(400).json({ error: "Job ID required" });
      return;
    }
    const job = await getJobDetails(id);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.status(200).json(job);
  } catch (err) {
    logger_default.error(`[dataSync] job details failed: ${err}`);
    res.status(500).json({ error: "Failed to retrieve job details." });
  }
}
async function dataSyncCancelHandler(req, res) {
  try {
    const id = String(req.params.id ?? "");
    if (!id) {
      res.status(400).json({ error: "Job ID required" });
      return;
    }
    const result = await cancelJob(id);
    res.status(result.ok ? 200 : 400).json(result);
  } catch (err) {
    logger_default.error(`[dataSync] cancel failed: ${err}`);
    res.status(500).json({ error: "Failed to cancel job." });
  }
}
async function dataSyncRetryHandler(req, res) {
  const { target = "all" } = req.body;
  const validTargets = ["scholarships", "programs", "all"];
  if (!validTargets.includes(target)) {
    res.status(400).json({ error: "target must be scholarships | programs | all" });
    return;
  }
  logger_default.info(`[dataSync] retry target=${target} by=cron`);
  try {
    const result = await runDataSync(target, "cron", "cron");
    if (result.status === "running" && !result.finishedAt) {
      res.status(409).json(result);
      return;
    }
    const httpStatus = result.status === "failed" ? 207 : 200;
    res.status(httpStatus).json(result);
  } catch (err) {
    logger_default.error(`[dataSync] retry unexpected error: ${err}`);
    res.status(500).json({ error: "Retry failed unexpectedly." });
  }
}

// src/routes/dataSync.router.ts
var router22 = Router22();
router22.get("/status", authMiddleware, dataSyncStatusHandler);
router22.get("/history", authMiddleware, dataSyncHistoryHandler);
router22.get("/job/:id", authMiddleware, dataSyncJobDetailsHandler);
router22.post("/run", authenticateCron, dataSyncRunHandler);
router22.post("/retry", authenticateCron, dataSyncRetryHandler);
router22.post("/cancel/:id", authMiddleware, dataSyncCancelHandler);
var dataSync_router_default = router22;

// src/routes/jobRoutes.ts
import { Router as Router23 } from "express";

// src/services/jobService.ts
init_database();

// src/lib/jobCache.ts
import NodeCache from "node-cache";
var jobCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
var suggestCache = new NodeCache({ stdTTL: 86400, checkperiod: 600 });

// src/services/jobService.ts
var AI_SERVER_URL4 = process.env.AI_SERVER_URL ?? "http://localhost:8001";
var AI_SERVER_API_KEY4 = process.env.AI_SERVER_API_KEY ?? "";
var ADZUNA_APP_ID = process.env.ADZUNA_APP_ID ?? "";
var ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY ?? "";
var RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? "";
function buildCacheKey2(p) {
  return [
    "jobs:v2",
    p.countryCode.toLowerCase(),
    p.city.trim().toLowerCase(),
    p.field.trim().toLowerCase(),
    p.jobType.toLowerCase(),
    (p.keyword ?? "").trim().toLowerCase(),
    String(p.page ?? 1)
  ].join(":");
}
async function callAIServer(payload) {
  const response = await fetch(`${AI_SERVER_URL4}/api/v1/jobs/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AI_SERVER_API_KEY4 ? { "X-API-Key": AI_SERVER_API_KEY4 } : {}
    },
    body: JSON.stringify({
      country: payload.country,
      country_code: payload.countryCode,
      city: payload.city,
      field: payload.field,
      job_type: payload.jobType,
      visa_type: payload.visaType,
      keyword: payload.keyword ?? null,
      date_posted: payload.datePosted ?? null,
      page: payload.page ?? 1
    }),
    signal: AbortSignal.timeout(35e3)
  });
  if (!response.ok) {
    throw new Error(`AI server error: ${response.status}`);
  }
  return response.json();
}
async function searchJobsFromAI(userId, payload) {
  const cacheKey = buildCacheKey2(payload);
  const cached = jobCache.get(cacheKey);
  if (cached) {
    logger_default.info(`[jobs] cache hit key=${cacheKey}`);
    database_default.jobSearch.findFirst({ where: { userId, countryCode: payload.countryCode, city: payload.city, field: payload.field, jobType: payload.jobType } }).then((existing2) => {
      if (existing2) {
        return database_default.jobSearch.update({ where: { id: existing2.id }, data: { cachedAt: /* @__PURE__ */ new Date() } });
      }
    }).catch(() => {
    });
    return { ...cached, fromCache: true };
  }
  logger_default.info(`[jobs] cache miss key=${cacheKey} \u2014 fetching from AI server`);
  const data = await callAIServer(payload);
  const jobType = payload.jobType;
  const now = /* @__PURE__ */ new Date();
  const existing = await database_default.jobSearch.findFirst({
    where: { userId, countryCode: payload.countryCode, city: payload.city, field: payload.field, jobType }
  });
  let searchId;
  if (existing) {
    await database_default.jobResult.deleteMany({ where: { jobSearchId: existing.id } });
    const updated = await database_default.jobSearch.update({
      where: { id: existing.id },
      data: {
        country: payload.country,
        visaType: payload.visaType ?? null,
        cachedAt: now,
        results: {
          create: data.listings.map((l) => ({
            title: l.title,
            company: l.company,
            companyLogo: l.company_logo ?? null,
            location: l.location,
            jobType: l.job_type ?? jobType,
            salary: l.salary ?? null,
            salaryMin: l.salary_min ?? null,
            salaryMax: l.salary_max ?? null,
            currency: l.currency ?? null,
            postedAt: l.posted_at ?? null,
            visaSponsorship: l.visa_sponsorship ?? null,
            applyUrl: l.apply_url,
            description: l.description ?? null,
            source: l.source,
            isRemote: l.is_remote ?? false
          }))
        }
      }
    });
    searchId = updated.id;
  } else {
    const created = await database_default.jobSearch.create({
      data: {
        userId,
        country: payload.country,
        countryCode: payload.countryCode,
        city: payload.city,
        jobType,
        field: payload.field,
        visaType: payload.visaType ?? null,
        cachedAt: now,
        results: {
          create: data.listings.map((l) => ({
            title: l.title,
            company: l.company,
            companyLogo: l.company_logo ?? null,
            location: l.location,
            jobType: l.job_type ?? jobType,
            salary: l.salary ?? null,
            salaryMin: l.salary_min ?? null,
            salaryMax: l.salary_max ?? null,
            currency: l.currency ?? null,
            postedAt: l.posted_at ?? null,
            visaSponsorship: l.visa_sponsorship ?? null,
            applyUrl: l.apply_url,
            description: l.description ?? null,
            source: l.source,
            isRemote: l.is_remote ?? false
          }))
        }
      }
    });
    searchId = created.id;
  }
  const result = { ...data, ai_fallback_used: data.ai_fallback_used ?? false, searchId, cachedAt: now.toISOString() };
  jobCache.set(cacheKey, result);
  return result;
}
async function getSuggestions(type, query, context) {
  if (type !== "jobtitle") return { suggestions: [] };
  const suggestCacheKey = `suggest:${type}:${query}:${context ?? ""}`;
  const cached = suggestCache.get(suggestCacheKey);
  if (cached) return { suggestions: cached };
  const response = await fetch(`${AI_SERVER_URL4}/api/v1/jobs/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...AI_SERVER_API_KEY4 ? { "X-API-Key": AI_SERVER_API_KEY4 } : {}
    },
    body: JSON.stringify({ type, query, context }),
    signal: AbortSignal.timeout(8e3)
  });
  if (!response.ok) return { suggestions: [] };
  const data = await response.json();
  suggestCache.set(suggestCacheKey, data.suggestions);
  return { suggestions: data.suggestions };
}
async function getJobSearchHistory(userId) {
  return database_default.jobSearch.findMany({
    where: { userId },
    include: { results: { take: 3 } },
    orderBy: { updatedAt: "desc" },
    take: 10
  });
}
async function getRefreshStatus(userId) {
  const lastSearch = await database_default.jobSearch.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { cachedAt: true, updatedAt: true, country: true, city: true, field: true, jobType: true }
  });
  if (!lastSearch) return { hasSearch: false, needsRefresh: false };
  const ageMinutes = (Date.now() - lastSearch.updatedAt.getTime()) / 6e4;
  return {
    hasSearch: true,
    cachedAt: lastSearch.cachedAt?.toISOString() ?? null,
    lastUpdated: lastSearch.updatedAt.toISOString(),
    needsRefresh: ageMinutes > 55,
    lastSearch: {
      country: lastSearch.country,
      city: lastSearch.city,
      field: lastSearch.field,
      jobType: lastSearch.jobType
    }
  };
}
async function searchMultiCountryFromAI(userId, body) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const groups = await Promise.all(
    body.countries.map(async ({ country, countryCode, city }) => {
      const payload = {
        country,
        countryCode,
        city,
        field: body.field,
        jobType: body.jobType,
        keyword: body.keyword,
        datePosted: body.datePosted,
        page: body.page ?? 1
      };
      try {
        const data = await searchJobsFromAI(userId, payload);
        return {
          countryCode,
          country,
          city,
          listings: data.listings,
          sourceUsed: data.source_used,
          total: data.total,
          workHourLimit: data.work_hour_limit,
          postGradPermitSteps: data.post_grad_permit_steps,
          cachedAt: data.cachedAt
        };
      } catch (err) {
        logger_default.warn(`[jobs] multi-country search failed for ${countryCode}: ${err}`);
        return {
          countryCode,
          country,
          city,
          listings: [],
          sourceUsed: "error",
          total: 0,
          error: `Search unavailable for ${country}`
        };
      }
    })
  );
  return { groups, cachedAt: now };
}
async function backgroundRefreshAll() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const recentSearches = await database_default.jobSearch.findMany({
    where: { updatedAt: { gte: cutoff } },
    distinct: ["countryCode", "city", "field", "jobType"],
    select: { country: true, countryCode: true, city: true, field: true, jobType: true, userId: true }
  });
  let refreshed = 0;
  const errors = [];
  for (const s of recentSearches) {
    try {
      const payload = {
        country: s.country,
        countryCode: s.countryCode,
        city: s.city,
        field: s.field,
        jobType: s.jobType,
        page: 1
      };
      const cacheKey = buildCacheKey2(payload);
      jobCache.del(cacheKey);
      await callAIServer(payload).then((data) => {
        jobCache.set(cacheKey, { ...data, cachedAt: (/* @__PURE__ */ new Date()).toISOString() });
      });
      refreshed++;
    } catch (err) {
      errors.push(`${s.city}/${s.field}: ${err}`);
    }
  }
  return { refreshed, total: recentSearches.length, errors };
}

// src/schemas/jobSchemas.ts
import { z as z3 } from "zod";
var jobSearchSchema = z3.object({
  body: z3.object({
    country: z3.string().min(2).max(100),
    countryCode: z3.string().length(2),
    city: z3.string().min(2).max(100),
    field: z3.string().min(2).max(100),
    jobType: z3.enum(["PART_TIME", "FULL_TIME", "INTERNSHIP", "REMOTE"]),
    visaType: z3.string().max(100).optional(),
    keyword: z3.string().max(120).optional(),
    datePosted: z3.enum(["today", "3days", "week", "month"]).optional(),
    page: z3.number().int().min(1).default(1)
  })
});
var multiCountryJobSearchSchema = z3.object({
  body: z3.object({
    countries: z3.array(z3.object({
      country: z3.string().min(2).max(100),
      countryCode: z3.string().length(2),
      city: z3.string().min(2).max(100)
    })).min(1).max(4),
    field: z3.string().min(2).max(100),
    jobType: z3.enum(["PART_TIME", "FULL_TIME", "INTERNSHIP", "REMOTE"]),
    keyword: z3.string().max(120).optional(),
    datePosted: z3.enum(["today", "3days", "week", "month"]).optional(),
    page: z3.number().int().min(1).default(1)
  })
});
var suggestQuerySchema = z3.object({
  query: z3.object({
    type: z3.enum(["jobtitle", "city", "field", "country"]),
    query: z3.string().min(1).max(60),
    context: z3.string().optional()
  })
});

// src/controllers/jobController.ts
async function searchJobs(req, res, next) {
  const userId = req.userId;
  const parsed = jobSearchSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }
  try {
    logger_default.info(`[jobs] search userId=${userId} country=${parsed.data.body.country} type=${parsed.data.body.jobType}`);
    const result = await searchJobsFromAI(userId, parsed.data.body);
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger_default.error(`[jobs] search failed userId=${userId}: ${err}`);
    next(err);
  }
}
async function getJobSuggestions(req, res, next) {
  const parsed = suggestQuerySchema.safeParse({ query: req.query });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
    return;
  }
  const { type, query, context } = parsed.data.query;
  try {
    const result = await getSuggestions(type, query, context);
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger_default.error(`[jobs] suggest failed: ${err}`);
    next(err);
  }
}
async function getJobHistory(req, res, next) {
  const userId = req.userId;
  try {
    const history = await getJobSearchHistory(userId);
    res.status(200).json({ ok: true, data: history });
  } catch (err) {
    logger_default.error(`[jobs] history failed userId=${userId}: ${err}`);
    next(err);
  }
}
async function getJobRefreshStatus(req, res, next) {
  const userId = req.userId;
  try {
    const status = await getRefreshStatus(userId);
    res.status(200).json({ ok: true, data: status });
  } catch (err) {
    next(err);
  }
}
async function searchMultiCountryJobs(req, res, next) {
  const userId = req.userId;
  const parsed = multiCountryJobSearchSchema.safeParse({ body: req.body });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
    return;
  }
  try {
    logger_default.info(`[jobs] multi-country search userId=${userId} countries=${parsed.data.body.countries.map((c) => c.countryCode).join(",")}`);
    const result = await searchMultiCountryFromAI(userId, parsed.data.body);
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger_default.error(`[jobs] multi-country search failed userId=${userId}: ${err}`);
    next(err);
  }
}
async function triggerBackgroundRefresh(req, res, next) {
  try {
    logger_default.info("[jobs] background refresh triggered");
    const result = await backgroundRefreshAll();
    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    logger_default.error(`[jobs] background refresh failed: ${err}`);
    next(err);
  }
}

// src/routes/jobRoutes.ts
var router23 = Router23();
router23.get("/suggest", getJobSuggestions);
router23.use(authMiddleware);
router23.post("/search", searchJobs);
router23.post("/multi-search", searchMultiCountryJobs);
router23.get("/history", getJobHistory);
router23.get("/refresh-status", getJobRefreshStatus);
router23.post("/background-refresh", triggerBackgroundRefresh);
var jobRoutes_default = router23;

// src/routes/newsRoutes.ts
import { Router as Router24 } from "express";
var router24 = Router24();
var AI_SERVER_URL5 = process.env.AI_SERVER_URL || "http://localhost:8001";
var AI_SERVER_API_KEY5 = process.env.AI_SERVER_API_KEY || "";
router24.get("/education", async (req, res) => {
  try {
    const category = req.query.category;
    const url = new URL(`${AI_SERVER_URL5}/api/v1/news/education`);
    if (category) url.searchParams.set("category", category);
    const aiRes = await fetch(url.toString(), {
      headers: { "X-API-Key": AI_SERVER_API_KEY5 },
      signal: AbortSignal.timeout(15e3)
    });
    if (!aiRes.ok) {
      return res.status(502).json({ error: "AI server unavailable", categories: {} });
    }
    const data = await aiRes.json();
    res.set("Cache-Control", "public, max-age=3600");
    res.json(data);
  } catch (err) {
    console.error("News fetch error:", err);
    res.status(500).json({ error: "Failed to fetch news", categories: {} });
  }
});
router24.post("/refresh", authenticateCron, async (req, res) => {
  try {
    const aiRes = await fetch(`${AI_SERVER_URL5}/api/v1/news/refresh`, {
      method: "POST",
      headers: { "X-API-Key": AI_SERVER_API_KEY5 },
      signal: AbortSignal.timeout(9e4)
    });
    if (!aiRes.ok) {
      console.warn("News refresh: AI server returned", aiRes.status);
      res.json({ success: false, message: "AI server unavailable", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      return;
    }
    const data = await aiRes.json();
    console.log("News cache refreshed:", data);
    res.json({ success: true, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    console.error("News refresh error:", err);
    res.json({ success: false, error: String(err), timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  }
});
var newsRoutes_default = router24;

// src/routes/currency.router.ts
import { Router as Router25 } from "express";

// src/services/currencyService.ts
var _cache = null;
var _cacheTime = 0;
var CACHE_TTL = 6 * 60 * 60 * 1e3;
async function getExchangeRates(base = "USD") {
  const now = Date.now();
  if (_cache && now - _cacheTime < CACHE_TTL && _cache.base === base) {
    return _cache;
  }
  const res = await fetch(
    `https://open.er-api.com/v6/latest/${base}`,
    { signal: AbortSignal.timeout(1e4) }
  );
  if (!res.ok) throw new Error(`Exchange rate fetch failed: ${res.status}`);
  const data = await res.json();
  _cache = {
    base,
    rates: data.rates,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  _cacheTime = now;
  return _cache;
}

// src/routes/currency.router.ts
var router25 = Router25();
router25.get("/rates", async (req, res) => {
  try {
    const base = req.query.base || "USD";
    const rates = await getExchangeRates(base);
    res.json(rates);
  } catch {
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
});
var currency_router_default = router25;

// src/routes/freshness.router.ts
import { Router as Router26 } from "express";
init_database();
var router26 = Router26();
var THRESHOLDS_HOURS = {
  jobs: 3,
  news: 3,
  currency: 12,
  scholarships: 48,
  programs: 48,
  visa: 48,
  professors: 48
};
var SOURCE_NEXT_HOURS = {
  jobs: 1,
  news: 1,
  currency: 6,
  scholarships: 24,
  programs: 24,
  visa: 24,
  professors: 24
};
router26.get("/", authMiddleware, async (_req, res) => {
  try {
    const records = await database_default.dataFreshness.findMany({
      orderBy: { source: "asc" }
    });
    const now = /* @__PURE__ */ new Date();
    const enriched = records.map((r) => {
      const lastSync = new Date(r.lastSyncAt);
      const diffMs = now.getTime() - lastSync.getTime();
      const diffMin = Math.floor(diffMs / 6e4);
      const diffHours = Math.floor(diffMs / 36e5);
      let relativeTime;
      if (diffMin < 1) relativeTime = "Just now";
      else if (diffMin < 60) relativeTime = `${diffMin}m ago`;
      else if (diffHours < 24) relativeTime = `${diffHours}h ago`;
      else relativeTime = `${Math.floor(diffHours / 24)}d ago`;
      const threshold = THRESHOLDS_HOURS[r.source] ?? 48;
      const staleness = diffHours > threshold ? "stale" : diffHours > threshold / 2 ? "warning" : "fresh";
      const nextSyncIn = r.nextSyncAt ? Math.max(0, Math.round((new Date(r.nextSyncAt).getTime() - now.getTime()) / 6e4)) : null;
      return { ...r, relativeTime, staleness, nextSyncIn };
    });
    res.json({ sources: enriched, fetchedAt: now.toISOString() });
  } catch {
    res.status(500).json({ error: "Failed to fetch freshness data" });
  }
});
router26.post("/update", authenticateCron, async (req, res) => {
  try {
    const { source, recordCount, status, details } = req.body;
    if (!source) {
      res.status(400).json({ error: "source is required" });
      return;
    }
    const hours = SOURCE_NEXT_HOURS[source] ?? 24;
    await database_default.dataFreshness.upsert({
      where: { source },
      update: {
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: status ?? "success",
        recordCount: recordCount ?? 0,
        details: details ? JSON.stringify(details) : null,
        nextSyncAt: new Date(Date.now() + hours * 36e5),
        errorMessage: null
      },
      create: {
        source,
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: status ?? "success",
        recordCount: recordCount ?? 0,
        nextSyncAt: new Date(Date.now() + hours * 36e5)
      }
    });
    res.json({ ok: true, source });
  } catch {
    res.status(500).json({ error: "Failed to update freshness" });
  }
});
var freshness_router_default = router26;

// src/routes/cron.router.ts
import { Router as Router27 } from "express";
var router27 = Router27();
router27.post("/jobs/refresh", authenticateCron, async (_req, res) => {
  try {
    console.log("[cron] Starting jobs data refresh");
    const result = await backgroundRefreshAll();
    console.log("[cron] Jobs refresh completed");
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("[cron] jobs refresh error:", err);
    res.status(500).json({ error: "Job refresh failed" });
  }
});
router27.post("/news/refresh", authenticateCron, async (req, res) => {
  try {
    const AI_SERVER_URL6 = process.env.AI_SERVER_URL || "http://localhost:8001";
    const AI_SERVER_API_KEY6 = process.env.AI_SERVER_API_KEY || "";
    const aiRes = await fetch(`${AI_SERVER_URL6}/api/v1/news/refresh`, {
      method: "POST",
      headers: { "X-API-Key": AI_SERVER_API_KEY6 },
      signal: AbortSignal.timeout(9e4)
    });
    if (!aiRes.ok) {
      console.warn("[cron] news refresh: AI server returned", aiRes.status);
      res.json({ success: false, message: "AI server unavailable", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      return;
    }
    const data = await aiRes.json();
    res.json({ success: true, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    console.error("[cron] news refresh error:", err);
    res.status(500).json({ error: "News refresh failed" });
  }
});
router27.post("/freshness/update", authenticateCron, async (req, res) => {
  try {
    const { source, recordCount, status, details } = req.body;
    if (!source) {
      res.status(400).json({ error: "source is required" });
      return;
    }
    const SOURCE_NEXT_HOURS2 = {
      jobs: 1,
      news: 1,
      currency: 6,
      scholarships: 24,
      programs: 24,
      visa: 24,
      professors: 24
    };
    const prisma2 = (await Promise.resolve().then(() => (init_database(), database_exports))).default;
    const hours = SOURCE_NEXT_HOURS2[source] ?? 24;
    await prisma2.dataFreshness.upsert({
      where: { source },
      update: {
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: status ?? "success",
        recordCount: recordCount ?? 0,
        details: details ? JSON.stringify(details) : null,
        nextSyncAt: new Date(Date.now() + hours * 36e5),
        errorMessage: null
      },
      create: {
        source,
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: status ?? "success",
        recordCount: recordCount ?? 0,
        nextSyncAt: new Date(Date.now() + hours * 36e5)
      }
    });
    res.json({ ok: true, source });
  } catch (err) {
    console.error("[cron] freshness update error:", err);
    res.status(500).json({ error: "Freshness update failed" });
  }
});
router27.post("/refresh-programs", authenticateCron, async (_req, res) => {
  try {
    console.log("[cron] Starting programs data refresh");
    const result = await runDataSync("programs", "cron", "cron");
    console.log("[cron] Programs refresh completed:", result.status);
    const prisma2 = (await Promise.resolve().then(() => (init_database(), database_exports))).default;
    await prisma2.dataFreshness.upsert({
      where: { source: "programs" },
      update: {
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: result.status === "success" || result.status === "partial_success" ? "success" : "error",
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 36e5),
        errorMessage: result.errorSummary ?? null
      },
      create: {
        source: "programs",
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: result.status === "success" || result.status === "partial_success" ? "success" : "error",
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 36e5)
      }
    });
    res.json({ success: true, target: "programs", status: result.status, finishedAt: result.finishedAt });
  } catch (err) {
    console.error("[cron] programs refresh error:", err);
    res.status(500).json({ error: "Programs refresh failed" });
  }
});
router27.post("/refresh-scholarships", authenticateCron, async (_req, res) => {
  try {
    console.log("[cron] Starting scholarships data refresh");
    const result = await runDataSync("scholarships", "cron", "cron");
    console.log("[cron] Scholarships refresh completed:", result.status);
    const prisma2 = (await Promise.resolve().then(() => (init_database(), database_exports))).default;
    await prisma2.dataFreshness.upsert({
      where: { source: "scholarships" },
      update: {
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: result.status === "success" || result.status === "partial_success" ? "success" : "error",
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 36e5),
        errorMessage: result.errorSummary ?? null
      },
      create: {
        source: "scholarships",
        lastSyncAt: /* @__PURE__ */ new Date(),
        status: result.status === "success" || result.status === "partial_success" ? "success" : "error",
        recordCount: result.recordsProcessed,
        nextSyncAt: new Date(Date.now() + 24 * 36e5)
      }
    });
    res.json({ success: true, target: "scholarships", status: result.status, finishedAt: result.finishedAt });
  } catch (err) {
    console.error("[cron] scholarships refresh error:", err);
    res.status(500).json({ error: "Scholarships refresh failed" });
  }
});
router27.post("/refresh-news", authenticateCron, async (_req, res) => {
  try {
    const AI_SERVER_URL6 = process.env.AI_SERVER_URL || "http://localhost:8001";
    const AI_SERVER_API_KEY6 = process.env.AI_SERVER_API_KEY || "";
    const aiRes = await fetch(`${AI_SERVER_URL6}/api/v1/news/refresh`, {
      method: "POST",
      headers: { "X-API-Key": AI_SERVER_API_KEY6 },
      signal: AbortSignal.timeout(9e4)
    });
    if (!aiRes.ok) {
      console.warn("[cron] refresh-news: AI server returned", aiRes.status);
      res.json({ success: false, message: "AI server unavailable", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      return;
    }
    const data = await aiRes.json();
    res.json({ success: true, data, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    console.error("[cron] refresh-news error:", err);
    res.status(500).json({ error: "News refresh failed" });
  }
});
router27.post("/refresh-visa", authenticateCron, async (_req, res) => {
  try {
    console.log("[cron] Visa data refresh called - no external source configured");
    res.json({ success: true, message: "Visa refresh not implemented - no external source", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  } catch (err) {
    console.error("[cron] visa refresh error:", err);
    res.status(500).json({ error: "Visa refresh failed" });
  }
});
var cron_router_default = router27;

// src/app.ts
var app = express();
app.set("trust proxy", 1);
app.use(helmet());
var allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000").split(",").map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set in production");
}
app.use(
  session({
    secret: sessionSecret || "dev-only-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 24 * 60 * 60 * 1e3,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);
app.use(passport3.initialize());
app.use(passport3.session());
app.use(
  morgan("combined", {
    stream: { write: (message) => logger_default.info(message.trim()) }
  })
);
app.get("/", (req, res) => {
  res.status(200).json({ message: "EducAI API", version: "1.0.0" });
});
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    service: "educai-api",
    version: "1.0.0",
    environment: process.env.NODE_ENV ?? "development",
    uptime: Math.floor(process.uptime()),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/health/db", async (req, res) => {
  try {
    const [users, countries, universities, programs, requirements, deadlines] = await Promise.all([
      database_default.user.count(),
      database_default.country.count().catch(() => -1),
      database_default.university.count().catch(() => -1),
      database_default.program.count().catch(() => -1),
      database_default.programRequirement.count().catch(() => -1),
      database_default.programDeadline.count().catch(() => -1)
    ]);
    res.status(200).json({
      status: "OK",
      database: "connected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      counts: { users, countries, universities, programs, requirements, deadlines }
    });
  } catch (err) {
    res.status(503).json({
      status: "ERROR",
      database: "unreachable",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
app.get("/health/schema", async (_req, res) => {
  const tables = {};
  try {
    await database_default.country.count();
    tables.countries = true;
  } catch {
    tables.countries = false;
  }
  try {
    await database_default.university.count();
    tables.universities = true;
  } catch {
    tables.universities = false;
  }
  try {
    await database_default.program.count();
    tables.programs = true;
  } catch {
    tables.programs = false;
  }
  const ok = Object.values(tables).every(Boolean);
  res.status(ok ? 200 : 503).json(
    ok ? { ok: true, tables } : { ok: false, error: "Migrations not applied \u2014 run: NODE_ENV=production npm run db:migrate:deploy", tables }
  );
});
app.get("/health/timeline", async (_req, res) => {
  try {
    const [visaTemplateCount, roadmapCount] = await Promise.all([
      database_default.visaTimelineTemplate.count(),
      database_default.userRoadmap.count()
    ]);
    res.status(200).json({
      ok: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: "connected",
      visaTemplates: visaTemplateCount,
      roadmaps: roadmapCount,
      ready: visaTemplateCount > 0
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      status: "ERROR",
      message: "Timeline health check failed",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
app.get("/health/whoami", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const user2 = await database_default.user.findUnique({ where: { id: userId } });
    const savedProgramsCount = await database_default.savedProgram.count({
      where: { userId }
    });
    res.status(200).json({
      ok: true,
      userId,
      email: user2?.email,
      dbHost: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? "unknown",
      savedProgramsCount,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: "Failed to fetch user info",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
});
app.get("/api", (req, res) => {
  res.status(200).json({ message: "EducAI API is running!" });
});
app.use("/auth", auth_router_default);
app.use("/users", user_router_default);
app.use("/universities", university_router_default);
app.use("/programs", program_router_default);
app.use("/match", match_router_default);
app.use("/saved-programs", savedProgram_router_default);
app.use("/internal", ingest_router_default);
app.use("/timeline", timeline_router_default);
app.use("/strategy", strategy_router_default);
app.use("/chat", chat_router_default);
app.use("/scholarships", scholarship_router_default);
app.use("/deadline-alerts", deadlineAlert_router_default);
app.use("/search", search_router_default);
app.use("/sop", sop_router_default);
app.use("/cv", cv_router_default);
app.use("/resume", resume_router_default);
app.use("/professors", professors_router_default);
app.use("/gap-fix", gapfix_router_default);
app.use("/api/gap-fix", gapFixRoutes_default);
app.use("/career", career_router_default);
app.use("/immigration", immigration_router_default);
app.use("/data-sync", dataSync_router_default);
app.use("/api/jobs", jobRoutes_default);
app.use("/api/news", newsRoutes_default);
app.use("/api/currency", currency_router_default);
app.use("/freshness", freshness_router_default);
app.use("/api/cron", cron_router_default);
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
var app_default = app;

// src/vercel.ts
var vercel_default = app_default;
export {
  vercel_default as default
};
