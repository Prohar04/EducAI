-- CreateTable: scholarships
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "provider" VARCHAR(200),
    "country_code" VARCHAR(10),
    "level" "ProgramLevel",
    "field" VARCHAR(100),
    "url" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable: scholarship_deadlines
CREATE TABLE "scholarship_deadlines" (
    "id" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "term" VARCHAR(50),
    "deadline" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scholarship_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable: visa_timeline_templates
CREATE TABLE "visa_timeline_templates" (
    "id" TEXT NOT NULL,
    "country_code" VARCHAR(10) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "milestones" JSONB NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "visa_timeline_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: user_roadmaps
CREATE TABLE "user_roadmaps" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "country_code" VARCHAR(10) NOT NULL,
    "intake" VARCHAR(30),
    "start_month" VARCHAR(7) NOT NULL,
    "end_month" VARCHAR(7) NOT NULL,
    "plan" JSONB NOT NULL,
    "sources" JSONB,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "user_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable: strategy_reports
CREATE TABLE "strategy_reports" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "country_code" VARCHAR(10) NOT NULL,
    "intake" VARCHAR(30),
    "program_ids" JSONB,
    "cache_key" VARCHAR(600) NOT NULL,
    "report" JSONB NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "strategy_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scholarships_country_code_idx" ON "scholarships"("country_code");

-- CreateIndex
CREATE INDEX "scholarship_deadlines_scholarship_id_idx" ON "scholarship_deadlines"("scholarship_id");

-- CreateIndex
CREATE INDEX "scholarship_deadlines_deadline_idx" ON "scholarship_deadlines"("deadline");

-- CreateIndex
CREATE UNIQUE INDEX "visa_timeline_templates_country_code_key" ON "visa_timeline_templates"("country_code");

-- CreateIndex
CREATE INDEX "user_roadmaps_user_id_idx" ON "user_roadmaps"("user_id");

-- CreateIndex
CREATE INDEX "user_roadmaps_country_code_idx" ON "user_roadmaps"("country_code");

-- CreateIndex
CREATE INDEX "strategy_reports_user_id_idx" ON "strategy_reports"("user_id");

-- CreateIndex
CREATE INDEX "strategy_reports_country_code_idx" ON "strategy_reports"("country_code");

-- CreateIndex
CREATE INDEX "strategy_reports_cache_key_idx" ON "strategy_reports"("cache_key");

-- AddForeignKey
ALTER TABLE "scholarship_deadlines" ADD CONSTRAINT "scholarship_deadlines_scholarship_id_fkey"
    FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "strategy_reports" ADD CONSTRAINT "strategy_reports_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
