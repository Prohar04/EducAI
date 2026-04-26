-- CreateTable: gap_fix_sessions
CREATE TABLE "gap_fix_sessions" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "result" JSONB NOT NULL,
    "gap_statuses" JSONB NOT NULL DEFAULT '{}',
    "improvements" JSONB NOT NULL DEFAULT '[]',
    "profile_snapshot" JSONB NOT NULL,
    "previous_session_id" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "gap_fix_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: gap_fix_evidences
CREATE TABLE "gap_fix_evidences" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "rec_id" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "label" VARCHAR(200) NOT NULL,
    "url" TEXT,
    "file_name" VARCHAR(255),
    "file_size" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gap_fix_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gap_fix_sessions_user_id_created_at_idx" ON "gap_fix_sessions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "gap_fix_evidences_session_id_idx" ON "gap_fix_evidences"("session_id");

-- CreateIndex
CREATE INDEX "gap_fix_evidences_user_id_idx" ON "gap_fix_evidences"("user_id");

-- AddForeignKey
ALTER TABLE "gap_fix_sessions" ADD CONSTRAINT "gap_fix_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gap_fix_evidences" ADD CONSTRAINT "gap_fix_evidences_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "gap_fix_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
