/*
  Warnings:

  - You are about to drop the column `tag_id` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `labels` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskLabel" AS ENUM ('bug', 'feature', 'task', 'refactor', 'chore', 'spike', 'techDebt');

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "tag_id",
ADD COLUMN     "labels" "TaskLabel" NOT NULL,
ADD COLUMN     "priority" "TaskUrgency" NOT NULL;
