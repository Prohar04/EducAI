-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('PART_TIME', 'FULL_TIME', 'INTERNSHIP', 'REMOTE');

-- CreateTable
CREATE TABLE "job_searches" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "country_code" VARCHAR(2) NOT NULL DEFAULT '',
    "city" VARCHAR(100) NOT NULL,
    "job_type" "JobType" NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "visa_type" VARCHAR(100),
    "cached_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_results" (
    "id" TEXT NOT NULL,
    "job_search_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "company_logo" TEXT,
    "location" VARCHAR(255) NOT NULL,
    "job_type" "JobType" NOT NULL,
    "salary" VARCHAR(200),
    "salary_min" DOUBLE PRECISION,
    "salary_max" DOUBLE PRECISION,
    "currency" VARCHAR(10),
    "posted_at" VARCHAR(100),
    "visa_sponsorship" TEXT,
    "apply_url" TEXT NOT NULL,
    "description" TEXT,
    "source" VARCHAR(100) NOT NULL,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "job_searches_user_id_idx" ON "job_searches"("user_id");

-- CreateIndex
CREATE INDEX "job_searches_updated_at_idx" ON "job_searches"("updated_at");

-- CreateIndex
CREATE INDEX "job_results_job_search_id_idx" ON "job_results"("job_search_id");

-- AddForeignKey
ALTER TABLE "job_searches" ADD CONSTRAINT "job_searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_results" ADD CONSTRAINT "job_results_job_search_id_fkey" FOREIGN KEY ("job_search_id") REFERENCES "job_searches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
