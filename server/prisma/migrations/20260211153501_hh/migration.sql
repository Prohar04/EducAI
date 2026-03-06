/*
  Warnings:

  - You are about to drop the column `user_id` on the `user_sessions` table. All the data in the column will be lost.
  - Added the required column `userId` to the `user_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_fkey";

-- DropIndex
DROP INDEX "user_sessions_user_id_idx";

-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "user_id",
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
