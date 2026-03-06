-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('BSC', 'MSC', 'PHD');

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "country_id" TEXT NOT NULL,
    "city" VARCHAR(100),
    "website" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "university_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "level" "ProgramLevel" NOT NULL,
    "duration_months" INTEGER,
    "tuition_min_usd" INTEGER,
    "tuition_max_usd" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_requirements" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "key" VARCHAR(50) NOT NULL,
    "value" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_deadlines" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "term" VARCHAR(50) NOT NULL,
    "deadline" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "program_deadlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_programs" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "program_id" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_programs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE INDEX "universities_country_id_idx" ON "universities"("country_id");

-- CreateIndex
CREATE INDEX "universities_name_idx" ON "universities"("name");

-- CreateIndex
CREATE INDEX "programs_university_id_idx" ON "programs"("university_id");

-- CreateIndex
CREATE INDEX "programs_field_idx" ON "programs"("field");

-- CreateIndex
CREATE INDEX "programs_level_idx" ON "programs"("level");

-- CreateIndex
CREATE INDEX "programs_title_idx" ON "programs"("title");

-- CreateIndex
CREATE INDEX "program_requirements_program_id_idx" ON "program_requirements"("program_id");

-- CreateIndex
CREATE INDEX "program_deadlines_program_id_idx" ON "program_deadlines"("program_id");

-- CreateIndex
CREATE INDEX "saved_programs_user_id_idx" ON "saved_programs"("user_id");

-- CreateIndex
CREATE INDEX "saved_programs_program_id_idx" ON "saved_programs"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_programs_user_id_program_id_key" ON "saved_programs"("user_id", "program_id");

-- AddForeignKey
ALTER TABLE "universities" ADD CONSTRAINT "universities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_requirements" ADD CONSTRAINT "program_requirements_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_deadlines" ADD CONSTRAINT "program_deadlines_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_programs" ADD CONSTRAINT "saved_programs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_programs" ADD CONSTRAINT "saved_programs_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
