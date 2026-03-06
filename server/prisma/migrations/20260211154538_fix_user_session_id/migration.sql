/*
  Warnings:

  - You are about to drop the column `userId` on the `user_sessions` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `user_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_userId_fkey";

-- DropIndex
DROP INDEX "user_sessions_userId_idx";

-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "userId",
ADD COLUMN     "user_id" UUID NOT NULL,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
