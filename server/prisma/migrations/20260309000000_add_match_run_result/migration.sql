-- CreateTable: MatchRun
CREATE TABLE IF NOT EXISTS "match_runs" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MatchResult
CREATE TABLE IF NOT EXISTS "match_results" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "program_id" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" JSONB NOT NULL,
    "raw_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: match_runs.user_id → users.id
ALTER TABLE "match_runs" ADD CONSTRAINT "match_runs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: match_results.run_id → match_runs.id
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_run_id_fkey"
    FOREIGN KEY ("run_id") REFERENCES "match_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: match_results.program_id → programs.id (optional)
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_program_id_fkey"
    FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
